'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const controls = new Map();
const drawn = [];
const pending = new Map();
const messages = [];
const downloads = [];
const project = {carousel: {slides: [{id:'pieza',duration:2}]}};
const media = [{id:'pieza',name:'Pieza de prueba',type:'image',src:'original'}];
const ctx = new Proxy({drawImage(img){drawn.push(img.src);}},{
  get(target,key){return target[key] ?? (()=>{});}
});
function element(){
  return {value:'',style:{},append(){},appendChild(){},replaceChildren(){},
    setAttribute(){},addEventListener(){},getContext(){return ctx;},
    toBlob(callback){callback(new Blob(['png']));}};
}
function control(id){
  if(!controls.has(id))controls.set(id,element());
  return controls.get(id);
}
class TestImage {
  set src(value){this.url=value;this.naturalWidth=64;this.naturalHeight=64;pending.set(value,this);}
  get src(){return this.url;}
}
let recordVideo;
const window = {Supremo:{ready:true,media,state:project,save(){},mediaURL:item=>item?.src,
  notify:message=>messages.push(message),download:(blob,name)=>downloads.push(name)},
  addEventListener(type,fn){if(type==='supremo-ready')this.init=fn;}};
const document = {getElementById:control,createElement:element,head:element()};
Object.assign(control('carouselRatio'),{value:'16:9'});
Object.assign(control('carouselStyle'),{value:'c4'});
Object.assign(control('carouselBgMode'),{value:'solid'});
Object.assign(control('carouselFPS'),{value:15});
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/carousel.js'),'utf8'),
  {window,document,Image:TestImage,SLOffline:{recordVideo:args=>recordVideo(args)}});
window.init();
pending.get('original').onload();

async function main(){
  media[0].src='revision';
  window.CarouselStudio.refreshLinkedSlides();
  const png=control('carouselPNG').onclick();
  assert.equal(control('carouselPNG').disabled,true);
  assert.equal(downloads.length,0);
  pending.get('revision').onload();
  drawn.length=0;
  await png;
  assert.deepEqual(downloads,['MSCCS_CARRUSEL_c4.png']);
  assert.ok(drawn.length && drawn.every(src=>src==='revision'));
  assert.equal(control('carouselPNG').disabled,false);

  media[0].src='video-revision';
  window.CarouselStudio.refreshLinkedSlides();
  let videoStarted=false;
  recordVideo=async ({draw,duration})=>{
    videoStarted=true;
    assert.equal(duration,2);
    media[0].src='later-revision';
    drawn.length=0;
    draw(.5,element());
    assert.ok(drawn.length && drawn.every(src=>src==='video-revision'));
    return {blob:new Blob(['video']),extension:'webm'};
  };
  const video=control('carouselMP4').onclick();
  assert.equal(videoStarted,false);
  pending.get('video-revision').onload();
  await video;
  assert.equal(videoStarted,true);
  assert.equal(downloads.length,2);

  media[0].src='damaged';
  const damaged=control('carouselPNG').onclick();
  pending.get('damaged').onerror();
  await damaged;
  assert.equal(downloads.length,2);
  assert.match(messages.at(-1),/No se pudo cargar Pieza de prueba/);
  assert.equal(control('carouselPNG').disabled,false);

  media[0].src='pending';
  const stale=control('carouselPNG').onclick();
  media[0].src='newer';
  pending.get('pending').onload();
  await stale;
  assert.equal(downloads.length,2);
  assert.match(messages.at(-1),/cambió mientras se preparaba/);
  console.log('PASS: PNG y video esperan la revisión, el video la conserva y se rechazan imágenes fallidas o reemplazadas durante la carga.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
