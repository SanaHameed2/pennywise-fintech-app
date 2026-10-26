// src/app/pages/RootLayout.tsx
import React, { useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Main RootLayout Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const RootLayout = React.memo(() => {
  const { pathname } = useLocation();

  // ✅ useCallback: Scroll to top on path change
  const scrollToTop = useCallback(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [pathname, scrollToTop]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#110f30] to-[#1a1849]">
      <Navbar />
      <main className="pt-24 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
});

RootLayout.displayName = 'RootLayout';

export default RootLayout;