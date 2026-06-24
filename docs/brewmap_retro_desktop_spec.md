# BrewMap Retro Desktop UI/UX — Codex Implementation Specification

> 목적: BrewMap의 기존 브랜드 컬러, 아이콘, 카페 데이터와 핵심 탐색 기능을 유지하면서, 1995–1999년 데스크톱 운영체제의 창 기반 인터페이스로 재구성한다.  
> 핵심 경험: **로컬 매거진에서 발견 → 카페 인덱스에서 판단 → 지도에서 위치 확인 → 단골 장부에 저장·기록**  
> 현재 운영 방식: **Retro Desktop 상단 작업 영역 + 기존 검색/지도/저장 UI를 하단 Classic Workspace로 공존**  
> 문서 상태: MVP 착수용 구현 명세

---

## 0. Codex 실행 원칙

작업을 시작하기 전에 저장소를 확인하고 아래 원칙을 지킨다.

1. **기존 기술 스택을 유지한다.** 프레임워크, 라우팅, 상태 관리, 스타일링 방식을 임의로 교체하지 않는다.
2. **기존 BrewMap 컬러 토큰과 아이콘을 소스 오브 트루스로 사용한다.** 새로운 브랜드 컬러나 아이콘 세트를 만들지 않는다.
3. **기존 카페 데이터, 검색, 지도, 저장 기능을 재사용한다.** 동일 데이터를 별도 복제하지 않는다.
4. 레트로 테마는 기본 진입 화면으로 사용하되, 기존 서비스 UI는 `Classic Workspace`로 함께 노출해 검색/지도/저장/Admin 플로우를 유지한다.
5. 데스크톱 외형은 레트로하게 만들되, 실제 사용성은 현대적으로 유지한다.
6. 지도, 운영시간, 주소, 검색 결과 등 핵심 정보는 CRT 노이즈나 픽셀 필터로 훼손하지 않는다.
7. 모든 창 제어 버튼은 실제로 작동해야 한다. 장식용 닫기·최소화·최대화 버튼을 두지 않는다.
8. 오디오는 자동 재생하지 않는다.
9. 모바일에서는 창을 자유 배치하지 않고, 한 번에 한 프로그램을 전체 화면으로 표시한다.
10. 파괴적 데이터 마이그레이션이 필요하지 않은 범위부터 구현한다.

### 권장 출시 방식

- 개발·QA: `/labs/retro-desktop` 또는 동등한 실험용 라우트
- 운영 전환: `retroDesktopV1` feature flag
- 사용자 설정이 이미 있다면 테마 선택 항목으로 노출 가능

---

## 1. 제품 콘셉트

### 1.1 한 문장 정의

**BrewMap을 ‘로컬 카페를 발견하고 분류하고 기록하는 개인용 데스크톱’으로 재해석한다.**

### 1.2 디자인 기준 시대

- 기준: 1995–1999년 개인용 데스크톱 UI
- 차용 요소: 타이틀 바, 메뉴 바, 파일·폴더, 작업 표시줄, 하드 섀도, 작은 상태 표시줄
- 제외 요소: 지속적인 화면 깜빡임, 심한 스캔라인, 읽기 어려운 픽셀 본문, 실제 구형 OS 수준의 작은 클릭 영역

### 1.3 경험 원칙

- **발견은 매거진처럼**: 한 번에 많은 카페를 나열하지 않는다.
- **판단은 인덱스처럼**: 별점보다 방문 목적과 공간 특성을 제공한다.
- **위치는 지도처럼 정확하게**: 지도 정보는 현대적인 가독성을 유지한다.
- **기억은 장부처럼**: 저장, 방문, 개인 메모를 축적한다.

### 1.4 비목표

- 브라우저 안에서 완전한 운영체제를 복제하지 않는다.
- 모든 콘텐츠를 별도 창으로 만들지 않는다.
- 기존 카페 상세 페이지와 데이터 구조를 전면 재작성하지 않는다.
- 데스크톱에서조차 무제한으로 창을 띄우지 않는다.
- 별점을 단순 삭제한 뒤 신뢰 정보를 비워두지 않는다.

---

## 2. 프로그램 구성

BrewMap Desktop은 공통 셸과 다섯 개의 프로그램으로 구성한다. `NEARBY_MAP.EXE`는 최초 기획서 작성 이후 추가된 주변 일반 지도 프로그램이며, 기존 `BREWMAP.EXE`의 선택 카페 중심 약도 역할과 분리한다.

| 사용자용 이름 | 내부 프로그램 ID | 창 제목 | 역할 |
|---|---|---|---|
| 오늘의 발견 | `local-zine` | `LOCAL_ZINE.EXE` | 동네 매거진형 큐레이션 |
| 카페 인덱스 | `cafe-index` | `CAFE_INDEX.EXE` | 검색·필터·비교·상세 판단 |
| 지도 | `brewmap-map` | `BREWMAP.EXE` | 선택 카페 중심 약도와 주변 관계 확인 |
| 주변 지도 | `nearby-map` | `NEARBY_MAP.EXE` | 내 위치/현재 지점 기준 일반 지도 탐색 |
| 나의 단골 장부 | `brew-log` | `BREW_LOG.EXE` | 저장·방문 기록·개인 메모 |

### 기본 실행 상태

- 최초 진입: 상단 `Retro Desktop`에는 `LOCAL_ZINE.EXE`만 열고 전면에 표시한다.
- 사용자가 `지도에서 열기`를 선택하면 `BREWMAP.EXE`를 열고 선택 카페 중심 약도를 표시한다.
- 사용자가 상단 메뉴, 작업 표시줄, 또는 현재 위치 액션에서 주변 탐색을 선택하면 `NEARBY_MAP.EXE`를 열어 일반 주변 지도를 표시한다.
- 동일 카페에 대한 `CAFE_INDEX.EXE` 상세 레코드를 함께 갱신한다.
- 저장 완료 시 `BREW_LOG.EXE`를 자동 최대화하지 않고 작업 표시줄 배지만 증가시킨다.
- 데스크톱에서 동시에 전면 노출하는 권장 창 수는 3개, 최대 4개다. `NEARBY_MAP.EXE`는 필요한 때 여는 보조 지도 창으로 다룬다.
- 기존 검색/필터/결과/지도/저장/Admin 화면은 하단 `Classic Workspace`로 이어서 표시한다.
- 상단 `CLASSIC` 메뉴는 기존 UI 영역으로 스크롤 이동한다.

