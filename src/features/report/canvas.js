/* BUILD UP 수업 리포트 PNG — 캔버스로 직접 그려요 (1030 x 1030, 2배 해상도) */
import {ASSETS} from '../../config.js';
const W=1030,H=1030,SC=2;
const G='#17b98a',GL='#2fe0a5',GOLD='#f2c14e',WHITE='#ffffff';
const FN={han:"'Black Han Sans','Noto Sans KR',sans-serif",num:"'Oswald','Noto Sans KR',sans-serif",ko:"'Noto Sans KR',sans-serif",pen:"'Nanum Pen Script','Noto Sans KR',cursive"};
const SERIES_COL=['#35e3a8','#ffa94d','#5ccfff','#c8f04d'];

const loadImg=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src;});
async function fonts(){
  try{await Promise.all(["700 20px Oswald","400 20px Oswald","400 20px 'Black Han Sans'","400 20px 'Nanum Pen Script'","400 20px 'Noto Sans KR'","700 20px 'Noto Sans KR'"].map(f=>document.fonts.load(f,'가A0')));}catch(e){}
}
function pbFmt(v){
  if(v==null||v==='')return '—';
  const n=parseFloat(String(v).replace(/[^0-9.]/g,''));
  if(isNaN(n))return String(v);
  const [a,b='']=n.toFixed(2).split('.');
  return a+'"'+b;
}
function ord(n){const s=['th','st','nd','rd'],v=n%100;return s[(v-20)%10]||s[v]||s[0];}
function wrap(ctx,text,maxW){
  const lines=[];
  String(text||'').split('\n').forEach(par=>{
    if(!par){lines.push('');return;}
    let cur='';
    for(const ch of par){
      const t=cur+ch;
      if(ctx.measureText(t).width>maxW&&cur){
        // 영문 단어는 가능하면 공백에서 끊기
        const sp=cur.lastIndexOf(' ');
        if(sp>0&&ch!==' '&&/[A-Za-z0-9]$/.test(cur)&&/[A-Za-z0-9]/.test(ch)){lines.push(cur.slice(0,sp));cur=cur.slice(sp+1)+ch;}
        else{lines.push(cur);cur=ch===' '?'':ch;}
      }else cur=t;
    }
    lines.push(cur);
  });
  return lines;
}
function fitText(ctx,text,x,y,maxW,maxH,fontFam,maxPx,minPx,color,lhMul){
  let px=maxPx,lines;
  for(;px>=minPx;px--){ctx.font=`${px}px ${fontFam}`;lines=wrap(ctx,text,maxW);if(lines.length*px*lhMul<=maxH)break;}
  ctx.font=`${px}px ${fontFam}`;ctx.fillStyle=color;ctx.textBaseline='top';ctx.textAlign='left';
  const lh=px*lhMul;let n=0;
  for(const l of lines){if((n+1)*lh>maxH+lh*0.5)break;ctx.fillText(l,x,y+n*lh);n++;}
}
function T(ctx,s,x,y,font,color,align='left',base='alphabetic'){ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline=base;ctx.fillText(s,x,y);}
function hline(ctx,x1,x2,y,c='rgba(255,255,255,.55)',w=1){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y);ctx.lineTo(x2,y);ctx.stroke();}
function niceTicks(lo,hi,n=5){
  const raw=(hi-lo)/(n-1),steps=[0.5,1,2,2.5,5,10,20,25,50],st=steps.find(s=>s>=raw)||50;
  const a=Math.floor(lo/st)*st,b=Math.ceil(hi/st)*st,t=[];for(let v=a;v<=b+1e-9;v+=st)t.push(Math.round(v*100)/100);return t;
}

