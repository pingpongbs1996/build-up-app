/* 입력 폼 안의 그래프: 지상운동 종목별 추이, 수영 페이스 추이 (SVG를 직접 그려요) */
import {PAIRS} from '../config.js';
import {esc,fmt,sumSets,avg,addDays} from '../utils.js';
import {S,D,form,sessById} from '../state.js';

function inRange(list){
  if(S.range==='8')return list.slice(-8);
  if(S.range==='3m'){const cs=addDays(S.today,-92);return list.filter(x=>x.d>=cs);}
  return list;
}

/* ----- 지상운동 ----- */
function dryRecs(k){
  const F=form.cur,out=[];
  for(const sid in F.mem.dry){const s=sessById(sid);if(s&&F.mem.dry[sid][k])out.push({d:s.date,r:F.mem.dry[sid][k]});}
  return inRange(out.sort((a,b)=>a.d<b.d?-1:1));
}
export function drawDryChart(k){
  const F=form.cur,el=F.root.querySelector(`[data-dc="${k}"]`),lg=F.root.querySelector(`[data-dl="${k}"]`);if(!el)return;
  const recs=dryRecs(k);
  if(!recs.length){el.innerHTML='<div class="empty">아직 기록이 없어요</div>';lg.innerHTML='';return;}
  const ex=D.ex[k],tot=x=>sumSets(x.r.sets)||0,tt=x=>ex.targets[x.r.level]*x.r.sets.length;
  const W=Math.max(280,el.clientWidth),H=210,L=34,R=18,T=26,B=28;
  const hi=Math.ceil((Math.max(...recs.map(x=>Math.max(tot(x),tt(x))))*1.12+1)/4)*4;
  const x=i=>recs.length===1?L+(W-L-R)/2:L+i*(W-L-R)/(recs.length-1),y=v=>T+(H-T-B)*(1-v/hi);
  let g='';
  for(let i=0;i<=4;i++){const v=hi/4*i;g+=`<line class="gl" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${L-6}" y="${y(v)+3}" text-anchor="end">${Math.round(v*10)/10}</text>`;}
  recs.forEach((p,i)=>{g+=`<text class="ax" x="${x(i)}" y="${H-8}" text-anchor="middle">${fmt(p.d)}</text>`;});
  if(recs.length>1)g+=`<polyline class="lnm" points="${recs.map((p,i)=>x(i)+','+y(tot(p))).join(' ')}"/>`;
  recs.forEach((p,i)=>{g+=`<line class="tmark" x1="${x(i)-13}" x2="${x(i)+13}" y1="${y(tt(p))}" y2="${y(tt(p))}"/><circle cx="${x(i)}" cy="${y(tot(p))}" r="6" style="fill:var(--lv${p.r.level});stroke:var(--panel);stroke-width:2"/><text class="vl" x="${x(i)}" y="${y(tot(p))-11}">${tot(p)}</text>`;});
  el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ex.name)} 회차별 합계 개수">${g}</svg>`;
  lg.innerHTML=[...new Set(recs.map(p=>p.r.level))].sort().map(l=>`<span><i class="dot" style="background:var(--lv${l})"></i>Lv.${l}</span>`).join('')+'<span>점선 = 그날 목표 합계</span>';
}

/* ----- 수영: 보기(종합/시리즈)와 프로그램 선택 ----- */
export function swNames(view){
  const F=form.cur,u=new Set();
  for(const sid in F.mem.swim){for(const n in F.mem.swim[sid])if(F.mem.swim[sid][n].stroke===view)u.add(n);}
  return u.size?[...u].sort((a,b)=>b.includes('★')-a.includes('★')):PAIRS[F.cfg.pair];
}
export function swCur(names){return S.swSel==='all'||names.includes(S.swSel)?S.swSel:'all';}
function swProgs(view,n){
  const F=form.cur,ids=new Set();
  for(const sid in F.mem.swim){const r=F.mem.swim[sid][n];if(r&&r.stroke===view){const x=sessById(sid);if(x)ids.add(x.month_id);}}
  return D.months.filter(m=>ids.has(m.id));
}
function swProgCur(list){
  const F=form.cur;
  if(S.swProg==='all')return 'all';
  if(list.some(m=>m.id===S.swProg))return S.swProg;
  if(list.some(m=>m.id===F.month.id))return F.month.id;
  return list.length?list[list.length-1].id:'all';
}
export function swSelInner(){
  const F=form.cur,names=swNames(F.view),cur=swCur(names);
  let h=`<div class="rng" role="group" aria-label="보기 선택">${['all',...names].map(n=>`<button type="button" data-act="swsel" data-s="${esc(n)}" class="${cur===n?'on':''}">${n==='all'?'종합':esc(n)}</button>`).join('')}</div>`;
  if(cur!=='all'&&cur.includes('★')){
    const pl=swProgs(F.view,cur);
    if(pl.length>1){const pc=swProgCur(pl);h+=`<div class="rng sub" role="group" aria-label="프로그램 선택">${pl.map(m=>`<button type="button" data-act="swprog" data-p="${m.id}" class="${pc===m.id?'on':''}">${esc(m.concept)}</button>`).join('')}<button type="button" data-act="swprog" data-p="all" class="${pc==='all'?'on':''}">전체</button></div>`;}
  }
  return h;
}
export const swSelHtml=()=>`<div id="swselbox">${swSelInner()}</div>`;

