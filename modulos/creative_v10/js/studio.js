'use strict';
/* MSCCS Creative Studio V10 — motor original sin frameworks/CDN. */
(()=>{
const $=id=>document.getElementById(id), C=window.MSCCS_CAMPAIGN||{concepts:[]}, EFFECTS=(window.MSCCS_EFFECTS?.effects||[]);
const RATIOS={'4:5':[1080,1350],'9:16':[1080,1920],'16:9':[1920,1080],'1:1':[1080,1080],'3:4':[1080,1440]};
const TEMPLATES={msccs:{bg:'#f5f5f1',ink:'#19262b',accent:'#05bdce',sub:'#303e45',plate:'#ffffff',frame:'#91cad1'},cream:{bg:'#191511',ink:'#efe7d4',accent:'#efe7d4',sub:'#d4c9b0',plate:'#1d1813',frame:'#7f7567'},architect:{bg:'#f0f0ec',ink:'#101516',accent:'#171c1d',sub:'#303536',plate:'#ffffff',frame:'#444b4b'},void:{bg:'#151515',ink:'#e6dfd0',accent:'#e5dfd2',sub:'#bfb9ad',plate:'#161617',frame:'#514c44'},retail:{bg:'#f8f8f6',ink:'#192126',accent:'#00b6c8',sub:'#2c4149',plate:'#f8f8f6',frame:'#008da8'}};
for(const [id,name] of Object.entries(window.SLCameraEffects.labels))EFFECTS.push({id:'motion_'+id,name:name+' · integrado',group:'Movimiento editorial',description:'Efecto temporizado por clip con composición protegida',video:true,image:true});
for(const [id,name] of Object.entries(window.SLLayerMotion.labels))EFFECTS.push({id:'layer_'+id,name:name+' · multicapa',group:'Planos / datos reales',description:'Necesita capas, transición, biblioteca o audio real',video:true,image:false});
const P={schemaVersion:'10.0',name:'MSCCS Buen Fin 2026',ratio:'4:5',template:'msccs',conceptId:C.concepts?.[0]?.id||'',mode:'art',fit:'contain',photo:'',quality:'preview',selectedMedia:'',layers:[],effect:'none',effectIntensity:.4,visual:{bg:'#f5f5f1',brightness:100,contrast:100,clarity:0,outerFrame:'none',outerInset:4},timeline:{clips:[],overlays:[],audio:[]}};
const assets=new Map(), imageCache=new Map(); let importHints=[]; let idN=0,selectedLayer='', selectedTimeline=null, clipClipboard=null, mediaPicking='', playing=false, playhead=0,lastTick=0,exporting=false,activeVideoAsset='',activeAudioAsset='',drag=null,animStart=0,previewing=false,previewStart=0,showGuides=false; let history=[],redo=[]; let campaign=structuredClone(C);let importedFonts=[];let fontSerial=0;
const cvs=$('mainCanvas'),ctx=cvs.getContext('2d'),video=$('sourceVideo'),audio=$('sourceAudio');
const $out=id=>$(id);const uid=prefix=>`${prefix}_${++idN}_${Date.now().toString(36)}`;
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));const fmt=t=>{t=Math.max(0,Number(t)||0);const m=Math.floor(t/60),s=Math.floor(t%60);return`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${Math.floor((t%1)*10)}`};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&quot;'}[c]));
function toast(msg){$('statusText').textContent=msg;$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('show'),2600)}
function downloadBlob(blob,filename){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),18000)}
const downloadJSON=(o,filename)=>downloadBlob(new Blob([JSON.stringify(o,null,2)],{type:'application/json'}),filename);
const basename=s=>String(s||'').split('/').pop();const formatBytes=n=>n>=1024*1024?`${(n/1048576).toFixed(1)} MB`:`${Math.ceil(n/1024)} KB`;
async function copyText(txt){try{await navigator.clipboard.writeText(txt)}catch(e){const t=document.createElement('textarea');t.value=txt;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}toast('Texto copiado al portapapeles')}
function getConcept(){return campaign.concepts.find(x=>x.id===P.conceptId)||campaign.concepts[0]}
function getAsset(src){if(!src)return null;if(assets.has(src))return assets.get(src);for(const a of assets.values())if(a.url===src||a.name===src||a.path===src)return a;return null}
function getImage(src){if(!src)return null;const a=getAsset(src),url=a?.url||src;let entry=imageCache.get(url);if(entry)return entry.complete?entry:null;const im=new Image();imageCache.set(url,im);im.onload=()=>render();im.onerror=()=>{imageCache.delete(url)};im.src=url;return null}
function makeLayer(id,type,label,text='',x=.08,y=.11,size=56){return{id,type,label,text,assetKey:'',x,y,w:.45,scale:1,alpha:1,rotation:0,color:'#19262b',font:'Saira',weight:800,size,tracking:0,lineHeight:.97,align:'left',frame:'none',glow:'none',blur:0,pad:15,visible:true,locked:false}}
function newLayers(d){const T=TEMPLATES[P.template],arr=[];let l=makeLayer('logo','image','Logo MSCCS','',.73,.035,36);l.assetKey='logo';l.w=.23;l.scale=1;arr.push(l);
l=makeLayer('buenfin','image','El Buen Fin','',.065,.035,36);l.assetKey='buenFin';l.w=.14;arr.push(l);
l=makeLayer('headline','text','Titular',d.headline||'',.065,.17,69);l.color=T.ink;l.w=.74;l.font='Saira';l.weight=800;arr.push(l);
l=makeLayer('sku','text','Modelo / SKU',`${d.brand} ${d.sku}`,.07,.32,31);l.color=T.sub;l.weight=600;l.w=.6;arr.push(l);
l=makeLayer('cta','text','CTA',d.cta||'ESCRÍBENOS HOY',.07,.87,33);l.color=T.ink;l.font='Saira';l.weight=700;l.w=.68;arr.push(l);
l=makeLayer('qr','image','QR WhatsApp','',.81,.84,35);l.assetKey='qr';l.w=.135;l.frame='solid';l.pad=8;arr.push(l);return arr;}
function loadConcept(id){const d=campaign.concepts.find(x=>x.id===id);if(!d)return;pushHistory();P.conceptId=id;P.photo=d.productAsset;P.layers=newLayers(d);selectedLayer='headline';setPrompt();renderConcepts();renderLayers();syncInspector();render()}
function pushHistory(){history.push(JSON.stringify({layers:P.layers,photo:P.photo,template:P.template,visual:P.visual,effect:P.effect,effectIntensity:P.effectIntensity}));if(history.length>40)history.shift();redo=[]}
function undo(){if(!history.length)return;redo.push(JSON.stringify({layers:P.layers,photo:P.photo,template:P.template,visual:P.visual,effect:P.effect,effectIntensity:P.effectIntensity}));Object.assign(P,JSON.parse(history.pop()));renderLayers();syncInspector();render()}
function redoHistory(){if(!redo.length)return;history.push(JSON.stringify({layers:P.layers,photo:P.photo,template:P.template,visual:P.visual,effect:P.effect,effectIntensity:P.effectIntensity}));Object.assign(P,JSON.parse(redo.pop()));renderLayers();syncInspector();render()}
function setRatio(r){if(!RATIOS[r])return;P.ratio=r;$('ratio').value=r;const [w,h]=RATIOS[r];cvs.width=w;cvs.height=h;updateCanvasDisplay();render();$('sizeText').textContent=`${w} × ${h} · exportación disponible en alta resolución`}
function updateCanvasDisplay(){const frame=document.querySelector('.canvas-frame'),scroll=document.querySelector('.canvas-scroll');if(!frame||!scroll)return;const [w,h]=RATIOS[P.ratio];let maxW=Math.max(140,scroll.clientWidth-60),maxH=Math.max(150,scroll.clientHeight-44);let f=Math.min(maxW/w,maxH/h);frame.style.width=Math.max(150,Math.floor(w*f))+'px';frame.style.height=Math.max(150,Math.floor(h*f))+'px';cvs.style.width='100%';cvs.style.height='100%';$('zoomLabel').textContent=`${Math.round(f*100)}%`}
function renderConcepts(){const s=$('searchConcept').value.toLowerCase(),b=$('filterBrand').value,items=campaign.concepts.filter(d=>(!b||d.brand===b)&&[d.sku,d.headline,d.scene,d.name].join(' ').toLowerCase().includes(s));$('conceptCount').textContent=items.length;$('conceptList').innerHTML=items.map(d=>`<div class="concept-card ${d.id===P.conceptId?'selected':''}" data-id="${esc(d.id)}"><img src="${esc(d.thumbnail)}" alt=""><div><strong>${esc(d.id)} · ${esc(d.brand)}</strong><div class="sku">${esc(d.sku)}</div><div class="hook">${esc(d.headline)}</div>${d.quality?.includes('pendiente')?'<small class="qa">QA YARDMAX PENDIENTE</small>':''}</div></div>`).join('');for(const el of $('conceptList').querySelectorAll('.concept-card'))el.onclick=()=>loadConcept(el.dataset.id)}
function selected(){return P.layers.find(x=>x.id===selectedLayer)||P.layers[0]}
function renderLayers(){$('layerCount').textContent=P.layers.length;$('layerList').innerHTML=[...P.layers].reverse().map(l=>`<div class="layer-row ${selectedLayer===l.id?'active':''}" data-id="${esc(l.id)}"><button class="layerEye" data-vis="${esc(l.id)}" title="Mostrar u ocultar">${l.visible?'◉':'○'}</button><span>${esc(l.label)}</span><span class="layer-type">${l.type==='text'?'ABC':'PNG'}</span></div>`).join('');$('layerList').querySelectorAll('.layer-row').forEach(el=>el.onclick=evt=>{if(evt.target.classList.contains('layerEye')){const l=P.layers.find(x=>x.id===evt.target.dataset.vis);l.visible=!l.visible;renderLayers();render();return}selectedLayer=el.dataset.id;renderLayers();syncInspector();render()})}
function syncInspector(){const l=selected();if(!l)return;$('selectedLayerLabel').textContent=l.label;$('layerText').value=l.text||'';$('layerText').disabled=l.type!=='text';for(const [id,val] of Object.entries({posX:l.x*100,posY:l.y*100,layerScale:l.scale*100,layerOpacity:l.alpha*100,layerRotate:l.rotation,layerFont:l.font,layerFontSize:l.size,layerColor:l.color,layerWeight:l.weight,layerAlign:l.align,layerTracking:l.tracking,layerLineHeight:l.lineHeight,layerFrame:l.frame,layerGlow:l.glow,layerBlur:l.blur,layerPad:l.pad,layerVisible:l.visible,layerLocked:l.locked})){$(id).value=typeof val==='number'&&id.startsWith('pos')?val.toFixed(1):val;if(typeof val==='boolean')$(id).checked=val}$('opacityOut').textContent=Math.round(l.alpha*100)+'%'}
function applyInspector(){const l=selected();if(!l)return;const v=id=>$(id).value;l.text=v('layerText');l.x=clamp(+v('posX')/100,-.4,1.4);l.y=clamp(+v('posY')/100,-.4,1.4);l.scale=clamp(+v('layerScale')/100,.1,4.5);l.alpha=+v('layerOpacity')/100;l.rotation=+v('layerRotate');l.font=v('layerFont');l.size=+v('layerFontSize');l.color=v('layerColor');l.weight=+v('layerWeight');l.align=v('layerAlign');l.tracking=+v('layerTracking');l.lineHeight=+v('layerLineHeight');l.frame=v('layerFrame');l.glow=v('layerGlow');l.blur=+v('layerBlur');l.pad=+v('layerPad');l.visible=$('layerVisible').checked;l.locked=$('layerLocked').checked;$('opacityOut').textContent=Math.round(l.alpha*100)+'%';render()}
function updateIdentityList(){$('identityList').innerHTML=[['logo','Logo MSCCS'],['buenFin','Sello Buen Fin'],['qr','QR original']].map(([k,n])=>`<div class="asset-item"><img src="${esc(identitySource(k))}" alt=""><div><b>${esc(n)}</b><label class="button file-btn">Reemplazar PNG/SVG/JPG<input type="file" accept="image/*" data-identity="${k}"></label></div></div>`).join('');$('identityList').querySelectorAll('[data-identity]').forEach(i=>i.onchange=e=>{const f=e.target.files[0];if(f)identityLoad(i.dataset.identity,f)})}
const identityOverrides={};const identitySource=k=>identityOverrides[k]||C.identity?.[k]||'';
function identityLoad(k,file){if(identityOverrides[k]&&identityOverrides[k].startsWith('blob:'))URL.revokeObjectURL(identityOverrides[k]);let id='identity_'+k;const url=URL.createObjectURL(file);identityOverrides[k]=url;assets.set(id,{id,name:file.name,file,url,type:'image',duration:5});imageCache.delete(url);updateIdentityList();render();toast(`${k}: original cargado; no se redibuja`)}
function importMedia(files){for(const file of files){if(!file?.name)continue;const ty=file.type.startsWith('video')?'video':file.type.startsWith('audio')?'audio':file.type.startsWith('image')?'image':null;if(!ty)continue;const hint=importHints.find(h=>h.name===file.name);const id=hint?.id||uid('file');const url=URL.createObjectURL(file);const a={id,name:file.name,file,url,type:ty,duration:ty==='image'?4:0};assets.set(id,a);if(hint)importHints=importHints.filter(h=>h!==hint);if(ty==='video'||ty==='audio'){const probe=document.createElement(ty);probe.preload='metadata';probe.src=url;probe.onloadedmetadata=()=>{a.duration=Number.isFinite(probe.duration)?probe.duration:0;renderMedia()};}else getImage(url)}renderMedia();toast(`${files.length} archivo(s) añadidos a la biblioteca local`)}
function renderMedia(){$('mediaList').innerHTML=[...assets.values()].filter(a=>!a.id.startsWith('identity_')).map(a=>`<div class="media-item ${P.selectedMedia===a.id?'selected':''}" data-media="${esc(a.id)}"><div><b title="${esc(a.name)}">${esc(a.name)}</b><small>${a.type.toUpperCase()} · ${a.duration?fmt(a.duration):'leyendo'} · ${a.file?formatBytes(a.file.size):'interno'}</small></div><div class="media-actions"><button data-choose="${a.id}">Elegir</button>${a.type==='audio'?`<button data-audio="${a.id}">+ Audio</button>`:`<button data-clip="${a.id}">+ Clip</button>`}${a.type==='image'?`<button data-layer="${a.id}">+ Capa</button><button data-background="${a.id}">Fondo</button>`:''}</div></div>`).join('');$('mediaList').querySelectorAll('[data-choose]').forEach(b=>b.onclick=()=>{P.selectedMedia=b.dataset.choose;renderMedia();toast('Recurso seleccionado')});$('mediaList').querySelectorAll('[data-clip]').forEach(b=>b.onclick=()=>addClip(b.dataset.clip));$('mediaList').querySelectorAll('[data-audio]').forEach(b=>b.onclick=()=>addAudioTrack(b.dataset.audio));$('mediaList').querySelectorAll('[data-layer]').forEach(b=>b.onclick=()=>addImageLayer(b.dataset.layer));$('mediaList').querySelectorAll('[data-background]').forEach(b=>b.onclick=()=>{const a=getAsset(b.dataset.background);if(!a)return;P.photo=a.url;P.mode='art';setMode('art');render();toast('Imagen cargada para editar como fondo')})}
function addImageLayer(assetId){let a=getAsset(assetId);if(!a){mediaPicking='layer';$('mediaFile').click();return}pushHistory();const l=makeLayer(uid('image'),'image',a.name,'',.35,.38,40);l.assetKey=assetId;l.w=.32;P.layers.push(l);selectedLayer=l.id;renderLayers();syncInspector();render()}
function useOfficial(){P.photo=getConcept().productAsset;render();toast('Fotografía maestra cargada como referencia. No se modifica su geometría.')}
function setPrompt(){$('promptPreview').value=getConcept()?.prompts?.FOTO_LIMPIA||getConcept()?.prompts?.CON_LETRAS||'';showFramePrompt()}
function showFramePrompt(){const d=getConcept(),i=+$('frameSelect').value;$('framePromptPreview').value=d?.videoFrames?.[i]||d?.frame_actions?.[i]||''}
function frameRect(g,x,y,w,h,r=6){g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h)}
function fitDraw(g,img,W,H,fit='contain',mul=1,dx=0,dy=0){if(!img||!(img.videoWidth||img.width))return;let iw=img.videoWidth||img.width,ih=img.videoHeight||img.height;if(!iw||!ih)return;const s=(fit==='cover'?Math.max(W/iw,H/ih):Math.min(W/iw,H/ih))*mul;g.drawImage(img,(W-iw*s)/2+dx,(H-ih*s)/2+dy,iw*s,ih*s)}
function drawCanvasBase(g,W,H,time,source,sourceEff='none'){
 const T=TEMPLATES[P.template]||TEMPLATES.msccs;g.fillStyle=P.visual.bg||T.bg;g.fillRect(0,0,W,H);
 if(!source){g.save();g.fillStyle=T.sub;g.font='500 21px Arial';g.textAlign='center';g.fillText('IMPORTA UNA FOTO O SELECCIONA UNA REFERENCIA',W/2,H*.58);g.restore();return}
 const intens=P.effectIntensity;const t=(time%2.2)/2.2,cycle=Math.sin(t*Math.PI),brightness=P.visual.brightness,contrast=P.visual.contrast;
 g.save();g.filter=`brightness(${brightness}%) contrast(${contrast}%)${sourceEff==='rackFocus'?` blur(${(1-cycle)*4*intens}px)`:''}`;
 if(sourceEff==='postWall'){
   const cols=4,rows=3,sw=W/cols,sh=H/rows;for(let i=0;i<cols*rows;i++){g.save();const j=i%cols,k=Math.floor(i/cols);g.beginPath();g.rect(j*sw+3,k*sh+3,sw-6,sh-6);g.clip();g.translate(j*sw+3,k*sh+3);fitDraw(g,source,sw-6,sh-6,'cover',1.05,Math.sin(t*6+i)*10*intens,0);g.restore()}
 } else if(sourceEff==='cloneRow'){
   fitDraw(g,source,W,H,P.fit);for(let j=0;j<3;j++){g.save();g.globalAlpha=.11*intens*(3-j);g.translate((j+1)*38*cycle,0);fitDraw(g,source,W,H,P.fit);g.restore()}
 } else if(sourceEff==='headStack'){
   fitDraw(g,source,W,H,P.fit);g.save();g.globalAlpha=.35*intens;for(let j=0;j<3;j++){g.save();g.beginPath();g.rect(W*(.13+j*.22),0,W*.13,H);g.clip();fitDraw(g,source,W,H,P.fit,1,Math.sin(t*4+j)*42,0);g.restore()}g.restore()
 } else if(sourceEff==='dollyZoom'||sourceEff==='impactFrame'||sourceEff==='parallax'){
   const zoom=sourceEff==='dollyZoom'?1+intens*.17*(1-t):sourceEff==='impactFrame'?1+intens*.06*Math.exp(-t*7):1.015;fitDraw(g,source,W,H,P.fit,zoom,sourceEff==='parallax'?Math.sin(t*6)*16*intens:0,sourceEff==='parallax'?Math.cos(t*6)*10*intens:0)
 }else fitDraw(g,source,W,H,P.fit);
 g.restore();
 if(P.visual.clarity>0){g.save();g.globalAlpha=P.visual.clarity/100*.025;g.fillStyle=T.ink;g.fillRect(0,0,W,H);g.restore()}
}
function drawEffects(g,W,H,effect,time,intensity){if(!effect||effect==='none'||intensity<=0)return;let t=(time%2.15)/2.15,e=Math.min(1,intensity),p=Math.sin(t*Math.PI),mid=W/2,cy=H/2;const T=TEMPLATES[P.template]||TEMPLATES.msccs;g.save();g.globalAlpha=1;
 switch(effect){
 case 'liveCursor':{const x=W*(.18+.61*t),y=H*(.19+.54*Math.sin(t*Math.PI*.85));g.translate(x,y);g.fillStyle=T.ink;g.strokeStyle=T.bg;g.lineWidth=3;g.beginPath();g.moveTo(0,0);g.lineTo(0,35*e);g.lineTo(9*e,28*e);g.lineTo(19*e,46*e);g.lineTo(27*e,42*e);g.lineTo(18*e,24*e);g.lineTo(29*e,24*e);g.closePath();g.fill();g.stroke();g.beginPath();g.arc(0,0,30*p*e,0,Math.PI*2);g.strokeStyle=T.accent;g.stroke();break}
 case 'dayDial':{g.translate(mid,cy);g.rotate(t*Math.PI*1.3);g.strokeStyle=T.accent;g.lineWidth=4*e;g.beginPath();g.arc(0,0,Math.min(W,H)*.27,0,Math.PI*2);g.stroke();for(let i=0;i<12;i++){const a=i*Math.PI/6,r=Math.min(W,H)*.27;g.beginPath();g.moveTo(Math.cos(a)*r,Math.sin(a)*r);g.lineTo(Math.cos(a)*(r+12*e),Math.sin(a)*(r+12*e));g.stroke()}break}
 case 'predictKeys':{for(let i=0;i<5;i++){let x=W*.11+i*W*.16,y=H*.72+(1-p)*42+(i%2)*17;g.fillStyle='rgba(18,29,27,.65)';frameRect(g,x,y,72*e,58*e,6);g.fill();g.strokeStyle=T.accent;g.stroke();g.fillStyle='#f2e9d2';g.font=`${20*e}px Arial`;g.fillText(['S','H','O','P','M'][i],x+22*e,y+35*e)}break}
 case 'orbitRing':{g.strokeStyle=T.accent;g.lineWidth=3*e;g.beginPath();g.ellipse(mid,cy,Math.min(W,H)*.38,Math.min(W,H)*.19,t*Math.PI*2,0,Math.PI*2);g.stroke();g.fillStyle=T.accent;g.beginPath();g.arc(mid+Math.cos(t*6.28)*W*.33,cy+Math.sin(t*6.28)*H*.1,9*e,0,6.283);g.fill();break}
 case 'codeBody':{g.globalAlpha=.20*e;g.font='500 17px monospace';g.fillStyle=T.accent;for(let j=0;j<17;j++)g.fillText(['SELECT * FROM MSCCS;','PRODUCT_ID = SKU','RUN BUILD && SHIP','000110 0100101','IF (READY) ORDER'][j%5],W*.04+(j%2)*30,H*.15+j*H*.042+(t*40));break}
 case 'letterDive':{const txt='MSCCS';g.textAlign='center';g.font=`800 ${Math.round(W*.095)}px Impact,Arial Black,sans-serif`;for(let i=0;i<txt.length;i++){g.globalAlpha=Math.min(1,t*4+i*.08)*e;g.fillStyle=T.accent;g.fillText(txt[i],W*.25+i*W*.095,H*.55-Math.max(0,1-(t*2+i*.09))*H*.3)}break}
 case 'commentDrop':{let yy=-H*.15+t*H*.48;g.fillStyle='rgba(245,244,238,.95)';frameRect(g,W*.16,yy,W*.68,105,12);g.fill();g.fillStyle='#22352c';g.font='600 21px Arial';g.fillText('TU PRÓXIMO PROYECTO COMIENZA HOY',W*.2,yy+44);g.font='400 16px Arial';g.fillText('Consulta disponibilidad · MSCCS',W*.2,yy+76);break}
 case 'layerExplode':{g.strokeStyle=T.accent;g.globalAlpha=.6*e;g.lineWidth=4;for(let j=0;j<5;j++){g.strokeRect(W*.16+j*(14*p),H*.24+j*12*p,W*.68-j*26*p,H*.49-j*22*p)}break}
 case 'sketchWords':{g.strokeStyle=T.accent;g.lineWidth=2*e;g.font=`800 ${W*.07}px Arial Black, sans-serif`;g.setLineDash([Math.max(1,t*400),800]);g.strokeText('EQUIPA TU ESPACIO',W*.06,H*.58);g.setLineDash([]);break}
 case 'bladeSlice':{const x=(t*1.4-.2)*W;g.strokeStyle=T.accent;g.lineWidth=8*e;g.beginPath();g.moveTo(x,-H*.08);g.lineTo(x-W*.3,H*1.08);g.stroke();g.globalAlpha=.13*e;g.fillStyle=T.accent;g.beginPath();g.moveTo(x-15,0);g.lineTo(x+15,0);g.lineTo(x-W*.3+15,H);g.lineTo(x-W*.3-15,H);g.closePath();g.fill();break}
 case 'banknote':{g.strokeStyle=T.accent;g.fillStyle='rgba(241,233,214,.55)';g.globalAlpha=.55*e;g.translate(mid,cy);g.rotate(Math.sin(t*6)*.08);frameRect(g,-W*.28,-H*.12,W*.56,H*.24,12);g.fill();g.lineWidth=2;g.stroke();g.beginPath();g.ellipse(0,0,W*.085,H*.085,0,0,6.28);g.stroke();break}
 case 'voiceNote':{let y=H*.79;g.strokeStyle=T.accent;g.lineWidth=5*e;for(let j=0;j<33;j++){let x=W*.18+j*W*.019;let h=(.24+.76*Math.abs(Math.sin(j*1.4+t*13)))*H*.06*e;g.beginPath();g.moveTo(x,y-h);g.lineTo(x,y+h);g.stroke()}break}
 case 'impactFrame':{g.strokeStyle=T.accent;g.globalAlpha=.65*e;g.lineWidth=4;g.strokeRect(W*.03+30*p,H*.03+30*p,W*.94-60*p,H*.94-60*p);break}
 case 'pressFront':{g.globalAlpha=e;g.fillStyle=T.accent;g.textAlign='center';g.font=`900 ${W*(.045+.06*p)}px Impact,sans-serif`;g.fillText('LISTO PARA TU PROYECTO',mid,H*.6);break}
 case 'blowAway':{g.globalAlpha=.7*e;g.fillStyle=T.accent;for(let j=0;j<85;j++){const ox=(j*17)%W,oy=(j*31)%H*.57+H*.18;const dx=Math.sin(j*19.2)*t*160,dy=-t*t*(30+j%12*8);g.fillRect(ox+dx,oy+dy,Math.max(2,12*(1-t)),Math.max(2,5*(1-t)))}break}
 case 'paperTear':{g.fillStyle='rgba(239,234,219,.86)';g.globalAlpha=.7*e;g.beginPath();g.moveTo(0,H*(.18+.15*t));for(let x=0;x<=W;x+=17)g.lineTo(x,H*(.18+.15*t)+Math.sin(x*.045+t*10)*14*e);g.lineTo(W,0);g.lineTo(0,0);g.fill();break}
 case 'neonTrace':{g.save();g.strokeStyle=T.accent;g.shadowColor=T.accent;g.shadowBlur=28*e;g.lineWidth=3*e;g.strokeRect(W*.04,H*.04,W*.92,H*.92);g.restore();break}
 case 'glassLine':{g.fillStyle='rgba(231,233,223,.18)';g.fillRect(W*.06,H*.81,W*.88,2+80*e);g.strokeStyle='rgba(245,247,239,.5)';g.lineWidth=1;g.beginPath();g.moveTo(W*.06,H*.81);g.lineTo(W*.94,H*.81);g.stroke();break}
 case 'gridTech':{g.globalAlpha=.27*e;g.strokeStyle=T.accent;g.lineWidth=1;for(let x=0;x<W;x+=W/10){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke()}for(let y=0;y<H;y+=H/12){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}break}
 case 'spotlight':{let x=W*(.24+.44*t),y=H*.4;const grad=g.createRadialGradient(x,y,5,x,y,W*.5);grad.addColorStop(0,`rgba(255,247,215,${.32*e})`);grad.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=grad;g.fillRect(0,0,W,H);break}
 case 'filmGrain':{g.fillStyle=`rgba(18,20,17,${.035*e})`;for(let i=0;i<90;i++){const px=(Math.sin(i*124.86+t*40)*43758.5%1+1)%1,py=(Math.sin(i*82.9+t*19)*53219.8%1+1)%1;g.fillRect(px*W,py*H,2,2)}break}
 case 'rackFocus':{g.fillStyle=T.accent;g.globalAlpha=.3*e;g.strokeStyle=T.accent;g.lineWidth=2;for(const [dx,dy] of [[.18,.32],[.82,.32],[.18,.69],[.82,.69]]){g.beginPath();g.arc(W*dx,H*dy,Math.min(W,H)*.015,0,6.283);g.stroke()}break}
 case 'parallax':{g.strokeStyle=T.accent;g.globalAlpha=.3*e;g.lineWidth=2;g.strokeRect(W*.07+Math.sin(t*6)*12,H*.08,W*.86,H*.83);break}
 }
 g.restore();}
