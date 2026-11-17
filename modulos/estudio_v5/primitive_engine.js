/* Motor propio de primitivas v2: búsqueda incremental, rotación y ajuste alfa. */
'use strict';
(function(root){
function* solve(input){
  const {w,h,data}=input;
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w>256||h>256||data.length!==w*h*4)throw Error('Proxy de primitivas inválido');
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  let seed=(Number(input.seed)>>>0)||1;
  const random=()=>{seed+=0x6D2B79F5;let t=seed;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
  const target=new Float64Array(w*h*3),raster=new Float64Array(w*h*3),mean=[0,0,0];
  for(let i=0;i<w*h;i++)for(let k=0;k<3;k++){
    const a=data[i*4+3]/255,v=data[i*4+k]*a+255*(1-a);
    target[i*3+k]=v;mean[k]+=v/(w*h);
  }
  const colorHex=c=>'#'+c.map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
  const base=mean.map(Math.round);for(let i=0;i<raster.length;i++)raster[i]=base[i%3];
  const error=()=>target.reduce((n,v,i)=>n+(v-raster[i])**2,0);
  const initialError=error(),shapes=[];
  const count=clamp(Math.floor(Number(input.count)||96),1,512);
  const candidates=clamp(Math.floor(Number(input.candidates)||24),4,64);
  const kinds=['rect','ellipse','triangle'];
  const kind=kinds.includes(input.kind)?input.kind:'mix';
  function indices(s){
    const out=[],c=Math.cos(s.angle),n=Math.sin(s.angle),radius=Math.ceil(Math.hypot(s.a,s.b));
    for(let y=Math.max(0,Math.floor(s.y-radius));y<Math.min(h,Math.ceil(s.y+radius));y++){
      for(let x=Math.max(0,Math.floor(s.x-radius));x<Math.min(w,Math.ceil(s.x+radius));x++){
        const px=x+.5-s.x,py=y+.5-s.y,dx=(c*px+n*py)/s.a,dy=(-n*px+c*py)/s.b;
        if(Math.abs(dx)>1||Math.abs(dy)>1)continue;
        if(s.type==='ellipse'&&dx*dx+dy*dy>1)continue;
        if(s.type==='triangle'&&Math.abs(dx)>(dy+1)/2)continue;
        out.push((y*w+x)*3);
      }
    }return out;
  }
  function evaluate(shape){
    const ids=indices(shape);if(!ids.length)return {score:0};
    let best={score:0};
    for(const alpha of input.alpha===false?[1]:[1,.75,.5,.25]){
      const color=[0,0,0];for(const i of ids)for(let k=0;k<3;k++)color[k]+=(target[i+k]-(1-alpha)*raster[i+k])/alpha;
      for(let k=0;k<3;k++)color[k]=clamp(Math.round(color[k]/ids.length),0,255);
      let score=0;for(const i of ids)for(let k=0;k<3;k++){
        const before=target[i+k]-raster[i+k],after=target[i+k]-(raster[i+k]*(1-alpha)+color[k]*alpha);
        score+=before*before-after*after;
      }
      if(score>best.score)best={shape:{...shape,alpha,color:colorHex(color)},color,score,ids};
    }return best;
  }
  for(let layer=0;layer<count;layer++){
    let best={score:0};const span=Math.min(w,h)*(.46-.33*layer/count);
    for(let k=0;k<candidates;k++){
      const item=evaluate({type:kind==='mix'?kinds[Math.floor(random()*3)]:kind,x:random()*w,y:random()*h,a:1+random()*span,b:1+random()*span,angle:input.rotate===false?0:random()*Math.PI});
      if(item.score>best.score)best=item;
    }
    for(let k=0;best.shape&&k<10;k++){
      const s=best.shape,spread=Math.max(.5,span*.28*(1-k/12)),shift=()=>(random()-.5)*2*spread;
      const item=evaluate({...s,x:clamp(s.x+shift(),0,w),y:clamp(s.y+shift(),0,h),a:clamp(s.a+shift(),.5,w),b:clamp(s.b+shift(),.5,h),angle:input.rotate===false?0:s.angle+(random()-.5)*.4});
      if(item.score>best.score)best=item;
    }
    if(best.shape){
      const alpha=best.shape.alpha;for(const i of best.ids)for(let k=0;k<3;k++)raster[i+k]=raster[i+k]*(1-alpha)+best.color[k]*alpha;
      shapes.push(best.shape);
    }
    if(layer%4===3||layer===count-1)yield {completed:layer+1,total:count,error:error()};
  }
  return {engine:'studio-primitives-2',w,h,base:colorHex(base),shapes,initialError,finalError:error()};
}
function run(input,{onProgress=()=>{},signal}={}){
  // Yield every four iterations so file:// also works when Workers are unavailable.
  const job=solve(input);
  return new Promise((resolve,reject)=>{
    function step(){try{
      if(signal?.aborted){const e=Error('Cálculo cancelado');e.name='AbortError';throw e;}
      const next=job.next();if(next.done)return resolve(next.value);
      onProgress(next.value);setTimeout(step,0);
    }catch(e){reject(e);}}
    setTimeout(step,0);
  });
}
function workerRun(input,options={}){
  if(typeof Worker==='undefined'||typeof URL==='undefined')return run(input,options);
  return new Promise((resolve,reject)=>{
    let worker,url,ended=false;
    const clean=()=>{worker?.terminate();if(url)URL.revokeObjectURL(url);options.signal?.removeEventListener('abort',abort);};
    const abort=()=>{if(ended)return;ended=true;clean();const e=Error('Cálculo cancelado');e.name='AbortError';reject(e);};
    if(options.signal?.aborted)return abort();
    try{
      const source=`const solve=${solve.toString()};onmessage=event=>{try{const job=solve(event.data);let step;do{step=job.next();postMessage({done:step.done,value:step.value});}while(!step.done);}catch(e){postMessage({error:e.message});}};`;
      url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));worker=new Worker(url);
      options.signal?.addEventListener('abort',abort,{once:true});
      worker.onmessage=({data})=>{if(ended)return;if(data.error){ended=true;clean();reject(Error(data.error));}else if(data.done){ended=true;clean();resolve(data.value);}else options.onProgress?.(data.value);};
      worker.onerror=()=>{if(ended)return;ended=true;clean();run(input,options).then(resolve,reject);};
      worker.postMessage(input);
    }catch(e){if(ended)return;ended=true;clean();run(input,options).then(resolve,reject);}
  });
}
root.StudioPrimitives={solve,run,workerRun};
})(typeof window==='undefined'?globalThis:window);
