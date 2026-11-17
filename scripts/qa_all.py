#!/usr/bin/env python3
"""Run the source release checks and behavior regressions from one command."""
import os
from pathlib import Path
import subprocess
import sys

root=Path(__file__).resolve().parent.parent
commands=[
 [sys.executable,'scripts/qa_static.py','--root','.'],
 [sys.executable,'qa/qa_source_release.py','--root','.'],
 [sys.executable,'qa/qa_module_links.py','--root','.'],
 [sys.executable,'qa/portable_package.py'],
 *[['node','qa/'+name+'.cjs'] for name in ['library_persistence','camera_revision','carousel_revision','primitive_engine','design_maps','studio_composition','studio_roll_motion','structural_design','camera_effects','video_motion','video_export','layer_motion','scene_bridge']],
]
# The historical comparison needs the original Git commit, not part of the offline ZIP.
if (root/'.git').exists() and subprocess.run(['git','cat-file','-e','463834d^{commit}'],cwd=root,capture_output=True).returncode==0:
 commands.extend([['node','qa/legacy_seed3.cjs'],['node','qa/legacy_seed4.cjs']])
for command in commands:
 result=subprocess.run(command,cwd=root,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'},check=False)
 if result.returncode:
  raise SystemExit(result.returncode)
print(f'PASS: {len(commands)} comprobaciones completadas.')
