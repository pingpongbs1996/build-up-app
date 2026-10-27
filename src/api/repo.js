/* Supabase 읽기/쓰기를 한곳에 모았어요. 결과는 state.js의 D에 채워요. */
import {sb,q} from './client.js';
import {D,cfgOf} from '../state.js';
import {STR} from '../features/stretch/store.js';

/* 모든 로그인 사용자가 쓰는 공통 데이터 */
export async function loadBase(){
  const[ex,mo,me,se,gt,pm]=await Promise.all([
    q(sb.from('exercises').select('*').order('sort')),q(sb.from('months').select('*').order('ym')),
    q(sb.from('month_exercises').select('*').order('slot')),q(sb.from('sessions').select('*').order('date')),q(sb.from('gear_types').select('*').order('sort')),q(sb.from('prep_moves').select('*').order('sort'))]);
  D.gear=gt.map(g=>g.name);D.moves=pm;await STR.load();
  ex.forEach(e=>{if(!e.level_desc)e.level_desc={};});D.exList=ex;D.ex={};ex.forEach(e=>D.ex[e.key]=e);
  D.months=mo.map(m=>({...m,keys:me.filter(x=>x.month_id===m.id).sort((a,b)=>a.slot-b.slot).map(x=>x.exercise_key)}));
  D.sessions=se;
}

/* 회원 한 명의 기록 전체 */
export async function loadMem(mid){
  const[sm,mm,pb,dl,sl,cm,pr]=await Promise.all([
    q(sb.from('session_members').select('session_id').eq('member_id',mid)),
    q(sb.from('member_month').select('*').eq('member_id',mid)),
    q(sb.from('member_pb').select('*').eq('member_id',mid)),
    q(sb.from('dry_logs').select('*').eq('member_id',mid)),
    q(sb.from('swim_logs').select('*').eq('member_id',mid)),
    q(sb.from('session_comments').select('*').eq('member_id',mid)),
    q(sb.from('session_preps').select('*').eq('member_id',mid))]);
  const m={prep:Object.fromEntries(pr.map(x=>[x.session_id,x.items||[]])),cmt:Object.fromEntries(cm.map(x=>[x.session_id,x.body])),sm:new Set(sm.map(x=>x.session_id)),mm:{},pb:{},dry:{},swim:{}};
  mm.forEach(x=>m.mm[x.month_id]=x);pb.forEach(x=>m.pb[x.stroke]=x);
  dl.forEach(x=>{(m.dry[x.session_id]=m.dry[x.session_id]||{})[x.exercise_key]={level:x.level,sets:x.sets,by:x.entered_by,note:x.note};});
  sl.forEach(x=>{(m.swim[x.session_id]=m.swim[x.session_id]||{})[x.series]={stroke:x.stroke,sets:x.sets,by:x.entered_by};});
  D.mem[mid]=m;return m;
}

export async function loadMembers(){D.members=await q(sb.from('profiles').select('*').eq('role','member').order('name'));}

/* 수업 하루의 참여 회원과 입력 여부 */
export async function loadRoster(sid){
  const[sm,dl,sl]=await Promise.all([
    q(sb.from('session_members').select('member_id').eq('session_id',sid)),
    q(sb.from('dry_logs').select('member_id,entered_by').eq('session_id',sid)),
    q(sb.from('swim_logs').select('member_id,entered_by').eq('session_id',sid))]);
  const rows=[...dl,...sl];
  D.roster={sid,list:sm.map(x=>{const mine=rows.filter(r=>r.member_id===x.member_id);
    return{id:x.member_id,done:mine.length>0,byStaff:mine.some(r=>r.entered_by!==x.member_id)};})};
}

/* 한 달의 회원별 참여 날짜 / 영법 설정 */
export async function loadAssign(monthId){
  const ids=D.sessions.filter(s=>s.month_id===monthId).map(s=>s.id);
  const[sm,mm]=await Promise.all([ids.length?q(sb.from('session_members').select('*').in('session_id',ids)):[],
    q(sb.from('member_month').select('*').eq('month_id',monthId))]);
  D.assign={monthId,sm:new Set(sm.map(x=>x.session_id+'|'+x.member_id)),mm:Object.fromEntries(mm.map(x=>[x.member_id,x]))};
}

/* 회원의 달별 영법·시리즈·시리즈 목표 저장 (patch만 덮어써요) */
export async function saveMM(mid,monthId,patch){
  if(!D.mem[mid])await loadMem(mid);
  const cur=D.assign&&D.assign.monthId===monthId&&D.assign.mm[mid]?D.assign.mm[mid]:(D.mem[mid]?cfgOf(D.mem[mid],monthId):{stroke:'자유형',pair:'A',series_targets:{}});
  const row={member_id:mid,month_id:monthId,stroke:cur.stroke||'자유형',pair:cur.pair||'A',series_targets:cur.series_targets||{},...patch};
  await q(sb.from('member_month').upsert(row,{onConflict:'member_id,month_id'}));
  if(D.mem[mid])D.mem[mid].mm[monthId]=row;
  if(D.assign&&D.assign.monthId===monthId)D.assign.mm[mid]=row;
}
