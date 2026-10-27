/* 선생님 "동작" 탭: SELF PREP에 쓸 동작 등록 */
import {esc} from '../../utils.js';
import {D} from '../../state.js';

export function staffMoves(){
  const rows=D.moves.map(m=>`<tr><td>${m.kind==='dry'?'dryland':'swim'}</td><td><input class="mini-in" style="width:11rem;text-align:left" data-pm="${m.id}" data-f="name" value="${esc(m.name)}" aria-label="동작 이름"></td><td><input class="mini-in" style="width:10rem;text-align:left" data-pm="${m.id}" data-f="amount" value="${esc(m.amount)}" aria-label="기본 분량"></td><td><input class="mini-in" style="width:14rem;text-align:left" data-pm="${m.id}" data-f="video_url" value="${esc(m.video_url)}" placeholder="https://youtu.be/..." aria-label="영상 링크"></td><td><button class="btn ghost sm" style="color:var(--danger)" data-act="delmove" data-id="${m.id}">삭제</button></td></tr>`).join('');
  return `<div class="sect"><section class="card"><h1 style="font-size:1.1rem">SELF PREP 동작 등록</h1><p class="muted small" style="margin:0 0 10px">여기에 등록해 둔 동작을 수업 화면에서 버튼으로 눌러 담아요. 영상 링크를 넣으면 회원이 동작 옆 "▶ 영상"을 눌러 볼 수 있어요.</p>
   <div class="fgrid"><div><label for="nm-k">구분</label><select id="nm-k" class="txt"><option value="dry">dryland</option><option value="swim">swim</option></select></div><div><label for="nm-n">동작 이름</label><input id="nm-n" class="txt" maxlength="60"></div></div>
   <div class="fgrid"><div><label for="nm-a">기본 분량 (예: 15개, 2세트)</label><input id="nm-a" class="txt" maxlength="60"></div><div><label for="nm-u">영상 링크 (선택)</label><input id="nm-u" class="txt" placeholder="https://youtu.be/..."></div></div>
   <div class="row" style="margin-top:10px"><button class="btn" data-act="addmove">동작 추가</button></div></section>
   <section class="card"><h1 style="font-size:1.1rem">등록된 동작 ${D.moves.length}개</h1><div class="tw"><table class="plan"><thead><tr><th>구분</th><th>이름</th><th>기본 분량</th><th>영상 링크</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="5" class="muted">아직 없어요</td></tr>'}</tbody></table></div></section></div>`;
}
