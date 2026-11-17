/* Compositor de planos reales y doce efectos temporales. Canvas local, sin dependencias. */
'use strict';
(function(root){
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const labels={cloneRow:'Clones del recorte',orbitRing:'Órbita con oclusión',codeBody:'Caracteres del recorte',postWall:'Muro de Biblioteca',letterDive:'Transición por letra',layerExplode:'Separación de capas',bladeSlice:'Corte de transición',rackFocus:'Enfoque por planos',voiceNote:'Nota de voz real',dollyZoom:'Dolly de dos planos',paperTear:'Rasgado con semilla',blowAway:'Dispersión de capa'};
 function random(seed){let n=Number(seed)>>>0;return()=>{n+=0x6D2B79F5;let x=n;x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return ((x^x>>>14)>>>0)/4294967296;};}
 function keyframe(keys,time){
  if(!Array.isArray(keys)||!keys.length)return {x:0,y:0,scale:1,rotation:0,opacity:1};
  const valid=keys.filter(k=>Number.isFinite(k.time)).slice().sort((a,b)=>a.time-b.time);
  if(!valid.length)return keyframe([],time);
  let a=valid[0],b=valid.at(-1);for(let i=1;i<valid.length;i++)if(time<valid[i].time){a=valid[i-1];b=valid[i];break;}
  if(time>=valid.at(-1).time)a=b=valid.at(-1);
  const t=clamp((time-a.time)/(b.time-a.time||1)),u=b.ease==='linear'?t:t*t*(3-2*t),out={};
  for(const [key,def] of Object.entries({x:0,y:0,scale:1,rotation:0,opacity:1}))out[key]=(Number.isFinite(a[key])?a[key]:def)*(1-u)+(Number.isFinite(b[key])?b[key]:def)*u;
  return out;
 }
 function mask(ctx,m,w,h){
  if(!m||m.type==='none')return;ctx.beginPath();
  const x=clamp(Number(m.x)||0)*w,y=clamp(Number(m.y)||0)*h,mw=clamp(Number(m.w)||1)*w,mh=clamp(Number(m.h)||1)*h;
  if(m.type==='ellipse')ctx.ellipse(x+mw/2,y+mh/2,mw/2,mh/2,0,0,Math.PI*2);
  else if(m.type==='polygon'&&m.points?.length>=3){m.points.slice(0,512).forEach((p,i)=>ctx[i?'lineTo':'moveTo'](clamp(p.x)*w,clamp(p.y)*h));ctx.closePath();}
  else if(m.type==='rect')ctx.rect(x,y,mw,mh);else return;
  ctx.clip();
 }
 function plane(ctx,p,w,h,time=0,options={}){
  if(!p.image||p.visible===false)return;const k=keyframe(p.keyframes,time);
  ctx.save();ctx.globalAlpha*=clamp(k.opacity)*(options.opacity??1);ctx.translate(w/2+k.x*w,h/2+k.y*h);ctx.rotate(k.rotation*Math.PI/180);
  const s=clamp(k.scale,.01,10)*(options.scale??1);ctx.scale(s,s);ctx.translate(-w/2,-h/2);if(options.dx||options.dy)ctx.translate(options.dx||0,options.dy||0);
  if(options.blur)ctx.filter=`blur(${options.blur}px)`;mask(ctx,p.mask,w,h);ctx.drawImage(p.image,0,0,w,h);ctx.restore();
 }
 function flat(ctx,scene,w,h,time,filter=()=>true){for(const p of scene.planes||[])if(filter(p))plane(ctx,p,w,h,time);}
 function capabilities(scene,id,extra={}){
  if(!scene?.planes?.length)return 'Primero envía una composición con sus capas desde Estudio.';
  const has=role=>scene.planes.some(p=>p.role===role&&p.image);
  if(['cloneRow','orbitRing','codeBody','rackFocus','dollyZoom','blowAway'].includes(id)&&!has('product'))return 'Este efecto necesita un producto o sujeto recortado en Estudio.';
  if(['letterDive','bladeSlice','paperTear'].includes(id)&&!extra.next)return 'Este efecto necesita un clip siguiente cargado.';
  if(id==='postWall'&&!extra.gallery?.length)return 'Carga imágenes reales en Medios para crear el muro.';
  if(id==='voiceNote'&&!extra.waveform?.length)return 'Importa un audio y calcula su onda con Analizar audio.';
  return '';
 }
 function peaks(channels,bins=128){
  const n=channels?.[0]?.length||0;if(!n)return[];const count=Math.min(n,Math.max(1,Math.floor(bins))),out=[];
  for(let b=0;b<count;b++){let value=0;for(const channel of channels)for(let i=Math.floor(b*n/count);i<Math.floor((b+1)*n/count);i++)value=Math.max(value,Math.abs(channel[i]||0));out.push(clamp(value));}return out;
 }
 function render(ctx,scene,{id='none',amount=65,text='',seed=1,time=0,duration=3,next,gallery=[],waveform=[],waveformProgress}={}){
  const w=ctx.canvas.width,h=ctx.canvas.height,t=clamp(time/Math.max(.01,duration)),power=clamp(Number(amount)/100),extra={next,gallery,waveform};
  const error=id==='none'?'':capabilities(scene,id,extra);if(error)throw Error(error);
  ctx.clearRect(0,0,w,h);if(id==='none'||!power){flat(ctx,scene,w,h,time);return;}
  const subject=scene.planes.filter(p=>p.role==='product'),back=scene.planes.filter(p=>p.role==='background'),front=scene.planes.filter(p=>!['background','product'].includes(p.role));
  const group=items=>items.forEach(p=>plane(ctx,p,w,h,time));
  const baseline=()=>flat(ctx,scene,w,h,time);
  if(['letterDive','bladeSlice','paperTear'].includes(id)){
    baseline();if(t===0)return;if(t===1){ctx.clearRect(0,0,w,h);ctx.drawImage(next,0,0,w,h);return;}
    ctx.save();ctx.beginPath();
    if(id==='letterDive'){
      ctx.save();ctx.font=`900 ${Math.max(w,h)*(0.06+8*t*t)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
      // Text is a real alpha mask, then the next revision is composited through it.
      const c=root.document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.font=ctx.font;g.textAlign='center';g.textBaseline='middle';g.fillText(Array.from(text||'A')[0],w/2,h/2);g.globalCompositeOperation='source-in';g.drawImage(next,0,0,w,h);ctx.drawImage(c,0,0);ctx.restore();
    }else{
      const rng=random(seed),points=36,edge=w*t;
      ctx.moveTo(0,0);ctx.lineTo(edge,0);
      for(let i=0;i<=points;i++){const y=i*h/points,x=id==='bladeSlice'?edge+(y-h/2)*.25:edge+(rng()-.5)*w*.05*power;ctx.lineTo(x,y);}
      ctx.lineTo(0,h);ctx.closePath();ctx.clip();ctx.drawImage(next,0,0,w,h);
    }ctx.restore();return;
  }
  if(id==='postWall'){
    const cols=3,rows=3,cw=w/cols,ch=h/rows;
    for(let i=0;i<cols*rows;i++){
      const img=gallery[i%gallery.length];if(!img)continue;const x=i%cols*cw,y=Math.floor(i/cols)*ch;
      const pad=Math.min(w,h)*.01*(1+power*Math.sin(t*Math.PI));ctx.save();ctx.beginPath();ctx.rect(x+pad,y+pad,cw-2*pad,ch-2*pad);ctx.clip();const k=Math.min((cw-2*pad)/img.width,(ch-2*pad)/img.height);ctx.drawImage(img,x+(cw-img.width*k)/2,y+(ch-img.height*k)/2,img.width*k,img.height*k);ctx.restore();
    }group(front);return;
  }
  if(id==='layerExplode'){
    const spread=(t===0||t===1?0:Math.sin(Math.PI*t))*power;
    (scene.planes||[]).forEach((p,i)=>plane(ctx,p,w,h,time,{dx:(i-(scene.planes.length-1)/2)*w*.09*spread,dy:(i%2?1:-1)*h*.04*spread}));return;
  }
  if(id==='dollyZoom'){
    back.forEach(p=>plane(ctx,p,w,h,time,{scale:1+power*.35*Math.sin(Math.PI*t)}));group(subject);group(front);return;
  }
  if(id==='rackFocus'){
    const phase=(1-Math.cos(t*Math.PI))/2;
    back.forEach(p=>plane(ctx,p,w,h,time,{blur:phase*power*12}));subject.forEach(p=>plane(ctx,p,w,h,time,{blur:(1-phase)*power*12}));group(front);return;
  }
  if(id==='blowAway'&&(t===0||t===1)){baseline();return;}
  group(back);
  if(id==='cloneRow'){
    for(const offset of [-1,1])subject.forEach(p=>plane(ctx,p,w,h,time,{dx:offset*w*.2*power*Math.sin(t*Math.PI),opacity:.5*power}));group(subject);
  }else if(id==='orbitRing'){
    const r=Math.min(w,h)*.36,cy=h*.5;
    const orbit=(frontHalf)=>{ctx.save();ctx.font=`700 ${Math.min(w,h)*.04}px sans-serif`;ctx.textAlign='center';ctx.fillStyle='#f0c47b';const chars=Array.from(text||'TU PRÓXIMO PROYECTO');for(let i=0;i<chars.length;i++){const a=i/Math.max(1,chars.length)*Math.PI*2+t*Math.PI*2;if((Math.sin(a)>=0)!==frontHalf)continue;ctx.fillText(chars[i],w/2+Math.cos(a)*r,cy+Math.sin(a)*r*.4);}ctx.restore();};
    orbit(false);group(subject);orbit(true);
  }else if(id==='codeBody'){
    const proxy=root.document.createElement('canvas');proxy.width=64;proxy.height=Math.max(1,Math.round(h/w*64));const g=proxy.getContext('2d');subject.forEach(p=>plane(g,p,proxy.width,proxy.height,time));const pixels=g.getImageData(0,0,proxy.width,proxy.height).data,chars=Array.from(text||' .:-=+*#%@');
    ctx.font=`${w/64*1.25}px monospace`;ctx.textBaseline='top';for(let y=0;y<proxy.height;y++)for(let x=0;x<64;x++){const n=(y*64+x)*4;if(pixels[n+3]<64)continue;const l=(pixels[n]+pixels[n+1]+pixels[n+2])/765;ctx.fillStyle=`rgb(${pixels[n]},${pixels[n+1]},${pixels[n+2]})`;ctx.fillText(chars[(Math.min(chars.length-1,Math.floor(l*chars.length))+Math.floor(t*8))%chars.length],x*w/64,y*h/proxy.height);}
  }else if(id==='blowAway'){
    const proxy=root.document.createElement('canvas');proxy.width=48;proxy.height=Math.max(1,Math.round(h/w*48));const g=proxy.getContext('2d');subject.forEach(p=>plane(g,p,proxy.width,proxy.height,time));const pixels=g.getImageData(0,0,proxy.width,proxy.height).data,rng=random(seed),p=Math.sin(t*Math.PI)*power;
    for(let y=0;y<proxy.height;y++)for(let x=0;x<48;x++){const i=(y*48+x)*4,dx=rng()*w*.6,dy=(rng()-.5)*h*.5;if(pixels[i+3]<32)continue;ctx.fillStyle=`rgba(${pixels[i]},${pixels[i+1]},${pixels[i+2]},${pixels[i+3]/255})`;ctx.fillRect(x*w/48+dx*p,y*h/proxy.height+dy*p,w/48+1,h/proxy.height+1);}
    if(t===0||t===1){group(subject);}
  }else group(subject);
  group(front);
  if(id==='voiceNote'){
    const y=h*.87,left=w*.1,width=w*.8;ctx.save();ctx.fillStyle='#122c30ee';ctx.fillRect(left,y-h*.07,width,h*.14);
    const count=waveform.length;for(let i=0;i<count;i++){const amp=clamp(waveform[i])*h*.05;ctx.strokeStyle=i/count<=(Number.isFinite(waveformProgress)?clamp(waveformProgress):t)?'#f0c47b':'#b5c4bc';ctx.lineWidth=Math.max(1,width/count*.5);ctx.beginPath();ctx.moveTo(left+i/count*width,y-amp);ctx.lineTo(left+i/count*width,y+amp);ctx.stroke();}ctx.restore();
  }
 }
 async function decode(raw,ImageClass=root.Image){
  if(!raw||raw.version!==1||!Number.isInteger(raw.width)||!Number.isInteger(raw.height)||raw.width<1||raw.height<1||raw.width>4096||raw.height>4096||!Array.isArray(raw.planes)||raw.planes.length>110)throw Error('Escena multicapa incompatible');
  if(raw.width*raw.height*raw.planes.length>96000000)throw Error('La escena supera el presupuesto de memoria. Reduce resolución o cantidad de capas.');
  const planes=[];for(const item of raw.planes){
    if(typeof item.src!=='string'||!item.src.startsWith('data:image/png;base64,')||item.src.length>35*1024*1024)throw Error('Plano local inválido');
    const image=await new Promise((resolve,reject)=>{const im=new ImageClass();im.onload=()=>im.width===raw.width&&im.height===raw.height?resolve(im):reject(Error('Las dimensiones del plano no coinciden')); im.onerror=()=>reject(Error('No se pudo cargar un plano'));im.src=item.src;});planes.push({...item,image});
  }return {...raw,planes};
 }
 root.SLLayerMotion={labels,random,keyframe,mask,plane,flat,render,peaks,decode,capabilities};
})(typeof window==='undefined'?globalThis:window);
