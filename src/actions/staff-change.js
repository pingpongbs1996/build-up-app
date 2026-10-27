/* 선생님 화면의 입력칸/선택칸이 바뀔 때(change) 바로 저장하는 규칙. 맨 위가 우선순위예요. */
import {safeUrl,clamp} from '../utils.js';
import {S,D,cfgOf} from '../state.js';
import {sb,q} from '../api/client.js';
import {saveMM} from '../api/repo.js';
import {toast} from '../ui/toast.js';
import {renderStaff} from '../views/staff/index.js';

export async function onStaffChange(t){
  const f=S.st.form;
  if(t.dataset.pm){
    const m=D.moves.find(x=>x.id===t.dataset.pm),fld=t.dataset.f,v=t.value.trim();
    if(fld==='video_url'&&v&&!safeUrl(v)){toast('영상 링크는 http로 시작해야 해요.',true);t.value=m.video_url;return;}
    if(fld==='name'&&!v){toast('이름은 비울 수 없어요.',true);t.value=m.name;return;}
    await q(sb.from('prep_moves').update({[fld]:v}).eq('id',m.id));m[fld]=v;toast('저장했어요');return;}
  if(f&&t.dataset.mf){f[t.dataset.mf]=t.value;return;}
  if(f&&t.dataset.mfk!==undefined){f.keys[+t.dataset.mfk]=t.value;return;}
  if(t.dataset.sel==='recmem'){S.st.rm=t.value;await renderStaff();}
  else if(t.dataset.sel==='month'){S.st.month=t.value;S.st.sid=null;S.st.mid=null;D.roster=null;await renderStaff();}
  else if(t.dataset.sel==='month2'){S.st.month=t.value;D.assign=null;await renderStaff();}
  else if(t.dataset.sel==='stroke'||t.dataset.sel==='pair'){
    await saveMM(S.st.mid,S.st.month,{[t.dataset.sel]:t.value});toast('저장했어요');await renderStaff();}
  else if(t.dataset.mmf){await saveMM(t.dataset.mid,S.st.month,{[t.dataset.mmf]:t.value});toast('저장했어요');}
  else if(t.dataset.pb){
    const mem=D.mem[S.st.mid],cfg=cfgOf(mem,S.st.month),cur=mem.pb[cfg.stroke]||{pb:'',target:''},row={member_id:S.st.mid,stroke:cfg.stroke,pb:cur.pb||'',target:cur.target||'',cycle:cur.cycle||''};
    row[t.dataset.pb]=t.value.trim();await q(sb.from('member_pb').upsert(row,{onConflict:'member_id,stroke'}));mem.pb[cfg.stroke]=row;toast('저장했어요');await renderStaff();}
  else if(t.dataset.stg){
    const mem=D.mem[S.st.mid],cfg=cfgOf(mem,S.st.month),tg={...(cfg.series_targets||{})};
    if(t.value.trim()==='')delete tg[t.dataset.stg];else tg[t.dataset.stg]=+t.value;
    await saveMM(S.st.mid,S.st.month,{series_targets:tg});toast('저장했어요');await renderStaff();}
  else if(t.dataset.plan){
    const[sid,mid]=t.dataset.plan.split('|');
    if(t.checked)await q(sb.from('session_members').insert({session_id:sid,member_id:mid}));
    else await q(sb.from('session_members').delete().eq('session_id',sid).eq('member_id',mid));
    D.assign=null;delete D.mem[mid];D.roster=null;await renderStaff();}
  else if(t.dataset.base){
    const id=t.dataset.base,v=clamp(t.value,0,999);
    await q(sb.from('profiles').update({base_count:v}).eq('id',id));D.members.find(m=>m.id===id).base_count=v;toast('저장했어요');}
  else if(t.dataset.ex){
    const e=D.ex[t.dataset.ex],tg={...e.targets};tg[t.dataset.lv]=clamp(t.value,1,999);
    await q(sb.from('exercises').update({targets:tg}).eq('key',e.key));e.targets=tg;toast('저장했어요');}
  else if(t.dataset.ldt!==undefined||t.dataset.ldv!==undefined){
    const key=t.dataset.ldt??t.dataset.ldv,e=D.ex[key],ld={...(e.level_desc||{})},cur={...(ld[t.dataset.lv]||{})};
    if(t.dataset.ldt!==undefined)cur.t=t.value;else cur.v=t.value.trim();
    if(!cur.t&&!cur.v)delete ld[t.dataset.lv];else ld[t.dataset.lv]=cur;
    await q(sb.from('exercises').update({level_desc:ld}).eq('key',key));e.level_desc=ld;toast('저장했어요');}
  else if(t.dataset.exp){
    const e=D.ex[t.dataset.exp],v=clamp(t.value,100,300);
    await q(sb.from('exercises').update({promo_pct:v}).eq('key',e.key));e.promo_pct=v;toast('저장했어요');}
}
