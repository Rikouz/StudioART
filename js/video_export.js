/* Preparación offline de imágenes y primer fotograma antes de grabar. */
'use strict';
(function(root){
 function image(url,{ImageClass=root.Image,timeout=15000}={}){
  return new Promise((resolve,reject)=>{
   const bitmap=new ImageClass();let timer;
   const finish=(error)=>{clearTimeout(timer);bitmap.onload=null;bitmap.onerror=null;error?reject(error):resolve(bitmap);};
   bitmap.onload=()=>finish(bitmap.naturalWidth?null:Error('Imagen vacía'));
   bitmap.onerror=()=>finish(Error('No se pudo cargar una imagen de Video'));
   timer=setTimeout(()=>finish(Error('La carga de imagen agotó el tiempo de espera')),timeout);bitmap.src=url;
  });
 }
 async function prepareImages(clips,getAsset,cache,options){
  const chosen=clips.map(clip=>getAsset(clip.assetId)).filter(a=>a?.type==='image');
  const unique=[...new Map(chosen.map(a=>[a.id,{id:a.id,url:a.url}])).values()];
  // Sequential decode caps concurrent memory; dimensions remain those of the original resource.
  for(const a of unique){const bitmap=await image(a.url,options);if(getAsset(a.id)?.url!==a.url)throw Error('La revisión cambió durante la preparación de Video');cache.set(a.url,bitmap);}
  return unique;
 }
 function firstVideoFrame(video,time,{timeout=15000}={}){
  return new Promise((resolve,reject)=>{
   const started=Date.now();let timer,stopped=false;
   const finish=error=>{if(stopped)return;stopped=true;clearTimeout(timer);error?reject(error):resolve();};
   function check(){
    if(video.error)return finish(Error('No se pudo abrir el video de origen'));
    if(Date.now()-started>timeout)return finish(Error('No se pudo preparar el primer fotograma de Video'));
    if(video.readyState>=1&&Math.abs(video.currentTime-time)>.025&&!video.seeking){video.currentTime=time;}
    if(video.readyState>=2&&!video.seeking&&Math.abs(video.currentTime-time)<=.025)return finish();
    timer=setTimeout(check,16);
   }check();
  });
 }
 function gains(clip,track){
  const a=Math.max(0,Math.min(1,Number(clip)||0)),b=Math.max(0,Math.min(1,Number(track)||0)),factor=Math.min(1,.95/Math.max(.95,a+b));
  return {clip:a*factor,track:b*factor};
 }
 root.SLVideoExport={image,prepareImages,firstVideoFrame,gains};
})(typeof window==='undefined'?globalThis:window);
