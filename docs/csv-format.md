# CSV Import Format

BrewMap 카페 입력 CSV는 Excel에서 바로 열 수 있도록 **UTF-8 with BOM**으로 저장합니다.

## 파일

- 기본 입력 파일: `data/seed-cafes.csv`
- 공개 화면은 로드 시 이 파일을 읽어 카페 목록을 구성합니다. 로드 실패 시에는 코드에 포함된 최소 샘플 데이터로 대체합니다.
- 구분자: comma(`,`)
- 인코딩: UTF-8 with BOM
- 줄바꿈: CRLF 또는 LF 모두 허용
- 여러 값이 들어가는 `capabilities` 컬럼은 pipe(`|`)로 구분합니다.

## 컬럼

| 컬럼 | 필수 | 예시 | 설명 |
| --- | --- | --- | --- |
| `id` | Y | `jeonpo-archive` | 카페 식별용 slug. 소문자 영문, 숫자, hyphen 권장 |
| `name` | Y | `Archive Beans` | 카페명 |
| `city` | Y | `busan` | 도시 코드. MVP는 `busan`, 이후 `seoul` 확장 |
| `area` | Y | `jeonpo` | 권역 코드. 예: `jeonpo`, `gwangan`, `haeundae` |
| `address` | Y | `부산 부산진구 전포대로 209` | 한글 주소 |
| `latitude` | Y | `35.1549000` | 위도 |
| `longitude` | Y | `129.0632000` | 경도 |
| `capabilities` | Y | `filter_coffee|single_origin|bean_sales` | 가능한 커피 태그 ID 목록 |
| `confidence` | Y | `A` | 신뢰도. `A`, `B`, `C`, `D`, `X` |
| `verification_source` | Y | `admin_verified` | 검증 출처 |
| `verified_at` | N | `2026-06-01` | 최근 확인일. `YYYY-MM-DD` |
| `naver_map_url` | N | `#` | 네이버 지도 URL |
| `kakao_map_url` | N | `#` | 카카오맵 URL |
| `google_map_url` | N | `#` | Google Maps URL |

## 허용 값

### `city`

- `busan`
- `seoul`

### `area`

현재 부산 MVP 권역:

- `jeonpo`
- `gwangan`
- `haeundae`

### `capabilities`

- `filter_coffee`
- `cold_brew`
- `decaf`
- `flat_white`
- `einspanner`
- `single_origin`
- `house_blend`
- `decaf_bean`
- `hand_drip`
- `batch_brew`
- `espresso_machine`
- `bean_sales`
- `dripbag_sales`
- `roastery`
- `specialty_coffee`
- `pet_friendly`
- `kids_zone`
- `no_kids_zone`
- `outdoor_seating`
- `discount_available`
- `rewards_available`

`kids_zone`과 `no_kids_zone`은 같은 카페에 동시에 입력하지 않습니다.

### `verification_source`

- `owner_verified`
- `admin_verified`
- `user_report`
- `menu_photo`

## Excel 저장 주의사항

Excel에서 수정 후 저장할 때는 `CSV UTF-8 (쉼표로 분리) (*.csv)` 형식으로 저장합니다. 일반 `CSV (쉼표로 분리) (*.csv)`를 선택하면 한글이 깨질 수 있습니다.

## Seed 데이터 QA

카페 데이터를 추가하거나 Excel에서 다시 저장한 뒤에는 아래 명령으로 구조와 MVP 준비도를 확인합니다.

```bash
npm run data:check
```

검증 항목:

- UTF-8 BOM 유지 여부
- 필수 컬럼, 중복 헤더, 알 수 없는 컬럼
- `id` 중복과 slug 형식
- 부산 MVP 권역 허용값: `jeonpo`, `gwangan`, `haeundae`
- 위도/경도 숫자 형식과 부산 대략 범위
- 허용된 커피 태그, 중복 태그, 평균 태그 수
- 신뢰도, 검증 출처, 최근 확인일 형식
- 외부 지도 URL 형식

스크립트는 CSV 구조 오류가 있으면 실패합니다. 카페 수 150개 미만, MVP 필터 커버리지 부족, 평균 태그 수 부족 같은 런칭 준비도 항목은 데이터 구축 중에도 계속 실행할 수 있도록 경고로 표시합니다.