---

## 3. 핵심 사용자 흐름

### Flow A — 큐레이션에서 발견하고 저장

1. 사용자가 BrewMap Desktop에 진입한다.
2. `LOCAL_ZINE.EXE`에서 오늘의 동네 또는 한 곳을 본다.
3. `지도에서 열기`를 누른다.
4. `BREWMAP.EXE`가 해당 카페 중심 약도와 같은 권역 주변 카페를 표시한다.
5. `CAFE_INDEX.EXE`가 같은 카페의 상세 레코드를 표시한다.
6. 사용자가 `장부에 저장`을 누른다.
7. 공통 저장 상태가 갱신되고 `BREW_LOG.EXE` 작업 표시줄 아이콘에 배지가 표시된다.
8. 장부를 열면 방금 저장한 카페가 선택된 상태로 보인다.

### Flow B — 조건으로 검색하고 판단

1. 사용자가 데스크톱 아이콘 또는 작업 표시줄에서 `CAFE_INDEX.EXE`를 연다.
2. 방문 목적 필터를 선택한다.
3. 결과 목록에서 카페를 선택한다.
4. 우측 상세 패널에 운영시간, 공간, 커피, 최근 확인 정보를 표시한다.
5. `지도에서 보기` 또는 `장부에 저장`을 선택한다.
6. 위치 기반 주변 비교가 필요하면 `NEARBY_MAP.EXE`를 열어 일반 지도를 탐색한다.

### Flow C — 방문 후 기록

1. 사용자가 `BREW_LOG.EXE`를 연다.
2. 저장 또는 방문한 카페를 선택한다.
3. `방문 도장 찍기`를 누른다.
4. 날짜, 방문 형태, 기억할 메뉴, 한 줄 메모를 입력한다.
5. 해당 카페 레코드와 전체 방문 수가 즉시 갱신된다.

---

## 4. 데스크톱 셸

### 4.1 레이아웃

