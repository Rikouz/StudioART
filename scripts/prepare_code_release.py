#!/usr/bin/env python3
"""Export the application sources without private media or embedded raster images."""
from __future__ import annotations
import argparse
import json
import re
import shutil
from pathlib import Path

TEXT_EXTENSIONS={'.html','.js','.cjs','.mjs','.css','.json','.md','.txt','.py','.ps1'}
EMBEDDED=re.compile(r'data:(?:image|video|audio)/[a-zA-Z0-9.+-]+(?:;[a-zA-Z0-9=.+-]+)*;base64,[a-zA-Z0-9+/=\r\n]+')
MEDIA={'.png','.jpg','.jpeg','.webp','.gif','.svg','.mp4','.webm','.mov','.m4a','.mp3','.wav','.zip','.bundle'}

def main() -> int:
    parser=argparse.ArgumentParser()
    parser.add_argument('--source',default='.')
    parser.add_argument('--destination',required=True)
    args=parser.parse_args()
    source=Path(args.source).resolve()
    target=Path(args.destination).resolve()
    if target==source or source in target.parents or target in source.parents:
        raise SystemExit('Source and destination must be separate trees.')
    target.mkdir(parents=True,exist_ok=True)
    copied=[]
    for path in source.rglob('*'):
        relative=path.relative_to(source)
        if not path.is_file() or '.git' in relative.parts or '__pycache__' in relative.parts:
            continue
        if 'assets' in relative.parts or path.suffix.lower() in MEDIA:
            continue
        if path.suffix.lower() not in TEXT_EXTENSIONS|{'.ttf','.otf','.woff','.woff2'} and path.name!='.gitattributes':
            continue
        if path.name in {'LICENSE','README.md'}:
            continue
        destination=target/relative
        destination.parent.mkdir(parents=True,exist_ok=True)
        if relative.as_posix()=='js/inline_media.js':
            destination.write_text("'use strict';\nwindow.SL_INLINE_MEDIA={};\n",encoding='utf-8')
        elif path.suffix.lower() in TEXT_EXTENSIONS:
            contents=path.read_text(encoding='utf-8-sig')
            contents=EMBEDDED.sub('',contents)
            if path.name=='MSCCS_EDITOR_AUTONOMO_V3.html':
                contents=re.sub(r'(<script type="application/json" id="slide-data">).*?(</script>)',r'\1[]\2',contents,flags=re.S)
            if relative.as_posix() in {'index.html','ABRIR_SIN_SERVIDOR.html'}:
                contents=contents.replace('<img src="modulos/creative_v10/assets/identidad/logo_msccs_transparente.png" alt="MSCCS">','<span aria-label="StudioART">SA</span>')
            if relative.as_posix()=='js/app.js':
                contents=contents.replace("const skus=[...new Set(concepts().map(x=>x.sku))];","const skus=[...new Set(concepts().map(x=>x.sku))].filter(sku=>Boolean(window.SL_INLINE_MEDIA?.[sku]));")
            if relative.as_posix()=='js/app.js':
                contents=contents.replace("||'modulos/creative_v10/assets/miniaturas/'+d.sku+'.webp'","||''")
            if relative.as_posix() in {'css/workspace.css','modulos/creative_v10/css/studio.css'}:
                contents+='\nimg[src=""]{display:none}\n'
            destination.write_text(contents,encoding='utf-8')
        else:
            shutil.copyfile(path,destination)
        copied.append(relative.as_posix())
    # The source manifest only tracks files distributed in this tree.
    manifest=target/'data/manifest_integridad.json'
    value=json.loads(manifest.read_text(encoding='utf-8'))
    value['files']=[entry for entry in value['files'] if (target/entry['file']).is_file()]
    manifest.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'Exported {len(copied)} source files.')
    return 0

if __name__=='__main__':
    raise SystemExit(main())
