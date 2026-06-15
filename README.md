# BrewMap

BrewMap은 **“마시고 싶은 커피가 있는 카페를 찾는 지도”**를 목표로 하는 성수·연남 우선 Web MVP / PWA 프로젝트입니다.

## MVP 원칙

- 1인 개발 기준으로 단순하게 시작합니다.
- 리뷰/별점/결제/네이티브 앱/전국 확장은 MVP에서 제외합니다.
- Admin + 데이터 품질 + 지도 필터를 MVP의 본체로 둡니다.
- 초기 데이터 목표는 베타 150개, 퍼블릭 MVP 150~300개입니다.

## 현재 구성

- 정적 MVP 화면: 지도, 커피 필터, 카페 카드, 저장/제보/Admin 섹션
- 문서: MVP 실행 계획, 범위, 커피 태그 체계
- DB 초안: PostgreSQL/Supabase 기준 핵심 테이블 스키마
- Seed CSV: 초기 카페 데이터 입력 양식
- 개발 스크립트: 의존성 없는 build/serve/validate

## 개발 명령어

```bash
npm run dev
npm run build
npm run lint
```

## 주요 문서

- `docs/mvp-plan.md`: 12주 실행 계획과 MVP 판단 기준
- `docs/scope.md`: P0/P1/P2 범위
- `docs/taxonomy.md`: 커피 태그, 동의어, 검증/신뢰도 정책
- `db/schema.sql`: 핵심 DB 스키마 초안
- `data/seed-cafes.csv`: Seed CSV 포맷
