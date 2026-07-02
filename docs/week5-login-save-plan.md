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

## 현재 진행도

| 순서 | 작업 | 상태 | 비고 |
| --- | --- | --- | --- |
| 1 | 저장 API 추가 | Done | `/api/saved-cafes` 조회, 저장, 해제 API 추가 |
| 2 | 인증 상태 모델 추가 | QA Pass | `guest`, `pending`, `authenticated`, `offline` 상태 연결 및 Supabase 환경 UI 확인 |
| 3 | 이메일 로그인 요청 추가 | QA Pass | Supabase Auth OTP 요청 UI 연결, 이메일 미입력 검증, 실메일 링크 수신 확인 |
| 4 | 로그인 콜백 처리 | QA Pass | URL access token 저장, `#saved` 정리, 계정 동기화 메시지 확인 |
| 5 | 임시 저장 병합 | Partial QA | 로그인 콜백 시 계정 저장 목록 동기화 확인, 사전 저장 항목 병합과 저장/해제 재검증 필요 |
| 6 | UI 상태 갱신 | QA Pass | 저장 패널, 상세 모달, 저장 목록, 레트로 렌더 갱신 경로 연결 및 비로그인 저장 스모크 통과 |

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

## 2026-06-29 QA 결과

| 항목 | 결과 |
| --- | --- |
| Supabase 환경 빌드 | Pass: 원본 `.env.local`의 공개 URL/키를 프로세스 환경에만 주입해 `npm run build` 통과 |
| Public cafe API | Pass: `/api/cafes`가 Supabase source로 113개 반환 |
| Saved cafes API 무인증 | Pass: `/api/saved-cafes` 무인증 요청 401 |
| Saved cafes API invalid token | Pass: invalid bearer token 요청 401 |
| 로그인 UI | Pass: Supabase 환경 빌드에서 로그인 버튼 활성화, 이메일 미입력 메시지 표시 |
| 매직링크 Redirect | Pass: Supabase OTP 요청 URL에 `redirect_to`를 명시했고 새 메일 링크가 Week 5 Vercel URL `#saved`로 복귀 |
| 비로그인 저장 | Pass: 상세 모달 저장, 저장 카운트 1개, localStorage 저장 확인 |
| 실메일 링크 | Pass: 2026-07-01 실제 이메일 링크로 로그인 처리 확인 |
| 실토큰 서버 저장/병합 | Partial: 로그인 후 계정 저장 목록 동기화 메시지 확인, 저장/해제 API 반영과 새로고침 유지 확인 필요 |

## 2026-07-01 재개 QA 결과

| 항목 | 결과 |
| --- | --- |
| 중단 지점 | Week 5 실메일 매직링크/콜백 QA |
| 로그인 링크 요청 | Pass: Week 5 Vercel URL 기준 Supabase OTP 요청 200 |
| 로그인 콜백 | Pass: `#saved`로 복귀, 계정 이메일 표시, 계정 저장 목록 동기화 메시지 확인 |
| 새로고침 세션 유지 | Fail -> Fix Applied: 저장 목록은 유지되지만 로그인 UI가 guest로 돌아가는 문제를 확인하고 refresh token 기반 세션 복구를 추가 |
| 로그인 화면 상태 | Fix Applied: checking/syncing/link_sent/authenticated/offline/expired 상태를 저장 패널에 표시하고 계정 저장과 이 기기 저장을 분리 |
| 남은 Live QA | 수정 배포 후 실계정으로 새로고침 로그인 유지, 카페 저장/해제 후 서버 저장 목록 반영, 로그아웃 후 임시 저장 fallback 확인 |

## 2026-07-02 재개 QA 결과

| 항목 | 결과 |
| --- | --- |
| 로컬 환경 | `.env.local` 없음. Supabase 실메일/실토큰 QA는 로컬에서 재현 불가 |
| 정적 검증 | Pass: `npm run lint` |
| 데이터 검증 | Pass: `npm run data:check` 구조 통과. 113/150개, 평균 태그 2.5/3.0, `decaf`/`cold_brew`/`flat_white` 커버리지 경고 유지 |
| 빌드 검증 | Pass: `npm run build` |
| 로컬 HTTP | Pass: `/` 200, `/api/saved-cafes` GET/POST/DELETE 무인증 요청 401 |
| 비로그인 저장 새로고침 | Pass: headless Chrome에서 `brewmap.savedCafes.v1` 저장 후 새로고침 시 저장 카운트 1개와 저장 목록 유지 |
| API 실패 fallback | Pass: Supabase 환경 변수가 없는 상태에서 동기화 실패 시 저장 목록과 localStorage 임시 저장 유지 |
| 남은 Live QA | current fix 배포 후 실계정 refresh token 세션 유지, 인증 저장/해제 서버 반영, 로그아웃 후 임시 저장 fallback 확인 |

