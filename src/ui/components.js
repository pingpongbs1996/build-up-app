/* 여러 화면이 같이 쓰는 작은 HTML 조각 */
import {ASSETS} from '../config.js';
import {esc,fmt,wd,safeUrl} from '../utils.js';
import {S,D} from '../state.js';
import {STR} from '../features/stretch/store.js';

export const brandHead=()=>`<img class="logoimg" src="${ASSETS.logo}" alt="BUILD UP in CLOSED-CLASS">`;
export const footLogo=()=>`<div class="foot"><img src="${ASSETS.salane}" alt="SA LANE"></div>`;
export const miniLogo=()=>`<img class="mini" src="${ASSETS.logo}" alt="BUILD UP">`;

export const lvDesc=(e,l)=>{const x=e.level_desc&&e.level_desc[l];return x&&(x.v||'')?(x.t?x.t+' ':'')+x.v:'';};

export function cycleOpts(cur){
  const l=[];for(let s=40;s<=180;s+=10)l.push(Math.floor(s/60)+':'+String(s%60).padStart(2,'0'));
  if(cur&&!l.includes(cur))l.push(cur);
  return '<option value="">—</option>'+l.map(c=>`<option ${c===cur?'selected':''}>${c}</option>`).join('');
}

/* 기간 선택 (그래프 공통) */
export function rngHtml(){return `<div class="rng" role="group" aria-label="기간">${[['all','전체'],['3m','3개월'],['8','최근 8회']].map(([r,l])=>`<button type="button" data-act="range" data-r="${r}" class="${S.range===r?'on':''}">${l}</button>`).join('')}</div>`;}

export const segHtml=()=>`<div class="seg" role="tablist"><button role="tab" data-act="tab" data-tab="dry" class="${S.tab==='dry'?'on':''}">지상운동</button><button role="tab" data-act="tab" data-tab="swim" class="${S.tab==='swim'?'on':''}">수영</button><button role="tab" data-act="tab" data-tab="str" class="${S.tab==='str'?'on':''}">스트레칭</button></div>`;

/* 수업 날짜 칩 (회원 화면) */
export function dchip(s,mem){
  if(s.date>S.today)return `<button class="dchip lock" data-act="locked" data-d="${s.date}">${fmt(s.date)} (${wd(s.date)})<small>잠김</small></button>`;
  return `<button class="dchip ${s.id===S.sid?'on':''}" data-act="date" data-sid="${s.id}">${fmt(s.date)} (${wd(s.date)})${mem.dry[s.id]||mem.swim[s.id]?'<i>●</i>':''}</button>`;
}

/* 선생님 코멘트: edit이면 입력창, 아니면 읽기 전용 */
export function cmtHtml(mem,sid,edit){
  const c=(mem.cmt&&mem.cmt[sid])||'';
  if(edit)return `<section class="card cmt"><label for="cmt-t" style="margin-top:0"><b>선생님 코멘트</b> <span class="muted small">회원에게 보여요</span></label><textarea id="cmt-t" class="txt" rows="3" maxlength="600" placeholder="오늘 수업에 대한 한마디를 남겨 주세요">${esc(c)}</textarea><div class="row" style="margin-top:8px"><button class="btn sm" data-act="savecmt">코멘트 저장</button></div></section>`;
  return c?`<section class="card cmt"><div class="muted small" style="margin-bottom:4px">선생님 코멘트</div><div class="hand">${esc(c)}</div></section>`:'';
}

function prepView(items){
  const grp=(k,t)=>{const l=items.filter(x=>x.k===k);return l.length?`<div class="pgrp"><div class="ptit">▶ ${t}</div>${l.map(x=>`<div class="pitem"><span>${esc(x.name)}${x.amount?` <span class="pamt">| ${esc(x.amount)}</span>`:''}</span>${safeUrl(x.url)?`<a class="pvid" href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener">▶ 영상</a>`:''}</div>`).join('')}</div>`:'';};
  return grp('dry','dryland')+grp('swim','swim')+grp('stretch','stretch');
}

/* SELF PREP: edit이면 선생님 편집 UI(S.st.prep.items), 아니면 회원이 보는 목록 */
export function prepHtml(mem,sid,edit){
  const items=edit?S.st.prep.items:((mem.prep&&mem.prep[sid])||[]);
  if(!edit)return items.length?`<section class="card prep"><div class="muted small" style="margin-bottom:6px">SELF PREP · 다음 수업 전에 해 보세요</div>${prepView(items)}</section>`:'';
  const grp=(k,t)=>`<div class="pgrp"><div class="ptit">▶ ${t}</div>
    <div class="pchips">${(k==='stretch'?STR.moves:D.moves.filter(m=>m.kind===k)).map(m=>`<button type="button" class="chip pc" data-act="addprep" data-id="${m.id}">+ ${esc(m.name)}</button>`).join('')||`<span class="muted small">${k==='stretch'?'"스트레칭" 탭에서 스트레칭을 먼저 등록해 주세요':'"동작" 탭에서 동작을 먼저 등록해 주세요'}</span>`}</div>
    ${items.map((x,i)=>x.k!==k?'':`<div class="prow"><span class="pname">${esc(x.name)}</span>${x.k==='stretch'?'':`<input class="mini-in" style="width:11rem;text-align:left" data-pa="${i}" value="${esc(x.amount)}" aria-label="${esc(x.name)} 분량">`}<button type="button" class="chipx" data-act="delprep" data-i="${i}" aria-label="${esc(x.name)} 빼기">×</button></div>`).join('')}</div>`;
  return `<section class="card prep"><label style="margin-top:0"><b>SELF PREP</b> <span class="muted small">버튼을 눌러 담고 숫자만 고쳐요. 회원에게 보여요</span></label>${grp('dry','dryland')}${grp('swim','swim')}${grp('stretch','stretch · 스트레칭 추천')}<div class="row" style="margin-top:8px"><button class="btn sm" data-act="saveprep">SELF PREP 저장</button></div></section>`;
}

/* 선생님이 보는 "회원 화면 미리보기" */
export function pvHtml(mem,sid){
  const c=cmtHtml(mem,sid,false),pp=prepHtml(mem,sid,false);
  return `<section class="card pv"><div class="row" style="justify-content:space-between;margin-bottom:8px"><span class="muted small"><b>회원이 보게 될 화면</b> · 저장한 내용 기준</span><button class="btn sm" data-act="repshow" data-who="st">수업 리포트 이미지 보기</button></div>${c+pp||'<div class="empty">아직 저장된 코멘트나 SELF PREP이 없어요</div>'}<div id="rep"></div></section>`;
}
