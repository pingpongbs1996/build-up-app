# BUILD UP — 수영 클래스 기록 관리

수영 수업(BUILD UP in CLOSED-CLASS)의 **지상운동 · 수영 페이스 기록**을 회원과 선생님이 함께 관리하는 모바일 우선 웹앱(PWA)입니다.
빌드 단계 없이 정적 파일만으로 동작하고, 데이터는 [Supabase](https://supabase.com)에 저장합니다.

## 주요 기능

| 대상 | 기능 |
|------|------|
| 회원 | 이름 검색 → PIN 로그인, 수업 날짜별 지상운동(세트·레벨)·수영(라운드·REP 페이스) 입력, 지난번과 비교, 기간별 변화 그래프, 선생님 코멘트·SELF PREP 확인, 수업 리포트 PNG 저장, 스트레칭 연속 재생 |
| 담당 선생님 | 수업 날짜별 참여 회원 입력 현황, 회원 대신 기록 입력, 코멘트·SELF PREP 작성, 회원별 기록 조회, 스트레칭 등록·추천 |
| 총괄 선생님 | 위 기능 + 회원 등록/삭제/비밀번호 초기화, 달·수업 날짜·참여자 설정, 종목별 레벨 목표·준비물 관리 |

## 실행

ES 모듈을 쓰기 때문에 `index.html`을 더블클릭(`file://`)하면 동작하지 않습니다. 간단한 정적 서버로 여세요.

```bash
python -m http.server 8080      # 그 다음 http://localhost:8080
```

배포는 `index.html`이 있는 폴더 전체를 HTTPS 정적 호스팅(GitHub Pages, Netlify, Cloudflare Pages 등)에 올리면 됩니다.

## 폴더 구조

```
index.html              진입 HTML (supabase-js는 CDN, 앱은 src/main.js 모듈)
manifest.webmanifest    PWA 설정
assets/                 로고 · 아이콘
css/style.css           전체 스타일
src/
├─ main.js              시작점: 이벤트 연결 → 로그인 상태에 따라 첫 화면
├─ events.js            전역 이벤트 위임 (click / input / change / submit / resize)
├─ config.js            상수 (Supabase 공개 키, 영법, 시리즈 구성, 에셋 경로)
├─ state.js             앱 상태 S · 서버 데이터 D · 열린 입력 폼 form + 조회 함수
├─ utils.js             DOM·날짜·숫자·포맷 순수 도우미
├─ api/
│  ├─ client.js         Supabase 클라이언트, q(), 에러 메시지 변환
│  └─ repo.js           데이터 읽기/쓰기 (loadBase, loadMem, loadRoster, saveMM …)
├─ ui/
│  ├─ toast.js          토스트, guard()
│  └─ components.js     여러 화면이 쓰는 HTML 조각 (로고, 코멘트, SELF PREP …)
├─ views/               "무엇을 그릴지" — 상태를 읽어 HTML을 만든다
│  ├─ login.js          이름 검색 / PIN / 선생님 로그인 / 첫 비밀번호 변경
│  ├─ member.js         회원 메인 화면
│  ├─ entry-form.js     기록 입력 폼 (회원·선생님 공용)
│  ├─ charts.js         지상운동·수영 SVG 그래프
│  └─ staff/            선생님 화면: index(탭 틀) + class / records / moves / members / months / exercises
├─ actions/             "무엇이 일어나는지" — data-act 이름 → 동작 (서버 저장 후 화면 갱신)
│  ├─ auth.js           로그인·로그아웃·라우팅
│  ├─ entry.js          날짜 선택, 레벨/세트 조작, 기록 저장
│  ├─ staff.js          회원·달·수업·종목·준비물 관리
│  ├─ staff-change.js   선생님 화면 입력칸 즉시 저장 규칙
│  ├─ session-notes.js  코멘트 · SELF PREP · 리포트 이미지
│  └─ stretch.js        스트레칭 동작
└─ features/
   ├─ stretch/          store(데이터·규칙) / member-view / staff-view / player(타이머)
   └─ report/           data(리포트용 값 추출) / canvas(PNG 그리기)
```

### 설계 원칙

- **의존 방향은 한쪽으로만**: `main → events → actions → views → ui / state / api → utils / config`.
  views는 actions를 import하지 않으므로 순환 의존이 없습니다.
- **화면 이동은 data 속성으로**: 버튼에 `data-act="save"`를 달면 `events.js`가 같은 이름의 액션을 찾아 실행합니다.
  새 기능은 (1) view에 버튼 추가 → (2) `actions/*`에 같은 이름 함수 추가, 이 두 곳만 고치면 됩니다.
- **상태는 `state.js` 한곳**: `S`(화면 상태), `D`(서버 데이터 캐시), `form.cur`(지금 열린 입력 폼).
- **사용자 입력은 항상 `esc()`로 이스케이프**해서 HTML에 넣습니다. 링크는 `safeUrl()`로 http(s)만 허용합니다.

## 데이터 (Supabase)

| 테이블 | 용도 |
|--------|------|
| `profiles` | 회원/선생님 (`role`: member / boss / 그 외 선생님), `must_change`, `base_count` |
| `months`, `month_exercises`, `sessions`, `session_members` | 달 · 종목 구성 · 수업 날짜 · 참여자 |
| `member_month`, `member_pb`, `member_pb_log` | 달별 영법/시리즈/목표, PB·목표 페이스·사이클과 변경 기록 |
| `exercises`, `gear_types` | 종목(레벨별 목표·준비물), 준비물 종류 |
| `dry_logs`, `swim_logs` | 지상운동 · 수영 기록 |
| `session_comments`, `session_preps`, `prep_moves` | 코멘트, SELF PREP, 동작 목록 |
| `stretch_cats / parts / moves / featured` | 스트레칭 분류·동작·주/월 추천 |

RPC: `search_members`, `admin_add_members`, `admin_set_active`, `admin_delete_member`, `admin_reset_password`, `clear_must_change`.
**접근 제어는 Supabase RLS가 담당**합니다(미래 날짜 수업 잠금 포함). 화면 코드의 권한 체크는 편의용일 뿐입니다.

## 로그인 방식

- 회원: 이름 검색 → 숫자 4~6자리 PIN. 내부적으로 `m-{id}@members.example.com` / `bu-{PIN}` 계정으로 로그인합니다. 첫 비밀번호는 전화번호 뒤 4자리이며 첫 로그인 때 변경하게 됩니다.
- 선생님: 이메일 + 비밀번호.

## 알려진 제약 / 개선 후보

코드 리뷰에서 확인했지만 동작 변경이 필요해 이번 리팩토링에서는 **고치지 않은** 항목입니다.

1. **PIN 오입력 5회 잠금은 브라우저에서만 센다.** 새로고침하면 초기화되므로 서버(Supabase Auth)의 속도 제한에 의존합니다. 4자리 PIN은 무차별 대입에 약해 서버 측 시도 제한(또는 더 긴 비밀번호)이 필요합니다.
2. **기록을 비워서 저장해도 삭제되지 않는다.** `saveForm`은 값이 있는 종목/시리즈만 upsert 합니다.
3. **선생님 화면에서 PB·목표 등을 고치면 폼이 다시 그려져 저장 전 입력값이 사라진다.** (`staff-change.js` 후 `renderStaff()`)
4. 서비스 워커가 없어 PWA 매니페스트만 있고 오프라인은 지원하지 않습니다.
5. 외부 스크립트(supabase-js CDN)에 SRI 해시가 없습니다.
6. 자동 테스트가 없습니다. 순수 함수(`utils.js`, `state.js`의 `nthAt`, `store.js`의 `cands`)부터 테스트를 붙이기 좋습니다.

## 개발자

- GitHub: [@pingpongbs1996](https://github.com/pingpongbs1996)
- 저장소: [pingpongbs1996/build-up-app](https://github.com/pingpongbs1996/build-up-app)
