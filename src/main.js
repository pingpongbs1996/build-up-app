/* 앱 시작점: 이벤트를 연결하고, 로그인 상태에 따라 첫 화면을 정해요 */
import {sb} from './api/client.js';
import {installEvents} from './events.js';
import {routeAfterLogin} from './actions/auth.js';
import {renderLoading,renderLogin} from './views/login.js';

installEvents();
(async()=>{
  renderLoading();
  try{
    const{data:{session}}=await sb.auth.getSession();
    if(session)await routeAfterLogin();else renderLogin();
  }catch(e){console.error(e);renderLogin();}
})();
