'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const realm=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(__dirname,'../modulos/estudio_v5/design_engine.js'),'utf8')+'\nglobalThis.engine=StudioDesign;',realm);
const engine=realm.engine,w=40,h=40,data=new Uint8ClampedArray(w*h*4);
for(let y=0;y<h;y++)for(let x=0;x<w;x++){const dark=x>=12&&x<28&&y>=12&&y<28;data.set(dark?[30,40,50,255]:[240,240,240,255],(y*w+x)*4);}
const map=engine.analyze(data,w,h);
assert.equal(engine.families.length,30);assert.equal(new Set(engine.families.map(x=>x.id)).size,30);
assert.ok(map.geometry.marginX>=.1&&map.geometry.marginY>=.1);assert.ok(map.geometry.quietBands.length>0);
for(const rect of [{x:0,y:0,w:1,h:1},{x:.2,y:.4,w:.4,h:.2},{x:-1,y:0,w:1.1,h:1},{x:2,y:2,w:.1,h:.1}]){
 const value=engine.region(map,rect);assert.ok(Number.isFinite(value)&&value>=0&&value<=1);
}
assert.equal(engine.region(map,{x:0,y:0,w:.1,h:.1}),0);
assert.ok(engine.region(map,{x:.25,y:.25,w:.5,h:.5})>0);
console.log('PASS: treinta familias, sumas de actividad, márgenes inferidos y bandas de espacio libre.');
