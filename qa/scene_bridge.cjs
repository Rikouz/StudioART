'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const script=fs.readFileSync(path.join(__dirname,'../js/estudio_bridge.js'),'utf8');
const load=script.slice(script.indexOf('  async function saveCompositions('),script.indexOf('\n  async function importComposition('));
const media=[],stored=new Map(),layerScene={version:1,width:100,height:100,planes:[]};
const app={media,urls:new Map(),importFiles:async(files,metadata)=>{const record={id:'media_one',blob:files[0],...metadata};media.push(record);return [record.id];},selectMedia(){},updateLinkedVideo:async record=>{assert.ok(record.layerScene);}};
const window={Supremo:app};let select;
const realm=vm.createContext({window,groupId:null,restoredProject:null,SLStore:{put:async r=>stored.set(r.id,r),delete:async id=>stored.delete(id)},storeRecipe:async()=> 'recipe_a',selectWorkspace:r=>{select=r;},URL:{revokeObjectURL(){}},console});
vm.runInContext(load,realm);
(async()=>{
 const file={lastModified:17};await realm.saveCompositions([file],{current:0},[0],[layerScene]);
 assert.equal(media[0].layerScene,layerScene);assert.equal(select.id,'media_one');
 realm.groupId='recipe_a';const update={...layerScene,width:200};await realm.saveCompositions([{lastModified:18}],{current:0},[0],[update]);
 assert.equal(media.length,1);assert.equal(media[0].layerScene.width,200);assert.equal(media[0].lastModified,18);assert.equal(stored.get('media_one').layerScene.width,200);
 const main=fs.readFileSync(path.join(__dirname,'../js/app.js'),'utf8');assert.match(main,/layerScene:asset.layerScene/);assert.match(main,/layerScene:record.layerScene/);
 console.log('PASS: Biblioteca conserva planos al crear/revisar la misma pieza, con ID estable y envío/restauración en Video.');
})().catch(e=>{console.error(e);process.exitCode=1;});
