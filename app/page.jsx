import BrewMapRuntime from './components/BrewMapRuntime';

const publicShell = String.raw`<main class="app-shell">
  <div class="top-layer">
    <nav class="top-nav" aria-label="BrewMap 주요 메뉴">
      <a class="brand" href="#home" aria-label="브루맵 홈으로 이동"><img class="brand-mark" src="/assets/brewmap-brand-icon.svg" alt="" width="38" height="38" /><span>브루맵</span></a>
      <div class="nav-actions">
        <a href="#home">발견</a><a href="#cafes">결과</a><a href="#map">지도</a><a href="/login" data-login-nav>로그인</a><a href="#saved" data-auth-nav hidden>저장</a><a href="#report" data-auth-nav hidden>제보</a>
      </div>
    </nav>
  </div>

  <section class="search-shell" id="home">
    <header class="search-header">
      <div class="search-intro">
        <p class="eyebrow">Local Discover</p>
        <h1>마시고 싶은 커피가 있는 로컬 지도</h1>
        <p>당신이 찾고 싶은 커피 지도</p>
        <div class="hero-proof" aria-label="BrewMap 핵심 기준">
          <span><strong>별점 없음</strong> 커피 가능 여부 우선</span>
          <span><strong>검증 표시</strong> 출처 · 최근 확인일</span>
          <span><strong>부산 카페</strong> 지역별 검색</span>
        </div>
      </div>
      <form class="search-card" role="search" data-search-form>
        <label><span>커피</span><input aria-label="카페 또는 커피 검색" placeholder="필터커피, 디카페인, 카페명" data-search-input /></label>
        <label><span>지역</span><input aria-label="지역 검색" placeholder="부산 전포, 해운대" data-location-input /></label>
        <button type="submit">검색</button>
      </form>
    </header>

    <section class="local-discover" aria-labelledby="local-discover-heading">
      <div class="local-discover-copy">
        <p class="eyebrow">Busan Local</p>
        <h2 id="local-discover-heading">오늘의 부산 로컬</h2>
      </div>
      <div class="local-region-grid">
        <button class="local-region-card" type="button" data-discover-preset="전포" aria-label="부산 전포 카페 보기">
          <img src="/assets/curation/jeonpo-local-espresso.png" alt="전포 골목 에스프레소 바 분위기" loading="eager" decoding="async" />
          <span class="local-region-label">부산 - 전포</span>
          <span class="local-region-note">골목 에스프레소</span>
        </button>
        <button class="local-region-card" type="button" data-discover-preset="해운대" aria-label="부산 해운대 카페 보기">
          <img src="/assets/curation/haeundae-seaside-cafe.png" alt="해운대 조용한 바다 앞 카페 분위기" loading="eager" decoding="async" />
          <span class="local-region-label">부산 - 해운대</span>
          <span class="local-region-note">바다 앞 커피</span>
        </button>
      </div>
    </section>

    <nav class="area-rail" aria-label="부산 권역 빠른 탐색" data-area-rail>
      <span>부산 권역</span>
      <button type="button" data-location-preset="부산">부산 전체</button>
    </nav>

    <div class="search-layout">
      <aside class="filter-panel" aria-labelledby="filter-heading">
        <div class="panel-heading">
          <p class="eyebrow">검색 조건</p>
          <h2 id="filter-heading">커피 조건</h2>
        </div>
        <div class="filter-row" aria-label="커피 필터" data-filter-row></div>
        <div class="quality-panel" aria-label="BrewMap 데이터 기준">
          <span><strong>기준</strong> 리뷰/별점 제외</span>
          <span><strong>검증</strong> 출처와 최근 확인일 표시</span>
          <span><strong>지역</strong> 부산 카페 우선</span>
        </div>
      </aside>

      <section class="result-panel" id="cafes" aria-label="BrewMap 카페 검색 결과">
        <div class="result-heading">
          <div>
            <p class="eyebrow">검색 결과</p>
            <h2>조건에 맞는 카페</h2>
          </div>
          <strong data-result-count aria-live="polite">불러오는 중</strong>
        </div>
        <div class="cafe-grid" data-cafe-grid></div>
      </section>

      <section class="map-card" id="map" aria-label="BrewMap 카페 지도">
        <div class="map-toolbar"><span>결과 지도</span><button type="button" data-location-action>내 위치</button></div>
        <div class="map-surface" data-map-surface tabindex="0" role="application" aria-label="카페 지도. 드래그하거나 키보드로 이동할 수 있습니다.">
          <div class="map-base-layer" data-map-base-layer aria-hidden="true"></div>
          <div class="map-marker-layer" data-map-marker-layer></div>
          <div class="map-controls" aria-label="지도 확대/축소">
            <button type="button" data-map-zoom-in aria-label="지도 확대" title="지도 확대">+</button>
            <button type="button" data-map-zoom-out aria-label="지도 축소" title="지도 축소">-</button>
          </div>
          <a class="map-attribution" href="#" target="_blank" rel="noreferrer" data-map-attribution hidden>지도 데이터</a>
          <p class="map-status" data-map-status aria-live="polite"></p>
        </div>
      </section>
    </div>
  </section>

  <section class="login-section" id="login" aria-labelledby="login-heading" data-login-section data-embedded-login hidden>
    <div class="panel login-panel">
      <p class="eyebrow">계정 로그인</p>
      <h2 id="login-heading">저장과 제보를 계정으로 사용하세요</h2>
      <p>Google, Apple 또는 이메일 링크로 로그인하면 저장한 카페와 정보 제보를 여러 기기에서 이어서 사용할 수 있습니다.</p>
      <p class="saved-auth-state" data-saved-auth-state>로그인 상태 확인 중</p>
      <p class="saved-login-note" data-saved-auth-note>저장한 카페를 여러 기기에서 확인하려면 Google, Apple 또는 이메일로 로그인하세요.</p>
      <form class="saved-login-actions login-provider-actions" data-login-form>
        <label class="saved-login-email login-email-field"><input type="email" autocomplete="email" inputmode="email" placeholder="이메일 주소" aria-label="이메일 주소" data-login-email /></label>
        <button class="saved-login-email-button" type="submit" data-login-action>이메일로 계속하기</button>
        <div class="login-provider-divider" role="separator" aria-hidden="true"></div>
        <button class="saved-login-google" type="button" data-login-google><span class="provider-mark provider-mark-google" aria-hidden="true"><svg viewBox="0 0 18 18" focusable="false" role="img"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.12-.84 2.07-1.79 2.71v2.26h2.9c1.7-1.57 2.69-3.88 2.69-6.61z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.19l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33C2.44 15.98 5.48 18 9 18z"/><path fill="#FBBC05" d="M3.95 10.69c-.18-.54-.28-1.12-.28-1.69s.1-1.15.28-1.69V4.98H.96C.35 6.19 0 7.55 0 9s.35 2.81.96 4.02l2.99-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0 5.48 0 2.44 2.02.96 4.98l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"/></svg></span><span>Google로 계속하기</span></button>
        <button class="saved-login-apple" type="button" data-login-apple><span class="provider-mark provider-mark-apple" aria-hidden="true"><svg viewBox="0 0 384 512" focusable="false" role="img"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.2 14.4 80.8 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-89.6-61.7-91.5zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg></span><span>Apple로 계속하기</span></button>
        <button type="button" data-logout-action hidden>로그아웃</button>
      </form>
      <p class="form-status" data-saved-status aria-live="polite"></p>
    </div>
  </section>

  <section class="ops-grid" data-auth-workspace hidden>
    <article class="panel saved-panel" id="saved">
      <p class="eyebrow">저장한 카페</p>
      <h2>나중에 볼 카페</h2>
      <p>계정에 저장한 카페를 다시 확인하세요.</p>
      <div class="saved-summary"><strong data-saved-count>0개</strong><span data-saved-scope>계정 저장</span></div>
      <button class="saved-logout-button" type="button" data-logout-action>로그아웃</button>
      <p class="form-status" data-saved-status aria-live="polite"></p>
      <ul class="saved-list" data-saved-list></ul>
    </article>
    <article class="panel report-panel" id="report">
      <p class="eyebrow">정보 제보</p>
      <h2>정보 수정 제보</h2>
      <p>카페 정보가 다르다면 제보해 주세요. 운영 검토 후 반영합니다.</p>
      <form class="report-form" data-report-form>
        <label>카페<select data-report-cafe></select></label>
        <label>제보 유형<select data-report-type><option value="update">수정</option><option value="add">추가</option><option value="delete">삭제</option><option value="closed">폐업</option><option value="menu_change">메뉴 변경</option></select></label>
        <label>제보 내용<textarea data-report-detail rows="4" placeholder="예: 디카페인 메뉴가 없어졌습니다." required></textarea></label>
        <button type="submit">정보 제보하기</button>
        <p class="form-status" data-report-status aria-live="polite"></p>
      </form>
    </article>
  </section>
</main>
<dialog class="detail-dialog" data-detail-dialog>
  <div class="detail-modal">
    <button class="modal-close" type="button" aria-label="상세 닫기" data-detail-close>닫기</button>
    <div data-detail-body></div>
  </div>
</dialog>`;

export default function Page() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: publicShell }} />
      <BrewMapRuntime />
    </>
  );
}
