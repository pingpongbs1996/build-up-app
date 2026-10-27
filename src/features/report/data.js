/* 수업 리포트 이미지에 들어갈 값을 회원 기록에서 뽑아요 (canvas.js가 이 모양을 그려요) */
import {STROKE_PREFIX} from '../../config.js';
import {fmt,avg} from '../../utils.js';
import {D,sessById,monthById,cfgOf,nthAt} from '../../state.js';
import {lvDesc} from '../../ui/components.js';

export function reportData(profile,mem,sid){
  const ses=sessById(sid),month=monthById(ses.month_id),cfg=cfgOf(mem,month.id),pbo=mem.pb[cfg.stroke]||{};
  const dry=month.keys.map(k=>{const e=D.ex[k],r=mem.dry[sid]&&mem.dry[sid][k],lv=r?r.level:null;
    return{cat:e.cat,name:e.name,level:lv,desc:lv?lvDesc(e,lv):'',target:lv?e.targets[lv]:null,actual:r?avg(r.sets):null};});
  /* 수영: 이 수업 날짜까지의 시리즈별 평균, 최근 9회 */
  const pts={},dset=new Set(),order=[];
  for(const id in mem.swim){const x=sessById(id);if(!x||x.date>ses.date)continue;
    for(const n in mem.swim[id]){const r=mem.swim[id][n],a=avg(r.sets);if(a==null)continue;const key=(STROKE_PREFIX[r.stroke]||'')+n;
      if(!pts[key]){pts[key]={};order.push({key,name:n,pfx:STROKE_PREFIX[r.stroke]||''});}pts[key][x.date]=a;dset.add(x.date);}}
  const dates=[...dset].sort().slice(-9);
  const tgs=cfg.series_targets||{},curP=STROKE_PREFIX[cfg.stroke]||'';
  order.sort((a,b)=>(b.name.includes('★')-a.name.includes('★'))||0);
  const series=order.map(o=>({label:o.key,vals:dates.map(d=>pts[o.key][d]??null),target:o.pfx===curP&&tgs[o.name]!==undefined&&tgs[o.name]!==''?+tgs[o.name]:null})).filter(s=>s.vals.some(v=>v!=null));
  /* 처음 수업 날짜 */
  const ids=new Set([...mem.sm,...Object.keys(mem.dry),...Object.keys(mem.swim)]);let first=ses.date;ids.forEach(id=>{const x=sessById(id);if(x&&x.date<first)first=x.date;});
  const L=d=>{const[y,m,dd]=d.split('-');return `${y}. ${+m}. ${+dd}.`;};
  return{name:profile.name,dived:L(first),pbStroke:cfg.stroke,pb:pbo.pb,target:pbo.target,date:L(ses.date),nth:nthAt(profile,mem,ses.date),
    dry,swim:{dates:dates.map(fmt),series},prep:(mem.prep&&mem.prep[sid])||[],comment:(mem.cmt&&mem.cmt[sid])||''};
}
