/* Supremo Lider V1 — biblioteca IndexedDB; nunca sube archivos a servidores externos. */
(function(){'use strict';
const DB='SUPREMO_LIDER_V1_MEDIA'+(window.SL_AUDIT_ID?'_AUDIT_'+window.SL_AUDIT_ID:''), STORE='assets', VERSION=1;
function connect(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB,VERSION);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function transaction(mode,fn){const db=await connect();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,mode),os=tx.objectStore(STORE);let req;try{req=fn(os);}catch(e){db.close();reject(e);return;}req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close();tx.onabort=()=>reject(tx.error);});}
const temp=new Map();
function safe(action,fallback){return action.catch(err=>{console.warn('IndexedDB restringido, memoria temporal en uso',err);return fallback();});}
window.SLStore={
 put:record=>safe(transaction('readwrite',os=>os.put(record)),()=>{temp.set(record.id,record);return record.id;}),
 get:id=>safe(transaction('readonly',os=>os.get(id)),()=>temp.get(id)),
 list:()=>safe(transaction('readonly',os=>os.getAll()),()=>[...temp.values()]),
 delete:id=>safe(transaction('readwrite',os=>os.delete(id)),()=>temp.delete(id)),
 clear:()=>safe(transaction('readwrite',os=>os.clear()),()=>temp.clear())
};
})();
