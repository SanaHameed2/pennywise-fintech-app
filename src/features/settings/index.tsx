// src/features/settings/index.tsx
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Shield, Sliders, LogOut, ChevronRight, CreditCard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ProfileTab from './components/ProfileTab';
import SecurityTab from './components/SecurityTab';
import PreferencesTab from './components/PreferencesTab';

type TabId = 'profile' | 'security' | 'preferences';
const TABS: Array<{ id: TabId; icon: typeof User }> = [
  { id: 'profile', icon: User },
  { id: 'security', icon: Shield },
  { id: 'preferences', icon: Sliders },
];

function ActionCard({ icon: Icon, title, description, onClick, danger = false }: {
  icon: typeof User; title: string; description: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button type="button" onClick={onClick}
      className="bg-[#0d0d12] rounded-xl border border-white/[0.08] p-4 flex items-center justify-between hover:border-white/20 hover:bg-white/5 transition-all group w-full text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]">
      <span className="flex items-center gap-3">
        <span aria-hidden="true" className={`w-10 h-10 rounded-lg flex items-center justify-center ${danger ? 'bg-red-500/10 text-red-300' : 'bg-[#FF7F50]/10 text-[#FF7F50]'}`}><Icon className="w-5 h-5" /></span>
        <span>
          <span className="block font-semibold text-white">{title}</span>
          <span className="block text-xs text-white/70">{description}</span>
        </span>
      </span>
      <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white rtl:rotate-180" aria-hidden="true" />
    </button>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({ profile: null, security: null, preferences: null });

  const rawName = String(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User');
  const initials = rawName.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  // WAI-ARIA tabs pattern: arrow keys move between tabs, Home/End jump to the ends
  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const rtl = document.documentElement.dir === 'rtl';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft';
    const lookup: Record<string, number> = {
      [forward]: (index + 1) % TABS.length,
      [backward]: (index - 1 + TABS.length) % TABS.length,
      Home: 0,
      End: TABS.length - 1,
    };
    const next = lookup[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setActiveTab(TABS[next].id);
    tabRefs.current[TABS[next].id]?.focus();
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden relative font-sans">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10 pt-8 pb-12">
        <h1 className="text-3xl font-bold text-white mb-8">{t('settings.title')}</h1>

        <div className="bg-[#0d0d12] rounded-xl border border-white/[0.08] p-6 mb-6 flex items-center gap-6">
          <div aria-hidden="true" className="w-20 h-20 rounded-full bg-[#FF7F50] text-black flex items-center justify-center text-2xl font-bold">{initials}</div>
          <div className="min-w-0">
            <p className="text-xl font-semibold truncate">{rawName}</p>
            <p className="text-white/70 truncate" dir="ltr">{user?.email}</p>
          </div>
        </div>

        <div role="tablist" aria-label={t('settings.title')} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {TABS.map(({ id, icon: Icon }, index) => {
            const active = activeTab === id;
            return (
              <button
                key={id} id={`tab-${id}`} role="tab" type="button"
                ref={(el) => { tabRefs.current[id] = el; }}
                aria-selected={active} aria-controls={`panel-${id}`} tabIndex={active ? 0 : -1}
                onClick={() => setActiveTab(id)} onKeyDown={(e) => onTabKeyDown(e, index)}
                className={`text-start p-4 rounded-xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50] ${
                  active ? 'border-[#FF7F50] bg-[#FF7F50]/5' : 'border-white/[0.08] hover:border-white/20 hover:bg-white/5'}`}
              >
                <span className="flex items-center gap-3">
                  <span aria-hidden="true" className={`w-10 h-10 rounded-lg flex items-center justify-center ${active ? 'bg-[#FF7F50]/10 text-[#FF7F50]' : 'bg-white/5 text-white/70'}`}><Icon className="w-5 h-5" /></span>
                  <span>
                    <span className={`block font-semibold text-sm ${active ? 'text-white' : 'text-white/80'}`}>{t(`settings.tabs.${id}`)}</span>
                    <span className="block text-xs text-white/70">{t(`settings.tabs.${id}Desc`)}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`} tabIndex={0}
          className="bg-[#0d0d12] rounded-xl border border-white/[0.08] p-6 mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'preferences' && <PreferencesTab />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard icon={CreditCard} title={t('settings.manageCards')} description={t('settings.manageCardsDesc')} onClick={() => navigate('/cards')} />
          <ActionCard icon={LogOut} danger title={t('settings.logout')} description={t('settings.logoutDesc')}
            onClick={() => { void logout().then(() => navigate('/login')); }} />
        </div>
      </div>
    </div>
  );
}
