#!/usr/bin/env python3
"""Validación estática del paquete offline Líder Supremo. No modifica archivos."""
from __future__ import annotations
import argparse, hashlib, json, shutil, subprocess, sys
from pathlib import Path

def fail(msg: str) -> None:
    print(f"FAIL: {msg}")
    raise SystemExit(1)

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', default='.', help='raíz que contiene VERSION_SUPREMO.json y data/')
    args = ap.parse_args()
    root = Path(args.root).resolve()
    version_path = root / 'VERSION_SUPREMO.json'
    manifest_path = root / 'data' / 'manifest_integridad.json'
    if not version_path.is_file() or not manifest_path.is_file():
        fail('falta VERSION_SUPREMO.json o data/manifest_integridad.json')
    try:
        version = json.loads(version_path.read_text(encoding='utf-8-sig'))
        manifest = json.loads(manifest_path.read_text(encoding='utf-8-sig'))
        for rel in ('data/campana_2026.json','data/efectos.json'):
            json.loads((root/rel).read_text(encoding='utf-8-sig'))
    except Exception as exc:
        fail(f'JSON inválido: {exc}')
    if not isinstance(version.get('version'), str) or not version['version'].strip():
        fail('version.version debe ser texto no vacío')
    if manifest.get('version') != version['version']:
        fail(f"versión no coincide: VERSION_SUPREMO={version['version']} manifiesto={manifest.get('version')}")
    files = manifest.get('files')
    if not isinstance(files, list) or not files:
        fail('manifest.files debe ser una lista con registros')
    seen=set()
    js_files=[]
    for entry in files:
        rel=entry.get('file','')
        if not rel or rel in seen:
            fail(f'ruta vacía o duplicada en manifiesto: {rel!r}')
        seen.add(rel)
        p=(root/rel).resolve()
        if root not in p.parents and p != root:
            fail(f'ruta fuera del proyecto en manifiesto: {rel}')
        if not p.is_file():
            fail(f'falta archivo del manifiesto: {rel}')
        if p.suffix in {".js", ".cjs", ".mjs"}:
            js_files.append(p)
        data=p.read_bytes()
        digest=hashlib.sha256(data).hexdigest()
        if entry.get('bytes') != len(data):
            fail(f'tamaño distinto: {rel}')
        if entry.get('sha256') != digest:
            fail(f'SHA-256 distinto: {rel}')
    print(f"PASS: version {version['version']}; {len(files)} rutas del manifiesto íntegras; JSON de campaña y efectos válidos")
    node = shutil.which("node")
    if node:
        for path in js_files:
            if subprocess.run([node, "--check", str(path)], check=False).returncode:
                fail(f"sintaxis JavaScript inválida: {path.relative_to(root)}")
        print(f"PASS: sintaxis de {len(js_files)} archivos JavaScript")
    else:
        print("OMITIDO: sintaxis JavaScript (Node no está instalado)")
    return 0
if __name__ == '__main__':
    sys.exit(main())