function textLines(g,text,maxW){const paragraphs=String(text||'').split('\n'),out=[];for(const p of paragraphs){let line='';for(const word of p.split(/\s+/)){const test=line?line+' '+word:word;if(g.measureText(test).width>maxW&&line){out.push(line);line=word}else line=test}out.push(line)}return out.slice(0,8)}
function drawLayer(g,l,W,H,opts={}){if(!l.visible)return null;const T=TEMPLATES[P.template]||TEMPLATES.msccs,x=W*l.x,y=H*l.y,s=l.scale*(W/1080),a=l.alpha;g.save();g.globalAlpha=a;g.translate(x,y);g.rotate(l.rotation*Math.PI/180);g.scale(s,s);
 let iw=0,ih=0,im=null,lines=[];const font=l.font.includes(' ') ? `"${l.font}"`:l.font;
 if(l.type==='image'){const src=l.assetKey==='logo'||l.assetKey==='buenFin'||l.assetKey==='qr'?identitySource(l.assetKey):(getAsset(l.assetKey)?.url||l.assetKey);im=getImage(src);iw=W*l.w/s*(W>=1900?1:1);iw=Math.min(iw,860);if(l.assetKey==='qr')iw=Math.max(130,iw);ih=im?.height?iw*(im.height/im.width):iw;
 }else{g.font=`${l.weight} ${l.size}px ${font},Arial,sans-serif`;if('letterSpacing' in g)g.letterSpacing=l.tracking+'px';let maxW=Math.max(90,W*l.w/s);lines=textLines(g,l.text,maxW);const m=Math.max(0,...lines.map(line=>g.measureText(line).width));iw=m;ih=Math.max(l.size,lines.length*l.size*l.lineHeight)}
 const pad=l.pad;const bx=-pad,by=l.type==='text'?-l.size*.82-pad:-pad,bw=iw+2*pad,bh=ih+2*pad;
 if(l.frame!=='none'){g.save();if(l.frame==='glass'&&l.blur>0){try{const px=x+s*bx,py=y+s*by,pw=s*bw,ph=s*bh;if(pw>1&&ph>1&&pw<2200&&ph<2200){const patch=document.createElement('canvas');patch.width=Math.ceil(pw);patch.height=Math.ceil(ph);patch.getContext('2d').drawImage(g.canvas,px,py,pw,ph,0,0,pw,ph);g.save();g.filter=`blur(${Math.min(30,l.blur)}px)`;g.drawImage(patch,bx,by,bw,bh);g.restore()}}catch(_){}}if(l.frame==='glass'){g.fillStyle='rgba(220,223,218,.18)';g.strokeStyle='rgba(245,245,234,.24)'}else if(l.frame==='solid'){g.fillStyle=l.assetKey==='qr'?'#ffffff':T.plate;g.strokeStyle=T.frame}else if(l.frame==='neon'){g.fillStyle='rgba(0,0,0,.03)';g.strokeStyle=T.accent;g.shadowColor=T.accent;g.shadowBlur=17}else{g.fillStyle='rgba(255,255,255,.04)';g.strokeStyle=T.frame}
 if(l.glow!=='none'){g.shadowColor=l.glow==='neon'?T.accent:'rgba(0,0,0,.4)';g.shadowBlur=l.glow==='neon'?32:24}
 frameRect(g,bx,by,bw,bh,Math.max(4,Math.min(16,pad)));if(l.frame!=='hairline')g.fill();g.lineWidth=l.frame==='neon'?2:1.2;g.stroke();g.restore()}
 if(l.glow!=='none'&&l.frame==='none'){g.shadowColor=l.glow==='neon'?T.accent:'rgba(0,0,0,.35)';g.shadowBlur=l.glow==='neon'?20:14}
 if(l.type==='image'&&im){if(l.assetKey==='qr'){g.save();g.fillStyle='#fff';g.fillRect(0,0,iw,ih);g.imageSmoothingEnabled=false;g.drawImage(im,0,0,iw,ih);g.restore()}else g.drawImage(im,0,0,iw,ih)}else if(l.type==='text'){
   g.fillStyle=l.color;g.textBaseline='alphabetic';const anchor=l.align==='center'?iw/2:l.align==='right'?iw:0;g.textAlign=l.align;lines.forEach((line,i)=>{let yy=i*l.size*l.lineHeight+l.size*.15;g.fillText(line,anchor,yy)});
 }
 g.restore();return{x:x+s*bx,y:y+s*by,w:s*bw,h:s*bh,id:l.id}}
