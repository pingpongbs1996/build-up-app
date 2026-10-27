/* 스트레칭 탭 동작: 회원(고르기·재생) / 선생님(등록·추천) */
import {$,$$} from '../utils.js';
import {S} from '../state.js';
import {sb,q} from '../api/client.js';
import {toast} from '../ui/toast.js';
import {STR} from '../features/stretch/store.js';
import {rerender,goTo,stopPlayer} from '../features/stretch/player.js';
import {renderStaff} from '../views/staff/index.js';

const httpOnly=u=>/^https?:\/\//i.test(u);
function needConfirm(t,label){
  if(t.dataset.confirm==='1')return false;
  t.dataset.confirm='1';t.textContent=label;return true;
}
async function reloadAndRender(msg){await STR.load();toast(msg);await renderStaff();}

export const stretchActions={
  /* 회원 */
  strsrc(t){const st=STR.st;st.src=t.dataset.v;if(st.src==='cat'&&!st.cat&&STR.cats[0])st.cat=STR.cats[0].id;if(st.src==='part'&&!st.part&&STR.parts[0])st.part=STR.parts[0].id;STR.reset();rerender();},
  strcat(t){STR.st.cat=t.dataset.v;STR.reset();rerender();},
  strpart(t){STR.st.part=t.dataset.v;STR.reset();rerender();},
  strstroke(t){STR.st.stroke=t.dataset.v;STR.reset();rerender();},
  strphase(t){STR.st.phase=t.dataset.v;STR.reset();rerender();},
  strtog(t){
    const id=t.dataset.id,sel=STR.st.sel||(STR.st.sel=[]),i=sel.indexOf(id);
    if(i>=0)sel.splice(i,1);else{if(sel.length>=STR.MAX){t.checked=false;toast(`스트레칭은 최대 ${STR.MAX}개까지 고를 수 있어요.`,true);return;}sel.push(id);}
    rerender();
  },
  strstart(){const q=STR.queue();if(!q.length)return;STR.st.play={q,i:0,done:false};goTo(0,false);},
  strpause(){const pl=STR.st.play;if(!pl)return;if(pl.paused){pl.deadline=Date.now()+pl.remaining;pl.paused=false;}else{pl.remaining=Math.max(0,pl.deadline-Date.now());pl.paused=true;}rerender();},
  strnext(){const pl=STR.st.play;if(pl)goTo(pl.i+1,false);},
  strprev(){const pl=STR.st.play;if(pl)goTo(pl.i-1,false);},
  strend(){stopPlayer();rerender();},

  /* 선생님 */
  async sxaddcat(){
    const n=$('#sx-nc').value.trim();if(!n){toast('카테고리 이름을 적어 주세요.',true);return;}
    if(STR.cats.some(c=>c.name===n)){toast('이미 있는 카테고리예요.',true);return;}
    await q(sb.from('stretch_cats').insert({name:n,sort:STR.cats.length+1}));await reloadAndRender('추가했어요');
  },
  async sxdelcat(t){
    if(needConfirm(t,'부위도 함께 삭제? 한 번 더'))return;
    await q(sb.from('stretch_cats').delete().eq('id',t.dataset.id));await reloadAndRender('삭제했어요');
  },
  async sxaddpart(t){
    const el=$(`[data-sxnp="${t.dataset.id}"]`),n=el.value.trim();if(!n){toast('부위 이름을 적어 주세요.',true);return;}
    if(STR.parts.some(p=>p.cat_id===t.dataset.id&&p.name===n)){toast('이미 있는 부위예요.',true);return;}
    await q(sb.from('stretch_parts').insert({cat_id:t.dataset.id,name:n,sort:STR.parts.length+1}));await reloadAndRender('추가했어요');
  },
  async sxdelpart(t){
    if(needConfirm(t,'삭제?'))return;
    await q(sb.from('stretch_parts').delete().eq('id',t.dataset.id));await reloadAndRender('삭제했어요');
  },
  async sxaddmove(){
    const name=$('#sx-n').value.trim(),url=$('#sx-u').value.trim(),phase=$('#sx-ph').value,sec=Math.min(600,Math.max(5,+$('#sx-s').value||60));
    if(!name){toast('이름을 적어 주세요.',true);return;}
    if(url&&!httpOnly(url)){toast('영상 링크는 http로 시작해야 해요.',true);return;}
    const part_ids=$$('[data-sxnewp]').filter(x=>x.checked).map(x=>x.dataset.sxnewp),strokes=$$('[data-sxnews]').filter(x=>x.checked).map(x=>x.dataset.sxnews);
    await q(sb.from('stretch_moves').insert({name,url,phase,sec,part_ids,strokes,sort:STR.moves.length+1}));await reloadAndRender('스트레칭을 추가했어요');
  },
  sxopen(t){STR.st.open=STR.st.open===t.dataset.id?null:t.dataset.id;return renderStaff();},
  async sxdelmove(t){
    if(needConfirm(t,'삭제?'))return;
    await q(sb.from('stretch_moves').delete().eq('id',t.dataset.id));await reloadAndRender('삭제했어요');
  },
  async sxfeat(t){
    const sc=t.dataset.scope,ids=STR.feat[sc].slice(),i=ids.indexOf(t.dataset.id);if(i>=0)ids.splice(i,1);else ids.push(t.dataset.id);
    const period=sc==='week'?STR.weekKey():STR.monthKey();
    await q(sb.from('stretch_featured').upsert({scope:sc,period,ids,author:S.me.id},{onConflict:'scope,period'}));STR.feat[sc]=ids;toast('저장했어요');await renderStaff();
  }
};

/* 선생님이 스트레칭 목록의 칸을 고쳤을 때(change). 처리했으면 true */
export async function onStretchChange(t){
  if(t.dataset.sxm!==undefined){
    const m=STR.mv(t.dataset.sxm),f=t.dataset.f;let v=t.value.trim();
    if(f==='name'&&!v){toast('이름은 비울 수 없어요.',true);t.value=m.name;return true;}
    if(f==='url'&&v&&!httpOnly(v)){toast('영상 링크는 http로 시작해야 해요.',true);t.value=m.url;return true;}
    if(f==='sec')v=Math.min(600,Math.max(5,+v||60));
    await q(sb.from('stretch_moves').update({[f]:v}).eq('id',m.id));m[f]=v;toast('저장했어요');return true;
  }
  if(t.dataset.sxt){
    const m=STR.mv(t.dataset.id),key=t.dataset.sxt==='part'?'part_ids':'strokes',cur=new Set(m[key]||[]);
    if(t.checked)cur.add(t.dataset.v);else cur.delete(t.dataset.v);
    const arr=[...cur];await q(sb.from('stretch_moves').update({[key]:arr}).eq('id',m.id));m[key]=arr;toast('저장했어요');await renderStaff();
    return true;
  }
  return false;
}
