#!/usr/bin/env python3
"""Check source releases and future tracked files for accidentally included media."""
from __future__ import annotations
import argparse
import re
import subprocess
from pathlib import Path

MEDIA={'.png','.jpg','.jpeg','.webp','.gif','.svg','.bmp','.ico','.mp4','.webm','.mov','.m4a','.mp3','.wav','.zip','.bundle'}
EMBEDDED=re.compile(rb'data:(?:image|video|audio)/[a-zA-Z0-9.+-]+(?:;[a-zA-Z0-9=.+-]+)*;base64,[A-Za-z0-9+/=]{80,}')
TEXT={'.html','.js','.cjs','.mjs','.css','.json','.md','.txt','.py','.ps1'}

def main() -> int:
    parser=argparse.ArgumentParser()
    parser.add_argument('--root',default='.')
    parser.add_argument('--tracked',action='store_true')
    args=parser.parse_args()
    root=Path(args.root).resolve()
    if args.tracked:
        names=subprocess.check_output(['git','ls-files','-z'],cwd=root).decode().split('\0')
        paths=[root/name for name in names if name]
    else:
        paths=[p for p in root.rglob('*') if '.git' not in p.relative_to(root).parts]
    errors=[]
    for path in paths:
        if not path.is_file():
            continue
        relative=path.relative_to(root).as_posix()
        if path.suffix.lower() in MEDIA or path.name.startswith('.env'):
            errors.append(f'File excluded from code release: {relative}')
        if path.suffix.lower() in TEXT:
            content=path.read_bytes()
            if EMBEDDED.search(content):
                errors.append(f'Embedded media: {relative}')
    if errors:
        print('\n'.join(errors))
        return 1
    print('PASS: source release contains no raster/video/audio files, embedded base64 media, archives or environment files.')
    return 0

if __name__=='__main__':
    raise SystemExit(main())
