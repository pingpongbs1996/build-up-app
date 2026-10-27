/* 화면·데이터에 의존하지 않는 순수 도우미 */
export const $=(s,r=document)=>r.querySelector(s);
export const $$=(s,r=document)=>[...r.querySelectorAll(s)];
export const app=$('#app');
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const safeUrl=u=>/^https?:\/\//i.test(u||'')?u:'';

/* 날짜 (모두 'YYYY-MM-DD' 문자열, 한국 시간 기준) */
export const fmt=d=>(+d.slice(5,7))+'/'+(+d.slice(8,10));
export const wd=d=>['일','월','화','수','목','금','토'][new Date(d+'T00:00:00').getDay()];
export const kstToday=()=>new Date(Date.now()+9*36e5).toISOString().slice(0,10);
export const addDays=(s,n)=>{const[y,m,d]=s.split('-').map(Number);return new Date(Date.UTC(y,m-1,d+n)).toISOString().slice(0,10);};
export const monthLabel=ym=>ym.replace('-','년 ').replace(/ 0/,' ')+'월';

/* 숫자 */
export const valid=x=>x!==''&&x!=null&&!isNaN(+x);
export const sumSets=a=>{const v=(a||[]).filter(valid);return v.length?v.reduce((s,x)=>s+ +x,0):null;};
export const avg=a=>{const v=(a||[]).filter(valid).map(Number).filter(x=>x>0);return v.length?Math.round(v.reduce((s,x)=>s+x,0)/v.length*10)/10:null;};
export const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,Math.round(+v)||lo));

/* 표시 형식 */
const ordSuffix=n=>{const s=['th','st','nd','rd'],v=n%100;return s[(v-20)%10]||s[v]||s[0];};
export const ordHtml=n=>`<b>${n}</b><sup>${ordSuffix(n)}</sup>`;
export const ordE=n=>n+ordSuffix(n);
export const phoneMask=mid=>mid?`010-${mid}-****`:'';
export const swimLabel=(i,j)=>i===0?`${j+1}라운드`:`${ordE(j+1)} REP`;
export const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,20)||('x'+Date.now());
export const fmtT=ms=>{const s=Math.ceil(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
