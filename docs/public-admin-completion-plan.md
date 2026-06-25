# Public/Admin 분리 완료 계획

작성일: 2026-06-25
대상 브랜치: `codex/chatgpt-improvements-20260625`

## 목표

이 문서는 이전 점검에서 `부분 완료`로 남은 두 항목을 완료 상태로 만들기 위한 구현 계획이다.

1. Public과 Admin을 애플리케이션 및 권한 수준에서 분리한다.
2. 공개 첫 화면을 `검색 -> 결과 확인 -> 근거 확인 -> 저장`으로 이어지는 단일 핵심 흐름으로 정리한다.

`0개 결과`의 정상/오류/초기 상태 분리는 이미 구현되어 있으므로 이번 범위에서는 회귀 검증만 유지한다.

## 완료 기준

### Public 앱

- `index.html`의 첫 진입 화면은 검색 중심 공개 앱이어야 한다.
- Retro Desktop은 공개 홈의 선행 화면이나 hybrid wrapper가 아니라 별도 진입점으로 이동한다.
- 공개 앱 내비게이션은 검색, 결과, 지도, 저장, 제보 흐름만 안내한다.
- 결과 카드와 상세 모달은 제공 커피, 검증 출처, 최근 확인일, 신뢰도, 저장 상태를 한 흐름에서 확인할 수 있어야 한다.

### Admin 앱

- Admin 화면은 공개 앱 DOM과 분리된 별도 엔트리여야 한다.
- 로컬/운영 서버는 `/admin`, `/admin.html`, `/api/admin/*` 요청에 대해 인증을 요구해야 한다.
- 인증되지 않은 사용자는 Admin HTML과 Admin API에 접근할 수 없어야 한다.
- Admin 화면은 서버 세션 확인 전에는 쓰기성 조작을 비활성화해야 한다.
- Public PWA service worker는 Admin HTML을 공개 app shell로 캐시하지 않아야 한다.

## 구현 단계

1. 문서화
   - 이 문서를 추가하고 완료 기준을 검증 가능한 문장으로 고정한다.

2. Public 단일 흐름 전환
   - `index.html`에서 Retro Desktop root와 `legacy-app-mounts` hybrid wrapper를 제거한다.
   - 검색 앱의 `id="home"`을 공개 홈 앵커로 사용한다.
   - `retro.html`을 추가해 Retro Desktop을 별도 경험으로 이동한다.
   - `src/main.js`는 Retro root가 있을 때만 Retro Desktop 모듈을 동적으로 불러온다.
   - build, service worker, validation 기준을 새 엔트리에 맞게 갱신한다.

3. Admin 권한 경계 추가
   - `scripts/serve.mjs`에 Basic Auth 기반 Admin guard를 추가한다.
   - `/admin`과 `/admin.html`은 인증 성공 시에만 Admin HTML을 제공한다.
   - `/api/admin/session`은 인증된 관리자 세션만 `role: "admin"`으로 응답한다.
   - `/api/admin/*`의 쓰기 메서드는 인증 없이는 거절한다.
   - Admin 클라이언트는 세션 확인 전까지 폼과 반영 버튼을 비활성화한다.

4. 검증 및 PR 반영
   - `npm run lint`
   - `npm run data:check`
   - `npm run build`
   - `node --check src/main.js`
   - `node --check src/retro-desktop.js`
   - 로컬 서버 HTTP 확인:
     - `/` 200
     - `/retro.html` 200
     - `/admin` 인증 없음 401
     - `/api/admin/session` 인증 없음 401
     - `/admin` 인증 있음 200
     - `/api/admin/session` 인증 있음 200

## 배포 주의

이 권한 분리는 `scripts/serve.mjs`와 같은 서버 경계를 통과할 때 완성된다. `dist/`를 인증 없는 정적 호스팅에 그대로 배포하면 서버 권한 검증을 우회할 수 있으므로, 운영 배포는 `/admin`과 `/api/admin/*`를 보호하는 서버, edge middleware, 또는 equivalent access-control layer 뒤에 두어야 한다.
