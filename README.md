# BrewMap

BrewMap은 **“마시고 싶은 커피가 있는 카페를 찾는 지도”**를 목표로 하는 부산 우선 Web MVP / PWA 프로젝트입니다. 부산에서 먼저 검증한 뒤 서울로 확장합니다.

## MVP 원칙

- 1인 개발 기준으로 단순하게 시작합니다.
- 리뷰/별점/결제/네이티브 앱/서울·전국 확장은 MVP에서 제외합니다.
- Admin + 데이터 품질 + 지도 필터를 MVP의 본체로 둡니다.
- 초기 데이터 목표는 부산 베타 150개, 퍼블릭 MVP 150~300개입니다.

## 현재 구성

- Next.js App Router 기반 Vercel 배포 구조
- 공개 화면: 지도, 커피 필터, 카페 카드, 저장/제보 섹션
- 운영 화면: Basic Auth로 보호되는 `/admin` 라우트와 Admin 세션 API
- 레트로 데스크톱 앱 UI: 메뉴바, 창 프레임, 베벨 버튼, 격자형 배경 기반 앱 셸
- PWA 앱 쉘: manifest, theme color, service worker 기반 정적 자산 캐시
- 문서: MVP 실행 계획, 범위, 커피 태그 체계
- DB 초안: PostgreSQL/Supabase 기준 핵심 테이블 스키마
- Seed CSV: 초기 카페 데이터 입력 양식
- 개발 스크립트: Next.js build/dev, seed data QA, 프로젝트 구조 validate

## 개발 명령어

```bash
npm run dev
npm run build
npm run clean
npm run data:check
npm run lint
```


`npm run dev`와 `npm run build`는 실행 전에 `scripts/sync-public.mjs`로 favicon, manifest, service worker, seed CSV, 브랜드 SVG를 Next.js `public/` 폴더에 동기화합니다. `public/`, `.next/`, `out/`, `dist/`는 재생성 가능한 산출물입니다.

## Vercel 배포

- Framework Preset: Next.js
- Build Command: `npm run build`
- Install Command: `npm ci`
- Output Directory: Vercel 기본값 사용
- Admin 보호 환경 변수: `BREWMAP_ADMIN_PASSWORD` 필수, `BREWMAP_ADMIN_USER`는 기본값 `admin`

Admin 비밀번호가 없으면 `/admin`과 `/api/admin/*`는 401로 닫힙니다.

## 로컬 브랜치 전환 충돌 해결

로컬에서 다른 브랜치로 전환할 때 `dist/` 같은 빌드 산출물이나 작업 중인 파일 때문에 충돌이 나면 아래 순서로 정리합니다.

```bash
git status --short
npm run clean
git stash push -u -m "before-switch"
git fetch origin
git switch <target-branch>
```

- `npm run clean`은 재생성 가능한 Next.js 산출물인 `.next/`, `out/`, `dist/`, `public/`을 삭제합니다.
- 커밋하지 않은 작업이 있으면 `git stash push -u`로 추적/미추적 변경을 함께 보관한 뒤 브랜치를 전환합니다.
- 전환 후 필요하면 `git stash pop`으로 작업을 되돌립니다.

## 주요 문서

- `docs/mvp-plan.md`: 12주 실행 계획과 MVP 판단 기준
- `docs/scope.md`: P0/P1/P2 범위
- `docs/taxonomy.md`: 커피 태그, 동의어, 검증/신뢰도 정책
- `docs/search-layout-final-plan.md`: 검색 결과 중심 화면 전환 최종안과 레트로 데스크톱 앱 디자인 기준
- `docs/design-concepts.md`: 로컬 카페 앱 정체성을 위한 UI/UX 디자인 콘셉트
- `docs/ui-ux-beta-validation-checklist.md`: UI/UX 베타 검증 체크리스트와 현재/기대 동작 비교
- `docs/csv-format.md`: Excel 호환 CSV 입력 포맷
- `db/schema.sql`: 핵심 DB 스키마 초안
- `data/seed-cafes.csv`: Seed CSV 포맷