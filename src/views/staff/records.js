/* 선생님 "회원별 기록" 탭 */
import {esc,fmt,wd,avg} from '../../utils.js';
import {S,D,monthById,sessById} from '../../state.js';
import {sb,q} from '../../api/client.js';
import {loadMem} from '../../api/repo.js';

export async function staffRecords(){
  if(!D.members.length)return '<div class="empty">아직 등록된 회원이 없어요.</div>';
  if(!D.members.find(x=>x.id===S.st.rm))S.st.rm=D.members[0].id;
  const id=S.st.rm;if(!D.mem[id])await loadMem(id);
  const mem=D.mem[id],log=await q(sb.from('member_pb_log').select('*').eq('member_id',id).order('set_on'));
  const sids=new Set([...mem.sm,...Object.keys(mem.dry),...Object.keys(mem.swim)]);
  const rows=[...sids].map(sessById).filter(Boolean).sort((a,b)=>a.date<b.date?1:-1).map(s=>{
    const m=monthById(s.month_id),dn=Object.keys(mem.dry[s.id]||{}).length,sw=mem.swim[s.id]||{};
    const sv=Object.keys(sw).map(n=>`${n} ${avg(sw[n].sets)==null?'-':avg(sw[n].sets).toFixed(1)}`).join(' · ')||'수영 -';
    return `<button class="hrow" style="width:100%;text-align:left;cursor:pointer" data-act="gorec" data-sid="${s.id}" data-mid="${id}"><b>${fmt(s.date)} (${wd(s.date)})</b><span>${esc(m?m.concept:'')}</span><span>지상 ${dn?dn+'종목':'-'}</span><span>${sw[Object.keys(sw)[0]]?esc(Object.values(sw)[0].stroke)+' ':''}${esc(sv)}</span></button>`;}).join('');
  const lg=log.map(r=>`<tr><td>${esc(r.stroke)}</td><td>${fmt(r.set_on)}</td><td>${esc(r.pb||'—')}</td><td>${esc(r.target||'—')}</td><td>${esc(r.cycle||'—')}</td></tr>`).join('');
  return `<div class="sect"><section class="card"><div class="row"><label for="rm" style="margin:0">회원</label><select id="rm" class="mini-in" style="width:auto;text-align:left" data-sel="recmem">${D.members.map(m=>`<option value="${m.id}" ${m.id===id?'selected':''}>${esc(m.name)} (${esc(m.phone_mid||'')})</option>`).join('')}</select></div></section>
   <section class="card"><p class="sh3">날짜를 누르면 그날 기록을 보고 고칠 수 있어요</p><div class="hist">${rows||'<div class="empty">기록이 아직 없어요</div>'}</div></section>
   <section class="card"><p class="sh3">PB · 목표 페이스 · 사이클 변경 기록 (바뀔 때마다 날짜별로 남아요)</p><div class="tw"><table class="plan"><thead><tr><th>영법</th><th>날짜</th><th>PB</th><th>목표 페이스</th><th>사이클</th></tr></thead><tbody>${lg||'<tr><td colspan="5">아직 없어요</td></tr>'}</tbody></table></div></section></div>`;
}
