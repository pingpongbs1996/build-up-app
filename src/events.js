/* 전역 이벤트 위임: data-act 속성이 달린 요소를 누르면 같은 이름의 동작(actions/*)이 실행돼요 */
import {S,form} from './state.js';
import {guard} from './ui/toast.js';
import {updateResults} from './views/login.js';
import {updateDry,updateSwim} from './views/entry-form.js';
import {redrawCharts} from './views/charts.js';
import {authActions,handleSubmit} from './actions/auth.js';
import {entryActions} from './actions/entry.js';
import {staffActions} from './actions/staff.js';
import {noteActions} from './actions/session-notes.js';
import {stretchActions,onStretchChange} from './actions/stretch.js';
import {onStaffChange} from './actions/staff-change.js';

const ACTIONS={...authActions,...entryActions,...staffActions,...noteActions,...stretchActions};
/* 입력 폼 안에서만 의미가 있는 동작: 폼이 없거나 폼 밖 버튼이면 무시해요 */
const FORM_ONLY=new Set(['stroke','lv','step','save','hist','swsel']);

export function installEvents(){
  document.addEventListener('click',e=>{
    const t=e.target.closest('[data-act]');if(!t)return;
    const a=t.dataset.act,F=form.cur;
    if(FORM_ONLY.has(a)&&!(F&&F.root.contains(t)))return;
    if(ACTIONS[a])guard(()=>ACTIONS[a](t));
  });

  document.addEventListener('input',e=>{
    const t=e.target,F=form.cur;
    if(t.id==='q'){updateResults(t.value);return;}
    if(t.dataset.pa!==undefined&&S.st.prep){S.st.prep.items[+t.dataset.pa].amount=t.value;return;}
    if(F&&t.classList.contains('f-in')){
      if(t.dataset.kind==='dry'){F.draft.dry[t.dataset.k].sets[+t.dataset.i]=t.value;updateDry(t.dataset.k);}
      else{F.draft.swim[t.dataset.n][+t.dataset.i]=t.value;updateSwim(t.dataset.n);}
      return;
    }
    const f=S.st.form;
    if(f&&t.dataset.mf)f[t.dataset.mf]=t.value;
  });

  document.addEventListener('change',e=>{
    const t=e.target;
    guard(async()=>{if(!await onStretchChange(t))await onStaffChange(t);});
  });

  document.addEventListener('submit',e=>{
    const f=e.target.closest('[data-form]');if(!f)return;e.preventDefault();
    guard(()=>handleSubmit(f));
  });

  let rz;
  window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(redrawCharts,150);});
}