```text
┌──────────────────────────────────────────────────────────────┐
│ BREWMAP  FILE  VIEW  WINDOW                 BUSAN  16:33    │  Top bar
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [오늘의 발견]                                                │
│ LOCAL_ZINE                                                   │
│                                                              │
│ [카페 인덱스]    ┌─ LOCAL_ZINE.EXE ───────────────────────┐  │
│ CAFE_INDEX       │                                        │  │
│                  │         오늘의 동네 이야기             │  │
│ [주변 지도]      │                                        │  │
│ NEARBY_MAP       │                                        │  │
│                                                              │
│ [나의 장부]      │                                        │  │
│ BREW_LOG         └────────────────────────────────────────┘  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ [BREWMAP] [LOCAL ZINE] [CAFE INDEX] [NEARBY MAP] [BREW LOG] │  Taskbar
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Hybrid Shell 구성

- 화면 상단은 `Retro Desktop` 작업 영역으로 고정 높이의 데스크톱 셸을 렌더링한다.
- 화면 하단은 기존 캡쳐 UI와 동일한 `Classic Workspace`를 렌더링한다.
- 두 영역은 동일한 카페 데이터, 지도 provider, 저장 상태, 제보/Admin 상태를 공유한다.
- 페이지 스크롤은 허용하되, 레트로 창 내부는 자체 스크롤을 사용해 창 크롬과 작업 표시줄이 깨지지 않게 한다.
- `Classic Workspace`는 숨겨진 테스트 DOM이 아니라 운영 보조 화면이므로 `hidden`이나 `aria-hidden`을 적용하지 않는다.

### 4.3 셸 구성 요소

- `DesktopTopBar`
  - BrewMap 워드마크 또는 기존 로고
  - 레트로 프로그램 실행 메뉴
  - `CLASSIC` 메뉴로 기존 UI 영역 이동
  - 현재 지역 표시
  - 현재 시각 표시
- `DesktopCanvas`
  - 바탕화면 아이콘
  - 프로그램 창 렌더링 영역
  - 창 이동 경계
- `DesktopShortcut`
  - 기존 BrewMap 아이콘을 24px 또는 32px 프로그램 아이콘 타일 안에 배치
  - 사용자용 한국어 이름과 내부 파일명 표시
- `DesktopTaskbar`
  - 열린 창 목록
  - 활성 창 표시
  - 최소화된 창 복원
  - 저장 알림 배지
  - `Reset Layout` 메뉴

### 4.4 창 공통 구조

```text
┌─ TITLE.EXE ──────────────────────────────── _ □ × ┐
│ FILE  EDIT  VIEW                                      │
├───────────────────────────────────────────────────────┤
│                                                       │
│                    Program content                    │
│                                                       │
├───────────────────────────────────────────────────────┤
│ STATUS MESSAGE                                        │
└───────────────────────────────────────────────────────┘
```

각 창은 아래 영역을 가진다.

- 타이틀 바
- 선택적 메뉴 바
- 본문
- 선택적 상태 표시줄
- 최소화, 최대화·복원, 닫기 버튼

### 4.5 창 동작

P0 필수:

- 클릭 시 활성화하고 가장 앞으로 가져오기
- 타이틀 바 드래그로 이동
- 최소화
- 최대화·복원
- 닫기
- 작업 표시줄에서 열기·복원
- 뷰포트 밖으로 완전히 이동하지 않도록 경계 처리
- `Reset Layout`으로 기본 배치 복구

P1 권장:

- 모서리 또는 가장자리 리사이즈
- 좌우 스냅
- 키보드 창 전환
- 마지막 창 위치 로컬 저장

### 4.6 창 기본 크기

| 프로그램 | 권장 기본 크기 | 최소 크기 |
|---|---:|---:|
| `LOCAL_ZINE.EXE` | 620 × 680 | 520 × 560 |
| `CAFE_INDEX.EXE` | 980 × 620 | 760 × 520 |
| `BREWMAP.EXE` | 820 × 620 | 680 × 500 |
| `NEARBY_MAP.EXE` | 920 × 640 | 720 × 520 |
| `BREW_LOG.EXE` | 760 × 600 | 620 × 500 |

화면 크기에 따라 초기 좌표와 크기를 계산한다. 픽셀 값을 절대 고정하지 않는다.

### 4.7 z-index 규칙

- `baseZIndex`를 정한다.
- 창이 활성화될 때 `zOrder` 배열의 마지막으로 이동한다.
- `z-index = baseZIndex + zOrder index`로 계산한다.
- 무한 증가 카운터 대신 배열 재정렬 방식을 권장한다.

---

## 5. 프로그램 1 — `LOCAL_ZINE.EXE`

### 5.1 목적

브루맵의 기본 홈 역할을 하며, 별점이나 인기 순위 대신 동네와 공간의 이야기를 통해 카페를 발견하게 한다.

### 5.2 기본 레이아웃

```text
┌─ LOCAL_ZINE.EXE — ISSUE 08 ─────────────────── _ □ × ┐
│ FILE  ISSUE  NEIGHBORHOOD  VIEW                       │
├────────────────────────────────────────────────────────┤
│ ISSUE 08 · 영도                                        │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │                                                    │ │
│ │                    큰 카페 사진                   │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ 바다가 보이지 않아도                                  │
│ 오래 머물고 싶은 커피 바                              │
│                                                        │
│ 간판 없이 같은 자리에서 커피를 내리는 곳입니다.      │
│                                                        │
│ [이야기 읽기] [지도에서 열기] [스크랩]                │
├────────────────────────────────────────────────────────┤
│ 01 / 06 STORIES                    BUSAN · YEONGDO      │
└────────────────────────────────────────────────────────┘
```

### 5.3 콘텐츠 구성

- Issue 번호 또는 발행 기간
- 동네명
- 대표 사진 1장
- 짧은 큐레이션 제목
- 1–3문장의 소개
- 이야기 또는 사장님 인터뷰 링크
- 지도에서 열기
- 스크랩
- 이전·다음 이야기

### 5.4 데이터 요구

기존 카페 데이터에 아래 정보가 이미 있으면 재사용한다. 없다면 optional 필드로 처리한다.

- `editorialTitle`
- `editorialSummary`
- `neighborhood`
- `coverImage`
- `ownerStory` 또는 콘텐츠 링크
- `curationTags`

필드가 없을 때는 기존 이름, 설명, 대표 이미지로 안전하게 폴백한다.

### 5.5 액션

- `OPEN_STORY`
- `OPEN_IN_MAP`
- `SCRAP_CAFE`
- `NEXT_STORY`
- `PREVIOUS_STORY`

### 5.6 화면 상태

- Loading: 사진 영역과 제목을 단순한 레트로 플레이스홀더로 표시
- Empty: `이번 호를 준비 중입니다.`와 `카페 인덱스 열기` 버튼
- Error: 재시도 버튼과 오류 메시지, 기존 홈으로 돌아가기

### 5.7 디자인 규칙

- 한 화면의 중심은 사진 한 장과 문장 하나다.
- 카드 그리드를 홈의 첫 화면에 두지 않는다.
- 제목은 명조 또는 기존 디스플레이 서체를 사용할 수 있다.
- 본문은 기존 산세리프를 유지한다.
- 과도한 종이 찢김, 스티커, 손글씨 효과를 동시에 사용하지 않는다.

---

## 6. 프로그램 2 — `CAFE_INDEX.EXE`

### 6.1 목적

사용자가 방문 목적과 실제 조건을 기준으로 카페를 찾고 판단하게 한다. 가장 실용적이고 정보 밀도가 높은 프로그램이다.

### 6.2 기본 레이아웃

```text
┌─ CAFE_INDEX.EXE — 18 RECORDS ───────────────── _ □ × ┐
│ FILE  SEARCH  FILTER  MAP  VIEW                        │
├───────────────┬────────────────────┬────────────────────┤
│ FIND BY       │ CAFE RECORDS       │ RECORD 024         │
│               │                    │                    │
│ □ 조용한 곳   │ 01 카페 이름 A    │ [공간 사진]        │
│ □ 핸드드립    │    조용함          │                    │
│ □ 혼자 방문   │    중배전          │ 카페 이름 A        │
│ □ 자연광      │                    │                    │
│ □ 음악        │ 02 카페 이름 B    │ “낮은 조명과       │
│ □ 디카페인    │    혼자 적합       │ 재즈가 흐르는      │
│               │    21시 마감       │ 작은 드립 바”      │
│ OPEN          │                    │                    │
│ ○ 지금 영업   │ 03 카페 이름 C    │ 도보 8분           │
│ ○ 오늘 영업   │                    │ 21:00까지          │
│               │                    │                    │
│               │                    │ [지도에서 보기]    │
│               │                    │ [장부에 저장]      │
├───────────────┴────────────────────┴────────────────────┤
│ 18 RECORDS · 12 OPEN · INFORMATION VERIFIED            │
└─────────────────────────────────────────────────────────┘
```

### 6.3 3단 구조

#### 왼쪽 — 필터

기존 필터가 있다면 우선 재사용하고, 사용자 언어만 방문 목적 중심으로 정리한다.

권장 필터:

- 조용히 머물기
- 혼자 방문하기
- 대화하기
- 핸드드립
- 음악 듣기
- 자연광
- 늦게까지 운영
- 디카페인 가능
- 지금 영업
- 오늘 영업

#### 가운데 — 결과 레코드

별점과 순위는 1차 정보로 표시하지 않는다.

```text
03  카페 이름
    핸드드립 · 혼자 방문 적합
    오늘 21:00까지 · 도보 8분
```

표시 우선순위:

1. 카페명
2. 방문 목적과 맞는 특성
3. 현재 또는 오늘의 운영 상태
4. 거리
5. 최근 확인 여부

#### 오른쪽 — 상세 레코드

```text
COFFEE
로스팅      중배전
주요 방식   핸드드립
원두 선택   4종

SPACE
소음        조용함
좌석        1–2인 중심
조명        낮고 따뜻함

