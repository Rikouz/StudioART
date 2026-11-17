'use strict';
const SLCatalog = (() => {
  const roles = {
    composition:'Piezas del Estudio', final:'Artes finales', scene:'Escenarios',
    avatar:'Personajes', generated:'Generados', product:'Productos'
  };
  const brand = record => {
    const sample = [record.sku, record.name, record.path].filter(Boolean).join(' ').toUpperCase();
    if (/SHOPMAX|\b(?:9\d{4,5}|84\d{3})[A-Z]\d/.test(sample)) return 'SHOPMAX';
    if (/YARDMAX|\bY[MCTP]\d{4}\b/.test(sample)) return 'YARDMAX';
    if (/FULL[ _-]?BOAR|T4016S/.test(sample)) return 'FULL BOAR';
    if (/\b(SLT|CTL)\b/.test(sample)) return 'SLT / CTL';
    return '';
  };
  function folder(record) {
    if (record.catalogFolder) return record.catalogFolder;
    const make = brand(record);
    const path = (record.path || '').split(/[\\/]/).filter(Boolean).slice(0,-1);
    if (record.builtin) return ['Catálogo oficial',make || 'Otros'].join(' › ');
    if (path.length) return ['Carpetas importadas',...path].join(' › ');
    if (record.type === 'video') return 'Video';
    if (record.type === 'audio') return 'Audio';
    const group = roles[record.role] || (make ? 'Productos' : 'Por clasificar');
    return [group,make].filter(Boolean).join(' › ');
  }
  const normalize = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function matches(record,query) {
    const searchable = normalize([record.name,record.sku,record.role,record.path,folder(record)].join(' '));
    return normalize(query).trim().split(/\s+/).every(token=>searchable.includes(token));
  }
  function groups(records,parent='') {
    const prefix = parent ? parent+' › ' : '';
    const counts = new Map();
    for (const record of records) {
      const key = folder(record);
      if (!key.startsWith(prefix) || key === parent) continue;
      const name = key.slice(prefix.length).split(' › ')[0];
      counts.set(name,(counts.get(name) || 0)+1);
    }
    return [...counts].sort(([a],[b])=>a.localeCompare(b,'es'));
  }
  function scoped(records,parent,query,type) {
    return records.filter(record=>{
      const location = folder(record);
      return (!parent || location===parent || location.startsWith(parent+' › ')) &&
        (!type || record.type===type) && matches(record,query);
    });
  }
  return {folder,groups,scoped};
})();
