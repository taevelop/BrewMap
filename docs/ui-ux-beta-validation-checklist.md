# BrewMap UI/UX Beta Validation Checklist

## 검증 기준

- 최초 디자인 콘셉트: `docs/design-concepts.md`
- 레트로 데스크톱 명세: `docs/brewmap_retro_desktop_spec.md`
- 현재 검색/지도 앱 셸 설계: `docs/search-layout-final-plan.md`
- 현재 구현 메모: `docs/retro-desktop-implementation-notes.md`
- 주요 히스토리: `a1738e8` 디자인 샘플, `ff60ec4` 레트로 테마, `6196374` 모바일 보정, `eb4cc69` 레트로 UI 기본화, `6312c68` 레트로 작업공간 복구

## 체크리스트

| 영역 | 현재 동작 | 기대 동작 | 상태 |
| --- | --- | --- | --- |
| 첫 진입 | `LOCAL_ZINE.EXE`가 기본 활성 창으로 표시된다. | 로컬 매거진에서 발견을 시작한다. | Pass |
| 데스크톱 창 조작 | 창 열기, 포커스, 지도/인덱스 동시 열기, 작업표시줄 복원이 동작한다. | 창 기반 탐색 흐름을 유지한다. | Pass |
| 지도 연결 | `지도에서 열기`가 `CAFE_INDEX.EXE`와 `BREWMAP.EXE`를 열고 같은 카페를 선택한다. | 발견 -> 인덱스 -> 지도 선택 상태가 공유된다. | Pass |
| 인덱스 필터 | `filter_coffee` 선택 시 113개에서 24개로 줄어든다. | 필터 결과가 실제 capability 데이터와 일치한다. | Pass |
| 저장/장부 연결 | 저장한 카페가 `BREW_LOG.EXE` 목록에 즉시 나타난다. | 저장 상태와 장부가 같은 카페 ID를 공유한다. | Pass |
| 장부 알림 | 저장 후 장부 배지가 남아 있었다. | 장부를 열면 새 저장 알림 배지가 해소된다. | Fixed |
| 방문 기록 | 방문 도장이 즉시 카운트만 증가했다. | 날짜, 방문 형태, 메뉴, 메모를 입력한 뒤 방문 기록을 저장한다. | Fixed |
| 모바일 작업표시줄 | 파일명 중심 라벨이 좁은 화면에서 의미 파악이 느렸다. | 모바일에서는 발견, 인덱스, 지도, 장부 라벨을 사용한다. | Fixed |
| 별점/순위 배제 | 별점 데이터와 리뷰 중심 UI는 없다. | 큐레이션, 커피 가능 여부, 검증 정보를 우선한다. | Pass |
| 데이터 준비도 | Seed 113개, MVP 목표 150개 대비 37개 부족. decaf/cold_brew/flat_white 행이 없다. | 부산 closed beta 기준 150개 이상, MVP 필터별 샘플을 확보한다. | Gap |

## 검증 명령

```bash
npm run lint
npm run data:check
npm run build
```

## 화면 검증 산출물

- `artifacts/ui-ux-beta/after-desktop-initial.png`
- `artifacts/ui-ux-beta/after-desktop-filter.png`
- `artifacts/ui-ux-beta/after-desktop-brew-log.png`
- `artifacts/ui-ux-beta/after-desktop-visit-form-visible-2.png`
- `artifacts/ui-ux-beta/after-mobile-initial.png`
