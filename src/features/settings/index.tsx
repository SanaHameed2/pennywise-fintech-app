// src/features/settings/index.tsx
import React, { useState } from 'react';
import { 
  User, Shield, Sliders, LogOut, 
  ChevronRight, CreditCard, BellRing
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// ✅ IMPORT the Real SecurityTab
import SecurityTab from './components/SecurityTab';

type TabType = 'profile' | 'security' | 'preferences';

const TabButton = React.memo(({ tab, isActive, onSelect }: { tab: any; isActive: boolean; onSelect: (id: TabType) => void; }) => {
  const Icon = tab.icon;
  return (
    <button onClick={() => onSelect(tab.id)} className={`text-left p-4 rounded-xl border transition-all ${isActive ? 'border-[#FF7F50] bg-[#FF7F50]/5 shadow-[0_0_30px_rgba(255,127,80,0.05)]' : 'border-white/[0.06] hover:border-white/10 hover:bg-white/5'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-[#FF7F50]/10 text-[#FF7F50]' : 'bg-white/5 text-gray-400'}`}><Icon className="w-5 h-5" /></div>
        <div>
          <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-300'}`}>{tab.label}</p>
          <p className="text-xs text-gray-500">{tab.description}</p>
        </div>
      </div>
    </button>
  );
});

const SettingsCard = React.memo(({ icon: Icon, title, description, onClick, color = 'text-[#FF7F50]', bgColor = 'bg-[#FF7F50]/10' }: any) => (
  <button onClick={onClick} className="bg-[#0d0d12] rounded-xl border border-white/[0.06] p-4 flex items-center justify-between hover:border-white/10 hover:bg-white/5 transition-all group w-full">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${bgColor} ${color} flex items-center justify-center`}><Icon className="w-5 h-5" /></div>
      <div className="text-left">
        <p className="font-semibold text-white">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
  </button>
));

const ToggleSwitch = React.memo(({ enabled, onToggle, label, description }: any) => (
  <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-[#FF7F50]/10 text-[#FF7F50] flex items-center justify-center"><BellRing className="w-4 h-4" /></div>
      <div><p className="text-sm font-medium text-white">{label}</p><p className="text-xs text-gray-500">{description}</p></div>
    </div>
    <button onClick={onToggle} className={`w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-[#FF7F50]' : 'bg-white/20'}`}>
      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  </div>
));

const ProfileTab = React.memo(() => {
  const { user } = useAuth();
  const displayName = user?.email?.split('@')[0] || 'User';
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase block mb-1.5">Full Name</label>
          <input type="text" defaultValue={capitalizedName} className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-[#FF7F50]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase block mb-1.5">Email Address</label>
          <input type="email" defaultValue={user?.email || ''} disabled className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-gray-400 cursor-not-allowed" />
        </div>
      </div>
      <button className="px-6 py-2.5 rounded-lg bg-[#FF7F50] text-black font-semibold text-sm hover:bg-[#ff8f66]">Save Changes</button>
    </div>
  );
});

const PreferencesTab = React.memo(() => {
  const [notifications, setNotifications] = useState(true);
  return (
    <div className="space-y-6">
      <ToggleSwitch enabled={notifications} onToggle={() => setNotifications(!notifications)} label="Notifications" description="Receive alerts" />
      <button className="px-6 py-2.5 rounded-lg bg-[#FF7F50] text-black font-semibold text-sm hover:bg-[#ff8f66]">Save Preferences</button>
    </div>
  );
});

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const displayName = user?.email?.split('@')[0] || 'User';
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  const initials = capitalizedName.substring(0, 2).toUpperCase();

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User, description: 'Update personal information' },
    { id: 'security' as const, label: 'Security', icon: Shield, description: 'Password and account security' },
    { id: 'preferences' as const, label: 'Preferences', icon: Sliders, description: 'App settings' },
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden relative font-sans">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10 pt-28 pb-12">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        <div className="bg-[#0d0d12] rounded-xl border border-white/[0.06] p-6 mb-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#FF7F50] flex items-center justify-center text-2xl font-bold">{initials}</div>
          <div>
            <h2 className="text-xl font-semibold">{capitalizedName}</h2>
            <p className="text-gray-400">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {tabs.map((tab) => (
            <TabButton key={tab.id} tab={tab} isActive={activeTab === tab.id} onSelect={setActiveTab} />
          ))}
        </div>

        <div className="bg-[#0d0d12] rounded-xl border border-white/[0.06] p-6 mb-6">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'security' && <SecurityTab />} {/* ✅ Render Real MFA Tab */}
          {activeTab === 'preferences' && <PreferencesTab />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsCard icon={CreditCard} title="Manage Cards" description="View your virtual cards" onClick={() => navigate('/cards')} />
          <SettingsCard icon={LogOut} title="Log out" description="Sign out from your account" color="text-red-400" bgColor="bg-red-500/10" onClick={async () => { await logout(); navigate('/login'); }} />
        </div>
      </div>
    </div>
  );
}