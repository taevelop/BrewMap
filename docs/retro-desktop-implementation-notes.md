# Retro Desktop Implementation Notes

## Phase 0 감사 결과

- 현재 BrewMap은 의존성 없는 정적 Web MVP입니다. 라우팅은 별도 프레임워크 없이 `index.html`과 해시 앵커를 사용합니다.
- 카페 데이터의 소스 오브 트루스는 `data/seed-cafes.csv`이고, `src/main.js`에서 CSV를 검증한 뒤 `cafes` 배열로 로드합니다.
- 저장 상태는 기존 `brewmap.savedCafes.v1` localStorage 키와 `savedCafeIds` Set으로 관리합니다.
- 지도는 `src/map-services.js`의 provider adapter와 `assets/brewmap-cafe-marker*.svg`를 사용합니다.
- 브랜드 토큰은 `src/styles.css`의 `--brewmap-*` CSS 변수입니다. 레트로 실험 화면도 이 토큰을 기준으로 스타일을 매핑합니다.
- 기존 서비스 기본 화면을 덮지 않기 위해 실험 진입점은 `#retro-desktop` 해시 라우트로 둡니다.

## 이번 구현 범위

- `src/retro-desktop.js`에 Retro Desktop 셸과 창 관리자 모듈을 분리합니다.
- `LOCAL_ZINE.EXE`, `CAFE_INDEX.EXE`, `BREWMAP.EXE`, `BREW_LOG.EXE` 네 프로그램을 같은 카페 데이터와 저장 상태에 연결합니다.
- 창 열기, 포커스, 드래그 이동, 최소화, 최대화/복원, 닫기, 작업 표시줄 복원, Reset Layout을 P0로 구현합니다.
- 모바일에서는 자유 배치 창을 숨기고 활성 프로그램 하나만 전체 화면으로 표시합니다.

## 남은 계획

1. 실제 카페 이미지 또는 editorial 필드가 추가되면 `LOCAL_ZINE.EXE`의 커버 그래픽을 데이터 기반 이미지로 교체합니다.
2. 기존 지도 provider를 창 내부에 직접 마운트할 수 있도록 지도 렌더링 어댑터를 분리합니다.
3. 방문 도장 폼을 날짜, 방문 형태, 메뉴, 메모 입력 구조로 확장합니다.
4. 레이아웃 persistence와 창 리사이즈는 Phase 6 P1로 추가합니다.
5. 키보드 창 전환, 스냅, visual regression은 안정화 단계에서 보강합니다.
