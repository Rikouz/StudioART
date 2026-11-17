'use strict';
(function(){
const $=id=>document.getElementById(id);
const EL=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=String(content);return e;};
const stateKey='SUPREMO_LIDER_V1_PROJECT'+(window.SL_AUDIT_ID?'_AUDIT_'+window.SL_AUDIT_ID:'');
const initial={version:'1.0',name:'Campaña Buen Fin 2026',status:{},frames:{},notes:{},frameAssets:{},camera:{},carousel:{slides:[]},libraryView:{},qa:{},updatedAt:''};
let state;try{state=Object.assign(structuredClone(initial),JSON.parse(localStorage.getItem(stateKey)||'{}'));}catch(e){state=structuredClone(initial)}
const S=window.Supremo={state,data:null,media:[],selectedMediaId:null,selectedConceptId:null,selectedFrame:0,promptMode:'SIN_LETRAS',visiblePage:'inicio',urls:new Map(),ready:false};
const notify=(msg)=>{const e=$('notify');e.textContent=msg;e.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>e.classList.remove('show'),3400);};S.notify=notify;
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const saveState=()=>{state.updatedAt=new Date().toISOString();try{localStorage.setItem(stateKey,JSON.stringify(state));}catch(e){console.warn('No se pudo conservar estado local',e);notify('El navegador bloqueó almacenamiento local: descarga un JSON de respaldo.');}};S.save=saveState;
const copy=async text=>{try{await navigator.clipboard.writeText(text)}catch(e){const a=EL('textarea');a.value=text;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()}notify('Contenido copiado.');};S.copy=copy;
const download=(blob,name)=>{const u=URL.createObjectURL(blob),a=EL('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),60000);};S.download=download;
const jsonDownload=(value,name)=>download(new Blob([JSON.stringify(value,null,2)],{type:'application/json;charset=utf-8'}),name);
const concepts=()=>S.data?.concepts||[];
function mediaURL(rec){if(!rec)return'';if(rec.builtin)return window.SL_INLINE_MEDIA?.[rec.sku]||rec.path;if(S.urls.has(rec.id))return S.urls.get(rec.id);if(rec.blob){const u=URL.createObjectURL(rec.blob);S.urls.set(rec.id,u);return u;}return '';}S.mediaURL=mediaURL;
function thumb(rec){if(rec?.type==='image')return mediaURL(rec);return null;}
const isImported=rec=>rec&&!rec.builtin;
async function assetFile(rec){if(!rec)return null;if(rec.blob)return new File([rec.blob],rec.name,{type:rec.mime||rec.blob.type||'application/octet-stream'});if(rec.builtin){const src=window.SL_INLINE_MEDIA?.[rec.sku];if(!src)return null;const bin=atob(src.split(',')[1]),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return new File([bytes],rec.name,{type:'image/png'});}return null;}S.assetFile=assetFile;
function selectMedia(id){const old=S.selectedMediaId;S.selectedMediaId=id;
for(const button of $('mediaGrid').querySelectorAll('[data-media-id]'))if(button.dataset.mediaId===id||button.dataset.mediaId===old)button.classList.toggle('active',button.dataset.mediaId===id);
const selected=S.media.find(item=>item.id===id);
$('mediaMove').disabled=!selected||selected.builtin;
$('mediaAuto').disabled=!selected?.catalogFolder||selected.builtin;
saveLibraryView();refreshSelectors();notify('Medio seleccionado para edición / carrusel.');}S.selectMedia=selectMedia;
function recordStatus(id){return state.status[id]||'pendiente';}
function progress(){const all=concepts(),statuses=all.map(d=>recordStatus(d.id));$('statConcepts').textContent=all.length;$('statFrames').textContent=all.reduce((n,d)=>n+(d.videoFrames?.length||0),0);$('statMedia').textContent=S.media.filter(isImported).length;$('statReady').textContent=statuses.filter(x=>['aprobado','publicado'].includes(x)).length;const groups=[['Por generar',statuses.filter(x=>x==='pendiente').length],['Prompt preparado',statuses.filter(x=>x==='prompt').length],['Generado',statuses.filter(x=>x==='generado').length],['En QA',statuses.filter(x=>x==='qa').length],['Aprobado / publicado',statuses.filter(x=>['aprobado','publicado'].includes(x)).length]];$('flowRows').replaceChildren(...groups.map(([title,n])=>{const root=EL('div','flow');root.innerHTML=`<label>${escapeHtml(title)}</label><div class="bar"><i style="width:${all.length?Math.round(n/all.length*100):0}%"></i></div><span>${n} / ${all.length}</span>`;return root}));}
function updateNavigation(page){page=({imagen:'estudio',editorial:'estudio',clasico:'carruseles'})[page]||page;
if(S.visiblePage==='medios'&&page!=='medios')releaseThumbnails();S.visiblePage=page;document.body.dataset.page=page;for(const x of document.querySelectorAll('.page'))x.classList.toggle('active',x.id==='page-'+page);for(const x of document.querySelectorAll('#navigation [data-page]'))x.classList.toggle('active',x.dataset.page===page);const titles={inicio:['OPERACIÓN CENTRAL / CAMPANAS','Centro de producción'],prompts:['HIGGSFIELD / GENERACIÓN','Prompts y frames'],medios:['ACTIVOS / IDENTIDAD','Biblioteca de medios'],camara:['CINEMATOGRAFÍA / 2D','Cámara y GIF'],carruseles:['SECUENCIAS / C4–C8','Carruseles'],imagen:['MOTOR EXISTENTE / V10','Editor de imágenes'],estudio:['COMPOSICIÓN Y CAPAS','Estudio de imagen'],video:['MOTOR EXISTENTE / V10','Editor de video'],editorial:['EDITORIAL / V10','Maquetación exacta'],clasico:['LEGACY PRESERVADO / V3','Carrusel clásico'],calidad:['QA / APROBACIONES','Control de calidad'],proyecto:['DATOS / MIGRACIÓN','Proyecto maestro']};$('sectionKicker').textContent=titles[page]?.[0]||page;$('sectionTitle').textContent=titles[page]?.[1]||page;S.visiblePage=page;history.replaceState(null,'','#'+page);if(page==='medios')renderMedia();if(page==='carruseles')window.CarouselStudio?.render?.();if(page==='camara')window.CameraStudio?.render?.();}S.goto=updateNavigation;
function filterConcepts(){const q=$('promptSearch').value.toLowerCase(),b=$('promptBrand').value;return concepts().filter(d=>(!b||d.brand===b)&&[d.sku,d.id,d.headline,d.scene,d.name].join(' ').toLowerCase().includes(q));}
function renderPrompts(){const result=filterConcepts();$('promptList').replaceChildren(...result.map(d=>{const row=EL('button','prompt-item'+(S.selectedConceptId===d.id?' active':''));row.innerHTML=`<img src="${escapeHtml((window.SL_INLINE_MEDIA?.[d.sku]||''))}" alt=""><div class="meta"><strong>${escapeHtml(d.id)} · ${escapeHtml(d.sku)}</strong><span>${escapeHtml(d.headline)}</span><small>${escapeHtml(recordStatus(d.id))}</small></div>`;row.onclick=()=>selectConcept(d.id);return row;}));}
function selectConcept(id){const d=concepts().find(x=>x.id===id);if(!d)return;S.selectedConceptId=id;S.selectedFrame=0;$('promptId').textContent=`${d.id} / ${d.brand} / ${d.sku}`;$('promptHeadline').textContent=d.headline;$('promptThumb').src=(window.SL_INLINE_MEDIA?.[d.sku]||'');$('promptDescription').textContent=d.name+' · '+d.scene+' · '+d.layout;$('sceneText').textContent=d.venue||d.scene;$('promptStage').value=recordStatus(id);$('promptStatus').textContent=recordStatus(id);$('promptNotes').value=state.notes[id]||'';
$('promptReferences').replaceChildren(...(d.references||[]).map((r,i)=>{const div=EL('div','ref');div.innerHTML=`<input type="checkbox" ${i<4?'':'disabled'} title="Seleccionar en Higgsfield"><span>${escapeHtml(r)}</span>`;return div;}));
for(const button of document.querySelectorAll('[data-prompt]'))button.classList.toggle('active',button.dataset.prompt===S.promptMode);showPrompt();showFrames();renderPrompts();}
function currentConcept(){return concepts().find(d=>d.id===S.selectedConceptId)||concepts()[0];}
function showPrompt(){const d=currentConcept();if(!d)return;$('promptText').value=d.prompts?.[S.promptMode]||d.prompts?.SIN_LETRAS||d.prompts?.FOTO_LIMPIA||'';const n=$('promptText').value.length;$('promptLength').textContent=`${n} / 3,000 caracteres ${n>3000?'— EXCEDE LÍMITE':''}`;$('promptLength').style.color=n>3000?'#ffb4a0':'';}
function showFrames(){const d=currentConcept();if(!d)return;const frames=d.videoFrames||[];$('frameTabs').replaceChildren(...frames.map((x,i)=>{const btn=EL('button',S.selectedFrame===i?'active':'',`F${String(i+1).padStart(2,'0')}${state.frames[d.id+':'+i]?' ✓':''}`);btn.onclick=()=>{S.selectedFrame=i;showFrames()};return btn;}));const f=S.selectedFrame;$('frameText').value=frames[f]||'';$('frameCounter').textContent=`${$('frameText').value.length} caracteres`;$('frameAction').textContent=d.frame_actions?.[f]||'';$('frameDone').checked=!!state.frames[d.id+':'+f];const assigned=state.frameAssets?.[d.id+':'+f];$('linkFrameImage').textContent=assigned?'Imagen asignada ✓ · cambiar':'Asignar foto a este frame';}
const catalogView={mode:'folders',parent:'',page:0};
const pageSize=48;

function restoreLibraryView(saved=state.libraryView){
  const view=saved && typeof saved==='object'?saved:{};
  catalogView.mode=view.mode==='files'?'files':'folders';
  catalogView.parent=typeof view.parent==='string'?view.parent:'';
  if(catalogView.parent){
    const folders=S.media.map(SLCatalog.folder);
    while(catalogView.parent && !folders.some(folder=>folder===catalogView.parent||folder.startsWith(catalogView.parent+' › '))){
      catalogView.parent=catalogView.parent.split(' › ').slice(0,-1).join(' › ');
    }
  }
  catalogView.page=Number.isSafeInteger(view.page)&&view.page>=0?view.page:0;
  $('mediaFilter').value=typeof view.query==='string'?view.query:'';
  $('mediaType').value=['image','video','audio'].includes(view.type)?view.type:'';
  S.selectedMediaId=S.media.some(item=>item.id===view.selectedMediaId)?view.selectedMediaId:null;
}

function saveLibraryView(){
  state.libraryView={...catalogView,query:$('mediaFilter').value,type:$('mediaType').value,selectedMediaId:S.selectedMediaId};
  saveState();
}

function renderAndSaveLibraryView(){
  renderMedia();
  saveLibraryView();
}
S.libraryImages=()=>{
  const query=$('mediaFilter').value;
  if(!catalogView.parent&&!query.trim())return [];
  return SLCatalog.scoped(S.media,catalogView.parent,query,'image').filter(item=>!item.builtin);
};
let thumbnailURLs=[];
function releaseThumbnails(){
  $('mediaGrid').replaceChildren();
  for(const url of thumbnailURLs)URL.revokeObjectURL(url);
  thumbnailURLs=[];
}
function thumbnailURL(record){
  if(record.builtin)return mediaURL(record);
  if(!record.blob)return '';
  const url=URL.createObjectURL(record.blob);
  thumbnailURLs.push(url);
  return url;
}
function libraryCard(asset) {
  const box=EL('div','asset-card'+(asset.id===S.selectedMediaId?' active':''));
  box.dataset.mediaId=asset.id;box.onclick=()=>selectMedia(asset.id);
  if(asset.type==='image'){
    const img=EL('img');img.src=thumbnailURL(asset);img.loading='lazy';img.decoding='async';img.alt=asset.name;box.appendChild(img);
  } else box.appendChild(EL('div','placeholder',asset.type==='video'?'VIDEO':'AUDIO'));
  const name=EL('strong',null,asset.name);name.title=asset.name;box.appendChild(name);
  const location=SLCatalog.folder(asset);
  const label=EL('small',null,location);label.title=location;box.appendChild(label);
  const actions=EL('div','asset-actions');
  const choose=EL('button',null,'Elegir');
  choose.onclick=event=>{event.stopPropagation();selectMedia(asset.id);};actions.appendChild(choose);
  if(asset.studioRecipe){
    const edit=EL('button',null,'Editar');edit.onclick=event=>{event.stopPropagation();window.SupremoEstudio?.openRecipe(asset);};actions.appendChild(edit);
  }
  if(!asset.builtin){
    const del=EL('button',null,'Borrar');del.onclick=async event=>{
      event.stopPropagation();
      if(!confirm('¿Eliminar este archivo de la Biblioteca local?'))return;
      await SLStore.delete(asset.id);S.media=S.media.filter(item=>item.id!==asset.id);
      if(S.urls.has(asset.id))URL.revokeObjectURL(S.urls.get(asset.id));S.urls.delete(asset.id);
      if(S.selectedMediaId===asset.id)S.selectedMediaId=null;
      renderAndSaveLibraryView();refreshSelectors();progress();
    };actions.appendChild(del);
  }
  box.appendChild(actions);return box;
}
function renderMedia(){
  if(S.visiblePage!=='medios')return;
  const query=$('mediaFilter').value,type=$('mediaType').value;
  const results=SLCatalog.scoped(S.media,catalogView.parent,query,type);
  const showFolders=catalogView.mode==='folders'&&!query.trim();
  const folders=showFolders?SLCatalog.groups(results,catalogView.parent):[];
  const direct=showFolders?results.filter(asset=>SLCatalog.folder(asset)===catalogView.parent):results;
  const entries=[...folders.map(entry=>({entry})),...direct.map(asset=>({asset}))];
  catalogView.page=Math.min(catalogView.page,Math.max(0,Math.ceil(entries.length/pageSize)-1));
  const offset=catalogView.page*pageSize;
  const page=entries.slice(offset,offset+pageSize);
  const priorURLs=thumbnailURLs;thumbnailURLs=[];
  $('mediaFolderGrid').replaceChildren(...page.filter(item=>item.entry).map(({entry:[name,count]})=>{
    const button=EL('button','folder-card');
    button.append(EL('strong',null,name),EL('small',null,count.toLocaleString('es-MX')+' recursos'));
    button.onclick=()=>{catalogView.parent=[catalogView.parent,name].filter(Boolean).join(' › ');catalogView.page=0;renderAndSaveLibraryView();};
    return button;
  }));
  $('mediaGrid').replaceChildren(...page.filter(item=>item.asset).map(item=>libraryCard(item.asset)));
  for(const url of priorURLs)URL.revokeObjectURL(url);
  $('mediaGrid').scrollTop=0;$('mediaFolderGrid').scrollTop=0;
  $('mediaBreadcrumb').textContent=['Biblioteca',catalogView.parent].filter(Boolean).join(' › ');
  $('mediaFeedback').textContent=results.length.toLocaleString('es-MX')+' recursos en esta vista';
  $('mediaPage').textContent=entries.length?`Página ${catalogView.page+1} de ${Math.ceil(entries.length/pageSize)}`:'Sin resultados';
  $('mediaPrev').disabled=!catalogView.page;
  $('mediaNext').disabled=offset+pageSize>=entries.length;
  $('mediaUp').hidden=!catalogView.parent;
  $('mediaFoldersTab').setAttribute('aria-pressed',String(catalogView.mode==='folders'));
  $('mediaFilesTab').setAttribute('aria-pressed',String(catalogView.mode==='files'));
  const selected=S.media.find(item=>item.id===S.selectedMediaId);
  $('mediaMove').disabled=!selected||selected.builtin;
  $('mediaAuto').disabled=!selected?.catalogFolder||selected.builtin;
}
function refreshSelectors(){
  const skus=[...new Set(concepts().map(item=>item.sku))];
  const opts=$('mediaSku'),sku=opts.value;
  opts.replaceChildren(new Option('Sin asignar SKU',''),...skus.map(value=>new Option(value,value)));opts.value=sku||'';
  for(const [id,type,saved] of [['cameraAsset','image',state.camera?.asset],['carouselBgAsset','image',state.carousel?.bgAsset],['carouselAudio','audio',state.carousel?.audio]]){
    const select=$(id),chosen=select.value||saved;
    const candidates=S.media.filter(item=>item.type===type);
    const important=candidates.filter(item=>item.id===chosen||item.id===S.selectedMediaId);
    const items=[...new Map([...important,...candidates.slice(0,80)].map(item=>[item.id,item])).values()];
    select.replaceChildren(new Option(type==='audio'?'Sin audio':'Selecciona recurso',''),...items.map(item=>new Option(item.name,item.id)));
    select.value=items.some(item=>item.id===chosen)?chosen:(id==='cameraAsset'?(items[0]?.id||''):'');
  }
  window.CameraStudio?.assetChanged?.();window.CarouselStudio?.assetChanged?.();
}
async function importFiles(files,metadata={}){const list=[...files].filter(f=>f.type.startsWith('image/')||f.type.startsWith('video/')||f.type.startsWith('audio/'));if(!list.length)return notify('No se encontraron archivos multimedia compatibles.');const imported=[];for(const f of list){let sku=$('mediaSku').value||concepts().map(d=>d.sku).find(s=>f.name.toUpperCase().includes(s.toUpperCase()))||'';const id='media_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9);const type=f.type.split('/')[0];let rec={id,name:f.name,sku,role:$('mediaRole').value,type,mime:f.type,blob:f,lastModified:f.lastModified||Date.now(),path:f.webkitRelativePath||'',builtin:false,addedAt:new Date().toISOString(),...metadata};try{await SLStore.put(rec);S.media.push(rec);imported.push(id);}catch(e){notify('Almacenamiento local lleno o no disponible: '+e.message);break;}}renderMedia();refreshSelectors();progress();notify(`${imported.length} recursos importados a la biblioteca persistente.`);return imported;}
S.importFiles=importFiles;
function setupMedia(){
  for(const id of ['mediaFiles','mediaFolder'])$(id).onchange=async event=>{await importFiles(event.target.files);event.target.value='';};
  for(const id of ['mediaFilter','mediaType'])$(id).oninput=()=>{catalogView.page=0;renderAndSaveLibraryView();};
  $('mediaClearSelection').onclick=()=>{S.selectedMediaId=null;renderAndSaveLibraryView();refreshSelectors();};
  $('mediaFoldersTab').onclick=()=>{catalogView.mode='folders';catalogView.parent='';catalogView.page=0;$('mediaFilter').value='';renderAndSaveLibraryView();};
  $('mediaFilesTab').onclick=()=>{catalogView.mode='files';catalogView.page=0;renderAndSaveLibraryView();};
  $('mediaUp').onclick=()=>{catalogView.parent=catalogView.parent.split(' › ').slice(0,-1).join(' › ');catalogView.page=0;renderAndSaveLibraryView();};
  $('mediaPrev').onclick=()=>{catalogView.page=Math.max(0,catalogView.page-1);renderAndSaveLibraryView();};
  $('mediaNext').onclick=()=>{catalogView.page++;renderAndSaveLibraryView();};
  async function assignFolder(reset){
    const asset=S.media.find(item=>item.id===S.selectedMediaId);
    if(!asset||asset.builtin)return;
    const value=reset?'':prompt('Carpeta. Para una subcarpeta usa / entre los nombres.',SLCatalog.folder(asset).replaceAll(' › ',' / '));
    if(value===null)return;
    const updated={...asset,catalogFolder:value.split(/[\/›]/).map(part=>part.trim()).filter(Boolean).slice(0,8).join(' › ').slice(0,220)};
    try{await SLStore.put(updated);Object.assign(asset,updated);renderAndSaveLibraryView();notify('Carpeta actualizada.');}
    catch(error){notify('No se pudo cambiar de carpeta. '+error.message);}
  }
  $('mediaCamera').onclick=()=>{
    const asset=mediaSelected();if(!asset||asset.type!=='image')return;
    updateNavigation('camara');
    $('cameraAsset').value=asset.id;
    $('cameraAsset').dispatchEvent(new Event('input'));
  };
  $('mediaCarousel').onclick=()=>{
    const asset=mediaSelected();if(!asset||asset.type!=='image')return;
    window.CarouselStudio.addMedia(asset.id,{unique:true});
    updateNavigation('carruseles');
  };
  $('mediaMove').onclick=()=>assignFolder(false);
  $('mediaAuto').onclick=()=>assignFolder(true);
}
function mediaSelected(){const a=S.media.find(x=>x.id===S.selectedMediaId);if(!a){notify('Selecciona un archivo en Biblioteca.');return null;}return a;}
const linkedVideoAssets = new Set();
function sendVideoMessage(message){
  const frame=$('videoFrame');
  return new Promise((resolve,reject)=>{
    function ping(){frame.contentWindow?.postMessage({type:'SL1_PING'},'*');}
    function stop(){clearInterval(retry);clearTimeout(timer);window.removeEventListener('message',receive);}
    function receive(event){
      if(event.source!==frame.contentWindow||event.data?.type!=='SL1_READY')return;
      stop();
      frame.contentWindow.postMessage(message,'*');
      resolve();
    }
    window.addEventListener('message',receive);
    const retry=setInterval(ping,150);
    const timer=setTimeout(()=>{stop();reject(Error('El editor de video no respondió.'));},6000);
    ping();
  });
}
S.sendToEngine=async ()=>{
  const asset=mediaSelected();
  if(!asset)return;
  updateNavigation('video');
  const file=await assetFile(asset);
  if(!file)throw Error('No se pudo obtener el archivo.');
  await sendVideoMessage({type:'SL1_IMPORT',files:[file],mode:'video',addClip:true,
    studioAssetId:asset.studioRecipe?asset.id:undefined,layerScene:asset.layerScene});
  if(asset.studioRecipe)linkedVideoAssets.add(asset.id);
};
S.updateLinkedVideo=async asset=>{
  if(!linkedVideoAssets.has(asset.id))return;
  $('videoFrame').contentWindow?.postMessage({type:'SL1_UPDATE_STUDIO',studioAssetId:asset.id,file:await assetFile(asset),layerScene:asset.layerScene},'*');
};
const videoWorkspaceId='supremo_video_workspace';
async function loadVideoWorkspace(){
  const frame=$('videoFrame');
  try{
    const saved=await SLStore.get(videoWorkspaceId);
    const resources=[];
    for(const id of saved?.linkedIds||[]){
      const record=S.media.find(item=>item.id===id&&item.studioRecipe);
      const file=await assetFile(record);
      if(file){resources.push({id,file,layerScene:record.layerScene});linkedVideoAssets.add(id);}
    }
    frame.contentWindow?.postMessage({type:'SL1_WORKSPACE_RESTORE',project:saved?.project,
      files:saved?.files||[],resources},'*');
  }catch(error){
    notify('No se pudo abrir la línea de tiempo local. '+error.message);
    frame.contentWindow?.postMessage({type:'SL1_WORKSPACE_RESTORE'},'*');
  }
}
let videoWrites=Promise.resolve();
window.addEventListener('message',event=>{
  if(event.source!==$('videoFrame')?.contentWindow)return;
  const data=event.data;
  if(data?.type==='SL1_WORKSPACE_OPEN'){
    if(S.ready)loadVideoWorkspace();
    else window.addEventListener('supremo-ready',loadVideoWorkspace,{once:true});
  }
  if(data?.type==='SL1_WORKSPACE_SAVE'&&S.ready){
    const {project,files,linkedIds}=data;
    if(!project?.timeline||!Array.isArray(files)||!Array.isArray(linkedIds)||
       files.some(asset=>!(asset.file instanceof File)))return;
    for(const id of linkedIds)linkedVideoAssets.add(id);
    videoWrites=videoWrites.then(()=>SLStore.put({id:videoWorkspaceId,type:'video-workspace',project,files,linkedIds}))
      .catch(error=>notify('No se pudo guardar la línea de tiempo local. '+error.message));
  }
  if(data?.type==='SL1_EDIT_STUDIO'){
    const asset=S.media.find(record=>record.id===data.assetId&&record.studioRecipe);
    if(asset){linkedVideoAssets.add(asset.id);window.SupremoEstudio.openRecipe(asset);}
    else notify('La fuente editable no está disponible en Biblioteca.');
  }
});
function qualityGrid(){const root=$('qualityGrid');const table=EL('table','quality-table');table.innerHTML='<thead><tr><th>Pieza / SKU</th><th>Estado</th><th>Referencias</th><th>Control</th></tr></thead>';const tbody=EL('tbody');for(const d of concepts()){const row=EL('tr');const warn=d.quality?.includes('pendiente');const status=state.qa[d.id]||'pendiente';row.innerHTML=`<td><b>${escapeHtml(d.id)} / ${escapeHtml(d.sku)}</b><div class="muted">${escapeHtml(d.name)}</div></td><td>${escapeHtml(recordStatus(d.id))}</td><td>${warn?'<span style="color:#ffbb9e">YARDMAX: fabricante pendiente</span>':'<span style="color:#a5dfbc">SHOPMAX referencia incluida</span>'}</td><td></td>`;const select=EL('select');for(const [v,label] of [['pendiente','Pendiente'],['modelo','Modelo fiel'],['artes','Marca y QR OK'],['aprobado','Aprobado visual']])select.add(new Option(label,v));select.value=status;select.onchange=()=>{state.qa[d.id]=select.value;saveState();qualityGrid();};row.lastElementChild.appendChild(select);tbody.appendChild(row)}table.appendChild(tbody);root.replaceChildren(table);}
async function exportProject(){let estudio;try{estudio=await window.SupremoEstudio?.snapshot();}catch(e){notify('El estudio no respondió. Intenta guardar de nuevo desde su sección.');return}const data={type:'supremo-lider-project',schemaVersion:'1.0',savedAt:new Date().toISOString(),state,mediaManifest:S.media.filter(isImported).map(({blob,...a})=>a),campaign:S.data,...(estudio?{estudio}:{})};jsonDownload(data,'SUPREMO_LIDER_V1_PROYECTO.json');notify('JSON exportado. Recuerda respaldar fotografías por separado.');}
function validateCampaign(obj){if(!obj||!Array.isArray(obj.concepts)||!obj.concepts.length)throw Error('Debe contener concepts[] no vacío');if(new Set(obj.concepts.map(x=>x.id)).size!==obj.concepts.length)throw Error('IDs de concepto duplicados');for(const d of obj.concepts){if(typeof d.id!=='string'||!d.sku||!d.brand||!d.prompts||!Array.isArray(d.videoFrames))throw Error('Concepto incompleto: '+(d.id||'?'))};return obj;}
async function fileJSON(file){return JSON.parse(await file.text());}
function resetCampaign(c){S.data=c;S.selectedConceptId=c.concepts[0]?.id;renderPrompts();selectConcept(S.selectedConceptId);qualityGrid();progress();refreshSelectors();notify('Campaña JSON migrada; catálogo disponible en dashboard.');}
async function importProject(event){
  const input=event.target,file=input.files[0];
  if(!file)return;
  try{
    const project=await fileJSON(file);
    if(project.type!=='supremo-lider-project'||!project.state)throw Error('Formato de proyecto incompatible');
    const campaign=project.campaign?validateCampaign(project.campaign):null;
    Object.assign(state,{studioAsset:null},project.state);
    // Los proyectos anteriores no incluyen la vista de navegación de Biblioteca.
    restoreLibraryView(project.state.libraryView??{});
    renderAndSaveLibraryView();
    if(campaign)resetCampaign(campaign);
    else refreshSelectors();
    renderPrompts();selectConcept(S.selectedConceptId||concepts()[0].id);qualityGrid();progress();
    window.CameraStudio?.restore?.();window.CarouselStudio?.restore?.();
    window.SupremoEstudio?.restore(project.estudio??null,S.media.find(item=>item.id===state.studioAsset&&item.studioRecipe));
    notify('Proyecto restaurado. Los medios deben existir en esta biblioteca.');
  }catch(error){
    notify('Error importando proyecto: '+error.message);
  }finally{
    input.value='';
  }
}
function projectHandlers(){$('saveTop').onclick=exportProject;$('exportProject').onclick=exportProject;$('exportCampaign').onclick=()=>jsonDownload(S.data,'SUPREMO_LIDER_CAMPANA.json');$('importCampaign').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const c=validateCampaign(await fileJSON(f));state.campaignOverride=c;saveState();resetCampaign(c);}catch(err){notify('Error importando campaña: '+err.message)}e.target.value='';};$('importProject').onchange=importProject;$('helpTop').onclick=()=>window.open('docs/SPEC_SUPREMO_LIDER_V1.md','_blank');$('projectSummary').textContent='Proyecto: '+state.name+' · estados: '+Object.keys(state.status||{}).length+' · imágenes en biblioteca: '+S.media.filter(isImported).length+' · último guardado: '+(state.updatedAt||'sin guardar');}
function readEmbeddedCampaign(){const node=document.getElementById('campana-local');if(!node||!node.textContent)throw Error('No se incluyó la campaña integrada. Descarga el paquete completo V1.1.');return validateCampaign(JSON.parse(node.textContent));}
async function loadCampaign(){if(location.protocol==='file:')return readEmbeddedCampaign();try{const resp=await fetch('data/campana_2026.json',{cache:'no-store'});if(!resp.ok)throw Error('HTTP '+resp.status);return validateCampaign(await resp.json());}catch(error){console.warn('Campaña local no disponible, cargando respaldo integrado',error);return readEmbeddedCampaign();}}
function displayDirectFileWarning(){const banner=$('offlineBanner');if(banner)banner.style.display='none';}
async function init(){try{displayDirectFileWarning();S.data=state.campaignOverride||await loadCampaign();const stored=await SLStore.list().catch(error=>{console.warn('IndexedDB no disponible',error);notify('Biblioteca en memoria: exporta tus JSON y conserva los archivos originales.');return [];});const skus=[...new Set(concepts().map(x=>x.sku))].filter(sku=>Boolean(window.SL_INLINE_MEDIA?.[sku]));S.media=[...skus.map(sku=>({id:'builtin_'+sku,builtin:true,name:sku+'_MASTER_REFERENCIA.png',sku,type:'image',role:'product',path:'modulos/creative_v10/assets/productos/'+sku+'.png'})),...stored.filter(record=>!['studio-recipe','video-workspace'].includes(record.type))];for(const b of document.querySelectorAll('[data-page]'))b.onclick=()=>updateNavigation(b.dataset.page);for(const b of document.querySelectorAll('[data-go]'))b.onclick=()=>updateNavigation(b.dataset.go);$('promptSearch').oninput=renderPrompts;$('promptBrand').onchange=renderPrompts;$('promptStage').onchange=()=>{state.status[S.selectedConceptId]=$('promptStage').value;saveState();selectConcept(S.selectedConceptId);progress();};$('promptNotes').oninput=()=>{state.notes[S.selectedConceptId]=$('promptNotes').value;saveState();};for(const b of document.querySelectorAll('[data-prompt]'))b.onclick=()=>{S.promptMode=b.dataset.prompt;for(const x of document.querySelectorAll('[data-prompt]'))x.classList.toggle('active',x===b);showPrompt();};$('copyRefs').onclick=()=>copy((currentConcept().references||[]).slice(0,4).join('\n'));$('copyPrompt').onclick=()=>{copy($('promptText').value);if(recordStatus(S.selectedConceptId)==='pendiente'){$('promptStage').value='prompt';$('promptStage').dispatchEvent(new Event('change'));}};$('frameDone').onchange=()=>{state.frames[S.selectedConceptId+':'+S.selectedFrame]=$('frameDone').checked;saveState();showFrames();};$('copyFrame').onclick=()=>copy($('frameText').value);$('linkFrameImage').onclick=()=>{const a=mediaSelected();if(!a||a.type!=='image')return notify('Selecciona antes una foto importada de Higgsfield.');state.frameAssets[S.selectedConceptId+':'+S.selectedFrame]=a.id;saveState();showFrames();notify('Foto asignada al frame.');};$('toStudio').onclick=()=>{
  if(confirm('¿Crear otra pieza para este concepto? Guarda antes la que estás editando.'))window.SupremoEstudio.start(currentConcept());
};$('sendVideo').onclick=()=>S.sendToEngine().catch(error=>notify(error.message));setupMedia();
const shell=document.querySelector('.shell'), nav=$('toggleNav');
const navState=collapsed=>{
  shell.classList.toggle('nav-collapsed',collapsed);
  nav.setAttribute('aria-expanded',String(!collapsed));
  nav.setAttribute('aria-label',collapsed?'Mostrar navegación':'Ocultar navegación');
};
navState(state.navCollapsed??true);
nav.onclick=()=>{state.navCollapsed=!shell.classList.contains('nav-collapsed');navState(state.navCollapsed);saveState();};
restoreLibraryView();refreshSelectors();selectConcept(concepts()[0].id);qualityGrid();projectHandlers();progress();const page=location.hash.slice(1);updateNavigation(document.getElementById('page-'+page)||['imagen','editorial','clasico'].includes(page)?page:'inicio');S.ready=true;window.dispatchEvent(new Event('supremo-ready'));$('serverStatus').textContent='100% local · sin servidor';notify('Supremo Líder V1.3.0 · sin servidor');}catch(e){console.error(e);notify('Error al iniciar: '+e.message);$('serverStatus').textContent='Error al iniciar · comprueba carpetas y recarga';}}
S.init=init;window.addEventListener('DOMContentLoaded',init);
})();