function timelineTotal(){return P.timeline.clips.reduce((n,c)=>n+clipDuration(c),0)}
function clipDuration(c){const a=getAsset(c.assetId),last=c.out??a?.duration??4;return Math.max(.05,(last-c.in)/(c.speed||1))}
function timelineAt(time){let pos=0;for(const clip of P.timeline.clips){let d=clipDuration(clip);if(time<pos+d||pos+d>=timelineTotal()&&clip===P.timeline.clips.at(-1))return{clip,start:pos,local:clamp(time-pos,0,d),duration:d};pos+=d}return null}
function validatedTrajectory(data){
 const {width,height,frames}=data||{};
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||
    !Array.isArray(frames)||!frames.length||frames.length>97)throw Error('Trayectoria inválida.');
 let last=-1;
 const points=frames.map(frame=>{
  if(!frame||!Number.isFinite(frame.time)||frame.time<=last||frame.time>12)throw Error('Tiempo inválido en la trayectoria.');
  last=frame.time;
  if(frame.lost===true)return {time:last,lost:true};
  const {x,y,w,h}=frame;
  if(![x,y,w,h].every(Number.isFinite)||x<0||y<0||w<=0||h<=0||x+w>width||y+h>height)
   throw Error('Área de seguimiento inválida.');
  return {time:last,x:(x+w/2)/width,y:(y+h/2)/height};
 });
 if(points[0].time!==0||points[0].lost)throw Error('La trayectoria debe comenzar con el sujeto localizado.');
 return points;
}
function trackedOffset(points,time){
 if(!points?.length||time<0||time>points.at(-1).time+.125)return null;
 const index=points.findIndex(point=>point.time>time);
 const a=points[index<0?points.length-1:index-1],b=points[index];
 if(!a||a.lost)return null;
 const fraction=b&&!b.lost?(time-a.time)/(b.time-a.time):0;
 return {x:a.x+(b&&!b.lost?(b.x-a.x)*fraction:0)-points[0].x,
         y:a.y+(b&&!b.lost?(b.y-a.y)*fraction:0)-points[0].y};
}
function overlayForFrame(overlay,info,source,W,H){
 if(!overlay.subjectTrack)return overlay.layer;
 if(!info||info.clip.id!==overlay.subjectTrack.clipId||!source?.videoWidth)return null;
 const sourceTime=info.clip.in+info.local*(info.clip.speed||1);
 const offset=trackedOffset(overlay.subjectTrack.points,sourceTime);
 if(!offset)return null;
 const vw=source.videoWidth,vh=source.videoHeight;
 const scale=(P.fit==='cover'?Math.max:Math.min)(W/vw,H/vh);
 return {...overlay.layer,x:overlay.layer.x+offset.x*vw*scale/W,y:overlay.layer.y+offset.y*vh*scale/H};
}
let motionSnapshot=null;
const deferredStudioMessages=[];
function clipScene(clip){
 const asset=getAsset(clip.assetId);if(!asset?.scene)return null;
 return {...asset.scene,planes:asset.scene.planes.map(p=>({...p,keyframes:clip.layerKeys?.[p.id]||p.keyframes}))};
}
function layerOptions(clip,local,duration){
 const i=P.timeline.clips.indexOf(clip),next=getAsset(P.timeline.clips[i+1]?.assetId);
 const wave=clip.waveform||[];
 return {id:(clip.effect||'').startsWith('layer_')?clip.effect.slice(6):'none',amount:clip.motion?.amount??65,text:clip.motion?.text||'',seed:clip.motion?.seed??24,time:Math.max(0,local-(clip.motion?.start||0)),duration:clip.motion?.duration||duration,
 next:next?.type==='image'?getImage(next.url):null,waveformProgress:clamp(local/duration,0,1),gallery:[...assets.values()].filter(a=>a.type==='image').map(a=>getImage(a.url)).filter(Boolean).slice(0,48),waveform:wave};
}
async function attachLayerScene(asset,raw){
 if(!asset||!raw)return;asset.layerScene=raw;asset.scene=await window.SLLayerMotion.decode(raw);render();
}
function renderToCanvas(target,time=0,exportingFrame=false){let W=target.width,H=target.height,g=target.getContext('2d',{alpha:false});const base=RATIOS[P.ratio],sx=W/base[0],sy=H/base[1];g.save();g.scale(sx,sy);let src=null,eff=P.effect,ctxInfo=null;
 if(P.mode==='video'&&P.timeline.clips.length){ctxInfo=timelineAt(time);if(ctxInfo){const a=getAsset(ctxInfo.clip.assetId);if(a?.type==='video'&&video.readyState>=2&&activeVideoAsset===a.id)src=video;else if(a?.type==='image')src=getImage(a.url);eff=ctxInfo.clip.effect||'none'}}else src=getImage(P.photo);
 drawCanvasBase(g,base[0],base[1],time,src,eff);
 if(ctxInfo&&(eff.startsWith('layer_')||ctxInfo.clip.layerKeys)){
  const scene=clipScene(ctxInfo.clip),settings=layerOptions(ctxInfo.clip,ctxInfo.local,ctxInfo.duration),begin=ctxInfo.clip.motion?.start||0;
  if(ctxInfo.local<begin||(ctxInfo.local>begin+settings.duration&&!['letterDive','bladeSlice','paperTear'].includes(settings.id)))settings.id='none';
  if(scene){
   g.save();g.setTransform(1,0,0,1,0,0);
   try{window.SLLayerMotion.render(g,scene,settings);if($('layerMotionStatus'))$('layerMotionStatus').textContent='';}
   catch(error){window.SLLayerMotion.render(g,scene,{id:'none',time:ctxInfo.local});if($('layerMotionStatus'))$('layerMotionStatus').textContent=error.message;}
   g.restore();
  }else if($('layerMotionStatus'))$('layerMotionStatus').textContent='Guarda y envía la pieza desde Estudio para conservar sus planos.';
 }
 const effectsTime=P.mode==='video'&&ctxInfo?ctxInfo.local:time;
 drawEffects(g,base[0],base[1],eff,effectsTime,P.effectIntensity);
 let boxes=[];
 if(P.mode==='art'){for(const l of P.layers){const b=drawLayer(g,l,base[0],base[1]);if(b)boxes.push(b)}}
 else {for(const o of P.timeline.overlays){if(time<o.start||time>=o.end)continue;const l=overlayForFrame(o,ctxInfo,src,base[0],base[1]);if(!l)continue;let b=drawLayer(g,l,base[0],base[1]);if(b)boxes.push(b)}}
 if(eff.startsWith('motion_')){
   const cl=ctxInfo?.clip, motion=cl?.motion||{},start=Math.max(0,Number(motion.start)||0),span=Math.max(.1,Number(motion.duration)||ctxInfo?.duration||3);
   if(effectsTime>=start&&effectsTime<=start+span){
     const snapshot=motionSnapshot||(motionSnapshot=document.createElement('canvas'));if(snapshot.width!==target.width)snapshot.width=target.width;if(snapshot.height!==target.height)snapshot.height=target.height;snapshot.getContext('2d').drawImage(target,0,0);
     // The shared renderer works in output pixels; suspend the logical canvas transform.
     g.save();g.setTransform(1,0,0,1,0,0);
     window.SLCameraEffects.composite(g,snapshot,window.SLCameraEffects.settings(eff.slice(7),Number(motion.amount??65),motion.text||''),(effectsTime-start)/span);g.restore();
   }
 }
 const outer=P.visual.outerFrame||'none';if(outer!=='none'){const inset=clamp(Number(P.visual.outerInset||4),1,16)/100*Math.min(base[0],base[1]);g.save();g.lineWidth=outer==='double'?1:outer==='neon'?3:1.3;g.strokeStyle=outer==='hairline'||outer==='double'?TEMPLATES[P.template].frame:TEMPLATES[P.template].accent;if(outer==='glow'||outer==='neon'){g.shadowColor=TEMPLATES[P.template].accent;g.shadowBlur=outer==='neon'?24:42}g.strokeRect(inset,inset,base[0]-2*inset,base[1]-2*inset);if(outer==='double')g.strokeRect(inset+10,inset+10,base[0]-2*inset-20,base[1]-2*inset-20);g.restore()}
 if(!exportingFrame){window.__msccsBoxes=boxes;if(showGuides){g.save();g.setLineDash([8,8]);g.lineWidth=1;g.strokeStyle='rgba(0,180,183,.67)';const m=Math.min(base[0],base[1])*.07;g.strokeRect(m,m,base[0]-m*2,base[1]-m*2);g.restore()}
 if(P.mode==='art'){const box=boxes.find(x=>x.id===selectedLayer);if(box){g.save();g.strokeStyle='rgba(51,231,209,.7)';g.setLineDash([6,8]);g.lineWidth=1;g.strokeRect(box.x,box.y,box.w,box.h);g.restore()}}}
 g.restore()}
