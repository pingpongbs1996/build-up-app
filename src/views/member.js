/* 회원 화면: 내 수업 날짜 고르기 + 코멘트/SELF PREP + 입력 폼 (또는 스트레칭 탭) */
import {PAIR_LABEL} from '../config.js';
import {$,app,esc,ordHtml} from '../utils.js';
import {S,D,form,sessById,monthById,cfgOf,nthAt,nthOf,mySessions} from '../state.js';
import {miniLogo,footLogo,segHtml,dchip,cmtHtml,prepHtml} from '../ui/components.js';
import {mountForm} from './entry-form.js';
import {memberHtml} from '../features/stretch/member-view.js';
import {stopPlayer} from '../features/stretch/player.js';

const topBar=(p)=>`<header class="top"><div class="who">${miniLogo()}<span class="muted">${esc(p.name)} 님</span></div><button class="btn ghost sm" data-act="logout">나가기</button></header>`;

export function renderMember(){
  S.view='member';form.cur=null;
  const p=S.me,mem=D.mem[p.id],all=mySessions();
  if(!S.sid||!all.find(s=>s.id===S.sid&&s.date<=S.today))S.sid=(all.find(s=>s.date<=S.today)||{}).id||null;
  const ses=S.sid?sessById(S.sid):null,month=ses?monthById(ses.month_id):null,cfg=month?cfgOf(mem,month.id):null;
  const curYm=S.today.slice(0,7);
  const groups={};all.forEach(s=>{const m=monthById(s.month_id);(groups[m.id]=groups[m.id]||{m,list:[]}).list.push(s);});
  const gl=Object.values(groups).sort((a,b)=>a.m.ym<b.m.ym?1:-1);
  const cur=gl.find(g=>g.m.ym===curYm)||gl[0],others=gl.filter(g=>g!==cur);
  if(S.tab!=='str')stopPlayer();
  if(S.tab==='str'){
    app.innerHTML=`<div class="wrap">${topBar(p)}${segHtml()}<div id="str">${memberHtml()}</div>${footLogo()}</div>`;
    return;
  }
  app.innerHTML=`<div class="wrap">
   ${topBar(p)}
   <div class="me"><div class="nth">${ordHtml(ses?nthAt(p,mem,ses.date):nthOf(p,mem))}<span class="muted">번째 수업</span></div>
     ${month?`<span class="chip gold">${esc(month.ym.slice(5).replace(/^0/,''))}월 · ${esc(month.concept)}</span><span class="chip">${esc(cfg.stroke)} · ${PAIR_LABEL[cfg.pair]}</span>`:''}</div>
   ${all.length?`${segHtml()}
   <div class="dates" role="group" aria-label="수업 날짜">${cur.list.map(s=>dchip(s,mem)).join('')}</div>
   ${S.prev?others.map(g=>`<div class="mgroup"><span class="mlabel">${+g.m.ym.slice(5)}월</span>${g.list.map(s=>dchip(s,mem)).join('')}</div>`).join(''):''}
   <div class="datebar">${others.length?`<button class="btn ghost sm" data-act="prev">${S.prev?'이전 달 접기':'이전 달 보기'}</button>`:''}<span class="sp"></span><label for="jump">날짜로 찾기</label><input id="jump" type="date"><button class="btn ghost sm" data-act="jump">보기</button></div>
   ${all.some(s=>s.date>S.today)?'<p class="muted small" style="margin:0 0 12px">잠긴 수업은 그날 0시에 열려요.</p>':''}`
   :'<div class="empty">아직 배정된 수업이 없어요. 선생님께 문의해 주세요.</div>'}
   ${ses?`<div class="row" style="margin:0 0 12px"><button class="btn sm" data-act="repshow" data-who="me">이 날 수업 리포트 이미지 보기·저장</button></div><div id="rep"></div>`:''}
   <div id="cmt">${ses?cmtHtml(mem,ses.id,false)+prepHtml(mem,ses.id,false):''}</div>
   <div id="form">${all.length&&!ses?'<div class="empty">아직 열린 수업이 없어요. 첫 수업 날짜 0시에 열려요.</div>':''}</div>${footLogo()}</div>`;
  if(ses)mountForm($('#form'),p,S.sid,'member');
}
