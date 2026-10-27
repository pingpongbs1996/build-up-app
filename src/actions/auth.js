/* 로그인 / 로그아웃 / 로그인 직후 어느 화면으로 갈지 */
import {MAX_LOGIN_FAILS} from '../config.js';
import {$} from '../utils.js';
import {S,D,defaultMonthId} from '../state.js';
import {sb,q,niceErr} from '../api/client.js';
import {loadBase,loadMem,loadMembers} from '../api/repo.js';
import {toast} from '../ui/toast.js';
import {stopPlayer} from '../features/stretch/player.js';
import {renderLoading,renderLogin,renderPw,renderStaffLogin,renderChange} from '../views/login.js';
import {renderMember} from '../views/member.js';
import {renderStaff} from '../views/staff/index.js';

/* 회원은 이름으로 찾은 뒤 PIN으로 로그인해요. 계정 이메일/비밀번호는 PIN에서 만들어요. */
const memberEmail=id=>`m-${id}@members.example.com`;
const pwOf=pin=>'bu-'+pin;

export async function routeAfterLogin(){
  renderLoading();
  const{data:{user}}=await sb.auth.getUser();
  if(!user){renderLogin();return;}
  const p=await q(sb.from('profiles').select('*').eq('id',user.id).maybeSingle());
  if(!p){await sb.auth.signOut();toast('권한이 없는 계정이에요. 선생님께 문의해 주세요.',true);renderLogin();return;}
  S.me=p;
  if(p.role==='member'&&p.must_change){renderChange();return;}
  await loadBase();
  if(p.role==='member'){await loadMem(p.id);S.sid=null;S.tab='dry';renderMember();}
  else{await loadMembers();S.st.tab='class';S.st.month=defaultMonthId();S.st.sid=null;S.st.mid=null;await renderStaff();}
}

/* data-form 속성에 따라 회원 로그인 / 선생님 로그인 / 첫 비밀번호 변경을 처리해요 */
export async function handleSubmit(f){
  const msg=$('#msg'),btn=$('button[type=submit]',f);btn.disabled=true;
  try{
    if(f.dataset.form==='login'){
      const pin=$('#pw').value.trim(),p=S.pending;
      if(!/^\d{4,6}$/.test(pin)){msg.textContent='숫자 4~6자리로 입력해 주세요.';return;}
      const{error}=await sb.auth.signInWithPassword({email:memberEmail(p.id),password:pwOf(pin)});
      if(error){
        S.fails[p.id]=(S.fails[p.id]||0)+1;
        if(S.fails[p.id]>=MAX_LOGIN_FAILS){S.popup=true;renderPw();return;}
        msg.textContent=`비밀번호가 맞지 않아요 (${S.fails[p.id]}/${MAX_LOGIN_FAILS})`;$('#pw').select();return;
      }
      S.fails[p.id]=0;await routeAfterLogin();
    }else if(f.dataset.form==='staff'){
      const{error}=await sb.auth.signInWithPassword({email:$('#em').value.trim(),password:$('#spw').value});
      if(error){msg.textContent='이메일이나 비밀번호가 맞지 않아요.';return;}
      await routeAfterLogin();
    }else{
      const a=$('#np').value.trim(),b=$('#np2').value.trim();
      if(!/^\d{4,6}$/.test(a)){msg.textContent='숫자 4~6자리로 정해 주세요.';return;}
      if(a!==b){msg.textContent='두 번 입력한 비밀번호가 달라요.';return;}
      const{error}=await sb.auth.updateUser({password:pwOf(a)});
      if(error){msg.textContent='비밀번호를 바꾸지 못했어요. '+niceErr(error);return;}
      await q(sb.rpc('clear_must_change'));S.me.must_change=false;toast('비밀번호를 바꿨어요');await routeAfterLogin();
    }
  }finally{if(btn.isConnected)btn.disabled=false;}
}

export const authActions={
  async pick(t){S.pending={id:t.dataset.id,name:t.dataset.name,mid:t.dataset.mid};S.popup=false;renderPw();},
  back(){renderLogin();},
  stafflogin(){renderStaffLogin();},
  closepop(){S.popup=false;renderPw();},
  async logout(){
    stopPlayer();await sb.auth.signOut();
    /* 다음 사람이 이전 로그인의 데이터를 보지 않도록 비워요 */
    Object.keys(D.mem).forEach(k=>delete D.mem[k]);D.members=[];D.roster=null;D.assign=null;
    S.me=null;S.sid=null;S.open={};S.swSel=null;S.swView=null;S.prev=false;
    S.st={tab:'class',month:null,sid:null,mid:null,form:null,msg:'',rm:null,prep:null};
    renderLogin();
  }
};
