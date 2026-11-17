#!/usr/bin/env python3
"""Actualiza SHA-256/tamaño del conjunto ya registrado en manifest_integridad.json.
No agrega archivos automáticamente; los nuevos recursos deben indicarse con --include.
"""
from __future__ import annotations
import argparse, hashlib, json, os, tempfile
from pathlib import Path

def main() -> int:
    ap=argparse.ArgumentParser()
    ap.add_argument('--root',default='.',help='raíz de la aplicación')
    ap.add_argument('--include',action='append',default=[],help='ruta relativa de un nuevo archivo distribuible; se puede repetir')
    ap.add_argument('--write',action='store_true',help='escribe el manifiesto; sin esta opción sólo muestra el resultado')
    ns=ap.parse_args(); root=Path(ns.root).resolve()
    vp=root/'VERSION_SUPREMO.json'; mp=root/'data'/'manifest_integridad.json'
    ver=json.loads(vp.read_text(encoding='utf-8-sig'))['version']
    manifest=json.loads(mp.read_text(encoding='utf-8-sig'))
    entries={e['file']:e for e in manifest.get('files',[])}
    for rel in ns.include:
        entries.setdefault(rel,{'file':rel})
    out=[]
    for rel in entries:
        p=(root/rel).resolve()
        if root not in p.parents or not p.is_file():
            raise SystemExit(f'Ruta ausente o fuera del proyecto: {rel}')
        data=p.read_bytes()
        out.append({'file':rel,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
    updated={'name':manifest.get('name','SUPREMO_LIDER_OFFLINE'),'version':ver,'files':out}
    rendered=json.dumps(updated,ensure_ascii=False,indent=2)+'\n'
    if ns.write:
        fd,tmp=tempfile.mkstemp(prefix='manifest-',suffix='.json',dir=mp.parent)
        try:
            with os.fdopen(fd,'w',encoding='utf-8',newline='\n') as f: f.write(rendered)
            os.replace(tmp,mp)
        finally:
            if os.path.exists(tmp): os.unlink(tmp)
        print(f'Actualizado: {mp} | versión {ver} | {len(out)} archivos')
    else:
        print(rendered,end='')
    return 0
if __name__=='__main__': raise SystemExit(main())
