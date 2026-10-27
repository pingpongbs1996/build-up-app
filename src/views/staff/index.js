/* 선생님 화면 틀: 탭 + 선택한 탭의 본문 */
import {$,app,esc} from '../../utils.js';
import {S,D,boss} from '../../state.js';
import {niceErr} from '../../api/client.js';
import {miniLogo,footLogo} from '../../ui/components.js';
import {mountForm} from '../entry-form.js';
import {staffHtml as stretchHtml} from '../../features/stretch/staff-view.js';
import {staffClass} from './class.js';
import {staffRecords} from './records.js';
import {staffMoves} from './moves.js';
import {staffMembers} from './members.js';
import {staffMonths} from './months.js';
import {staffExercises} from './exercises.js';

const BODIES={
  class:staffClass,recs:staffRecords,moves:staffMoves,str:stretchHtml,
  members:staffMembers,months:staffMonths,exs:staffExercises
};

export async function renderStaff(){
  S.view='staff';
  const t=S.st.tab;
  const tabs=[['class','수업'],['recs','회원별 기록'],['moves','동작'],['str','스트레칭']].concat(boss()?[['members','회원'],['months','달 설정'],['exs','종목']]:[]);
  let body='';
  try{body=await (BODIES[t]||staffExercises)();}
  catch(e){console.error(e);body=`<div class="empty">${esc(niceErr(e))}</div>`;}
  app.innerHTML=`<div class="wrap">
   <header class="top"><div class="who">${miniLogo()}<span class="muted">관리자</span><span class="chip gold">${boss()?'총괄 선생님':'담당 선생님'}</span></div><button class="btn ghost sm" data-act="logout">나가기</button></header>
   ${tabs.length>1?`<div class="seg" role="tablist">${tabs.map(([k,l])=>`<button role="tab" data-act="sttab" data-t="${k}" class="${t===k?'on':''}">${l}</button>`).join('')}</div>`:''}
   ${S.st.msg?`<div class="banner">${esc(S.st.msg)}</div>`:''}${body}${footLogo()}</div>`;
  if(t==='class'&&S.st.mid&&S.st.sid&&$('#form')){const p=D.members.find(x=>x.id===S.st.mid);if(p&&D.mem[p.id])mountForm($('#form'),p,S.st.sid,'staff');}
}
