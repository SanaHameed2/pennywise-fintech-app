// src/main.tsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './app/router';
import { AuthProvider } from './contexts/AuthContext';
import { DarkModeProvider } from './app/contexts/DarkModeContext';
import { QueryProvider } from './providers/QueryProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './providers/ToastProvider';
import './lib/i18n';   // ✅ ADDED: i18n init (must be before App render)
import './index.css';

// ✅ Loading component for Suspense
const LoadingSpinner = () => (
  <div className="min-h-screen bg-[#070707] flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-[#FF7F50] border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-white/50 mt-4 text-sm font-mono">Loading...</p>
    </div>
  </div>
);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryProvider>
        <DarkModeProvider>
          <AuthProvider>
            <Suspense fallback={<LoadingSpinner />}>
              <RouterProvider router={router} />
            </Suspense>
            <ToastProvider />
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </DarkModeProvider>
      </QueryProvider>
    </ErrorBoundary>
  </React.StrictMode>
);