/* ----- 수영 페이스 추이 ----- */
export function drawChart(){
  const F=form.cur,el=F.root.querySelector('#chart'),lg=F.root.querySelector('#legend');if(!el)return;
  const raw=[];
  for(const sid in F.mem.swim){const s=sessById(sid),v=F.mem.swim[sid],f=Object.values(v)[0];if(s&&f&&f.stroke===F.view)raw.push({d:s.date,m:s.month_id,sets:Object.fromEntries(Object.entries(v).map(([n,x])=>[n,x.sets]))});}
  const allNames=swNames(F.view),sel=swCur(allNames),single=sel!=='all',names=single?[sel]:allNames;
  let src=raw.sort((a,b)=>a.d<b.d?-1:1);
  if(single){
    src=src.filter(r=>r.sets[sel]);
    if(sel.includes('★')){const pc=swProgCur(swProgs(F.view,sel));if(pc!=='all')src=src.filter(r=>r.m===pc);}
  }else if(src.some(r=>r.m===F.month.id))src=src.filter(r=>r.m===F.month.id);
  const recs=inRange(src);
  if(!recs.length){el.innerHTML=`<div class="empty">${esc(F.view)} 기록이 아직 없어요</div>`;lg.innerHTML='';return;}
  const avgOf=(r,n)=>r.sets[n]?avg(r.sets[n]):null,tgs=F.cfg.series_targets||{};
  const vals=[];recs.forEach(r=>names.forEach(n=>{const a=avgOf(r,n);if(a!=null)vals.push(a);}));
  if(!vals.length){el.innerHTML='<div class="empty">이 시리즈 기록이 아직 없어요</div>';lg.innerHTML='';return;}
  let lo,hi,ticks=[],tgNote='',showTg={};
  if(single){
    const mn=Math.min(...vals),mx=Math.max(...vals),span=Math.max(mx-mn,1),tg=tgs[sel];
    let a=mn,b=mx;
    if(tg!=null&&tg!==''){if(tg>=mn-span&&tg<=mx+span){a=Math.min(a,tg);b=Math.max(b,tg);showTg[sel]=true;}else tgNote=`목표 ${tg} (그래프 범위 밖)`;}
    const pad=Math.max((b-a)*0.2,0.5),rough=(b-a+2*pad)/4,step=[0.5,1,2,5,10,20].find(x=>x>=rough)||20;
    lo=Math.floor((a-pad)/step)*step;hi=Math.ceil((b+pad)/step)*step;if(hi<=lo)hi=lo+step;
    for(let v=lo;v<=hi+1e-9;v+=step)ticks.push(v);
  }else{
    names.forEach(n=>{if(tgs[n]){vals.push(+tgs[n]);showTg[n]=true;}});
    lo=Math.floor((Math.min(...vals)-3)/5)*5;hi=Math.ceil((Math.max(...vals)+3)/5)*5;if(hi<=lo)hi=lo+5;
    for(let i=0;i<=4;i++)ticks.push(lo+(hi-lo)/4*i);
  }
  const W=Math.max(280,el.clientWidth),H=230,L=38,R=16,T=22,B=28;
  const x=i=>recs.length===1?L+(W-L-R)/2:L+i*(W-L-R)/(recs.length-1),y=v=>T+(H-T-B)*(1-(v-lo)/(hi-lo));
  let g='';
  ticks.forEach(v=>{g+=`<line class="gl" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${L-6}" y="${y(v)+3}" text-anchor="end">${Math.round(v*10)/10}</text>`;});
  recs.forEach((r,i)=>{g+=`<text class="ax" x="${x(i)}" y="${H-8}" text-anchor="middle">${fmt(r.d)}</text>`;});
  names.forEach(n=>{
    const c=allNames.indexOf(n)%2;
    if(showTg[n])g+=`<line class="tl${c}" x1="${L}" x2="${W-R}" y1="${y(tgs[n])}" y2="${y(tgs[n])}"/>`;
    const pts=recs.map((r,i)=>{const a=avgOf(r,n);return a==null?null:{x:x(i),y:y(a),a};}).filter(Boolean);
    if(pts.length>1)g+=`<polyline class="ln${c}" points="${pts.map(p=>p.x+','+p.y).join(' ')}"/>`;
    pts.forEach(p=>{g+=`<circle class="pt${c}" cx="${p.x}" cy="${p.y}" r="4"/><text class="vl" x="${p.x}" y="${p.y+(single||c===0?-9:15)}">${p.a.toFixed(1)}</text>`;});
  });
  lg.innerHTML=names.map(n=>`<span><i class="dot c${allNames.indexOf(n)%2}"></i>${esc(n)}</span>`).join('')+(single?`<span>${tgNote||'점선 = 목표'}</span><span>시리즈별 확대 그래프 · 세로축을 이 시리즈 기록 범위에 맞췄어요</span>`:'<span>점선 = 목표</span>');
  el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(F.view)} 평균 페이스 추이">${g}</svg>`;
}

/* 창 크기가 바뀌면 열려 있는 그래프를 다시 그려요 */
export function redrawCharts(){
  const F=form.cur;if(!F)return;
  if(S.tab==='swim')drawChart();else F.month.keys.forEach(k=>{if(S.open[k])drawDryChart(k);});
}
