# 공통 디자인 연결 방법 (절곡B · 공간B · 노무B 사이트용)

2026-11-07 사용자 결정: 네 서비스의 색 · 이름 표기 · 선 아이콘은 **이음B(eeum.bid) 한 곳**에서 관리한다.
각 사이트는 복사본(`brand/`) 대신 eeum.bid의 공통 파일을 **직접 불러온다**. 그러면 이음B 관리자 화면
(https://eeum.bid/admin/ · 색 탭)에서 저장하거나 이음B 세션이 push하면 네 사이트가 함께 바뀐다.

**2026-11-08 이름 · 주소 변경(사용자):** 연결B → **이음B**(이음 브릿지 · Eeum Bridge), y-bridge.site → **eeum.bid**.
- 불러오는 주소를 `https://y-bridge.site/brand/…` → `https://eeum.bid/brand/…`로 바꾼다. 예전 주소의 `/brand/*`도 당분간 그대로 나오지만(다른 주소는 eeum.bid로 넘어감) 새 주소를 쓴다.
- 화면 · 바닥글 · 안내 글의 `연결B` · `연결 브릿지` · `y-bridge.site`도 `이음B` · `이음 브릿지` · `eeum.bid`로. 이름 표기는 `.wm yb` 그대로(클래스 이름은 안 바뀜), 글자만 `<span class="w">이음</span><span class="B">B</span>`.
원본: `D:\OneDrive\AI PROJECT\yeongyeolb\brand\tokens.css` (값은 여기서만 고침)

**규칙은 이음B가 최우선** (2026-11-07 사용자): 공통 규칙(색 · 이름 표기 · 아이콘)은 이음B가 정하고 각 서비스는 그대로 따른다.
자기 사이트 규칙과 부딪히면 이음B 규칙이 이긴다. 시제품 판(v2 · v3 등)과 상관없이 사이트의 모든 페이지에 적용한다.

## 한 번만 할 일 (각 서비스 세션이 자기 폴더에서)
1. 모든 페이지 `<head>`에서 **자기 CSS보다 먼저** 불러오기
   ```html
   <link rel="stylesheet" href="https://eeum.bid/brand/tokens.css">
   ```
   - 다른 주소에서 불러가도 되게 허용(CORS)돼 있고, 바뀌면 바로 보이도록 매번 새로 확인한다(저장본 안 씀).
   - tokens.css 안에서 Pretendard 글꼴도 불러온다.
2. 자기 CSS에 **직접 적힌 서비스 색**을 공통 색 이름으로 바꾸기 (아래 표). 바뀐 뒤 화면이 그대로인지 PC · 폰 너비로 확인.
3. 이름 표기(○○B)는 공통 클래스로: `<span class="wm nm"><span class="w">노무</span><span class="B">B</span></span>`
   (연결 `yb` · 공간 `gg` · 절곡 `bb` · 노무 `nm`). 진한 단추 위는 `.on-dark` 안에 넣으면 밝은 B.
   - tokens.css의 `.wm`은 `font-weight:800`이다. 둘레 글자 굵기를 따르게 하려면 자기 CSS에 `.wm{font-weight:inherit;letter-spacing:inherit}.wm .B{font-weight:800}`
4. 선 아이콘: `https://eeum.bid/brand/icons/이름.svg` (yeongyeolb · gonggan · bending · nomu · panel-3d · sus-window · arrow-right · external · value-*)
   인라인 svg로 쓰고 있으면 그대로 둬도 됨(모양이 같으면).
5. 폴더의 `brand/` 복사본은 지우지 말고 두되(오프라인 · 시험용), 화면은 eeum.bid 것을 쓰게.

## 공통 색 이름 (tokens.css :root)
| 쓰임 | 공간B | 절곡B | 노무B |
|---|---|---|---|
| 이름 글자 | `--gg-name` | `--bb-name` | `--nm-name` |
| 대표색 | `--gg` | `--bb` | `--nm` |
| 진한 글자 | `--gg-ink` | `--bb-ink` | `--nm-ink` |
| 옅은 바탕 | `--gg-soft` | `--bb-soft` | `--nm-soft` |
| 단추 | `--gg-btn` | `--bb-btn` | `--nm-btn` |
| 그 밖 | `--gg-glow` | `--bb-glow`, `--copper`, `--copper-soft`, `--bb-panel`(-soft) 3D 판넬, `--bb-sus`(-soft) 스텐창호 | `--nm-line`, `--nm-tag`, `--nm-tag-ink` |

공통: `--ink` `--muted` `--faint` `--line` `--bg` `--card` `--hub` · B 글자 `--b1` `--b2` `--b3` → `--b-grad` / 진한 바탕 위 `--b-grad-on-dark`
· 모양 `--radius` `--radius-sm` `--pill` `--shadow` `--font` · 단추 `--btn-h` `--btn-h-sm` `--btn-h-lg` `--btn-px` `--btn-fs` `--btn-fs-sm` `--btn-fs-lg` `--btn-r` `--btn-r-sq` `--btn-fw`

## 단추 모양 (2026-11-08 사용자: 관리자 화면에서 고친 값이 다른 B들에도 적용)
이음B 관리자 화면 '색 · 단추' 탭에서 단추 높이 · 모서리 · 글자 크기를 고치면 tokens.css의 `--btn-*` 값이 바뀐다.
자기 사이트의 **주요 단추**(머리줄 · 첫 화면 · 카드 · 폼 보내기 · 로그인 등)가 이 값을 쓰게 한다.
```css
.btn{height:var(--btn-h);padding:0 var(--btn-px);border-radius:var(--btn-r);font-size:var(--btn-fs);font-weight:var(--btn-fw)}
.btn.sm{height:var(--btn-h-sm);font-size:var(--btn-fs-sm)}   /* 작은 단추(머리줄처럼 자리가 좁은 곳) */
.btn.lg{height:var(--btn-h-lg);font-size:var(--btn-fs-lg)}   /* 큰 단추 */
.btn.sq{border-radius:var(--btn-r-sq)}                        /* 네모 단추 */
```
- 클래스 이름은 자기 사이트 것 그대로 두고 값만 `var(--btn-…)`로 바꾸면 된다(예: `.button-primary{height:var(--btn-h)}`).
- 표 안 · 편집 도구(3D 편집기 · 도면 도구 등)의 작은 단추는 그대로 둬도 된다.
- 폰에서 누르는 칸 44px 아래로 줄어들면 위아래 여백으로 채운다(공통 규칙 3).
- 단추 색은 지금처럼 서비스 단추 색(`--gg-btn` · `--bb-btn` · `--nm-btn`)을 쓴다.

## 파비콘 (2026-11-08 사용자: "모든 비에 파비콘 — 이음비에 있는 각각의 시그니쳐 마크")
이음B 첫 화면의 마크 칸(흰 칸 + 서비스 색 선 아이콘)과 같은 모양. 원본 `brand/favicon/`(만들기 `tools/make-favicons.cjs`), 이름 = eeum · gonggan · bending · nomu.
모든 페이지 `<head>`에(자기 이름으로):
```html
<link rel="icon" href="https://eeum.bid/brand/favicon/bending.svg" type="image/svg+xml">
<link rel="icon" href="https://eeum.bid/brand/favicon/bending-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="https://eeum.bid/brand/favicon/bending-180.png">
```
- 주소창이 `/favicon.ico`를 따로 찾으므로, 자기 `brand/favicon/<이름>.ico`(복사본)를 사이트 맨 위 `/favicon.ico`로도 내보낸다(Next면 `app/favicon.ico`).
- 앱 · 홈 화면 아이콘이 필요하면 `<이름>-192.png` · `<이름>-512.png`.
- 예전 파비콘(다른 그림)이 있으면 지운다. 마크가 바뀌면 이음B가 다시 만들어 알림.

## 관리자 한 번 로그인 (2026-11-08 사용자 — 공통 규칙 1 "관리자 로그인만 이음B 하나로")
이음B 관리자 화면(https://eeum.bid/admin/) 위쪽 [공간B] · [절곡B] · [노무B]를 누르면, 이음B가 그 서비스용 **1분짜리 1회용 입장권**을 만들어
`POST https://<서비스 주소>/api/eeum-sso` (폼 칸 `t`)로 보낸다. 서비스는 아래처럼 확인하고 자기 관리자 세션을 만든다.
- 받는 주소: `POST /api/eeum-sso` (Content-Type `application/x-www-form-urlencoded`, 칸 `t`). GET은 405. 보낸 쪽 Origin은 `https://eeum.bid`.
- 입장권 `t` = `base64url(JSON).base64url(서명)` — 서명은 앞부분 글자 그대로(base64url 문자열)에 대한 **Ed25519**.
- 공개 열쇠: https://eeum.bid/sso-public.jwk.json 의 `keys[0]` (`kty OKP · crv Ed25519 · x …`). 비밀 아님 — 코드에 넣어 두기를 권장(열쇠를 바꾸면 이음B 세션이 알림).
- 확인할 것(하나라도 틀리면 401, 자기 관리자 로그인 화면 링크): 서명 맞음 · `iss`=`eeum.bid` · `sub`=`eeum-admin` · `aud`=**자기 주소**(`gonggan.bid` · `bending.bid` · `nomu.bid`) · `exp` 안 지남(시계 오차 30초) · `exp-iat` ≤ 120 · `jti`(32자리 16진수)를 **처음 씀**(쓴 jti는 exp까지 기억 — KV · DB 표 등).
- 통과하면: 자기 관리자 세션(쿠키 등, 자기 방식 그대로)을 만들고 `303`으로 자기 관리자 화면. 들어온 기록(시각 · jti)을 남기면 좋음.
- 예시 코드(Workers · Node 20+ · Next 서버 공통 WebCrypto): 이음B 저장소 `tools/sso-verify-example.js` 의 `verifyEeumTicket()` — 그대로 복사해 써도 됨.
- Supabase로 관리자 세션을 만들면: service_role이 관리자 표(profiles 등)를 읽을 권한이 있는지 확인(새 표 자동 권한이 꺼진 프로젝트는 GRANT 필요 — 11/08 절곡B가 "관리자 계정이 없습니다"로 한 번 막혔다가 읽기 권한만 줘서 해결).
- 원래 관리자 로그인(아이디 · 비밀번호)은 지우지 말고 예비로 둔다. 관리자 비밀값 · 세션 열쇠는 지금처럼 자기 것.

## 구독 · 결제 기준 (2026-11-08 사용자: "이음비에서 각각의 비의 구독, 결재 관련 기준을 수정, 관리")
값의 **원본은 각 서비스 DB**(결제가 거기서 돌기 때문). 이음B 관리자 화면 [구독 · 결제] 탭이 서비스의 `/api/eeum-billing`을 읽고 저장한다.
**기준만** 여기서(요금제 가격 · 판매 여부 · 행사 할인 · 무료 기간 · 무료 등급 · 한도 · 토큰 수 · 예치 금액 · 입금 계좌 · 환불 규정 등). 회원 한 명의 등급 · 만료일 · 입금 확인은 계속 서비스 관리자에서.
- 요청: 머리값 `Authorization: Eeum <입장권>`. 입장권은 관리자 한 번 로그인과 같은 열쇠 · 꼴인데 `sub`=`eeum-billing`, `act`=`billing-read`(GET) | `billing-write`(POST), POST는 `bh`=base64url(SHA-256(본문 글자 그대로)).
  확인 코드: 이음B `tools/sso-verify-example.js`의 `verifyEeumCall(머리값, {aud, jwk, used, method, rawBody})` — 본문은 `req.text()`로 글자 그대로 받아 넘긴 뒤 JSON.parse. jti 1회용 기록은 로그인과 같은 곳을 써도 됨.
- `GET /api/eeum-billing` → 200 JSON:
```json
{ "rev": "지금 값의 판(바뀔 때마다 달라지는 글자, 예: 마지막 수정 시각)",
  "groups": [{ "id": "plans", "title": "요금제", "note": "금액은 부가세 포함" }],
  "fields": [{ "key": "plans.monthly.price", "group": "plans", "label": "일반 월 요금", "type": "money", "unit": "원",
               "min": 0, "max": 10000000, "step": 100, "applies": "다음 신청부터", "help": "", "readonly": false }],
  "values": { "plans.monthly.price": 33000 },
  "log": [{ "at": "2026-11-08T12:00:00Z", "by": "eeum-admin", "changes": { "plans.monthly.price": [33000, 35000] } }] }
```
  - `type`: `money` · `int` · `percent` · `days` · `number`(숫자) / `text` / `bool` / `select`(+`options:[{v,t}]`) / `date`(YYYY-MM-DD). `applies` = 바꾸면 언제부터 적용되는지(사용자가 저장 전에 봄). `log`는 최근 10개(없어도 됨).
  - 칸 이름(key)은 자기 마음대로(영문 · 숫자 · `. _ : -`, 80자 안). 이음B 화면은 이 목록대로 그린다 — 칸을 늘리거나 빼면 이음B를 고칠 필요 없음.
- `POST /api/eeum-billing` 본문 `{"rev": "...", "changes": {"키": 값}}` → 확인 뒤 한꺼번에 저장 → GET과 같은 꼴로 새 값 · 새 rev 응답.
  - rev가 지금과 다르면 409(그사이 바뀜) · 없는 칸 · 형식 · 범위가 틀리면 400 `{"error":"한국어 문구"}` · 입장권이 틀리면 401. readonly 칸은 거절.
  - 바꾼 기록(시각 · 칸 · 전 값 → 새 값)을 서비스 DB에 남긴다. 금액은 원 단위 정수.
- 이음B는 서비스가 만들었다고 알리면 `worker.js` BILLING 표를 true로 바꾼다. 그 전엔 탭에 "연결 준비 중" + 그 서비스 관리자 단추.

### 구독 · 결제 공통 꼴 (2026-11-19 사용자 "각각의 비가 기본적으로 구독, 요금제는 동일한 형태로 관리되게 하고 공간비처럼 보기 금액처럼 제한되는 옵션만 밑에 설정하는 칸")
모든 서비스가 **같은 세 묶음**을 이 순서로 내려 준다. 이음B 화면은 요금제를 요금제 하나에 두 줄(이름 · 판매 / 금액 · 기간 · 결제 · 대상 역할)로, 미리보기는 요금제 카드로 그린다.
1. 묶음 `plans` "요금제" — 요금제마다 아래 칸(`<id>`는 그 서비스가 정함, 예: 노무B worker · leader · manager · manager_year)
| 칸(key) | type | 뜻 |
|---|---|---|
| `plans.<id>.name` | text | 요금제 이름(회원에게 보이는 이름) |
| `plans.<id>.on` | bool | 판매 중(끄면 새로 가입 못 함, 기존 구독은 그대로) |
| `plans.<id>.price` | money | 금액(원, 부가세 포함) — `applies`(예: 다음 신청부터) 적기 |
| `plans.<id>.period` | select | `month` 월 · `year` 연 · `once` 1회 |
| `plans.<id>.pay` | select | `play` 앱 결제(Google Play) · `card` 카드(웹) · `invoice` 세금계산서 · `bank` 계좌입금 |
| `plans.<id>.role` | select | 대상 역할(`all` 또는 통합 회원 역할 키) — 없어도 됨 |
| `plans.<id>.invoice` | bool | **세금계산서로도 살 수 있음**(사업자, 앱 밖 결제 · 입금 확인 뒤 사용 중) |
| `plans.<id>.invoice_price` | money | 세금계산서 금액(원, 부가세 포함) |
| `plans.<id>.invoice_period` | select | `year` 연 · `month` 월 |
| `plans.<id>.opt.<이름>` | 자유 | **이 요금제에 따른 옵션**(예: 현장 수 · 팀원 수 · 출력 한도 · 보기 횟수). 서비스마다 따로 정함 |
| `plans.trial_days` | days | 무료 체험 기간(일) — 서비스에 하나 |
- (2026-11-19 사용자 "요금제도 우선 기본은 다 똑같은 방식 … 구독, 세금 계산서, 할인 기간, 할인 명칭, 설정을 각각 비마다 다르게 할 수 있으면 되는 거야. 그리고 각각의 비마다 별도 요금제에 따른 옵션은 각각 따로따로 설정 … 보이는 화면도 … 같은 스타일로 통일") → 요금제 하나 = **구독**(price · period · pay) + **세금계산서**(invoice · invoice_price · invoice_period) + **이 요금제 옵션**(opt.*). 같은 요금제를 연간 세금계산서용으로 따로 만들지 않는다(예: 노무B manager_year → manager의 invoice 칸). 요금제와 상관없는 서비스 전체 제한만 `options`.
- 이음B 관리자 화면은 요금제마다 '이름 · 판매 · 대상 / 구독 / 세금계산서 / 이 요금제 옵션' 네 줄로 똑같이 그린다(서비스마다 칸이 없으면 그 줄만 빠짐).
2. 묶음 `discount` "기간 할인" — 아래 "기간 할인 공통 칸" 그대로.
3. 묶음 `options` "서비스 옵션 · 제한" — **그 서비스만의 제한 · 옵션**(예: 공간B 견적 보기 금액 · 열람 기간, 절곡B 출력 한도 · AI 토큰, 노무B 체험 현장 수). 칸 이름은 `options.` 으로 시작, type은 자유. 입금 계좌 · 환불 규정 같은 결제 안내도 여기(또는 묶음을 하나 더 두되 `plans` · `discount` 뒤에).
- 옛 칸 이름(예: `tier.free.trialDays`, `plans.worker.price`만 있는 꼴)을 쓰던 서비스는 이 꼴로 옮긴다 — 옮길 때 DB 값도 같이 옮기고, 결제 코드가 새 칸에서 읽게.

### 기간 할인 공통 칸 (2026-11-19 사용자 "이음비 관리자 화면에서 기간 할인 설정해서 할 수도 있도록")
모든 서비스가 같은 칸 이름으로 내려 주면 이음B [구독 · 결제] 탭에서 똑같이 고친다(이음B 화면은 고칠 것 없음 — 위 fields 목록대로 그림). 묶음 id `discount`, 제목 "기간 할인". 여러 개면 `discount2.*` · `discount3.*`.
| 칸(key) | type | 뜻 |
|---|---|---|
| `discount.on` | bool | 할인 켜기 |
| `discount.label` | text | 화면에 보일 이름(예: 출시 기념 할인) |
| `discount.pct` | percent | 할인율(0~90) |
| `discount.from` · `discount.to` | date | 시작일 · 끝나는 날(그날 끝까지, 한국 시간) |
| `discount.target` | select | 적용 대상: `all` 전체 또는 그 서비스의 요금제 · 역할 키(예: 노무B `worker` · `leader` · `manager` · `manager_year`) |
| `discount.who` | select | `new` 새로 구독하는 사람만 · `all` 기존 구독 갱신 포함 |
| `discount.pct.<요금제 id>` | percent | **요금제마다 따로 할인율**(0~90, 0 = 그 요금제는 할인 없음). 예: 노무B `discount.pct.worker` · `discount.pct.leader` · `discount.pct.manager` |
- **요금제별 할인율**(2026-11-28 사용자 "할인률이 각각 3명에게 되게해"): 한 할인(이름 · 기간 · 대상 사용자는 하나)에서 요금제마다 할인율을 다르게 넣는다. 서비스가 `discount.pct.<id>` 칸을 하나라도 내려 주면 그 칸들이 할인율이고, `discount.pct` · `discount.target`은 내려 주지 않는다(같이 오면 이음B 화면은 요금제별 칸을 씀). 칸 이름(label)은 "팀원 할인율"처럼 요금제 이름을 앞에. 세금계산서 금액에도 그 요금제 할인율을 씀.
- 서비스는 결제 금액을 낼 때 오늘이 from~to 안이고 on이면 `원래 금액 × (1 − 할인율/100)`을 원 단위로 내림(할인율 = 요금제별 칸이 있으면 그 값, 없으면 pct + target). 화면에는 원래 금액 줄 긋기 + 할인 금액 + 끝나는 날.
- **안드로이드 앱 안 구독(Google Play 결제)은 서버 값만으로 값이 바뀌지 않는다**: Play 콘솔(또는 Android Publisher API)의 기본 요금제 · 혜택(offer)으로 만들어야 결제창 금액이 바뀜. 서비스는 이 칸이 바뀌면 Play 혜택을 맞추거나(API), 못 하면 이음B 화면 `help`에 "앱 결제는 Play 콘솔에서도 같이 바꿔야 함"을 적는다. 웹 결제 · 세금계산서 결제는 서비스 값 그대로.

## 운영 현황 · 관리 기능 연결 (2026-11-08 사용자: "각각의 비들의 관리자가 할수있는 기능과 정보를 연결")
이음B 관리자 [운영 현황] 탭(관리자 화면 첫 탭)이 세 서비스의 숫자 · 처리할 일 · 최근 목록 · 관리 메뉴를 한 화면에 보여 준다. 항목을 누르면 관리자 한 번 로그인으로 **그 서비스 관리자의 바로 그 화면**이 열린다.
- `GET /api/eeum-admin` — 입장권은 구독 · 결제와 같은 꼴, `sub`=`eeum-info` · `act`=`info-read`. 확인: `verifyEeumCall(머리값, {aud, jwk, used, method:'GET', sub:'eeum-info', act:'info-read'})`.
- 응답(모두 선택, 없는 묶음은 안 보임):
```json
{ "updated": "2026-11-08T13:00:00Z",
  "stats": [{ "key": "members", "label": "전체 회원", "value": 128, "unit": "명", "hint": "발주자 90 · 생산자 38", "link": "/admin#members" }],
  "todo":  [{ "key": "pay", "label": "입금 확인 대기", "count": 3, "level": "warn", "link": "/admin#payments" }],
  "lists": [{ "title": "최근 가입", "items": [{ "title": "한결금속", "sub": "생산자", "at": "2026-11-08T09:12:00Z", "link": "/admin#members" }] }],
  "menu":  [{ "label": "회원 관리", "desc": "등급 · 만료일 · 정지", "link": "/admin#members" }] }
```
  - `link` = 자기 사이트 안 경로(`/`로 시작, `//` · 역슬래시 · 빈칸 · 한글 안 됨 — 필요하면 퍼센트 인코딩). 관리자가 할 수 있는 **기능은 menu에 모두** 올려 둔다(회원 · 결제 · 승인 · 분쟁 · 설정 · 체험 초기화 등).
  - todo는 관리자가 처리해야 하는 것(입금 확인 · 승인 · 신고 · 분쟁 · 환불 등), `level` `warn`이면 강조. 0건도 보내면 흐리게 보임.
  - **공통 숫자 이름**(이음B 맨 위 전체 현황 합계에 씀, 2026-11-08): `members` 전체 회원(명, 데모 · 체험 · 관리자 빼고) · `new7` 최근 7일 가입(명) · `paying` 유료 이용 중(명) · `paid` 이번 달 결제 합계(원, 부가세 포함). 해당되는 것은 이 key로 보낸다(그 밖의 숫자는 key 마음대로).
  - 목록에는 이름 · 회사 · 종류 · 시각만(전화 · 이메일 · 주소 · 주민번호 · 계좌 같은 개인정보는 넣지 않기). 목록마다 10개까지.
  - 가볍게: 숫자 몇 개 세는 정도로(이음B가 열 때마다 부름). 실패하면 이음B 화면에 "불러오지 못함"만 뜸.
- **관리자 한 번 로그인에 `next` 추가**: 이음B가 바로 그 화면으로 보낼 때 입장권 payload에 `next`(위 link)가 들어간다. `/api/eeum-sso`에서 세션을 만든 뒤 `next`가 있고 `/`로 시작하며 `//`가 아니면 그 경로로 303, 아니면 원래대로 관리자 첫 화면.
- 만들었으면 이음B 세션에 알리기 → 이음B `worker.js` INFO 표를 true로.

## 회원 통합 로그인 (2026-11-19 사용자: "이음비 · 노무비 · 공간비 · 절곡비 모두 하나의 통합회원", "가입하고 권한에 따라 각각의 비를 사용" — 공통 규칙 1)
가입 · 로그인은 **eeum.bid 한 곳**(카카오 · 네이버 · 구글). 회원 원본과 **서비스별 권한**(역할 · 상태)은 이음B Supabase에 있다. 서비스는 아래 두 가지만 하면 된다.
1. **[로그인] · [회원가입] 단추** → `https://eeum.bid/login?svc=<gg|bb|nm|us>&next=<돌아올 경로>` (next는 `/`로 시작하는 자기 사이트 경로, 없어도 됨)
2. **받는 쪽** `POST /api/eeum-login` (폼 칸 `t`, Content-Type `application/x-www-form-urlencoded`, Origin `https://eeum.bid`). GET은 405.
- 입장권 꼴 · 공개 열쇠 · 확인 방법은 "관리자 한 번 로그인"과 같다(`verifyEeumTicket()` 그대로) — 다른 점: **`sub`=`eeum-member`**(관리자 `eeum-admin` 입장권으로 일반 로그인되면 안 되고, 반대도 안 됨).
- 입장권 안 값:
  - `uid` 이음B 회원 번호(uuid) — **서비스 DB의 회원과 이을 열쇠**. 서비스 회원 표에 `eeum_uid`(유일) 칸을 두고, 처음 오면 새로 만들고 다음부터는 그 줄로 로그인.
  - `name` · `email` · `phone`(숫자만, 없으면 빈 글자) — 이음B가 가진 값. 서비스가 화면에 쓰거나 처음 만들 때 채움.
  - `role` 그 서비스에서 회원이 고른 역할, `status` `trial`(체험 이용) | `active`(사용 중) | `blocked`(정지 — 이음B가 보내지 않지만 오면 거절), `until` 사용 기한(YYYY-MM-DD 또는 빈 글자), `next`(있으면 로그인 뒤 그 경로로 303).
  - 역할 이름(이음B `member.js` SVCS): 공간B `consumer` 소비자 · `biz` 인테리어 업체 / 절곡B `orderer` 발주자 · `maker` 생산자 · `supplier` 원판 납품 / 노무B `worker` 팀원 · `leader` 작업팀장 · `manager` 업체 관리자. 역할을 늘리거나 바꾸려면 이음B 세션에 알린다.
- **권한은 들어올 때마다 새로 받는다**: 서비스는 입장권의 role · status로 자기 회원 줄을 맞추고(덮어쓰기), 그 값으로 화면 · 기능을 막고 연다. `trial`이면 체험 범위 + 구독 안내, `active`면 전부.
- 구독 · 결제가 끝나 `active`로 바꿔야 할 때: 지금은 이음B 관리자가 바꾼다(이음B 관리자 화면 회원 탭 — 만드는 중). 서비스가 직접 알리는 길(서명 요청)은 다음에 이 문서에 더한다.
- 로그아웃: 서비스는 자기 세션만 지운다. 이음B 로그인까지 끊으려면 `https://eeum.bid/account`에서.
- 체험 데모 계정은 지금처럼 서비스 쪽에 그대로(이음B 계정 없이). 원래 서비스 로그인은 이음B 통합 로그인이 열린 뒤에도 관리자 예비용으로만 남긴다.
- 만들었으면 이음B 세션에 알려 주세요 → 이음B `member.js` SVCS의 `ready`를 true로(그 전엔 eeum.bid에서 '연결 준비 중' 화면). 시험은 이음B가 `MEMBER_TEST_TARGET`으로 내 PC · 미리보기 주소에 보낼 수 있음.

## 로그인 작은 창 (2026-11-20 사용자: "각각의 비들 공통사항이야 로그인 버튼을 누르면 작은 새창을 띄워서 로그인을 하도록해 페이지를 이동하지마")
- **[로그인]을 누르면 지금 페이지는 그대로 두고 작은 창(460×720)에서 이음B 로그인**을 한다. 로그인이 끝나면 작은 창은 스스로 닫히고, 원래 페이지가 같은 자리에서 새로고침되어 로그인 상태가 된다.
- 서비스가 할 일은 셋:
  1. 모든 페이지(적어도 [로그인]이 있는 페이지와 로그인 뒤 돌아오는 페이지)에 `<script src="https://eeum.bid/brand/login-popup.js" defer></script>` — 복사본 말고 이 주소를 그대로(고치면 이음B만 push).
  2. [로그인]은 `<a class="b-login <서비스>" href="https://eeum.bid/login?svc=<서비스>">` 그대로(target · onclick · 자기 이동 코드 없이). 스크립트가 누르기를 받아 작은 창을 연다. `next`를 붙여도 되고, 없으면 지금 경로.
  3. `POST /api/eeum-login`이 로그인 뒤 `next`로 보낼 때 **물음표 뒤(쿼리)까지 그대로** 보낸다 — 스크립트가 next 끝에 `eeum_popup=1`을 붙이고, 작은 창이 그 표시가 있는 페이지에 오면 원래 페이지에 알리고(BroadcastChannel · localStorage · postMessage) 닫는다. 표시는 주소에서 바로 지운다.
- 작은 창이 돌아온 서비스 화면에서 로그인 정보 저장에 시간이 걸리면(예: Supabase 1회용 링크 · 휴대폰 인증) 그 화면이 스크립트보다 먼저 `window.eeumPopupWait = <Promise>`를 둔다 → 공통 스크립트가 그게 끝날 때까지(최대 15초) 기다렸다가 알리고 닫는다(11/20 절곡B 제안).
- 원래 페이지에서 새로고침 대신 화면만 바꾸고 싶으면 `window.addEventListener('eeum-login', e => { e.preventDefault(); … })`.
- 팝업이 막힌 브라우저는 예전처럼 그 주소로 이동한다(로그인 뒤 next로 돌아옴). 폰에서는 작은 창 대신 새 탭으로 열리고, 끝나면 그 탭이 닫혀 원래 탭으로 돌아온다.
- 이미 이음B에 로그인돼 있으면 작은 창은 묻지 않고 바로 서비스로 넘어가 닫힌다(잠깐 깜빡임).
- 이음B 소개 페이지(eeum.bid/○○)는 작은 창에서 로그인되면 [로그인] 자리가 [○○B 열기]로 바뀐다. 이음B 첫 화면도 [가입하기] 대신 [로그인](작은 창, 11/20 사용자 "이음비도 마찬가지야") → 로그인되면 [내 계정].
- **역할 고르기**(11/20 사용자 "로그인 할때 각각의 비들에 로그인 옵션 … 운송비는 화주로 시작하기, 생산자로 시작하기 … 공간비는 소비자로 시작하기"): 서비스에서 연 작은 창은 맨 위 '○○B 통합계정 가입' 아래 먼저 **[역할로 시작하기]** 단추(member.js SVCS roles 순서)를 보이고, 고르면 카카오 · 네이버 · 구글. 로그인 · 가입이 끝나면 그 역할로 '체험 이용'이 바로 시작돼(체험 중이면 역할 바꿈, 사용 중 · 정지는 그대로) 입장권 role에 담겨 서비스로 간다. 이미 그 서비스 역할이 있는 회원은 묻지 않고 바로 들어간다. 서비스는 고칠 것 없음(역할 이름을 바꾸려면 이음B member.js SVCS).
- 작은 창은 440 폭으로 열리고, 로그인 화면이 내용 높이에 맞게 창 높이를 다시 맞춘다(11/20 사용자 "새창 크기를 다시 잘 맞춰서").
- 작은 창은 **지금 브라우저 창의 가운데**에 뜬다(11/20 사용자 "모든 비들에 로그인 새창은 가운데 띄워", 화면을 넘으면 화면 안으로). 스크립트 하나라 다섯 사이트가 같이 바뀐다.

## 현장 공유 (2026-11-19 사용자: "운송비, 절곡비, 공간비, 노무비들은 하나의 아이디로 모두 로그인이 가능하지만 각각 구독 및 결재에 따라 사용이 제한되는 거야. 하지만 하나의 아이디에 지정되어 있는 현장의 목록은 공유가 되도록 … 절곡비 가입자가 현장을 개설하고 운송비를 사용해서 공유된 현장정보로 운송")
- **현장 목록의 원본 = 이음B**(이음B Supabase `sites`, 이음B 회원 한 명 = 주인). 서비스는 자기 DB에 현장을 따로 만들지 말고 이음B 현장을 고르거나 새로 만든다. 서비스만의 현장 자료(노무B 출력 · 배치, 운쏭B 운송 건, 절곡B 발주 납품지 등)는 서비스 DB에 `eeum_site_id`로 이어 둔다.
- **열쇠**: 통합 로그인 입장권(sub `eeum-member`)에 `sites_token`이 들어 있다(그 회원만, 30일). 서비스 서버는 로그인 세션에 저장해 두고 이음B를 부를 때 `Authorization: Bearer <sites_token>`. 만료 · 탈퇴면 401 → 그 회원을 이음B로 다시 로그인시키면 새 열쇠가 온다. 열쇠는 서버에만 두기를 권장(서비스 화면에서 바로 부를 때는 CORS가 열려 있지만 열쇠가 브라우저에 남음).
- **주소**(모두 https://eeum.bid, JSON):
  - `GET /api/sites` → `{ sites: [현장…], equip: {키: 이름} }`(보관한 것 빼고, 최근 고친 순)
  - `GET /api/sites/<id>` → `{ site }`
  - `POST /api/sites` 본문 = 현장 칸 → 201 `{ site }`(만든 곳 `created_svc` = 열쇠의 서비스)
  - `POST /api/sites/<id>` 본문 = 고칠 칸만 → `{ site }`
  - `DELETE /api/sites/<id>` → 보관(지우지 않음 — 다른 서비스가 이어 둔 자료 보호) `{ ok: true }`
  - 남의 현장 · 없는 id는 404, 이름 없음 · 형식 틀림은 400 `{ error }`. 한 회원 300개까지.
- **현장 칸**: `id` · `name`(필수, 60자) · `address` · `address_detail` · `lat` · `lng` · `manager_name` · `manager_phone`(숫자만으로 저장) · `hours`(반입 가능 시간) · `equip`(배열: `forklift` 지게차 · `tower` 타워크레인 · `cargo_crane` 카고크레인 · `hoist` 호이스트 · `none` 없음) · `access_note`(출입 경로 · 주의사항) · `memo` · `start_date` · `end_date`(YYYY-MM-DD) · `created_svc` · `created_at` · `updated_at`.
- **쓰는 권한은 구독과 별개**: 현장 목록은 로그인만 되면 공유된다. 그 현장으로 무엇을 할 수 있는지(발주 · 운송 · 출력 관리)는 각 서비스의 구독 · 결제(role · status)로 제한한다.
- 회원이 이음B에서 탈퇴하면 그 회원의 현장도 지워진다(담당자 연락처 등 개인정보). 서비스에 이어 둔 자료의 처리는 각 서비스 규정대로.
- 이음B 화면: eeum.bid/account 「내 현장」에서도 보고 · 만들고 · 고치고 · 보관한다.

## 조심할 것
- tokens.css는 `--ink` `--muted` `--line` `--bg` `--card` `--accent` `--radius` `--shadow` `--font` 같은 **흔한 이름**도 정한다.
  자기 사이트가 같은 이름을 다른 값으로 쓰고 있으면, 자기 `:root`가 tokens.css **뒤에** 와서 덮어쓰는지 확인(1번 순서).
  - Next.js처럼 tokens.css가 자기 CSS보다 **늦게** 붙는 경우: 자기 쪽을 `html:root{…}`로 써서 우선순위를 높인다(공간B가 이렇게 함).
- 공통 색 이름을 자기 `:root`에서 다른 값으로 다시 정하면, 이음B에서 바꿔도 그 사이트만 안 바뀐다. 서비스 색은 다시 정하지 말 것.
- 회원 종류별 색처럼 **그 사이트만의 색**은 자기 CSS에 두되, 가능하면 공통 색에서 `color-mix()`로 만들기.
- 공통 색 값을 바꾸고 싶으면 자기 폴더에서 고치지 말고 사용자에게 → 이음B(관리자 화면 · 색 또는 이음B 세션).
- 이음B 쪽은 이미 쓰는 색 이름을 바꾸거나 지우지 않는다(더하기만, 크게 바뀔 땐 `brand/v2/`).

## 다 했으면
- 자기 CLAUDE.md의 "brand 복사본" 설명을 "eeum.bid/brand/tokens.css를 불러옴"으로 고치기
- 커밋 · push · 배포 확인 뒤, 이음B 세션(이름 "이음B eeum.bid")에 한 줄로 알려 주기
