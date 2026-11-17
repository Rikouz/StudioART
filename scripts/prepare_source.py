"""Extract a verified distribution into a new local Git source repository."""
import argparse
from pathlib import Path, PurePosixPath
import shutil
import subprocess
import sys
import tempfile
from zipfile import ZipFile

from evolve import PACKAGE, read_json

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--zip", required=True, type=Path)
    parser.add_argument("--destination", required=True, type=Path)
    args = parser.parse_args()
    destination = args.destination.resolve()
    if destination.exists():
        parser.error("El destino debe ser una carpeta nueva")
    if not destination.parent.is_dir():
        parser.error("La carpeta superior del destino debe existir")
    with tempfile.TemporaryDirectory(prefix="supremo-prepare-", dir=destination.parent) as temp:
        folder = Path(temp)
        with ZipFile(args.zip) as archive:
            for row in archive.infolist():
                path = PurePosixPath(row.filename)
                if (path.is_absolute() or any(p.casefold() in {"..", ".git"} for p in path.parts)
                    or "\\" in row.filename or ":" in row.filename
                    or (row.external_attr >> 16) & 0o170000 == 0o120000):
                    parser.error(f"Entrada ZIP no válida {row.filename}")
            archive.extractall(folder)
        source = folder
        if not (source / "VERSION_SUPREMO.json").is_file():
            folders = [item for item in folder.iterdir() if item.is_dir()]
            if len(folders) != 1:
                parser.error("No se encontró una única raíz de Supremo Líder")
            source = folders[0]
        if not (source / "ABRIR_SIN_SERVIDOR.html").is_file():
            parser.error("Falta ABRIR_SIN_SERVIDOR.html")
        subprocess.run([sys.executable, str(PACKAGE / "scripts/qa_static.py"), "--root",
                        str(source)], check=True)
        shutil.copytree(PACKAGE / "scripts", source / "scripts",
                        ignore=shutil.ignore_patterns("__pycache__"), dirs_exist_ok=True)
        shutil.copytree(PACKAGE / "docs", source / "docs", dirs_exist_ok=True)
        shutil.copy2(PACKAGE / "evolution.config.json", source)
        (source / ".gitattributes").write_text("* -text\n", encoding="utf-8")
        version = read_json(source / "VERSION_SUPREMO.json")["version"]
        (source / "CHANGELOG_EVOLUCION.md").write_text(
            f"# Cambios de evolución\n\n- Base importada {version}\n", encoding="utf-8")
        subprocess.run(["git", "init", "--initial-branch=main"], cwd=source, check=True)
        subprocess.run(["git", "add", "--all"], cwd=source, check=True)
        subprocess.run(["git", "-c", "user.name=Supremo Lider", "-c",
                        "user.email=supremo@local.invalid", "-c", "core.hooksPath=.git/no-hooks",
                        "commit", "--no-gpg-sign", "-qm", f"Base offline {version}"],
                       cwd=source, check=True)
        source.rename(destination)
    print(destination)
    return 0

if __name__ == "__main__":
    sys.exit(main())