VISIT
추천 시간   평일 11:00–14:00
최근 확인   운영정보 확인 완료
```

### 6.4 신뢰 정보

별점 대신 아래 중 실제 데이터가 있는 항목을 노출한다.

- 최근 운영정보 확인일
- 에디터 직접 방문 여부
- 사장님 직접 등록·수정 여부
- 영업 여부
- 공간 및 커피 특성
- 단골 방문 기록 수

존재하지 않는 데이터를 임의 생성하지 않는다.

### 6.5 액션

- `SELECT_CAFE`
- `APPLY_FILTER`
- `CLEAR_FILTERS`
- `OPEN_IN_MAP`
- `SAVE_TO_LOG`
- `OPEN_CAFE_DETAIL`

### 6.6 상태 표시줄

예시:

```text
18 RECORDS · 12 OPEN NOW · LAST VERIFIED 3 DAYS AGO
```

한국어 UI를 기본으로 하고, 파일명과 프로그램 상태만 제한적으로 영문을 사용한다.

### 6.7 화면 상태

- Loading: 필터는 유지하고 결과 영역만 로딩 처리
- Empty: 선택한 조건을 요약하고 `필터 초기화` 버튼 표시
- Error: 기존 검색 오류 처리 방식을 재사용
- No selection: 우측 패널에 사용법과 오늘의 추천 1곳 표시

---

## 7. 프로그램 3 — `BREW_LOG.EXE`

### 7.1 목적

저장한 카페, 방문 기록, 개인 메모, 동네 코스를 관리한다. 사용자가 BrewMap에 장기적으로 취향을 축적하는 공간이다.

### 7.2 기본 레이아웃

```text
┌─ BREW_LOG.EXE — MY LOCAL FILES ─────────────── _ □ × ┐
│ FILE  FOLDER  STAMP  EXPORT  VIEW                     │
├───────────────┬────────────────────┬────────────────────┤
│ MY FOLDERS    │ SAVED CAFES        │ CAFE_024.LOG       │
│               │                    │                    │
│ ▣ 스크랩      │ [01] 카페 A        │ [작은 사진]        │
│ ▣ 가고 싶은 곳│ [02] 카페 B        │                    │
│ ▣ 방문한 곳   │ [03] 카페 C        │ 방문 2회           │
│ ▣ 단골이 된 곳│                    │ 마지막 방문 06.12  │
│ ▣ 내 메모     │                    │                    │
│ ▣ 동네 코스   │                    │ 기억할 메뉴        │
│               │                    │ 에티오피아 드립     │
│               │                    │                    │
│               │                    │ “비 오는 날 다시   │
│               │                    │ 가고 싶음”          │
│               │                    │                    │
│               │                    │ [방문 도장]         │
│               │                    │ [메모 수정]         │
├───────────────┴────────────────────┴────────────────────┤
│ 12 SAVED · 7 VISITED · 3 PERSONAL ROUTES               │
└─────────────────────────────────────────────────────────┘
```

### 7.3 폴더 구조

```text
MY LOCAL FILES
├─ 스크랩
├─ 가고 싶은 곳
├─ 방문한 곳
├─ 단골이 된 곳
├─ 나만의 메모
└─ 동네 커피 산책
```

기존 저장 분류 체계가 있으면 이름만 매핑하고 데이터를 중복 생성하지 않는다.

### 7.4 방문 도장 폼

필수 입력을 최소화한다.

- 방문 날짜
- 혼자 / 함께
- 기억할 메뉴
- 한 줄 메모

선택 입력:

- 사진
- 머문 시간대
- 다시 방문하고 싶은 이유

### 7.5 액션

- `SAVE_CAFE`
- `REMOVE_SAVED_CAFE`
- `MOVE_TO_FOLDER`
- `STAMP_VISIT`
- `EDIT_PERSONAL_NOTE`
- `ADD_TO_ROUTE`
- `OPEN_IN_MAP`

### 7.6 인터랙션

- 저장 완료: 파일이 폴더에 들어가는 200–300ms 애니메이션
- 방문 완료: 잉크 도장이 찍히는 짧은 반응
- 드래그 앤 드롭: P1 보조 기능
- 모든 이동·분류 기능은 버튼 또는 메뉴로도 수행 가능해야 한다.

### 7.7 비로그인 처리

현재 BrewMap의 인증 정책을 따른다.

- 비로그인 저장을 지원하면 기존 로컬 저장 방식을 재사용한다.
- 로그인이 필수면 저장 시 기존 로그인 플로우를 호출한다.
- 새 인증 체계를 만들지 않는다.

---

## 8. 지도 프로그램 — `BREWMAP.EXE` / `NEARBY_MAP.EXE`

### 8.1 목적

카페 위치를 선택 카페 중심 약도와 일반 주변 지도로 나누어 정확히 보여주는 시스템 프로그램군이다.

- `BREWMAP.EXE`: 다른 프로그램에서 선택한 카페를 중심으로 약도와 같은 권역 주변 카페를 보여준다.
- `NEARBY_MAP.EXE`: 내 위치 또는 현재 지도 중심을 기준으로 실제 지도 타일, 핀, 확대/축소, 드래그 이동을 제공한다.

### 8.2 원칙

- 기존 지도 컴포넌트와 핀을 최대한 재사용한다.
- 지도 타일과 텍스트는 픽셀화하지 않는다.
- 레트로 표현은 지도 바깥 창 프레임과 컨트롤에 집중한다.
- 선택된 카페 ID는 모든 프로그램과 공유한다.
- 상단 메뉴와 작업 표시줄은 레트로 프로그램을 열고, `CLASSIC` 메뉴만 기존 UI 영역으로 스크롤한다.

### 8.3 레이아웃

```text
┌──────────── BREWMAP.EXE ─────────────────────────────┐
│ [검색]                                      [필터 ▣] │
│                                                     │
│                        지도                         │
│                 ● 선택된 카페                      │
│                                                     │
├─────────────────────────────────────────────────────┤
│ BUSAN / SUYEONG · 12 RESULTS · 1.2km                │
└─────────────────────────────────────────────────────┘
```

### 8.4 동작

- 다른 프로그램에서 `OPEN_IN_MAP(cafeId)` 호출 시:
  - 창이 닫혀 있으면 연다.
  - 최소화 상태면 복원한다.
  - 해당 카페를 선택한다.
  - 지도 중심과 적절한 줌을 갱신한다.
  - 창을 활성화한다.
- 지도 핀 선택 시:
  - `selectedCafeId` 갱신
  - `CAFE_INDEX.EXE` 상세 레코드 갱신
- `NEARBY_MAP.EXE`에서 현재 위치를 요청하면:
  - 권한 허용 시 현재 좌표를 지도 중심으로 이동한다.
  - 권한 거부 또는 실패 시 부산 기본 지도를 유지하고 상태 메시지로 이유를 알린다.
  - 지도 자체는 실제 타일, 핀, 확대/축소, 드래그 이동을 유지한다.

---

## 9. 공유 상태 모델

프로그램별로 상태를 중복 보유하지 않는다. 기존 전역 상태 관리가 있다면 확장하고, 없다면 이 기능 범위의 전용 store를 둔다.

### 9.1 최소 상태

```ts
type ProgramId =
  | 'local-zine'
  | 'cafe-index'
  | 'brewmap-map'
  | 'nearby-map'
  | 'brew-log';

