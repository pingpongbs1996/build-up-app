/* 기록 입력 폼 (지상운동 / 수영). 회원 본인과 선생님이 같이 써요: writer = 'member' | 'staff' */
import {STROKES,PAIRS} from '../config.js';
import {esc,fmt,valid,sumSets,avg,swimLabel} from '../utils.js';
import {S,D,form,sessById,monthOfSession,cfgOf,exLabel} from '../state.js';
import {rngHtml,lvDesc} from '../ui/components.js';
import {drawDryChart,drawChart,swSelHtml,swNames} from './charts.js';

/* 폼을 만들어 root 안에 그려요. 입력 중인 값은 form.cur.draft에 있어요. */
export function mountForm(root,profile,sid,writer){
  const mem=D.mem[profile.id],month=monthOfSession(sid),cfg=cfgOf(mem,month.id),ses=sessById(sid);
  const draft={dry:{},swim:{}},ns=month.dry_sets;
  month.keys.forEach(k=>{
    const ex=mem.dry[sid]&&mem.dry[sid][k],p=prevDry(mem,k,ses.date);
    draft.dry[k]={lv:ex?ex.level:(p?p.rec.level:1),sets:Array.from({length:ns},(_,i)=>ex&&ex.sets[i]!=null?String(ex.sets[i]):'')};
  });
  PAIRS[cfg.pair].forEach((n,i)=>{
    const sw=mem.swim[sid]&&mem.swim[sid][n],c=i===0?month.rounds:month.reps;
    draft.swim[n]=Array.from({length:c},(_,j)=>sw&&sw.sets[j]!=null?String(sw.sets[j]):'');
  });
  form.cur={root,profile,mem,sid,ses,month,cfg,writer,draft,view:S.swView||cfg.stroke};
  renderForm();
}

/* 같은 종목의 바로 이전 기록 */
function prevDry(mem,k,date){
  let best=null;
  for(const sid in mem.dry){const s=sessById(sid);if(!s||s.date>=date||!mem.dry[sid][k])continue;if(!best||s.date>best.date)best={date:s.date,rec:mem.dry[sid][k]};}
  return best;
}
/* 같은 영법·시리즈의 바로 이전 기록 (★ 시리즈는 같은 달 것만 비교) */
function prevSwim(mem,stroke,date,series,monthId){
  let best=null;
  for(const sid in mem.swim){const s=sessById(sid),r=mem.swim[sid][series];if(!s||s.date>=date||!r||r.stroke!==stroke||avg(r.sets)==null||(series.includes('★')&&s.month_id!==monthId))continue;if(!best||s.date>best.date)best={date:s.date,avg:avg(r.sets)};}
  return best;
}

export function renderForm(){
  const F=form.cur,tab=S.tab==='swim'?'swim':'dry';
  const has=F.mem.dry[F.sid]||F.mem.swim[F.sid];
  const dr=has&&Object.values(F.mem.dry[F.sid]||{})[0],sw=has&&Object.values(F.mem.swim[F.sid]||{})[0],ent=dr||sw;
  const byStaff=ent&&ent.by&&ent.by!==F.profile.id;
  F.root.innerHTML=`<div class="form">
   ${F.writer==='staff'?`<div class="seg" role="tablist"><button data-act="tab" data-tab="dry" class="${tab==='dry'?'on':''}" role="tab">지상운동</button><button data-act="tab" data-tab="swim" class="${tab==='swim'?'on':''}" role="tab">수영</button></div>`:''}
   ${has?`<div class="banner">${fmt(F.ses.date)} 기록이 있어요 · ${byStaff?'선생님이 입력':'본인이 입력'} · 고쳐서 다시 저장할 수 있어요</div>`:''}
   ${tab==='dry'?dryHtml():swimHtml()}
   <div class="savebar"><span class="hint">${F.writer==='staff'?'선생님이 회원 대신 입력하는 중이에요':'저장하면 그래프와 지난번 비교가 바로 바뀌어요'}</span><button class="btn" data-act="save" id="savebtn">저장</button></div></div>`;
  if(tab==='dry'){F.month.keys.forEach(k=>{updateDry(k);if(S.open[k])drawDryChart(k);});}
  else{PAIRS[F.cfg.pair].forEach(updateSwim);drawChart();}
}

