/* 총괄 선생님 "회원" 탭: 등록, 활동 여부, 비밀번호 초기화, 삭제 */
import {esc} from '../../utils.js';
import {D} from '../../state.js';

export function staffMembers(){
  return `<div class="sect"><section class="card"><h1 style="font-size:1.1rem">회원 등록</h1>
   <p class="muted small" style="margin:0 0 10px">한 줄에 한 명씩 "이름, 전화번호"로 적어 주세요. 엑셀에서 두 칸을 복사해 붙여넣어도 돼요. 끝에 ", 이전 참여 횟수"를 붙일 수도 있어요. 첫 비밀번호는 전화번호 뒤 4자리예요.</p>
   <textarea id="bulk" class="txt" placeholder="김민수, 010-1234-5678&#10;이서연, 010-2345-6789, 3"></textarea>
   <div class="row" style="margin-top:10px"><button class="btn" data-act="addmembers">등록하기</button></div></section>
   <section class="card"><h1 style="font-size:1.1rem">회원 ${D.members.length}명</h1>
   <div class="tw"><table class="plan"><thead><tr><th>이름</th><th>전화(가운데)</th><th>이전 참여</th><th>상태</th><th>비밀번호</th><th>삭제</th></tr></thead><tbody>
   ${D.members.map(m=>`<tr><td>${esc(m.name)}${m.must_change?' <span class="pill none">첫 로그인 전</span>':''}</td><td>${esc(m.phone_mid)}</td><td><input class="mini-in" type="number" min="0" value="${m.base_count}" data-base="${m.id}" aria-label="${esc(m.name)} 이전 참여 횟수"></td><td><button class="btn ghost sm" data-act="toggleactive" data-id="${m.id}">${m.active?'활동 중':'쉬는 중'}</button></td><td><span class="row" style="flex-wrap:nowrap"><input class="mini-in" inputmode="numeric" maxlength="4" placeholder="뒤4자리" data-rp="${m.id}" aria-label="${esc(m.name)} 새 비밀번호(전화번호 뒤 4자리)"><button class="btn ghost sm" data-act="resetpw" data-id="${m.id}">초기화</button></span></td><td><button class="btn ghost sm" style="color:var(--danger)" data-act="delmember" data-id="${m.id}">삭제</button></td></tr>`).join('')||'<tr><td colspan="6" class="muted">아직 등록된 회원이 없어요</td></tr>'}
   </tbody></table></div></section></div>`;
}
