// src/components/OfflineBanner.tsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';

/** The app shell works offline (service worker), but balances and transfers need the network. Say so. */
export function OfflineBanner() {
  const { t } = useTranslation();
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  if (online) return null;
  return (
    <div role="status" className="fixed bottom-4 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 z-[90] max-w-[92vw] flex items-center gap-2 rounded-xl border border-amber-400/40 bg-[#1a1405] px-4 py-2.5 text-sm text-amber-200 shadow-xl">
      <WifiOff className="w-4 h-4 flex-shrink-0" aria-hidden="true" /> {t('common.offline')}
    </div>
  );
}
