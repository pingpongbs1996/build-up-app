/* 스트레칭 연속 재생: 타이머, 다음/이전, 알림음 */
import {$,fmtT} from '../../utils.js';
import {STR} from './store.js';
import {memberHtml} from './member-view.js';

export function rerender(){const el=$('#str');if(el)el.innerHTML=memberHtml();}

function beep(){
  try{const a=STR.ac||(STR.ac=new (window.AudioContext||window.webkitAudioContext)()),o=a.createOscillator(),g=a.createGain();o.frequency.value=880;g.gain.value=.15;o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+.18);}catch(e){}
  try{navigator.vibrate&&navigator.vibrate(120);}catch(e){}
}

function startTimer(){
  clearInterval(STR.tm);const pl=STR.st.play;if(!pl||pl.done)return;
  STR.tm=setInterval(()=>{
    if(!STR.st.play||pl.paused)return;
    const left=pl.deadline-Date.now(),c=$('#stc'),b=$('#stp');
    if(c)c.textContent=fmtT(Math.max(0,left));
    if(b)b.style.width=Math.min(100,100-left/(pl.total||1)*100)+'%';
    if(left<=0)goTo(pl.i+1,true);
  },250);
}

/* i번째 스트레칭으로 이동. 끝을 넘으면 완료 화면 */
export function goTo(i,withBeep){
  const pl=STR.st.play;if(!pl)return;if(withBeep)beep();
  if(i<0)i=0;
  if(i>=pl.q.length){pl.done=true;clearInterval(STR.tm);rerender();return;}
  pl.i=i;pl.total=(pl.q[i].sec||60)*1000;pl.deadline=Date.now()+pl.total;pl.paused=false;pl.remaining=pl.total;
  rerender();startTimer();
}

export function stopPlayer(){clearInterval(STR.tm);STR.st.play=null;}
