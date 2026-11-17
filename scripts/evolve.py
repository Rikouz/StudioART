"""Prepare one isolated candidate per invocation."""
import argparse
from contextlib import contextmanager
from datetime import datetime
from fnmatch import fnmatchcase
import json
import os
from pathlib import Path
import re
import shutil
import signal
import subprocess
import sys
import time

PACKAGE = Path(__file__).resolve().parents[1]
VERSION = "VERSION_SUPREMO.json"
MANIFEST = "data/manifest_integridad.json"
CHANGELOG = "CHANGELOG_EVOLUCION.md"
MEDIA = {".png", ".jpeg", ".jpg", ".webp", ".avif", ".svg", ".gif", ".bmp",
         ".mp4", ".webm", ".mov", ".wav", ".mp3", ".pdf", ".ttf", ".woff", ".woff2"}

def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))

def git(root, *args):
    result = subprocess.run(["git", "-C", str(root), *args], capture_output=True,
                            encoding="utf-8", errors="replace", check=False, timeout=60,
                            env={**os.environ, "GIT_OPTIONAL_LOCKS": "0"})
    if result.returncode:
        raise RuntimeError(f"Git ({args[0]}) {result.stderr.strip()}")
    return result.stdout

@contextmanager
def lock(path):
    with path.open("a+b") as handle:
        handle.seek(0)
        if os.name == "nt":
            import msvcrt
            msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
        else:
            import fcntl
            fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
        yield

def run_logged(cmd, cwd, path, deadline, stdin=None):
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise TimeoutError("Límite del ciclo alcanzado")
    cmd = list(map(str, cmd))
    # Windows npm shims need cmd.exe. All arguments here are fixed for Codex.
    if os.name == "nt" and Path(cmd[0]).suffix.lower() in {".cmd", ".bat"}:
        comspec = subprocess.list2cmdline([os.environ["COMSPEC"]])
        command = subprocess.list2cmdline(cmd)
        cmd = f'{comspec} /d /s /c "{command}"'
    with path.open("ab") as log:
        with subprocess.Popen(cmd, cwd=cwd, stdin=subprocess.PIPE, stdout=log,
                              stderr=subprocess.STDOUT, start_new_session=os.name != "nt") as proc:
            try:
                proc.communicate(input=stdin, timeout=remaining)
            except subprocess.TimeoutExpired:
                if os.name == "nt":
                    subprocess.run(["taskkill", "/PID", str(proc.pid), "/T", "/F"],
                                   stdout=log, stderr=log, check=False, timeout=8)
                    proc.kill()
                else:
                    try:
                        os.killpg(proc.pid, signal.SIGKILL)
                    except ProcessLookupError:
                        pass
                proc.communicate()
                raise TimeoutError("Límite del ciclo alcanzado")
        return proc.returncode