function render(){renderToCanvas(cvs,playhead,false)}
function renderEffects(){const q=$('effectSearch').value.toLowerCase();const matching=EFFECTS.filter(e=>(e.name+' '+e.group).toLowerCase().includes(q));$('effectCount').textContent=matching.length;$('effectsList').innerHTML=matching.map((e,i)=>`<button class="effect-card ${e.id===activeEffect()?'active':''}" data-eff="${e.id}" title="${esc(e.description)}"><span class="num">${String(i+1).padStart(2,'0')}</span><div><strong>${esc(e.name)}</strong><small>${esc(e.group)}</small></div></button>`).join('');$('effectsList').querySelectorAll('button').forEach(b=>b.onclick=()=>selectEffect(b.dataset.eff))}
function activeEffect(){if(P.mode==='video'&&selectedTimeline?.kind==='clip'){return P.timeline.clips.find(x=>x.id===selectedTimeline.id)?.effect||'none'}return P.effect}
function selectEffect(eff){if(P.mode==='video'&&selectedTimeline?.kind==='clip'){const cl=P.timeline.clips.find(c=>c.id===selectedTimeline.id);if(cl)cl.effect=eff}else P.effect=eff;syncClipInspector();renderTimeline();renderEffects();render();toast('Efecto seleccionado: '+(EFFECTS.find(e=>e.id===eff)?.name||'ninguno'))}
function startEffectPreview(){previewing=true;previewStart=performance.now();requestAnimationFrame(function tick(now){if(!previewing)return;renderToCanvas(cvs,(now-previewStart)/1000,false);if(now-previewStart<2500)requestAnimationFrame(tick);else{previewing=false;render()}})}
/* Línea de tiempo no destructiva: los archivos importados nunca se sobrescriben. */
function addClip(assetId){const a=getAsset(assetId);if(!a||!['image','video'].includes(a.type)){toast('Selecciona un archivo de imagen o video');return}if(a.type==='video'&&a.duration<.05){toast('El video sigue cargando sus metadatos. Inténtalo de nuevo.');return}P.timeline.clips.push({id:uid('clip'),assetId,in:0,out:a.type==='image'?4:a.duration,speed:1,effect:'none',mute:false,volume:1});selectedTimeline={kind:'clip',id:P.timeline.clips.at(-1).id};renderTimeline();syncClipInspector();toast('Clip añadido a la línea de tiempo')}
function addAudioTrack(assetId){const a=getAsset(assetId);if(!a||a.type!=='audio'){toast('Selecciona un archivo de audio desde Medios');return}const start=playhead,end=start+(a.duration||10);P.timeline.audio.push({id:uid('audio'),assetId,start,end,volume:.8,mute:false});selectedTimeline={kind:'audio',id:P.timeline.audio.at(-1).id};renderTimeline();toast('Pista de audio añadida')}
function addOverlay(kind='text'){const start=playhead;if(kind==='image'){let l=makeLayer(uid('overlay'),'image','Logo temporizado');l.assetKey='logo';l.x=.74;l.y=.05;l.w=.2;P.timeline.overlays.push({id:uid('overlay'),start,end:start+3,layer:l})}else{const val=prompt('Texto sobre el video','ELIGE TU GABINETE HOY');if(val===null)return;let l=makeLayer(uid('overlay'),'text','Rótulo',val,.07,.12,55);l.color='#ffffff';l.frame='glass';l.pad=19;P.timeline.overlays.push({id:uid('overlay'),start,end:start+3,layer:l})}selectedTimeline={kind:'overlay',id:P.timeline.overlays.at(-1).id};renderTimeline();toast('Capa temporizada añadida: arrástrala desde el lienzo al reproducir')}
function splitAtPlayhead(){let t=timelineAt(playhead);if(!t||t.local<=.1||t.duration-t.local<=.1){toast('Sitúa el cabezal dentro de un clip para dividirlo');return}let c=t.clip,idx=P.timeline.clips.indexOf(c),cut=c.in+t.local*(c.speed||1);const right={...structuredClone(c),id:uid('clip'),in:cut};c.out=cut;P.timeline.clips.splice(idx+1,0,right);selectedTimeline={kind:'clip',id:right.id};renderTimeline();syncClipInspector();toast('Clip dividido sin modificar el archivo original')}
function removeTimeline(){if(!selectedTimeline)return;const key=selectedTimeline.kind==='clip'?'clips':selectedTimeline.kind==='audio'?'audio':'overlays';P.timeline[key]=P.timeline[key].filter(x=>x.id!==selectedTimeline.id);selectedTimeline=null;playhead=Math.min(playhead,timelineTotal());renderTimeline();syncClipInspector();render();toast('Elemento retirado de la línea de tiempo')}
function copySelectedClip(){if(selectedTimeline?.kind!=='clip')return toast('Selecciona un clip');const c=P.timeline.clips.find(x=>x.id===selectedTimeline.id);clipClipboard=c?structuredClone(c):null;toast('Clip copiado internamente')}
function pasteClip(){if(!clipClipboard)return toast('No hay clip copiado');const ix=P.timeline.clips.findIndex(x=>x.id===selectedTimeline?.id);const c={...structuredClone(clipClipboard),id:uid('clip')};P.timeline.clips.splice(Math.max(0,ix+1),0,c);selectedTimeline={kind:'clip',id:c.id};renderTimeline();syncClipInspector();toast('Copia del clip insertada')}
function moveClip(dir){if(selectedTimeline?.kind!=='clip')return;let ix=P.timeline.clips.findIndex(x=>x.id===selectedTimeline.id),next=ix+dir;if(ix<0||next<0||next>=P.timeline.clips.length)return;const [c]=P.timeline.clips.splice(ix,1);P.timeline.clips.splice(next,0,c);renderTimeline()}
function timelineWorkspaceResources(timeline) {
 const ids=new Set([...timeline.clips,...timeline.audio].map(item=>item.assetId));
 for(const overlay of timeline.overlays){
  const id=overlay.layer?.assetKey;
  if(id)ids.add(identityOverrides[id]?'identity_'+id:id);
 }
 const linkedIds=[],files=[];
 for(const id of ids){
  const asset=getAsset(id);
  if(asset?.studioAssetId)linkedIds.push(asset.studioAssetId);
  else if(asset?.file)files.push({id:asset.id,file:asset.file,name:asset.name,type:asset.type,duration:asset.duration});
 }
 return {linkedIds,files};
}
function saveVideoWorkspace(){
 if(!videoWorkspaceReady||!embeddedVideo)return;
 const project=saveProjectObject();
 delete project.savedAt;
 const key=JSON.stringify(project);
 if(key===lastVideoWorkspace)return;
 lastVideoWorkspace=key;
 window.parent.postMessage({type:'SL1_WORKSPACE_SAVE',project,...timelineWorkspaceResources(project.timeline)},'*');
}
async function restoreVideoWorkspace(message){
 for(const asset of message.files||[]){
  if(!(asset.file instanceof File))continue;
  const url=URL.createObjectURL(asset.file);
  assets.set(asset.id,{...asset,url});
  if(asset.id.startsWith('identity_'))identityOverrides[asset.id.slice(9)]=url;
 }
 for(const {id,file,layerScene} of message.resources||[]){const asset=linkedStudioImage(id,file);await attachLayerScene(asset,layerScene);}
 if(message.project){await restoreProject(message.project);for(const [id,scene] of Object.entries(message.project.layerScenes||{}))await attachLayerScene(getAsset(id),scene);}
}
function renderTimeline(){const widthHint=130;let selectedKey=selectedTimeline?.id;const aName=id=>getAsset(id)?.name||'Medio no vinculado';$('clipList').innerHTML=P.timeline.clips.map((c,i)=>`<button class="clip-pill ${c.id===selectedKey?'active':''}" data-kind="clip" data-id="${c.id}" style="min-width:${Math.round(clamp(clipDuration(c)*16,90,260))}px" title="Entrada ${c.in.toFixed(2)}s, salida ${c.out.toFixed(2)}s">${i+1}. ${esc(aName(c.assetId))} · ${clipDuration(c).toFixed(1)}s ${c.effect!=='none'?'· ✦':''}</button>`).join('');
 $('overlayList').innerHTML=P.timeline.overlays.map(o=>`<button class="clip-pill overlay ${o.id===selectedKey?'active':''}" data-kind="overlay" data-id="${o.id}">${esc(o.layer.text||o.layer.label)} · ${o.start.toFixed(1)}–${o.end.toFixed(1)}s</button>`).join('');
 $('audioList').innerHTML=P.timeline.audio.map(a=>`<button class="clip-pill audio ${a.id===selectedKey?'active':''}" data-kind="audio" data-id="${a.id}">${esc(aName(a.assetId))} · ${a.start.toFixed(1)}–${a.end.toFixed(1)}s</button>`).join('');
 for(const b of document.querySelectorAll('.clip-pill'))b.onclick=()=>{selectedTimeline={kind:b.dataset.kind,id:b.dataset.id};renderTimeline();syncClipInspector();renderEffects();render()};$('timeDisplay').textContent=`${fmt(playhead)} / ${fmt(timelineTotal())}`;$('scrubber').value=timelineTotal()?Math.round(playhead/timelineTotal()*1000):0;
 $('timelineInfo').textContent=P.timeline.clips.length?`${P.timeline.clips.length} clips · ${fmt(timelineTotal())} total · secuencia no destructiva`:'Aún no hay clips; impórtalos en Medios.';
 saveVideoWorkspace();
}
function syncClipInspector(){const selectedAudio=selectedTimeline?.kind==='audio'?P.timeline.audio.find(a=>a.id===selectedTimeline.id):null, selectedOv=selectedTimeline?.kind==='overlay'?P.timeline.overlays.find(o=>o.id===selectedTimeline.id):null;
 $('audioInspector').hidden=P.mode!=='video'||!selectedAudio;
 $('overlayInspector').hidden=P.mode!=='video'||!selectedOv;
 if(selectedAudio){$('audioStart').value=selectedAudio.start.toFixed(2);$('audioEnd').value=selectedAudio.end.toFixed(2);$('audioMute').checked=!!selectedAudio.mute;$('audioVolume').value=Math.round((selectedAudio.volume??1)*100)}
 if(selectedOv){$('overlayStart').value=selectedOv.start.toFixed(2);$('overlayEnd').value=selectedOv.end.toFixed(2);$('overlayText').value=selectedOv.layer.text||''}
 const cl=selectedTimeline?.kind==='clip'?P.timeline.clips.find(c=>c.id===selectedTimeline.id):null;$('clipInspector').hidden=P.mode!=='video'||!cl;if(!cl)return;$('trimStart').value=cl.in.toFixed(2);$('trimEnd').value=cl.out.toFixed(2);$('clipSpeed').value=String(cl.speed||1);$('clipEffect').value=cl.effect||'none';$('clipMotionText').value=cl.motion?.text||'';$('clipMotionAmount').value=cl.motion?.amount??65;$('clipMotionStart').value=cl.motion?.start??0;$('clipMotionDuration').value=cl.motion?.duration??clipDuration(cl);$('clipMute').checked=!!cl.mute;$('clipVolume').value=Math.round((cl.volume??1)*100);syncPlaneInspector(cl)}
