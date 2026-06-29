# Week 5 Login And Saved Cafes Plan

작성일: 2026-06-29

## 목표

Week 5의 목표는 로그인 사용자가 저장한 카페를 여러 기기에서 유지할 수 있게 만드는 것이다. 비로그인 사용자는 기존처럼 현재 기기 기준 임시 저장을 사용할 수 있어야 한다.

## 현재 기준

| 항목 | 상태 |
| --- | --- |
| Week 4 필터/상세/외부 지도 검증 | Done |
| 저장 UI | localStorage 기반 임시 저장 구현됨 |
| 로그인 UI | 안내 문구만 있고 실제 인증 미연결 |
| DB 스키마 | `users`, `saved_lists`, `saved_cafes` 준비됨 |
| Supabase 공개 카페 조회 | `/api/cafes`에서 Supabase REST API 사용 |

## 구현 원칙

- MVP 로그인은 Supabase Auth 이메일 링크 방식을 기본으로 한다.
- 로그인 전 저장은 `brewmap.savedCafes.v1` localStorage 키를 유지한다.
- 로그인 후 저장은 Supabase `saved_lists`와 `saved_cafes`를 기준으로 한다.
- 로그인 직후 localStorage 저장 카페를 계정 저장 목록으로 병합한다.
- 저장/해제 상태는 카드, 상세 모달, 저장 목록, 레트로 데스크톱 UI가 같은 상태를 보도록 유지한다.
- Supabase 환경 변수가 없거나 인증 세션이 없으면 기존 비로그인 저장 흐름으로 degrade한다.

## 1차 구현 범위

| 순서 | 작업 | 완료 기준 |
| --- | --- | --- |
| 1 | 저장 API 추가 | 인증 토큰이 있는 사용자가 저장 목록 조회, 저장, 해제를 할 수 있다. |
| 2 | 인증 상태 모델 추가 | 클라이언트가 로그인 전/후/동기화 실패 상태를 구분한다. |
| 3 | 이메일 로그인 요청 추가 | 사용자가 저장 패널에서 이메일 링크 로그인을 요청할 수 있다. |
| 4 | 로그인 콜백 처리 | Supabase 이메일 링크로 돌아온 토큰을 읽고 세션을 저장한다. |
| 5 | 임시 저장 병합 | 로그인 직후 localStorage 저장 항목을 서버 저장 목록에 병합한다. |
| 6 | UI 상태 갱신 | 저장 카운트, 저장 목록, 카드/상세 버튼이 서버 상태와 동기화된다. |

## API 설계

### `GET /api/saved-cafes`

- 입력: `Authorization: Bearer <supabase access token>`
- 동작: 기본 저장 리스트를 보장하고, 저장된 `cafe_id` 배열을 반환한다.
- 응답 예시:

```json
{ "savedCafeIds": ["busan-jung-airy-coffee"] }
```

### `POST /api/saved-cafes`

- 입력: `Authorization` 헤더와 `{ "cafeId": "..." }`
- 동작: 기본 저장 리스트를 보장한 뒤 해당 카페를 저장한다.
- 응답 예시:

```json
{ "savedCafeIds": ["busan-jung-airy-coffee"] }
```

### `DELETE /api/saved-cafes`

- 입력: `Authorization` 헤더와 `{ "cafeId": "..." }`
- 동작: 기본 저장 리스트에서 해당 카페 저장을 해제한다.
- 응답 예시:

```json
{ "savedCafeIds": [] }
```

## 클라이언트 상태 설계

| 상태 | 의미 | UI |
| --- | --- | --- |
| `guest` | 로그인 없음 | 현재 기기에 임시 저장됨 |
| `pending` | 로그인/동기화 진행 중 | 저장 상태 확인 중 |
| `authenticated` | Supabase 세션 있음 | 계정에 저장됨 |
| `offline` | 인증 또는 저장 API 실패 | 임시 저장으로 유지 |

## QA 시나리오

| 시나리오 | 기대 결과 |
| --- | --- |
| 비로그인 저장 | localStorage에 저장되고 새로고침 후 유지된다. |
| 이메일 로그인 요청 | Supabase 로그인 메일 요청 결과가 저장 패널에 표시된다. |
| 로그인 콜백 | URL 토큰을 세션으로 저장하고 URL fragment를 제거한다. |
| 로그인 직후 병합 | 로그인 전 저장 항목이 서버 저장 목록으로 이동한다. |
| 로그인 저장/해제 | Supabase 저장 목록에 반영되고 UI가 즉시 갱신된다. |
| API 실패 | 기존 localStorage 저장으로 되돌아가며 오류 상태를 표시한다. |

## 검증 명령

```bash
npm run lint
npm run data:check
npm run build
```

## 착수 기준

- 브랜치: `codex/week5-login-save`
- 기준 커밋: `origin/main`
- 1차 착수 파일: `docs/week5-login-save-plan.md`, `app/api/saved-cafes/route.js`, `src/main.js`, `app/page.jsx`, `src/styles.css`