type WindowMode = 'normal' | 'minimized' | 'maximized';

type Point = { x: number; y: number };
type Size = { width: number; height: number };

interface DesktopWindowState {
  id: ProgramId;
  title: string;
  isOpen: boolean;
  mode: WindowMode;
  position: Point;
  size: Size;
  restorePosition?: Point;
  restoreSize?: Size;
}

interface RetroDesktopState {
  windows: Record<ProgramId, DesktopWindowState>;
  zOrder: ProgramId[];
  activeProgramId: ProgramId | null;
  selectedCafeId: string | null;
  selectedIssueId: string | null;
  activeFilters: string[];
  savedCafeIds: string[];
  taskbarBadges: Partial<Record<ProgramId, number>>;
}
```

### 9.2 공통 액션

```ts
openProgram(programId: ProgramId): void;
closeProgram(programId: ProgramId): void;
minimizeProgram(programId: ProgramId): void;
toggleMaximizeProgram(programId: ProgramId): void;
focusProgram(programId: ProgramId): void;
moveProgram(programId: ProgramId, position: Point): void;
resizeProgram(programId: ProgramId, size: Size): void;
resetDesktopLayout(): void;
selectCafe(cafeId: string): void;
openCafeInMap(cafeId: string): void;
saveCafe(cafeId: string): Promise<void>;
stampVisit(cafeId: string, payload: VisitLogInput): Promise<void>;
```

### 9.3 상태 지속성

로컬에 저장해도 되는 항목:

- 창 위치와 크기
- 최소화·열림 상태
- 마지막 활성 프로그램
- 레이아웃 버전

기존 계정 또는 서버 데이터로 관리해야 하는 항목:

- 저장 카페
- 방문 기록
- 개인 메모

사용자 데이터의 소스 오브 트루스를 변경하지 않는다.

### 9.4 레이아웃 버전

레이아웃 스키마 변경에 대비해 버전을 둔다.

```ts
interface PersistedDesktopLayout {
  version: 1;
  windows: Partial<Record<ProgramId, Pick<DesktopWindowState, 'position' | 'size' | 'mode'>>>;
}
```

버전이 맞지 않거나 파싱에 실패하면 기본 레이아웃으로 복구한다.

---

## 10. 컴포넌트 아키텍처

기존 프로젝트 구조에 맞춰 경로를 조정하되, 책임 분리는 아래를 기준으로 한다.

```text
features/retro-desktop/
├─ RetroDesktopRoute
├─ shell/
│  ├─ RetroDesktopShell
│  ├─ DesktopTopBar
│  ├─ DesktopCanvas
│  ├─ DesktopShortcut
│  ├─ DesktopTaskbar
│  ├─ TaskbarButton
│  └─ WindowMenu
├─ windowing/
│  ├─ ProgramWindow
│  ├─ WindowTitleBar
│  ├─ WindowControls
│  ├─ WindowMenuBar
│  ├─ WindowStatusBar
│  ├─ useWindowDrag
│  ├─ useWindowResize
│  └─ windowBounds
├─ programs/
│  ├─ local-zine/
│  │  ├─ LocalZineProgram
│  │  ├─ IssueCover
│  │  ├─ StoryNavigation
│  │  └─ EditorialActions
│  ├─ cafe-index/
│  │  ├─ CafeIndexProgram
│  │  ├─ CafeFilterPanel
│  │  ├─ CafeRecordList
│  │  ├─ CafeRecordDetail
│  │  └─ VerificationStatus
│  ├─ brewmap-map/
│  │  └─ BrewMapProgram
│  └─ brew-log/
│     ├─ BrewLogProgram
│     ├─ LogFolderTree
│     ├─ SavedCafeList
│     ├─ CafeLogDetail
│     └─ VisitStampDialog
├─ state/
│  ├─ retroDesktopStore
│  ├─ selectors
│  ├─ persistence
│  └─ events
├─ data/
│  ├─ cafeAdapter
│  ├─ editorialAdapter
│  └─ savedCafeAdapter
├─ styles/
│  ├─ retro-desktop-tokens
│  ├─ window-chrome
│  └─ texture
└─ tests/
```

### 중요

- `ProgramWindow`는 데이터나 프로그램 로직을 알지 않는다.
- 프로그램은 창 이동·z-index를 직접 관리하지 않는다.
- 카페 데이터 접근은 adapter를 통해 기존 서비스 계층에 연결한다.
- UI 문구와 파일명은 별도 상수 또는 i18n 체계를 사용한다.

---

## 11. 디자인 시스템

### 11.1 기존 토큰 우선

저장소에서 현재 BrewMap 토큰을 찾고 아래 의미 토큰으로 연결한다. 실제 HEX 값을 새로 하드코딩하지 않는다.

```css
:root {
  --retro-desktop-bg: var(--brewmap-background);
  --retro-window-surface: var(--brewmap-surface);
  --retro-window-active: var(--brewmap-primary);
  --retro-window-inactive: var(--brewmap-muted);
  --retro-accent: var(--brewmap-accent);
  --retro-ink: var(--brewmap-text-primary);
  --retro-border: var(--brewmap-border-strong);
  --retro-focus: var(--brewmap-focus);
}
```

현재 토큰 이름이 다르면 저장소의 이름에 맞춰 매핑한다.

### 11.2 창 외형

```css
.retro-window {
  border: 1px solid var(--retro-border);
  border-radius: 2px;
  background: var(--retro-window-surface);
  box-shadow: 3px 3px 0 var(--retro-border);
  overflow: hidden;
}

