// src/app/pages/Settings.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { 
  User, Shield, Sliders, LogOut, 
  ChevronRight, CreditCard, Camera,
  CheckCircle2, BellRing
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'profile' | 'security' | 'preferences';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: TabButton
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TabButton = React.memo(({ 
  tab, 
  isActive, 
  onSelect 
}: { 
  tab: { id: TabType; label: string; icon: React.ElementType; description: string }; 
  isActive: boolean; 
  onSelect: (id: TabType) => void;
}) => {
  const Icon = tab.icon;
  return (
    <button
      onClick={() => onSelect(tab.id)}
      className={`text-left p-4 rounded-xl border transition-all ${
        isActive
          ? 'border-[#FF7F50] bg-[#FF7F50]/5 shadow-[0_0_30px_rgba(255,127,80,0.05)]'
          : 'border-white/[0.06] hover:border-white/10 hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isActive ? 'bg-[#FF7F50]/10 text-[#FF7F50]' : 'bg-white/5 text-gray-400'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-300'}`}>
            {tab.label}
          </p>
          <p className="text-xs text-gray-500">{tab.description}</p>
        </div>
      </div>
    </button>
  );
});

TabButton.displayName = 'TabButton';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: SettingsCard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SettingsCard = React.memo(({ 
  icon: Icon, 
  title, 
  description, 
  onClick,
  color = 'text-[#FF7F50]',
  bgColor = 'bg-[#FF7F50]/10'
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  onClick?: () => void;
  color?: string;
  bgColor?: string;
}) => {
  return (
    <button 
      onClick={onClick}
      className="bg-[#0d0d12] rounded-xl border border-white/[0.06] p-4 flex items-center justify-between hover:border-white/10 hover:bg-white/5 transition-all group w-full"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bgColor} ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-white">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
    </button>
  );
});

SettingsCard.displayName = 'SettingsCard';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: ToggleSwitch
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ToggleSwitch = React.memo(({ 
  enabled, 
  onToggle,
  label,
  description
}: { 
  enabled: boolean; 
  onToggle: () => void;
  label: string;
  description: string;
}) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#FF7F50]/10 text-[#FF7F50] flex items-center justify-center">
          <BellRing className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`w-11 h-6 rounded-full transition-colors ${
          enabled ? 'bg-[#FF7F50]' : 'bg-white/20'
        }`}
      >
        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  );
});

ToggleSwitch.displayName = 'ToggleSwitch';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: ProfileTab
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ProfileTab = React.memo(() => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value="John Doe"
            className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-[#FF7F50] focus:ring-2 focus:ring-[#FF7F50]/20 transition"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value="john.doe@email.com"
            className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-[#FF7F50] focus:ring-2 focus:ring-[#FF7F50]/20 transition"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Phone Number
        </label>
        <input
          type="tel"
          value="+1 (555) 123-4567"
          className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-[#FF7F50] focus:ring-2 focus:ring-[#FF7F50]/20 transition"
        />
      </div>

      <button className="px-6 py-2.5 rounded-lg bg-[#FF7F50] text-black font-semibold text-sm hover:bg-[#ff8f66] transition-colors">
        Save Changes
      </button>
    </div>
  );
});

ProfileTab.displayName = 'ProfileTab';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: SecurityTab
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SecurityTab = React.memo(() => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Current Password
          </label>
          <input
            type="password"
            placeholder="Enter current password"
            className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF7F50] focus:ring-2 focus:ring-[#FF7F50]/20 transition"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            New Password
          </label>
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF7F50] focus:ring-2 focus:ring-[#FF7F50]/20 transition"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Confirm New Password
        </label>
        <input
          type="password"
          placeholder="Confirm new password"
          className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF7F50] focus:ring-2 focus:ring-[#FF7F50]/20 transition"
        />
      </div>

      <button className="px-6 py-2.5 rounded-lg bg-[#FF7F50] text-black font-semibold text-sm hover:bg-[#ff8f66] transition-colors">
        Update Password
      </button>

      <div className="pt-4 border-t border-white/10">
        <SettingsCard
          icon={CheckCircle2}
          title="Two-Factor Authentication"
          description="Add an extra layer of security"
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
        />
      </div>
    </div>
  );
});

