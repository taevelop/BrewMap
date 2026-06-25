import '../src/styles.css';
import '../src/retro-desktop.css';

export const metadata = {
  metadataBase: new URL('https://brewmap.kr'),
  title: {
    default: '브루맵 | 부산에서 원하는 커피를 찾는 지도',
    template: '%s | 브루맵',
  },
  description: '메뉴와 최근 확인 정보를 기준으로 부산에서 원하는 커피를 판매하는 카페를 찾아보세요.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2D1B12',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}