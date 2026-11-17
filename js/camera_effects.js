/* Efectos de Cámara. La cabecera y el marco se dibujan fuera de la composición. */
'use strict';
(function(){
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ease = value => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};
const effectIds = new Set(['liveCursor','dayDial','commentDrop','sketchWords','pressFront','predictKeys','headStack','banknote','impactFrame']);

function settings(id, amount, text){
  return {
    id: effectIds.has(id) ? id : 'none',
    amount: Number.isFinite(amount) ? clamp(amount, 0, 100) : 65,
    text: typeof text === 'string' ? text.trim().slice(0, 80) : ''
  };
}

function layout(width, height, effect){
  if(effect.id === 'none' || effect.amount === 0) return null;
  const unit = Math.min(width, height);
  const x = Math.round(unit * .055);
  const y = Math.round(unit * .22);
  const footer = Math.round(unit * .055);
  return {x, y, width: width - 2*x, height: height - y - footer, unit};
}

function headline(ctx, text, x, y, size, maxWidth, family){
  ctx.font = `700 ${size}px ${family}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text,x,y,maxWidth);
}

function draw(ctx, frame, effect, progress){
  const {x,y,width,height,unit} = frame;
  const t = clamp(progress, 0, 1);
  const intensity = effect.amount / 100;
  const ink = '#17252b', paper = '#f1eadb', accent = '#f5bb59';
  const size = unit * .054;
  const titleX = x + unit * .027;
  const titleY = y * .52;
  ctx.save();
  // Even if an animated element crosses the inner boundary, source pixels stay visible.
  ctx.beginPath();
  ctx.rect(0,0,ctx.canvas.width,ctx.canvas.height);
  ctx.rect(x,y,width,height);
  ctx.clip('evenodd');
  switch(effect.id){
  case 'predictKeys': {
    const chars=Array.from(effect.text||'ESCRIBE TU IDEA'),active=Math.floor(t*chars.length);
    const count=Math.min(12,chars.length),gap=unit*.008,keyW=Math.min(unit*.065,(width-gap*count)/count);
    ctx.font=`700 ${size*.65}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';
    for(let i=0;i<count;i++){
      const left=x+i*(keyW+gap),top=y*.28;
      ctx.fillStyle=i===active%count?accent:paper;ctx.fillRect(left,top,keyW,y*.42);
      ctx.fillStyle=ink;ctx.fillText(chars[i],left+keyW/2,top+y*.21,keyW*.85);
    }break;
  }
  case 'headStack': {
    const lines=(effect.text||'IDEA / DISEÑO / ACCIÓN').split(/[\n/]+/).slice(0,3);
    lines.forEach((line,i)=>{
      const p=ease((t-i*.15)/.35);ctx.globalAlpha=p;
      const left=x+(1-p)*width*.25*intensity,top=y*(.08+i*.28);
      ctx.fillStyle=i%2?accent:paper;ctx.fillRect(left,top,width*.8,y*.24);
      ctx.fillStyle=ink;headline(ctx,line.trim(),left+unit*.02,top+y*.12,size*.65,width*.74,'system-ui');
    });break;
  }
  case 'banknote': {
    const p=ease(t/.5);ctx.globalAlpha=p;ctx.fillStyle=paper;ctx.fillRect(x,y*.12,width,y*.70);
    ctx.strokeStyle=ink;ctx.lineWidth=unit*.0015;
    for(let i=0;i<6;i++)ctx.strokeRect(x+unit*(.008+i*.005),y*.15+unit*i*.003,width-unit*(.016+i*.01),y*.63-unit*i*.006);
    ctx.fillStyle=ink;headline(ctx,effect.text||'EDICIÓN DE TALLER',x+unit*.05,y*.47,size*.82,width-unit*.1,'Georgia');break;
  }
  case 'impactFrame': {
    const pulse=Math.sin(Math.PI*clamp(t/.35,0,1))*intensity;
    ctx.strokeStyle=accent;ctx.lineWidth=unit*(.002+pulse*.012);
    ctx.strokeRect(x-unit*.012,y-unit*.012,width+unit*.024,height+unit*.024);
    ctx.fillStyle=paper;if(effect.text)headline(ctx,effect.text,titleX,titleY,size*(1+.28*pulse),width-unit*.06,'system-ui');
    for(let i=0;i<9;i++){
      const dx=x+width*i/8;ctx.beginPath();ctx.moveTo(dx,y*.9);ctx.lineTo(dx+(dx-ctx.canvas.width/2)*pulse*.2,y*.9-unit*.025*(1+pulse));ctx.stroke();
    }break;
  }
  case 'liveCursor': {
    const p = ease(t / .62);
    const left = x - unit*.006, top = y - unit*.006;
    const right = x + width + unit*.006, bottom = y + height + unit*.006;
    const u = unit * (.020 + .018 * intensity);
    const tipX = left + (right-left)*Math.min(1,2*p);
    const tipY = top + (bottom-top)*Math.max(0,2*p-1);
    ctx.strokeStyle = accent;
    ctx.lineWidth = unit * .003;
    ctx.beginPath();
    ctx.moveTo(left,top); ctx.lineTo(tipX,top); ctx.lineTo(tipX,tipY);
    ctx.stroke();
    if(p===1) ctx.strokeRect(left,top,right-left,bottom-top);
    ctx.fillStyle = accent;
    for(const [cx,cy] of [[left,top],[tipX,tipY]]){
      ctx.fillRect(cx-u*.12,cy-u*.12,u*.24,u*.24);
    }
    ctx.translate(tipX+u*.13,tipY-u*.08);
    ctx.fillStyle = paper;
    ctx.beginPath();
    ctx.moveTo(0,0); ctx.lineTo(u*.52,-u*.78); ctx.lineTo(u*.70,-u*.43);
    ctx.lineTo(u,-u*.48); ctx.closePath(); ctx.fill();
    break;
  }
  case 'dayDial': {
    const r = unit * .07, cx = x + r + unit*.012;
    const turn = 2*Math.PI*ease(t);
    ctx.translate(cx,titleY);
    ctx.strokeStyle = paper;
    ctx.lineWidth = unit*.002;
    ctx.beginPath(); ctx.arc(0,0,r,0,2*Math.PI); ctx.stroke();
    for(let i=0;i<12;i++){
      const a = i*Math.PI/6, dx = Math.sin(a), dy = Math.cos(a);
      ctx.beginPath(); ctx.moveTo(dx*r*.80,dy*r*.80); ctx.lineTo(dx*r,dy*r); ctx.stroke();
    }
    ctx.strokeStyle = accent;
    ctx.lineWidth = unit*(.003+.004*intensity);
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.sin(turn)*r*.68,-Math.cos(turn)*r*.68); ctx.stroke();
    ctx.translate(-cx,-titleY);
    ctx.fillStyle = paper;
    if(effect.text) headline(ctx,effect.text,x+r*2.4,titleY,size,width-r*2.4,'system-ui');
    break;
  }
  case 'commentDrop': {
    if(!effect.text) break;
    const p = ease(t/.36);
    const h = y*.58, top = y*.20 - y*.42*(1-p)*intensity;
    ctx.globalAlpha = p;
    ctx.fillStyle = paper;
    ctx.beginPath(); ctx.roundRect(x,top,width,h,unit*.027); ctx.fill();
    ctx.fillStyle = ink;
    headline(ctx,effect.text,titleX,top+h/2,size,width-unit*.07,'system-ui');
    break;
  }
  case 'sketchWords': {
    if(!effect.text) break;
    const reveal = ease(t / .72);
    ctx.beginPath(); ctx.rect(x,0,width*reveal,y); ctx.clip();
    ctx.font = `700 ${size*1.3}px Georgia, serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = paper;
    ctx.lineWidth = unit * (.0015 + intensity*.0025);
    ctx.strokeText(effect.text,titleX,titleY,width-unit*.06);
    break;
  }
  case 'pressFront': {
    const p = ease(t/.45);
    const top = y*.16;
    ctx.fillStyle = paper;
    ctx.fillRect(x,top,width,y*.68);
    ctx.fillStyle = ink;
    ctx.fillRect(titleX,y*.29,(width-unit*.054)*p,unit*.003);
    ctx.fillRect(titleX,y*.74,(width-unit*.054)*p,unit*.003);
    ctx.globalAlpha = p;
    if(effect.text) headline(ctx,effect.text,titleX,y*.53,size*(1+.25*intensity*p),width-unit*.054,'Georgia, serif');
    break;
  }
  }
  ctx.restore();
}

const labels={liveCursor:'Cursor de selección',dayDial:'Dial de tiempo',commentDrop:'Tarjeta de mensaje',sketchWords:'Título trazado',pressFront:'Portada editorial',predictKeys:'Teclas predictivas',headStack:'Etiquetas escalonadas',banknote:'Grabado editorial',impactFrame:'Marco de impacto'};
function composite(ctx,source,effect,progress){
  const frame=layout(ctx.canvas.width,ctx.canvas.height,effect);
  if(!frame){ctx.drawImage(source,0,0,ctx.canvas.width,ctx.canvas.height);return;}
  ctx.fillStyle='#17252b';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
  const k=Math.min(frame.width/source.width,frame.height/source.height);
  ctx.drawImage(source,frame.x+(frame.width-source.width*k)/2,frame.y+(frame.height-source.height*k)/2,source.width*k,source.height*k);
  draw(ctx,frame,effect,progress);
}
window.SLCameraEffects = {settings, layout, draw,composite,labels};
})();
