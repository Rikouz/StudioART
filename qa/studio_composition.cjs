// Run with @napi-rs/canvas on NODE_PATH. Simulates DOM events and renders real PNG pixels.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createCanvas,Image,GlobalFonts}=require('@napi-rs/canvas');
for(const [file,family] of [['SairaSemiCondensed-ExtraBold.ttf','Saira Semi Condensed'],['IBMPlexSans.ttf','IBM Plex Sans']]){const font=path.join(__dirname,'../fonts',file);if(fs.existsSync(font))GlobalFonts.registerFromPath(font,family);}
const html=fs.readFileSync(path.join(__dirname,'../modulos/estudio_v5/ESTUDIO_V5.html'),'utf8');
const elements=new Map();

class Element {
  constructor(tag,attributes={}){
    this.tag=tag;this.children=[];this.listeners={};this.style={};this.dataset={};
    this.id=attributes.id||'';this.type=attributes.type||'';this.value=attributes.value??'';
    this.checked=Object.hasOwn(attributes,'checked');
    if(tag==='canvas')this.canvas=createCanvas(Number(attributes.width)||300,Number(attributes.height)||150);
  }
  get width(){return this.canvas.width;}
  set width(value){this.canvas.width=value;}
  get height(){return this.canvas.height;}
  set height(value){this.canvas.height=value;}
  getContext(...args){return this.canvas.getContext(...args);}
  setAttribute(){}
  setPointerCapture(id){this.pointer=id;}
  getBoundingClientRect(){return {left:0,top:0,width:this.width,height:this.height};}
  createTextNode(text){return {text};}
  append(...children){
    this.children.push(...children);
    if(this.tag==='select'&&this.options)this.options.push(...children);
  }
  replaceChildren(...children){this.children=children;}
  querySelector(query){
    if(query==='textarea')return this.children.flatMap(node=>node.children||[]).find(node=>node.tag==='textarea');
    if(query==='select[data-background]')return this.children.flatMap(node=>node.children||[]).find(node=>node.dataset?.background);
  }
  focus(){}
  addEventListener(name,handler,capture){
    (this.listeners[name]??=[]).push({handler,capture:Boolean(capture)});
  }
  emit(name,fields={}){
    const evt={target:this,button:0,pointerId:1,stopImmediatePropagation(){this.stopped=true;},...fields};
    for(const capture of [true,false])for(const handler of this.listeners[name]||[]){
      if(!evt.stopped&&handler.capture===capture)handler.handler(evt);
    }
    if(!evt.stopped)this['on'+name]?.(evt);
  }
}