function applyClipChanges(){const cl=P.timeline.clips.find(c=>c.id===selectedTimeline?.id);if(!cl)return;const a=getAsset(cl.assetId);let start=Math.max(0,+$('trimStart').value||0),end=Math.max(start+.1,+$('trimEnd').value||.1);if(a?.type==='video')end=Math.min(end,a.duration);cl.in=start;cl.out=end;cl.speed=+$('clipSpeed').value||1;cl.effect=$('clipEffect').value;cl.motion={...cl.motion,text:$('clipMotionText').value,amount:+$('clipMotionAmount').value,start:Math.max(0,+$('clipMotionStart').value||0),duration:Math.max(.1,+$('clipMotionDuration').value||.1)};cl.mute=$('clipMute').checked;cl.volume=+$('clipVolume').value/100;renderTimeline();renderEffects();render()}
function setMode(mode){if(window.parent!==window&&new URLSearchParams(location.search).get('mode')==='video')mode='video';stopPlayback();P.mode=mode;$('modeArt').classList.toggle('is-active',mode==='art');$('modeVideo').classList.toggle('is-active',mode==='video');$('timelineShell').hidden=mode!=='video';$('btnExportImage').hidden=mode==='video';$('btnExportVideo').hidden=mode!=='video';$('clipInspector').hidden=mode!=='video'||selectedTimeline?.kind!=='clip';updateCanvasDisplay();renderEffects();render()}
function timelineSeek(t,autoPlay=false){playhead=clamp(t,0,timelineTotal());const at=timelineAt(playhead);if(at){const a=getAsset(at.clip.assetId);if(a?.type==='video'){
 if(activeVideoAsset!==a.id){activeVideoAsset=a.id;video.pause();video.src=a.url;video.load();video.onloadedmetadata=()=>{video.currentTime=at.clip.in+at.local*(at.clip.speed||1);video.playbackRate=at.clip.speed||1;if(playing||autoPlay)video.play().catch(()=>{})};}
 else {const target=at.clip.in+at.local*(at.clip.speed||1);if(video.readyState>=1&&Math.abs(video.currentTime-target)>.16){try{video.currentTime=target}catch(e){}}video.playbackRate=at.clip.speed||1;if((playing||autoPlay)&&video.paused)video.play().catch(()=>{})}
 video.muted=!!at.clip.mute;video.volume=at.clip.volume??1;
 }else {video.pause();activeVideoAsset=''}
 }else video.pause();
 const a=P.timeline.audio.find(x=>playhead>=x.start&&playhead<x.end);if(a){const src=getAsset(a.assetId);if(src&&activeAudioAsset!==src.id){activeAudioAsset=src.id;audio.src=src.url;audio.load();audio.onloadedmetadata=()=>{audio.currentTime=clamp(playhead-a.start,0,audio.duration||1);if(playing||autoPlay)audio.play().catch(()=>{})}}else if(audio.readyState>=1){const wanted=playhead-a.start;if(Math.abs(audio.currentTime-wanted)>.2)audio.currentTime=wanted;if((playing||autoPlay)&&audio.paused)audio.play().catch(()=>{})}audio.muted=!!a.mute;audio.volume=a.volume??1}else{audio.pause();activeAudioAsset=''}
 if(videoGain&&extraGain){const clipLevel=at&&getAsset(at.clip.assetId)?.type==='video'&&!video.muted?video.volume:0,trackLevel=a&&!audio.muted?audio.volume:0,level=window.SLVideoExport.gains(clipLevel,trackLevel);videoGain.gain.value=video.volume?level.clip/video.volume:0;extraGain.gain.value=audio.volume?level.track/audio.volume:0;}
 $('timeDisplay').textContent=`${fmt(playhead)} / ${fmt(timelineTotal())}`;$('scrubber').value=timelineTotal()?Math.round(playhead/timelineTotal()*1000):0;render();}
