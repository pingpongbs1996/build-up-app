/* 회원 스트레칭 탭: 고르기 화면 + 연속 재생 화면 */
import {STROKES} from '../../config.js';
import {esc,fmt,fmtT} from '../../utils.js';
import {STR} from './store.js';

export function memberHtml(){
  const st=STR.st;if(st.play)return playerHtml();
  if(!st.sel)STR.reset();
  const pill=(act,val,label,cur)=>`<button type="button" class="${cur===val?'on':''}" data-act="${act}" data-v="${esc(val)}">${esc(label)}</button>`;
  const srcs=[['week','이번 주 추천'],['month','이번 달 추천'],['mine','선생님 추천'],['cat','카테고리'],['part','부위'],['stroke','영법']];
  let sub='';
  if(st.src==='cat'){if(!st.cat&&STR.cats[0])st.cat=STR.cats[0].id;sub=`<div class="rng">${STR.cats.map(c=>pill('strcat',c.id,c.name,st.cat)).join('')}</div>`;}
  if(st.src==='part'){
    if(!st.part&&STR.parts[0])st.part=STR.parts[0].id;
    sub=STR.cats.map(c=>{const ps=STR.parts.filter(p=>p.cat_id===c.id);return ps.length?`<div class="muted small" style="margin:4px 0 2px">${esc(c.name)}</div><div class="rng">${ps.map(p=>pill('strpart',p.id,p.name,st.part)).join('')}</div>`:'';}).join('');
  }
  if(st.src==='stroke')sub=`<div class="rng">${STROKES.map(s=>pill('strstroke',s,s,st.stroke)).join('')}</div>`;
  const list=STR.cands(),sel=new Set(st.sel),queue=STR.queue(),tot=queue.reduce((a,m)=>a+(m.sec||60),0);
  let note='';
  if(st.src==='mine'){const i=STR.mineInfo();note=i?`<p class="muted small" style="margin:0 0 8px">${fmt(i.date)} 수업에서 선생님이 추천한 스트레칭이에요</p>`:'<p class="muted small">아직 선생님이 추천한 스트레칭이 없어요.</p>';}
  if(st.src==='week')note=`<p class="muted small" style="margin:0 0 8px">${fmt(STR.weekKey())} 주 선생님 추천${STR.feat.week.length?'':' · 아직 없어요'}</p>`;
  if(st.src==='month')note=`<p class="muted small" style="margin:0 0 8px">${+STR.monthKey().slice(5)}월 선생님 추천${STR.feat.month.length?'':' · 아직 없어요'}</p>`;
  const rows=list.map(m=>{
    const parts=(m.part_ids||[]).map(STR.partName).filter(Boolean).join(' · ');
    return `<label class="srow3"><input type="checkbox" data-act="strtog" data-id="${m.id}" ${sel.has(m.id)?'checked':''}><span class="sn">${esc(m.name)}</span><span class="muted small">${STR.phaseLabel(m.phase)} · ${m.sec}초${parts?' · '+esc(parts):''}</span></label>`;}).join('');
  return `<section class="card"><div class="rng" role="group" aria-label="스트레칭 고르는 방법">${srcs.map(([k,l])=>pill('strsrc',k,l,st.src)).join('')}</div>${sub}
    <div class="rng" role="group" aria-label="수업 전후">${[['all','전체'],['pre','수업 전'],['post','수업 후']].map(([k,l])=>pill('strphase',k,l,st.phase)).join('')}</div>${note}
    ${rows?`<div class="slist">${rows}</div>`:'<div class="empty">조건에 맞는 스트레칭이 아직 없어요</div>'}
    <div class="row" style="margin-top:12px;justify-content:space-between"><span class="muted small">선택 ${queue.length}/${STR.MAX}개 · 약 ${Math.max(1,Math.round(tot/60))}분 (처음엔 ${STR.AUTO}개가 자동으로 골라져요)</span>
    <button class="btn" data-act="strstart" ${queue.length?'':'disabled'}>스트레칭 시작</button></div></section>`;
}

export function playerHtml(){
  const pl=STR.st.play;
  if(pl.done)return `<section class="card" style="text-align:center"><h2 style="margin:6px 0">수고하셨어요! 🙌</h2><p class="muted">${pl.q.length}개 스트레칭을 마쳤어요.</p><div class="row" style="justify-content:center"><button class="btn" data-act="strend">처음으로</button></div></section>`;
  const m=pl.q[pl.i],id=STR.ytId(m.url),next=pl.q[pl.i+1];
  const vid=id?`<iframe class="stv" src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&rel=0&playsinline=1&modestbranding=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="${esc(m.name)}"></iframe>`
    :`<div class="stv none">${m.url&&/^https?:\/\//i.test(m.url)?`<a class="btn sm" href="${esc(m.url)}" target="_blank" rel="noopener">영상 열기</a>`:'<span class="muted">영상이 아직 없어요</span>'}</div>`;
  return `<section class="card player"><div class="muted small">${pl.i+1} / ${pl.q.length} · ${STR.phaseLabel(m.phase)}</div><h2 style="margin:4px 0 10px">${esc(m.name)}</h2>${vid}
    <div class="clock"><span id="stc">${fmtT(pl.paused?pl.remaining:Math.max(0,pl.deadline-Date.now()))}</span></div><div class="pbar"><i id="stp"></i></div>
    <div class="row" style="justify-content:center;gap:10px;margin-top:10px"><button class="btn ghost" data-act="strprev" aria-label="이전">⏮</button><button class="btn" data-act="strpause">${pl.paused?'▶ 계속':'⏸ 일시정지'}</button><button class="btn ghost" data-act="strnext" aria-label="다음">⏭</button></div>
    ${id?`<p class="small" style="text-align:center;margin:10px 0 0"><a class="muted" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">영상이 안 나오면 유튜브에서 보기</a></p>`:''}
    <p class="muted small" style="margin:12px 0 0">${next?'다음: '+esc(next.name):'마지막 스트레칭이에요'}</p>
    <div class="row" style="margin-top:8px"><button class="btn ghost sm" data-act="strend">그만하기</button></div></section>`;
}
