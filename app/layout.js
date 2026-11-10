import './globals.css';
import { Bodoni_Moda } from 'next/font/google';
import { Providers } from './providers';
import { AnimatedBackground } from '../src/components/ui/AnimatedBackground';

// Display serif for headlines (variable: weight + optical size). Exposed as
// --font-bodoni; Tailwind's `font-display` utility maps to it (theme.css).
const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-bodoni',
  display: 'swap',
});

export const metadata = {
  title: 'Kimana',
  icons: { icon: '/favicon.svg' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Runs before hydration to set the real theme on <html> immediately, so
// there's no flash of the wrong theme while useTheme's client state catches
// up. Keep the storage key and fallback logic in sync with src/hooks/useTheme.js.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('kimana-theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={bodoni.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <AnimatedBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
