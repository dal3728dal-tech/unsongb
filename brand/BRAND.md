# 이음B 디자인 기준 (원본)

이 폴더(`D:\OneDrive\AI PROJECT\yeongyeolb\brand`)가 이음B·공간B·절곡B·노무B·운송B가 같이 쓰는 디자인의 **원본**이다.
각 서비스 폴더의 `brand\`는 복사본이다. 고칠 때는 여기만 고치고 `node sync-brand.cjs`로 복사한다.

## 구조
```
이음B (D:\OneDrive\AI PROJECT\yeongyeolb)           eeum.bid   전체 프로젝트, 브릿지플랫폼(dal3728dal@gmail.com)
├─ 공간B  (D:\OneDrive\AI PROJECT\gongganb)  gonggan.bid   인테리어·공간 견적 연결
├─ 절곡B  (D:\OneDrive\AI PROJECT\bending)   bending.bid   절곡 발주·생산 연결
│   ├─ 3D 판넬 발주   (/app, 판넬 절곡도)
│   └─ 스텐창호 발주  (/window, Bar 절곡도)
├─ 노무B  (D:\OneDrive\AI PROJECT\nomub)     nomu.bid      건설 노무 관리·매칭
└─ 운송B  (D:\OneDrive\AI PROJECT\unsongb)   (도메인 미정) 자재 운송 연결 — 2026-11-19 추가, 준비 중
```

## 컨셉
- **잇는다**: 필요한 사람과 만드는 사람을 바로 잇는 다리. 이음B 마크 = 다리(아치 + 기둥).
- 세 가지 약속: 필요를 보이게 · 만드는 사람에게 바로 · 끝까지 함께.
- 말투: 쉬운 우리말, 짧게. 어려운 한자어·영어 줄임말은 풀어 쓴다.

## 색
| 구분 | 이름 글자 | 대표색 | 진한 글자 | 옅은 바탕 | 느낌 |
|---|---|---|---|---|---|
| 이음B | `#1f2933` | `#4b5a6b` | `#1f2933` | `#eef1f4` | 차분한 남회색 |
| 공간B | `#253d33` | `#7f9a7e` | `#2c4234` | `#edf1e7` | 깊은 초록·세이지 |
| 절곡B | `#3f86cf` | `#6e8193` | `#2a3542` | `#eceff2` | 흑연·강철, 구리 포인트 `#b5774c` |
| └ 3D 판넬 발주 | | `#3f86cf` | | `#eaf2fb` | 파랑 |
| └ 스텐창호 발주 | | `#4f8a6a` | | `#e9f3ec` | 초록 |
| 노무B | `#7a5a22` | `#a07a35` | `#7a5a22` | `#f6efe0` | 안전모 황토 |
| 운송B | `#2d5f6f` | `#4a8a8a` | `#2d5f6f` | `#e6f2f0` | 청록, 단추 `#3a7575` |

- 바탕 `#fbfaf7`(따뜻한 흰색), 본문 `#1f2933`, 설명 `#667085`, 선 `#e6e3dc`.
- 이름의 **B**는 모든 서비스에서 같은 그라데이션: `#7f9a7e → #b5774c → #6e8193` (세 서비스 색을 섞은 것 = 연결).
- 파스텔·차분하게. 진한 원색 면, 형광색, 화려한 효과는 쓰지 않는다.

## 이름 표기
- `노무B`처럼 앞 글자(서비스 색) + `B`(그라데이션). HTML: `<span class="wm nm"><span class="w">노무</span><span class="B">B</span></span>`
  (클래스: 연결 `yb`, 공간 `gg`, 절곡 `bb`, 노무 `nm`, 운송 `us`)
- 진한 단추 위에서는 `.on-dark` 안에 넣으면 밝은 그라데이션으로 바뀜.

## 아이콘
- **선 아이콘만**: 24×24, 선 굵기 1.6, 끝 둥글게, 채우기 없음, 색은 `currentColor`. **이모지 쓰지 않음.**
- 서비스 마크: 둥근 네모(모서리 12~13px) 옅은 바탕 + 대표색 선 아이콘.
  - 이음B `icons/yeongyeolb.svg` 다리 · 공간B `icons/gonggan.svg` 소파 · 절곡B `icons/bending.svg` 절곡기 · 노무B `icons/nomu.svg` 안전모 + 이어진 두 점 · 운송B `icons/unsong.svg` 화물차
  - 3D 판넬 발주 `icons/panel-3d.svg` 상자 · 스텐창호 발주 `icons/sus-window.svg` 창틀
- 이름+마크 그림: `logo/*.svg`

## 파비콘 (2026-11-08)
- `favicon/` = 다섯 마크(eeum · gonggan · bending · nomu · unsong)를 흰 칸에 서비스 색 선으로(이음B 첫 화면 마크 칸과 같게). svg · 32 png · 180 · 192 · 512 png · ico. 다시 만들기 `node tools/make-favicons.cjs`. 붙이는 법은 CONNECT.md "파비콘".
- 이음B: 첫 화면 · 관리자 = eeum, 소개 페이지 = 그 서비스 마크. `/favicon.ico` = eeum.ico

## 글꼴·모양
- Pretendard Variable (jsdelivr v1.3.9). 제목 굵기 800, 자간 -0.03em, `word-break:keep-all`.
- 큰 카드 모서리 18px, 작은 칸 12px, 단추·태그는 알약(999px). 그림자는 옅게 `0 18px 50px rgba(31,41,51,.10)`.
- 단추 크기 · 모서리 · 글자는 공통 값 `--btn-h`(46) · `--btn-h-sm`(38) · `--btn-h-lg`(54) · `--btn-px`(20) · `--btn-fs`(15) · `--btn-fs-sm`(14) · `--btn-fs-lg`(16) · `--btn-r`(999 = 알약) · `--btn-r-sq`(12, 네모 단추) · `--btn-fw`(700).
  2026-11-08부터 이음B 관리자 화면 '색 · 단추' 탭에서 고치면 네 사이트 단추가 함께 바뀐다(각 사이트가 이 값을 쓰도록 연결한 뒤부터).
- 휴대폰 먼저: 좌우 여백 16px, 누르는 칸 최소 44px.

## 파일
- `tokens.css` — 위 값을 CSS 변수로. `.wm`(이름 표기), `.ico`(선 아이콘) 포함
- `icons/` — 공통 선 아이콘 SVG
- `logo/` — 서비스별 마크 + 이름 SVG
- `preview.html` — 한눈에 보기
- `sync-brand.cjs` — 세 서비스 폴더로 복사

## 고치는 순서
1. 여기(`D:\OneDrive\AI PROJECT\yeongyeolb\brand`)를 고친다.
2. `node "D:\OneDrive\AI PROJECT\yeongyeolb\brand\sync-brand.cjs"` → `D:\OneDrive\AI PROJECT\gongganb\brand`, `D:\OneDrive\AI PROJECT\bending\brand`, `D:\OneDrive\AI PROJECT\nomub\brand`로 복사.
3. 각 서비스 세션에서 화면에 반영(각자 자기 저장소에서 커밋·배포).

색을 바꾸기 전에 사용자에게 먼저 묻는다. 각 서비스 세션은 복사본을 직접 고치지 않는다(바꾸고 싶으면 이음B 세션에 말한다).