/* data = {name, dived, pbStroke, pb, target, date, nth, dry:[{cat,name,level,desc,target,actual}], swim:{dates:[], series:[{label,vals:[],target}]}, prep:[], comment} */
export async function renderReport(data){
  await fonts();
  const [logo,sa]=await Promise.all([loadImg(ASSETS.logo),loadImg(ASSETS.salane)]);
  const c=document.createElement('canvas');c.width=W*SC;c.height=H*SC;
  const ctx=c.getContext('2d');ctx.scale(SC,SC);
  // 배경
  const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#13b58a');bg.addColorStop(.38,'#0b6a55');bg.addColorStop(.7,'#06352d');bg.addColorStop(1,'#041e1a');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

  // 로고/타이틀
  if(logo)ctx.drawImage(logo,48,18,112,115);
  T(ctx,'BUILD-UP',178,92,`italic 58px ${FN.han}`,GOLD);
  T(ctx,'in CLOSEDCLASS',330,118,`italic 700 15px ${FN.num}`,WHITE);

  // 오른쪽 위: SWIMMER / RECORD
  const RX=678,RW=332,MX=RX+150;
  T(ctx,'SWIMMER',RX+75,86,`700 25px ${FN.num}`,WHITE,'center');
  T(ctx,'RECORD',MX+(RX+RW-MX)/2,86,`700 25px ${FN.num}`,WHITE,'center');
  hline(ctx,RX,RX+RW,98);
  ctx.strokeStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.moveTo(MX,98);ctx.lineTo(MX,152);ctx.stroke();
  ctx.save();ctx.font=`700 ${data.name.length>4?24:30}px ${FN.ko}`;ctx.fillStyle=WHITE;ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText(data.name,RX+75,128,140);ctx.restore();
  T(ctx,'dived in '+data.dived,RX+75,147,`700 11px ${FN.num}`,WHITE,'center');
  T(ctx,'PB',MX+12,122,`700 17px ${FN.num}`,WHITE);
  T(ctx,'50m '+({'자유형':'FR.','배영':'BK.','평영':'BR.','접영':'FLY.'}[data.pbStroke]||''),MX+36,121,`700 10px ${FN.num}`,WHITE);
  T(ctx,pbFmt(data.pb),RX+RW-8,124,`700 25px ${FN.num}`,GL,'right');
  T(ctx,'TARGET',MX+12,143,`700 16px ${FN.num}`,WHITE);
  T(ctx,pbFmt(data.target),RX+RW-8,146,`700 25px ${FN.num}`,GOLD,'right');
  hline(ctx,RX,RX+RW,152);

  // DATE / SESSIONS
  T(ctx,'DATE',RX+75,200,`700 25px ${FN.num}`,WHITE,'center');
  T(ctx,'SESSIONS',MX+(RX+RW-MX)/2,200,`700 25px ${FN.num}`,WHITE,'center');
  hline(ctx,RX,RX+RW,212);
  ctx.beginPath();ctx.moveTo(MX,212);ctx.lineTo(MX,258);ctx.stroke();
  T(ctx,data.date,RX+75,246,`700 23px ${FN.num}`,GL,'center');
  T(ctx,String(data.nth),MX+(RX+RW-MX)/2-12,250,`700 42px ${FN.num}`,WHITE,'center');
  T(ctx,ord(data.nth),MX+(RX+RW-MX)/2+(String(data.nth).length*12)+2,234,`700 18px ${FN.num}`,WHITE,'left');
  hline(ctx,RX,RX+RW,262);

  // SELF PREP
  T(ctx,'SELF PREP',RX,330,`700 30px ${FN.num}`,WHITE);
  hline(ctx,RX,RX+RW,342);
  const dryP=data.prep.filter(x=>x.k==='dry'),swP=data.prep.filter(x=>x.k==='swim');
  const lines=[];
  if(dryP.length){lines.push({h:'dryland'});dryP.forEach(x=>lines.push({t:'-'+x.name+(x.amount?' | '+x.amount:'')}));}
  if(swP.length){lines.push({h:'swim'});swP.forEach(x=>lines.push({t:'-'+x.name+(x.amount?' | '+x.amount:'')}));}
  const PY=352,PH=252;
  if(!lines.length){T(ctx,'—',RX,PY+20,`22px ${FN.pen}`,'rgba(255,255,255,.6)');}
  else{
    let px=22,rows;
    for(;px>=12;px--){ctx.font=`${px}px ${FN.pen}`;rows=[];lines.forEach(l=>{if(l.h)rows.push(l);else wrap(ctx,l.t,RW).forEach((s,i)=>rows.push({t:(i?' ':'')+s}));});if(rows.length*px*1.12<=PH)break;}
    let y=PY;const lh=px*1.12;
    rows.forEach(r=>{
      if(r.h){ctx.font=`700 ${px+2}px ${FN.num}`;ctx.fillStyle=GL;ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText('▶ '+r.h,RX,y);}
      else{ctx.font=`${px}px ${FN.pen}`;ctx.fillStyle=WHITE;ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText(r.t,RX,y);}
      y+=lh;
    });
  }

  // FEEDBACK
  T(ctx,'FEEDBACK',RX,650,`700 30px ${FN.num}`,WHITE);
  const fb=(data.name+' 님\n'+(data.comment||'')).trim();
  fitText(ctx,data.comment?fb:'',RX,668,RW,305,FN.pen,26,14,WHITE,1.12);

  // DRYLAND
  T(ctx,'DRYLAND',60,200,`700 31px ${FN.num}`,WHITE);
  hline(ctx,60,640,212);
  const n=data.dry.length||5,TX=72,LW=124,CW=(640-TX-LW)/Math.max(n,1);
  const rowsY=[[214,240,'hd'],[240,270,'CONCEPT'],[270,298,'OPTION'],[298,328,'TARGET']];
  rowsY.forEach(([y1,y2,lab])=>{
    if(lab!=='hd'){ctx.fillStyle=G;ctx.fillRect(TX,y1,LW,y2-y1);T(ctx,lab,TX+LW/2,(y1+y2)/2+6,`700 17px ${FN.num}`,'#04201c','center');}
  });
  data.dry.forEach((d,i)=>{
    const x=TX+LW+i*CW;
    ctx.fillStyle=G;ctx.fillRect(x,214,CW-2,26);
    T(ctx,d.cat.endsWith('+')?'+':d.cat,x+CW/2,233,`700 17px ${FN.num}`,'#04201c','center');
    ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1;
    [[240,270],[270,298],[298,328]].forEach(([y1,y2])=>ctx.strokeRect(x+.5,y1+.5,CW-3,y2-y1-1));
    ctx.save();ctx.font=`700 ${d.name.length>9?10:12}px ${FN.num}`;ctx.fillStyle=WHITE;ctx.textAlign='center';ctx.fillText(d.name.toUpperCase(),x+CW/2,259,CW-8);ctx.restore();
    T(ctx,d.level?('Lv.'+d.level):'-',x+CW/2,d.desc?281:289,`700 14px ${FN.num}`,WHITE,'center');
    if(d.desc){ctx.save();ctx.font=`11px ${FN.ko}`;ctx.fillStyle=GOLD;ctx.textAlign='center';ctx.fillText(d.desc,x+CW/2,293,CW-6);ctx.restore();}
    T(ctx,d.level?String(d.target):'-',x+CW/2,320,`700 20px ${FN.num}`,GL,'center');
  });
  // 막대 그래프
  const maxT=Math.max(5,...data.dry.map(d=>Math.max(d.target||0,d.actual||0)));
  const axMax=Math.ceil(maxT/5)*5+5>25&&maxT<=25?25:Math.ceil((maxT+1)/5)*5;
  const BX=110,BW=640-BX-10;
  ctx.fillStyle=GL;ctx.fillRect(240,350,9,9);T(ctx,'actual',254,359,`700 12px ${FN.num}`,WHITE);
  ctx.fillStyle='#10342c';ctx.fillRect(330,350,9,9);T(ctx,'to target',344,359,`700 12px ${FN.num}`,WHITE);
  const byTop=378,byStep=34;
  for(let t=0;t<=axMax;t+=5){const x=BX+BW*t/axMax;hline(ctx,x,x,byTop-14,'rgba(255,255,255,.12)');ctx.strokeStyle='rgba(255,255,255,.12)';ctx.beginPath();ctx.moveTo(x,byTop-12);ctx.lineTo(x,byTop+byStep*Math.max(n,1)-8);ctx.stroke();T(ctx,String(t),x,byTop+byStep*Math.max(n,1)+6,`700 11px ${FN.num}`,WHITE,'center');}
  data.dry.forEach((d,i)=>{
    const y=byTop+i*byStep,a=d.actual||0,tg=d.target||0;
    T(ctx,(d.cat.endsWith('+')?d.cat:d.cat),BX-8,y+14,`700 11px ${FN.num}`,WHITE,'right');
    const aw=BW*a/axMax,rem=Math.max(tg-a,0),rw=BW*rem/axMax;
    if(a>0){ctx.fillStyle=G;ctx.fillRect(BX,y,aw,22);T(ctx,String(Math.round(a*10)/10),BX+aw/2,y+17,`700 17px ${FN.num}`,WHITE,'center');}
    else T(ctx,'-',BX+8,y+17,`700 16px ${FN.num}`,'rgba(255,255,255,.7)');
    if(!d.level)return;
    if(rw>0){ctx.fillStyle='#10342c';ctx.fillRect(BX+aw,y,rw,22);}
    T(ctx,String(Math.round(rem*10)/10),BX+aw+rw+4,y+17,`700 15px ${FN.num}`,WHITE);
  });

  // SWIM
  T(ctx,'SWIM',60,590,`700 31px ${FN.num}`,WHITE);
  hline(ctx,60,640,602);
  const sw=data.swim,SL=105,SR=640,ST=662,SB=870;
  // 범례
  let lx=150;
  sw.series.forEach((s,i)=>{ctx.fillStyle=SERIES_COL[i%4];ctx.beginPath();ctx.arc(lx,634,6,0,7);ctx.fill();T(ctx,s.label,lx+11,639,`700 13px ${FN.num}`,WHITE);lx+=ctx.measureText(s.label).width+42;});
  const vals=[];sw.series.forEach(s=>{s.vals.forEach(v=>{if(v!=null)vals.push(v);});if(s.target!=null)vals.push(s.target);});
  if(!vals.length){T(ctx,'아직 수영 기록이 없어요',(SL+SR)/2,(ST+SB)/2,`16px ${FN.ko}`,'rgba(255,255,255,.7)','center');}
  else{
    let lo=Math.min(...vals),hi=Math.max(...vals);const pad=Math.max((hi-lo)*0.12,1);
    const ticks=niceTicks(lo-pad,hi+pad,5);lo=ticks[0];hi=ticks[ticks.length-1];
    const cols=sw.dates.length+1,xs=i=>SL+20+(SR-SL-40)*(cols===1?0.5:i/(cols-1)),y=v=>ST+(SB-ST)*(1-(v-lo)/(hi-lo));
    ticks.forEach(t=>{hline(ctx,SL,SR,y(t),'rgba(255,255,255,.18)');T(ctx,String(t),SL-8,y(t)+4,`700 12px ${FN.num}`,WHITE,'right');});
    sw.dates.forEach((d,i)=>T(ctx,d,xs(i),SB+22,`700 12px ${FN.num}`,WHITE,'center'));
    T(ctx,'TARGET',xs(sw.dates.length),SB+22,`700 12px ${FN.num}`,WHITE,'center');
    sw.series.forEach((s,si)=>{
      const col=SERIES_COL[si%4];ctx.strokeStyle=col;ctx.lineWidth=2.2;ctx.lineJoin='round';ctx.beginPath();let st=false;
      s.vals.forEach((v,i)=>{if(v==null)return;if(!st){ctx.moveTo(xs(i),y(v));st=true;}else ctx.lineTo(xs(i),y(v));});ctx.stroke();
      s.vals.forEach((v,i)=>{if(v==null)return;ctx.fillStyle=col;ctx.beginPath();ctx.arc(xs(i),y(v),4.2,0,7);ctx.fill();
        T(ctx,(Math.round(v*10)/10).toFixed(1),xs(i),y(v)+(si%2?19:-9),`700 14px ${FN.num}`,WHITE,'center');});
      if(s.target!=null){const x=xs(sw.dates.length);ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y(s.target),4.2,0,7);ctx.fill();
        T(ctx,(+s.target).toFixed(1),x,y(s.target)+(si%2?19:-9),`italic 700 14px ${FN.num}`,WHITE,'center');}
    });
  }
  // 하단 로고
  if(sa){const h=34,w=sa.width/sa.height*h;ctx.drawImage(sa,W/2-w/2,978,w,h);}
  return c;
}

