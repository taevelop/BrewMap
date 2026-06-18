# BrewMap Brand Asset System — v4

## Primary palette
- Espresso: `#2D1B12`
- Cream: `#F8EBD2`
- Brew Orange: `#D96B2B`

## Main brand icon — updated
- The approved cup/map/pin concept is retained.
- The internal road network now consists of exactly three completely straight, unbent roads.
- All three roads share one and only one common junction at `(460, 500)` in the SVG coordinate system.
- The Brew Orange pin is centered over that junction, reinforcing the idea of a selected cafe at a road intersection.
- Master file: `brewmap_brand_icon.svg`.

## Cafe map marker
- Unchanged from v2/v3: the coffee cup and location pin form one integrated Espresso/Cream silhouette.
- Master files: `brewmap_cafe_marker.svg` and `brewmap_cafe_marker_selected.svg`.
- Map anchor: bottom center (`50% 100%`).
- Recommended display height: 40–64 px; 64–80 px for selected or featured locations.

## Responsive assets
- Main brand icon PNG exports: 64–1024 px.
- Android and Apple touch icons use the updated primary icon.
- The separate micro icon remains road-free for favicon-scale legibility.
- `favicon.ico`, favicon PNGs, Apple touch icon, Android icons, and the web manifest are included.


# BrewMap Brand Web Kit

## 파일

- `index.html`: 브랜드 아이콘, 지도 마커, 라이트·다크 팔레트와 사용 규격을 보여주는 가이드 페이지
- `brewmap-brand.css`: 컬러 토큰, 자동/강제 다크모드, 아이콘·마커용 클래스
- `assets/brewmap-brand-icon.svg`: 메인 브랜드 아이콘
- `assets/brewmap-cafe-marker.svg`: 기본 지도 카페 마커
- `assets/brewmap-cafe-marker-selected.svg`: 선택 상태 지도 카페 마커

## 테마 설정

```html
<!-- OS 테마 자동 적용 -->
<html lang="ko">

<!-- 라이트모드 고정 -->
<html lang="ko" data-theme="light">

<!-- 다크모드 고정 -->
<html lang="ko" data-theme="dark">
```

## 기본 적용

```html
<link rel="stylesheet" href="/styles/brewmap-brand.css" />

<img
  class="brewmap-brand-icon"
  src="/assets/brewmap-brand-icon.svg"
  alt="BrewMap"
/>

<img
  class="brewmap-map-marker"
  src="/assets/brewmap-cafe-marker.svg"
  alt="카페 위치"
/>
```

지도 마커의 좌표 앵커는 하단 중앙 `(50% 100%)`입니다.
