'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const sandbox=vm.createContext({setTimeout,clearTimeout,Date});vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/video_export.js'),'utf8'),sandbox);
const engine=sandbox.SLVideoExport;
class ImageClass{set src(url){this.url=url;setTimeout(()=>{if(url==='bad')this.onerror?.();else{this.naturalWidth=20;this.onload?.();}},8);}}
(async()=>{
 const assets=new Map([['one',{id:'one',type:'image',url:'r1'}]]),cache=new Map();
 let done=false;const loading=engine.prepareImages([{assetId:'one'}],id=>assets.get(id),cache,{ImageClass}).then(()=>done=true);
 assert.equal(done,false);assert.equal(cache.size,0);await loading;assert.equal(cache.get('r1').naturalWidth,20);
 const replaced=engine.prepareImages([{assetId:'one'}],id=>assets.get(id),cache,{ImageClass});assets.get('one').url='r2';await assert.rejects(replaced,/revisión cambió/);
 assets.get('one').url='bad';await assert.rejects(engine.prepareImages([{assetId:'one'}],id=>assets.get(id),cache,{ImageClass}),/cargar/);
 const video={readyState:0,currentTime:0,seeking:false};const ready=engine.firstVideoFrame(video,1);
 setTimeout(()=>{video.readyState=2;},10);await ready;assert.equal(video.currentTime,1);
 await assert.rejects(engine.firstVideoFrame({error:true},0),/origen/);
 for(const [a,b] of [[1,1],[.8,.4],[0,0],[1,0]]){const g=engine.gains(a,b);assert.ok(g.clip+g.track<=.950001);if(b&&a)assert.ok(Math.abs(g.clip/g.track-a/b)<1e-8);}
 const script=fs.readFileSync(path.join(__dirname,'../modulos/creative_v10/js/studio.js'),'utf8');
 assert.ok(script.indexOf('await prepareVideoExport()')<script.indexOf('rec.start(1000)'));
 const code=script.slice(script.indexOf('async function prepareVideoExport(){'),script.indexOf('async function exportVideo(){'));
 const stages=[],native={...engine},asset={id:'one',type:'image',url:'r3'};
 native.prepareImages=async()=>{await new Promise(resolve=>setTimeout(resolve,5));stages.push('decoded');};
 Object.assign(sandbox,{window:{SLVideoExport:native},document:{fonts:{ready:Promise.resolve()}},P:{timeline:{clips:[{assetId:'one'}],overlays:[]}},getAsset:()=>asset,imageCache:new Map(),timelineSeek:()=>stages.push('seek'),timelineAt:()=>({clip:{assetId:'one',in:0}}),renderToCanvas:()=>stages.push('frame'),cvs:{}});
 vm.runInContext(code,sandbox);await sandbox.prepareVideoExport();assert.deepEqual(stages,['decoded','seek','frame']);
 const messageCode=script.slice(script.indexOf('async function receiveStudioMessage(event){'),script.indexOf("window.addEventListener('message',receiveStudioMessage)"));
 const parent={},updates=[],deferred=[];Object.assign(sandbox,{window:{parent},exporting:true,deferredStudioMessages:deferred,linkedStudioImage:(...args)=>{updates.push(args);return {};},attachLayerScene:async()=>{},renderMedia(){},renderTimeline(){},render(){}});
 vm.runInContext(messageCode,sandbox);
 const event={source:parent,origin:'null',data:{type:'SL1_UPDATE_STUDIO',studioAssetId:'media_test',file:{}}};
 await sandbox.receiveStudioMessage(event);assert.equal(updates.length,0);assert.equal(deferred.length,1);
 sandbox.exporting=false;await sandbox.receiveStudioMessage(deferred.pop());assert.equal(updates.length,1);
 console.log('PASS: carga previa diferida, revisiones reemplazadas/dañadas, primer cuadro preparado, revisiones diferidas durante exportación y margen de mezcla de audio.');
})().catch(e=>{console.error(e);process.exitCode=1;});
