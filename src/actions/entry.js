/* 회원 화면 / 입력 폼 안에서 일어나는 동작 */
import {PAIRS} from '../config.js';
import {$,$$,fmt,valid} from '../utils.js';
import {S,form,mySessions} from '../state.js';
import {sb,q,niceErr} from '../api/client.js';
import {loadRoster} from '../api/repo.js';
import {toast} from '../ui/toast.js';
import {renderMember} from '../views/member.js';
import {renderStaff} from '../views/staff/index.js';
import {renderForm,updateDry} from '../views/entry-form.js';
import {drawChart,drawDryChart,swSelInner,redrawCharts} from '../views/charts.js';


async function saveForm(){
  const F=form.cur,btn=$('#savebtn');if(btn)btn.disabled=true;
  try{
    const mid=F.profile.id,dry=[],swim=[];
    F.month.keys.forEach(k=>{const d=F.draft.dry[k];if(d.sets.some(valid))dry.push({member_id:mid,session_id:F.sid,exercise_key:k,level:+d.lv,sets:d.sets.map(x=>valid(x)?+x:null)});});
    PAIRS[F.cfg.pair].forEach(n=>{const s=F.draft.swim[n];if(s.some(valid))swim.push({member_id:mid,session_id:F.sid,series:n,stroke:F.cfg.stroke,sets:s.map(x=>valid(x)?+x:null)});});
    if(!dry.length&&!swim.length){toast('입력된 값이 없어요. 개수나 페이스를 먼저 넣어 주세요.',true);return;}
    if(dry.length)await q(sb.from('dry_logs').upsert(dry,{onConflict:'member_id,session_id,exercise_key'}));
    if(swim.length)await q(sb.from('swim_logs').upsert(swim,{onConflict:'member_id,session_id,series'}));
    const me=F.mem;
    dry.forEach(r=>{(me.dry[F.sid]=me.dry[F.sid]||{})[r.exercise_key]={level:r.level,sets:r.sets,by:S.me.id};});
    swim.forEach(r=>{(me.swim[F.sid]=me.swim[F.sid]||{})[r.series]={stroke:r.stroke,sets:r.sets,by:S.me.id};});
    toast('저장했어요');
    if(S.me.role==='member')renderMember();else{await loadRoster(F.sid);await renderStaff();}
  }catch(e){console.error(e);toast(niceErr(e),true);}
  finally{const b=$('#savebtn');if(b)b.disabled=false;}
}

export const entryActions={
  date(t){S.sid=t.dataset.sid;S.swView=null;renderMember();},
  locked(t){toast(fmt(t.dataset.d)+' 수업은 그날 0시에 열려요.');},
  prev(){S.prev=!S.prev;renderMember();},
  jump(){
    const v=$('#jump').value;if(!v){toast('날짜를 골라 주세요.',true);return;}
    const s=mySessions().find(x=>x.date===v);
    if(!s){toast('그 날짜에는 내 수업이 없어요.',true);return;}
    if(s.date>S.today){toast(fmt(v)+' 수업은 그날 0시에 열려요.');return;}
    S.prev=true;S.sid=s.id;S.swView=null;renderMember();
  },
  tab(t){S.tab=t.dataset.tab;S.swView=null;if(S.view==='member')renderMember();else renderForm();},
  stroke(t){const F=form.cur;S.swView=t.dataset.s;F.view=S.swView;S.swSel=null;S.swProg=null;renderForm();},
  swsel(t){const F=form.cur;S.swSel=t.dataset.s;F.root.querySelector('#swselbox').innerHTML=swSelInner();drawChart();},
  swprog(t){const F=form.cur;S.swProg=t.dataset.p;F.root.querySelector('#swselbox').innerHTML=swSelInner();drawChart();},
  lv(t){
    const k=t.dataset.k,d=form.cur.draft.dry[k];d.lv=+t.dataset.lv;
    t.parentElement.querySelectorAll('.lvbtn').forEach(b=>{const on=+b.dataset.lv===d.lv;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);});
    updateDry(k);
  },
  step(t){
    const F=form.cur,k=t.dataset.k,i=+t.dataset.i,d=F.draft.dry[k],v=Math.max(0,(valid(d.sets[i])?+d.sets[i]:0)+ +t.dataset.d);
    d.sets[i]=String(v);F.root.querySelector(`input[data-kind="dry"][data-k="${k}"][data-i="${i}"]`).value=v;updateDry(k);
  },
  save(){return saveForm();},
  hist(t){
    const F=form.cur,k=t.dataset.k;S.open[k]=!S.open[k];t.setAttribute('aria-expanded',!!S.open[k]);
    F.root.querySelector(`[data-hp="${k}"]`).hidden=!S.open[k];if(S.open[k])drawDryChart(k);
  },
  range(t){
    S.range=t.dataset.r;$$('[data-act="range"]').forEach(b=>b.classList.toggle('on',b.dataset.r===S.range));
    redrawCharts();
  }
};
