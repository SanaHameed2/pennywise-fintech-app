// src/components/LoadingSpinner.tsx
import { useTranslation } from 'react-i18next';

export function LoadingSpinner() {
  const { t } = useTranslation();
  return (
    <div role="status" className="min-h-[60vh] bg-[#050507] flex items-center justify-center">
      <div className="text-center">
        <div aria-hidden="true" className="w-12 h-12 border-4 border-[#FF7F50] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/70 mt-4 text-sm">{t('common.loading')}</p>
      </div>
    </div>
  );
}
