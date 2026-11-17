'use strict';

window.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const frame = $('estudioFrame');
  const destinations = new Set(['medios','camara','video','carruseles','actualizar']);
  let ready = false;
  let pending = [];
  let requestId = 0;
  let restoredProject;
  let importing = false;
  let groupId;
  let activeAssetId;
  const requests = new Map();

  const post = data => frame.contentWindow?.postMessage(data, '*');
  function flush() {
    if (!ready) return;
    for (const data of pending) post(data);
    pending = [];
  }

  frame.addEventListener('load', () => {
    ready = false;
    post({type:'SUPREMO_ESTUDIO_PING'});
  });

  function selectWorkspace(record) {
    const app = window.Supremo;
    activeAssetId = record?.id;
    groupId = record?.studioRecipe?.group || record?.studioRecipe?.id;
    if (app.state) {
      app.state.studioAsset = activeAssetId || null;
      app.save?.();
    }
    $('workspacePiece').textContent = record
      ? 'Pieza de trabajo · ' + record.name
      : 'Sin pieza guardada';
  }

  async function readRecipe(record) {
    const recipe = await SLStore.get(record.studioRecipe.id);
    if (!recipe?.blob) throw Error('El proyecto editable no está en esta biblioteca.');
    const project = JSON.parse(await recipe.blob.text());
    project.current = record.studioRecipe.proposal;
    return project;
  }

  window.SupremoEstudio = {
    snapshot() {
      if (!ready) return Promise.resolve(restoredProject ?? null);
      return new Promise((resolve,reject) => {
        const id = ++requestId;
        const timer = setTimeout(() => {
          requests.delete(id);
          reject(Error('El estudio no respondió.'));
        }, 5000);
        requests.set(id, {resolve,timer});
        post({type:'SUPREMO_ESTUDIO_SNAPSHOT',id});
      });
    },
    restore(project, record) {
      selectWorkspace(record);
      restoredProject = project;
      pending = [{type:'SUPREMO_ESTUDIO_RESTORE',project,linked:Boolean(record)}];
      flush();
    },
    async openRecipe(record) {
      const app = window.Supremo;
      if (importing) return app.notify('Espera a que termine el guardado de la pieza.');
      if(activeAssetId===record.id && restoredProject){
        app.selectMedia(record.id);
        app.goto('estudio');
        return;
      }
      try {
        const project = await readRecipe(record);
        app.selectMedia(record.id);
        app.goto('estudio');
        window.SupremoEstudio.restore(project,record);
      } catch(error) {
        app.notify(error.message);
      }
    },
    start(concept) {
      const app = window.Supremo;
      if (importing) return app.notify('Espera a que termine el guardado de la pieza.');
      this.restore(null);
      if (concept) {
        pending.push({type:'SUPREMO_ESTUDIO_CONCEPT',headline:concept.headline});
        flush();
        const assigned = app.state.frameAssets?.[concept.id+':'+app.selectedFrame];
        const product = app.media.find(item=>item.id==='builtin_'+concept.sku);
        const background = app.media.find(item=>item.id===assigned&&item.type==='image');
        if(product)sendSelected('product',product);
        if(background)sendSelected('background',background);
      }
      app.goto('estudio');
    }
  };

  function validRecipe(project, indices, count) {
    return project?.format === 'msccs-piloto-integracion' &&
      Array.isArray(project.comps) && project.comps.length>=1 && project.comps.length<=4 &&
      Array.isArray(indices) && indices.length === count &&
      new Set(indices).size === count &&
      indices.every(index => Number.isInteger(index) && index >= 0 && index < project.comps.length);
  }

  async function storeRecipe(project) {
    const raw = JSON.stringify(project);
    if (raw.length > 110 * 1024 * 1024) throw Error('El proyecto supera el tamaño de la copia editable.');
    const id = 'estudio_' + crypto.randomUUID();
    await SLStore.put({id,type:'studio-recipe',blob:new Blob([raw],{type:'application/json'})});
    return id;
  }

  async function saveCompositions(files,project,indices,layerScenes=[]) {
    const app = window.Supremo;
    const recipeId = await storeRecipe(project);
    groupId ||= recipeId;
    const staleRecipes = new Set();
    const records = [];
    for (const [index,file] of files.entries()) {
      const proposal = indices[index];
      const previous = app.media.find(item => {
        const recipe = item.studioRecipe;
        return recipe && (recipe.group || recipe.id) === groupId && recipe.proposal === proposal;
      });
      const studioRecipe = {id:recipeId,group:groupId,proposal};
      const layerScene=layerScenes[index];
      if (!previous) {
        const [id] = await app.importFiles([file], {studioRecipe,layerScene, role:'composition'});
        if (!id) throw Error('No se pudo guardar el render.');
        records.push(app.media.find(item => item.id === id));
        continue;
      }
      const updated = {...previous,blob:file,lastModified:file.lastModified,studioRecipe,layerScene};
      await SLStore.put(updated);
      staleRecipes.add(previous.studioRecipe.id);
      Object.assign(previous,updated);
      if (app.urls.has(previous.id)) {
        URL.revokeObjectURL(app.urls.get(previous.id));
        app.urls.delete(previous.id);
      }
      records.push(previous);
    }
    for (const oldId of staleRecipes) {
      if (app.media.some(item => item.studioRecipe?.id === oldId)) continue;
      await SLStore.delete(oldId).catch(error => console.warn('Receta anterior sin referencias',error));
    }
    const active = records.find(record => record.studioRecipe.proposal === project.current) || records[0];
    selectWorkspace(active);
    restoredProject = project;
    app.selectMedia(active.id);
    window.CarouselStudio?.refreshLinkedSlides?.();
    for (const record of records) await app.updateLinkedVideo(record);
    return records;
  }

  async function importComposition(files,destination,project,indices,layerScenes) {
    const app = window.Supremo;
    if (!app?.ready || importing) return;
    if (!destinations.has(destination) || !Array.isArray(files) ||
        files.length < 1 || files.length > 4 ||
        files.some(file => !(file instanceof File) || file.type !== 'image/png' || !file.size || file.size > 25 * 1024 * 1024) ||
        !validRecipe(project,indices,files.length)) {
      post({type:'SUPREMO_ESTUDIO_SAVE_ERROR',message:'La composición recibida no es válida.'});
      app.notify('La composición recibida no es válida.');
      return;
    }
    importing = true;
    try {
      const records = await saveCompositions(files,project,indices,layerScenes);
      if (destination === 'video') {
        await app.sendToEngine('video');
      } else if (destination === 'camara') {
        app.goto('camara');
        $('cameraAsset').value = records[0].id;
        $('cameraAsset').dispatchEvent(new Event('input'));
      } else if (destination === 'carruseles') {
        app.goto('carruseles');
        for (const record of records) window.CarouselStudio.addMedia(record.id,{unique:true});
      } else if (destination === 'medios') {
        app.goto('medios');
      }
      post({type:'SUPREMO_ESTUDIO_SAVED'});
      app.notify('Pieza guardada. Las salidas vinculadas usan la última revisión.');
    } catch(error) {
      post({type:'SUPREMO_ESTUDIO_SAVE_ERROR',message:error.message});
      app.notify('No se pudo completar el guardado. ' + error.message);
    } finally {
      importing = false;
    }
  }

  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow || !event.data) return;
    const data = event.data;
    if (data.type === 'SUPREMO_ESTUDIO_READY') {
      ready = true;
      flush();
    }
    if (data.type === 'SUPREMO_ESTUDIO_SNAPSHOT_RESULT') {
      const request = requests.get(data.id);
      if (request) {
        clearTimeout(request.timer);
        requests.delete(data.id);
        request.resolve(data.project);
      }
    }
    if (data.type === 'SUPREMO_ESTUDIO_EXPORT') importComposition(data.files,data.destination,data.project,data.indices,data.layerScenes);
  });

  window.addEventListener('supremo-ready',async () => {
    const app = window.Supremo;
    const record = app.media.find(item => item.id === app.state.studioAsset);
    if (!record?.studioRecipe) return;
    try {
      const project = await readRecipe(record);
      if (restoredProject === undefined && !activeAssetId) window.SupremoEstudio.restore(project,record);
    } catch(error) {
      app.notify(error.message);
    }
  });

  async function sendSelected(role, asset) {
    const app = window.Supremo;
    if (!app?.ready || importing) return;
    const record = asset || app.media.find(item => item.id === app.selectedMediaId);
    if (!record || record.type !== 'image') return app.notify('Selecciona una imagen en Biblioteca.');
    try {
      const file = await app.assetFile(record);
      if (!file || file.size > 25 * 1024 * 1024) throw Error('Máximo 25 MB por imagen.');
      pending.push({type:'SUPREMO_ESTUDIO_IMAGE',file,role});
      app.goto('estudio');
      flush();
      if (!ready) post({type:'SUPREMO_ESTUDIO_PING'});
    } catch (error) {
      app.notify(error.message);
    }
  }

  $('estudioSendBg').onclick = () => sendSelected('background');
  $('estudioSendProduct').onclick = () => sendSelected('product');
  $('estudioNew').onclick = () => {
    if (confirm('¿Empezar otra pieza? Los cambios que aún no guardaste se perderán.')) window.SupremoEstudio.start();
  };
  $('workspaceEdit').onclick = () => window.Supremo.goto('estudio');
  $('cameraEditSource').onclick = () => {
    const app = window.Supremo;
    const record = app.media.find(item => item.id === $('cameraAsset').value);
    if (record?.studioRecipe) window.SupremoEstudio.openRecipe(record);
    else app.notify('Esta imagen es un original. Puedes cargarla en el Estudio desde Biblioteca.');
  };
});