.retro-window[data-active='false'] {
  box-shadow: 2px 2px 0 var(--retro-border);
}

.retro-titlebar {
  min-height: 32px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--retro-border);
  background: var(--retro-window-active);
}

.retro-window[data-active='false'] .retro-titlebar {
  background: var(--retro-window-inactive);
}
```

### 11.3 규격

| 요소 | 규격 |
|---|---|
| 창 외곽선 | 1px 단색 |
| 모서리 | 0–3px |
| 하드 섀도 | 2–3px, blur 없음 |
| 타이틀 바 | 30–34px |
| 메뉴 바 | 24–28px |
| 상태 표시줄 | 22–26px |
| 내부 간격 | 8px 또는 12px 단위 |
| 기본 터치 영역 | 최소 44 × 44px 권장 |

### 11.4 타이포그래피

- 프로그램명·상태·파일명: 기존 모노스페이스 또는 픽셀 인상 서체
- 큐레이션 제목: 기존 명조 또는 디스플레이 서체
- 본문·주소·운영시간·버튼: 기존 산세리프
- 본문 최소 크기: 15–16px
- 픽셀 폰트는 긴 한국어 본문에 사용하지 않는다.

### 11.5 아이콘

- 기존 BrewMap 아이콘을 변경하거나 픽셀화하지 않는다.
- 24px 또는 32px 타일과 파일 라벨로 프로그램 아이콘처럼 포장한다.
- 선택 상태는 배경 반전, 테두리, 텍스트 대비로 표현한다.
- 더블 클릭은 데스크톱의 선택적 보조 동작이다. 단일 클릭 또는 키보드로도 열 수 있어야 한다.

### 11.6 배경과 질감

- 질감은 비어 있는 데스크톱 영역에만 미세하게 적용한다.
- 불투명도는 1–3% 수준으로 제한한다.
- 지도, 본문, 작은 텍스트 위에는 노이즈를 덮지 않는다.
- 종이, CRT, VHS 효과를 한 화면에서 동시에 사용하지 않는다.

### 11.7 이미지

- 큐레이션 사진: 4:3 또는 원본 콘텐츠 정책에 맞는 비율
- 1px 테두리 가능
- 썸네일에 한해 약한 디더링 또는 저채도 효과 허용
- 상세 사진은 원본 품질과 색상 판단이 가능해야 한다.

### 11.8 버튼

- 캡슐형 버튼보다 사각 버튼을 사용한다.
- 상단 밝은 선, 하단 어두운 선으로 약한 입체감을 줄 수 있다.
- 눌림 시 1px 아래로 이동한다.
- 아이콘 전용 버튼은 accessible label과 툴팁을 제공한다.

### 11.9 모션

권장 시간:

- 창 활성화: 80–120ms
- 창 열기·복원: 140–200ms
- 잡지 페이지 전환: 150–200ms
- 파일 저장·방문 도장: 200–300ms

`prefers-reduced-motion`에서는 위치 이동과 장식 모션을 제거하거나 단순 페이드로 대체한다.

---

## 12. 반응형 규칙

### Desktop — 1024px 이상

- 창 이동, 겹침, 최소화, 최대화 지원
- 작업 표시줄 고정
- 2–3개 창 동시 노출
- `CAFE_INDEX.EXE`는 3열 구성

### Tablet — 768–1023px

- 자유 드래그를 제한하거나 비활성화할 수 있다.
- 2열 스냅 또는 한 번에 1–2개 창 표시
- `CAFE_INDEX.EXE`는 필터 드로어 + 결과·상세 2열

### Mobile — 767px 이하

- 한 번에 한 프로그램만 전체 화면
- 창 이동 및 리사이즈 없음
- 타이틀 바와 창 외형은 유지
- 하단 작업 표시줄을 프로그램 내비게이션으로 사용
- 브라우저 뒤로 가기와 창 닫기의 결과를 일치시킨다.

```text
┌─ LOCAL_ZINE.EXE ───────────────── × ┐
│                                      │
│             프로그램 콘텐츠          │
│                                      │
├──────────────────────────────────────┤
│ [발견] [인덱스] [지도] [주변] [장부] │
└──────────────────────────────────────┘
```

### 모바일 프로그램 매핑

- 발견 → `LOCAL_ZINE.EXE`
- 인덱스 → `CAFE_INDEX.EXE`
- 지도 → `BREWMAP.EXE`
- 주변 → `NEARBY_MAP.EXE`
- 장부 → `BREW_LOG.EXE`

---

## 13. 라우팅과 히스토리

- 기본 진입점은 상단 `Retro Desktop`과 하단 `Classic Workspace`를 함께 렌더링한다.
- `#home`은 레트로 작업 영역을, `#workspace` 또는 `#legacy-home`은 기존 UI 영역을 가리킬 수 있다.
- 프로그램 열기와 선택 카페를 URL에 반영할 수 있으면 권장한다.
- 예시 형태는 기존 라우터 정책에 맞춘다.

```text
/labs/retro-desktop?app=cafe-index&cafe=CAFE_ID
```

모바일에서:

- 프로그램 열기 → history push
- 창 닫기 또는 브라우저 뒤로 가기 → 이전 프로그램 복원

데스크톱에서 모든 창 이동 좌표를 URL에 넣지 않는다.

---

## 14. 접근성

### 필수 조건

- 창 타이틀과 프로그램 이름을 스크린 리더가 읽을 수 있어야 한다.
- 창 이동 기능과 무관하게 문서 DOM 순서는 논리적이어야 한다.
- 활성 창 전환 시 포커스를 적절히 이동한다.
- 닫기, 최소화, 최대화 버튼에 한국어 accessible label을 제공한다.
- 모든 기능을 키보드로 수행할 수 있어야 한다.
- 포커스 링은 기존 브랜드 focus token으로 명확히 표시한다.
- 색만으로 활성·저장·오류 상태를 구분하지 않는다.
- 본문과 UI 텍스트 대비를 기존 접근성 기준 이상으로 유지한다.
- 작은 레트로 아이콘의 시각 크기와 별개로 실제 클릭 영역은 충분히 확보한다.
- `prefers-reduced-motion`을 지원한다.

### 권장 키보드 동작

