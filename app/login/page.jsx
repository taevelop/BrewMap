import BrewMapRuntime from '../components/BrewMapRuntime';

export const metadata = {
  title: '로그인',
  description: '브루맵 저장과 제보 기능을 Google, Apple 또는 이메일 계정으로 사용하세요.',
};

const googleLogo = String.raw`<span class="provider-mark provider-mark-google" aria-hidden="true"><svg viewBox="0 0 18 18" focusable="false" role="img"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.12-.84 2.07-1.79 2.71v2.26h2.9c1.7-1.57 2.69-3.88 2.69-6.61z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.19l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33C2.44 15.98 5.48 18 9 18z"/><path fill="#FBBC05" d="M3.95 10.69c-.18-.54-.28-1.12-.28-1.69s.1-1.15.28-1.69V4.98H.96C.35 6.19 0 7.55 0 9s.35 2.81.96 4.02l2.99-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0 5.48 0 2.44 2.02.96 4.98l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"/></svg></span>`;

const appleLogo = String.raw`<span class="provider-mark provider-mark-apple" aria-hidden="true"><svg viewBox="0 0 384 512" focusable="false" role="img"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.2 14.4 80.8 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-89.6-61.7-91.5zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg></span>`;

const loginShell = String.raw`<main class="app-shell login-app-shell">
  <div class="top-layer">
    <nav class="top-nav" aria-label="BrewMap 주요 메뉴">
      <a class="brand" href="/" aria-label="브루맵 홈으로 이동"><img class="brand-mark" src="/assets/brewmap-brand-icon.svg" alt="" width="38" height="38" /><span>브루맵</span></a>
      <div class="nav-actions">
        <a href="/">발견</a><a href="/#cafes">결과</a><a href="/#map">지도</a><a href="/login" data-login-nav>로그인</a><a href="/#saved" data-auth-nav hidden>저장</a><a href="/#report" data-auth-nav hidden>제보</a>
      </div>
    </nav>
  </div>

  <section class="login-page" id="login" aria-labelledby="login-heading" data-login-section>
    <article class="panel login-panel login-page-panel" aria-label="브루맵 로그인">
      <h1 id="login-heading">브루맵에 로그인 하기</h1>
      <p class="saved-auth-state login-auth-state" data-saved-auth-state>로그인 상태 확인 중</p>
      <form class="saved-login-actions login-provider-actions" data-login-form>
        <label class="saved-login-email login-email-field"><input type="email" autocomplete="email" inputmode="email" placeholder="이메일 주소" aria-label="이메일 주소" data-login-email /></label>
        <button class="saved-login-email-button" type="submit" data-login-action>이메일로 계속하기</button>
        <div class="login-provider-divider" role="separator" aria-hidden="true"></div>
        <button class="saved-login-google" type="button" data-login-google>${googleLogo}<span>Google로 계속하기</span></button>
        <button class="saved-login-apple" type="button" data-login-apple>${appleLogo}<span>Apple로 계속하기</span></button>
        <button type="button" data-logout-action hidden>로그아웃</button>
      </form>
      <p class="form-status" data-saved-status aria-live="polite"></p>
    </article>
  </section>
</main>`;

export default function LoginPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: loginShell }} />
      <BrewMapRuntime />
    </>
  );
}