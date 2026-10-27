/* 총괄 선생님 "종목" 탭: 레벨별 목표 개수, 준비물, 새 종목 */
import {esc} from '../../utils.js';
import {D,exLabel} from '../../state.js';

export function staffExercises(){
  return `<div class="sect"><section class="card"><p class="sh3">종목별 레벨 목표 개수 (세트당)와 다음 레벨 안내 기준</p><div class="tw"><table class="plan"><thead><tr><th>종목</th><th>Lv1</th><th>Lv2</th><th>Lv3</th><th>Lv4</th><th>Lv5</th><th>안내 %</th></tr></thead><tbody>
   ${D.exList.map(e=>`<tr><td>${esc(e.cat)} · ${esc(e.name)}</td>${[1,2,3,4,5].map(l=>`<td><input class="mini-in" type="number" min="1" data-ex="${e.key}" data-lv="${l}" value="${e.targets[l]}" aria-label="${esc(e.name)} Lv${l} 목표"></td>`).join('')}<td><input class="mini-in" type="number" min="100" max="300" data-exp="${e.key}" value="${e.promo_pct}" aria-label="${esc(e.name)} 안내 기준"></td></tr>`).join('')}</tbody></table></div></section>
   <section class="card"><p class="sh3">레벨별 준비물 (종류를 고르고 내용을 적어요. 예: 무게 · 0kg / 밴드 · 노랑)</p><div class="tw"><table class="plan"><thead><tr><th>종목</th>${[1,2,3,4,5].map(l=>`<th>Lv${l}</th>`).join('')}</tr></thead><tbody>
   ${D.exList.map(e=>`<tr><td>${esc(exLabel(e))}</td>${[1,2,3,4,5].map(l=>{const x=(e.level_desc&&e.level_desc[l])||{};return `<td><select class="mini-in" style="width:5.2rem;text-align:left" data-ldt="${e.key}" data-lv="${l}" aria-label="${esc(e.name)} Lv${l} 준비물 종류"><option value="">—</option>${D.gear.concat(x.t&&!D.gear.includes(x.t)?[x.t]:[]).map(g=>`<option ${g===x.t?'selected':''}>${esc(g)}</option>`).join('')}</select><input class="mini-in" style="width:5.2rem;text-align:left" type="text" maxlength="20" data-ldv="${e.key}" data-lv="${l}" value="${esc(x.v||'')}" placeholder="0kg" aria-label="${esc(e.name)} Lv${l} 준비물 내용"></td>`;}).join('')}</tr>`).join('')}</tbody></table></div>
   <div class="row" style="margin-top:10px;flex-wrap:wrap"><span class="muted">준비물 종류:</span>${D.gear.map(g=>`<span class="chip">${esc(g)} <button type="button" class="chipx" data-act="delgear" data-g="${esc(g)}" aria-label="${esc(g)} 종류 삭제">×</button></span>`).join('')}<input id="ng" class="mini-in" style="width:8rem;text-align:left" maxlength="10" placeholder="새 종류 (예: 박스)"><button class="btn sm" data-act="addgear">추가</button></div></section>
   <section class="card"><h1 style="font-size:1.1rem">종목 추가</h1><div class="stack"><div class="fgrid"><div><label for="ne-cat">구분 (예: CORE)</label><input id="ne-cat" class="txt"></div><div><label for="ne-name">이름 (예: ABS)</label><input id="ne-name" class="txt"></div></div>
   <div class="row">${[1,2,3,4,5].map(l=>`<div><label for="ne-${l}">Lv${l} 목표</label><input id="ne-${l}" class="mini-in" type="number" min="1" value="12"></div>`).join('')}</div>
   <div class="row"><button class="btn" data-act="addex">종목 추가</button></div></div></section></div>`;
}
