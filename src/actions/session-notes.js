/* 수업별 코멘트 · SELF PREP · SELF PREP 동작 · 수업 리포트 이미지 */
import {$,esc,fmt,safeUrl} from '../utils.js';
import {S,D,sessById} from '../state.js';
import {sb,q} from '../api/client.js';
import {toast} from '../ui/toast.js';
import {prepHtml,pvHtml} from '../ui/components.js';
import {STR} from '../features/stretch/store.js';
import {reportData} from '../features/report/data.js';
import {renderReport} from '../features/report/canvas.js';
import {renderStaff} from '../views/staff/index.js';

export const noteActions={
  async savecmt(){
    const mid=S.st.mid,sid=S.st.sid,body=$('#cmt-t').value.trim(),mem=D.mem[mid];
    if(body)await q(sb.from('session_comments').upsert({member_id:mid,session_id:sid,body,author:S.me.id},{onConflict:'member_id,session_id'}));
    else await q(sb.from('session_comments').delete().eq('member_id',mid).eq('session_id',sid));
    mem.cmt=mem.cmt||{};if(body)mem.cmt[sid]=body;else delete mem.cmt[sid];
    const pv=$('#pv');if(pv)pv.innerHTML=pvHtml(mem,sid);
    toast(body?'코멘트를 저장했어요':'코멘트를 지웠어요');
  },
  addprep(t){
    const m=D.moves.find(x=>x.id===t.dataset.id);
    if(m)S.st.prep.items.push({k:m.kind,name:m.name,amount:m.amount,url:m.video_url||''});
    else{const sm=STR.mv(t.dataset.id);if(!sm)return;S.st.prep.items.push({k:'stretch',id:sm.id,name:sm.name,amount:'',url:sm.url||''});}
    $('#prep').innerHTML=prepHtml(null,null,true);
  },
  delprep(t){S.st.prep.items.splice(+t.dataset.i,1);$('#prep').innerHTML=prepHtml(null,null,true);},
  async saveprep(){
    const {mid,sid,items}=S.st.prep,mem=D.mem[mid];
    if(items.length)await q(sb.from('session_preps').upsert({member_id:mid,session_id:sid,items,author:S.me.id},{onConflict:'member_id,session_id'}));
    else await q(sb.from('session_preps').delete().eq('member_id',mid).eq('session_id',sid));
    mem.prep=mem.prep||{};if(items.length)mem.prep[sid]=JSON.parse(JSON.stringify(items));else delete mem.prep[sid];
    $('#pv').innerHTML=pvHtml(mem,sid);toast('SELF PREP을 저장했어요');
  },
  async addmove(){
    const kind=$('#nm-k').value,name=$('#nm-n').value.trim(),amount=$('#nm-a').value.trim(),url=$('#nm-u').value.trim();
    if(!name){toast('동작 이름을 적어 주세요.',true);return;}
    if(url&&!safeUrl(url)){toast('영상 링크는 http로 시작해야 해요.',true);return;}
    await q(sb.from('prep_moves').insert({kind,name,amount,video_url:url,sort:D.moves.length+1}));
    D.moves=await q(sb.from('prep_moves').select('*').order('sort'));toast('동작을 추가했어요');await renderStaff();
  },
  async delmove(t){
    if(t.dataset.confirm!=='1'){t.dataset.confirm='1';t.textContent='삭제?';return;}
    await q(sb.from('prep_moves').delete().eq('id',t.dataset.id));D.moves=D.moves.filter(x=>x.id!==t.dataset.id);toast('삭제했어요');await renderStaff();
  },
  async repshow(t){
    const me=t.dataset.who==='me',profile=me?S.me:D.members.find(x=>x.id===S.st.mid),sid=me?S.sid:S.st.sid,mem=D.mem[profile.id];
    const box=$('#rep');box.innerHTML='<div class="muted small" style="padding:8px">이미지를 만드는 중…</div>';
    const c=await renderReport(reportData(profile,mem,sid)),url=c.toDataURL('image/png'),ses=sessById(sid);
    box.innerHTML=`<section class="card" style="margin-bottom:12px"><img class="repimg" src="${url}" alt="${esc(profile.name)} 님 ${fmt(ses.date)} 수업 리포트"><div class="row" style="margin-top:10px"><a class="btn sm" href="${url}" download="BUILDUP_${esc(profile.name)}_${ses.date}.png">PNG로 저장</a><span class="muted small">폰에서는 이미지를 길게 눌러 저장할 수도 있어요</span></div></section>`;
  }
};
