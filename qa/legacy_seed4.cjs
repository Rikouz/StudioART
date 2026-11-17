'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const harness=fs.readFileSync(path.join(__dirname,'studio_composition.cjs'),'utf8').split('async function main(){')[0];
const setup=new Function('require','__dirname',harness+'\nreturn {run,input};');
(async()=>{
 const {run,input}=setup(require,__dirname);
 const old=cp.execFileSync('git',['show','6a9bdc1:modulos/estudio_v5/ESTUDIO_V5.html'],{cwd:path.join(__dirname,'..'),maxBuffer:5000000}).toString();
 const body=old.slice(old.indexOf('function generateDesign('),old.indexOf('function paintDesignMap(')).replace('function generateDesign(','function baselineSeed4(');
 run(body);await run("setMedia('background',fixture.bg)");await run("setMedia('logo',fixture.logo)");input('headline','EQUIPO PARA EL TALLER');input('format','9:16');
 run("globalThis.opts={engine:'msccs-seed-4',channels:{layout:799,color:799,field:799},includeLayers:true,lockText:false,lockProduct:false};globalThis.before=baselineSeed4(comps,comps[current],['layout','color','field'],opts);globalThis.after=generateDesign(comps,comps[current],['layout','color','field'],opts)");
 assert.equal(run('JSON.stringify(after)'),run('JSON.stringify(before)'));
 assert.equal(run("(()=>{const c=document.createElement('canvas');render(c,after[0]);return c.canvas.toDataURL()})()"),run("(()=>{const c=document.createElement('canvas');render(c,before[0]);return c.canvas.toDataURL()})()"));
 console.log('PASS: motor seed-4 conserva recetas y PNG del generador de 1.3.2.');
})().catch(e=>{console.error(e);process.exitCode=1;});
