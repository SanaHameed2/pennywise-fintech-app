// src/app/components/NotificationPanel.tsx
import { useState, useRef, useEffect, useId } from 'react';
import { Bell, Check, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDate } from '../../utils/date';

export function NotificationPanel() {
  const { t } = useTranslation();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Close on outside click, and on Escape (returning focus to the bell)
  useEffect(() => {
    if (!isOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setIsOpen(false); buttonRef.current?.focus(); }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={unreadCount > 0 ? t('notifications.bellUnread', { count: unreadCount }) : t('notifications.title')}
        className="relative p-2 rounded-xl hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]"
      >
        <Bell className="w-5 h-5 text-white/70 hover:text-white transition" aria-hidden="true" />
        {unreadCount > 0 && (
          <span aria-hidden="true" className="absolute top-1.5 end-1.5 min-w-[16px] h-4 px-1 bg-[#FF7F50] text-black text-[11px] font-bold rounded-full ring-2 ring-[#070707] flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div id={panelId} role="region" aria-label={t('notifications.title')}
          className="absolute end-0 mt-3 w-80 sm:w-96 bg-[#0D0D12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-sm font-semibold text-white">{t('notifications.title')}</h3>
            {unreadCount > 0 && (
              <button type="button" onClick={() => void markAllAsRead()}
                className="text-[11px] uppercase tracking-wider text-[#FF7F50] hover:text-[#ff8f66] font-bold flex items-center gap-1 transition rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]">
                <Check className="w-3 h-3" aria-hidden="true" /> {t('notifications.markAll')}
              </button>
            )}
          </div>

          <div className="max-h-[350px] overflow-y-auto">
            {isLoading ? (
              <div role="status" className="p-6 flex flex-col items-center justify-center text-white/70 text-sm gap-2">
                <div aria-hidden="true" className="w-5 h-5 border-2 border-[#FF7F50] border-t-transparent rounded-full animate-spin" />
                {t('notifications.loading')}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <Bell className="w-8 h-8 text-white/60 mb-2" aria-hidden="true" />
                <p className="text-sm text-white/70">{t('notifications.empty')}</p>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {notifications.map((notif) => {
                  const Icon = notif.type === 'transfer' || notif.type === 'income' ? CheckCircle2 : AlertCircle;
                  const color = notif.type === 'transfer' || notif.type === 'income' ? 'text-[#34D399]' : notif.type === 'alert' ? 'text-[#F87171]' : 'text-[#FF7F50]';
                  const body = (
                    <>
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${color}`} aria-hidden="true" />
                      <span className="flex-1 text-start">
                        <span className={`block text-sm ${!notif.is_read ? 'font-semibold text-white' : 'font-medium text-white/80'}`}>
                          {!notif.is_read && <span className="sr-only">{t('notifications.unread')}: </span>}
                          {notif.title}
                        </span>
                        <span className="block text-xs text-white/70 mt-1 leading-relaxed">{notif.message}</span>
                        <span className="block text-[11px] text-white/60 mt-2">{formatDate(notif.created_at)}</span>
                        {!notif.is_read && <span className="sr-only">{t('notifications.markRead')}</span>}
                      </span>
                      {!notif.is_read && <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#FF7F50] mt-2 flex-shrink-0" />}
                    </>
                  );
                  return (
                    <li key={notif.id}>
                      {notif.is_read ? (
                        <div className="p-4 flex gap-3 opacity-80">{body}</div>
                      ) : (
                        <button type="button" onClick={() => void markAsRead(notif.id)}
                          className="w-full p-4 flex gap-3 bg-[#FF7F50]/5 hover:bg-[#FF7F50]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF7F50]">
                          {body}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
