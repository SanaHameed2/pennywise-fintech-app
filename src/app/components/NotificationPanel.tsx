// src/app/components/NotificationPanel.tsx
import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDate } from '../../utils/date'; // ✅ Using our global date formatter

export function NotificationPanel() {
  const { t } = useTranslation();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-white/5 transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5 text-white/60 hover:text-white/90 transition" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 end-1.5 min-w-[16px] h-4 px-1 bg-[#FF7F50] text-black text-[9px] font-bold rounded-full ring-2 ring-[#070707] flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute end-0 mt-3 w-80 sm:w-96 bg-[#0D0D12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-sm font-semibold text-white">
              {t('notifications.title', 'Notifications')}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] uppercase tracking-wider text-[#FF7F50] hover:text-[#ff8f66] font-bold flex items-center gap-1 transition"
              >
                <Check className="w-3 h-3" /> {t('notifications.markAll', 'Mark all read')}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[350px] overflow-y-auto divide-y divide-white/5">
            {isLoading ? (
              <div className="p-6 flex flex-col items-center justify-center text-white/40 text-sm gap-2">
                <div className="w-5 h-5 border-2 border-[#FF7F50] border-t-transparent rounded-full animate-spin" />
                {t('notifications.loading', 'Loading notifications...')}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <Bell className="w-8 h-8 text-white/20 mb-2" />
                <p className="text-sm text-white/40">{t('notifications.empty', 'No notifications yet.')}</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                  className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-white/[0.03] ${
                    !notif.is_read ? 'bg-[#FF7F50]/5' : 'opacity-70'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {notif.type === 'transfer' || notif.type === 'income' ? (
                      <CheckCircle2 className="w-5 h-5 text-[#34D399]" />
                    ) : notif.type === 'alert' ? (
                      <AlertCircle className="w-5 h-5 text-[#EF4444]" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-[#FF7F50]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${!notif.is_read ? 'font-semibold text-white' : 'font-medium text-white/80'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-white/30 mt-2">
                      {/* Using our global date formatter for Urdu/English */}
                      {formatDate(notif.created_at)}
                    </p>
                  </div>
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-[#FF7F50] mt-2 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
          
        </div>
      )}
    </div>
  );
}