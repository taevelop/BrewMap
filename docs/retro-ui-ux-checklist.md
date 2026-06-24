# BrewMap Retro UI/UX 점검 체크리스트

기준 문서: `docs/brewmap_retro_desktop_spec.md`  
작성일: 2026-06-24  
목적: 레트로 UI와 캡쳐 화면의 기존 UI가 같은 화면 흐름 안에서 공존하는지 확인하고, 기획 의도대로 수정한 뒤 완료 여부를 체크한다.

## 기획서 업데이트

- [x] `NEARBY_MAP.EXE`가 기획서 작성 이후 추가된 구성임을 명시한다.
- [x] `BREWMAP.EXE`는 선택 카페 중심 약도, `NEARBY_MAP.EXE`는 주변 일반 지도로 역할을 분리한다.
- [x] 모바일 작업 표시줄과 프로그램 목록 기준을 4개에서 5개 프로그램으로 갱신한다.
- [x] 기존 캡쳐 UI를 숨김 호환 DOM이 아니라 하단 `Classic Workspace`로 공존시키는 기준을 추가한다.

## 기획서 기준 vs 현재 구현 차이

| 항목 | 기획서 기준 | 확인한 현재 차이 | 기대 동작/수정 기준 | 완료 |
|---|---|---|---|---|
| 프로그램 구성 | 다섯 프로그램: `LOCAL_ZINE`, `CAFE_INDEX`, `BREWMAP`, `NEARBY_MAP`, `BREW_LOG` | 구현에는 `NEARBY_MAP`이 있으나 과거 문서 일부가 4개 프로그램 기준이었다. | 문서와 구현 메모를 5개 프로그램 기준으로 유지한다. | - [x] |
| 최초 진입 | `LOCAL_ZINE.EXE`만 열고 전면 표시 | 초기 상태와 Reset Layout이 과거에는 `CAFE_INDEX.EXE`까지 열었다. | 초기 상태와 Reset Layout 모두 `LOCAL_ZINE.EXE` 단일 창으로 시작한다. | - [x] |
| UI 공존 | 레트로 UI와 기존 캡쳐 UI가 함께 접근 가능 | PR #35 기준은 레거시 DOM을 숨기는 단독 레트로 화면이었다. | 레거시 DOM을 `hidden` 처리하지 않고 하단 `Classic Workspace`로 표시한다. | - [x] |
| 상단 메뉴 | 레트로 프로그램 전환과 기존 UI 이동을 분리 | 과거에는 레거시 앵커가 검색/지도/Admin으로 직접 흩어졌고, PR #35에서는 스크롤 메뉴가 제거됐다. | 레트로 프로그램 메뉴는 창을 열고, `CLASSIC`만 기존 UI 영역으로 스크롤한다. | - [x] |
| 페이지 스크롤 | 레트로와 기존 UI가 한 문서 안에서 이어짐 | PR #35는 `overflow:hidden`과 100dvh로 기존 UI 접근을 막았다. | 페이지 스크롤을 허용하고 레트로 창 내부는 자체 스크롤을 사용한다. | - [x] |
| 지도 역할 | `BREWMAP`과 `NEARBY_MAP` 역할 분리 | 구현은 분리되어 있으나 누락 렌더러가 있었던 적이 있다. | `NEARBY_MAP` 렌더러와 지도 surface/위치 버튼을 검증한다. | - [x] |
| 모바일 작업 표시줄 | 5개 프로그램을 좁은 화면에서도 구분 | `NEARBY_MAP`에 모바일 라벨이 없었던 적이 있다. | `NEARBY_MAP` 모바일 라벨을 `주변`으로 유지한다. | - [x] |
| 배포 캐시 | 수정된 CSS/JS가 즉시 갱신 | HTML과 서비스워커 asset version이 과거 값으로 남을 수 있다. | HTML 쿼리와 서비스워커 캐시 버전을 갱신한다. | - [x] |
| 자동 검증 | 검증 스크립트가 기대 동작을 보호 | 기존 검증은 레거시 숨김을 기대했다. | 검증 기준을 하이브리드 노출, `CLASSIC` 스크롤, `NEARBY_MAP` 렌더링 포함으로 바꾼다. | - [x] |

## 완료 검증

- [x] `npm run lint`
- [x] `npm run data:check`
- [x] `npm run build`
- [x] 로컬 런타임에서 레트로 셸과 기존 캡쳐 UI가 같은 페이지에 공존함
- [x] 로컬 런타임에서 `CLASSIC` 메뉴가 기존 UI 영역으로 이동함
- [x] 로컬 런타임에서 `NEARBY_MAP.EXE`가 열리고 지도 타일/마커가 렌더링됨
- [x] 모바일 런타임에서 작업 표시줄 5개 라벨이 가로 스크롤 없이 표시됨
## 검증 결과

- [x] 2026-06-24 `npm run lint`: 통과
- [x] 2026-06-24 `npm run data:check`: CSV 구조 통과. 베타 목표 경고는 기존 데이터 확장 항목으로 유지된다.
- [x] 2026-06-24 `npm run build`: 통과
- [x] Chrome 데스크톱 런타임 검증: `bodyClass=is-retro-hybrid`, 레트로 높이 560px, 기존 UI 시작 위치 560px, 첫 화면 안에 Classic Workspace 상단 노출
- [x] Chrome 데스크톱 런타임 검증: 기존 UI `hidden=false`, `aria-hidden=null`, 검색 영역 visible, `CLASSIC` 클릭 후 `workspaceTop=0`
- [x] Chrome 데스크톱 런타임 검증: `NEARBY_MAP.EXE` 활성, 지도 타일 8개와 지도 마커/클러스터 18개 렌더링, 런타임 예외 0건
- [x] Chrome 모바일 런타임 검증: 390px 폭에서 작업 표시줄 5개 라벨 `발견`, `인덱스`, `지도`, `주변`, `장부`가 가로 스크롤 없이 표시
