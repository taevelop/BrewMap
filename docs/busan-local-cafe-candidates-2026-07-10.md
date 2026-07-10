# Busan Local Cafe Seed Candidates

작성일: 2026-07-10

## 목적

`data/seed-cafes.csv`를 150개 이상으로 늘리기 위한 부산 로컬 카페 후보 및 반영 이력이다. 2026-07-10 1차 정리에서 비카페 7개를 삭제하고 OSM 기반 로컬 카페 후보 44개를 `C/user_report`로 추가해 seed는 150개가 됐다. 이후 비짓부산 카페 목록 1~3페이지의 35개를 주소와 대표 메뉴로 검토해 신규 7개를 `B/admin_verified`로 추가했고 seed는 157개가 됐다.

## 2026-07-10 착수 결과

| 항목 | 결과 |
| --- | --- |
| 비카페 정리 | 동래옛날팥빙수 본점, 호랑이젤라떡, 하이까눌레, 오븐의온도, 스미다 티하우스, 비비비당, 쿠타팜테라스 브런치카페 삭제 |
| 1차 추가 | OSM 장소명/좌표와 역지오코딩 주소 기준 24개 추가 |
| 2차 추가 | 같은 기준으로 20개 추가 |
| 비짓부산 1~3페이지 | 35개 검토, 신규 카페 7개 추가, 동일 카페·주소 13개 제외, 비카페/비커피 중심 15개 제외 |
| 현재 seed 수 | 157개 |
| 공식 근거 태그 보강 | 블랙업커피 4곳과 모모스커피 4곳에 `cold_brew`, `decaf`, `dripbag_sales`, 모모스커피 4곳에 `decaf_bean` 추가. Tide Coffee Roasters는 공식 쇼핑몰 근거로 `bean_sales`, `single_origin`, `house_blend`, `decaf_bean` 추가 및 `B/admin_verified` 승격. 히떼 로스터리 전포점은 비짓부산 공식 메뉴 근거로 `flat_white` 추가 |
| 남은 품질 과제 | 평균 커피 태그 2.6/3.0, `flat_white` 커버리지 1개. 로스터리 `bean_sales` 미확인 후보 5개 남음 |

추가된 44개는 공식 메뉴 확인 전이므로 `confidence=C`, `verification_source=user_report`로 둔다. 2026-07-10 태그 보강은 공식 매장 안내와 상품 카탈로그가 맞물리는 기존 `B/admin_verified` 행에만 적용했다. FM COFFEE ROASTERS는 Cold Brew 카테고리는 있으나 등록 제품이 0개라 이번 보강에서 보류했다. 히떼 로스터리 전포점은 비짓부산의 주소와 메뉴가 seed 행과 일치해 `flat_white`를 추가했으며, 광안점과 강서점에는 지점별 메뉴 근거가 없어 확장하지 않았다. 다음 작업은 카페 수 추가보다 메뉴판/공식 채널 확인을 통해 `filter_coffee`, `single_origin`, `bean_sales`, `roastery`, `flat_white` 태그를 승격하는 것이다.

## 비짓부산 1~3페이지 반영

비짓부산 카페 분류의 카드 35개를 상세 페이지의 주소, 대표 메뉴, 좌표로 확인했다. 이름이 같더라도 주소가 다른 베르크로스터스 전포점은 별도 지점으로 추가했고, 같은 카페와 주소가 확인된 항목은 추가하지 않았다.