SecurityTab.displayName = 'SecurityTab';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: PreferencesTab
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PreferencesTab = React.memo(() => {
  const [notifications, setNotifications] = useState(true);

  const handleToggleNotifications = useCallback(() => {
    setNotifications(prev => !prev);
  }, []);

  return (
    <div className="space-y-6">
      <ToggleSwitch
        enabled={notifications}
        onToggle={handleToggleNotifications}
        label="Notifications"
        description="Receive alerts about your account"
      />

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Language
        </label>
        <select className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-[#FF7F50] focus:ring-2 focus:ring-[#FF7F50]/20 transition">
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Currency
        </label>
        <select className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-[#FF7F50] focus:ring-2 focus:ring-[#FF7F50]/20 transition">
          <option value="usd">USD ($)</option>
          <option value="eur">EUR (€)</option>
          <option value="gbp">GBP (£)</option>
          <option value="pkr">PKR (Rs)</option>
        </select>
      </div>

      <button className="px-6 py-2.5 rounded-lg bg-[#FF7F50] text-black font-semibold text-sm hover:bg-[#ff8f66] transition-colors">
        Save Preferences
      </button>
    </div>
  );
});

PreferencesTab.displayName = 'PreferencesTab';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Main Settings Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // ✅ useCallback: Handle tab change
  const handleTabChange = useCallback((tabId: TabType) => {
    setActiveTab(tabId);
  }, []);

  // ✅ useCallback: Handle logout
  const handleLogout = useCallback(async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  }, [logout, navigate]);

  // ✅ useCallback: Navigate to cards
  const handleNavigateToCards = useCallback(() => {
    navigate('/cards');
  }, [navigate]);

  // ✅ useMemo: Tab definitions
  const tabs = useMemo(() => [
    { id: 'profile' as const, label: 'Profile', icon: User, description: 'Update your personal information' },
    { id: 'security' as const, label: 'Security', icon: Shield, description: 'Password and account security' },
    { id: 'preferences' as const, label: 'Preferences', icon: Sliders, description: 'Notifications and app settings' },
  ], []);

  // ✅ useMemo: Render tabs
  const tabList = useMemo(() => {
    return tabs.map((tab) => (
      <TabButton
        key={tab.id}
        tab={tab}
        isActive={activeTab === tab.id}
        onSelect={handleTabChange}
      />
    ));
  }, [tabs, activeTab, handleTabChange]);

  // ✅ useMemo: Render active tab content
  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'security':
        return <SecurityTab />;
      case 'preferences':
        return <PreferencesTab />;
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden relative selection:bg-[#FF7F50]/20 antialiased font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#FF7F50]/10 to-transparent blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-[#FF7F50]/4 blur-[160px] rounded-full pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10 pt-28 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your account, security and preferences</p>
        </motion.div>

        {/* Quick Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0d0d12] rounded-xl border border-white/[0.06] p-6 mb-6"
        >
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF7F50] to-[#E05A2B] flex items-center justify-center text-2xl font-bold text-white">
                JD
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#FF7F50] text-black flex items-center justify-center hover:bg-[#ff8f66] transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">John Doe</h2>
              <p className="text-gray-400">john.doe@email.com</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6"
        >
          {tabList}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-[#0d0d12] rounded-xl border border-white/[0.06] p-6 mb-6"
          >
            {tabContent}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <SettingsCard
            icon={CreditCard}
            title="Manage Cards"
            description="View and manage your virtual cards"
            onClick={handleNavigateToCards}
          />

          <SettingsCard
            icon={LogOut}
            title="Log out"
            description="Sign out from your account"
            color="text-red-400"
            bgColor="bg-red-500/10"
            onClick={handleLogout}
          />
        </motion.div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500 font-mono"
        >
          <Shield className="w-4 h-4 text-[#FF7F50]" />
          <span>Your data is secure and encrypted</span>
          <span className="text-gray-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline">We use bank-level security to protect your information</span>
        </motion.div>
      </div>
    </div>
  );
}