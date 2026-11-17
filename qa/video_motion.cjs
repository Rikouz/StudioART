'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createCanvas}=require('@napi-rs/canvas');
const source=fs.readFileSync(path.join(__dirname,'../modulos/creative_v10/js/studio.js'),'utf8');
function part(name){const begin=source.indexOf('function '+name+'(');assert.ok(begin>=0);let end=source.indexOf('\nfunction ',begin+10);return source.slice(begin,end<0?undefined:end);}
const image=createCanvas(120,150),imageCtx=image.getContext('2d');imageCtx.fillStyle='#d74532';imageCtx.fillRect(0,0,120,150);imageCtx.fillStyle='#ffffff';imageCtx.fillRect(40,30,30,50);
const elements=new Map(),$=id=>{if(!elements.has(id))elements.set(id,{value:'',checked:false});return elements.get(id);};
const P={ratio:'4:5',mode:'video',effect:'none',effectIntensity:1,visual:{outerFrame:'none'},timeline:{clips:[{id:'one',assetId:'asset',in:0,out:4,speed:1,effect:'motion_commentDrop',motion:{start:1,duration:2,amount:85,text:'PRUEBA Ñ / ENTREGA'}}],overlays:[],audio:[]}};
const sandbox=vm.createContext({window:{},document:{createElement:()=>createCanvas(1,1)},P,console,
 RATIOS:{'4:5':[320,400],'9:16':[320,568],'16:9':[320,180]},assets:new Map(),identityOverrides:{},motionSnapshot:null,activeVideoAsset:'',video:{readyState:0},selectedTimeline:{kind:'clip',id:'one'},showGuides:false,
 getAsset:()=>({type:'image',url:'source',duration:4}),getImage:()=>image,
 drawCanvasBase:(g,w,h,t,img)=>{g.fillStyle='#222222';g.fillRect(0,0,w,h);g.drawImage(img,0,0,w,h);},drawEffects(){},overlayForFrame(){},drawLayer(){},clamp:(x,a,b)=>Math.min(b,Math.max(a,x)),$,renderTimeline(){},renderEffects(){},render(){}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/camera_effects.js'),'utf8'),sandbox);
for(const name of ['clipScene','layerOptions','clipDuration','timelineTotal','timelineAt','renderToCanvas','applyClipChanges','saveProjectObject'])vm.runInContext(part(name),sandbox);
function render(t,mult=1){const dims=sandbox.RATIOS[P.ratio],canvas=createCanvas(dims[0]*mult,dims[1]*mult);sandbox.renderToCanvas(canvas,t,true);return canvas.toBuffer('image/png');}
for(const ratio of Object.keys(sandbox.RATIOS)){
 P.ratio=ratio;
 for(const id of Object.keys(sandbox.window.SLCameraEffects.labels)){
  P.timeline.clips[0].effect='motion_'+id;
  const baseline=render(0),active=render(1.34);
  assert.notDeepEqual(active,baseline,`${id}: efecto ausente en ${ratio}`);
  assert.deepEqual(render(1.34),active,'La posición temporal debe ser reproducible');
  assert.deepEqual(render(3.01),baseline,'El efecto debe terminar en la duración indicada');
  P.timeline.clips[0].motion.amount=0;assert.deepEqual(render(1.34),baseline);P.timeline.clips[0].motion.amount=85;
  render(1.34,2);assert.deepEqual(render(1.34),active,'Cambiar resolución no contamina las exportaciones siguientes');
 }
}
// Exercise the actual Video branch with the new compositor, not only the standalone effect library.
sandbox.window.document=sandbox.document;
vm.runInContext(fs.readFileSync(path.join(__dirname,'../modulos/estudio_v5/contour_design.js'),'utf8'),sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/layer_motion.js'),'utf8'),sandbox);
const product=createCanvas(120,150);product.getContext('2d').fillStyle='#dc4b27';product.getContext('2d').fillRect(40,50,35,65);
const layeredAsset={id:'asset',type:'image',url:'source',scene:{version:1,width:120,height:150,planes:[{id:'background',role:'background',image},{id:'product',role:'product',image:product}]}};
sandbox.assets.set('asset',layeredAsset);sandbox.assets.set('next',{id:'next',type:'image',url:'next'});sandbox.getAsset=id=>sandbox.assets.get(id);
P.timeline.clips.push({id:'two',assetId:'next',in:0,out:4,speed:1,effect:'none'});
P.ratio='4:5';P.timeline.clips[0].waveform=[0,.2,.9,.1,0];
P.timeline.clips[0].layerKeys={product:[{time:0,x:0},{time:4,x:.05}]};
for(const id of Object.keys(sandbox.window.SLLayerMotion.labels)){
 P.timeline.clips[0].effect='layer_'+id;
 const frame=render(1.4);assert.deepEqual(frame,render(1.4),id+' debe usar el mismo render por tiempo');
 assert.equal($('layerMotionStatus').textContent,'',id+' no debe caer al render sin efecto');
}
P.timeline.clips[0].effect='layer_paperTear';P.timeline.clips.pop();render(1.4);assert.match($('layerMotionStatus').textContent,/siguiente/);
P.timeline.clips[0].effect='none';delete P.timeline.clips[0].layerKeys;
$('trimStart').value='0';$('trimEnd').value='4';$('clipSpeed').value='1';$('clipEffect').value='motion_predictKeys';$('clipMotionText').value='Árbol / equipo';$('clipMotionAmount').value='73';$('clipMotionStart').value='0.7';$('clipMotionDuration').value='1.4';$('clipVolume').value='80';
sandbox.applyClipChanges();
const saved=JSON.parse(JSON.stringify(sandbox.saveProjectObject()));
assert.deepEqual(saved.timeline.clips[0].motion,{text:'Árbol / equipo',amount:73,start:.7,duration:1.4});
assert.equal(saved.timeline.clips[0].effect,'motion_predictKeys');
console.log('PASS: render real de Video, nueve efectos, tres formatos, alta resolución, entrada/salida, intensidad cero y proyecto con ajustes por clip.');
