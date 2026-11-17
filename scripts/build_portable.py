#!/usr/bin/env python3
"""Build one offline entry with embedded code/styles and srcdoc modules, without private media."""
import argparse
import base64
import html
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent

def css(contents,folder):
 def resource(match):
  raw=match.group(1).strip(' \"\'')
  if raw.startswith(('data:','http:','https:','#')):return match.group(0)
  file=(folder/raw).resolve()
  if not file.is_file():return match.group(0)
  if file.suffix.lower() not in {'.ttf','.woff','.woff2','.otf'}:raise ValueError('Portable CSS only embeds licensed fonts: '+str(file))
  return "url('data:font/ttf;base64,"+base64.b64encode(file.read_bytes()).decode()+"')"
 return re.sub(r'url\(([^)]+)\)',resource,contents)

def bundle(file,query=''):
 text=file.read_text(encoding='utf-8');folder=file.parent;deferred=[]
 def stylesheet(match):
  path=(folder/match.group(1)).resolve()
  if not path.is_file():raise ValueError('Missing stylesheet: '+str(path))
  return '<style>'+css(path.read_text(),path.parent)+'</style>'
 text=re.sub(r'<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>',stylesheet,text)
 def script(match):
  attrs,src=match.group(1),match.group(2)
  path=(folder/src).resolve()
  if not path.is_file():raise ValueError('Missing script: '+str(path))
  code=path.read_text(encoding='utf-8').replace('</script','<\\/script')
  code=code.replace('new URLSearchParams(location.search)','new URLSearchParams(window.SL_EMBED_QUERY||location.search)')
  tag='<script>'+code+'</script>'
  if 'defer' in attrs:deferred.append(tag);return ''
  return tag
 text=re.sub(r'<script([^>]*?)src="([^"]+)"[^>]*>\s*</script>',script,text)
 def frame(match):
  attrs,path,tail=match.groups();name,_,query=path.partition('?')
  content=bundle((folder/name).resolve(),'?'+query if query else '')
  return '<iframe'+attrs+'srcdoc="'+html.escape(content,quote=True)+'"'+tail+'>'
 text=re.sub(r'<iframe([^>]*?)src="([^"]+)"([^>]*)>',frame,text)
 if query:text=text.replace('<head>','<head><script>window.SL_EMBED_QUERY='+repr(query)+';</script>',1)
 text=text.replace('</body>','\n'+''.join(deferred)+'\n</body>')
 return text

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--output',default='STUDIOART_PORTATIL.html');args=parser.parse_args()
 target=ROOT/args.output;text=bundle(ROOT/'index.html');target.write_text(text,encoding='utf-8');print(f'Portable: {target.name}, {target.stat().st_size} bytes')
def audit_page():
 application=bundle(ROOT/'index.html').replace('<head>',"<head><script>window.SL_AUDIT_ID=crypto.randomUUID();</script>",1)
 script=(ROOT/'qa/browser_audit.js').read_text().replace('</script','<\\/script')
 target=ROOT/'AUDITORIA_AUTOMATICA.html'
 target.write_text('<!doctype html><html lang="es"><meta charset="utf-8"><title>Auditoría StudioART 1.3.4</title><style>body{background:#101719;color:#eff4ed;font:15px system-ui;padding:20px}button{padding:12px;margin:5px}iframe{width:100%;height:650px;border:1px solid #6c8885}li{padding:5px}</style><h1>Auditoría automática en tu navegador</h1><p>Usa figuras sintéticas en una base de datos de prueba separada. No publica ni sube archivos. Ejecuta desde Chrome o Edge y descarga el resultado.</p><button id="run">Ejecutar auditoría</button><button id="save">Descargar informe JSON</button><p id="summary"></p><ol id="results"></ol><iframe id="app" srcdoc="'+html.escape(application,quote=True)+'"></iframe><script>'+script+'</script></html>',encoding='utf-8')
 print(f'Audit: {target.name}, {target.stat().st_size} bytes')
if __name__=='__main__':main();audit_page()