## 2026-07-02 Production Live QA 결과

| 항목 | 결과 |
| --- | --- |
| 배포 기준 | Pass: Vercel production 최신 배포가 `fix: persist saved auth session state (#52)` / main `9a1d1cabab4a5b1fca0cf8b27f5fbe4892e8264f` 기준 READY |
| Production URL | Pass: `https://brew-54432877d-brew-map-kr.vercel.app` 200 |
| Vercel 기본 alias | Pass: `https://brew-map-brew-map-kr.vercel.app` 200 |
| Custom apex domain | Pass: `https://brewmapkr.com`은 308로 `https://www.brewmapkr.com/`에 redirect되고 최종 200 응답 |
| Custom www domain | Pass: `www.brewmapkr.com`이 `cname.vercel-dns.com` CNAME으로 해석되고 HTTPS 200 응답 |
| 저장 API 인증 경계 | Pass: production `/api/saved-cafes` GET/POST/DELETE 무인증 요청 모두 401 |
| 비로그인 저장 새로고침 | Pass: production headless Chrome에서 `brewmap.savedCafes.v1` 저장 후 새로고침 시 저장 카운트 1개, 저장 목록 `에어리커피` 유지 |
| 세션 실패 fallback | Pass: production에서 invalid access token과 invalid refresh token 모두 `expired` 상태로 전환하고 localStorage 저장 목록 유지 |
| 남은 실계정 QA | 실계정 저장 목록 동기화는 확인 완료. 남은 항목은 새로고침 세션 유지, 인증 저장/해제 서버 반영, 로그아웃 후 임시 저장 fallback 확인 |
| 실계정 저장 목록 동기화 | Pass: `tykim224@icloud.com` 로그인 후 계정 저장 목록 4개가 표시되고 저장 목록 동기화 확인 |
| 로그인 링크 UI 문구 | Deployed: PR #53 / production `66c0b34fc784bb684c73ff3d0ad212de630ac1e1` 기준 READY. `link_sent` 상태의 로그인 링크 발송 문구가 상단 안내와 하단 상태 영역에 중복 표시되어 하단 상태를 비우도록 수정 |

## 현재 QA 항목 목록

| 항목 | 상태 | 다음 조치 |
| --- | --- | --- |
| 도메인/DNS | Done | `brewmapkr.com` -> `www.brewmapkr.com` redirect와 `www` HTTPS 200 확인 완료 |
| 실메일 링크/콜백 | Done | `tykim224@icloud.com` magic link 로그인과 계정 저장 목록 동기화 확인 완료 |
| 저장 목록 동기화 | Done | `tykim224@icloud.com` 로그인 후 계정 저장 목록 4개 표시 확인 완료 |
| 로그인 링크 UI 문구 | Deployed | production `66c0b34fc784bb684c73ff3d0ad212de630ac1e1` 배포 완료. 다음 로그인 링크 요청 화면에서 문구 1회 표시 최종 확인 |
| 새로고침 세션 유지 | Todo | 로그인 상태에서 새로고침 후 `로그인됨`/`계정 저장` 유지 확인 |
| 인증 저장/해제 서버 반영 | Todo | 로그인 상태에서 저장/해제 후 Supabase `saved_cafes` 추가/삭제 확인 |
| 로그아웃 fallback | Todo | 로그아웃 후 localStorage 기반 임시 저장/새로고침 유지 확인 |
## QA 시나리오

| 시나리오 | 기대 결과 |
| --- | --- |
| 비로그인 저장 | localStorage에 저장되고 새로고침 후 유지된다. |
| 이메일 로그인 요청 | Supabase 로그인 메일 요청 결과가 저장 패널에 표시된다. |
| 로그인 콜백 | URL 토큰을 세션으로 저장하고 URL fragment를 제거한다. |
| 로그인 직후 병합 | 로그인 전 저장 항목이 서버 저장 목록으로 이동한다. |
| 로그인 저장/해제 | Supabase 저장 목록에 반영되고 UI가 즉시 갱신된다. |
| 새로고침 세션 유지 | 저장된 세션이 있으면 refresh token으로 access token을 복구하고 로그인 상태를 유지한다. |
| 저장 상태 표시 | 계정 저장, 이 기기 저장, 동기화 중, 링크 발송, 만료 상태를 사용자가 구분할 수 있다. |
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
