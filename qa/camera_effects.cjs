// Run with @napi-rs/canvas available on NODE_PATH. The module is used here for QA only.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createCanvas} = require('@napi-rs/canvas');

const window = {};
const document = {createElement: () => createCanvas(1,1)};
const sandbox = vm.createContext({window,document,Blob,setTimeout});
for(const name of ['camera_effects.js','browser_render.js']){
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',name),'utf8'),sandbox);
}
const fx = window.SLCameraEffects;

const effects = Object.keys(fx.labels);
const ratios = [[320,568],[320,400],[320,180]];
assert.equal(fx.layout(320,568,fx.settings('unknown',65,'')),null);
for(const [width,height] of ratios){
  const baseline = new Set();
  for(const id of effects){
    assert.equal(fx.layout(width,height,fx.settings(id,0,'Título')),null);
    const settings=fx.settings(id,85,'ASEGURA TU EQUIPO');
    const layout=fx.layout(width,height,settings);
    const render=(t,canvas=createCanvas(width,height))=>{
      const ctx=canvas.getContext('2d');
      ctx.fillStyle='#111111';ctx.fillRect(0,0,width,height);
      ctx.fillStyle='#207954';ctx.fillRect(layout.x,layout.y,layout.width,layout.height);
      const pixels=()=>Buffer.from(ctx.getImageData(layout.x,layout.y,layout.width,layout.height).data);
      const source=pixels();
      fx.draw(ctx,layout,settings,t);
      assert.deepEqual(pixels(),source,`${id} modifica la composición en t=${t}`);
      return canvas;
    };
    const initial=render(0).toBuffer('image/png');
    const middle=render(.17).toBuffer('image/png');
    const end=render(1).toBuffer('image/png');
    assert.notDeepEqual(initial,['dayDial','impactFrame'].includes(id)?middle:end,`${id} debe animarse`);
    assert.deepEqual(middle,render(.17).toBuffer('image/png'),`${id} debe ser reproducible`);
    baseline.add(end.toString('base64'));
  }
  assert.equal(baseline.size,effects.length,'Cada efecto debe producir un resultado propio');
}

async function main(){
  const width=128,height=128,settings=fx.settings('commentDrop',90,'Entrega local');
  const layout=fx.layout(width,height,settings);
  const file=await window.SLOffline.renderGif({width,height,fps:10,duration:1,draw(t,canvas){
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#207954';ctx.fillRect(0,0,width,height);
    fx.draw(ctx,layout,settings,t);
  }});
  const bytes=Buffer.from(await file.arrayBuffer());
  assert.equal(bytes.subarray(0,6).toString(),'GIF89a');
  assert.equal(bytes.at(-1),59);
  if(process.argv[2]) fs.writeFileSync(process.argv[2],bytes);
  console.log('PASS: nueve efectos, tres formatos, píxeles protegidos, PNG repetibles y GIF real.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
