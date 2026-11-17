'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'studio-seed3-'));
const baselineFiles=['modulos/estudio_v5/ESTUDIO_V5.html','modulos/estudio_v5/design_engine.js'];
for(const file of baselineFiles){const destination=path.join(temp,file);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,cp.execFileSync('git',['show','463834d:'+file],{cwd:root,maxBuffer:20*1024*1024}));}
fs.mkdirSync(path.join(temp,'qa'));
const harness=fs.readFileSync(path.join(__dirname,'studio_composition.cjs'),'utf8').split('async function main(){')[0];
const setup=new Function('require','__dirname',harness+'\nreturn {run,input,fixture:context.fixture};');
(async()=>{try{
 const old=setup(require,path.join(temp,'qa')),current=setup(require,__dirname);
 for(const env of [old,current]){
  await env.run("setMedia('background',fixture.bg)");await env.run("setMedia('logo',fixture.logo)");
  env.input('format','4:5');env.input('headline','EQUIPO PARA TU TALLER');env.input('cta','SOLICITA INFORMACIÓN');env.input('designFamily','auto');
  env.run("$('seedExtra').value='876';variation={engine:'msccs-seed-3',channels:{layout:876,color:876,field:876}};changeVariants(['layout','color','field'])");
 }
 const image=env=>env.run("(()=>{const c=document.createElement('canvas');render(c,comps[current]);return c.canvas.toDataURL('image/png');})()");
 assert.equal(image(current),image(old),'Una semilla guardada en 1.3.0 debe producir el mismo PNG');
 console.log('PASS: msccs-seed-3 produce el mismo PNG que el commit base 463834d.');
}finally{fs.rmSync(temp,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
