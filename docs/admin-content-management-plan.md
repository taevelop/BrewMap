# Admin Page And Content Management Plan

작성일: 2026-07-06

## 목표

Admin을 카페 데이터 운영 도구에서 공개 페이지와 콘텐츠를 관리하는 운영 콘솔로 확장한다. MVP 범위에서는 정적 CMS 전체를 만들기보다, 공개 홈과 주요 안내 콘텐츠를 운영자가 배포 없이 수정할 수 있는 최소 흐름을 만든다.

## 전체 흐름 내 위치

주차별 진행 상태는 `docs/work-board.md`에서만 관리한다. 이 계획은 Week 6 제보/Admin 단계의 첫 작업으로 편입되었다.

Admin 콘텐츠 관리는 Week 5 QA가 끝난 뒤 착수한다. 단, 메뉴와 화면 설계는 지금 확정해 Week 6 작업을 바로 시작할 수 있게 한다.

## 범위

### 포함

- Admin 상단 메뉴에 `콘텐츠 관리` 진입점 추가
- 페이지 목록: 홈, 로그인, 안내/정책 후보 페이지의 상태와 최근 수정일 표시
- 페이지 편집: 제목, 설명, SEO 제목/설명, 공개 상태 관리
- 콘텐츠 블록 편집: 히어로, 공지 배너, 큐레이션 카드, 안내 문구, CTA
- 미리보기: 저장 전 현재 편집 내용을 공개 화면 기준으로 확인
- 게시 흐름: Draft -> Preview -> Published -> Archived
- 감사 로그: 페이지/블록 저장, 게시, 보관 작업을 `admin_logs`에 기록

### 제외

- 이미지 업로드와 이미지 CDN 관리
- 다중 관리자 권한 체계
- 리치 텍스트 에디터
- 공개 댓글/리뷰/별점
- 외부 CMS 연동

이미지는 MVP 동안 기존 `/assets/curation/*` 경로 또는 이후 별도 업로드 기능으로 연결할 URL만 입력한다.

## Admin 메뉴 구조

| 메뉴 | 목적 | MVP 화면 |
| --- | --- | --- |
| 제보 검토 | 사용자 제보 승인/반려 | 현재 대기열 유지 |
| 카페 관리 | 카페 CRUD와 태그 연결 | 현재 기본 정보 편집 유지 |
| 태그 관리 | 커피 필터/태그 운영 | 현재 태그 폼 유지 |
| CSV 가져오기 | 대량 데이터 반영 전 검증 | 현재 미리보기 유지 |
| 콘텐츠 관리 | 공개 페이지와 홈 콘텐츠 운영 | 신규 |
| 변경 기록 | Admin 작업 로그 확인 | 현재 로그를 콘텐츠 작업까지 확장 |

기존 단일 페이지 안에서 섹션을 추가해 시작하고, 화면이 커지면 `/admin/content` 같은 별도 App Router 경로로 분리한다.

## 콘텐츠 관리 화면

### 1. 콘텐츠 대시보드

- 공개 중 페이지 수, 초안 수, 최근 게시 시각, 미게시 변경 수를 표시한다.
- 홈 콘텐츠, 공지, 큐레이션 카드 상태를 한눈에 보여준다.
- 위험 상태를 표시한다: 공개 홈 콘텐츠 없음, SEO 설명 없음, CTA 링크 누락, 큐레이션 카드 이미지 누락.

### 2. 페이지 목록

| 필드 | 설명 |
| --- | --- |
| slug | `home`, `login`, `guide`, `privacy` 같은 공개 식별자 |
| title | 운영자용 페이지 제목 |
| status | `draft`, `published`, `archived` |
| updated_at | 마지막 저장 시각 |
| published_at | 마지막 게시 시각 |

목록에서 편집, 미리보기, 게시, 보관 작업을 실행한다.

### 3. 페이지 편집

- 기본 정보: slug, title, description, seo_title, seo_description
- 상태: draft/published/archived
- 블록 목록: 순서, 타입, 공개 여부, 요약
- 작업 버튼: 저장, 미리보기, 게시, 보관

### 4. 블록 편집

| 블록 타입 | 용도 | 주요 필드 |
| --- | --- | --- |
| `hero` | 홈 상단 메시지 | headline, body, primary_cta_label, primary_cta_href |
| `notice` | 공지/운영 안내 | title, body, severity, expires_at |
| `curation_card` | 추천 지역/테마 카드 | title, body, image_url, linked_filter, linked_area |
| `text` | 일반 안내 문구 | title, body |
| `cta` | 로그인/저장/제보 유도 | label, href, auth_required |

블록 콘텐츠는 `jsonb`로 저장하되, Admin UI에서 타입별 필드 검증을 적용한다.

## 데이터 모델

### `site_pages`

| 컬럼 | 타입 | 기준 |
| --- | --- | --- |
| id | uuid | primary key |
| slug | text | unique, public route/content key |
| title | text | required |
| description | text | optional |
| seo_title | text | optional |
| seo_description | text | optional |
| status | text | `draft`, `published`, `archived` |
| published_at | timestamptz | published 상태일 때 기록 |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | trigger로 갱신 |

### `content_blocks`

