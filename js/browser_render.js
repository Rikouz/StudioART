/* SUPREMO LIDER v1.2 — GIF89a + MediaRecorder. Todo en navegador, sin servidor ni comandos. */
'use strict';
(function(){
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const u16=(n)=>[n&255,(n>>>8)&255];
function gifLZW(indices){
 const CLEAR=256,END=257,LIMIT=4096;
 let dict=new Map(),next=258,codeSize=9,bits=0,bitCount=0,bytes=[];
 function emit(code){bits|=(code<<bitCount);bitCount+=codeSize;while(bitCount>=8){bytes.push(bits&255);bits>>>=8;bitCount-=8;}}
 function reset(){dict=new Map();next=258;codeSize=9;}
 emit(CLEAR);
 if(indices.length){
   let current=indices[0];
   for(let i=1;i<indices.length;i++){
     const value=indices[i],key=current*256+value;
     if(dict.has(key)){current=dict.get(key);continue;}
     emit(current);
     if(next<LIMIT){dict.set(key,next++);if(next>(1<<codeSize)&&codeSize<12)codeSize++;}
     else {emit(CLEAR);reset();}
     current=value;
   }
   emit(current);
 }
 emit(END);if(bitCount>0)bytes.push(bits&255);
 const chunks=[];for(let i=0;i<bytes.length;i+=255){const part=bytes.slice(i,i+255);chunks.push(part.length,...part);}
 chunks.push(0);return new Uint8Array(chunks);
}
function colors(imageData){
 const rgba=imageData.data, pixels=new Uint8Array(imageData.width*imageData.height);
 for(let i=0,j=0;i<rgba.length;i+=4,j++)pixels[j]=(rgba[i]&224)|((rgba[i+1]&224)>>>3)|(rgba[i+2]>>>6);
 return pixels;
}
async function renderGif({draw,duration=3,fps=10,width=360,height=640,update=()=>{}}){
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{willReadFrequently:true});
 const output=[];const header=[71,73,70,56,57,97,...u16(width),...u16(height),0xF7,0,0];
 const palette=[];for(let i=0;i<256;i++){palette.push(Math.round((i>>5)*255/7),Math.round(((i>>2)&7)*255/7),Math.round((i&3)*255/3));}
 output.push(new Uint8Array(header),new Uint8Array(palette),new Uint8Array([33,255,11,...'NETSCAPE2.0'.split('').map(x=>x.charCodeAt(0)),3,1,0,0,0]));
 const count=Math.max(2,Math.min(90,Math.round(duration*fps))),delay=Math.max(2,Math.round(100/fps));
 for(let n=0;n<count;n++){
   draw(n/(count-1),canvas);const indices=colors(ctx.getImageData(0,0,width,height));
   output.push(new Uint8Array([33,249,4,0,...u16(delay),0,0,44,0,0,0,0,...u16(width),...u16(height),0,8]));
   output.push(gifLZW(indices));update((n+1)/count);
   if(n%2===0)await sleep(0);
 }
 output.push(new Uint8Array([59]));return new Blob(output,{type:'image/gif'});
}
function mime(){
 if(!window.MediaRecorder)return null;
 for(const value of ['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm']){
   if(MediaRecorder.isTypeSupported(value))return value;
 }
 return null;
}
async function recordVideo({draw,duration=3,fps=15,width=720,height=1280,update=()=>{},audioFile=null}){
 const type=mime();if(!type)throw new Error('El navegador no admite MediaRecorder: prueba Chrome o Edge actualizado.');
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 // captureStream(0) + requestFrame hace que el canvas sea la fuente de vídeo, no la pantalla.
 const stream=canvas.captureStream(0),vt=stream.getVideoTracks()[0];
 const mux=new MediaStream();mux.addTrack(vt);
 let audio=null,context=null,objectURL=null;
 try {
   if(audioFile){
     objectURL=URL.createObjectURL(audioFile);audio=document.createElement('audio');audio.src=objectURL;audio.loop=true;
     context=new (window.AudioContext||window.webkitAudioContext)();
     const source=context.createMediaElementSource(audio),dest=context.createMediaStreamDestination();source.connect(dest);source.connect(context.destination);
     dest.stream.getAudioTracks().forEach(t=>mux.addTrack(t));await context.resume();
   }
   draw(0,canvas);vt.requestFrame?.();
   const chunks=[];const rec=new MediaRecorder(mux,{mimeType:type,videoBitsPerSecond:5000000});
   const done=new Promise((resolve,reject)=>{rec.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data);};rec.onerror=e=>reject(e.error||new Error('MediaRecorder falló'));rec.onstop=()=>resolve(new Blob(chunks,{type}));});
   rec.start(200);if(audio)await audio.play();
   const started=performance.now(),n=Math.max(2,Math.round(duration*fps));
   for(let i=0;i<n;i++){
     const goal=started+1000*i/fps;const wait=goal-performance.now();if(wait>0)await sleep(wait);
     draw(i/(n-1),canvas);vt.requestFrame?.();update((i+1)/n);
   }
   await sleep(Math.max(50,1000/fps));rec.stop();const blob=await done;
   if(!blob.size)throw Error('Grabación vacía.');
   return {blob,extension:type.startsWith('video/mp4')?'mp4':'webm',mime:type};
 } finally {
   if(audio){audio.pause();audio.removeAttribute('src');}
   if(context)await context.close().catch(()=>{});
   if(objectURL)URL.revokeObjectURL(objectURL);mux.getTracks().forEach(t=>t.stop());stream.getTracks().forEach(t=>t.stop());
 }
}
window.SLOffline={renderGif,recordVideo,supportedMime:mime};
})();
