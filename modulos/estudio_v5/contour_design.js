/* StudioART: structural layouts and connected image contours. Original offline implementation. */
'use strict';
const StudioContourDesign=(()=>{
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const architectures=[
    {id:'full',label:'Fotografía a sangre',rects:[[0,0,1,1]],title:[.05,.06,.65]},
    {id:'window',label:'Ventana editorial',rects:[[.06,.25,.88,.67]],title:[.06,.035,.87]},
    {id:'split',label:'División vertical',rects:[[.47,.04,.49,.92]],title:[.045,.20,.38]},
    {id:'band',label:'Banda horizontal',rects:[[0,.12,1,.53]],title:[.06,.70,.85]},
    {id:'triptych',label:'Tríptico',rects:[[.04,.27,.28,.66],[.36,.27,.28,.66],[.68,.27,.28,.66]],title:[.04,.04,.90]},
    {id:'mosaic',label:'Mosaico asimétrico',rects:[[.04,.04,.57,.56],[.64,.04,.32,.32],[.64,.39,.32,.57]],title:[.04,.66,.55]},
    {id:'circle',label:'Recorte circular',rects:[[.07,.12,.86,.64]],title:[.07,.79,.86]},
    {id:'diagonal',label:'Corte diagonal',rects:[[0,0,1,1]],title:[.06,.68,.83]},
    {id:'contact',label:'Hoja de contacto',rects:[[.06,.23,.41,.30],[.53,.23,.41,.30],[.06,.58,.41,.30],[.53,.58,.41,.30]],title:[.06,.035,.86]},
    {id:'inset',label:'Marco lateral',rects:[[.04,.04,.70,.72]],title:[.22,.79,.73]}
  ];
  const treatments=[['photo','Fotografía'],['contours','Contornos continuos'],['engraving','Grabado fluido'],['pixels','Memoria de píxeles'],['duo','Mapa de dos tintas'],['ribbons','Cintas de luminancia']];
  function random(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
  // Marching squares joins interpolated isolines into paths; not a scatter of disconnected nodes.
  function analyze(data,w,h,{levels=7,spacing=3,seed=1}={}){
    levels=clamp(Math.round(levels)||7,2,18);spacing=clamp(Math.round(spacing)||3,1,12);
    const gray=new Float32Array(w*h),gx=new Float32Array(w*h),gy=new Float32Array(w*h);
    for(let i=0;i<gray.length;i++)gray[i]=(.2126*data[i*4]+.7152*data[i*4+1]+.0722*data[i*4+2])/255;
    const get=(x,y)=>gray[clamp(y,0,h-1)*w+clamp(x,0,w-1)];
    for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
      gx[y*w+x]=-get(x-1,y-1)+get(x+1,y-1)-2*get(x-1,y)+2*get(x+1,y)-get(x-1,y+1)+get(x+1,y+1);
      gy[y*w+x]=-get(x-1,y-1)-2*get(x,y-1)-get(x+1,y-1)+get(x-1,y+1)+2*get(x,y+1)+get(x+1,y+1);
    }
    const paths=[];
    for(let level=1;level<=levels;level++){
      const threshold=level/(levels+1),segments=[];
      for(let y=0;y<h-spacing;y+=spacing)for(let x=0;x<w-spacing;x+=spacing){
        const corners=[[x,y],[x+spacing,y],[x+spacing,y+spacing],[x,y+spacing]],hits=[];
        const values=corners.map(([a,b])=>get(a,b));
        for(let e=0;e<4;e++){
          const j=(e+1)%4,a=values[e],b=values[j];if((a>=threshold)===(b>=threshold))continue;
          const t=(threshold-a)/(b-a);
          hits.push([corners[e][0]+(corners[j][0]-corners[e][0])*t,corners[e][1]+(corners[j][1]-corners[e][1])*t]);
        }
        // Deterministic asymptotic decision for saddle cells.
        if(hits.length===4&&values.reduce((a,b)=>a+b,0)/4<threshold)hits.push(hits.shift());
        for(let i=0;i+1<hits.length;i+=2)segments.push([hits[i],hits[i+1]]);
      }
      const key=p=>p.map(v=>Math.round(v*10000)).join(':'),links=new Map();
      segments.forEach((s,i)=>s.forEach(p=>{const k=key(p);if(!links.has(k))links.set(k,[]);links.get(k).push(i);}));
      const used=new Set();
      function trace(start,first){
        const points=[first];let index=start,last=first;
        while(index!==undefined&&!used.has(index)){
          used.add(index);const seg=segments[index],next=key(seg[0])===key(last)?seg[1]:seg[0];points.push(next);last=next;
          index=links.get(key(next))?.find(i=>!used.has(i));
        }
        if(points.length>2)paths.push({level:threshold,points});
      }
      for(const [k,list] of links)if(list.length===1&&!used.has(list[0])){const s=segments[list[0]];trace(list[0],key(s[0])===k?s[0]:s[1]);}
      segments.forEach((s,i)=>{if(!used.has(i))trace(i,s[0]);});
    }
    // A tangent vector field follows actual Sobel gradients, with a luminance-dependent spacing.
    const flow=[],rng=random(seed),step=Math.max(4,spacing*3);
    for(let y=2;y<h-2;y+=step)for(let x=2;x<w-2;x+=step){
      let px=x+rng()*2,py=y+rng()*2;const points=[];
      for(let i=0;i<24;i++){
        const xx=clamp(Math.round(px),1,w-2),yy=clamp(Math.round(py),1,h-2),at=yy*w+xx;
        const dx=-gy[at],dy=gx[at],norm=Math.hypot(dx,dy),angle=(get(xx,yy)-.5)*2.4;
        points.push([px,py]);px+=(norm>.03?dx/norm:Math.cos(angle))*1.8;py+=(norm>.03?dy/norm:Math.sin(angle))*1.8;
        if(px<0||py<0||px>=w||py>=h)break;
      }
      if(points.length>2)flow.push({level:get(x,y),points});
    }
    return {w,h,gray,gx,gy,paths,flow};
  }
  function paint(ctx,map,{t=0,kind='contours',amount=65,color='#d4f492',paper='#182722',line=1.2,seed=1}={}){
    const w=ctx.canvas.width,h=ctx.canvas.height,power=clamp(amount/100,0,1);
    ctx.save();ctx.scale(w/map.w,h/map.h);ctx.lineWidth=line*map.w/w;ctx.strokeStyle=color;ctx.fillStyle=color;
    if(kind==='duo'){
      ctx.fillStyle=paper;ctx.globalAlpha=power;ctx.fillRect(0,0,map.w,map.h);ctx.fillStyle=color;
      for(let y=0;y<map.h;y+=2)for(let x=0;x<map.w;x+=2)if(map.gray[y*map.w+x]>.48)ctx.fillRect(x,y,2,2);
    }else if(kind==='pixels'){
      const rng=random(seed),size=5;
      for(let y=0;y<map.h;y+=size)for(let x=0;x<map.w;x+=size){
        const v=map.gray[y*map.w+x],phase=rng()*Math.PI*2,dx=t?Math.sin(t*Math.PI*2+phase)*size*.65:0;
        ctx.globalAlpha=power*(.22+.78*v);ctx.fillRect(x+dx,y,size*(.3+.7*v),size*(.3+.7*v));
      }
    }else{
      const list=kind==='engraving'?map.flow:map.paths;
      list.forEach(({level,points},i)=>{
        ctx.globalAlpha=power*(kind==='engraving'?.2+(1-level)*.75:.35+level*.6);
        ctx.beginPath();points.forEach(([x,y],j)=>{
          const warp=kind==='ribbons'?Math.sin(x*.09+t*Math.PI*2+i*.16)*2:0;
          ctx[j?'lineTo':'moveTo'](x,y+warp);
        });ctx.stroke();
        if(t&&points.length>3){
          const p=points[Math.floor(((t+i*.073)%1)*points.length)];ctx.globalAlpha=power;ctx.beginPath();ctx.arc(p[0],p[1],Math.max(.7,map.w/w*2.5),0,Math.PI*2);ctx.fill();
        }
      });
    }
    ctx.restore();
  }
  // Each structure alters image windows, negative space and text hierarchy.
  function background(ctx,image,w,h,{architecture='full',box='#172823',accent='#d4f492',seed=1},draw){
    const a=architectures.find(a=>a.id===architecture)||architectures[0];
    ctx.save();ctx.fillStyle=box;ctx.fillRect(0,0,w,h);
    a.rects.forEach(([x,y,rw,rh],i)=>{
      ctx.save();ctx.beginPath();
      if(a.id==='circle')ctx.ellipse((x+rw/2)*w,(y+rh/2)*h,rw*w/2,rh*h/2,0,0,Math.PI*2);
      else if(a.id==='diagonal'){ctx.moveTo(0,0);ctx.lineTo(w,0);ctx.lineTo(w,h*.47);ctx.lineTo(0,h*.72);ctx.closePath();}
      else ctx.rect(x*w,y*h,rw*w,rh*h);
      ctx.clip();
      if(['triptych','contact'].includes(a.id)){
        ctx.translate(w*.5,h*.5);const z=1+i*.12;ctx.scale(z,z);ctx.translate(-w*.5-(i%2)*w*.06,-h*.5);
      }
      // Keep source photo coordinates stable in every window; crop only, never distort.
      draw(ctx,image,w,h);ctx.restore();
    });
    if(a.id!=='full'){
      ctx.strokeStyle=accent;ctx.lineWidth=Math.max(1,Math.min(w,h)*.0015);
      ctx.beginPath();ctx.moveTo(w*.04,h*.965);ctx.lineTo(w*.96,h*.965);ctx.stroke();
    }
    ctx.restore();
  }
  return {architectures,treatments,analyze,paint,background};
})();
(typeof window==='undefined'?globalThis:window).StudioContourDesign=StudioContourDesign;
