/* 선생님 "수업" 탭: 월 → 날짜 → 참여 회원 → 그 회원의 입력 폼 */
import {STROKES,PAIRS,PAIR_LABEL} from '../../config.js';
import {esc,fmt,wd,phoneMask,ordHtml} from '../../utils.js';
import {S,D,boss,monthById,sessById,cfgOf,nthAt,nthOf,exLabel,defaultMonthId} from '../../state.js';
import {loadRoster,loadMem} from '../../api/repo.js';
import {cycleOpts,cmtHtml,prepHtml,pvHtml} from '../../ui/components.js';

export async function staffClass(){
  if(!D.months.length)return `<div class="empty">아직 만들어진 달이 없어요.${boss()?' 위에서 "달 설정"을 눌러 첫 달을 만들어 주세요.':' 총괄 선생님이 달을 만들면 여기에 나와요.'}</div>`;
  if(!monthById(S.st.month))S.st.month=defaultMonthId();
  const month=monthById(S.st.month),sess=D.sessions.filter(s=>s.month_id===month.id).sort((a,b)=>a.date<b.date?1:-1);
  if(!sess.find(s=>s.id===S.st.sid))S.st.sid=(sess.find(s=>s.date<=S.today)||sess[0]||{}).id||null;
  if(S.st.sid&&(!D.roster||D.roster.sid!==S.st.sid))await loadRoster(S.st.sid);
  const roster=S.st.sid?D.roster.list:[];
  if(!roster.find(r=>r.id===S.st.mid))S.st.mid=roster[0]?roster[0].id:null;
  const ses=S.st.sid?sessById(S.st.sid):null;
  const prof=S.st.mid?D.members.find(x=>x.id===S.st.mid):null;
  let detail='<div class="empty">이 날짜에 참여하는 회원이 없어요. "달 설정"에서 참여 날짜를 체크해 주세요.</div>';
  if(prof){
    if(!D.mem[prof.id])await loadMem(prof.id);
    const mem=D.mem[prof.id],cfg=cfgOf(mem,month.id),pbo=mem.pb[cfg.stroke]||{pb:'',target:'',cycle:''},tg=cfg.series_targets||{},b=boss();
    /* SELF PREP 편집용 사본: 저장 전까지는 서버 값과 분리해 둬요 */
    if(S.st.sid)S.st.prep={mid:prof.id,sid:S.st.sid,items:JSON.parse(JSON.stringify((mem.prep&&mem.prep[S.st.sid])||[]))};
    detail=`<div class="dhead"><div><h2>${esc(prof.name)}</h2><span class="muted small">${phoneMask(prof.phone_mid)} · </span><span class="nth" style="display:inline-flex">${ordHtml(ses?nthAt(prof,mem,ses.date):nthOf(prof,mem))}</span> <span class="muted small">번째 수업</span></div>
      <div class="assign"><div><label for="sk">${+month.ym.slice(5)}월 영법</label><select id="sk" data-sel="stroke" ${b?'':'disabled'}>${STROKES.map(s=>`<option ${s===cfg.stroke?'selected':''}>${s}</option>`).join('')}</select></div>
      <div><label for="pr">시리즈 구성</label><select id="pr" data-sel="pair" ${b?'':'disabled'}>${Object.keys(PAIR_LABEL).map(k=>`<option value="${k}" ${k===cfg.pair?'selected':''}>${PAIR_LABEL[k]}</option>`).join('')}</select></div></div></div>
      <div class="pbrow"><div><label for="pb1">${esc(cfg.stroke)} PB</label><input id="pb1" data-pb="pb" value="${esc(pbo.pb)}" ${b?'':'disabled'} inputmode="decimal"></div><div><label for="pb2">목표 페이스</label><input id="pb2" data-pb="target" value="${esc(pbo.target)}" ${b?'':'disabled'} inputmode="decimal"></div><div><label for="pb3">사이클</label><select id="pb3" data-pb="cycle" ${b?'':'disabled'}>${cycleOpts(pbo.cycle)}</select></div>
      ${PAIRS[cfg.pair].map(n=>`<div><label for="st-${n}">${n} 목표</label><input id="st-${n}" data-stg="${n}" value="${esc(tg[n]??'')}" ${b?'':'disabled'} inputmode="decimal"></div>`).join('')}</div><div id="cmt">${S.st.sid?cmtHtml(mem,S.st.sid,true):''}</div><div id="prep">${S.st.sid?prepHtml(mem,S.st.sid,true):''}</div><div id="form"></div><div id="pv">${S.st.sid?pvHtml(mem,S.st.sid):''}</div>`;
  }
  const mopts=D.months.slice().reverse().map(m=>`<option value="${m.id}" ${m.id===month.id?'selected':''}>${m.ym.replace('-','년 ').replace(/ 0/,' ')}월</option>`).join('');
  return `<section class="card" style="margin-bottom:12px"><div class="row"><label for="mon" style="margin:0">월</label><select id="mon" class="mini-in" style="width:auto;text-align:left" data-sel="month">${mopts}</select><span class="chip gold">${esc(month.concept)}</span>${month.keys.map(k=>`<span class="chip">${esc(exLabel(D.ex[k]))}</span>`).join('')}</div>
    <div class="dates" style="margin:12px 0 0">${sess.map(s=>`<button class="dchip ${s.id===S.st.sid?'on':''}" data-act="stses" data-sid="${s.id}">${fmt(s.date)} (${wd(s.date)})${s.date>S.today?'<small>예정</small>':''}</button>`).join('')||'<span class="muted">수업 날짜가 없어요</span>'}</div></section>
   <div class="admin"><section class="card list"><h2>${ses?fmt(ses.date):''} 수업${ses&&ses.date>S.today?' · 예정 (미리 준비)':''} · 입력 ${roster.filter(r=>r.done).length}/${roster.length}명</h2>
   ${roster.map(r=>{const m=D.members.find(x=>x.id===r.id)||{name:'?'};const c=D.mem[r.id]?cfgOf(D.mem[r.id],month.id).stroke:'';return `<button class="mrow ${r.id===S.st.mid?'on':''}" data-act="stmem" data-id="${r.id}"><span><b>${esc(m.name)}</b> <small>${phoneMask(m.phone_mid)}${c?' · '+esc(c):''}</small></span><span class="pill ${r.done?'done':'none'}">${r.done?(r.byStaff?'선생님 입력':'입력 완료'):'미입력'}</span></button>`;}).join('')||'<div class="empty" style="margin-top:8px">참여 회원이 없어요</div>'}</section>
   <section class="card detail">${detail}</section></div>`;
}