function playbackTick(now){if(!playing)return;const dt=Math.min(.09,(now-lastTick)/1000);lastTick=now;let newT=playhead+dt;if(newT>=timelineTotal()){newT=timelineTotal();timelineSeek(newT);stopPlayback();return}const prev=timelineAt(playhead),next=timelineAt(newT);if(prev?.clip.id!==next?.clip.id||Math.floor(newT*10)%3===0)timelineSeek(newT,true);else{playhead=newT;$('timeDisplay').textContent=`${fmt(playhead)} / ${fmt(timelineTotal())}`;$('scrubber').value=Math.round(playhead/timelineTotal()*1000);render()}requestAnimationFrame(playbackTick)}
function playPlayback(){if(!P.timeline.clips.length)return toast('Agrega al menos un clip desde Medios');if(playhead>=timelineTotal())playhead=0;playing=true;lastTick=performance.now();timelineSeek(playhead,true);$('playPause').textContent='Ⅱ Pausar';requestAnimationFrame(playbackTick)}
function stopPlayback(){playing=false;video.pause();audio.pause();$('playPause').textContent='▶ Reproducir';if(!exporting)render()}
function togglePlayback(){if(playing)stopPlayback();else playPlayback()}
async function exportImage(){if(P.mode==='video')return;const base=RATIOS[P.ratio],s=P.quality==='4k'?2:1;const out=document.createElement('canvas');out.width=base[0]*s;out.height=base[1]*s;try{await document.fonts.ready;renderToCanvas(out,0,true);const blob=await new Promise(resolve=>out.toBlob(resolve,'image/png'));if(!blob)throw Error('Canvas no exportable');downloadBlob(blob,`${P.conceptId||'MSCCS'}_${P.ratio.replace(':','x')}_${out.width}x${out.height}.png`);toast(`PNG exportado ${out.width}×${out.height}. Los píxeles nuevos no son detalle IA.`)}catch(e){toast(`No se pudo exportar: ${e.message}. Carga la fotografía desde tu equipo, no por URL.`)}}
let audioCtx=null,audioDest=null,sourceVideoNode=null,sourceAudioNode=null,videoGain=null,extraGain=null;
async function ensureAudioGraph(){if(audioCtx)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audioCtx=new AC();audioDest=audioCtx.createMediaStreamDestination();sourceVideoNode=audioCtx.createMediaElementSource(video);sourceAudioNode=audioCtx.createMediaElementSource(audio);videoGain=audioCtx.createGain();extraGain=audioCtx.createGain();sourceVideoNode.connect(videoGain).connect(audioDest);sourceAudioNode.connect(extraGain).connect(audioDest);videoGain.connect(audioCtx.destination);extraGain.connect(audioCtx.destination);await audioCtx.resume()}
async function prepareVideoExport(){
 await document.fonts?.ready;
 await window.SLVideoExport.prepareImages(P.timeline.clips,getAsset,imageCache);
 for(const clip of P.timeline.clips){
  const asset=getAsset(clip.assetId);if(asset?.layerScene&&!asset.scene)await attachLayerScene(asset,asset.layerScene);
  if((clip.effect||'').startsWith('layer_')){const scene=clipScene(clip),options=layerOptions(clip,0,clipDuration(clip)),issue=window.SLLayerMotion.capabilities(scene,options.id,options);if(issue)throw Error(issue);}
 }
 for(const {layer} of P.timeline.overlays){
   if(!layer?.visible||layer.type!=='image')continue;
   const src=['logo','buenFin','qr'].includes(layer.assetKey)?identitySource(layer.assetKey):(getAsset(layer.assetKey)?.url||layer.assetKey);
   if(!src)throw Error('Falta una imagen de la capa temporizada');
   imageCache.set(src,await window.SLVideoExport.image(src));
 }
 timelineSeek(0,false);
 const first=timelineAt(0),asset=first&&getAsset(first.clip.assetId);
 if(asset?.type==='video')await window.SLVideoExport.firstVideoFrame(video,first.clip.in);
 renderToCanvas(cvs,0,true);
}
async function exportVideo(){if(exporting)return;if(!P.timeline.clips.length)return toast('No hay clips en la línea de tiempo');if(!('MediaRecorder' in window)||!cvs.captureStream)return toast('Tu navegador no admite exportación por MediaRecorder');const candidates=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];const mime=candidates.find(x=>MediaRecorder.isTypeSupported(x));if(!mime)return toast('No existe codificador compatible de video en este navegador');exporting=true;const wasInert=document.body.inert;document.body.inert=true;drag=null;stopPlayback();playhead=0;
 const base=RATIOS[P.ratio];const savW=cvs.width,savH=cvs.height;const mult=P.quality==='4k'?2:1;cvs.width=base[0]*mult;cvs.height=base[1]*mult;updateCanvasDisplay();let rec,chunks=[];let mimeExt=mime.startsWith('video/mp4')?'mp4':'webm';try{await prepareVideoExport();await ensureAudioGraph();timelineSeek(0,false);renderToCanvas(cvs,0,true);const visual=cvs.captureStream(30),mix=new MediaStream([...visual.getVideoTracks(),...(audioDest?.stream.getAudioTracks()||[])]);rec=new MediaRecorder(mix,{mimeType:mime,videoBitsPerSecond:mult===2?17000000:8000000});rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};rec.onerror=e=>toast('Error codificando video: '+(e.error?.message||'desconocido'));rec.start(1000);playing=true;lastTick=performance.now();timelineSeek(0,true);$('statusText').textContent='Exportando video en tiempo real · no cierres la pestaña';
 await new Promise(resolve=>{const tick=now=>{if(!exporting||!playing){resolve();return}let dt=Math.min(.15,(now-lastTick)/1000);lastTick=now;const next=Math.min(timelineTotal(),playhead+dt);timelineSeek(next,true);if(next>=timelineTotal()){resolve();return}requestAnimationFrame(tick)};requestAnimationFrame(tick)});stopPlayback();await new Promise(resolve=>{rec.onstop=resolve;rec.stop()});const blob=new Blob(chunks,{type:mime});downloadBlob(blob,`MSCCS_${P.ratio.replace(':','x')}_EDICION.${mimeExt}`);toast(`Video exportado (${mimeExt.toUpperCase()}, ${formatBytes(blob.size)}). Revisa la sincronización antes de publicar.`)
 }catch(e){toast('Exportación detenida: '+e.message);try{if(rec?.state==='recording')rec.stop()}catch(_){} }finally{exporting=false;document.body.inert=wasInert;playing=false;for(const event of deferredStudioMessages.splice(0))await receiveStudioMessage(event);cvs.width=savW;cvs.height=savH;updateCanvasDisplay();renderTimeline();render();$('playPause').textContent='▶ Reproducir'}}
/* Portabilidad: archivo JSON + ZIP (método STORE sin dependencias). */
function saveProjectObject(){const snapshot=JSON.parse(JSON.stringify(P));snapshot.savedAt=new Date().toISOString();snapshot.assetManifest=[...assets.values()].filter(a=>a.file).map(a=>({id:a.id,name:a.name,type:a.type,duration:a.duration,path:`media/${a.id}_${a.name.replace(/[^a-z0-9_.-]/gi,'_')}`}));snapshot.identityOverrides={};for(const k of Object.keys(identityOverrides)){const a=getAsset('identity_'+k);if(a?.file)snapshot.identityOverrides[k]='identity_'+k}snapshot.layerScenes=Object.fromEntries([...assets.values()].filter(a=>a.layerScene).map(a=>[a.id,a.layerScene]));snapshot.mediaNote='En JSON suelto los medios se vuelven a enlazar por nombre. El ZIP portátil incluye archivos cargados desde el equipo.';return snapshot}
const crcTable=(()=>{const tab=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);tab[n]=c>>>0}return tab})();
function crc32(bytes){let c=0xffffffff;for(let i=0;i<bytes.length;i++)c=crcTable[(c^bytes[i])&255]^(c>>>8);return (c^0xffffffff)>>>0}
function le16(v){return[v&255,(v>>>8)&255]}function le32(v){return[v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255]}
async function bundleZIP(files){const parts=[],central=[];let off=0;const enc=new TextEncoder();for(const [name,data] of files){const nb=enc.encode(name),bytes=data instanceof Uint8Array?data:new Uint8Array(await data.arrayBuffer());const crc=crc32(bytes),size=bytes.length;const local=new Uint8Array([0x50,0x4b,3,4,20,0,0,0,0,0,0,0,0,0,...le32(crc),...le32(size),...le32(size),...le16(nb.length),0,0]);parts.push(local,nb,bytes);central.push(new Uint8Array([0x50,0x4b,1,2,20,0,20,0,0,0,0,0,0,0,0,0,...le32(crc),...le32(size),...le32(size),...le16(nb.length),0,0,0,0,0,0,0,0,0,0,0,0,...le32(off)]),nb);off+=local.length+nb.length+size}
 const cSize=central.reduce((s,p)=>s+p.length,0),eocd=new Uint8Array([0x50,0x4b,5,6,0,0,0,0,...le16(files.length),...le16(files.length),...le32(cSize),...le32(off),0,0]);return new Blob([...parts,...central,eocd],{type:'application/zip'})}
