import BrewMapRuntime from '../components/BrewMapRuntime';

export const metadata = {
  title: '브루맵 Retro Desktop',
  description: '메뉴와 최근 확인 정보를 기준으로 부산에서 원하는 커피를 판매하는 카페를 찾아보세요.',
};

const retroShell = "\r\n    \u003cmain class=\"app-shell retro-main-shell\"\u003e\r\n      \u003csection class=\"retro-desktop-root\" id=\"home\" data-retro-desktop aria-label=\"BrewMap Retro Desktop\"\u003e\u003c/section\u003e\r\n      \u003cp class=\"retro-public-link\"\u003e\u003ca href=\"/#home\"\u003e검색 중심 공개 화면으로 이동\u003c/a\u003e\u003c/p\u003e\r\n    \u003c/main\u003e";

export default function RetroPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: retroShell }} />
      <BrewMapRuntime bodyClassName="is-retro-main" />
    </>
  );
}