/* ----- 지상운동 ----- */
function dryHtml(){
  const F=form.cur,ns=F.month.dry_sets;
  if(!F.month.keys.length)return '<div class="empty">이번 달 종목이 아직 정해지지 않았어요.</div>';
  const head=`<div class="srow2"><span></span><div class="sghead">${Array.from({length:ns},(_,i)=>`<span>${i+1}세트</span>`).join('')}</div><span></span></div>`;
  const sum=F.month.keys.map(k=>{const e=D.ex[k];return `<div class="srow2"><span>${esc(exLabel(e))}</span><div class="segtrack">${Array.from({length:ns},(_,i)=>`<div class="sg"><i data-sf="${k}-${i}"></i><em data-so="${k}-${i}"></em></div>`).join('')}</div><span data-sval="${k}"></span></div>`;}).join('');
  const cards=F.month.keys.map(k=>{
    const e=D.ex[k],d=F.draft.dry[k],open=!!S.open[k];
    const inputs=d.sets.map((_,i)=>`<div><div class="setlabel">${i+1}세트</div><div class="stepper"><button type="button" data-act="step" data-k="${k}" data-i="${i}" data-d="-1" aria-label="${esc(e.name)} ${i+1}세트 1 줄이기">−</button><input class="num f-in" data-kind="dry" data-k="${k}" data-i="${i}" type="number" inputmode="numeric" min="0" placeholder="-" value="${esc(d.sets[i])}" aria-label="${esc(e.name)} ${i+1}세트 개수"><button type="button" data-act="step" data-k="${k}" data-i="${i}" data-d="1" aria-label="${esc(e.name)} ${i+1}세트 1 늘리기">+</button></div></div>`).join('');
    return `<article class="card ex"><header><div><h3>${esc(exLabel(e))}</h3></div>
      <div class="lvwrap"><span class="lvlab">Lv</span><div class="lvseg" role="group" aria-label="${esc(e.name)} 레벨">${[1,2,3,4,5].map(l=>`<button type="button" class="lvbtn ${l===+d.lv?'on':''}" data-act="lv" data-k="${k}" data-lv="${l}" aria-pressed="${l===+d.lv}">${l}</button>`).join('')}</div></div></header>
      <div class="tgt">Lv.<span data-lvt="${k}">${d.lv}</span> 목표 <b data-tgt="${k}">${e.targets[d.lv]}</b>개 × ${ns}세트<span class="lvd" data-lvd="${k}">${lvDesc(e,d.lv)?' · '+esc(lvDesc(e,d.lv)):''}</span></div>
      ${(F.mem.dry[F.sid]&&F.mem.dry[F.sid][k]&&F.mem.dry[F.sid][k].note)?`<div class="note">메모: ${esc(F.mem.dry[F.sid][k].note)}</div>`:''}<div class="sets">${inputs}</div><div class="dlt" data-delta="${k}"></div>
      <button type="button" class="more" data-act="hist" data-k="${k}" aria-expanded="${open}"><span>그동안의 변화 보기</span><span class="arr">▾</span></button>
      <div class="hpanel" data-hp="${k}" ${open?'':'hidden'}>${rngHtml()}<div class="legend" data-dl="${k}"></div><div class="dchart" data-dc="${k}"></div></div></article>`;
  }).join('');
  return `<section class="card sum"><h2>오늘 달성 (세트별 · 합계 / 목표)</h2>${head}${sum}</section><div class="exlist">${cards}</div>`;
}

/* 지난번과 비교한 문구 + 레벨 올림 안내 */
function dryDelta(k){
  const F=form.cur,d=F.draft.dry[k],p=prevDry(F.mem,k,F.ses.date),t=sumSets(d.sets),lv=+d.lv;
  let h='';
  if(!p)h='<span class="first">첫 기록 · 이 종목은 이번에 새로 시작해요</span>';
  else{
    const pl=p.rec.level,pt=sumSets(p.rec.sets);
    let cls='same',txt=`Lv.${lv} 유지`;
    if(lv>pl){cls='up';txt=`Lv.${pl} → Lv.${lv} ▲`;}else if(lv<pl){cls='down';txt=`Lv.${pl} → Lv.${lv} ▼`;}
    let r=`지난번(${fmt(p.date)}) <b>${pt}</b>개`;
    if(t!=null){const df=t-pt;r+=` → 오늘 <b>${t}</b>개 <span class="df">${df>0?'▲ +'+df:df<0?'▼ '+df:'= 동일'}</span>`;}else r+=' → 오늘 <span class="muted">입력 전</span>';
    h=`<span class="lvb ${cls}">${txt}</span><span>${r}</span>`;
  }
  const ent=d.sets.filter(valid).map(Number);
  if(ent.length){
    const e=D.ex[k],tg=e.targets[lv],a=ent.reduce((s,x)=>s+x,0)/ent.length;
    if(a>=tg*e.promo_pct/100)h+=lv<5?`<span class="promo up">세트 평균 ${Math.round(a*10)/10}개로 목표를 크게 넘었어요. 다음 레벨(Lv.${lv+1})로 진행해 주세요 ▲</span>`:'<span class="promo ok">최고 레벨에서 목표를 크게 넘겼어요!</span>';
    else if(ent.length===d.sets.length&&ent.every(x=>x>=tg))h+='<span class="promo ok">목표 달성!</span>';
  }
  return h;
}
/* 입력값이 바뀔 때 종목 하나의 막대·합계·목표 표시만 갱신해요 */
export function updateDry(k){
  const F=form.cur,d=F.draft.dry[k],e=D.ex[k],tg=e.targets[d.lv],t=sumSets(d.sets)||0,r=F.root;
  const a=r.querySelector(`[data-delta="${k}"]`);if(a)a.innerHTML=dryDelta(k);
  d.sets.forEach((x,i)=>{const v=valid(x)?+x:0,f=r.querySelector(`[data-sf="${k}-${i}"]`),o=r.querySelector(`[data-so="${k}-${i}"]`);
    if(f)f.style.width=Math.min(100,v/tg*100)+'%';if(o)o.textContent=v>tg?'+'+(v-tg):'';});
  const v=r.querySelector(`[data-sval="${k}"]`);if(v)v.textContent=t+' / '+(tg*d.sets.length);
  const g=r.querySelector(`[data-tgt="${k}"]`);if(g)g.textContent=tg;
  const l=r.querySelector(`[data-lvt="${k}"]`);if(l)l.textContent=d.lv;
  const ld=r.querySelector(`[data-lvd="${k}"]`);if(ld){const t2=lvDesc(e,d.lv);ld.textContent=t2?' · '+t2:'';}
}

