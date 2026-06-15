# CSV Import Format

BrewMap 카페 입력 CSV는 Excel에서 바로 열 수 있도록 **UTF-8 with BOM**으로 저장합니다.

## 파일

- 기본 입력 파일: `data/seed-cafes.csv`
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
- `decaf`
- `cold_brew`
- `flat_white`
- `single_origin`
- `bean_sales`
- `hand_drip`
- `roastery`

### `verification_source`

- `owner_verified`
- `admin_verified`
- `user_report`
- `menu_photo`

## Excel 저장 주의사항

Excel에서 수정 후 저장할 때는 `CSV UTF-8 (쉼표로 분리) (*.csv)` 형식으로 저장합니다. 일반 `CSV (쉼표로 분리) (*.csv)`를 선택하면 한글이 깨질 수 있습니다.
