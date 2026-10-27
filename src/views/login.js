import {MAX_LOGIN_FAILS} from '../config.js';
import {$,app,esc,phoneMask} from '../utils.js';
import {S,form} from '../state.js';
import {sb,q,niceErr} from '../api/client.js';
import {brandHead,footLogo} from '../ui/components.js';

export function renderLoading(){app.innerHTML='<div class="loading">불러오는 중…</div>';}

export function renderLogin(){
  S.view='login';form.cur=null;
  app.innerHTML=`<main class="login">${brandHead()}
   <section class="card"><h1>내 기록 들어가기</h1>
    <label for="q">이름</label>
    <input id="q" class="txt" type="search" placeholder="이름을 입력하세요" autocomplete="off">
    <div id="results" class="results"></div></section>
   <button class="linkbtn" data-act="stafflogin">선생님 로그인</button>${footLogo()}</main>`;
  updateResults('');
}

/* 이름 검색: 늦게 도착한 이전 검색 결과는 버려요 */
let searchSeq=0;
export async function updateResults(text){
  const box=$('#results');if(!box)return;
  text=text.trim();
  if(!text){box.innerHTML='<span class="muted">이름 일부를 입력하면 회원 목록이 나와요.</span>';return;}
  const seq=++searchSeq;
  try{
    const list=await q(sb.rpc('search_members',{q:text}));
    if(seq!==searchSeq)return;
    box.innerHTML=list.length?list.map(m=>`<button class="pick" data-act="pick" data-id="${m.id}" data-name="${esc(m.name)}" data-mid="${esc(m.phone_mid)}"><span>${esc(m.name)}</span><span class="ph">${phoneMask(m.phone_mid)}</span></button>`).join(''):'<span class="muted">등록된 이름이 없어요. 선생님께 등록을 요청해 주세요.</span>';
  }catch(e){if(seq===searchSeq)box.innerHTML=`<span class="err">${esc(niceErr(e))}</span>`;}
}

export function renderPw(){
  S.view='pw';const p=S.pending;
  app.innerHTML=`<main class="login">${brandHead()}
   <form class="card stack" data-form="login">
     <h1>${esc(p.name)} <span class="muted small">${phoneMask(p.mid)}</span></h1>
     <div><label for="pw">비밀번호</label><input id="pw" class="txt" type="password" inputmode="numeric" maxlength="6" autocomplete="current-password" placeholder="숫자 4~6자리"></div>
     <div class="err" id="msg"></div>
     <button class="btn" type="submit">들어가기</button>
     <button class="btn ghost" type="button" data-act="back">다른 이름 찾기</button>
   </form>${S.popup?`<div class="overlay"><div class="modal" role="dialog" aria-modal="true"><h2>비밀번호를 ${MAX_LOGIN_FAILS}번 틀렸어요</h2><p>선생님께 비밀번호 초기화를 요청해 주세요. 초기화되면 전화번호 뒤 4자리로 다시 들어올 수 있어요.</p><button class="btn" data-act="closepop">확인</button></div></div>`:''}</main>`;
  const el=$('#pw');if(el)el.focus();
}

export function renderStaffLogin(){
  S.view='staffLogin';
  app.innerHTML=`<main class="login">${brandHead()}
   <form class="card stack" data-form="staff">
     <h1>선생님 로그인</h1>
     <div><label for="em">이메일</label><input id="em" class="txt" type="email" autocomplete="username"></div>
     <div><label for="spw">비밀번호</label><input id="spw" class="txt" type="password" autocomplete="current-password"></div>
     <div class="err" id="msg"></div>
     <button class="btn" type="submit">들어가기</button>
     <button class="btn ghost" type="button" data-act="back">회원 로그인으로</button>
   </form></main>`;
}

export function renderChange(){
  S.view='change';
  app.innerHTML=`<main class="login">${brandHead()}
   <form class="card stack" data-form="change">
     <h1>새 비밀번호 정하기</h1>
     <p class="muted" style="margin:0">처음 들어오셨어요. 전화번호 뒤 4자리 대신 나만의 비밀번호를 정해 주세요.</p>
     <div><label for="np">새 비밀번호 (숫자 4~6자리)</label><input id="np" class="txt" type="password" inputmode="numeric" maxlength="6" autocomplete="new-password"></div>
     <div><label for="np2">한 번 더 입력</label><input id="np2" class="txt" type="password" inputmode="numeric" maxlength="6" autocomplete="new-password"></div>
     <div class="err" id="msg"></div>
     <button class="btn" type="submit">저장하고 시작하기</button>
   </form></main>`;
  $('#np').focus();
}
