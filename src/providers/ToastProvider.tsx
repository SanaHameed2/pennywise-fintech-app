// src/providers/ToastProvider.tsx
import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          background: '#0D0D12',
          color: '#EEF2FF',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
        },
      }}
    />
  );
}