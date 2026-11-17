'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sku = '965209S7';
const projectKey = 'SUPREMO_LIDER_V1_PROJECT';
const catalogFolder = 'Carpetas importadas › Feria › MSCCS';
const campaign = {concepts:[{id:'prueba',sku,brand:'SHOPMAX',prompts:{},videoFrames:[]}]};
const stored = new Map();
const localStorage = new Map();
const image = new Blob(['imagen'],{type:'image/png'});
const recipeId = 'estudio_r2';
const proposal = 2;
const studioProject = {format:'msccs-piloto-integracion',title:'Revisión 2',current:0};
const sharedId = 'media_70';
for(let i=0;i<5249;i++){
  const id='media_'+i;
  stored.set(id,{id,name:sku+'_'+i+'.png',sku,type:'image',role:'generated',
    path:'Feria/MSCCS/'+sku+'_'+i+'.png',blob:image});
}
stored.set('audio',{id:'audio',name:sku+'.wav',type:'audio',path:'Feria/MSCCS/audio.wav'});
stored.set(recipeId,{id:recipeId,type:'studio-recipe',blob:new Blob([JSON.stringify(studioProject)])});
stored.get(sharedId).studioRecipe={id:recipeId,proposal,group:'estudio_r1'};

class Element {
  constructor(){
    this.value=''; this.children=[]; this.dataset={}; this.style={}; this.classes=new Set();
    this.classList={
      add:name=>this.classes.add(name), remove:name=>this.classes.delete(name),
      toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name)
    };
  }
  set className(value){this.classes=new Set(value.split(' '));}
  set innerHTML(value){this.children=[new Element()];}
  get lastElementChild(){return this.children.at(-1);}
  add(child){this.append(child);}
  append(...children){this.children.push(...children);}
  appendChild(child){this.append(child);}
  replaceChildren(...children){this.children=children;}
  querySelectorAll(selector){
    assert.equal(selector,'[data-media-id]');
    return this.children.filter(child=>child.dataset.mediaId);
  }
  setAttribute(name,value){this[name]=value;}
  addEventListener(){}
}

async function start(hash='#medios'){
  const controls=new Map();
  const listeners=new Map();
  const urls=new Map();
  const posts=[];
  let sequence=0;
  let download;
  let studioSnapshot;
  const location={hash,protocol:'file:'};
  const element=id=>{
    if(!controls.has(id))controls.set(id,new Element());
    return controls.get(id);
  };
  function event(type,properties={}){return {type,...properties};}
  element('campana-local').textContent=JSON.stringify(campaign);
  const studioFrame=element('estudioFrame');
  studioFrame.contentWindow={postMessage(message){
    posts.push(message);
    if(message.type==='SUPREMO_ESTUDIO_RESTORE')studioSnapshot=message.project;
    if(message.type==='SUPREMO_ESTUDIO_SNAPSHOT'){
      window.dispatchEvent(event('message',{source:studioFrame.contentWindow,
        data:{type:'SUPREMO_ESTUDIO_SNAPSHOT_RESULT',id:message.id,project:studioSnapshot}}));
    }
  }};
  const window={
    addEventListener(type,fn){
      if(!listeners.has(type))listeners.set(type,[]);
      listeners.get(type).push(fn);
    },
    dispatchEvent(message){
      return Promise.all((listeners.get(message.type)||[]).map(fn=>fn(message)));
    }
  };
  const document={
    body:new Element(),getElementById:element,querySelectorAll:()=>[],
    querySelector:()=>element('shell'),
    createElement(tag){
      const node=new Element();
      if(tag==='a')node.click=()=>{download=urls.get(node.href);};
      return node;
    }
  };
  const context=vm.createContext({
    window,document,location,console,structuredClone,Blob,
    history:{replaceState:(_,__,url)=>{location.hash=url;}},
    Event:event,confirm:()=>true,setTimeout:()=>0,clearTimeout(){},
    Option:function(text,value){this.text=text;this.value=value;},
    localStorage:{getItem:key=>localStorage.get(key),setItem:(key,value)=>localStorage.set(key,value)},
    SLStore:{
      list:async()=>Array.from(stored.values()),
      get:async id=>stored.get(id),
      delete:async id=>stored.delete(id)
    },
    URL:{
      createObjectURL(blob){const url='blob:'+(++sequence);urls.set(url,blob);return url;},
      revokeObjectURL:url=>urls.delete(url)
    }
  });
  for(const source of ['library_catalog.js','app.js','estudio_bridge.js']){
    vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',source),'utf8'),context);
  }
  await window.dispatchEvent(event('DOMContentLoaded'));
  await new Promise(setImmediate);
  const app=window.Supremo;
  assert.equal(app.ready,true);
  // Entregar el handshake de Estudio solo al necesitar sus mensajes.
  async function studioReady(){
    await window.dispatchEvent(event('message',{
      source:studioFrame.contentWindow,data:{type:'SUPREMO_ESTUDIO_READY'}
    }));
  }
  return {app,element,posts,urls,studioReady,get download(){return download;}};
}

