/* Cámara 2D determinista para conservar geometría de SKU. */
'use strict';
(function(){
const $=id=>document.getElementById(id),S=()=>window.Supremo;
let img=null,revision=null,playing=false,started=0,raf=0,current=0,duration=3,rendering=false;
const FX=window.SLCameraEffects;
const cvs=$('cameraCanvas'),ctx=cvs.getContext('2d');
function dims(ratio,px){const [a,b]=ratio.split(':').map(Number);return {w:Math.round(px),h:Math.round(px*b/a)};}
function preset(){const key=$('cameraPreset').value;const field=(id,val)=>$(id).value=val;if(key==='push'){field('cameraZoomA',1.02);field('cameraZoomB',1.18);field('cameraXA',0);field('cameraXB',0);field('cameraYB',0);field('cameraRot',0);}else if(key==='pull'){field('cameraZoomA',1.20);field('cameraZoomB',1.03);field('cameraXA',0);field('cameraXB',0);field('cameraYB',0);field('cameraRot',0);}else if(key==='panleft'){field('cameraZoomA',1.18);field('cameraZoomB',1.18);field('cameraXA',7);field('cameraXB',-7);field('cameraYB',0);field('cameraRot',0);}else if(key==='panright'){field('cameraZoomA',1.18);field('cameraZoomB',1.18);field('cameraXA',-7);field('cameraXB',7);field('cameraYB',0);field('cameraRot',0);}else if(key==='orbit'){field('cameraZoomA',1.09);field('cameraZoomB',1.13);field('cameraXA',-3);field('cameraXB',3);field('cameraYB',-2);field('cameraRot',2.2);}saveState();render();}
function getSettings(){return {asset:$('cameraAsset').value,ratio:$('cameraRatio').value,effect:FX.settings($('cameraEffect').value,Number($('cameraEffectAmount').value),$('cameraEffectText').value),preset:$('cameraPreset').value,duration:Math.max(.5,Math.min(12,Number($('cameraDuration').value)||3)),zoomA:Number($('cameraZoomA').value)||1,zoomB:Number($('cameraZoomB').value)||1,xA:Number($('cameraXA').value)||0,xB:Number($('cameraXB').value)||0,yB:Number($('cameraYB').value)||0,rot:Number($('cameraRot').value)||0,bg:$('cameraBg').value,scene:$('cameraScene').value,ground:Number($('cameraGround').value)||78,removeWhite:$('cameraWhite').checked,whiteSeeds:pointsByAsset[$('cameraAsset').value]||[],fps:Number($('cameraFPS').value)||12};}
function saveState(){if(!S()?.ready)return;S().state.camera={...getSettings(),whiteMasks:pointsByAsset};S().save();}
function smooth(t){return t*t*(3-2*t);}
const scenes={
  studio:{wall:['#f7f7f0','#cbd2cd'],floor:['#bec7c2','#f2f3eb']},
  concrete:{wall:['#7d8585','#41494b'],floor:['#626c6d','#323d40']},
  platform:{wall:['#273840','#0c151b'],floor:['#34444a','#121f24']},
  exterior:{wall:['#d8e9eb','#f1efdd'],floor:['#b5ad93','#ded3b8']}
};
function prepareSubject(image,removeWhite,seeds=[]){
  const canvas=document.createElement('canvas');
  const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
  const w=canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
  const h=canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  const context=canvas.getContext('2d',{willReadFrequently:true});
  context.drawImage(image,0,0,w,h);
  const frame=context.getImageData(0,0,w,h),pixels=frame.data;
  let hasAlpha=false;
  for(let i=3;i<pixels.length;i+=4)if(pixels[i]<64){hasAlpha=true;break;}
  if((!hasAlpha&&removeWhite)||seeds.length){
    const marked=new Uint8Array(w*h),queue=new Uint32Array(w*h);
    let head=0,tail=0;
    function add(i){
      if(marked[i])return;
      marked[i]=1;
      const j=i*4,lo=Math.min(pixels[j],pixels[j+1],pixels[j+2]),hi=Math.max(pixels[j],pixels[j+1],pixels[j+2]);
      if(pixels[j+3]>=64&&lo>=232&&hi-lo<=14)queue[tail++]=i;
    }
    if(!hasAlpha&&removeWhite){
      for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}
      for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
    }
    for(const point of seeds)add(Math.min(h-1,Math.floor(h*point.y))*w+Math.min(w-1,Math.floor(w*point.x)));
    while(head<tail){
      const i=queue[head++],x=i%w;
      pixels[i*4+3]=0;
      if(x>0)add(i-1);if(x<w-1)add(i+1);
      if(i>=w)add(i-w);if(i+w<w*h)add(i+w);
    }
    hasAlpha=hasAlpha||tail>0;
    if(tail)context.putImageData(frame,0,0);
  }
  if(!hasAlpha)return null;
  let x0=w,y0=h,x1=-1,y1=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    if(pixels[(y*w+x)*4+3]<48)continue;
    x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
  }
  if(x1<x0||y1<y0)return null;
  return {canvas,x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};
}
function drawScene(context,W,H,style,contact){
  const horizon=H*.58;
  const backdrop=context.createLinearGradient(0,0,0,horizon);
  backdrop.addColorStop(0,style.wall[0]);backdrop.addColorStop(1,style.wall[1]);
  context.fillStyle=backdrop;context.fillRect(0,0,W,horizon+1);
  const floor=context.createLinearGradient(0,horizon,0,H);
  floor.addColorStop(0,style.floor[0]);floor.addColorStop(1,style.floor[1]);
  context.fillStyle=floor;context.fillRect(0,horizon,W,H-horizon);
  context.fillStyle='#00000020';context.fillRect(0,horizon,W,Math.max(1,H*.003));
  if(style===scenes.concrete||style===scenes.exterior){
    context.strokeStyle=style===scenes.exterior?'#665c4034':'#e0e4e425';
    context.lineWidth=Math.max(1,W*.0015);context.beginPath();
    for(const x of [-.42,.27,.74,1.42]){
      context.moveTo(W*(.5+(x-.5)*.19),horizon);
      context.lineTo(W*x,H);
    }
    context.moveTo(0,H*.85);context.lineTo(W,H*.85);context.stroke();
  }
  if(style===scenes.platform){
    context.fillStyle='#1e282e';
    context.fillRect(W*.16,contact-H*.006,W*.68,H*.058);
    context.fillStyle='#52646a';context.beginPath();
    context.ellipse(W*.5,contact,W*.34,H*.052,0,0,Math.PI*2);context.fill();
  }
}
let subject=null,placement=null,markWhite=false;
const pointsByAsset=Object.create(null);
function updateSubject(){
  subject=null;
  const settings=getSettings();
  if(!img||settings.scene==='flat')return;
  try{subject=prepareSubject(img,settings.removeWhite,settings.whiteSeeds);}catch(error){console.warn('Recorte de Cámara',error);}
  $('cameraSceneInfo').textContent=subject?'Escenario aplicado al recorte. Ajusta el apoyo si hace falta.':
    'Este recurso conserva su fondo. Usa un PNG transparente o una foto con fondo blanco uniforme.';
}
function drawAt(t,canvas=cvs,s=getSettings(),image=img,cutout=subject){
  const c=canvas.getContext('2d',{alpha:false});
  const frame=image&&FX.layout(canvas.width,canvas.height,s.effect);
  if(!frame){
    drawComposition(t,c,canvas.width,canvas.height,s,image,cutout,canvas===cvs);
    return;
  }
  c.fillStyle='#17252b';
  c.fillRect(0,0,canvas.width,canvas.height);
  c.save();
  c.translate(frame.x,frame.y);
  c.beginPath();c.rect(0,0,frame.width,frame.height);c.clip();
  drawComposition(t,c,frame.width,frame.height,s,image,cutout,canvas===cvs,frame);
  c.restore();
  FX.draw(c,frame,s.effect,t);
}
function drawComposition(t,c,W,H,s,image,cutout,isPreview,frame){
  c.fillStyle=s.bg;c.fillRect(0,0,W,H);
  const style=scenes[s.scene],contact=H*s.ground/100;
  if(style)drawScene(c,W,H,style,contact);
  if(isPreview)placement=null;
  if(!image)return;
  const k=smooth(Math.max(0,Math.min(1,t)));
  const zoom=s.zoomA+(s.zoomB-s.zoomA)*k,panX=s.xA+(s.xB-s.xA)*k,panY=s.yB*k;
  if(style&&cutout){
    const requested=Math.min(W*.71/cutout.w,H*.57/cutout.h)*zoom;
    const factor=frame?Math.max(0,Math.min(requested,W/cutout.w,H/cutout.h)):requested;
    const width=cutout.w*factor,height=cutout.h*factor;
    const x=W/2+W*panX/100,y=contact+H*panY/100;
    const center=frame?Math.max(width/2,Math.min(W-width/2,x)):x;
    const bottom=frame?Math.max(height,Math.min(H,y)):y;
    if(isPreview)placement={left:(frame?.x??0)+center-width/2,top:(frame?.y??0)+bottom-height,width,height};
    c.save();c.translate(center,bottom);
    const radius=Math.max(1,width*.42);
    c.save();c.scale(1,.15);const shade=c.createRadialGradient(0,0,0,0,0,radius);
    shade.addColorStop(0,'#13181185');shade.addColorStop(1,'#13181100');
    c.fillStyle=shade;c.fillRect(-radius,-radius,radius*2,radius*2);c.restore();
    c.drawImage(cutout.canvas,cutout.x,cutout.y,cutout.w,cutout.h,-width/2,-height,width,height);
    c.restore();return;
  }
  const base=Math.min(W/image.naturalWidth,H/image.naturalHeight);
  let sw=image.naturalWidth*base*zoom,sh=image.naturalHeight*base*zoom;
  let x=W/2+W*panX/100,y=H/2+H*panY/100;
  const angle=s.rot*k*Math.PI/180;
  if(frame){
    const cos=Math.abs(Math.cos(angle)),sin=Math.abs(Math.sin(angle));
    const boundsW=sw*cos+sh*sin,boundsH=sw*sin+sh*cos;
    const fit=Math.min(1,W/boundsW,H/boundsH);
    const halfW=boundsW*fit/2,halfH=boundsH*fit/2;
    sw*=fit;sh*=fit;
    x=Math.max(halfW,Math.min(W-halfW,x));
    y=Math.max(halfH,Math.min(H-halfH,y));
  }
  c.save();c.translate(x,y);c.rotate(angle);
  c.drawImage(image,-sw/2,-sh/2,sw,sh);c.restore();
}
function render(){duration=getSettings().duration;const d=dims($('cameraRatio').value,540);if(cvs.width!==d.w||cvs.height!==d.h){cvs.width=d.w;cvs.height=d.h;}drawAt(current);$('cameraTime').textContent=(current*duration).toFixed(1)+' s';$('cameraScrub').value=Math.round(current*1000);}
function assetChanged(){
 const rec=S()?.media?.find(x=>x.id===$('cameraAsset').value);
 const src=S()?.mediaURL(rec)||'';
 if(src&&revision?.src===src&&revision.id===rec.id)return;
 revision=null;img=null;subject=null;placement=null;markWhite=false;
 $('cameraMarkWhite').setAttribute('aria-pressed','false');
 if(src){
   const image=new Image();
   const entry={id:rec.id,src};
   revision=entry;
   entry.loaded=new Promise(resolve=>{
     image.onload=()=>resolve(image);
     image.onerror=()=>resolve(null);
   });
   entry.loaded.then(loaded=>{
     if(revision!==entry)return;
     img=loaded;
     if(loaded)updateSubject();
     else {revision=null;S().notify('Imagen no disponible: '+rec.name);}
     render();
   });
   image.src=src;
 }
 render();
}
function play(){playing=!playing;if(playing){started=performance.now()-current*getSettings().duration*1000;$('cameraPlay').textContent='Ⅱ Pausar';tick();}else{$('cameraPlay').textContent='▶ Previsualizar';cancelAnimationFrame(raf);}}
function tick(){if(!playing)return;const s=getSettings(),t=((performance.now()-started)/1000)/s.duration;current=t%1;render();raf=requestAnimationFrame(tick);}
async function exportFrames(kind){
 if(rendering)return;
 assetChanged();
 if(!revision)return S().notify('Selecciona una imagen primero.');
 const entry=revision,s=getSettings(),position=current;
 const previewImage=img,previewSubject=subject;
 const fps=Math.min(s.fps,kind==='gif'?12:24);
 const width=kind==='png'?2160:kind==='gif'?320:s.ratio==='16:9'?960:720;
 const d=dims(s.ratio,width),name='MSCCS_CAMERA_'+s.ratio.replace(':','x');
 const buttons=['cameraStill','cameraGif','cameraMP4'].map($);
 rendering=true;
 for(const button of buttons)button.disabled=true;
 try{
   $('cameraInfo').textContent='Preparando la imagen para exportar…';
   const image=await entry.loaded;
   if(!image)throw Error('No se pudo cargar la imagen seleccionada.');
   const cutout=previewImage===image?previewSubject:
     (s.scene==='flat'?null:prepareSubject(image,s.removeWhite,s.whiteSeeds));
   const draw=(t,c)=>drawAt(t,c,s,image,cutout);
   if(kind==='png'){
     const canvas=document.createElement('canvas');
     canvas.width=d.w;canvas.height=d.h;
     draw(position,canvas);
     const file=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
     if(!file)throw Error('No se pudo crear el PNG.');
     S().download(file,name+'.png');
   }else{
     const label=kind==='gif'?'GIF':'Video';
     const options={width:d.w,height:d.h,duration:s.duration,fps,draw,
       update:p=>{$('cameraInfo').textContent=label+': '+Math.round(p*100)+'%';}};
     if(kind==='gif')S().download(await SLOffline.renderGif(options),name+'.gif');
     else{
       const out=await SLOffline.recordVideo(options);
       S().download(out.blob,name+'.'+out.extension);
     }
   }
   $('cameraInfo').textContent='Exportado desde fotogramas del lienzo, sin grabar la pantalla ni usar servidor.';
 }catch(error){
   S().notify('No se pudo exportar: '+error.message);
   $('cameraInfo').textContent='Error: '+error.message;
 }finally{
   rendering=false;
   for(const button of buttons)button.disabled=false;
 }
}
function syncEffect(){
  const id=$('cameraEffect').value;
  $('cameraEffectAmount').disabled=id==='none';
  $('cameraEffectText').disabled=!['dayDial','commentDrop','sketchWords','pressFront'].includes(id);
}
function restore(){const s=S()?.state?.camera||{};
const effect=FX.settings(s.effect?.id,s.effect?.amount,s.effect?.text);
$('cameraEffect').value=effect.id;
$('cameraEffectAmount').value=effect.amount;
$('cameraEffectText').value=effect.text;
syncEffect();const ids={asset:'cameraAsset',ratio:'cameraRatio',preset:'cameraPreset',duration:'cameraDuration',zoomA:'cameraZoomA',zoomB:'cameraZoomB',xA:'cameraXA',xB:'cameraXB',yB:'cameraYB',rot:'cameraRot',bg:'cameraBg',scene:'cameraScene',ground:'cameraGround',fps:'cameraFPS'};for(const [k,id] of Object.entries(ids))if(s[k]!=null)$(id).value=s[k];$('cameraWhite').checked=s.removeWhite??true;
for(const key of Object.keys(pointsByAsset))delete pointsByAsset[key];
const saved=s.whiteMasks&&typeof s.whiteMasks==='object'?s.whiteMasks:(s.asset?{[s.asset]:s.whiteSeeds}:{});
for(const [key,points] of Object.entries(saved))if(Array.isArray(points)){
  pointsByAsset[key]=points.filter(p=>p&&[p.x,p.y].every(v=>Number.isFinite(v)&&v>=0&&v<=1)).slice(0,24);
}
assetChanged();updateSubject();render();}
function init(){
 $('cameraMarkWhite').onclick=()=>{
   if(!subject||!placement)return S().notify('Selecciona un escenario y una imagen recortable.');
   if(playing)play();markWhite=!markWhite;
   $('cameraMarkWhite').setAttribute('aria-pressed',String(markWhite));
   $('cameraSceneInfo').textContent=markWhite?'Haz clic sobre el blanco del hueco.':'Selección cancelada.';
 };
 $('cameraResetWhite').onclick=()=>{
   delete pointsByAsset[$('cameraAsset').value];updateSubject();render();saveState();
 };
 cvs.addEventListener('click',event=>{
   if(!markWhite||!subject||!placement)return;
   markWhite=false;$('cameraMarkWhite').setAttribute('aria-pressed','false');
   const rect=cvs.getBoundingClientRect();
   const x=((event.clientX-rect.left)/rect.width*cvs.width-placement.left)/placement.width;
   const y=((event.clientY-rect.top)/rect.height*cvs.height-placement.top)/placement.height;
   if(x<0||x>=1||y<0||y>=1)return;
   const px=subject.x+Math.floor(x*subject.w),py=subject.y+Math.floor(y*subject.h);
   const [r,g,b,alpha]=subject.canvas.getContext('2d').getImageData(px,py,1,1).data;
   if(alpha<64||Math.min(r,g,b)<232||Math.max(r,g,b)-Math.min(r,g,b)>14){
     $('cameraSceneInfo').textContent='Marca un píxel blanco del hueco.';return;
   }
   const id=$('cameraAsset').value,points=pointsByAsset[id]||[];
   if(points.length>=24)return S().notify('Se alcanzó el máximo de huecos marcados para esta imagen.');
   pointsByAsset[id]=[...points,{x:(px+.5)/subject.canvas.width,y:(py+.5)/subject.canvas.height}];
   updateSubject();render();saveState();
 });
 for(const id of ['cameraEffect','cameraEffectAmount','cameraEffectText','cameraAsset','cameraRatio','cameraDuration','cameraZoomA','cameraZoomB','cameraXA','cameraXB','cameraYB','cameraRot','cameraBg','cameraFPS','cameraScene','cameraGround','cameraWhite'])$(id).addEventListener('input',()=>{if(id==='cameraEffect')syncEffect();if(id==='cameraAsset')assetChanged();if(id==='cameraScene'||id==='cameraWhite'){updateSubject();if(getSettings().scene==='flat')$('cameraSceneInfo').textContent='';}render();saveState();});$('cameraPreset').onchange=preset;$('cameraPlay').onclick=play;$('cameraStill').onclick=()=>exportFrames('png');$('cameraGif').onclick=()=>exportFrames('gif');$('cameraMP4').onclick=()=>exportFrames('mp4');$('cameraScrub').oninput=e=>{if(playing)play();current=+e.target.value/1000;render();};restore();}
window.CameraStudio={init,render,restore,assetChanged};window.addEventListener('supremo-ready',init);
})();