/* ----- 수영 ----- */
function swimHtml(){
  const F=form.cur,view=F.view,names=PAIRS[F.cfg.pair],pbo=F.mem.pb[view]||{};
  const cnt=s=>{let n=0;for(const sid in F.mem.swim){const v=Object.values(F.mem.swim[sid]);if(v.length&&v[0].stroke===s)n++;}return n;};
  const strokes=STROKES.map(s=>`<button data-act="stroke" data-s="${s}" class="${s===view?'on':''}">${s}<small>${s===F.cfg.stroke?'이번 달':(cnt(s)?cnt(s)+'회 기록':'기록 없음')}</small></button>`).join('');
  const pb=`<div class="pbbar"><span class="pb">PB <b>${esc(pbo.pb||'—')}</b></span><span class="tp">목표 페이스 <b>${esc(pbo.target||'—')}</b></span>${pbo.cycle?`<span class="tp">사이클 <b>${esc(pbo.cycle)}</b></span>`:''}<span class="muted">${esc(view)} 50m 기준</span></div>`;
  let body;
  if(view===F.cfg.stroke){
    const tg=F.cfg.series_targets||{};
    body=`<section class="card">${names.map((n,i)=>`<div class="srow"><div class="shead"><span class="dot c${i}"></span><b>${n}</b>${tg[n]?`<span class="tg">목표 ${esc(tg[n])}</span>`:''}<span class="avg" data-avg="${n}">평균 —</span></div>
      <div class="sgrid">${F.draft.swim[n].map((v,j)=>`<label><span>${swimLabel(i,j)}</span><input class="f-in" data-kind="swim" data-n="${n}" data-i="${j}" type="text" inputmode="decimal" placeholder="-" value="${esc(v)}" aria-label="${n} ${swimLabel(i,j)} 페이스"></label>`).join('')}</div>
      <div class="dlt" data-sdelta="${n}"></div></div>`).join('')}</section>`;
  }else body=`<div class="note">이번 달 영법은 <b>${esc(F.cfg.stroke)}</b>이에요. ${esc(view)}은 지난 기록만 볼 수 있어요.</div>`;
  const rows=[];for(const sid in F.mem.swim){const s=sessById(sid),v=F.mem.swim[sid],f=Object.values(v)[0];if(s&&f&&f.stroke===view)rows.push({d:s.date,v});}
  const hist=rows.sort((a,b)=>a.d<b.d?1:-1).map(r=>`<div class="hrow"><b>${fmt(r.d)}</b>${swNames(view).map(n=>{const a=r.v[n]?avg(r.v[n].sets):null;return `<span>${esc(n)} <b>${a==null?'-':a.toFixed(1)}</b></span>`;}).join('')}<span class="by">${Object.values(r.v)[0].by&&Object.values(r.v)[0].by!==F.profile.id?'선생님 입력':'본인 입력'}</span></div>`).join('');
  return `<div class="strokes">${strokes}</div>${pb}${body}<section class="card chartbox">${swSelHtml()}${rngHtml()}<div class="legend" id="legend"></div><div id="chart"></div></section><div class="hist">${hist}</div>`;
}
function swimDelta(n){
  const F=form.cur,p=prevSwim(F.mem,F.view,F.ses.date,n,F.month.id),a=avg(F.draft.swim[n]);
  if(!p)return `<span class="first">첫 기록 · ${esc(F.view)}은 이번에 새로 시작해요</span>`;
  let r=`지난번(${fmt(p.date)}) 평균 <b>${p.avg.toFixed(1)}</b>`;
  if(a!=null){const df=Math.round((a-p.avg)*10)/10;r+=` → 오늘 <b>${a.toFixed(1)}</b> <span class="df">${df>0?'▲ +'+df:df<0?'▼ '+df:'= 동일'}</span>`;}else r+=' → 오늘 <span class="muted">입력 전</span>';
  return `<span>${r}</span>`;
}
export function updateSwim(n){
  const F=form.cur,r=F.root,a=avg(F.draft.swim[n]),e=r.querySelector(`[data-avg="${n}"]`);
  if(e)e.innerHTML='평균 <b>'+(a==null?'—':a.toFixed(1))+'</b>';
  const d=r.querySelector(`[data-sdelta="${n}"]`);if(d)d.innerHTML=swimDelta(n);
}
