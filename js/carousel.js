/* MSCCS — C4 / C5 / C6 / C7 / C8. Render Canvas determinista: misma función preview y MP4. */
'use strict';
(function(){
const $=id=>document.getElementById(id),S=()=>window.Supremo;
const cvs=$('carouselCanvas'),ctx=cvs.getContext('2d');
let slides=[],images=new Map(),bgImage=null,bgKey='',playing=false,raf=0,started=0,currentSec=0,rendering=false;
const pawIdle="url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"36\" height=\"36\" viewBox=\"0 0 100 100\"><ellipse cx=\"50\" cy=\"85\" rx=\"22\" ry=\"4\" fill=\"%23fbcfe8\" opacity=\"0.6\"/><path fill=\"%23fff0f5\" stroke=\"%23f472b6\" stroke-width=\"4\" stroke-linejoin=\"round\" d=\"M 50 20 C 34 20 20 30 15 48 C 10 66 24 82 50 82 C 76 82 90 66 85 48 C 80 30 66 20 50 20 Z\"/><path fill=\"%23f472b6\" d=\"M 50 50 C 38 50 30 62 30 72 C 30 77 39 80 50 80 C 61 80 70 77 70 72 C 70 62 62 50 50 50 Z\"/><ellipse cx=\"28\" cy=\"46\" rx=\"8\" ry=\"10\" fill=\"%23f472b6\" transform=\"rotate(-15 28 46)\"/><ellipse cx=\"42\" cy=\"36\" rx=\"8\" ry=\"10\" fill=\"%23f472b6\"/><ellipse cx=\"58\" cy=\"36\" rx=\"8\" ry=\"10\" fill=\"%23f472b6\"/><ellipse cx=\"72\" cy=\"46\" rx=\"8\" ry=\"10\" fill=\"%23f472b6\" transform=\"rotate(15 72 46)\"/><ellipse cx=\"44\" cy=\"60\" rx=\"3\" ry=\"1.8\" fill=\"%23ffffff\" opacity=\"0.9\"/></svg>') 18 18, auto!important",pawDown="url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"48\" height=\"48\" viewBox=\"0 0 100 100\"><ellipse cx=\"50\" cy=\"88\" rx=\"24\" ry=\"4\" fill=\"%23fbcfe8\" opacity=\"0.8\"/><path fill=\"%23fce7f3\" stroke=\"%23fbbf24\" stroke-width=\"5\" stroke-linejoin=\"round\" d=\"M 50 23 C 36 23 22 32 17 50 C 12 68 26 83 50 83 C 74 83 88 68 83 50 C 78 32 64 23 50 23 Z\"/><path fill=\"%23ec4899\" d=\"M 50 52 C 39 52 32 63 32 72 C 32 77 41 80 50 80 C 59 80 68 77 68 72 C 68 63 61 52 50 52 Z\"/><ellipse cx=\"30\" cy=\"50\" rx=\"8\" ry=\"10\" fill=\"%23ec4899\" transform=\"rotate(-15 30 50)\"/><ellipse cx=\"43\" cy=\"40\" rx=\"8\" ry=\"10\" fill=\"%23ec4899\"/><ellipse cx=\"57\" cy=\"40\" rx=\"8\" ry=\"10\" fill=\"%23ec4899\"/><ellipse cx=\"70\" cy=\"50\" rx=\"8\" ry=\"10\" fill=\"%23ec4899\" transform=\"rotate(15 70 50)\"/><ellipse cx=\"44\" cy=\"62\" rx=\"3.5\" ry=\"2\" fill=\"%23ffffff\" opacity=\"0.85\"/><path fill=\"%23fbbf24\" d=\"M 78 14 L 84 2 L 88 12 Z M 88 18 L 98 16 L 90 24 Z M 72 24 L 75 32 L 80 26 Z\"/><path fill=\"none\" stroke=\"%23f472b6\" stroke-width=\"3\" stroke-linecap=\"round\" d=\"M 10 65 Q 6 62 8 58 M 90 65 Q 94 62 92 58\"/></svg>') 24 24, auto !important!important";
function pawRules(selector){return selector+'{cursor:'+pawIdle+'}'+selector+':active{cursor:'+pawDown+'}';}
function config(){return {paw:$('carouselPaw').checked,tilt:$('carouselTilt').checked,style:$('carouselStyle').value,ratio:$('carouselRatio').value,bgMode:$('carouselBgMode').value,bgColor:$('carouselBgColor').value,bgAsset:$('carouselBgAsset').value,bgAlpha:+$('carouselBgAlpha').value/100,slideDuration:+$('carouselSlideDuration').value||2.5,transition:+$('carouselTransition').value||.7,audio:$('carouselAudio').value,fps:+$('carouselFPS').value||15};}
function save(){if(!S()?.ready)return;S().state.carousel={...config(),slides:slides.map(x=>({...x}))};S().save();}
function durations(sequence=slides,settings=config()){return sequence.map(s=>Math.max(.5,Number(s.duration)||settings.slideDuration));}
function total(){return durations().reduce((a,b)=>a+b,0);}
function wrap(i,n){return (i%n+n)%n;}
function ease(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);}
function nativeSize(ratio,width){const [a,b]=ratio.split(':').map(Number);return [Math.round(width),Math.round(width*b/a)];}
function resize(){const [w,h]=nativeSize(config().ratio,config().ratio==='16:9'?960:540);if(cvs.width!==w||cvs.height!==h){cvs.width=w;cvs.height=h;}render();}
function loadAssetImage(id){
 const rec=S()?.media?.find(item=>item.id===id&&item.type==='image');
 const src=rec&&S().mediaURL(rec);
 if(!src)return null;
 const cached=images.get(id);
 if(cached?.src===src)return cached;
 const img=new Image();
 const entry={src,img,ready:false};
 entry.loaded=new Promise(resolve=>{
   img.onload=()=>{
     entry.ready=true;
     resolve(true);
     if(images.get(id)===entry)render();
   };
   img.onerror=()=>resolve(false);
 });
 images.set(id,entry);
 img.src=src;
 return entry;
}
function imgFromAsset(id){
 const entry=loadAssetImage(id);
 return entry?.ready?entry.img:null;
}
async function prepareExportImages(sequence,settings){
 const ids=new Set(sequence.map(slide=>slide.id));
 if(settings.bgMode==='image'&&settings.bgAsset)ids.add(settings.bgAsset);
 const assets=[...ids].map(id=>({id,entry:loadAssetImage(id)}));
 const loaded=await Promise.all(assets.map(({entry})=>entry?.loaded));
 for(const [index,{id,entry}] of assets.entries()){
   const record=S().media.find(item=>item.id===id);
   if(!loaded[index])throw Error('No se pudo cargar '+(record?.name||id)+'.');
   if(loadAssetImage(id)!==entry)throw Error('Una imagen cambió mientras se preparaba la exportación. Vuelve a exportar.');
 }
 return new Map(assets.map(({id,entry})=>[id,entry.img]));
}
function backgroundAsset(){const id=config().bgAsset;if(!id)return null;return imgFromAsset(id);}
function fillImage(ctx,img,x,y,w,h,fit='contain'){if(!img||!img.naturalWidth)return;const r=fit==='cover'?Math.max(w/img.naturalWidth,h/img.naturalHeight):Math.min(w/img.naturalWidth,h/img.naturalHeight),ww=img.naturalWidth*r,hh=img.naturalHeight*r;ctx.drawImage(img,x+(w-ww)/2,y+(h-hh)/2,ww,hh);}
function drawBackground(c,W,H,image,transparent=false,s=config(),imageFor=imgFromAsset){c.clearRect(0,0,W,H);if(s.bgMode==='transparent'&&transparent){return;}c.fillStyle=s.bgColor;c.fillRect(0,0,W,H);if(s.bgMode==='image'){const bg=s.bgAsset&&imageFor(s.bgAsset);if(bg){c.save();c.globalAlpha=s.bgAlpha;fillImage(c,bg,0,0,W,H,'cover');c.restore();}}else if(s.bgMode==='blur'&&image){c.save();c.globalAlpha=s.bgAlpha;c.filter='blur('+Math.round(Math.min(W,H)*.04)+'px)';fillImage(c,image,-W*.08,-H*.08,W*1.16,H*1.16,'cover');c.filter='none';c.restore();}}
function roundRect(c,x,y,w,h,r){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}
function drawCard(c,img,x,y,w,h,opts={}){if(!img)return;c.save();c.globalAlpha=opts.alpha===undefined?1:opts.alpha;c.translate(x,y);c.rotate(opts.rot||0);const sx=opts.sx||1;c.scale(sx,1);c.shadowColor=opts.shadow===false?'transparent':'rgba(0,0,0,.28)';c.shadowBlur=Math.max(0,h*.038);c.shadowOffsetY=h*.025;c.fillStyle=opts.paper||'#e8e6df';roundRect(c,-w/2,-h/2,w,h,Math.max(2,h*.018));c.fill();c.shadowBlur=0;c.shadowOffsetY=0;c.strokeStyle=opts.border||'rgba(255,255,255,.22)';c.lineWidth=opts.line||Math.max(1,h*.004);c.stroke();const pad=h*(opts.pad===undefined?.04:opts.pad);c.save();roundRect(c,-w/2+pad,-h/2+pad,w-2*pad,h-2*pad,Math.max(1,h*.008));c.clip();if(opts.backdrop){c.fillStyle=opts.backdrop;c.fillRect(-w/2+pad,-h/2+pad,w-2*pad,h-2*pad);}fillImage(c,img,-w/2+pad,-h/2+pad,w-2*pad,h-2*pad,'contain');c.restore();c.restore();}
function drawAt(time,canvas=cvs,flattenAlpha=false,look={},sequence=slides,settings=config(),imageFor=imgFromAsset){const c=canvas.getContext('2d',{alpha:true}),W=canvas.width,H=canvas.height;const count=sequence.length;const ds=durations(sequence,settings);const dur=ds.reduce((a,b)=>a+b,0);let idx=0,phase=0,elapsed=Math.max(0,time)%Math.max(.01,dur);for(let i=0;i<count;i++){if(elapsed<ds[i]||i===count-1){idx=i;phase=elapsed/ds[i];break}elapsed-=ds[i];}const trans=Math.min(.8,settings.transition/Math.max(.5,ds[idx]||1));const shift=phase>1-trans?ease((phase-1+trans)/trans):0;const focus=idx+shift;const currentImg=count?imageFor(sequence[idx].id):null;drawBackground(c,W,H,currentImg,settings.bgMode==='transparent'&&!flattenAlpha,settings,imageFor);if(!count){c.fillStyle='#b5c4c3';c.font='500 '+Math.round(W*.027)+'px Arial';c.textAlign='center';c.fillText('AÑADE FOTOGRAFÍAS DESDE LA BIBLIOTECA',W/2,H*.5);c.textAlign='left';return;}
c.save();c.translate((look.x||0)*W*.04,(look.y||0)*H*.04);
const style=settings.style;
if(style==='glass'){
 const glow=c.createRadialGradient(W*.5,H*.48,0,W*.5,H*.48,W*.61);
 glow.addColorStop(0,'#a58bff37');glow.addColorStop(1,'#392a7800');c.fillStyle=glow;c.fillRect(0,0,W,H);
 for(const k of [-3,3,-2,2,-1,1,0]){
  const d=k-shift, depth=Math.min(3,Math.abs(d)), scale=1-depth*.20;
  drawCard(c,imageFor(sequence[wrap(idx+k,count)].id),W*.5+d*W*.23,H*.49+depth*H*.026,
    Math.min(W*.50,H*.74)*scale,H*.79*scale,{paper:'#24253b',backdrop:'#12131c',border:'#b4a1e9',pad:.022,alpha:1-depth*.18,sx:1-depth*.10,rot:d*.022});
 }
}else if(style==='c4'){
// Cinema strip: large central frame, neighboring cards in a horizontal film lane
 const cw=Math.min(W*.59,H*.80),ch=Math.min(H*.79,W*.73);c.strokeStyle='rgba(245,245,237,.14)';c.lineWidth=Math.max(1,W*.001);c.beginPath();c.moveTo(0,H*.10);c.lineTo(W,H*.10);c.moveTo(0,H*.90);c.lineTo(W,H*.90);c.stroke();for(let k=-2;k<=2;k++){const j=idx+k,x=W*.5+(k-shift)*W*.69,alpha=Math.max(0,1-Math.abs(k-shift)*.23),scale=1-Math.abs(k-shift)*.16;drawCard(c,imageFor(sequence[wrap(j,count)].id),x,H*.50,cw*scale,ch*scale,{paper:'#182326',border:'#829698',pad:.025,alpha});}
}else if(style==='c5'){
// Paper stack: foreground card changes with opacity and subtle turn
 const cw=Math.min(W*.65,H*.88),ch=Math.min(H*.82,W*.77);for(let j=3;j>=0;j--){const k=idx+j,delta=j-shift,scale=1-j*.035;drawCard(c,imageFor(sequence[wrap(k,count)].id),W*.5+delta*W*.032,H*.5-delta*H*.025,cw*scale,ch*scale,{rot:delta*.025,alpha:Math.max(.3,1-j*.13),paper:'#eeeae0',backdrop:'#e5e0d5',pad:.035,border:'#b4b5ab'});}
}else if(style==='c6'){
// Perspective stage: theatrical side panels, central hero
 c.strokeStyle='rgba(250,247,230,.18)';c.lineWidth=1;c.beginPath();c.moveTo(W*.10,H*.88);c.lineTo(W*.90,H*.88);c.stroke();for(let k=-2;k<=2;k++){const pos=k-shift,ap=Math.abs(pos),j=wrap(idx+k,count),sc=Math.max(.36,1-ap*.27);const cw=Math.min(W*.59,H*.8)*sc,ch=Math.min(H*.80,W*.7)*sc;drawCard(c,imageFor(sequence[j].id),W*.5+pos*W*.36,H*.5+ap*H*.02,cw,ch,{sx:1-ap*.11,paper:'#172124',border:'#64777d',pad:.03,alpha:Math.max(.10,1-ap*.30)});}
}else if(style==='c7'){
// Architectural Gallery Wall: frame positions on neutral wall, camera traverses horizontally
 const cw=W*.41,ch=Math.min(H*.69,W*.55);c.strokeStyle='rgba(217,215,208,.14)';c.lineWidth=Math.max(1,W*.002);c.beginPath();c.moveTo(0,H*.87);c.lineTo(W,H*.87);c.stroke();for(let k=-3;k<=3;k++){const pos=k-shift,j=wrap(idx+k,count);drawCard(c,imageFor(sequence[j].id),W*.5+pos*W*.48,H*.47+Math.sin(j*.7)*H*.02,cw,ch,{paper:'#dedbd1',backdrop:'#d5d2c7',border:'#d6cec2',pad:.06,alpha:Math.max(.13,1-Math.abs(pos)*.2)});}
}else{
// Orbit: 2D elliptical camera orbit, no synthetic rotation of SKU itself
 const cw=Math.min(W*.57,H*.77),ch=Math.min(H*.75,W*.7);const list=[];for(let k=-3;k<=3;k++){const angle=(k-shift)*.72,depth=Math.cos(angle),sc=.55+.43*(depth+1)/2;list.push({k,depth,x:W*.5+Math.sin(angle)*W*.42,y:H*.5+Math.sin(angle*1.2)*H*.075,s:sc});}list.sort((a,b)=>a.depth-b.depth);for(const p of list){drawCard(c,imageFor(sequence[wrap(idx+p.k,count)].id),p.x,p.y,cw*p.s,ch*p.s,{paper:'#111a1e',border:'#779092',pad:.023,alpha:.33+.67*(p.depth+1)/2});}
}
c.restore();
// Hairline only — export contains no editor chrome, names or UI controls
c.strokeStyle='rgba(229,236,236,.26)';c.lineWidth=Math.max(1,H*.0013);c.beginPath();c.moveTo(W*.13,H*.955);c.lineTo(W*.87,H*.955);c.stroke();c.strokeStyle='#80d8da';c.beginPath();c.moveTo(W*.13,H*.955);c.lineTo(W*(.13+.74*(time/Math.max(.01,dur))%1),H*.955);c.stroke();}
let look={};
function render(){resizeCanvasOnly();drawAt(currentSec,cvs,false,look);$('carouselTime').textContent=currentSec.toFixed(1)+' / '+total().toFixed(1)+' s';$('carouselScrub').value=total()?Math.round(currentSec/total()*1000):0;}
function resizeCanvasOnly(){const [w,h]=nativeSize(config().ratio,config().ratio==='16:9'?960:540);if(cvs.width!==w||cvs.height!==h){cvs.width=w;cvs.height=h;}}
function play(){if(playing){playing=false;cancelAnimationFrame(raf);$('carouselPlay').textContent='▶ Reproducir';return;}if(!slides.length)return S().notify('Añade fotografías al carrusel.');playing=true;started=performance.now()-currentSec*1000;$('carouselPlay').textContent='Ⅱ Pausar';tick();}
function tick(){if(!playing)return;currentSec=((performance.now()-started)/1000)%Math.max(.01,total());render();raf=requestAnimationFrame(tick);}
function slideView(){const body=$('carouselSlides');body.replaceChildren(...slides.map((slide,i)=>{const rec=S()?.media?.find(a=>a.id===slide.id);const row=document.createElement('div');row.className='slide-row';const src=S().mediaURL(rec);const thumbnail=document.createElement('img');thumbnail.src=src;thumbnail.alt='';const name=document.createElement('strong');name.title=rec?.name||slide.id;name.textContent=(i+1)+' · '+name.title.slice(0,22);row.append(thumbnail,name);if(rec?.studioRecipe){const edit=document.createElement('button');edit.textContent='Editar capas';edit.onclick=()=>window.SupremoEstudio.openRecipe(rec);row.append(edit);}const dur=document.createElement('input');dur.type='number';dur.step='.5';dur.min='.5';dur.max='15';dur.value=slide.duration;dur.style.width='65px';dur.onchange=()=>{slide.duration=Math.max(.5,+dur.value||2.5);save();render();};row.appendChild(dur);for(const [label,fn] of [['↑',()=>move(i,-1)],['↓',()=>move(i,1)],['×',()=>{slides.splice(i,1);save();slideView();render()}]]){const btn=document.createElement('button');btn.textContent=label;btn.onclick=fn;row.appendChild(btn);}return row;}));}
function move(i,dir){const k=i+dir;if(k<0||k>=slides.length)return;[slides[i],slides[k]]=[slides[k],slides[i]];save();slideView();render();}
function addMedia(id,{unique=false}={}){if(unique&&slides.some(slide=>slide.id===id))return;if(!S().media.some(a=>a.id===id&&a.type==='image'))return;slides.push({id,duration:config().slideDuration});save();slideView();render();}
function assetChanged(){if(config().bgAsset){backgroundAsset();}render();}
function restore(){const c=S()?.state?.carousel||{},fields={style:'carouselStyle',ratio:'carouselRatio',bgMode:'carouselBgMode',bgColor:'carouselBgColor',bgAsset:'carouselBgAsset',bgAlpha:'carouselBgAlpha',slideDuration:'carouselSlideDuration',transition:'carouselTransition',audio:'carouselAudio',fps:'carouselFPS'};for(const [k,id] of Object.entries(fields))if(c[k]!==undefined)$(id).value=c[k];slides=Array.isArray(c.slides)?c.slides.filter(x=>S().media.some(a=>a.id===x.id)):['965209S7','954108R7','955207S3','984104A3','962703A7'].map(x=>({id:'builtin_'+x,duration:2.5}));$('carouselPaw').checked=c.paw??true;$('carouselTilt').checked=c.tilt??true;applyCarouselPointer();slideView();resize();}
async function exportStill(){
 if(rendering)return;
 if(!slides.length)return S().notify('Sin imágenes');
 const sequence=slides.map(slide=>({...slide})),s=config(),time=currentSec;
 const btn=$('carouselPNG');
 btn.disabled=true;rendering=true;
 try{
   const images=await prepareExportImages(sequence,s);
   const [w,h]=nativeSize(s.ratio,s.ratio==='16:9'?2160:1080);
   const canvas=document.createElement('canvas');
   canvas.width=w;canvas.height=h;
   drawAt(time,canvas,false,{},sequence,s,id=>images.get(id));
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
   if(!blob)throw Error('No se pudo crear el PNG.');
   S().download(blob,'MSCCS_CARRUSEL_'+s.style+'.png');
 }catch(error){S().notify('Error al exportar: '+error.message);}
 finally{rendering=false;btn.disabled=false;}
}
function readData(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});}
async function exportMP4(){
 if(rendering)return;if(!slides.length)return S().notify('Agrega imágenes antes de exportar.');
 if(playing)play();const sequence=slides.map(slide=>({...slide})),s=config(),D=durations(sequence,s).reduce((a,b)=>a+b,0),fps=Math.min(24,s.fps),[w,h]=nativeSize(s.ratio,s.ratio==='16:9'?960:720);
 if(D>32)return S().notify('Para exportación sin servidor limita el carrusel a 32 s.');
 const btn=$('carouselMP4');btn.disabled=true;rendering=true;
 try{
   const rec=S().media.find(x=>x.id===s.audio);const audioFile=(rec&&rec.type==='audio')?await S().assetFile(rec):null;
   const images=await prepareExportImages(sequence,s);
   $('carouselInfo').textContent='Renderizando video desde el lienzo. No es captura de pantalla.';
   const out=await SLOffline.recordVideo({width:w,height:h,duration:D,fps,audioFile,draw:(t,cv)=>drawAt(t*D,cv,true,{},sequence,s,id=>images.get(id)),update:p=>{$('carouselInfo').textContent='Exportación: '+Math.round(p*100)+'%';}});
   S().download(out.blob,'MSCCS_CARRUSEL_'+s.style+'_'+s.ratio.replace(':','x')+'.'+out.extension);
   $('carouselInfo').textContent='Video exportado '+w+'×'+h+' · '+D.toFixed(1)+' s · '+out.extension.toUpperCase()+' · sin servidor.';
 }catch(e){console.error(e);S().notify('Error al exportar: '+e.message);$('carouselInfo').textContent='Error: '+e.message;}
 finally{rendering=false;btn.disabled=false;}
}
function installCarouselGestures(canvas,actions) {
 let start;
 canvas.addEventListener('pointerdown',event=>{
   if(event.button!==0||!actions.duration())return;
   start={id:event.pointerId,x:event.clientX,time:actions.time()};
   canvas.setPointerCapture(event.pointerId);
   actions.pause();
 });
 canvas.addEventListener('pointermove',event=>{
   const rect=canvas.getBoundingClientRect();
   if(start?.id===event.pointerId){
     actions.seek(start.time+(start.x-event.clientX)/Math.max(1,rect.width)*actions.duration());
     return;
   }
   actions.look((event.clientX-rect.left)/Math.max(1,rect.width)-.5,(event.clientY-rect.top)/Math.max(1,rect.height)-.5);
 });
 const release=()=>{start=null;actions.look(0,0);};
 for(const event of ['pointerup','pointercancel','pointerleave','lostpointercapture'])canvas.addEventListener(event,release);
 canvas.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
   event.preventDefault();actions.pause();actions.step(event.key==='ArrowRight'?1:-1);
 });
}
function stepTime(time,step) {
 let cursor=0;
 const starts=durations().map(duration=>{const start=cursor;cursor+=duration;return start;});
 if(!starts.length)return 0;
 const index=starts.findLastIndex(value=>value<=wrap(time,total()));
 return starts[wrap(index+step,starts.length)];
}
async function exportPublic(){
 if(!slides.length)return S().notify('Añade fotos para exportar la galería.');
 const settings=config(),media=new Map();
 let size=0;
 try{
   for(const id of new Set([...slides.map(slide=>slide.id),settings.bgAsset].filter(Boolean))){
     const asset=S().media.find(record=>record.id===id&&record.type==='image');
     if(!asset)throw Error('Falta un recurso de la galería.');
     const file=await S().assetFile(asset);
     if(!file)throw Error('No se pudo leer '+asset.name);
     const buf=await readData(file);size+=buf.length;
     if(size>35e6)throw Error('La galería supera el tamaño máximo del HTML. Reduce el número o tamaño de las imágenes.');
     media.set(id,`data:${file.type};base64,${buf}`);
   }
   const safe=value=>JSON.stringify(value).replace(/</g,'\\u003c');
   const renderer=[durations,total,wrap,ease,nativeSize,backgroundAsset,fillImage,drawBackground,roundRect,drawCard,drawAt,stepTime,installCarouselGestures].map(fn=>fn.toString()).join('\n');
   const doc=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MSCCS · Carrusel</title><style>
body{margin:0;background:#111318;color:#efedf5;font:14px system-ui;min-height:100dvh;display:grid;place-items:center}
main{max-width:100vw;text-align:center}canvas{width:auto;height:auto;max-width:96vw;max-height:86dvh;object-fit:contain;touch-action:pan-y;cursor:grab}button{margin:5px;background:#222535;color:#f6f2fa;border:1px solid #6d7085;padding:7px 16px;border-radius:5px}
${pawRules('body[data-paw="on"] canvas')}
</style></head><body${settings.paw?' data-paw="on"':''}><main><canvas id="stage" tabindex="0" aria-label="Carrusel interactivo. Usa las flechas o arrastra para cambiar de tarjeta"></canvas><div><button id="prev" aria-label="Anterior">←</button><button id="play">Pausar</button><button id="next" aria-label="Siguiente">→</button></div></main><script>
const settings=${safe(settings)},slides=${safe(slides)},resources=${safe([...media])};
const cvs=document.getElementById('stage'),images=new Map(),config=()=>settings;
const imgFromAsset=id=>images.get(id);
${renderer}
const size=nativeSize(settings.ratio,960);cvs.width=size[0];cvs.height=size[1];
let time=0,last=performance.now(),playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,look={};
const button=document.getElementById('play');
function show(){drawAt(time,cvs,false,look);}
function pause(){playing=false;button.textContent='Reproducir';}
function seek(value){time=wrap(value,total()||1);show();}
function step(amount){seek(stepTime(time,amount));}
for(const [id,src] of resources){const image=new Image();images.set(id,image);image.onload=show;image.src=src;}
installCarouselGestures(cvs,{duration:total,time:()=>time,pause,seek,step,look:(x,y)=>{if(settings.tilt){look={x,y};show();}}});
button.textContent=playing?'Pausar':'Reproducir';
button.onclick=()=>{playing=!playing;button.textContent=playing?'Pausar':'Reproducir';};
document.getElementById('prev').onclick=()=>{pause();step(-1);};
document.getElementById('next').onclick=()=>{pause();step(1);};
function tick(now){if(playing)seek(time+Math.min(.1,(now-last)/1000));last=now;requestAnimationFrame(tick);}
requestAnimationFrame(tick);show();
<\/script></body></html>`;
   S().download(new Blob([doc],{type:'text/html'}),'MSCCS_CARRUSEL_PUBLICACION_'+settings.style+'.html');
   S().notify('Galería interactiva HTML exportada.');
 }catch(error){S().notify(error.message);}
}
function applyCarouselPointer(){
  cvs.setAttribute('data-paw',$('carouselPaw').checked?'on':'off');
}
function init(){
  const style=document.createElement('style');
  style.textContent=pawRules('#carouselCanvas[data-paw="on"]');
  document.head?.append(style);
  installCarouselGestures(cvs,{
    duration:total,time:()=>currentSec,pause:()=>{if(playing)play();},
    seek:value=>{currentSec=wrap(value,total()||1);render();},
    step:amount=>{currentSec=stepTime(currentSec,amount);render();},
    look:(x,y)=>{if($('carouselTilt').checked){look={x,y};render();}}
  });
  for(const id of ['carouselPaw','carouselTilt'])$(id).addEventListener('input',()=>{
    look={};applyCarouselPointer();save();render();
  });
  for(const id of ['carouselStyle','carouselRatio','carouselBgMode','carouselBgColor','carouselBgAsset','carouselBgAlpha','carouselSlideDuration','carouselTransition','carouselAudio','carouselFPS'])$(id).addEventListener('input',()=>{save();render();});$('carouselAdd').onclick=()=>{if(!S().selectedMediaId)return S().notify('Selecciona una foto en Biblioteca.');addMedia(S().selectedMediaId);};$('carouselAddMany').onclick=()=>{const arr=(S().libraryImages?.()||S().media.filter(x=>x.type==='image'&&!x.builtin)).slice(0,25);if(!arr.length)return S().notify('Abre una carpeta o busca imágenes en Biblioteca para añadirlas juntas.');for(const a of arr)if(!slides.some(slide=>slide.id===a.id))slides.push({id:a.id,duration:config().slideDuration});save();slideView();render();};$('carouselClear').onclick=()=>{if(confirm('Vaciar la secuencia de carrusel?')){slides=[];save();slideView();render();}};$('carouselPlay').onclick=play;$('carouselPNG').onclick=exportStill;$('carouselMP4').onclick=exportMP4;$('carouselPublic').onclick=exportPublic;$('carouselScrub').oninput=e=>{if(playing)play();currentSec=+e.target.value/1000*total();render();};restore();}
window.CarouselStudio={init,render,restore,assetChanged,addMedia,refreshLinkedSlides(){slideView();render()}};window.addEventListener('supremo-ready',init);
})();