function unzipStored(buf){const v=new DataView(buf),b=new Uint8Array(buf),dec=new TextDecoder(),files=new Map();let p=0;while(p+30<=b.length&&v.getUint32(p,true)===0x04034b50){const method=v.getUint16(p+8,true),size=v.getUint32(p+18,true),nl=v.getUint16(p+26,true),xl=v.getUint16(p+28,true),name=dec.decode(b.slice(p+30,p+30+nl)),start=p+30+nl+xl;if(method!==0)throw Error('El ZIP importable debe haberse creado desde este editor sin compresión');if(size>500_000_000)throw Error('Recurso demasiado grande');if(!name.includes('..')&&!name.startsWith('/')&&!name.startsWith('\\'))files.set(name,b.slice(start,start+size));p=start+size}return files}
async function saveBundle(){const pr=saveProjectObject(),files=[['proyecto.json',new TextEncoder().encode(JSON.stringify(pr,null,2))],['data/campana.json',new TextEncoder().encode(JSON.stringify(campaign,null,2))],['data/efectos.json',new TextEncoder().encode(JSON.stringify(window.MSCCS_EFFECTS,null,2))]];for(const a of assets.values())if(a.file){const meta=pr.assetManifest.find(m=>m.id===a.id);if(meta)files.push([meta.path,a.file])}try{toast('Preparando ZIP portátil con medios importados...');const blob=await bundleZIP(files);downloadBlob(blob,`MSCCS_PROYECTO_${P.conceptId||'V10'}.zip`);toast(`ZIP portátil exportado (${formatBytes(blob.size)})`)}catch(e){toast('No se pudo empaquetar: '+e.message)}}
async function restoreProject(pr){if(!pr||!pr.schemaVersion||!pr.timeline||!Array.isArray(pr.layers))throw Error('No es un proyecto MSCCS válido');stopPlayback();for(const k of ['name','ratio','template','conceptId','mode','fit','photo','quality','selectedMedia','layers','effect','effectIntensity','visual','timeline'])if(pr[k]!==undefined)P[k]=pr[k];P.ratio=RATIOS[P.ratio]?P.ratio:'4:5';P.mode=P.mode==='video'?'video':'art';P.timeline.clips||=[];P.timeline.overlays||=[];P.timeline.audio||=[];selectedLayer=P.layers.find(x=>x.type==='text')?.id||P.layers[0]?.id||'';$('ratio').value=P.ratio;$('template').value=P.template;$('resolution').value=P.quality;$('fit').value=P.fit;$('bgColor').value=P.visual.bg;$('imageBrightness').value=P.visual.brightness;$('imageContrast').value=P.visual.contrast;$('imageSharp').value=P.visual.clarity;$('outerFrame').value=P.visual.outerFrame||'none';$('outerInset').value=P.visual.outerInset||4;$('effectIntensity').value=Math.round(P.effectIntensity*100);setRatio(P.ratio);setMode(P.mode);renderLayers();syncInspector();renderConcepts();renderTimeline();renderEffects();setPrompt();toast('Proyecto recuperado')}
async function openProject(file){try{let pr;if(file.name.toLowerCase().endsWith('.zip')){const data=unzipStored(await file.arrayBuffer());const pj=data.get('proyecto.json');if(!pj)throw Error('ZIP sin proyecto.json');pr=JSON.parse(new TextDecoder().decode(pj));for(const entry of pr.assetManifest||[]){const bytes=data.get(entry.path);if(!bytes)continue;const ext=entry.name.split('.').pop().toLowerCase();const mime=entry.type==='video'?'video/'+(ext==='mov'?'quicktime':ext):entry.type==='audio'?'audio/'+ext:entry.type==='image'?'image/'+(ext==='jpg'?'jpeg':ext):'';const f=new File([bytes],entry.name,{type:mime}),u=URL.createObjectURL(f);assets.set(entry.id,{id:entry.id,name:entry.name,type:entry.type,duration:entry.duration,url:u,file:f});if(entry.type==='font')await importFonts([f])}for(const [k,id] of Object.entries(pr.identityOverrides||{})){const a=getAsset(id);if(a)identityOverrides[k]=a.url}const cj=data.get('data/campana.json');if(cj)campaign=JSON.parse(new TextDecoder().decode(cj));
 }else{const obj=JSON.parse(await file.text());if(Array.isArray(obj.concepts)){campaign=obj;renderConcepts();toast(`Importados ${campaign.concepts.length} conceptos en JSON`);return}pr=obj;importHints=pr.assetManifest||[];
   for(const ref of pr.assetManifest||[]){let a=[...assets.values()].find(x=>x.name===ref.name);if(a){const oldId=a.id;assets.delete(oldId);a.id=ref.id;assets.set(ref.id,a)}}
 }
 await restoreProject(pr);for(const [id,scene] of Object.entries(pr.layerScenes||{}))await attachLayerScene(getAsset(id),scene);updateIdentityList();renderMedia();
}catch(e){toast('Importación rechazada: '+e.message)}}
async function importFonts(files){for(const file of files){try{const family='MSCCS_LocalFont_'+(++fontSerial);const buf=await file.arrayBuffer(),ff=new FontFace(family,buf);await ff.load();document.fonts.add(ff);importedFonts.push({family,name:file.name,file});const id=uid('font');assets.set(id,{id,name:file.name,file,type:'font',url:'',duration:0});const o=new Option(`${file.name} (local)`,family);$('layerFont').add(o)}catch(e){toast('Fuente incompatible: '+file.name)}}$('fontList').textContent=importedFonts.map(f=>f.name).join(' · ');render()}
function buildAssetsForImportedFolder(fileList){importMedia([...fileList]);toast('Carpeta importada; revisa lista de medios. Conserva la carpeta para volver a vincular en JSON.')}
function setTemplate(t){pushHistory();P.template=t;const colors=TEMPLATES[t];P.visual.bg=colors.bg;$('bgColor').value=colors.bg;for(const l of P.layers)if(l.type==='text'){l.color=l.id==='headline'?colors.ink:l.id==='cta'?colors.accent:colors.sub;if(t==='cream'&&l.id==='headline')l.font='Georgia';if(t==='architect')l.frame='none'}renderLayers();syncInspector();render()}
function setLayerText(text){const l=selected();if(!l)return;l.text=text;render()}
function buildClipEffectOptions(){$('clipEffect').innerHTML=EFFECTS.map(e=>`<option value="${e.id}">${esc(e.name)}</option>`).join('')}
/* Captura de teclas y arrastre exacto de capas. */
function canvasPos(ev){const r=cvs.getBoundingClientRect();return{x:(ev.clientX-r.left)*cvs.width/r.width,y:(ev.clientY-r.top)*cvs.height/r.height}}
function getDraggableLayer(id){return P.mode==='art'?P.layers.find(x=>x.id===id):P.timeline.overlays.map(x=>x.layer).find(l=>l.id===id)}
cvs.addEventListener('pointerdown',ev=>{const p=canvasPos(ev),boxes=window.__msccsBoxes||[];const hit=[...boxes].reverse().find(b=>p.x>=b.x-12&&p.x<=b.x+b.w+12&&p.y>=b.y-12&&p.y<=b.y+b.h+12);if(!hit)return;const l=getDraggableLayer(hit.id);if(!l||l.locked)return;drag={id:l.id,dx:p.x-l.x*cvs.width,dy:p.y-l.y*cvs.height};if(P.mode==='art'){selectedLayer=l.id;renderLayers();syncInspector()}cvs.setPointerCapture(ev.pointerId)});
cvs.addEventListener('pointermove',ev=>{if(!drag)return;const l=getDraggableLayer(drag.id);if(!l)return;const p=canvasPos(ev);l.x=clamp((p.x-drag.dx)/cvs.width,-.2,1.2);l.y=clamp((p.y-drag.dy)/cvs.height,-.2,1.2);if(P.mode==='art')syncInspector();render()});
cvs.addEventListener('pointerup',()=>{if(drag){drag=null;toast('Posición actualizada')}});cvs.addEventListener('pointercancel',()=>drag=null);
window.addEventListener('keydown',ev=>{if(exporting)return;if(['INPUT','TEXTAREA','SELECT'].includes(ev.target.tagName))return;if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='z'){ev.preventDefault();undo()}if((ev.ctrlKey||ev.metaKey)&&ev.key.toLowerCase()==='y'){ev.preventDefault();redoHistory()}if(P.mode==='video'&&ev.key===' '){ev.preventDefault();togglePlayback()}});
/* Enlaces de controles */
$('modeArt').onclick=()=>setMode('art');$('modeVideo').onclick=()=>setMode('video');
$('btnUndo').onclick=undo;$('btnRedo').onclick=redoHistory;
$('btnNew').onclick=()=>{if(!confirm('¿Crear nueva composición? Se reinicia la línea de tiempo; los archivos locales permanecen en Medios.'))return;stopPlayback();P.timeline={clips:[],overlays:[],audio:[]};P.photo='';loadConcept(campaign.concepts[0].id);playhead=0;renderTimeline()};
$('btnOpenProject').onclick=()=>$('projectFile').click();$('projectFile').onchange=ev=>{const f=ev.target.files?.[0];if(f)openProject(f);ev.target.value=''};
$('btnSaveJson').onclick=()=>downloadJSON(saveProjectObject(),'MSCCS_CREATIVE_STUDIO_proyecto.json');$('btnSaveBundle').onclick=saveBundle;
$('btnExportImage').onclick=exportImage;$('btnExportVideo').onclick=exportVideo;
$('ratio').onchange=()=>setRatio($('ratio').value);$('resolution').onchange=()=>{P.quality=$('resolution').value;toast(`Exportación: ${P.quality==='4k'?'alta resolución, no superresolución IA':'previsualización 1080'}`)};
$('btnGuides').onclick=()=>{showGuides=!showGuides;$('btnGuides').classList.toggle('on',showGuides);render()};
$('filterBrand').onchange=renderConcepts;$('searchConcept').oninput=renderConcepts;
for(const b of document.querySelectorAll('[data-left]'))b.onclick=()=>{document.querySelectorAll('[data-left]').forEach(x=>x.classList.toggle('on',x===b));$('leftConcepts').hidden=b.dataset.left!=='concepts';$('leftMedia').hidden=b.dataset.left!=='media';$('leftAssets').hidden=b.dataset.left!=='assets'};
$('mediaFile').onchange=e=>{const fs=[...e.target.files||[]];importMedia(fs);if(mediaPicking==='layer'&&fs.length){const a=[...assets.values()].find(x=>x.name===fs[0].name);if(a)addImageLayer(a.id)}mediaPicking='';e.target.value=''};
$('folderFile').onchange=e=>{buildAssetsForImportedFolder(e.target.files);e.target.value=''};
for(const el of [document.querySelector('.canvas-scroll'),document.querySelector('.canvas-stage')]){
 el.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='copy'});
 el.addEventListener('drop',e=>{e.preventDefault();const files=[...e.dataTransfer.files||[]];if(!files.length)return;importMedia(files);const f=files[0],a=[...assets.values()].find(x=>x.name===f.name);if(!a)return;if(a.type==='image'){P.photo=a.url;setMode('art');render();toast('Imagen importada al lienzo')}else if(a.type==='video'){setMode('video');setTimeout(()=>addClip(a.id),600)}else toast('Audio importado; añádelo a la pista desde Medios')});
} 
$('fontFiles').onchange=e=>{importFonts(e.target.files);e.target.value=''};
$('btnUseOfficial').onclick=useOfficial;
$('template').onchange=()=>setTemplate($('template').value);$('fit').onchange=()=>{P.fit=$('fit').value;render()};
$('bgColor').oninput=()=>{P.visual.bg=$('bgColor').value;render()};
$('outerFrame').onchange=()=>{P.visual.outerFrame=$('outerFrame').value;render()};$('outerInset').oninput=()=>{P.visual.outerInset=+$('outerInset').value;$('frameInsetOut').textContent=P.visual.outerInset+'%';render()};
for(const [id,k,out] of [['imageBrightness','brightness','brightnessOut'],['imageContrast','contrast','contrastOut'],['imageSharp','clarity',null]])$(id).oninput=()=>{P.visual[k]=+$(id).value;if(out)$(out).textContent=P.visual[k]+'%';render()};
for(const id of ['layerText','posX','posY','layerScale','layerOpacity','layerRotate','layerFont','layerFontSize','layerColor','layerWeight','layerAlign','layerTracking','layerLineHeight','layerFrame','layerGlow','layerBlur','layerPad','layerVisible','layerLocked'])$(id).addEventListener('input',applyInspector);
$('addText').onclick=()=>{pushHistory();const l=makeLayer(uid('text'),'text','Texto nuevo','TEXTO',.15,.45,48);P.layers.push(l);selectedLayer=l.id;renderLayers();syncInspector();render()};
$('addImageLayer').onclick=()=>{const a=getAsset(P.selectedMedia);if(a?.type==='image')addImageLayer(a.id);else{document.querySelector('[data-left="media"]').click();mediaPicking='layer';$('mediaFile').click()}};
$('duplicateLayer').onclick=()=>{const l=selected();if(!l)return;pushHistory();const d=structuredClone(l);d.id=uid('layer');d.label+=' (copia)';d.x+=.035;d.y+=.035;P.layers.push(d);selectedLayer=d.id;renderLayers();syncInspector();render()};
$('deleteLayer').onclick=()=>{const l=selected();if(!l)return;pushHistory();P.layers=P.layers.filter(x=>x.id!==l.id);selectedLayer=P.layers[0]?.id||'';renderLayers();syncInspector();render()};
$('effectSearch').oninput=renderEffects;$('effectIntensity').oninput=()=>{P.effectIntensity=+$('effectIntensity').value/100;$('intensityOut').textContent=$('effectIntensity').value+'%';render()};$('btnPreviewEffect').onclick=startEffectPreview;
$('copyCleanPrompt').onclick=()=>copyText(getConcept().prompts?.FOTO_LIMPIA||getConcept().prompts?.CON_LETRAS||'');
$('frameSelect').onchange=showFramePrompt;$('copyFramePrompt').onclick=()=>copyText($('framePromptPreview').value);$('copyTextPrompt').onclick=()=>copyText(getConcept().prompts?.CON_LETRAS||'');$('exportPrompts').onclick=()=>downloadJSON({schemaVersion:'10.0',concepts:campaign.concepts.map(({id,sku,brand,prompts,frame_actions,reference_element})=>({id,sku,brand,prompts,frame_actions,reference_element}))},'MSCCS_PROMPTS_HIGGSFIELD_17X17.json');
$('playPause').onclick=togglePlayback;$('splitClip').onclick=splitAtPlayhead;$('copyClip').onclick=copySelectedClip;$('pasteClip').onclick=pasteClip;$('removeClip').onclick=removeTimeline;
$('scrubber').oninput=()=>{const pos=+$('scrubber').value/1000*timelineTotal();stopPlayback();timelineSeek(pos)};
$('addTextOverlay').onclick=()=>addOverlay('text');$('addLogoOverlay').onclick=()=>addOverlay('image');$('addAudio').onclick=()=>{const a=getAsset(P.selectedMedia);if(a?.type==='audio')addAudioTrack(a.id);else{document.querySelector('[data-left="media"]').click();toast('Importa o selecciona un audio y pulsa + Audio')}};
$('addImageClip').onclick=()=>{const a=getAsset(P.selectedMedia);if(a?.type==='image')return addClip(a.id);const d=getConcept(),id='builtin_'+d.sku;assets.set(id,{id,name:`${d.brand}_${d.sku}_MASTER.png`,url:d.productAsset,type:'image',duration:4});addClip(id);renderMedia()};
for(const id of ['trimStart','trimEnd','clipSpeed','clipEffect','clipMute','clipVolume','clipMotionText','clipMotionAmount','clipMotionStart','clipMotionDuration'])$(id).addEventListener('input',applyClipChanges);
for(const id of ['audioStart','audioEnd','audioVolume','audioMute'])$(id).addEventListener('input',()=>{const a=P.timeline.audio.find(x=>x.id===selectedTimeline?.id);if(!a)return;a.start=Math.max(0,+$('audioStart').value);a.end=Math.max(a.start+.1,+$('audioEnd').value);a.volume=+$('audioVolume').value/100;a.mute=$('audioMute').checked;renderTimeline()});
for(const id of ['overlayStart','overlayEnd','overlayText'])$(id).addEventListener('input',()=>{const o=P.timeline.overlays.find(x=>x.id===selectedTimeline?.id);if(!o)return;o.start=Math.max(0,+$('overlayStart').value);o.end=Math.max(o.start+.1,+$('overlayEnd').value);o.layer.text=$('overlayText').value;renderTimeline();render()});
$('clipMoveLeft').onclick=()=>moveClip(-1);$('clipMoveRight').onclick=()=>moveClip(1);
window.addEventListener('resize',updateCanvasDisplay);

