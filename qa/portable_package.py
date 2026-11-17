#!/usr/bin/env python3
"""Parse nested portable modules and compile every executable inline script."""
from html.parser import HTMLParser
from pathlib import Path
import json
import subprocess
import tempfile

root=Path(__file__).resolve().parent.parent
scripts=[];frames=0
class Page(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.script=None
 def handle_starttag(self,tag,attributes):
  global frames
  attrs=dict(attributes)
  if tag=='link' and attrs.get('rel')=='stylesheet':raise AssertionError('External stylesheet in portable page')
  if tag=='script':
   assert 'src' not in attrs,'External script in portable page'
   self.script={'type':attrs.get('type',''),'text':''}
  if tag=='iframe':
   assert 'srcdoc' in attrs and 'src' not in attrs,'Module still depends on an external file'
   frames+=1;Page().feed(attrs['srcdoc'])
 def handle_data(self,data):
  if self.script is not None:self.script['text']+=data
 def handle_endtag(self,tag):
  if tag=='script' and self.script is not None:
   if self.script['type']=='application/json':json.loads(self.script['text'])
   else:scripts.append(self.script['text'])
   self.script=None
for name in ['STUDIOART_PORTATIL.html','AUDITORIA_AUTOMATICA.html']:
 text=(root/name).read_text();Page().feed(text)
 assert '--studio-css-loaded:1' in text
 assert 'V1.3.2' in text
 assert 'data:font/ttf;base64,' in text
assert frames>=5
with tempfile.TemporaryDirectory(prefix='studio-portable-') as temp:
 for index,code in enumerate(scripts):
  file=Path(temp)/f'{index}.js';file.write_text(code)
  subprocess.run(['node','--check',str(file)],check=True,capture_output=True)
print(f'PASS: portátiles sin scripts/estilos/módulos externos; {frames} marcos, {len(scripts)} scripts compilados, JSON y fuentes integrados.')