function attrs(raw){
  return Object.fromEntries([...raw.matchAll(/([^\s=<>]+)(?:="([^"]*)")?/g)].map(m=>[m[1],m[2]??'']));
}
const markup=html.replace(/<script[^>]*>[\s\S]*?<\/script>/g,'');
for(const match of markup.matchAll(/<([a-z][\w-]*)([^<>]*\bid="[^"]+"[^<>]*)>/gi)){
  const [,tag,raw]=match,attributes=attrs(raw),element=new Element(tag,attributes);
  if(tag==='select'){
    const options=[...markup.slice(match.index+match[0].length).split('</select>',1)[0].matchAll(/<option([^>]*)>/g)].map(m=>attrs(m[1]));
    element.options=options;
    element.value=(options.find(o=>Object.hasOwn(o,'selected'))||options[0])?.value||'';
  }
  elements.set(element.id,element);
}
const document={
  getElementById:id=>elements.get(id),createElement:tag=>new Element(tag),
  createTextNode:text=>({text}),head:new Element('head'),body:new Element('body')
};
const window={};window.parent=window;
// Canvas accepts native objects. The DOM facade exposes the same objects through drawImage.
const proto=Object.getPrototypeOf(createCanvas(1,1).getContext('2d'));
const drawImage=proto.drawImage;
proto.drawImage=function(source,...args){return drawImage.call(this,source?.canvas||source,...args);};
const context=vm.createContext({document,window,Image,structuredClone,console,AbortController,setTimeout});
const run=code=>vm.runInContext(code,context);
for(const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
  const source=attrs(m[1]).src;
  run(source?fs.readFileSync(path.join(__dirname,'../modulos/estudio_v5',source),'utf8'):m[2]);
}

function input(id,value){
  const field=elements.get(id);
  field.value=String(value);field.emit('input');
}
function pixels(canvas,x,y){
  return [...canvas.getContext('2d').getImageData(Math.floor(x),Math.floor(y),1,1).data];
}
function localImage(width,height,draw){
  const canvas=createCanvas(width,height);
  draw(canvas.getContext('2d'));
  return canvas.toDataURL('image/png');
}
const bg=localImage(80,80,g=>{
  g.fillStyle='#dddddd';g.fillRect(0,0,80,80);
  g.fillStyle='#151515';g.fillRect(15,12,42,40);
});
const logo=localImage(300,240,g=>{g.fillStyle='#12aee7';g.fillRect(100,95,110,35);});
context.fixture={bg,logo};

async function main(){
  await run("setMedia('background',fixture.bg)");
  await run("setMedia('logo',fixture.logo)");
  input('format','9:16');input('headline','CADA HERRAMIENTA');input('cta','Solicita tu YM-0115');
  input('logoSize',12);
  const logoBox=()=>run("logoPlacement(images.logo,...studioDimensions())");
  const small=logoBox();
  input('logoSize',30);
  const large=logoBox();
  assert.ok(large.w/small.w>2.49&&large.h/small.h>2.49);
  assert.equal(large.x,small.x);assert.equal(large.y,small.y);
  assert.ok(large.source.w<120&&large.source.h<45,'El recorte solo debe quitar márgenes alfa');
  const preview=elements.get('mainCanvas');
  assert.deepEqual(pixels(preview,large.x+large.w/2,large.y+large.h/2),[18,174,231,255]);
  const start={clientX:large.x+large.w/2,clientY:large.y+large.h/2};
  const productBefore=run('comps[current].px');
  preview.emit('pointerdown',start);
  preview.emit('pointermove',{clientX:start.clientX+260,clientY:start.clientY+380});
  preview.emit('pointerup');
  assert.ok(logoBox().x>300&&logoBox().y>400);
  assert.equal(run('comps[current].px'),productBefore);
  assert.deepEqual(pixels(preview,logoBox().x+logoBox().w/2,logoBox().y+logoBox().h/2),[18,174,231,255]);

  input('textWidth',31);input('boxHeight',22);input('boxPadding',3);
  assert.ok(Math.abs(run('comps[current]._box.w')-.31)<1e-8);
  assert.ok(Math.abs(run('comps[current]._box.h')-.22)<1e-8);
  assert.equal(elements.get('boxHeightOut').value,'22%');
  run("$('modePro').onclick();$('addText').onclick()");
  const host=elements.get('layerControls');
  const selector=host.querySelector('select[data-background]');
  assert.equal(selector.value,'none');
  function extraField(label){
    const field=host.children.find(el=>el.children[0]?.text===label);
    assert.ok(field,label);
    return field.children[1];
  }
  function layerBox(){
    return run("layerBox(activeLayer(),cv.getContext('2d'),...studioDimensions())");
  }
  const reference=layerBox();
  const point=[reference.x+3,reference.y+3],original=pixels(preview,...point);
  selector.value='custom';selector.emit('change');
  for(const [label,value] of [['Color de fondo','#ed001e'],['Opacidad del fondo',100],['Ancho del cuadro',52],['Altura mínima del cuadro',10]]){
    const field=extraField(label);field.value=String(value);field.emit('input');
  }
  assert.notDeepEqual(pixels(preview,...point),original);
  assert.ok(Math.abs(layerBox().w-1080*.52)<1e-6);
  assert.equal(layerBox().h,192);
  const exportCanvas=run("(()=>{const out=document.createElement('canvas');render(out,comps[current]);return out;})()");
  assert.deepEqual(pixels(exportCanvas,...point),[237,0,30,255]);
  const saved=run('JSON.stringify(snapshotStudio())');
  context.saved=JSON.parse(saved);
  await run('restoreStudio(saved)');
  assert.equal(run('activeLayer().backgroundMode'),'custom');
  assert.equal(run('activeLayer().backgroundColor'),'#ed001e');
  const shared=host.querySelector('select[data-background]');
  shared.value='title';shared.emit('change');
  input('boxOpacity',100);
  assert.deepEqual(pixels(preview,...point),[16,25,22,255]);
  input('boxOpacity',0);
  assert.deepEqual(pixels(preview,...point),original);
  run("syncActive();comps.push({...comps[0],_visual:{...comps[0]._visual,logoSize:'18'}});drawAll()");
  elements.get('variants').children[1].onclick();
  assert.equal(elements.get('logoSize').value,'18');
  elements.get('variants').children[0].onclick();
  assert.equal(elements.get('logoSize').value,'30');

  const old=JSON.parse(saved);
  old.variation={engine:'msccs-seed-1',channels:{layout:24,color:24,field:24}};
  for(const comp of old.comps){
    for(const key of ['logoSize','logoX','logoY','boxHeight','boxPadding'])delete comp._visual[key];
    for(const layer of comp._extra)for(const key of ['backgroundMode','backgroundColor','boxWidth','boxHeight','boxPadding'])delete layer[key];
  }
  old.settings.logoSize='23';delete old.settings.logoX;delete old.settings.logoY;
  context.old=old;await run('restoreStudio(old)');
  assert.equal(run('variation.engine'),'msccs-seed-1');
  assert.equal(run('activeLayer().backgroundMode'),'none');
  assert.equal(elements.get('logoSize').value,'23');
  assert.equal(elements.get('logoX').value,'6');

  const mesh=run(`(()=>{
    const W=26,H=26,luma=new Uint8Array(W*H);
    for(let y=0;y<H;y++)for(let x=13;x<W;x++)luma[y*W+x]=255;
    const f=StudioContour.analyze(luma,W,H),points=StudioContour.sample(f,12,12,random(42));
    const edges=StudioContour.edges([{x:1,y:1},{x:9,y:1},{x:8,y:8},{x:1,y:7}],W,H);
    return {points:points.length,columns:[...new Set(points.map(p=>p.x))].length,
      pairs:edges.length,support:StudioContour.support(f,points[0],points[1],12),
      delta:StudioContour.frameDelta(new Uint8Array([0,255]),new Uint8Array([0,0]))};
  })()`);
  assert.ok(mesh.points>=6);assert.equal(mesh.columns,1);
  assert.equal(mesh.pairs,5);assert.ok(mesh.support>.95);assert.equal(mesh.delta,.5);
  run("$('edgeMap').onclick()");
  assert.notDeepEqual(pixels(preview,8,8),pixels(exportCanvas,8,8));
  const renderPng=()=>run("(()=>{const out=document.createElement('canvas');render(out,comps[current]);return out.canvas.toBuffer('image/png');})()");
  const plain=renderPng();
  run("$('edgeMap').onclick()");
  assert.deepEqual(renderPng(),plain,'El diagnóstico no debe salir en el PNG');
  run("$('useContourMesh').onclick()");
  assert.equal(elements.get('fxLinkMode').value,'delaunay');
  assert.equal(elements.get('fxNodes').checked,true);
  input('fxThreshold',15);
  const styled=renderPng();
  assert.notDeepEqual(styled,plain);
  assert.deepEqual(styled,renderPng());
  input('format','custom');
  elements.get('formatWidth').value='720';
  elements.get('formatHeight').value='450';
  elements.get('formatHeight').emit('change');
  assert.equal(preview.width,720);assert.equal(preview.height,450);
  assert.equal(elements.get('customFormat').hidden,false);
  input('designFamily','technical');input('designSeed',717);
  run("$('generate').onclick()");
  const recipe=()=>run("JSON.stringify(snapshotLook())");
  const firstRecipe=recipe(),firstImage=renderPng();
  assert.equal(JSON.parse(firstRecipe).proposals.length,1);
  assert.equal(run('variation.engine'),'msccs-seed-6');
  assert.ok(JSON.parse(firstRecipe).proposals.some(item=>item.generated.length));
  run("$('repeatDesign').onclick()");
  assert.equal(recipe(),firstRecipe);
  assert.deepEqual(renderPng(),firstImage);
  run("$('varyColor').onclick()");
  const changedColors=JSON.parse(recipe());
  assert.notDeepEqual(changedColors.proposals.map(x=>x.visual.paletteBox),JSON.parse(firstRecipe).proposals.map(x=>x.visual.paletteBox));
  assert.deepEqual(changedColors.proposals.map(x=>[x.tx,x.ty]),JSON.parse(firstRecipe).proposals.map(x=>[x.tx,x.ty]));
  input('designSeed',718);run("$('generate').onclick()");
  assert.notEqual(recipe(),firstRecipe);
  run("$('addShape').onclick()");
  assert.equal(run('activeLayer().type'),'shape');
  const custom=run("JSON.stringify(snapshotStudio())");
  context.custom=JSON.parse(custom);
  await run('restoreStudio(custom)');
  assert.ok(run('extraLayers.some(layer=>layer.type==="shape"&&!layer.generated)'));
  assert.equal(preview.width,720);
  context.firstLook=JSON.parse(firstRecipe);
  run('applyLook(firstLook)');
  assert.equal(run('snapshotLook().ratio'),'custom');
  assert.equal(preview.height,450);
  run("$('designMap').onclick()");
  const exportWithDebug=renderPng();
  run("$('designMap').onclick()");
  assert.deepEqual(renderPng(),exportWithDebug);
  const art=run(`(()=>{
    const W=28,H=24,data=new Uint8ClampedArray(W*H*4);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const i=(y*W+x)*4;
      data.set(x<12?[200,75,60,255]:[20,95,200,255],i);
    }
    const model=StudioDesign.approximate(data,W,H,28,'mix',random(33));
    const same=StudioDesign.approximate(data,W,H,28,'mix',random(33));
    const different=StudioDesign.approximate(data,W,H,28,'mix',random(34));
    const source=StudioDesign.analyze(data,W,H);
    const contrast=StudioDesign.families.map(profile=>StudioDesign.palette(profile,{...source,reference:true},.92))
      .every(p=>StudioDesign.contrast(p.box,p.ink)>=4.5&&StudioDesign.contrast(p.box,p.accent)>=4.5);
    return {score:model.finalError/model.initialError,same:JSON.stringify(model)===JSON.stringify(same),
      different:JSON.stringify(model)!==JSON.stringify(different),shapeCount:model.shapes.length,
      contrast,svg:StudioDesign.svg(model,720,450)};
  })()`);
  assert.ok(art.score<.22);assert.ok(art.same&&art.different&&art.contrast);
  assert.ok(art.shapeCount>0);
  assert.match(art.svg,/<svg[^>]+width="720" height="450"/);
  assert.doesNotMatch(art.svg,/data:|<image|script/);
  input('designFamily','geo');input('designSeed',250);run("$('generate').onclick()");
  const geom=renderPng();
  elements.get('primitiveEnabled').checked=false;elements.get('primitiveEnabled').emit('input');
  assert.notDeepEqual(renderPng(),geom);
  input('designFamily','editorial');input('designSeed',717);run("$('generate').onclick()");
  const seed3=run("JSON.stringify(snapshotStudio())");
  context.seed3=JSON.parse(seed3);
  const expected=renderPng();
  await run("restoreStudio(seed3)");
  assert.deepEqual(renderPng(),expected);
  context.fixture.ref=bg;
  await run("setMedia('reference',fixture.ref)");
  input('format','16:9');
  run("drawAll()");
  assert.equal(preview.width,1920);assert.equal(preview.height,1080);
  input('format','custom');elements.get('formatWidth').value='480';elements.get('formatHeight').value='600';
  elements.get('formatHeight').emit('change');
  const families=run('StudioDesign.families.map(p=>p.id)');
  for(const family of families){
    input('designFamily',family);input('designSeed',12);run("$('generate').onclick()");
    const value=JSON.parse(recipe());
    assert.equal(value.proposals.length,1);
    assert.ok(value.proposals.every(item=>Number.isFinite(item.tx)&&item.tx>=0&&item.tx<=1));
  }
  run("studioPro=true;showGuides=true;drawAll()");
  const titleBox=run("({...comps[current]._box})");
  preview.emit('pointerdown',{clientX:(titleBox.x+titleBox.w)*preview.width,clientY:(titleBox.y+titleBox.h)*preview.height});
  assert.equal(run('drag.type'),'titleSize');
  preview.emit('pointermove',{clientX:(titleBox.x+.40)*preview.width,clientY:(titleBox.y+.28)*preview.height});
  preview.emit('pointerup');
  assert.ok(Number(elements.get('textWidth').value)>=25);
  assert.ok(Number(elements.get('boxHeight').value)>0);
  // Actual layer controls and project round-trip retain transforms, visibility and fonts.
  run("$('addShape').onclick();activeLayer().rotation=37;activeLayer().shapeHeight=8;drawAll()");
  const beforeDuplicate=run('extraLayers.length');
  run("$('layerDuplicate').onclick()");assert.equal(run('extraLayers.length'),beforeDuplicate+1);
  run("$('layerUndo').onclick()");assert.equal(run('extraLayers.length'),beforeDuplicate);
  run("$('layerRedo').onclick()");assert.equal(run('extraLayers.length'),beforeDuplicate+1);
  const visibleShape=renderPng();run('activeLayer().hidden=true;drawAll()');
  assert.notDeepEqual(renderPng(),visibleShape);
  context.layerRoundtrip=JSON.parse(run('JSON.stringify(snapshotStudio())'));
  await run('restoreStudio(layerRoundtrip)');
  assert.ok(run('extraLayers.at(-1).hidden'));assert.equal(run('extraLayers.at(-1).rotation'),37);
  run("$('addText').onclick();activeLayer().font='IBM Plex Sans';activeLayer().weight='400';activeLayer().lineHeight=1.5;drawAll()");
  context.textRoundtrip=JSON.parse(run('JSON.stringify(snapshotStudio())'));
  await run('restoreStudio(textRoundtrip)');assert.equal(run('extraLayers.at(-1).lineHeight'),1.5);
  input('primitiveResolution','96');input('primitiveRefineCount',24);
  await run("$('refinePrimitives').onclick()");
  assert.ok(run("$('primitiveModelJson').value.length>100"),run("$('status')?.textContent"));
  const refinedPNG=renderPng();context.refinedRoundtrip=JSON.parse(run('JSON.stringify(snapshotStudio())'));
  await run('restoreStudio(refinedRoundtrip)');assert.deepEqual(renderPng(),refinedPNG);
  assert.equal(run('readRefinedModel(images.background,...studioDimensions()).engine'),'studio-primitives-2');
  input('fxFinishSeed',655);assert.equal(run('readRefinedModel(images.background,...studioDimensions())'),null);
  // Actual Studio plane export reconstructs the same composited pixels.
  run("activeLayer().mask={type:'polygon',points:[{x:0,y:0},{x:.55,y:0},{x:.55,y:1},{x:0,y:1}]};drawAll()");
  const rawScene=run('captureLayerScene(comps[current])');
  assert.ok(rawScene.planes.some(p=>p.role==='background'));
  assert.ok(rawScene.planes.some(p=>p.role==='logo'));
  assert.ok(rawScene.planes.some(p=>p.id.startsWith('extra:')));
  context.rawScene=JSON.parse(JSON.stringify(rawScene));
  const decoded=await run('window.SLLayerMotion.decode(rawScene,Image)');
  context.decodedScene=decoded;
  const rebuilt=run("(()=>{const c=document.createElement('canvas');[c.width,c.height]=studioDimensions();window.SLLayerMotion.render(c.getContext('2d'),decodedScene,{id:'none'});return [...c.getContext('2d').getImageData(0,0,c.width,c.height).data];})()");
  const planeOriginal=run("(()=>{const c=document.createElement('canvas');render(c,comps[current]);return [...c.getContext('2d').getImageData(0,0,c.width,c.height).data];})()");
  let maxPixelDelta=0;for(let i=0;i<planeOriginal.length;i++)maxPixelDelta=Math.max(maxPixelDelta,Math.abs(planeOriginal[i]-rebuilt[i]));
  assert.ok(maxPixelDelta<=2,'Recomponer planos debe conservar el render de Estudio: delta '+maxPixelDelta);
  context.maskRoundtrip=JSON.parse(run('JSON.stringify(snapshotStudio())'));
  await run('restoreStudio(maskRoundtrip)');assert.equal(run('extraLayers.at(-1).mask.type'),'polygon');
  console.log('PASS: exportación real de planos reconstruye el PNG y conserva máscaras al reabrir.');
  console.log('PASS: duplicado, deshacer/rehacer, visibilidad, rotación, tipografía y refinado guardado sin perder la reapertura.');
  console.log('PASS: formato libre, semillas y canales, formas editables, mapa fuera del PNG, contraste y aproximación geométrica SVG.');
  console.log('PASS: composición real en Canvas, logo con alfa/escala/arrastre, cuadros, JSON previo, Sobel, Delaunay, soporte y delta.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