| 컬럼 | 타입 | 기준 |
| --- | --- | --- |
| id | uuid | primary key |
| page_id | uuid | `site_pages.id` references |
| block_key | text | page 내 안정 식별자 |
| block_type | text | hero, notice, curation_card, text, cta |
| position | integer | 페이지 내 정렬 |
| content | jsonb | 타입별 필드 |
| is_visible | boolean | 공개 여부 |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | trigger로 갱신 |

### `content_revisions`

| 컬럼 | 타입 | 기준 |
| --- | --- | --- |
| id | uuid | primary key |
| page_id | uuid | `site_pages.id` references |
| snapshot | jsonb | 페이지와 블록의 게시 전후 스냅샷 |
| change_note | text | 운영자 입력 또는 자동 요약 |
| created_by | uuid | admin user |
| created_at | timestamptz | default now() |

## 권한 모델

- 공개 사용자는 `published` 페이지와 `is_visible=true` 블록만 읽는다.
- Admin 쓰기는 Supabase `users.role = 'admin'` 기준으로 제한한다.
- Basic Auth는 `/admin` 진입 보호로 유지하되, API Route Handler에서도 관리자 권한을 다시 확인한다.
- `service_role` 키를 브라우저에 노출하지 않는다. 서버 전용 키를 쓰는 경우에도 Basic Auth와 Supabase admin role 확인을 모두 통과한 요청에만 사용한다.
- 새 테이블은 RLS를 활성화하고 public read/admin manage 정책을 분리한다.

## API 설계

| API | 메서드 | 용도 |
| --- | --- | --- |
| `/api/content?slug=home` | GET | 공개 화면이 published 콘텐츠를 읽음 |
| `/api/admin/content/pages` | GET, POST | Admin 페이지 목록 조회/생성 |
| `/api/admin/content/pages/[id]` | GET, PATCH, DELETE | 페이지 상세 조회/저장/보관 |
| `/api/admin/content/pages/[id]/blocks` | POST, PATCH | 블록 추가/수정/정렬 |
| `/api/admin/content/pages/[id]/publish` | POST | draft를 published로 전환하고 revision 기록 |

공개 API는 `no-store`로 시작한다. 게시 흐름이 안정되면 콘텐츠 slug 단위 캐시와 게시 시 재검증을 추가한다.

## 구현 순서

| 순서 | 작업 | 완료 기준 |
| --- | --- | --- |
| 1 | Week 5 QA 닫기 | 새로고침 세션 유지와 로그인 후 저장/제보 분리 QA가 문서상 Done |
| 2 | Admin 콘텐츠 계획 반영 | 이 문서와 작업 보드가 최신 순서를 가리킴 |
| 3 | 스키마 초안 추가 | `site_pages`, `content_blocks`, `content_revisions`와 RLS 정책 작성 |
| 4 | 공개 읽기 API 추가 | `/api/content?slug=home`이 published 콘텐츠만 반환 |
| 5 | Admin API 추가 | 페이지/블록 CRUD와 publish 액션이 관리자만 통과 |
| 6 | Admin 메뉴/화면 추가 | `/admin`에서 콘텐츠 대시보드, 페이지 목록, 편집 폼 접근 |
| 7 | 공개 홈 연동 | 홈 히어로/공지/큐레이션 카드가 API 콘텐츠를 사용하되 fallback 유지 |
| 8 | 검증 | lint, data:check, build, Admin API 401/200, 공개 API published-only 확인 |

## 1차 완료 기준

- `/admin`에 `콘텐츠 관리` 메뉴가 보인다.
- Admin 인증 전에는 콘텐츠 쓰기 버튼이 비활성화된다.
- 홈 페이지 콘텐츠를 초안으로 저장하고 미리보기할 수 있다.
- 게시하면 공개 API에서 published 콘텐츠만 반환된다.
- 보관한 페이지와 숨긴 블록은 공개 API에 나오지 않는다.
- 페이지/블록 저장과 게시 작업이 `admin_logs` 또는 `content_revisions`에 남는다.
- Supabase 환경 변수가 없으면 공개 화면은 기존 정적 콘텐츠 fallback으로 동작한다.

## 검증 명령

```bash
npm run lint
npm run data:check
npm run build
```

추가 HTTP 확인:

```bash
GET /api/content?slug=home
GET /api/admin/content/pages without auth -> 401
GET /api/admin/content/pages with admin auth -> 200
POST /api/admin/content/pages/[id]/publish with admin auth -> 200
```

## 리스크와 결정

| 리스크 | 결정 |
| --- | --- |
| Admin Basic Auth와 Supabase role이 분리됨 | 쓰기 API에서 관리자 검증을 중복 적용한다. |
| 공개 홈이 콘텐츠 API 장애에 영향받음 | API 실패 시 현재 정적 DOM/CSV fallback을 유지한다. |
| CMS 범위가 커질 수 있음 | MVP는 홈/공지/큐레이션/기본 안내에 한정한다. |
| 이미지 업로드가 필요해질 수 있음 | Week 6에서는 URL 입력만 지원하고 업로드는 P1로 둔다. |
| 테이블 노출과 RLS 누락 가능성 | 모든 신규 public table은 RLS 활성화와 read/manage 정책을 함께 추가한다. |
