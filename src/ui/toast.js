import {$} from '../utils.js';
import {niceErr} from '../api/client.js';

let toastT;
export function toast(msg,bad){
  const t=$('#toast');t.textContent=msg;t.className='toast'+(bad?' bad':'');t.hidden=false;
  clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true;},bad?4200:2600);
}

/* 비동기 동작을 실행하고, 실패하면 토스트로 알려요 */
export async function guard(fn){try{await fn();}catch(e){console.error(e);toast(niceErr(e),true);}}
