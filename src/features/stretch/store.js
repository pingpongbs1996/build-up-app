/* 스트레칭 데이터와 "무엇을 보여줄지" 규칙 (화면 코드는 member-view / staff-view / player) */
import {q,sb} from '../../api/client.js';
import {S,D,sessById} from '../../state.js';
import {addDays} from '../../utils.js';

export const STR={
  cats:[],parts:[],moves:[],feat:{week:[],month:[]},
  st:{src:'week',cat:null,part:null,stroke:'자유형',phase:'all',sel:null,play:null,open:null},
  AUTO:7,MAX:10,
  tm:null,ac:null,
  weekKey(){const d=new Date(S.today+'T00:00:00Z'),dow=(d.getUTCDay()+6)%7;return addDays(S.today,-dow);},
  monthKey(){return S.today.slice(0,7);},
  async load(){
    try{
      const wk=STR.weekKey(),mk=STR.monthKey();
      const[c,p,m,f]=await Promise.all([q(sb.from('stretch_cats').select('*').order('sort')),q(sb.from('stretch_parts').select('*').order('sort')),
        q(sb.from('stretch_moves').select('*').order('sort')),q(sb.from('stretch_featured').select('*').in('period',[wk,mk]))]);
      STR.cats=c;STR.parts=p;STR.moves=m;
      const get=(sc,pe)=>(f.find(x=>x.scope===sc&&x.period===pe)||{ids:[]}).ids||[];
      STR.feat={week:get('week',wk),month:get('month',mk)};
    }catch(e){console.warn('스트레칭 불러오기 실패',e);STR.cats=[];STR.parts=[];STR.moves=[];STR.feat={week:[],month:[]};}
  },
  mv(id){return STR.moves.find(m=>m.id===id);},
  partName(id){const p=STR.parts.find(x=>x.id===id);return p?p.name:null;},
  phaseLabel(p){return p==='pre'?'수업 전':p==='post'?'수업 후':'전·후';},
  ytId(u){
    const m=String(u||'').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([A-Za-z0-9_-]{11})/);return m?m[1]:null;
  },
  /* 가장 최근 수업에서 선생님이 SELF PREP에 넣어 준 스트레칭 */
  mineInfo(){
    const mem=D.mem[S.me.id]||{prep:{}};let best=null;
    for(const sid in (mem.prep||{})){const x=sessById(sid);if(!x||x.date>S.today)continue;
      const ids=(mem.prep[sid]||[]).filter(i=>i.k==='stretch').map(i=>i.id);if(ids.length&&(!best||x.date>best.date))best={date:x.date,ids};}
    return best;
  },
  /* 지금 고른 방법(src)과 수업 전후(phase)에 맞는 후보 목록 */
  cands(){
    const st=STR.st,mv=STR.moves,byIds=ids=>ids.map(STR.mv).filter(Boolean);let list;
    if(st.src==='week')list=byIds(STR.feat.week);
    else if(st.src==='month')list=byIds(STR.feat.month);
    else if(st.src==='mine'){const i=STR.mineInfo();list=i?byIds(i.ids):[];}
    else{
      if(st.src==='cat'){const pids=new Set(STR.parts.filter(p=>p.cat_id===st.cat).map(p=>p.id));list=mv.filter(m=>(m.part_ids||[]).some(x=>pids.has(x)));}
      else if(st.src==='part')list=mv.filter(m=>(m.part_ids||[]).includes(st.part));
      else list=mv.filter(m=>(m.strokes||[]).includes(st.stroke)).concat(mv.filter(m=>!(m.strokes||[]).length));
      const rk={pre:0,both:1,post:2};list=list.slice().sort((a,b)=>(st.phase==='all'?rk[a.phase]-rk[b.phase]:0)||a.sort-b.sort);
    }
    if(st.phase!=='all')list=list.filter(m=>m.phase==='both'||m.phase===st.phase);
    return list;
  },
  reset(){STR.st.sel=STR.cands().slice(0,STR.AUTO).map(m=>m.id);},
  queue(){const s=new Set(STR.st.sel||[]);return STR.cands().filter(m=>s.has(m.id));}
};
