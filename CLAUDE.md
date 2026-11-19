# 운송B (unsong.bid) — 작업 메모

> **공통 규칙은 `brand/RULES.md`를 먼저 따른다**(원본 = 이음B `D:\OneDrive\AI PROJECT\yeongyeolb\brand\RULES.md`, 부딪히면 공통 규칙이 이김).
> 계정·분리, 폴더 위치, 자동 배포, 폰 원격 작업, 비밀값, 디자인(색·○○B 이름 표기·선 아이콘·이모지 안 씀), 말투, 먼저 묻는 것은 거기에 있다. 이 파일에는 **운송B만의 내용**만 적는다.

건축 자재 운송 연결 서비스. 웹(unsong.bid) + 안드로이드 앱(나중). 이음B(eeum.bid) 아래 서비스.

## 운송B 기본값
| 항목 | 값 |
|---|---|
| 저장소 | GitHub `dal3728dal-tech/unsongb`(비공개), main push = unsong.bid 운영 반영 |
| Cloudflare | 워커 `unsongb`(Workers Builds: 빌드 명령 `node tools/db-migrate.cjs; node build.cjs`, 배포 `npx wrangler deploy`), 도메인 unsong.bid · www |
| Supabase | 프로젝트 ref `vxiehnzccxntctyjyzuf`(서울, 조직 eeum.bid, Free 플랜) |

## 비밀값 (값은 적지 않음 — 사용자가 직접 넣음)
| 이름 | 쓰는 곳 | 들어 있는 곳 |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | 이음B SSO · billing API | Cloudflare 워커 `unsongb` 비밀값(런타임) |
| `SUPABASE_ACCESS_TOKEN` | 배포 때 DB 자동 반영 | Cloudflare 워커 빌드 변수 및 비밀 |
| `RESEND_API_KEY` | 메일 발송(나중) | Cloudflare 워커 비밀값 |
- 공개 값(비밀 아님): Supabase 주소·publishable 키 = `config.js`·`wrangler.jsonc` vars
- 이음B SSO 공개 열쇠 `EEUM_SSO_JWK_X` = wrangler.jsonc vars(eeum.bid/sso-public.jwk.json keys[0].x)

## 주소
- `/` 소개(서비스 준비 중) · `/account` 로그인(이음B 계정 기본, 관리자 예비 로그인) · `/admin` 관리자

## 회원 종류
- 화주(orderer) · 생산자(producer) · 화물기사(driver) · 현장(site)

## 디자인 (운송B만의 것 — 나머지는 공통 규칙)
- 모든 페이지가 https://eeum.bid/brand/tokens.css를 자기 CSS보다 먼저 불러옴
- 운송B 색은 공통 이름: --us-ink · --us-btn · --us-panel-soft 등(tokens.css)
- 단추 모양 = 공통 단추 값 `--btn-*`(tokens.css, 알약 모양 --btn-r:999px)
- 파비콘 = eeum.bid 주소(https://eeum.bid/brand/favicon/unsong-*.png · unsong.svg)
- 로고 = `.wm us` 운송B

## 구조
- `pages/` — index.html(소개), account.html(로그인), admin.html(관리자), 404.html
- `config.js` — Supabase 주소·공개 키, 체험 계정
- `build.cjs` — `node build.cjs` → `public/`(깃 제외): pages 복사 + config
- `worker/` — index.js(라우터), billing.js(이음B 구독·결제 기준), sso.js(SSO), sso-verify.js(입장권 확인)
- `wrangler.jsonc` — 워커 unsongb, public/ 정적 배포
- `supabase/migrations/` — DB(14자리 번호_이름.sql, 여러 번 실행해도 되게)
- `tools/db-migrate.cjs` — 배포 때 새 SQL 자동 반영(us_ops.migrations)

## 배포
- Workers Builds(프로덕션 분기 main) — push 30~40초 뒤 반영
- DB 반영: `SUPABASE_ACCESS_TOKEN` 넣으면 push마다 자동, 없으면 건너뜀

## 할 일
- [ ] 자동 검사(GitHub Actions ci.yml)
- [ ] DB 매일 백업(.github/workflows/db-backup.yml)
- [ ] 체험 계정(역할마다 데모 업체, 서로 연결, 첫 화면 [체험해보기] → #try)
- [ ] 메일 발송(Resend)
- [ ] 운송 요청·배차·정산 핵심 기능
- [ ] 안드로이드 앱
