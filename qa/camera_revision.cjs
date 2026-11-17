'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const controls = new Map();
const pending = new Map();
const frames = [];
const downloads = [];
const messages = [];
const ctx = {
  fillRect(){}, save(){}, restore(){}, translate(){}, rotate(){},
  drawImage(image){frames.push({src:image.src,bg:this.fillStyle});}
};
function canvas(){
  return {width:120,height:60,getContext:()=>ctx,toBlob:done=>done(new Blob(['png']))};
}
function element(id){
  if(!controls.has(id))controls.set(id,{
    ...canvas(),value:'',checked:false,events:{},
    addEventListener(type,handler){this.events[type]=handler;},setAttribute(){}
  });
  return controls.get(id);
}
class TestImage {
  set src(value){this.url=value;this.naturalWidth=64;this.naturalHeight=64;pending.set(value,this);}
  get src(){return this.url;}
}
const state = {camera:{asset:'shared',ratio:'16:9',scene:'flat',bg:'#aaaaaa',fps:12,duration:1}};
const media = [{id:'shared',name:'Composición vinculada',src:'initial'}];
const window = {
  Supremo:{ready:true,state,media,mediaURL:asset=>asset?.src,save(){},
    download:(_,name)=>downloads.push(name),notify:message=>messages.push(message)},
  addEventListener(type,fn){if(type==='supremo-ready')this.init=fn;}
};
const document={getElementById:element,createElement:canvas};
const changeRevision=src=>{media[0].src=src;window.CameraStudio.assetChanged();};
let encode;
const SLOffline={renderGif:args=>encode(args),recordVideo:args=>encode(args)};
const env=vm.createContext({window,document,Image:TestImage,SLOffline});
for(const script of ['camera_effects.js','camera.js']){
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',script),'utf8'),env);
}
window.init();
assert.equal(element('cameraEffect').value,'none');
const effectFrames=[];
window.SLCameraEffects.layout=(_w,_h,effect)=>{effectFrames.push({...effect});return null;};
element('cameraEffect').value='commentDrop';
element('cameraEffectAmount').value='72';
element('cameraEffectText').value='Entrega local';
element('cameraEffect').events.input();
assert.deepEqual({...state.camera.effect},{id:'commentDrop',amount:72,text:'Entrega local'});
element('cameraEffectText').value='';
window.CameraStudio.restore();
assert.equal(element('cameraEffectText').value,'Entrega local');

async function main(){
  const png=element('cameraStill').onclick();
  assert.equal(element('cameraGif').disabled,true);
  assert.deepEqual(downloads,[]);
  pending.get('initial').onload();
  await png;
  assert.equal(downloads[0],'MSCCS_CAMERA_16x9.png');
  assert.equal(frames.at(-1).src,'initial');

  for(const [button,src,next,extension] of [
    ['cameraGif','gif-revision','newer-gif','gif'],
    ['cameraMP4','video-revision','newer-video','webm']
  ]){
    element('cameraBg').value='#aaaaaa';
    element('cameraEffectText').value='Entrega local';
    changeRevision(src);
    let started=false;
    encode=async ({draw})=>{
      started=true;
      for(const stage of ['before','loading','after']){
        if(stage==='loading'){
          changeRevision(next);
          element('cameraBg').value='#bbbbbb';
          element('cameraEffectText').value='Otro texto';
        }
        if(stage==='after'){
          pending.get(next).onload();
          await Promise.resolve();
        }
        draw(.5,canvas());
        assert.deepEqual(frames.at(-1),{src,bg:'#aaaaaa'});
        assert.deepEqual(effectFrames.at(-1),{id:'commentDrop',amount:72,text:'Entrega local'});
      }
      return {blob:new Blob(['video']),extension};
    };
    const exporting=element(button).onclick();
    assert.equal(started,false);
    pending.get(src).onload();
    await exporting;
    assert.equal(downloads.at(-1),'MSCCS_CAMERA_16x9.'+extension);
  }
  changeRevision('broken');
  const broken=element('cameraStill').onclick();
  pending.get('broken').onerror();
  await broken;
  assert.equal(downloads.length,3);
  assert.match(messages.at(-1),/No se pudo cargar/);
  assert.equal(element('cameraStill').disabled,false);
  console.log('PASS: Cámara espera la revisión en PNG, GIF y WebM, mantiene ajustes y fotogramas durante la exportación y rechaza imágenes dañadas.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