- `Tab`: 현재 창 내부 순회
- `Shift + Tab`: 역순
- `Escape`: 메뉴 또는 다이얼로그 닫기
- `Enter` / `Space`: 프로그램·버튼 실행
- 선택적 P1: 프로그램 전환 단축키

창 드래그를 키보드의 필수 조작 방식으로 요구하지 않는다. 이동하지 않아도 모든 기능을 사용할 수 있어야 한다.

---

## 15. 성능

- 지도 프로그램은 실제로 열릴 때 lazy load한다.
- 각 프로그램의 무거운 콘텐츠도 필요 시 분할 로딩한다.
- 데스크톱 배경 효과에 연속 캔버스 애니메이션을 사용하지 않는다.
- `mousemove` 기반 드래그는 requestAnimationFrame 또는 검증된 드래그 유틸리티로 최적화한다.
- 창 이동 중 데이터 컴포넌트가 불필요하게 재렌더링되지 않도록 한다.
- 사진은 기존 이미지 최적화 전략을 따른다.
- 초기 화면은 `LOCAL_ZINE.EXE`와 셸에 필요한 코드만 우선 로드한다.

---

## 16. 이벤트 및 분석

기존 분석 도구가 있다면 아래 이벤트를 기존 네이밍 규칙에 맞춰 추가한다.

| 이벤트 | 주요 속성 |
|---|---|
| `retro_desktop_viewed` | viewport, entryRoute |
| `retro_program_opened` | programId, source |
| `retro_program_closed` | programId |
| `retro_cafe_selected` | cafeId, sourceProgram |
| `retro_open_in_map` | cafeId, sourceProgram |
| `retro_cafe_saved` | cafeId, sourceProgram |
| `retro_visit_stamped` | cafeId |
| `retro_filter_applied` | filterId |
| `retro_layout_reset` | viewport |

개인 메모 내용은 분석 이벤트에 포함하지 않는다.

---

## 17. 오류·빈 상태 원칙

- 레트로 문구를 사용하더라도 오류 원인은 명확하게 설명한다.
- `ERROR 404` 같은 장식만 노출하지 않는다.
- 모든 오류 화면에 재시도 또는 안전한 복귀 액션을 둔다.
- 네트워크 오류가 나도 창 전체를 강제로 닫지 않는다.
- 데이터 없는 상태에서는 다른 프로그램으로 이동할 수 있는 버튼을 제공한다.

예시:

```text
CAFE RECORDS NOT FOUND
선택한 조건에 맞는 카페가 없습니다.
[필터 초기화] [오늘의 발견 열기]
```

---

## 18. 테스트 계획

### Unit

- z-order 재정렬
- 창 열기·닫기·최소화·복원
- 최대화 전 위치·크기 복원
- 뷰포트 경계 계산
- 레이아웃 persistence 파싱 실패 폴백
- 프로그램 간 `selectedCafeId` 공유
- 저장 후 taskbar badge 갱신

### Component / Interaction

- 타이틀 바 드래그
- 창 제어 버튼
- 작업 표시줄에서 복원
- `LOCAL_ZINE` → 지도 → 인덱스 연결
- 인덱스에서 저장 → 장부 반영
- 방문 도장 다이얼로그
- loading, empty, error 상태

### E2E

1. 실험용 라우트 진입
2. 오늘의 발견에서 카페 선택
3. 지도에서 위치 확인
4. 인덱스 상세 확인
5. 저장
6. 장부에서 저장 상태 확인
7. 방문 기록 작성
8. 새로고침 후 레이아웃과 사용자 데이터 유지 확인

### Responsive

- 1440px 데스크톱
- 1024px 소형 데스크톱
- 768px 태블릿
- 390px 모바일

### 접근성

- 키보드 전용 탐색
- 포커스 순서
- 스크린 리더 레이블
- reduced motion
- 명도 대비

### Visual regression

- 비활성·활성 창
- 최소화·최대화 상태
- 3개 창 기본 배치
- 모바일 전체 화면 프로그램
- 로딩·빈 상태·오류 상태

---

## 19. MVP 구현 순서

### Phase 0 — 저장소 감사

- [ ] 현재 프레임워크, 라우터, 상태 관리, 스타일 시스템 확인
- [ ] 기존 컬러·타이포·아이콘 토큰 위치 확인
- [ ] 카페 목록·상세·지도·저장 데이터 접근 경로 확인
- [ ] 인증 및 저장 정책 확인
- [ ] 실험용 라우트 또는 feature flag 방식 결정
- [ ] 재사용 가능한 기존 컴포넌트 목록 작성

**산출물:** 간단한 구현 메모와 수정 대상 파일 목록

### Phase 1 — 데스크톱 셸과 창 관리자

- [ ] `RetroDesktopShell`
- [ ] 상단 바, 바탕화면, 작업 표시줄
- [ ] `ProgramWindow`
- [ ] open, close, focus, minimize, maximize, restore
- [ ] drag + viewport bounds
- [ ] 기본 창 배치
- [ ] layout reset
- [ ] 공통 토큰과 창 크롬 스타일
- [ ] 실험용 라우트 연결

**완료 기준:** 빈 프로그램 창 5개를 실제로 열고 이동·최소화·복원할 수 있다.

### Phase 2 — `LOCAL_ZINE.EXE`

- [ ] 기존 카페 또는 큐레이션 데이터 adapter
- [ ] 큰 이미지, 제목, 요약, 상태 표시줄
- [ ] 이전·다음 이야기
- [ ] 지도에서 열기
- [ ] 스크랩
- [ ] loading, empty, error

**완료 기준:** 큐레이션 카페를 선택하고 지도 프로그램에 전달할 수 있다.

### Phase 3 — `CAFE_INDEX.EXE` + `BREWMAP.EXE` + `NEARBY_MAP.EXE`

- [ ] 기존 검색·필터 연결
- [ ] 3단 인덱스 레이아웃
- [ ] 상세 레코드
- [ ] 신뢰 정보
- [ ] 기존 지도 컴포넌트 래핑
- [ ] `BREWMAP.EXE`와 `NEARBY_MAP.EXE`의 지도 역할 분리
- [ ] 프로그램 간 `selectedCafeId` 공유
- [ ] 지도 핀과 인덱스 상세 양방향 동기화

**완료 기준:** 필터 → 선택 → 지도 확인 → 상세 판단이 한 셸 안에서 동작한다.

