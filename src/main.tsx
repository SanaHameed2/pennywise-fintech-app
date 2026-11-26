// src/main.tsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { GoogleTranslateBoundary } from 'react-google-translate-shim';
import { router } from './app/router';
import { AuthProvider } from './contexts/AuthContext';
import { QueryProvider } from './providers/QueryProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './providers/ToastProvider';
import { LoadingSpinner } from './components/LoadingSpinner';
import './lib/i18n';   // ✅ i18n init (must be before App render)
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/noto-naskh-arabic/400.css';
import '@fontsource/noto-naskh-arabic/700.css';
import '@fontsource/noto-nastaliq-urdu/400.css';
import '@fontsource/noto-nastaliq-urdu/700.css';
import './index.css';
import { MotionConfig } from 'motion/react';
import { applyReduceMotion } from './lib/preferences';

applyReduceMotion();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <GoogleTranslateBoundary>
      <ErrorBoundary>
        <QueryProvider>
          <MotionConfig reducedMotion="user">
            <AuthProvider>
              {/* ✅ Suspense wraps the Router, so lazy-loaded pages show the spinner */}
              <Suspense fallback={<LoadingSpinner />}>
                <RouterProvider router={router} />
              </Suspense>
              
              <ToastProvider />
            </AuthProvider>
          </MotionConfig>
        </QueryProvider>
      </ErrorBoundary>
    </GoogleTranslateBoundary>
  </React.StrictMode>
);