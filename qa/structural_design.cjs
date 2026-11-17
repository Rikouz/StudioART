'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createCanvas}=require('@napi-rs/canvas');
const harness=fs.readFileSync(path.join(__dirname,'studio_composition.cjs'),'utf8').split('async function main(){')[0];
const {run,input,context,elements}=new Function('require','__dirname',harness+'\nreturn {run,input,context,elements};')(require,__dirname);
(async()=>{
 context.window.document=context.document;
 await run("setMedia('background',fixture.bg)");await run("setMedia('logo',fixture.logo)");
 input('format','custom');elements.get('formatWidth').value='480';elements.get('formatHeight').value='600';elements.get('formatHeight').emit('change');
 input('headline','TU ESPACIO PARA CREAR');input('cta','Conoce las opciones');
 const states=[],images=[],architectures=new Set(),treatments=new Set();
 const png=()=>run("(()=>{const c=document.createElement('canvas');render(c,comps[0]);return c.canvas.toBuffer('image/png')})()");
 const pixel=()=>run("(()=>{const c=document.createElement('canvas');render(c,comps[0],{thumb:true});return [...c.getContext('2d').getImageData(0,0,c.width,c.height).data]})()");
 for(let seed=0;seed<20;seed++){
  input('designSeed',seed);run("$('generate').onclick()");assert.equal(run('comps.length'),1);assert.equal(elements.get('variants').hidden,true);
  const recipe=run('JSON.stringify(snapshotStudio())'),before=png(),pixels=pixel();states.push(JSON.parse(recipe));images.push(pixels);
  const v=states.at(-1).comps[0]._visual;architectures.add(v.designArchitectureValue);treatments.add(v.designTreatmentValue);
  run("$('repeatDesign').onclick()");assert.deepEqual(png(),before,'La misma semilla debe reproducir exactamente el PNG');
  if(process.argv[2])fs.writeFileSync(path.join(process.argv[2],`design-${seed}.png`),before);
 }
 assert.equal(architectures.size,10);assert.equal(treatments.size,6);
 for(let i=1;i<images.length;i++){
  let changed=0;for(let j=0;j<images[i].length;j+=4)if(Math.abs(images[i][j]-images[i-1][j])+Math.abs(images[i][j+1]-images[i-1][j+1])+Math.abs(images[i][j+2]-images[i-1][j+2])>30)changed++;
  assert.ok(changed/(images[i].length/4)>.12,'Las estructuras consecutivas deben cambiar una parte sustancial de la imagen');
 }
 context.saved=states[7];await run('restoreStudio(saved)');const roundtrip=png();await run('restoreStudio(saved)');assert.deepEqual(png(),roundtrip);
 const previous=run('JSON.stringify({tx:comps[0].tx,ty:comps[0].ty,a:getVisual().designArchitectureValue})');run("$('varyColor').onclick()");assert.equal(run('JSON.stringify({tx:comps[0].tx,ty:comps[0].ty,a:getVisual().designArchitectureValue})'),previous);
 const varied=png();run("$('repeatDesign').onclick()");assert.deepEqual(png(),varied,'Repetir conserva también los canales variados');
 // Manual contour controls alter actual pixels and survive project/looks.
 input('designTreatment','contours');input('contourLevels',3);const low=png();input('contourLevels',16);assert.notDeepEqual(png(),low);
 context.look=JSON.parse(run('JSON.stringify(snapshotLook())'));input('designArchitecture','split');run('applyLook(look)');assert.equal(run('getVisual().designArchitectureValue'),context.look.proposals[0].visual.designArchitectureValue);
 const map=run(`(()=>{const w=48,h=48,d=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=Math.round(255*(x+y)/(w+h-2));d.set([v,v,v,255],(y*w+x)*4);}return StudioContourDesign.analyze(d,w,h,{levels:7,spacing:2,seed:4});})()`);
 assert.ok(map.paths.length>=7);assert.ok(map.paths.some(p=>p.points.length>15));assert.ok(map.flow.length>0);assert.ok(map.gx.some(v=>v>0));
 for(const p of map.paths)for(let i=1;i<p.points.length;i++)assert.ok(Math.hypot(p.points[i][0]-p.points[i-1][0],p.points[i][1]-p.points[i-1][1])<=2.9,'El contorno debe ser continuo');
 // Decode an actual GIF using the shared contour renderer (optional external output for pixel inspection).
 context.Blob=Blob;input('studioMotionEffect','contourTrace');run('globalThis.gifFrames=preparedFrames(100)');
 const gif=await run("window.SLOffline.renderGif({width:80,height:100,duration:1,fps:10,draw:(t,c)=>drawMotion(t,c,gifFrames)})");
 const gifBytes=Buffer.from(await gif.arrayBuffer());assert.equal(gifBytes.subarray(0,6).toString(),'GIF89a');if(process.argv[3])fs.writeFileSync(process.argv[3],gifBytes);
 // Drive the actual Play callback/RAF; inject a rendering error and verify recovery.
 const queue=new Map();let seq=0;context.performance={now:()=>0};context.requestAnimationFrame=cb=>{queue.set(++seq,cb);return seq;};context.cancelAnimationFrame=id=>queue.delete(id);
 for(const effect of ['contourTrace','engravingFlow','pixelMemory','ribbonFlow']){
  input('studioMotionEffect',effect);input('studioMotionAmount',80);run('globalThis.ff=preparedFrames(140)');
  const frame=t=>run(`(()=>{const c=document.createElement('canvas');c.width=140;c.height=176;drawMotion(${t},c,ff);return c.canvas.toDataURL('image/png')})()`);
  assert.notEqual(frame(0),frame(.4));assert.equal(frame(.4),frame(.4));
 }
 input('studioMotionEffect','contourTrace');run("$('stagePlay').onclick()");assert.equal(run('motionState.running'),true);assert.equal(elements.get('stagePlay').textContent,'Ⅱ Pausar');
 let next=queue.entries().next().value;queue.delete(next[0]);next[1](450);assert.ok(run('motionState.elapsed')>.4);assert.equal(elements.get('motionClock').textContent,'0.45 s');
 run('motionState.frames[0].scene.planes=[]');next=queue.entries().next().value;queue.delete(next[0]);next[1](650);assert.equal(run('motionState.running'),false);assert.equal(elements.get('motionPlay').disabled,false);assert.match(elements.get('status').textContent,/Motion detenido/);
 input('studioMotionEffect','none');input('motionMode','none');run("$('stagePlay').onclick()");assert.equal(run('motionState.running'),false);assert.match(elements.get('status').textContent,/imagen fija/);
 // Editing a text layer aligns the complete box; masks and rotation remain intact.
 run("studioPro=true;$('addText').onclick();activeLayer().backgroundMode='custom';activeLayer().boxWidth=35;activeLayer().mask={type:'polygon',points:[{x:0,y:0},{x:1,y:0},{x:1,y:1}]};activeLayer().rotation=15;$('alignLayerCenter').onclick()");
 assert.equal(run('Math.round(activeLayer().x*10)/10'),32.5);assert.equal(run('activeLayer().rotation'),15);assert.equal(run('activeLayer().mask.points.length'),3);
 console.log('PASS: 20 diseños únicos reproducibles, 10 arquitecturas, 6 tratamientos y >12% de píxeles cambiados entre diseños consecutivos.');
 console.log('PASS: contornos conectados, campo Sobel/tangente, controles reactivos, canales, looks/JSON y alineación con máscara.');
 console.log('PASS: cuatro efectos temporales, callback real de Play, reloj, pausa y recuperación ante excepción. DOM/RAF simulado; Canvas nativo.');
})().catch(e=>{console.error(e);process.exitCode=1;});