### Phase 4 — `BREW_LOG.EXE`

- [ ] 기존 저장 API 또는 저장소 연결
- [ ] 폴더·목록·상세 3단 레이아웃
- [ ] 저장·삭제·분류
- [ ] 방문 도장 폼
- [ ] 개인 메모
- [ ] 작업 표시줄 배지

**완료 기준:** 다른 프로그램에서 저장한 카페가 장부에 즉시 보이고 방문 기록을 남길 수 있다.

### Phase 5 — 반응형·접근성·안정화

- [ ] 태블릿 2열 또는 제한형 창 모드
- [ ] 모바일 전체 화면 프로그램 모드
- [ ] 브라우저 history 연동
- [ ] 키보드 탐색
- [ ] reduced motion
- [ ] 테스트
- [ ] 성능 점검
- [ ] visual regression

### Phase 6 — P1 폴리시

- [ ] 창 리사이즈
- [ ] 스냅
- [ ] 폴더 드래그 앤 드롭
- [ ] 레이아웃 persistence
- [ ] 공유용 잡지 표지 카드
- [ ] 동네 산책 코스

---

## 20. MVP 인수 조건

다음 조건을 모두 충족하면 MVP 완료로 본다.

### 셸

- [ ] 상단 `Retro Desktop`과 하단 `Classic Workspace`가 같은 페이지에서 공존한다.
- [ ] 다섯 프로그램을 바탕화면 또는 작업 표시줄에서 열 수 있다.
- [ ] 창을 이동, 활성화, 최소화, 최대화, 닫기, 복원할 수 있다.
- [ ] 창이 뷰포트 밖으로 완전히 사라지지 않는다.
- [ ] `Reset Layout`이 작동한다.

### 프로그램 연결

- [ ] `LOCAL_ZINE.EXE`에서 선택한 카페가 지도에 표시된다.
- [ ] 지도에서 선택한 카페가 `CAFE_INDEX.EXE` 상세에 반영된다.
- [ ] 인덱스 또는 매거진에서 저장하면 `BREW_LOG.EXE`에 즉시 반영된다.
- [ ] 모든 프로그램이 동일한 카페 ID와 저장 상태를 공유한다.

### 정보와 디자인

- [ ] 기존 BrewMap 컬러와 아이콘을 재사용한다.
- [ ] 별점이나 인기 순위가 큐레이션의 주 기준으로 보이지 않는다.
- [ ] 운영 정보와 검증 정보는 실제 데이터만 표시한다.
- [ ] 지도와 작은 텍스트 위에 시각 노이즈가 없다.
- [ ] 한국어 본문은 읽기 쉬운 기존 산세리프를 사용한다.

### 반응형·접근성

- [ ] 모바일에서는 한 번에 하나의 프로그램만 보인다.
- [ ] 모바일 브라우저 뒤로 가기가 정상 작동한다.
- [ ] 모든 핵심 기능을 키보드로 사용할 수 있다.
- [ ] 창 제어에 accessible label이 있다.
- [ ] reduced motion 설정을 지원한다.

### 안정성

- [ ] 기존 BrewMap의 지도, 검색, 저장, 제보, Admin 플로우를 `Classic Workspace`에서 계속 사용할 수 있다.
- [ ] `CLASSIC` 메뉴로 기존 UI 영역에 접근할 수 있다.
- [ ] 레이아웃 저장 데이터가 손상되어도 기본 배치로 복구된다.

---

## 21. Codex가 먼저 확인할 질문

아래 항목은 저장소에서 답을 찾는다. 찾을 수 없는 항목만 작업 기록에 남기고, Phase 1 구현은 가능한 범위에서 진행한다.

1. 현재 BrewMap의 프런트엔드 프레임워크와 라우팅 방식은 무엇인가?
2. 기존 컬러·폰트·아이콘 토큰은 어디에 정의되어 있는가?
3. 카페 목록, 상세, 지도 핀 데이터는 어떤 ID로 연결되는가?
4. 저장과 방문 기록은 서버, 계정, 로컬 중 어디에 보관되는가?
5. 기존 지도 컴포넌트를 프로그램 창 안에 마운트할 수 있는가?
6. 실험용 라우트 또는 feature flag 패턴이 이미 있는가?
7. 기존 테스트 환경과 visual regression 도구가 있는가?

---

## 22. Codex 착수 명령

아래 순서로 바로 작업한다.

1. 저장소를 스캔하고 현재 스택, 토큰, 카페 데이터 흐름, 지도·저장 컴포넌트를 파악한다.
2. 기존 구조를 유지한 채 실험용 라우트와 `RetroDesktopShell`의 최소 골격을 만든다.
3. 다섯 개의 빈 프로그램 창과 작업 표시줄을 연결한다.
4. 창 열기, 활성화, 이동, 최소화, 최대화, 닫기, 복원을 구현한다.
5. 기존 BrewMap 토큰을 의미 토큰으로 매핑해 창 크롬을 스타일링한다.
6. `LOCAL_ZINE.EXE`부터 실제 기존 데이터에 연결한다.
7. 각 Phase 완료 후 테스트를 추가하고 수정 파일, 결정 사항, 남은 위험을 기록한다.

### 구현 중 금지 사항

- 임의의 새 HEX 브랜드 컬러 추가
- 기존 아이콘을 픽셀 아트로 다시 제작
- 기존 카페 데이터를 mock 데이터로 영구 대체
- 지도 전체에 CRT·VHS 필터 적용
- 모바일에서 드래그 창 강제
- 작동하지 않는 장식용 창 버튼
- 저장·방문 기록 데이터를 별도 로컬 구조로 중복 저장
- 기존 라우트 또는 데이터 모델의 불필요한 전면 개편

---

## 23. 최종 제품 정의

완성된 BrewMap Retro Desktop은 다음처럼 느껴져야 한다.

> 사용자는 로컬 매거진 프로그램에서 한 장소를 발견하고, 카페 인덱스에서 자신의 방문 목적과 맞는지 판단하며, 지도 프로그램에서 위치를 확인하고, 단골 장부에 취향과 방문 기억을 저장한다. 화면은 1990년대 데스크톱처럼 보이지만, 검색·지도·저장·접근성은 현대적인 웹 서비스 수준으로 작동한다.
