/* 앱 상태(S: 화면 상태, D: 서버에서 불러온 데이터, form: 지금 열린 입력 폼)와 그 조회 함수 */
import {kstToday} from './utils.js';

export const S={view:'boot',me:null,tab:'dry',sid:null,prev:false,range:'8',open:{},swSel:null,swProg:null,swView:null,
  pending:null,fails:{},popup:false,today:kstToday(),
  st:{tab:'class',month:null,sid:null,mid:null,form:null,msg:'',rm:null,prep:null}};
export const D={ex:{},exList:[],months:[],sessions:[],mem:{},members:[],roster:null,assign:null,gear:[],moves:[]};
/* 입력 폼은 mountForm이 만들고, 폼이 없으면 form.cur는 null */
export const form={cur:null};

export const boss=()=>S.me&&S.me.role==='boss';
export const monthById=id=>D.months.find(m=>m.id===id);
export const sessById=id=>D.sessions.find(s=>s.id===id);
export const monthOfSession=sid=>{const s=sessById(sid);return s?monthById(s.month_id):null;};
export const cfgOf=(mem,monthId)=>mem.mm[monthId]||{stroke:'자유형',pair:'A',series_targets:{}};
export const exLabel=e=>e.cat.endsWith('+')?e.cat:e.cat+'-'+e.name;

const attendedIds=mem=>new Set([...Object.keys(mem.dry),...Object.keys(mem.swim)]);
/* date 수업이 몇 번째 수업인지 (이전 참여 횟수 포함) */
export const nthAt=(p,mem,date)=>{let n=0;attendedIds(mem).forEach(id=>{const x=sessById(id);if(x&&x.date<date)n++;});return (p.base_count||0)+n+1;};
export const nthOf=(p,mem)=>(p.base_count||0)+attendedIds(mem).size;

export function mySessions(){const mem=D.mem[S.me.id];return D.sessions.filter(s=>mem.sm.has(s.id)).sort((a,b)=>a.date<b.date?1:-1);}
export function defaultMonthId(){
  const ss=D.sessions.slice().sort((a,b)=>a.date<b.date?-1:1);
  const s=ss.find(x=>x.date>=S.today)||ss[ss.length-1];
  if(s)return s.month_id;
  const m=D.months[D.months.length-1];return m?m.id:null;
}