function selectedMotionClip(){return selectedTimeline?.kind==='clip'?P.timeline.clips.find(c=>c.id===selectedTimeline.id):null;}
function syncPlaneInspector(clip){
 const select=$('motionPlane');if(!select)return;const previous=select.value;select.replaceChildren();
 for(const p of getAsset(clip.assetId)?.layerScene?.planes||[]){const option=document.createElement('option');option.value=p.id;option.textContent=p.name||p.id;select.appendChild(option);}
 if([...select.options].some(p=>p.value===previous))select.value=previous;
 $('planeSeed').value=clip.motion?.seed??24;readPlaneKey();
}
function readPlaneKey(){
 const clip=selectedMotionClip(),id=$('motionPlane').value;if(!clip||!id)return;
 const frame=window.SLLayerMotion.keyframe(clip.layerKeys?.[id],Number($('planeTime').value)||0);
 $('planeX').value=Math.round(frame.x*10000)/100;$('planeY').value=Math.round(frame.y*10000)/100;$('planeScale').value=frame.scale;$('planeRotation').value=frame.rotation;$('planeOpacity').value=frame.opacity*100;
 if($('planeKeys'))$('planeKeys').textContent='Claves: '+(clip.layerKeys?.[id]||[]).map(k=>k.time+' s').join(' · ');
}
for(const id of ['motionPlane','planeTime'])$(id).addEventListener('input',readPlaneKey);
$('planeSeed').addEventListener('input',()=>{const clip=selectedMotionClip();if(!clip)return;clip.motion={...clip.motion,seed:Number($('planeSeed').value)>>>0};render();saveVideoWorkspace();});
function writePlaneKey(){
 const clip=selectedMotionClip(),id=$('motionPlane').value;if(!clip||!id)return toast('El clip no tiene planos editables; envíalo desde Estudio.');
 const time=clamp(Number($('planeTime').value)||0,0,clipDuration(clip));
 const key={time,x:clamp(Number($('planeX').value)||0,-100,100)/100,y:clamp(Number($('planeY').value)||0,-100,100)/100,scale:clamp(Number($('planeScale').value)||1,.01,10),rotation:clamp(Number($('planeRotation').value)||0,-360,360),opacity:clamp(Number($('planeOpacity').value)/100,0,1)};
 clip.layerKeys||={};clip.layerKeys[id]=[...(clip.layerKeys[id]||[]).filter(k=>Math.abs(k.time-time)>.001),key].sort((a,b)=>a.time-b.time);readPlaneKey();render();saveVideoWorkspace();
}
$('savePlaneKey').onclick=writePlaneKey;
$('removePlaneKey').onclick=()=>{const clip=selectedMotionClip(),id=$('motionPlane').value;if(!clip?.layerKeys?.[id])return;const t=Number($('planeTime').value)||0;clip.layerKeys[id]=clip.layerKeys[id].filter(k=>Math.abs(k.time-t)>.001);render();saveVideoWorkspace();};
$('seedPlaneMotion').onclick=()=>{
 const clip=selectedMotionClip(),asset=clip&&getAsset(clip.assetId);if(!asset?.scene)return toast('Envía una composición multicapa desde Estudio.');
 clip.motion||={};clip.motion.seed=Number($('planeSeed').value)>>>0;const rng=window.SLLayerMotion.random(clip.motion.seed);clip.layerKeys||={};
 for(const p of asset.scene.planes){if(['product','logo','qr'].includes(p.role))continue;
  clip.layerKeys[p.id]=[{time:0,x:0,y:0,scale:1,opacity:1,rotation:0},{time:clipDuration(clip),x:(rng()-.5)*.035,y:(rng()-.5)*.025,scale:p.role==='background'?1.03:1,opacity:1,rotation:0}];
 }render();saveVideoWorkspace();toast('Movimiento generado; producto, logo y QR conservan su geometría.');
};
$('analyzeVoice').onclick=async()=>{
 const clip=selectedMotionClip();if(!clip)return toast('Selecciona un clip de imagen.');
 const info=timelineAt(playhead),track=P.timeline.audio.find(a=>playhead>=a.start&&playhead<a.end),asset=track&&getAsset(track.assetId);
 if(!asset?.file)return toast('Añade un archivo de audio local en la pista, sitúa el cabezal sobre él y vuelve a analizar.');
 let context;try{const AC=window.AudioContext||window.webkitAudioContext;context=new AC();const buffer=await context.decodeAudioData(await asset.file.arrayBuffer());
 const start=Math.max(0,(info?.start||0)-track.start),end=Math.min(buffer.duration,start+clipDuration(clip));
 clip.waveform=window.SLLayerMotion.peaks(Array.from({length:buffer.numberOfChannels},(_,i)=>buffer.getChannelData(i).slice(Math.floor(start*buffer.sampleRate),Math.floor(end*buffer.sampleRate))),128);
 clip.waveformSource={assetId:asset.id,start,end};render();saveVideoWorkspace();toast('Onda extraída del archivo local.');
 }catch(e){toast('No se pudo analizar el audio: '+e.message);}finally{await context?.close();}
};

function init(){P.layers=newLayers(getConcept());selectedLayer='headline';$('template').value=P.template;$('bgColor').value=P.visual.bg;for(const k of ['logo','buenFin','qr'])getImage(identitySource(k));renderConcepts();updateIdentityList();buildClipEffectOptions();renderLayers();syncInspector();renderEffects();renderTimeline();setPrompt();setRatio('4:5');setTimeout(updateCanvasDisplay,120);toast('V10 listo: arrastra una foto o impórtala desde Medios')}
/* SUPREMO LÍDER V1: puente de medios al motor V10, sin interferir con sus controles. */
const embeddedVideo=window.parent!==window&&new URLSearchParams(location.search).get('mode')==='video';
let videoWorkspaceReady=false,lastVideoWorkspace='';
function linkedStudioImage(assetId, file, existingOnly = false){
 if(typeof assetId!=='string'||!/^media_[a-z0-9_]+$/.test(assetId)||
    !(file instanceof File)||file.type!=='image/png'||!file.size||file.size>25*1024*1024)return null;
 const id='supremo_'+assetId;
 const previous=assets.get(id);
 if(existingOnly&&!previous)return null;
 const url=URL.createObjectURL(file);
 const asset={id,name:file.name,file,url,type:'image',duration:4,studioAssetId:assetId};
 assets.set(id,asset);
 if(previous){URL.revokeObjectURL(previous.url);imageCache.delete(previous.url);}
 getImage(url);
 return asset;
}

async function receiveStudioMessage(event){
 if(window.parent===window||event.source!==window.parent) return;
 if(exporting){deferredStudioMessages.push(event);return;}
 const targetOrigin=event.origin==='null'?'*':event.origin;
 const m=event.data||{};
 if(m.type==='SL1_WORKSPACE_RESTORE'&&embeddedVideo&&!videoWorkspaceReady){
  try{await restoreVideoWorkspace(m);renderMedia();updateIdentityList();}
  catch(error){toast('No se pudo restaurar la línea de tiempo. '+error.message);}
  videoWorkspaceReady=true;
  return;
 }
 if(m.type==='SL1_PING'){
  if(!embeddedVideo||videoWorkspaceReady)window.parent.postMessage({type:'SL1_READY'},targetOrigin);
  return;
 }
 if(m.type==='SL1_UPDATE_STUDIO'){
  const asset=linkedStudioImage(m.studioAssetId,m.file,true);if(asset){await attachLayerScene(asset,m.layerScene);renderMedia();renderTimeline();render();}
  return;
 }
 if(m.type==='SL1_MODE') {setMode(m.mode==='video'?'video':'art');return;}
 if(m.type==='SL1_LOAD_CONCEPT') {if(typeof m.id==='string')loadConcept(m.id);return;}
 if(m.type==='SL1_IMPORT'){
  try{
   if(m.conceptId && campaign.concepts.some(d=>d.id===m.conceptId))loadConcept(m.conceptId);
   const files=Array.isArray(m.files)?m.files.filter(f=>f instanceof File):[];
   const first=files[0];
   const linked=m.studioAssetId?linkedStudioImage(m.studioAssetId,first):null;
   await attachLayerScene(linked,m.layerScene);
   if(files.length&&!linked)importMedia(files);
   const firstAsset=linked||(first?[...assets.values()].reverse().find(a=>a.name===first.name):null);
   const target=m.mode==='video'?'video':'art';setMode(target);
   if(firstAsset){P.selectedMedia=firstAsset.id;
    if(target==='art'&&m.setBackground&&firstAsset.type==='image'){P.photo=firstAsset.url;render();}
    if(target==='video'&&m.addClip){
     if(firstAsset.type==='audio')addAudioTrack(firstAsset.id);
     else if(!linked||!P.timeline.clips.some(clip=>clip.assetId===firstAsset.id))addClip(firstAsset.id);
    }
   }
   renderMedia();render();toast(`${files.length} medios recibidos desde Supremo Líder`);
   if(window.parent!==window)window.parent.postMessage({type:'SL1_ACK',engine:'creative',count:files.length},targetOrigin);
  }catch(err){console.error('SL1_IMPORT',err);toast('Error de puente: '+err.message);}
 }
 if(m.type==='SL1_CAMPAIGN'&&m.campaign&&Array.isArray(m.campaign.concepts)){
  campaign=structuredClone(m.campaign);renderConcepts();loadConcept(campaign.concepts[0].id);
 }
}
window.addEventListener('message',receiveStudioMessage);

init();
const editStudioSource=document.createElement('button');
editStudioSource.type='button';
editStudioSource.textContent='Editar capas en Estudio';
editStudioSource.hidden=true;
$('clipInspector').append(editStudioSource);
editStudioSource.onclick=()=>{
 const clip=P.timeline.clips.find(item=>item.id===selectedTimeline?.id);
 const id=getAsset(clip?.assetId)?.studioAssetId;
 if(id)window.parent.postMessage({type:'SL1_EDIT_STUDIO',assetId:id},'*');
};
const syncOriginalClipInspector=syncClipInspector;
syncClipInspector=function(){
 syncOriginalClipInspector();
 const clip=P.timeline.clips.find(item=>item.id===selectedTimeline?.id);
 editStudioSource.hidden=!getAsset(clip?.assetId)?.studioAssetId||window.parent===window;
};
const attachTrack=document.createElement('input');
attachTrack.type='file';
attachTrack.accept='.json,application/json';
const trackLabel=document.createElement('label');
trackLabel.textContent='Anclar al sujeto · trayectoria JSON del mismo video';
trackLabel.append(attachTrack);
const detachTrack=document.createElement('button');
detachTrack.type='button';
detachTrack.textContent='Quitar seguimiento del rótulo';
$('overlayInspector').append(trackLabel,detachTrack);
function selectedOverlay(){return P.timeline.overlays.find(item=>item.id===selectedTimeline?.id);}
attachTrack.onchange=async()=>{
 const overlay=selectedOverlay(),file=attachTrack.files?.[0];
 attachTrack.value='';
 if(!overlay||!file)return;
 try{
  if(file.size>65536)throw Error('La trayectoria debe ocupar menos de 64 KB.');
  const info=timelineAt(overlay.start);
  if(!info||getAsset(info.clip.assetId)?.type!=='video')throw Error('El rótulo debe comenzar dentro del clip de video que analizaste.');
  const points=validatedTrajectory(JSON.parse(await file.text()));
  overlay.subjectTrack={clipId:info.clip.id,points};
  saveVideoWorkspace();
  render();
  toast('Rótulo anclado al sujeto. Colócalo respecto al sujeto en el primer cuadro.');
 }catch(error){toast(error.message);}
};
detachTrack.onclick=()=>{
 const overlay=selectedOverlay();
 if(!overlay)return;
 delete overlay.subjectTrack;
 saveVideoWorkspace();
 render();
 toast('Seguimiento retirado.');
};
if(new URLSearchParams(location.search).get('mode')==='video'){
 $('modeArt').hidden=true;
 setMode('video');
 if(embeddedVideo){document.body.classList.add('sl-video-embedded');updateCanvasDisplay();window.parent.postMessage({type:'SL1_WORKSPACE_OPEN'},'*');}
}
})();

window.VideoDiagnostics={snapshot:()=>saveProjectObject(),scene:()=>{const clip=selectedMotionClip();return clip&&clipScene(clip);},frame:(time=0)=>{const c=document.createElement('canvas');[c.width,c.height]=RATIOS[P.ratio];renderToCanvas(c,time,true);return c;}};
