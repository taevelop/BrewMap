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
