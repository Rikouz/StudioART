/* Diseño por semilla y aproximación por primitivas. Implementación local de Supremo Líder. */
'use strict';
const StudioDesign=(()=>{
  const families=[
    ['catalog','Catálogo de producto',.48,5.4,2.7,96,'#192b2d','#e1ba70','clean','rule'],
    ['industrial','Industrial',.51,6.0,3.4,98,'#202931','#ffbb6e','grid','rect'],
    ['technical','Plano técnico',.46,5.0,2.3,97,'#132443','#8bd4fb','mesh','rule'],
    ['editorial','Editorial',.63,6.5,3.8,95,'#e9e4d8','#355764','clean','rule'],
    ['minimal','Minimalista',.42,4.7,2.8,96,'#eeeae1','#565f42','clean','rect'],
    ['workshop','Taller',.55,5.9,3.4,95,'#28262a','#ffd68b','grain','rule'],
    ['outdoor','Exterior',.54,6.3,2.8,94,'#293726','#e5cc80','source','rule'],
    ['cinema','Cinematográfica',.68,6.0,3.6,96,'#172637','#efaa70','grain','rule'],
    ['mono','Monocromo',.49,5.7,2.8,96,'#262629','#d8d2c6','mono','rect'],
    ['duotone','Duotono',.52,5.6,3.5,95,'#40283f','#e5a99c','mono','rule'],
    ['graphic','Gráfica de señales',.53,6.7,3.2,97,'#132520','#d8ee92','mesh','rect'],
    ['gradient','Degradado de color',.61,5.9,3.4,96,'#30203e','#e1b9fb','wash','ellipse'],
    ['paper','Papel e impresión',.57,5.6,3.5,95,'#eee3cc','#813d35','grain','rule'],
    ['contrast','Alto contraste',.56,7.0,3.2,100,'#17171b','#f8d858','grid','rect'],
    ['geo','Geometría abstracta',.50,6.1,3.4,97,'#262f42','#f3c884','primitive','rect'],
    ['geoSoft','Mosaico suave',.62,5.3,3.7,96,'#e9e4dc','#425f66','primitive','ellipse'],
    ['retro','Retro industrial',.60,6.2,3.0,96,'#512a25','#ffe2a7','grain','rule'],
    ['collage','Collage tipográfico',.46,6.6,2.7,97,'#f0eac8','#5b293b','grid','rect'],
    ['swiss','Retícula suiza',.44,6.1,3.2,100,'#f0eeea','#a12f24','grid','rule'],
    ['brutal','Tipografía monumental',.75,8.2,2.1,100,'#171b1a','#e2ed89','clean','rect'],
    ['architect','Arquitectura y planos',.43,4.9,2.8,97,'#20383b','#d8d2b8','mesh','rule'],
    ['workwear','Equipo profesional',.58,6.4,3.2,100,'#2f302c','#eac55d','grain','rule'],
    ['journal','Diario de proyectos',.60,5.1,3.6,100,'#eee7d9','#423e37','grain','rule'],
    ['botanical','Paisaje y jardín',.49,5.2,3.8,97,'#263d32','#d9d3a0','source','ellipse'],
    ['precision','Ingeniería de precisión',.45,5.0,2.5,100,'#19292c','#bcd7d9','mesh','rule'],
    ['gallery','Galería de objetos',.38,4.4,4.2,100,'#e7e3d9','#303e46','clean','rect'],
    ['screenprint','Serigrafía',.55,6.6,3.0,100,'#dcd1b5','#433b67','mono','rule'],
    ['modular','Bloques modulares',.48,5.7,3.2,100,'#243647','#f1c18a','grid','rect'],
    ['night','Turno nocturno',.59,6.3,3.3,97,'#121f2a','#d3b87b','wash','rule'],
    ['atelier','Oficio y materiales',.51,5.5,3.8,98,'#4b3d32','#e5cfb1','grain','ellipse']
  ].map(([id,label,width,font,pad,opacity,box,accent,field,mark])=>({id,label,width,font,pad,opacity,box,accent,field,mark}));
  const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
  const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const hex=channels=>'#'+channels.map(value=>clamp(Math.round(value),0,255).toString(16).padStart(2,'0')).join('');
  const luma=(r,g,b)=>(.2126*r+.7152*g+.0722*b)/255;
  const linear=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
  const luminance=color=>luma(...rgb(color).map(v=>255*linear(v/255)));
  function contrast(a,b){
    const x=luminance(a),y=luminance(b);
    return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
  }
  const blend=(a,b,t)=>hex(rgb(a).map((v,i)=>v*(1-t)+rgb(b)[i]*t));
  function scoreOnBox(ink,box,opacity){
    return Math.min(contrast(ink,blend('#000000',box,opacity)),contrast(ink,blend('#ffffff',box,opacity)));
  }
  function palette(profile,source,bias=0){
    const hue=source?.colors[0]||profile.box;
    const signal=source?.colors.find(color=>Math.abs(luminance(color)-luminance(hue))>.18)||profile.accent;
    const fromSource=profile.field==='source'||Boolean(source?.reference);
    let box=fromSource?blend(profile.box,hue,.28+bias*.19):blend(profile.box,profile.accent,bias*.13);
    let ink=scoreOnBox('#ffffff',box,.91)>scoreOnBox('#080808',box,.91)?'#ffffff':'#080808';
    let opacity=profile.opacity;
    if(scoreOnBox(ink,box,opacity/100)<4.5)box=blend(box,ink==='#ffffff'?'#000000':'#ffffff',.23);
    if(scoreOnBox(ink,box,opacity/100)<4.5){
      opacity=100;
      ink=contrast('#ffffff',box)>contrast('#000000',box)?'#ffffff':'#000000';
    }
    const color=fromSource?blend(profile.accent,signal,.43):profile.accent;
    let accent=color;
    for(let k=0;k<6&&scoreOnBox(accent,box,opacity/100)<4.5;k++)accent=blend(accent,ink,.32);
    if(scoreOnBox(accent,box,opacity/100)<4.5)accent=ink;
    return {box,ink,accent,opacity};
  }
  function analyze(data,w,h){
    const gray=new Float32Array(w*h),activity=new Float32Array(w*h),bins=new Map();
    for(let i=0;i<gray.length;i++){
      const j=i*4,r=data[j],g=data[j+1],b=data[j+2];
      gray[i]=luma(r,g,b);
      const key=(r>>5)*64+(g>>5)*8+(b>>5);
      const bucket=bins.get(key)||[0,0,0,0];
      bucket[0]++;bucket[1]+=r;bucket[2]+=g;bucket[3]+=b;bins.set(key,bucket);
    }
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=y*w+x;
      const dx=gray[y*w+Math.min(w-1,x+1)]-gray[y*w+Math.max(0,x-1)];
      const dy=gray[Math.min(h-1,y+1)*w+x]-gray[Math.max(0,y-1)*w+x];
      activity[i]=Math.min(1,Math.hypot(dx,dy)*2);
    }
    const colors=[...bins.values()].sort((a,b)=>b[0]-a[0]).slice(0,6).map(([n,r,g,b])=>hex([r/n,g/n,b/n]));
    const integral=new Float64Array((w+1)*(h+1)),rows=new Float32Array(h),cols=new Float32Array(w);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const value=activity[y*w+x];rows[y]+=value/w;cols[x]+=value/h;
      integral[(y+1)*(w+1)+x+1]=value+integral[y*(w+1)+x+1]+integral[(y+1)*(w+1)+x]-integral[y*(w+1)+x];
    }
    const peak=Math.max(.015,...rows,...cols),threshold=peak*.14;
    const edge=(arr,reverse=false)=>{let n=0;for(let i=0;i<arr.length*.20;i++){if(arr[reverse?arr.length-1-i:i]>threshold)break;n++;}return n/arr.length;};
    const marginX=clamp((edge(cols)+edge(cols,true))/2,.025,.12),marginY=clamp((edge(rows)+edge(rows,true))/2,.025,.12);
    const bands=[];let start=-1;
    for(let y=0;y<h;y++){if(rows[y]<threshold&&start<0)start=y;if((rows[y]>=threshold||y===h-1)&&start>=0){if(y-start>=2)bands.push({start:start/h,end:y/h});start=-1;}}
    return {gray,activity,colors,w,h,integral,geometry:{marginX,marginY,quietBands:bands,columns:cols,rows}};
  }
  function region(map,rect){
    if(!map)return .15;
    if(map.integral){
      const x0=clamp(Math.floor(rect.x*map.w),0,map.w),y0=clamp(Math.floor(rect.y*map.h),0,map.h);
      const x1=clamp(Math.ceil((rect.x+rect.w)*map.w),x0,map.w),y1=clamp(Math.ceil((rect.y+rect.h)*map.h),y0,map.h),pitch=map.w+1;
      const area=(x1-x0)*(y1-y0);return area?(map.integral[y1*pitch+x1]-map.integral[y0*pitch+x1]-map.integral[y1*pitch+x0]+map.integral[y0*pitch+x0])/area:.15;
    }
    let sum=0,n=0;
    for(let y=0;y<map.h;y++)for(let x=0;x<map.w;x++){
      const u=(x+.5)/map.w,v=(y+.5)/map.h;
      if(u<rect.x||u>rect.x+rect.w||v<rect.y||v>rect.y+rect.h)continue;
      sum+=map.activity[y*map.w+x];n++;
    }
    return n?sum/n:.15;
  }
  function overlap(a,b){
    return Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*
      Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
  }
  function placement({profile,map,reference,reserved,random,size,index,modern=false,diverse=null}){
    let best=null;
    // Compare positions in distinct bands per proposal, plus centrally aligned options.
    const rows=index%2?[.58,.72,.42,.20,.08]:[.08,.19,.35,.58,.73];
    const cols=index%2?[1,.5,0]:[0,.5,1];
    for(const [row,y] of rows.entries())for(const [col,align] of cols.entries()){
      const width=Math.round(100*clamp(profile.width+(random()-.5)*.18,.30,.84))/100;
      const margin=modern?(reference?.geometry?.marginX||.045):.045;
      const h=size(width),x=margin+Math.max(0,1-2*margin-width)*align;
      const candidate={x,y:clamp(y+(random()-.5)*.055,.055,Math.max(.055,.95-h)),w:width,h};
      const blocked=reserved.reduce((sum,box)=>sum+overlap(candidate,box),0)/Math.max(.01,width*h);
      const noise=region(modern?map:map?{...map,integral:null}:null,candidate);
      const ref=reference?region(modern?reference:{...reference,integral:null},candidate):0;
      const repetition=diverse?diverse.reduce((n,z)=>n+overlap(candidate,z)/Math.max(.01,Math.min(candidate.w*candidate.h,z.w*z.h)),0):0;
      const score=blocked*14+noise*2+ref*.60+row*.058+col*.004+random()*.10+repetition*5;
      if(!best||score<best.score)best={...candidate,score};
    }
    return best;
  }

  function approximate(data,w,h,count,type,random){
    const rgbData=new Float32Array(w*h*3),canvas=new Float32Array(w*h*3);
    const means=[0,0,0];
    for(let i=0;i<w*h;i++)for(let k=0;k<3;k++){
      const value=data[i*4+k];rgbData[i*3+k]=value;means[k]+=value/(w*h);
    }
    const backdrop=means.map(Math.round);
    for(let i=0;i<canvas.length;i++)canvas[i]=backdrop[i%3];
    const totalError=()=>rgbData.reduce((sum,value,i)=>sum+(value-canvas[i])**2,0);
    const initialError=totalError(),shapes=[];
    const types=['rect','ellipse','triangle'];
    function pixels(shape,visit){
      for(let y=Math.max(0,Math.floor(shape.y-shape.b));y<Math.min(h,Math.ceil(shape.y+shape.b));y++){
        const dy=(y+.5-shape.y)/shape.b;
        for(let x=Math.max(0,Math.floor(shape.x-shape.a));x<Math.min(w,Math.ceil(shape.x+shape.a));x++){
          const dx=(x+.5-shape.x)/shape.a;
          if(Math.abs(dy)>1||Math.abs(dx)>1)continue;
          if(shape.type==='ellipse'&&dx*dx+dy*dy>1)continue;
          if(shape.type==='triangle'&&Math.abs(dx)>(dy+1)/2)continue;
          visit((y*w+x)*3);
        }
      }
    }
    function evaluate(shape){
      const color=[0,0,0];let n=0,before=0,after=0;
      pixels(shape,i=>{
        for(let k=0;k<3;k++){color[k]+=rgbData[i+k];before+=(rgbData[i+k]-canvas[i+k])**2;}
        n++;
      });
      if(!n)return {shape,score:-Infinity};
      for(let k=0;k<3;k++)color[k]=Math.round(color[k]/n);
      pixels(shape,i=>{for(let k=0;k<3;k++)after+=(rgbData[i+k]-color[k])**2;});
      return {shape,color,score:before-after};
    }
    for(let layer=0;layer<count;layer++){
      let best={score:0};
      const unit=Math.min(w,h),limit=unit*(.42-.27*layer/Math.max(1,count));
      for(let k=0;k<14;k++){
        const candidate=evaluate({type:type==='mix'?types[Math.floor(random()*types.length)]:type,
          x:random()*w,y:random()*h,a:1+random()*limit,b:1+random()*limit});
        if(candidate.score>best.score)best=candidate;
      }
      if(!best.shape)continue;
      for(let k=0;k<6;k++){
        const original=best.shape,spread=Math.max(1,limit*(1-k/7)*.38);
        const shift=()=> (random()-.5)*spread*2;
        const candidate=evaluate({...original,x:clamp(original.x+shift(),0,w),y:clamp(original.y+shift(),0,h),
          a:clamp(original.a+shift(),1,w),b:clamp(original.b+shift(),1,h)});
        if(candidate.score>best.score)best=candidate;
      }
      pixels(best.shape,i=>{for(let k=0;k<3;k++)canvas[i+k]=best.color[k];});
      shapes.push({...best.shape,color:hex(best.color)});
    }
    return {w,h,base:hex(backdrop),shapes,initialError,finalError:totalError()};
  }
  function drawMesh(ctx,model,w,h){
    ctx.save();ctx.scale(w/model.w,h/model.h);
    ctx.fillStyle=model.base;ctx.fillRect(0,0,model.w,model.h);
    for(const {type,x,y,a,b,color,angle=0,alpha=1} of model.shapes){
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.translate(-x,-y);ctx.globalAlpha*=alpha;
      ctx.fillStyle=color;
      if(type==='rect'){ctx.fillRect(x-a,y-b,2*a,2*b);ctx.restore();continue;}
      ctx.beginPath();
      if(type==='ellipse')ctx.ellipse(x,y,a,b,0,0,2*Math.PI);
      else{ctx.moveTo(x-a,y+b);ctx.lineTo(x+a,y+b);ctx.lineTo(x,y-b);ctx.closePath();}
      ctx.fill();ctx.restore();
    }
    ctx.restore();
  }
  function svg(model,w,h){
    const number=n=>Number(n.toFixed(3));
    const art=model.shapes.map(({type,x,y,a,b,color,angle=0,alpha=1})=>{
      const f=` fill="${color}" fill-opacity="${number(alpha)}" transform="rotate(${number(angle*180/Math.PI)} ${number(x)} ${number(y)})"`;
      if(type==='rect')return `<rect x="${number(x-a)}" y="${number(y-b)}" width="${number(2*a)}" height="${number(2*b)}"${f}/>`;
      if(type==='ellipse')return `<ellipse cx="${number(x)}" cy="${number(y)}" rx="${number(a)}" ry="${number(b)}"${f}/>`;
      return `<polygon points="${number(x-a)},${number(y+b)} ${number(x+a)},${number(y+b)} ${number(x)},${number(y-b)}"${f}/>`;
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${model.w} ${model.h}" preserveAspectRatio="none"><rect width="100%" height="100%" fill="${model.base}"/>${art.join('')}</svg>`;
  }
  return {families,analyze,region,palette,placement,overlap,approximate,drawMesh,svg,contrast};
})();
