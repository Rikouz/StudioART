'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const harness=fs.readFileSync(path.join(__dirname,'studio_composition.cjs'),'utf8').split('async function main(){')[0];
const setup=new Function('require','__dirname',harness+'\nreturn {run,input,context,elements};');
(async()=>{
 const {run,input,context,elements}=setup(require,__dirname);context.window.document=context.document;
 await run("setMedia('background',fixture.bg)");await run("setMedia('logo',fixture.logo)");
 input('format','9:16');input('headline','CADA HERRAMIENTA EN SU LUGAR');
 run("$('addText').onclick();extraLayers.at(-1).text='HOLA';extraLayers.at(-1).backgroundMode='custom';extraLayers.at(-1).backgroundColor='#be8122';extraLayers.at(-1).boxWidth=24;extraLayers.at(-1).boxPadding=2;drawAll()");
 const id=run('extraLayers.at(-1).id');
 run("$('addShape').onclick();extraLayers.at(-1).locked=true;extraLayers.at(-1).x=13;extraLayers.at(-1).y=62;drawAll();$('varyAll').onclick()");
 const proposals=[];const pngs=[];
 for(let i=0;i<4;i++){
  if(i)run("$('varyAll').onclick()");
  proposals.push(JSON.parse(run('JSON.stringify(comps[0])')));
  pngs.push(run("(()=>{const out=document.createElement('canvas');render(out,comps[0]);return out.canvas.toDataURL('image/png');})()"));
  assert.equal(run('comps.length'),1,'Cada generación entrega un solo diseño');
 }
 assert.ok(new Set(proposals.map(c=>c._extra.find(l=>l.id===id)?.x+':'+c._extra.find(l=>l.id===id)?.y)).size>=3,'La capa nueva debe variar entre generaciones');
 assert.ok(new Set(proposals.map(c=>c._visual.logoX+':'+c._visual.logoY)).size>=2,'El logo debe cambiar de posición');
 for(const c of proposals){assert.ok(c._extra.some(l=>l.id===id&&l.backgroundMode==='custom'));assert.ok(c._extra.some(l=>l.locked&&l.x===13&&l.y===62));}
 assert.equal(new Set(pngs).size,4,'Los cuatro diseños consecutivos deben ser diferentes');
 const first=run('JSON.stringify(snapshotStudio().comps)');
 run("$('repeatDesign').onclick()");assert.equal(run('JSON.stringify(snapshotStudio().comps)'),first,'Repetir conserva posiciones y cuadros');
 run("$('generate').onclick()");assert.notEqual(run('JSON.stringify(snapshotStudio().comps)'),first,'Generar otra vez debe crear una nueva serie');
 elements.get('lockLogo').checked=true;elements.get('lockText').checked=true;
 const locked=JSON.parse(run('JSON.stringify({tx:comps[current].tx,ty:comps[current].ty,logoX:getVisual().logoX,logoY:getVisual().logoY})'));
 run("$('varyAll').onclick()");for(const c of JSON.parse(run('JSON.stringify(comps)'))){assert.equal(c.tx,locked.tx);assert.equal(c.ty,locked.ty);assert.equal(c._visual.logoX,locked.logoX);assert.equal(c._visual.logoY,locked.logoY);}
 context.saved=JSON.parse(run('JSON.stringify(snapshotStudio())'));await run('restoreStudio(saved)');assert.equal(run("$('lockLogo').checked"),true);
 input('studioMotionEffect','layerExplode');input('studioMotionAmount',65);
 run('globalThis.motionFrames=preparedFrames(160)');
 const a=run("(()=>{const out=document.createElement('canvas');out.width=160;out.height=284;drawMotion(0,out,motionFrames);return out.canvas.toDataURL('image/png')})()");
 const b=run("(()=>{const out=document.createElement('canvas');out.width=160;out.height=284;drawMotion(.5,out,motionFrames);return out.canvas.toDataURL('image/png')})()");assert.notEqual(a,b,'Motion debe cambiar los píxeles de la vista de Estudio');
 input('studioMotionEffect','none');input('studioMotionAmount',0);
 const frozen=run("(()=>{const out=document.createElement('canvas');out.width=160;out.height=284;drawMotion(.5,out,motionFrames);return out.canvas.toDataURL('image/png')})()");assert.equal(frozen,b,'La exportación conserva la configuración capturada');
 context.Blob=Blob;
 const gif=await run("window.SLOffline.renderGif({width:80,height:142,duration:1,fps:10,draw:(t,c)=>drawMotion(t,c,motionFrames)})");
 const bytes=Buffer.from(await gif.arrayBuffer());assert.equal(bytes.subarray(0,6).toString(),'GIF89a');assert.equal(bytes.at(-1),59);
 if(process.argv[2])fs.writeFileSync(process.argv[2],bytes);
 await run("setMedia('product',fixture.logo)");
 for(const effect of [...Object.keys(context.window.SLCameraEffects.labels).map(id=>'camera:'+id),'layerExplode','dollyZoom','rackFocus','cloneRow','orbitRing','codeBody','blowAway']){
   input('studioMotionEffect',effect);input('studioMotionAmount',65);
   run("globalThis.motionFrames=preparedFrames(100);globalThis.motionCanvas=document.createElement('canvas');motionCanvas.width=100;motionCanvas.height=178;drawMotion(.3,motionCanvas,motionFrames)");
   assert.ok(run("motionCanvas.canvas.toDataURL('image/png').length")>100);
 }
 input('studioMotionEffect','contourFlow');input('fxThreshold',4);
 run("globalThis.motionFrames=preparedFrames(160)");assert.ok(run('motionFrames[0].contours.edges.length')>0,'Debe analizar conexiones sobre los bordes reales');
 const contourFrame=t=>run(`(()=>{const out=document.createElement('canvas');out.width=160;out.height=284;drawMotion(${t},out,motionFrames);return out.canvas.toDataURL('image/png')})()`);
 assert.notEqual(contourFrame(0),contourFrame(.5),'La malla de contornos debe animarse');
 assert.equal(contourFrame(.5),contourFrame(.5),'La misma semilla y tiempo deben repetir el fotograma');
 input('studioMotionEffect','auto');
 context.performance={now:()=>0};context.requestAnimationFrame=()=>1;context.cancelAnimationFrame=()=>{};context.window.matchMedia=()=>({matches:false});elements.get('autoStudioMotion').checked=true;run('makeSeries(true)');assert.equal(run('motionState.running'),true);run('stopMotion()');
 console.log('PASS: GIF real y los diecisiete efectos disponibles en el render de Estudio.');
 console.log('PASS: diseño único, cuatro generaciones distintas, capa nueva y cuadro en cada diseño, logo variable, candados, repetir semilla y reapertura; motion visible y configuración congelada.');
})().catch(e=>{console.error(e);process.exitCode=1;});
