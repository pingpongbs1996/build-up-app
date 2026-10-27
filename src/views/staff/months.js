/* 총괄 선생님 "달 설정" 탭: 달 만들기/고치기, 수업 날짜, 회원별 참여·영법·시리즈 */
import {STROKES,PAIR_LABEL,CONCEPTS} from '../../config.js';
import {esc,fmt,wd,monthLabel} from '../../utils.js';
import {S,D,monthById} from '../../state.js';
import {loadAssign,loadMembers} from '../../api/repo.js';

/* 달 만들기/고치기 폼의 초기값 */
export function freshForm(m){
  if(m)return{id:m.id,ym:m.ym,concept:m.concept,keys:[...m.keys],dry_sets:m.dry_sets,rounds:m.rounds,reps:m.reps};
  const d=new Date(Date.now()+9*36e5);d.setUTCMonth(d.getUTCMonth()+1);
  return{id:null,ym:d.toISOString().slice(0,7),concept:'',keys:[...(D.months.length?D.months[D.months.length-1].keys:[])],dry_sets:2,rounds:6,reps:6};
}

export async function staffMonths(){
  const f=S.st.form;
  const cur=monthById(S.st.month)||D.months[D.months.length-1];
  let sect='';
  if(cur){
    if(!D.assign||D.assign.monthId!==cur.id)await loadAssign(cur.id);
    if(!D.members.length)await loadMembers();
    const sess=D.sessions.filter(s=>s.month_id===cur.id).sort((a,b)=>a.date<b.date?-1:1),A=D.assign;
    sect=`<section class="card"><div class="row" style="justify-content:space-between"><h1 style="font-size:1.1rem;margin:0">${monthLabel(cur.ym)} · ${esc(cur.concept)}</h1>
      <div class="row"><label for="mon2" style="margin:0">달 선택</label><select id="mon2" class="mini-in" style="width:auto;text-align:left" data-sel="month2">${D.months.slice().reverse().map(m=>`<option value="${m.id}" ${m.id===cur.id?'selected':''}>${m.ym}</option>`).join('')}</select><button class="btn ghost sm" data-act="editmonth">이 달 고치기</button></div></div></section>
     <section class="card"><p class="sh3">수업 날짜</p><div class="dates">${sess.map(s=>`<span class="dchip">${fmt(s.date)} (${wd(s.date)}) <button class="linkbtn" style="padding:0 0 0 6px" data-act="delses" data-sid="${s.id}" aria-label="${fmt(s.date)} 수업 삭제">삭제</button></span>`).join('')||'<span class="muted">수업 날짜가 없어요</span>'}</div>
      <div class="row"><label for="nd" style="margin:0">날짜 추가</label><input id="nd" type="date" value="${cur.ym}-01"><button class="btn sm" data-act="addses">추가</button></div></section>
     <section class="card"><p class="sh3">회원별 참여 날짜, 영법, 시리즈</p><div class="tw"><table class="plan"><thead><tr><th>회원</th>${sess.map(s=>`<th>${fmt(s.date)}</th>`).join('')}<th>횟수</th><th>영법</th><th>시리즈</th></tr></thead><tbody>
      ${D.members.filter(m=>m.active).map(m=>{const c=A.mm[m.id]||{stroke:'자유형',pair:'A'};const n=sess.filter(s=>A.sm.has(s.id+'|'+m.id)).length;return `<tr><td>${esc(m.name)} <small class="muted">${esc(m.phone_mid)}</small></td>${sess.map(s=>`<td><input type="checkbox" data-plan="${s.id}|${m.id}" ${A.sm.has(s.id+'|'+m.id)?'checked':''} aria-label="${esc(m.name)} ${fmt(s.date)} 참여"></td>`).join('')}<td>${n}회</td>
        <td><select data-mmf="stroke" data-mid="${m.id}">${STROKES.map(x=>`<option ${x===c.stroke?'selected':''}>${x}</option>`).join('')}</select></td>
        <td><select data-mmf="pair" data-mid="${m.id}">${Object.keys(PAIR_LABEL).map(k=>`<option value="${k}" ${k===c.pair?'selected':''}>${PAIR_LABEL[k]}</option>`).join('')}</select></td></tr>`;}).join('')||'<tr><td colspan="9" class="muted">활동 중인 회원이 없어요</td></tr>'}
      </tbody></table></div></section>`;
  }
  const form=f?`<section class="card"><h1 style="font-size:1.1rem">${f.id?'달 고치기':'새 달 만들기'}</h1><div class="stack">
    <div class="fgrid"><div><label for="f-ym">월</label><input id="f-ym" type="month" data-mf="ym" value="${esc(f.ym)}" ${f.id?'disabled':''}></div>
    <div><label for="f-concept">컨셉</label><input id="f-concept" class="txt" list="concepts" data-mf="concept" value="${esc(f.concept)}" placeholder="예: 하체 킥 스트렝스"><datalist id="concepts">${CONCEPTS.map(c=>`<option value="${esc(c)}">`).join('')}</datalist></div></div>
    <div><p class="sh3">지상운동 종목 (칸마다 하나씩)</p><div class="fgrid">${[0,1,2,3,4].map(i=>`<div><label for="f-ex${i}">${i+1}번째</label><select id="f-ex${i}" class="txt" data-mfk="${i}"><option value="">선택 안 함</option>${D.exList.map(e=>`<option value="${e.key}" ${f.keys[i]===e.key?'selected':''}>${esc(e.cat)} · ${esc(e.name)}</option>`).join('')}</select></div>`).join('')}</div></div>
    <div class="fgrid"><div><label for="f-ds">지상운동 세트 수</label><input id="f-ds" class="txt" type="number" min="1" max="5" data-mf="dry_sets" value="${f.dry_sets}"></div>
    <div><label for="f-ro">라운드 수 (EN★·SP★)</label><input id="f-ro" class="txt" type="number" min="1" max="12" data-mf="rounds" value="${f.rounds}"></div>
    <div><label for="f-re">REP 수 (EN2·SP2)</label><input id="f-re" class="txt" type="number" min="1" max="12" data-mf="reps" value="${f.reps}"></div></div>
    <div class="row"><button class="btn" data-act="savemonth">${f.id?'저장':'달 만들기'}</button><button class="btn ghost" data-act="cancelmonth">취소</button></div></div></section>`:'';
  return `<div class="sect">${f?form:`<div class="row"><button class="btn" data-act="newmonth">새 달 만들기</button></div>`}${sect||(f?'':'<div class="empty">아직 만들어진 달이 없어요.</div>')}</div>`;
}
