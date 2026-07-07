# Retro Desktop Implementation Notes

> **Superseded — 기록용 문서.** 이 노트의 기술 전제(의존성 없는 정적 Web MVP, `index.html` 해시 라우팅, CSV 소스 오브 트루스, 하이브리드 첫 화면)는 2026-06-25 Next.js App Router + Supabase 전환으로 더 이상 유효하지 않다. 현행 아키텍처는 `docs/supabase-setup.md`와 README를, 레트로 별관(`/retro`) 명세는 `docs/brewmap_retro_desktop_spec.md`를 참조한다.

## Phase 0 감사 결과

- 현재 BrewMap은 의존성 없는 정적 Web MVP입니다. 라우팅은 별도 프레임워크 없이 `index.html`과 해시 앵커를 사용합니다.
- 현재 운영 UI는 상단 `Retro Desktop`과 하단 `Classic Workspace`가 공존하는 하이브리드 화면입니다. 기존 검색/지도/저장/Admin DOM은 호환성 목적의 숨김 영역이 아니라 사용자가 직접 볼 수 있는 기존 UI 영역으로 유지합니다.
- 카페 데이터의 소스 오브 트루스는 `data/seed-cafes.csv`이고, `src/main.js`에서 CSV를 검증한 뒤 `cafes` 배열로 로드합니다.
- 저장 상태는 기존 `brewmap.savedCafes.v1` localStorage 키와 `savedCafeIds` Set으로 관리합니다.
- 지도는 `src/map-services.js`의 provider adapter와 `assets/brewmap-cafe-marker*.svg`를 사용합니다.
- 브랜드 토큰은 `src/styles.css`의 `--brewmap-*` CSS 변수입니다. 레트로 실험 화면도 이 토큰을 기준으로 스타일을 매핑합니다.

## 이번 구현 범위

- `src/retro-desktop.js`에 Retro Desktop 셸과 창 관리자 모듈을 분리합니다.
- `LOCAL_ZINE.EXE`, `CAFE_INDEX.EXE`, `BREWMAP.EXE`, `NEARBY_MAP.EXE`, `BREW_LOG.EXE` 다섯 프로그램을 같은 카페 데이터와 저장 상태에 연결합니다.
- `BREWMAP.EXE`는 선택 카페 중심 약도와 같은 권역 주변 카페 확인 역할을 맡습니다.
- `NEARBY_MAP.EXE`는 내 위치/현재 지점 기준 일반 지도 역할을 맡고, 실제 지도 타일, 카페 핀, 확대/축소, 드래그 이동을 제공합니다.
- 창 열기, 포커스, 드래그 이동, 최소화, 최대화/복원, 닫기, 작업 표시줄 복원, Reset Layout을 P0로 구현합니다.
- 최초 진입과 Reset Layout은 `LOCAL_ZINE.EXE`만 열고 전면에 표시합니다.
- 레트로 작업 영역은 고정 높이 안에서 자체 스크롤을 사용하고, 기존 캡쳐 UI는 바로 아래 `Classic Workspace`로 표시합니다.
- 상단 `CLASSIC` 메뉴는 기존 UI 영역으로 스크롤합니다.
- 모바일에서는 레트로 활성 프로그램을 먼저 보여주고, 기존 UI는 아래로 이어지는 스크롤 영역에서 접근합니다.

## 남은 계획

1. 실제 카페 이미지 또는 editorial 필드가 추가되면 `LOCAL_ZINE.EXE`의 커버 그래픽을 데이터 기반 이미지로 교체합니다.
2. 기존 지도 provider를 창 내부에 직접 마운트할 수 있도록 지도 렌더링 어댑터를 분리합니다.
3. 방문 도장 폼을 날짜, 방문 형태, 메뉴, 메모 입력 구조로 확장합니다.
4. 레이아웃 persistence와 창 리사이즈는 Phase 6 P1로 추가합니다.
5. 키보드 창 전환, 스냅, visual regression은 안정화 단계에서 보강합니다.