const title = item => item.children[0].textContent;
const savedView = () => JSON.parse(localStorage.get(projectKey)).libraryView;

async function importProject(browser, project){
  const input=browser.element('importProject');
  input.files=[new Blob([JSON.stringify(project)])];
  await input.onchange({target:input});
}

async function main(){
  let browser=await start();
  const folders=()=>browser.element('mediaFolderGrid').children;
  const cards=()=>browser.element('mediaGrid').children;
  for(const name of ['Carpetas importadas','Feria','MSCCS']){
    folders().find(item=>title(item)===name).onclick();
  }
  browser.element('mediaFilesTab').onclick();
  browser.element('mediaFilter').value=sku;
  browser.element('mediaFilter').oninput();
  browser.element('mediaType').value='image';
  browser.element('mediaType').oninput();
  assert.equal(browser.element('mediaFeedback').textContent,'5,249 recursos en esta vista');
  assert.equal(cards().length,48);
  browser.element('mediaNext').onclick();
  assert.equal(browser.urls.size,48);
  cards().find(item=>item.dataset.mediaId===sharedId).onclick();
  const expected={mode:'files',parent:catalogFolder,page:1,query:sku,type:'image',selectedMediaId:sharedId};
  assert.deepEqual(savedView(),expected);

  browser.element('mediaPrev').onclick();
  assert.equal(browser.app.selectedMediaId,sharedId);
  browser.element('mediaNext').onclick();
  assert.deepEqual(savedView(),expected);
  browser.app.goto('inicio');
  assert.equal(browser.urls.size,0);

  browser=await start();
  assert.equal(browser.element('mediaBreadcrumb').textContent,'Biblioteca › '+catalogFolder);
  assert.equal(browser.element('mediaPage').textContent,'Página 2 de 110');
  assert.equal(browser.element('mediaFilesTab')['aria-pressed'],'true');
  assert.equal(browser.element('mediaFilter').value,sku);
  assert.equal(browser.element('mediaType').value,'image');
  assert.equal(cards().find(item=>item.dataset.mediaId===sharedId).classes.has('active'),true);
  assert.equal(browser.element('cameraAsset').children.some(option=>option.value===sharedId),true);

  await browser.studioReady();
  const edit=cards().find(item=>item.dataset.mediaId===sharedId).children.at(-1).children[1];
  assert.equal(edit.textContent,'Editar');
  edit.onclick({stopPropagation(){}});
  await new Promise(setImmediate);
  assert.equal(browser.app.state.studioAsset,sharedId);
  assert.equal(browser.app.visiblePage,'estudio');
  const restored={...studioProject,current:proposal};
  assert.deepEqual(structuredClone(browser.posts.at(-1).project),restored);
  assert.equal(browser.posts.at(-1).linked,true);
  assert.equal(browser.app.media.find(item=>item.id===sharedId).studioRecipe.id,recipeId);

  // Guardar mediante el botón real, incluyendo la respuesta de snapshot del iframe.
  browser=await start();
  assert.equal(browser.app.state.studioAsset,sharedId);
  await browser.studioReady();
  await browser.element('exportProject').onclick();
  assert.ok(browser.download);
  const snapshot=JSON.parse(await browser.download.text());
  assert.deepEqual(snapshot.state.libraryView,expected);
  assert.deepEqual(snapshot.estudio,restored);
  assert.equal(snapshot.mediaManifest.find(item=>item.id===sharedId).studioRecipe.id,recipeId);
  browser.element('mediaClearSelection').onclick();
  browser.element('mediaUp').onclick();
  await importProject(browser,snapshot);
  assert.deepEqual(savedView(),expected);
  assert.equal(cards().find(item=>item.dataset.mediaId===sharedId).classes.has('active'),true);
  const restoreMessage=browser.posts.at(-1);
  assert.deepEqual(structuredClone(restoreMessage.project),restored);
  assert.equal(restoreMessage.linked,true);

  const outdated={...expected,parent:catalogFolder+' › Ya no existe',selectedMediaId:'borrado',page:10000};
  await importProject(browser,{...snapshot,state:{libraryView:outdated}});
  assert.deepEqual(savedView(),{...expected,page:109,selectedMediaId:null});
  assert.equal(cards().length,17);
  await importProject(browser,{type:'supremo-lider-project',state:{name:'Proyecto legado',notes:{prueba:'Conservar'}}});
  assert.equal(browser.app.state.name,'Proyecto legado');
  assert.equal(browser.app.state.notes.prueba,'Conservar');
  assert.equal(browser.app.state.studioAsset,null);
  assert.deepEqual(savedView(),{mode:'folders',parent:'',page:0,query:'',type:'',selectedMediaId:null});
  assert.equal(browser.element('mediaBreadcrumb').textContent,'Biblioteca');
  console.log('PASS: Biblioteca con 5,249 imágenes mantiene 48 miniaturas por página, restaura carpeta, filtros y selección, conserva ID y receta en Estudio y abre JSON anteriores.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
