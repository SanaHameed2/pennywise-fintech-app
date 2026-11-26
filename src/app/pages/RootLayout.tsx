// src/app/pages/RootLayout.tsx
import React, { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { OfflineBanner } from '../../components/OfflineBanner';

// Page titles keep the browser tab and screen-reader page announcements meaningful in a single-page app.
const TITLE_KEYS: Record<string, string> = {
  '/': 'nav.home',
  '/login': 'nav.login',
  '/signup': 'nav.signup',
  '/about': 'nav.about',
  '/forgot-password': 'nav.forgotPassword',
  '/reset-password': 'nav.resetPassword',
  '/dashboard': 'nav.dashboard',
  '/transfer': 'nav.transfer',
  '/transactions': 'nav.transactions',
  '/cards': 'nav.cards',
  '/settings': 'nav.settings',
};

const RootLayout = React.memo(() => {
  const { pathname, hash } = useLocation();
  const { t, i18n } = useTranslation();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    const key = TITLE_KEYS[pathname];
    document.title = key ? `${t(key)} · ${t('common.appName')}` : t('common.appName');
  }, [pathname, t, i18n.language]);

  // On client-side navigation: scroll up and move focus to <main>, so keyboard and
  // screen-reader users start at the new page rather than on a link that is gone.
  useEffect(() => {
    if (hash) {
      // in-page link such as /about#security; the page may still be lazy-loading, so retry for ~1s
      let frame = 0;
      let tries = 0;
      const attempt = () => {
        const target = document.getElementById(hash.slice(1));
        if (target) {
          target.scrollIntoView();
          (target.querySelector('h2') as HTMLElement | null)?.focus({ preventScroll: true });
        } else if (tries++ < 60) {
          frame = requestAnimationFrame(attempt);
        }
      };
      attempt();
      firstRender.current = false;
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo(0, 0);
    if (firstRender.current) { firstRender.current = false; return; }
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, hash]);

  return (
    <div className="min-h-screen bg-[#050507]">
      <a
        href="#main-content"
        onClick={(e) => { e.preventDefault(); mainRef.current?.focus(); }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black focus:outline-none focus:ring-2 focus:ring-[#FF7F50]"
      >
        {t('a11y.skipToContent')}
      </a>
      <Navbar />
      <OfflineBanner />
      <main id="main-content" ref={mainRef} tabIndex={-1} className="pt-20 min-h-screen outline-none">
        {/* Suspense here (not above the router) keeps the navbar and skip link on screen while a page loads */}
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
});

RootLayout.displayName = 'RootLayout';

export default RootLayout;
