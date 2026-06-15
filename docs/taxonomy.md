# Coffee Taxonomy v1

## MVP 필터

| 그룹 | 태그 |
| --- | --- |
| 커피 종류 | filter_coffee, cold_brew, decaf, flat_white, einspanner |
| 원두 | single_origin, house_blend, decaf_bean |
| 추출 | hand_drip, batch_brew, espresso_machine |
| 구매 | bean_sales, dripbag_sales |
| 매장 | roastery, specialty_coffee |

## 동의어 매핑

| 입력어 | 표준 태그 |
| --- | --- |
| 핸드드립, 브루잉, V60, 필터 | filter_coffee |
| 콜드브루, 더치커피 | cold_brew |
| 디카페인, 디카페인 커피 | decaf |
| 싱글, 싱글오리진, single origin | single_origin |
| 원두판매, 원두 구매, beans | bean_sales |

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