def plan(root, cfg):
    if Path(git(root, "rev-parse", "--show-toplevel").strip()).resolve() != root:
        raise RuntimeError("Indica la raíz exacta del repositorio")
    if git(root, "branch", "--show-current").strip() != cfg["stableBranch"]:
        raise RuntimeError(f"Abre la rama estable {cfg['stableBranch']}")
    if git(root, "status", "--porcelain"):
        raise RuntimeError("La rama estable tiene cambios locales")
    prefix = cfg["candidateBranchPrefix"]
    pending = git(root, "for-each-ref", "--format=%(refname:short)", "refs/heads/" + prefix)
    if pending.strip():
        raise RuntimeError(f"Candidata pendiente {pending.strip()}")
    version = read_json(root / VERSION)["version"]
    if not isinstance(version, str) or not re.fullmatch(r"\d+\.\d+\.\d+", version):
        raise RuntimeError(f"Versión estable inválida {version}")
    items = sorted((row for row in cfg["backlog"] if row["status"] == "ready"),
                   key=lambda row: (row["priority"], row["id"]))
    return git(root, "rev-parse", "HEAD").strip(), version, items[0] if items else None

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", required=True, type=Path)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    root = args.root.resolve(strict=True)
    cfg = read_json(PACKAGE / "evolution.config.json")
    state = root.with_name(".supremo-evolution-" + root.name)
    if args.dry_run:
        base, version, item = plan(root, cfg)
        print(json.dumps({"modo": "simulación", "base": base, "version": version,
                          "ficha": item, "checks": cfg["checks"]}, ensure_ascii=False, indent=2))
        return 0

    reports = state / "reports"
    reports.mkdir(parents=True, exist_ok=True)
    if os.name == "nt":
        import ctypes
        attributes = ctypes.windll.kernel32.GetFileAttributesW(str(state))
        if attributes != 0xFFFFFFFF:
            ctypes.windll.kernel32.SetFileAttributesW(str(state), attributes | 2)
    now = datetime.now()
    stamp = now.strftime("%Y-%m-%d-%H%M")
    tag = now.strftime("%Y-%m-%d-%H%M%S-%f")
    info = {"hora": now.astimezone().isoformat(), "resultado": "detenido"}
    report = reports / f"SUPREMO_EVOLUCION_{tag}.json"
    try:
        with lock(state / "cycle.lock"):
            deadline = time.monotonic() + min(35, cfg["maxCycleMinutes"]) * 60 - 10
            base, version, item = plan(root, cfg)
            info.update(base=base, version_base=version, ficha=item)
            if item is None:
                info["resultado"] = "sin ficha ready"
                return 0
            codex = shutil.which("codex")
            if not codex:
                raise RuntimeError("Codex CLI no está en PATH")
            version_path = reports / f"{tag}-version.log"
            if run_logged([codex, "--version"], root, version_path, deadline):
                raise RuntimeError("No se pudo identificar la versión de Codex CLI")
            info["codex_cli"] = version_path.read_text(encoding="utf-8", errors="replace").strip()
            branch = cfg["candidateBranchPrefix"] + stamp
            worktrees = state / "worktrees"
            worktrees.mkdir(exist_ok=True)
            wt = worktrees / stamp
            git(root, "worktree", "add", "-b", branch, str(wt), base)
            info.update(rama=branch, worktree=str(wt), resultado="candidata bloqueada")
            codex_log = reports / f"{tag}-codex.log"
            info["log_codex"] = str(codex_log)
            prompt = (
                "Implementa una sola ficha del backlog de Supremo Líder en este worktree. "
                "Lee AGENTS.md si existe y los documentos docs/SPEC_AUTOMATIZACION.md y "
                "docs/PLAN_IMPLEMENTACION.md. Conserva la app offline y las integraciones existentes. "
                "Protege fotos originales, geometría, SKU, marca, QR y claims. "
                "No instales dependencias ni accedas a Chrome, Higgsfield, credenciales o publicación. "
                "No hagas commit, checkout, merge, push ni empaquetes la instalación. "
                "Para cambios runtime incrementa PATCH exactamente una unidad, añade una entrada a "
                f"{CHANGELOG} y ejecuta python scripts/refresh_manifest.py --root . --write "
                "con --include para cada archivo runtime nuevo. Si estás bloqueado, explica la causa. "
                "Termina con el resultado, evidencia y QA visual pendiente.\n"
                + json.dumps({"ficha": item, "rutas_protegidas": cfg["protectedPaths"]}, ensure_ascii=False)
            )
            (reports / f"{tag}-prompt.txt").write_text(prompt, encoding="utf-8")
            code = run_logged([codex, "-c", "sandbox_workspace_write.network_access=false", "--ask-for-approval", "never", "exec",
                               "--sandbox", "workspace-write", "-"], wt, codex_log, deadline,
                              stdin=prompt.encode("utf-8"))
            info["codex_exit"] = code
            status = git(wt, "status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames")
            branch_changed = git(wt, "rev-parse", "HEAD").strip() != base
            if not status and not branch_changed and code == 0:
                git(root, "worktree", "remove", str(wt))
                git(root, "branch", "-D", branch)
                info["resultado"] = "sin cambios"
                return 0
            changed = [entry[3:] for entry in status.split("\0") if entry]
            info["archivos"] = changed
            stat = git(wt, "diff", "--stat", base).strip()
            additions = [f"{entry[3:]} | nuevo sin commit" for entry in status.split("\0")
                         if entry.startswith("?? ")]
            info["diffstat"] = "\n".join(part for part in [stat, *additions] if part)
            failures = []
            if code or branch_changed:
                failures.append("Codex falló o modificó el historial")
            if git(wt, "branch", "--show-current").strip() != branch:
                failures.append("La rama del worktree cambió")
            if git(root, "rev-parse", "HEAD").strip() != base or git(root, "status", "--porcelain"):
                failures.append("El árbol estable cambió durante el ciclo")
            old_manifest = {row["file"] for row in read_json(root / MANIFEST)["files"]}
            runtime = set()
            for path in changed:
                protected = (Path(path).suffix.lower() in MEDIA or
                             any(fnmatchcase(path, pattern) for pattern in cfg["protectedPaths"]))
                if protected:
                    failures.append(f"Ruta protegida {path}")
                if (path in old_manifest or path == MANIFEST or
                    path.startswith(("css/", "js/", "modulos/", "data/")) or
                    path == VERSION or path.endswith(".html")):
                    runtime.add(path)
            try:
                info["version_candidata"] = read_json(wt / VERSION)["version"]
                if runtime:
                    major, minor, patch = map(int, version.split("."))
                    expected = f"{major}.{minor}.{patch + 1}"
                    if info["version_candidata"] != expected or CHANGELOG not in changed:
                        failures.append(f"Se requiere versión {expected} y entrada de changelog")
                    new_manifest = {row["file"] for row in read_json(wt / MANIFEST)["files"]}
                    missing = (old_manifest | runtime) - new_manifest - {MANIFEST}
                    if missing:
                        failures.append(f"Faltan rutas en el manifiesto {sorted(missing)}")
                elif info["version_candidata"] != version:
                    failures.append("La versión cambió sin un cambio runtime")
            except (ValueError, OSError, KeyError, TypeError) as exc:
                failures.append(f"Error de versión o manifiesto {exc}")
            info["checks"] = []
            for index, check in enumerate(cfg["checks"], 1):
                program = sys.executable if check["program"] == "python" else check["program"]
                check_args = [program, *check["args"]]
                path = reports / f"{tag}-qa-{index}.log"
                record = {"comando": check_args, "log": str(path)}
                info["checks"].append(record)
                try:
                    result = run_logged(check_args, wt, path, deadline)
                    record["exit"] = result
                    if result:
                        failures.append(f"Falló QA {index}")
                except (OSError, TimeoutError) as exc:
                    record["error"] = str(exc)
                    failures.append(f"QA {index} {exc}")
            if failures:
                info["errores"] = failures
                return 1
            info["resultado"] = "candidata lista para revisión humana"
            return 0
    except (OSError, ValueError, KeyError, RuntimeError, subprocess.SubprocessError) as exc:
        info["motivo"] = str(exc)
        return 1
    finally:
        report.write_text(json.dumps(info, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{info['resultado']} | {info.get('motivo', '')} | {report}")

if __name__ == "__main__":
    sys.exit(main())