| 페이지 | 신규 카페 | 주소 | 공식 근거 |
| --- | --- | --- | --- |
| 1 | 그리다부부 | 부산 중구 광복중앙로 35-1 1층 | https://www.visitbusan.net/index.do?menuCd=DOM_000000201002001000&uc_seq=1838&lang_cd=ko |
| 1 | 베르크로스터스 전포점 | 부산 부산진구 서전로58번길 115 1층-2층 | https://www.visitbusan.net/index.do?menuCd=DOM_000000201002001000&uc_seq=1819&lang_cd=ko |
| 2 | 브레이크인커피 | 부산 기장군 정관읍 병산로 117 | https://www.visitbusan.net/index.do?menuCd=DOM_000000201002001000&uc_seq=1464&lang_cd=ko |
| 2 | 빌라빌레쿨라 | 부산 동래구 여고로63번나길 8 | https://www.visitbusan.net/index.do?menuCd=DOM_000000201002001000&uc_seq=1462&lang_cd=ko |
| 2 | 피아크 카페&베이커리 | 부산 영도구 해양로195번길 180 4층 | https://www.visitbusan.net/index.do?menuCd=DOM_000000201002001000&uc_seq=1445&lang_cd=ko |
| 2 | 에테르 | 부산 영도구 절영로 234 | https://www.visitbusan.net/index.do?menuCd=DOM_000000201002001000&uc_seq=920&lang_cd=ko |
| 3 | 웨이브온커피 | 부산 기장군 장안읍 해맞이로 286 | https://www.visitbusan.net/index.do?menuCd=DOM_000000201002001000&uc_seq=174&lang_cd=ko |

- 중복 제외 13개: 히떼로스터리 전포점, 보느파티쓰리, 연경재, 토북베이커리, 바우노바, 브리타니, 아데초이, 올드머그, 초량온당, 커피스가모 인 서면, 디저트시네마, 초량 1941, 모모스커피
- 비카페/비커피 중심 제외 15개: 연화제과, 데일리럭키, 비비비당, 무슈뱅상, 프랑스 과자점 브리앙, 칙투칙, 카페호밀, 보리종파티세리 본점, bread365, 용호동할매팥빙수단팥죽 본점, 이흥용과자점 부산대직영점, 칠암사계, 큐제, 홍옥당, 파니니브런치본점

## 포함 기준

- 부산 로컬 카페, 로스터리, 스페셜티 커피 바를 우선한다.
- 부산 기반으로 3~5개 정도의 지점을 운영하는 소형 로컬 체인은 포함한다.
- `decaf`, `cold_brew`, `flat_white` 결손을 줄일 수 있는 메뉴가 확인되는 곳을 우선한다.
- 주소, 좌표, 지도 URL, 메뉴 근거가 확인되는 후보만 seed로 승격한다.

## 제외 기준

대형 프랜차이즈와 저가형 대량 프랜차이즈는 seed 보강 대상에서 제외한다.

- 대형/전국형: 스타벅스, 투썸플레이스, 이디야, 엔제리너스, 탐앤탐스, 파스쿠찌, 카페베네, 할리스, 커피빈
- 저가형/대량형: 빽다방, 메가MGC커피, 컴포즈커피, 카페051, 하삼동커피, 텐퍼센트커피, 더리터, 더벤티, 블루샥
- 커피 탐색 가치가 낮은 베이커리/디저트 체인: 파리바게뜨, 뚜레쥬르, 던킨, 배스킨라빈스, 설빙, 오설록

## 이미 seed에 들어간 소형 로컬 체인

아래 브랜드는 BrewMap 타깃에 맞지만 이미 일부 지점이 seed에 있다. 새 지점을 추가할 때 중복을 먼저 확인한다.

| 브랜드 | 현재 판단 | 비고 |
| --- | --- | --- |
| 모모스커피 | 포함 유지 | 공식 사이트에 온천장 본점, 영도 로스터리&커피바, 마린시티점, 도모헌점 노출. 현재 seed에 주요 부산 지점 포함. |
| 블랙업커피 | 포함 유지 | 공식 매장 안내 기준 부산 서면, 해운대, 을숙도, 광복, 로스터리 등이 있음. 현재 seed에는 로스터리 별도 행이 없는지 확인 필요. |
| 히떼로스터리 | 포함 유지 | 현재 seed에 전포, 광안, 강서 지점 포함. |
| 노스커피/노스커피 리마스터 | 포함 유지 | 현재 seed에 시청, 센텀, 부산대 정문, 온천장 포함. 부산대 북문 후보는 별도 확인. |
| 바우노바 | 포함 유지 | 현재 seed에 광복/백산 계열 포함. 신규 지점보다 기존 행 태그 보강 우선. |
| 에프엠커피 | 포함 유지 | seed의 `에프엠커피`와 공식 사이트의 `에프엠커피로스터리` 주소가 달라 중복/이전 여부 확인 필요. |

