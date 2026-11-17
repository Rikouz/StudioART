'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createCanvas,Image}=require('@napi-rs/canvas');
const document={createElement:()=>createCanvas(1,1)},window={document,Image};
const realm=vm.createContext({window,console});vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/layer_motion.js'),'utf8'),realm);const fx=window.SLLayerMotion;
function source(w,h,fill){const c=createCanvas(w,h);fill(c.getContext('2d'));return c;}
function fixture(w,h){return {version:1,width:w,height:h,planes:[
 {id:'background',role:'background',image:source(w,h,g=>{g.fillStyle='#26384a';g.fillRect(0,0,w,h);g.fillStyle='#2d856e';g.fillRect(0,0,w*.4,h);})},
 {id:'product',role:'product',image:source(w,h,g=>{g.fillStyle='#d73329';g.fillRect(w*.4,h*.3,w*.2,h*.4);})},
 {id:'title',role:'title',image:source(w,h,g=>{g.fillStyle='#ffffff';g.fillRect(w*.1,h*.1,w*.4,h*.05);})},
 {id:'logo',role:'logo',image:source(w,h,g=>{g.fillStyle='#e0cf30';g.fillRect(w*.8,h*.05,w*.1,h*.1);})}
]};}
function draw(scene,id,t,extra={}){const c=createCanvas(scene.width,scene.height);fx.render(c.getContext('2d'),scene,{id,time:t*3,duration:3,amount:80,text:'ÁRBOL PROYECTO',seed:777,...extra});return c;}
for(const [w,h] of [[160,284],[160,200],[284,160]]){
 const scene=fixture(w,h),next=source(w,h,g=>{g.fillStyle='#e5d79b';g.fillRect(0,0,w,h);}),extra={next,gallery:scene.planes.map(p=>p.image),waveform:[0,.2,.7,.1,1,.3,0]};
 const baseline=draw(scene,'none',0).toBuffer('image/png');
 for(const id of Object.keys(fx.labels)){
  const frame=draw(scene,id,.37,extra).toBuffer('image/png');assert.deepEqual(frame,draw(scene,id,.37,extra).toBuffer('image/png'),id+' debe ser reproducible');
  assert.notDeepEqual(frame,baseline,id+' debe usar el efecto real');
  assert.deepEqual(draw(scene,id,.37,{...extra,amount:0}).toBuffer('image/png'),baseline);
  assert.notDeepEqual(frame,draw(scene,id,.14,extra).toBuffer('image/png'),id+' debe tener cambio temporal');
 }
 for(const id of ['letterDive','bladeSlice','paperTear']){
  assert.deepEqual(draw(scene,id,0,extra).toBuffer('image/png'),baseline);assert.deepEqual(draw(scene,id,1,extra).toBuffer('image/png'),next.toBuffer('image/png'));
 }
 for(const id of ['layerExplode','blowAway'])for(const t of [0,1])assert.deepEqual(draw(scene,id,t,extra).toBuffer('image/png'),baseline);
 const dolly=draw(scene,'dollyZoom',.5,extra),flat=draw(scene,'none',.5);
 const pixel=c=>[...c.getContext('2d').getImageData(Math.floor(w*.5),Math.floor(h*.5),1,1).data];assert.deepEqual(pixel(dolly),pixel(flat),'Dolly conserva el tamaño y píxeles del recorte');
}
const k=fx.keyframe([{time:0,x:0,scale:1,opacity:1},{time:2,x:.2,scale:2,opacity:0,ease:'linear'}],1);assert.equal(k.x,.1);assert.equal(k.scale,1.5);assert.equal(k.opacity,.5);
assert.equal(fx.keyframe([{time:1,x:.2},{time:2,x:.8}],0).x,.2);
assert.equal(fx.capabilities(fixture(20,20),'voiceNote',{waveform:[]}).length>0,true);
assert.throws(()=>draw(fixture(40,40),'paperTear',.5),/siguiente/);
assert.deepEqual([...fx.peaks([new Float32Array([0,.5,-1,0])],2)],[.5,1]);
const scene=fixture(30,30);scene.planes[1].mask={type:'polygon',points:[{x:0,y:0},{x:.5,y:0},{x:.5,y:1},{x:0,y:1}]};const c=draw(scene,'none',0);assert.notDeepEqual([...c.getContext('2d').getImageData(17,15,1,1).data],[215,51,41,255]);
(async()=>{const raw={version:1,width:30,height:30,planes:scene.planes.map(({image,...p})=>({...p,src:image.toDataURL('image/png')}))};const decoded=await fx.decode(JSON.parse(JSON.stringify(raw)));assert.deepEqual(draw(decoded,'none',0).toBuffer('image/png'),c.toBuffer('image/png'));
console.log('PASS: doce efectos con planos/datos reales, tres formatos, extremos exactos, máscara, keyframes, semillas, audio y reapertura.');})().catch(e=>{console.error(e);process.exitCode=1;});
