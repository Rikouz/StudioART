'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const sandbox=vm.createContext({setTimeout,Blob,AbortController});
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../modulos/estudio_v5/primitive_engine.js'),'utf8'),sandbox);
const engine=sandbox.StudioPrimitives,w=28,h=24,data=new Uint8ClampedArray(w*h*4);
for(let y=0;y<h;y++)for(let x=0;x<w;x++)data.set(x+y<25?[220,150,70,255]:[30,50,190,255],(y*w+x)*4);
const input={w,h,data,seed:419,count:40,kind:'mix',rotate:true,alpha:true};
const sync=i=>{let job=engine.solve(i),next;do{next=job.next();}while(!next.done);return next.value;};
(async()=>{
 const result=sync(input),progress=[];let timer=false;setTimeout(()=>timer=true,0);
 const asyncResult=await engine.run(input,{onProgress:p=>progress.push(p)});
 assert.ok(timer,'The UI event loop must get a turn');assert.deepEqual(asyncResult,result);
 assert.deepEqual(sync(input),result);assert.notDeepEqual(sync({...input,seed:420}),result);
 assert.ok(result.finalError<result.initialError*.3);assert.ok(result.shapes.some(s=>s.angle!==0));
 assert.ok(result.shapes.some(s=>s.alpha<1));
 for(let i=1;i<progress.length;i++)assert.ok(progress[i].error<=progress[i-1].error+1e-6);
 const noRotation=sync({...input,rotate:false,alpha:false});assert.ok(noRotation.shapes.every(s=>s.angle===0&&s.alpha===1));
 const abort=new AbortController();const cancelled=engine.run(input,{signal:abort.signal,onProgress:()=>abort.abort()});
 await assert.rejects(cancelled,{name:'AbortError'});
 await assert.rejects(engine.run({...input,w:0}),/inválido/);
 // Exercise the worker message protocol with its generated source in a second JS realm.
 const urls=new Map();let id=0;
 sandbox.URL={createObjectURL:blob=>{const key='blob:test'+(++id);urls.set(key,blob);return key;},revokeObjectURL:key=>urls.delete(key)};
 sandbox.Worker=class{
   constructor(url){this.ready=urls.get(url).text();this.terminated=false;}
   async postMessage(value){const source=await this.ready;const self=this;
    const realm=vm.createContext({postMessage:data=>{if(!self.terminated)self.onmessage?.({data});}});
    try{vm.runInContext(source,realm);realm.onmessage({data:value});}catch(e){self.onerror?.(e);}
   }
   terminate(){this.terminated=true;}
 };
 assert.deepEqual(JSON.parse(JSON.stringify(await engine.workerRun(input))),JSON.parse(JSON.stringify(result)));
 assert.equal(urls.size,0);
 console.log('PASS: motor incremental/worker, semillas, alfa, rotación, error monótono, cancelación y limpieza.');
})().catch(e=>{console.error(e);process.exitCode=1;});