## 1차 추가 후보

우선순위 A는 로스터리/커피 전문성 또는 소형 로컬 체인 보강 가능성이 높은 항목이다. 우선순위 B는 로컬 카페 후보지만 커피 메뉴와 운영 상태를 지도/메뉴로 더 확인해야 한다.

| 우선순위 | 권역 | 후보 | 근거 | seed 전 확인 |
| --- | --- | --- | --- | --- |
| A | jeonpo | 블랙업커피 로스터리 | 공식 매장 안내에 부산진구 신천대로 108 로스터리 노출 | 기존 서면본점과 별도 영업/카페 이용 가능 여부 |
| A | jeonpo | FM COFFEE ROASTERS | 공식 사이트 주소가 부산진구 서전로57번길 45, Cold Brew 카테고리 있음 | 기존 `에프엠커피`와 중복/이전 여부 |
| A | haeundae | Coffee2 Roaster's Coffee Lab | OSM node, 웹사이트 `coffeeroasters.co.kr` | 네이버/카카오 장소와 메뉴 |
| A | dongnae | 루이스 로스터리 | OSM node | 로스터리/원두 판매/필터 여부 |
| A | yeonje | 커피긱스 | OSM node | 지도 장소와 커피 메뉴 |
| A | dong | Brown Hands | OSM node | 현 영업 여부와 메뉴 |
| A | dong | Choryang1941 | OSM node | 현 영업 여부와 커피 메뉴 |
| A | yeongdo | Cafe 830 | OSM node | 주소, 좌표, 커피 태그 |
| A | geumjeong | 노스커피 부산대북문점 | OSM node | 현재 seed의 노스커피 지점과 중복 여부 |
| A | geumjeong | Nohs Coffee | OSM node | 노스커피 표기/지점명 정규화 |
| A | geumjeong | Welkin Espresso | OSM node | 지도 장소와 메뉴 |
| A | geumjeong | 커피빌리지 | OSM node | 지도 장소와 메뉴 |
| A | geumjeong | 제이스퀘어 | OSM node | 지도 장소와 메뉴 |
| A | jung | Picobarn Coffee | OSM node | 중복 node 정리, 지도 장소 |
| A | jung | Roof And | OSM node | 지도 장소와 메뉴 |
| A | jung | Neruda Coffee | OSM node | 지도 장소와 메뉴 |
| A | jung | Upstairs Coffee | OSM node | 지도 장소와 메뉴 |
| A | jung | Caffeinated | OSM node, 영업시간 태그 있음 | 지도 장소와 메뉴 |
| A | gwangan | Prefer Color | OSM node 2개 | 지점/중복 좌표 정리 |
| A | gwangan | Cafe Bobae | OSM node | 지도 장소와 메뉴 |
| A | gwangan | Hirameku | OSM node | 지도 장소와 메뉴 |
| A | gwangan | 프리젠트 카페 | OSM node | 지도 장소와 메뉴 |
| A | haeundae | Hav Coffee | OSM node | 지도 장소와 메뉴 |
| A | haeundae | Sandy Blue | OSM node | 지도 장소와 메뉴 |
| A | haeundae | Cafe Hindus | OSM node | 지도 장소와 메뉴 |
| A | gijang | La Baule | OSM node, 영업시간 태그 있음 | 커피 전문성 확인 |
| A | gijang | 카페 바람종 | OSM node | 지도 장소와 메뉴 |
| B | jeonpo | 고유커피 | OSM node, 영업시간 태그 있음 | 커피 메뉴, 기존 전포 후보와 중복 여부 |
| B | jeonpo | 카페숨은 | OSM node | 지도 장소와 메뉴 |
| B | jeonpo | 패럿 | OSM node | 지도 장소와 메뉴 |
| B | jeonpo | 몰레 | OSM node, 영업시간 태그 있음 | 커피 중심 카페인지 확인 |
| B | jeonpo | 빈티지38 | OSM node, 24/7 태그 있음 | 체인 규모와 커피 타깃 적합성 |
| B | jung | Bunny Drop | OSM node | 커피 메뉴 확인 |
| B | jung | Cafe Colombe | OSM node | 커피 메뉴 확인 |
| B | jung | Breeze Coffee | OSM node | 커피 메뉴 확인 |
| B | jung | Killerswell | OSM node | 커피 메뉴 확인 |
| B | jung | Check in Busan | OSM node | 커피 메뉴 확인 |
| B | nam | 코끼리카페 | OSM node | 지도 장소와 메뉴 |
| B | nam | 라쿠나마타타 | OSM node, 영업시간 태그 있음 | 커피 중심 카페인지 확인 |
| B | nam | 카페미마 | OSM node | 지도 장소와 메뉴 |
| B | yeongdo | 커피미미 | OSM node | 지도 장소와 메뉴 |

