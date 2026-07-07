# Coffee & Option Taxonomy v1

이 문서는 커피/옵션 태그, 동의어 매핑, 검증 상태, 신뢰도 등급 정의의 **단일 소스(source of truth)**다. 다른 문서(`docs/csv-format.md` 등)와 코드는 이 목록을 복제하지 않고 참조한다. 허용값을 바꿀 때는 이 문서를 먼저 갱신한 뒤 `scripts/check-seed-data.mjs`와 Admin 태그 관리에 반영한다.

## MVP 필터

| 그룹 | 태그 |
| --- | --- |
| 커피 종류 | filter_coffee, cold_brew, decaf, flat_white, einspanner |
| 원두 | single_origin, house_blend, decaf_bean |
| 추출 | hand_drip, batch_brew, espresso_machine |
| 구매 | bean_sales, dripbag_sales |
| 매장 | roastery, specialty_coffee |

## 옵션 태그

커피 태그가 아닌 매장 이용 조건과 편의성 태그입니다. 공개 MVP 필터 노출 여부는 별도로 결정하고, 데이터 수집/제보/Admin 관리에서는 같은 태그 체계 안에서 다룹니다.

| 그룹 | 태그 | 의미 |
| --- | --- | --- |
| 동반 | pet_friendly | 애견 동반 가능 |
| 동반 | kids_zone | 키즈존 또는 키즈 동반 가능 |
| 동반 | no_kids_zone | 노키즈존 |
| 좌석 | outdoor_seating | 야외 테이블 또는 야외 좌석 있음 |
| 혜택 | discount_available | 할인 서비스 있음 |
| 혜택 | rewards_available | 적립 서비스 있음 |

- `kids_zone`과 `no_kids_zone`은 같은 카페에 동시에 부여하지 않습니다.
- `discount_available`, `rewards_available`은 추후 제휴/멤버십 확장을 고려한 후보 태그로 두고, MVP에서는 정보 확인 가능 여부를 우선 기록합니다.

## 동의어 매핑

| 입력어 | 표준 태그 |
| --- | --- |
| 핸드드립, 브루잉, V60, 필터 | filter_coffee |
| 콜드브루, 더치커피 | cold_brew |
| 디카페인, 디카페인 커피 | decaf |
| 싱글, 싱글오리진, single origin | single_origin |
| 원두판매, 원두 구매, beans | bean_sales |
| 애견동반, 반려견, 펫프렌들리 | pet_friendly |
| 키즈존, 아이 동반, 유아 동반 | kids_zone |
| 노키즈, 노키즈존 | no_kids_zone |
| 야외좌석, 야외테이블, 테라스 | outdoor_seating |
| 할인, 쿠폰 | discount_available |
| 적립, 포인트, 멤버십 | rewards_available |

## 검증 상태

| 상태 | 의미 |
| --- | --- |
| owner_verified | 사장님 또는 공식 채널 확인 |
| admin_verified | 운영자가 직접 확인 |
| user_report | 사용자 제보 기반 |
| menu_photo | 메뉴판 이미지 근거 |

## 신뢰도 등급

| 등급 | 기준 |
| --- | --- |
| A | 공식/현장 확인, 30일 이내 |
| B | 신뢰 가능한 메뉴판/제보, 90일 이내 |
| C | 오래된 제보 또는 단일 근거 |
| D | 근거 약함, 재확인 필요 |
| X | 불명 또는 검증 만료 |
