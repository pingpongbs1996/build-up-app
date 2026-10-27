/* 선생님 화면의 이동 · 회원 관리 · 달/수업 관리 · 종목/준비물 관리 */
import {$,fmt,clamp,slug} from '../utils.js';
import {S,D,monthById,sessById} from '../state.js';
import {sb,q} from '../api/client.js';
import {loadBase,loadMembers} from '../api/repo.js';
import {toast} from '../ui/toast.js';
import {renderStaff} from '../views/staff/index.js';
import {freshForm} from '../views/staff/months.js';

/* 두 번 눌러야 실행되는 삭제 버튼. 첫 클릭이면 true(=아직 실행 금지)를 돌려줘요 */
function needConfirm(t,label){
  if(t.dataset.confirm==='1')return false;
  t.dataset.confirm='1';t.textContent=label;return true;
}

export const staffActions={
  /* 이동 */
  sttab(t){S.st.tab=t.dataset.t;S.st.msg='';S.st.form=null;return renderStaff();},
  gorec(t){const s=sessById(t.dataset.sid);S.st.month=s.month_id;S.st.sid=s.id;S.st.mid=t.dataset.mid;S.st.tab='class';S.swView=null;return renderStaff();},
  stses(t){S.st.sid=t.dataset.sid;S.swView=null;return renderStaff();},
  stmem(t){S.st.mid=t.dataset.id;S.swView=null;return renderStaff();},

  /* 회원 */
  async addmembers(){
    const lines=$('#bulk').value.split('\n').map(l=>l.trim()).filter(Boolean);
    if(!lines.length){toast('등록할 회원을 적어 주세요.',true);return;}
    const rows=lines.map(l=>{const p=l.split(/[,\t]/).map(x=>x.trim());return{name:p[0],phone:p[1]||'',base:p[2]?+p[2]:0};});
    const bad=rows.find(r=>!r.name||r.phone.replace(/\D/g,'').length<10);
    if(bad){toast(`"${bad.name||'(이름 없음)'}" 줄의 전화번호를 확인해 주세요.`,true);return;}
    const dup=rows.filter(r=>D.members.some(m=>m.name===r.name&&m.phone_mid===r.phone.replace(/\D/g,'').slice(3,-4)));
    if(dup.length){toast(`이미 등록된 회원이 있어요: ${dup.map(d=>d.name).join(', ')}`,true);return;}
    await q(sb.rpc('admin_add_members',{rows}));
    await loadMembers();S.st.msg=`${rows.length}명을 등록했어요. 첫 비밀번호는 전화번호 뒤 4자리예요.`;toast('등록했어요');await renderStaff();
  },
  async toggleactive(t){
    const m=D.members.find(x=>x.id===t.dataset.id);
    await q(sb.rpc('admin_set_active',{mid:m.id,on_off:!m.active}));m.active=!m.active;
    toast(m.active?'활동 중으로 바꿨어요':'쉬는 중으로 바꿨어요');await renderStaff();
  },
  async delmember(t){
    const id=t.dataset.id,m=D.members.find(x=>x.id===id);
    if(needConfirm(t,'정말 삭제? 모든 기록도 지워져요')){t.style.fontWeight='700';return;}
    await q(sb.rpc('admin_delete_member',{mid:id}));
    D.members=D.members.filter(x=>x.id!==id);delete D.mem[id];D.roster=null;D.assign=null;
    S.st.msg=`${m.name} 님을 삭제했어요.`;toast('삭제했어요');await renderStaff();
  },
  async resetpw(t){
    const id=t.dataset.id,v=$(`[data-rp="${id}"]`).value.trim();
    if(!/^\d{4}$/.test(v)){toast('그 회원 전화번호의 뒤 4자리를 숫자로 넣어 주세요.',true);return;}
    await q(sb.rpc('admin_reset_password',{mid:id,last4:v}));
    const m=D.members.find(x=>x.id===id);m.must_change=true;S.st.msg=`${m.name} 님 비밀번호를 초기화했어요. 다음 로그인 때 새로 정하게 돼요.`;toast('초기화했어요');await renderStaff();
  },

  /* 달 / 수업 */
  newmonth(){S.st.form=freshForm(null);return renderStaff();},
  editmonth(){S.st.form=freshForm(monthById(S.st.month));return renderStaff();},
  cancelmonth(){S.st.form=null;return renderStaff();},
  async savemonth(){
    const f=S.st.form,keys=f.keys.filter(Boolean);
    if(!/^\d{4}-\d{2}$/.test(f.ym)){toast('월을 골라 주세요.',true);return;}
    if(!f.concept.trim()){toast('컨셉을 적어 주세요.',true);return;}
    if(new Set(keys).size!==keys.length){toast('같은 종목이 두 번 들어갔어요.',true);return;}
    if(!f.id&&D.months.some(m=>m.ym===f.ym)){toast('이미 만들어진 달이에요. "이 달 고치기"를 써 주세요.',true);return;}
    const row={concept:f.concept.trim(),dry_sets:clamp(f.dry_sets,1,5),rounds:clamp(f.rounds,1,12),reps:clamp(f.reps,1,12)};
    let id=f.id;
    if(id)await q(sb.from('months').update(row).eq('id',id));
    else{const r=await q(sb.from('months').insert({ym:f.ym,...row}).select().single());id=r.id;}
    await q(sb.from('month_exercises').delete().eq('month_id',id));
    if(keys.length)await q(sb.from('month_exercises').insert(keys.map((k,i)=>({month_id:id,slot:i+1,exercise_key:k}))));
    await loadBase();S.st.month=id;S.st.form=null;D.assign=null;toast('저장했어요');await renderStaff();
  },
  async addses(){
    const v=$('#nd').value,m=monthById(S.st.month);
    if(!v){toast('날짜를 골라 주세요.',true);return;}
    if(D.sessions.some(s=>s.date===v)){toast('이미 있는 날짜예요.',true);return;}
    await q(sb.from('sessions').insert({month_id:m.id,date:v}));await loadBase();D.assign=null;toast(fmt(v)+' 수업을 추가했어요');await renderStaff();
  },
  async delses(t){
    const s=sessById(t.dataset.sid);
    if(needConfirm(t,'정말 삭제? 기록도 함께 지워져요')){t.style.color='var(--danger)';return;}
    await q(sb.from('sessions').delete().eq('id',s.id));await loadBase();D.assign=null;D.roster=null;Object.keys(D.mem).forEach(k=>delete D.mem[k]);toast('삭제했어요');await renderStaff();
  },

  /* 준비물 종류 / 종목 */
  async addgear(){
    const v=$('#ng').value.trim();if(!v){toast('종류 이름을 적어 주세요.',true);return;}
    if(D.gear.includes(v)){toast('이미 있는 종류예요.',true);return;}
    await q(sb.from('gear_types').insert({name:v,sort:D.gear.length+1}));D.gear.push(v);toast('추가했어요');await renderStaff();
  },
  async delgear(t){
    const g=t.dataset.g;
    if(needConfirm(t,'삭제?'))return;
    await q(sb.from('gear_types').delete().eq('name',g));D.gear=D.gear.filter(x=>x!==g);toast('삭제했어요');await renderStaff();
  },
  async addex(){
    const cat=$('#ne-cat').value.trim(),name=$('#ne-name').value.trim();
    if(!cat||!name){toast('구분과 이름을 적어 주세요.',true);return;}
    let key=slug(name),n=1;while(D.ex[key]){key=slug(name)+(++n);}
    const targets={};[1,2,3,4,5].forEach(l=>targets[l]=clamp($('#ne-'+l).value,1,999));
    await q(sb.from('exercises').insert({key,cat,name,targets,sort:D.exList.length+1}));
    await loadBase();toast('종목을 추가했어요');await renderStaff();
  }
};