## 태그 보강 우선순위

현재 `npm run data:gaps` 기준 `flat_white`는 히떼 로스터리 전포점 1개까지 확보했다. 신규 행 추가와 동시에 기존 소형 로스터리 행도 메뉴 확인 후 보강한다.

| 태그 | 우선 확인 대상 | 근거 |
| --- | --- | --- |
| `cold_brew` | 모모스커피, 블랙업커피 | 공식 상품 목록에서 콜드브루 상품 확인 후 기존 B등급 지점에 반영. FM은 등록 제품 0개로 보류 |
| `decaf` | 모모스커피, 블랙업커피 | 모모스 콜드브루/드립백 디카페인, 블랙업 드립백/캡슐 디카페인 상품 확인 후 기존 B등급 지점에 반영 |
| `flat_white` | 히떼 로스터리 전포점 | 비짓부산 공식 메뉴와 주소가 seed 행과 일치해 반영 완료. 다른 지점은 지점별 메뉴 근거 확인 전까지 보류 |
| `bean_sales` | Tide Coffee Roasters | 공식 쇼핑몰에 SINGLE ORIGIN, BLEND, DECAF 원두 상품 확인 후 반영 완료 |
| `bean_sales` | Coffee2 Roaster's Coffee Lab, 루이스 로스터리, AboutLife Coffee Roasters, 그리다부부, 웨이브온커피 | 공식 판매 페이지 또는 지점 메뉴 근거를 찾지 못해 보류. 로스터리 명칭만으로 판매 태그를 추정하지 않음 |

## 다음 작업 순서

1. 우선순위 A 27개를 네이버지도/카카오맵에서 검색한다.
2. 현 영업, 정확한 도로명 주소, 좌표, 지도 URL을 확보한다.
3. 메뉴판/공식 채널에서 `flat_white`, `filter_coffee`, `single_origin`, `bean_sales`, `roastery` 근거를 확인한다.
4. 확인된 항목만 `data/seed-cafes.csv`에 추가한다.
5. 추가 후 `npm run data:gaps`, `npm run data:check`, `npm run lint`, `npm run build`를 실행한다.

## 조사 출처

- 블랙업커피 공식 매장 안내: https://blackupcoffee.com/shopinfo/list1.html?cate_no=98
- 모모스커피 공식 사이트: https://momos.co.kr/
- FM COFFEE ROASTERS 공식 사이트: https://fmcoffee.co.kr/
- 비짓부산 히떼로스터리 메뉴: https://www.visitbusan.net/index.do?menuCd=DOM_000000201002002001&uc_seq=1637
- OSM Overpass API: https://overpass-api.de/api/interpreter
- OpenStreetMap 후보 node 예시: https://www.openstreetmap.org/node/3778890850, https://www.openstreetmap.org/node/4629759177, https://www.openstreetmap.org/node/5872896985
