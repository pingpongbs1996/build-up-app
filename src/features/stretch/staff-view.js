/* 선생님 스트레칭 탭: 이번 주/달 추천, 카테고리·부위, 스트레칭 등록·편집 */
import {STROKES} from '../../config.js';
import {esc,fmt} from '../../utils.js';
import {STR} from './store.js';

export function staffHtml(){
  const st=STR.st,partOpts=(sel,attr)=>STR.cats.map(c=>{const ps=STR.parts.filter(p=>p.cat_id===c.id);return ps.length?`<div class="muted small" style="margin-top:4px">${esc(c.name)}</div><div class="tagrow">${ps.map(p=>`<label class="tg"><input type="checkbox" ${sel(p.id)} ${attr(p.id)}> ${esc(p.name)}</label>`).join('')}</div>`:'';}).join('');
  const catsHtml=STR.cats.map(c=>`<div class="catbox"><div class="row"><b>${esc(c.name)}</b><button type="button" class="chipx" data-act="sxdelcat" data-id="${c.id}" aria-label="${esc(c.name)} 카테고리 삭제">삭제</button></div>
    <div class="row" style="flex-wrap:wrap;gap:6px">${STR.parts.filter(p=>p.cat_id===c.id).map(p=>`<span class="chip">${esc(p.name)} <button type="button" class="chipx" data-act="sxdelpart" data-id="${p.id}" aria-label="${esc(p.name)} 부위 삭제">×</button></span>`).join('')}
    <input class="mini-in" style="width:7.5rem;text-align:left" maxlength="12" placeholder="새 부위" data-sxnp="${c.id}"><button class="btn ghost sm" data-act="sxaddpart" data-id="${c.id}">추가</button></div></div>`).join('');
  const movesHtml=STR.moves.map(m=>{
    const open=st.open===m.id,tags=(m.part_ids||[]).map(STR.partName).filter(Boolean).join(' · ')||'부위 없음',sts=(m.strokes||[]).length?m.strokes.join('·'):'모든 영법';
    return `<div class="mvrow"><div class="row" style="flex-wrap:wrap;gap:6px"><input class="mini-in" style="width:12rem;text-align:left" data-sxm="${m.id}" data-f="name" value="${esc(m.name)}" aria-label="이름">
      <select class="mini-in" style="width:5.5rem;text-align:left" data-sxm="${m.id}" data-f="phase" aria-label="수업 전후">${[['pre','수업 전'],['post','수업 후'],['both','전·후']].map(([k,l])=>`<option value="${k}" ${m.phase===k?'selected':''}>${l}</option>`).join('')}</select>
      <input class="mini-in" style="width:4rem" type="number" min="5" max="600" data-sxm="${m.id}" data-f="sec" value="${m.sec}" aria-label="시간(초)"><span class="muted small">초</span>
      <input class="mini-in" style="width:13rem;text-align:left" data-sxm="${m.id}" data-f="url" value="${esc(m.url)}" placeholder="https://youtu.be/..." aria-label="영상 링크">
      <button class="btn ghost sm" data-act="sxopen" data-id="${m.id}">${open?'태그 닫기':'태그'}</button><button class="btn ghost sm" style="color:var(--danger)" data-act="sxdelmove" data-id="${m.id}">삭제</button></div>
      <div class="muted small" style="margin:2px 0 0">${esc(tags)} · ${esc(sts)}</div>
      ${open?`<div class="tagbox"><div class="muted small">부위</div>${partOpts(id=>(m.part_ids||[]).includes(id)?'checked':'',id=>`data-sxt="part" data-id="${m.id}" data-v="${id}"`)}<div class="muted small" style="margin-top:6px">영법 (아무것도 안 고르면 모든 영법)</div><div class="tagrow">${STROKES.map(s=>`<label class="tg"><input type="checkbox" ${(m.strokes||[]).includes(s)?'checked':''} data-sxt="stroke" data-id="${m.id}" data-v="${s}"> ${s}</label>`).join('')}</div></div>`:''}</div>`;}).join('');
  const feat=(scope,title)=>{const ids=STR.feat[scope];return `<section class="card"><h1 style="font-size:1.05rem">${title}</h1><p class="muted small" style="margin:0 0 8px">누르는 순서대로 회원 화면에 나와요. 누를 때마다 바로 저장돼요.</p>
    <div class="pchips">${STR.moves.map(m=>{const n=ids.indexOf(m.id);return `<button type="button" class="chip pc ${n>=0?'gold':''}" data-act="sxfeat" data-scope="${scope}" data-id="${m.id}">${n>=0?(n+1)+'. ':'+ '}${esc(m.name)}</button>`;}).join('')||'<span class="muted small">아래에서 스트레칭을 먼저 등록해 주세요</span>'}</div></section>`;};
  return `<div class="sect">${feat('week',`이번 주 추천 (${fmt(STR.weekKey())} 시작)`)}${feat('month',`이번 달 추천 (${+STR.monthKey().slice(5)}월)`)}
    <section class="card"><h1 style="font-size:1.05rem">카테고리와 부위</h1><p class="muted small" style="margin:0 0 8px">카테고리 안에 부위를 만들어요. 스트레칭에 부위를 달면 카테고리는 자동으로 따라가요.</p>${catsHtml}
      <div class="row" style="margin-top:10px"><input id="sx-nc" class="mini-in" style="width:10rem;text-align:left" maxlength="12" placeholder="새 카테고리"><button class="btn sm" data-act="sxaddcat">카테고리 추가</button></div></section>
    <section class="card"><h1 style="font-size:1.05rem">스트레칭 등록</h1>
      <div class="fgrid"><div><label for="sx-n">이름</label><input id="sx-n" class="txt" maxlength="60"></div><div><label for="sx-u">영상 링크 (유튜브)</label><input id="sx-u" class="txt" placeholder="https://youtu.be/..."></div></div>
      <div class="fgrid"><div><label for="sx-ph">수업 전/후</label><select id="sx-ph" class="txt"><option value="both">전·후 둘 다</option><option value="pre">수업 전</option><option value="post">수업 후</option></select></div><div><label for="sx-s">시간(초)</label><input id="sx-s" class="txt" type="number" min="5" max="600" value="60"></div></div>
      <div class="muted small" style="margin-top:8px">부위</div>${partOpts(()=>'',id=>`data-sxnewp="${id}"`)}
      <div class="muted small" style="margin-top:8px">영법 (아무것도 안 고르면 모든 영법)</div><div class="tagrow">${STROKES.map(s=>`<label class="tg"><input type="checkbox" data-sxnews="${s}"> ${s}</label>`).join('')}</div>
      <div class="row" style="margin-top:10px"><button class="btn" data-act="sxaddmove">스트레칭 추가</button></div></section>
    <section class="card"><h1 style="font-size:1.05rem">등록된 스트레칭 ${STR.moves.length}개</h1>${movesHtml||'<div class="empty">아직 없어요</div>'}</section></div>`;
}
