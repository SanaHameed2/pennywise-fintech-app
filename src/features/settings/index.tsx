// src/app/pages/Settings.tsx
import { useState } from 'react';
import { 
  User, Shield, Sliders, LogOut, 
  ChevronRight, CreditCard, Camera,
  CheckCircle2, BellRing, Fingerprint, Monitor,
  HelpCircle, Edit2
} from 'lucide-react';
// ✅ Removed: Mail, Lock, Smartphone, Key, Globe, Sun, Moon, TrendingUp, Wallet, Clock, AlertCircle
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'profile' | 'security' | 'preferences';

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Update your personal information' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Password and account security' },
    { id: 'preferences', label: 'Preferences', icon: Sliders, description: 'Notifications and app settings' },
  ] as const;

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
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
            <button className="ml-auto text-sm text-[#FF7F50] hover:text-[#ff8f66] transition-colors flex items-center gap-1">
              Edit Profile <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
          })}
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
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'preferences' && <PreferencesTab />}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Cards Quick Link */}
          <button 
            onClick={() => navigate('/cards')}
            className="bg-[#0d0d12] rounded-xl border border-white/[0.06] p-4 flex items-center justify-between hover:border-white/10 hover:bg-white/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FF7F50]/10 text-[#FF7F50] flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Manage Cards</p>
                <p className="text-xs text-gray-500">View and manage your virtual cards</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
          </button>

          {/* Help Center */}
          <button 
            onClick={() => navigate('/help')}
            className="bg-[#0d0d12] rounded-xl border border-white/[0.06] p-4 flex items-center justify-between hover:border-white/10 hover:bg-white/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Need help?</p>
                <p className="text-xs text-gray-500">Visit our Help Center for guides</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
          </button>

          {/* Log Out */}
          <button 
            onClick={handleLogout}
            className="md:col-span-2 bg-[#0d0d12] rounded-xl border border-white/[0.06] p-4 flex items-center justify-between hover:border-red-500/30 hover:bg-red-500/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Log out</p>
                <p className="text-xs text-gray-500">Sign out from your account</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors" />
          </button>
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

/* ─── PROFILE TAB ─── */
function ProfileTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            defaultValue="John Doe"
            className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-[#FF7F50] focus:ring-2 focus:ring-[#FF7F50]/20 transition"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            defaultValue="john.doe@email.com"
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
          defaultValue="+1 (555) 123-4567"
          className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-[#FF7F50] focus:ring-2 focus:ring-[#FF7F50]/20 transition"
        />
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
        <div>
          <p className="text-sm font-medium text-white">Profile Picture</p>
          <p className="text-xs text-gray-500">Upload or change your profile photo</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-[#FF7F50]/10 text-[#FF7F50] text-sm font-semibold hover:bg-[#FF7F50]/20 transition-colors">
          Upload Photo
        </button>
      </div>

      <button className="px-6 py-2.5 rounded-lg bg-[#FF7F50] text-black font-semibold text-sm hover:bg-[#ff8f66] transition-colors">
        Save Changes
      </button>
    </div>
  );
}

/* ─── SECURITY TAB ─── */
function SecurityTab() {
  const [show2FA, setShow2FA] = useState(false);

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

      <div className="pt-4 border-t border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
              <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
            </div>
          </div>
          <button 
            onClick={() => setShow2FA(!show2FA)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              show2FA 
                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-[#FF7F50]/10 text-[#FF7F50] hover:bg-[#FF7F50]/20'
            }`}
          >
            {show2FA ? 'Enabled' : 'Enable'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Fingerprint className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Biometric Authentication</p>
              <p className="text-xs text-gray-500">Use fingerprint or face ID to sign in</p>
            </div>
          </div>
          <button className="px-4 py-1.5 rounded-lg bg-[#FF7F50]/10 text-[#FF7F50] text-xs font-semibold hover:bg-[#FF7F50]/20 transition-colors">
            Setup
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── PREFERENCES TAB ─── */
function PreferencesTab() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FF7F50]/10 text-[#FF7F50] flex items-center justify-center">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Notifications</p>
            <p className="text-xs text-gray-500">Receive alerts about your account activity</p>
          </div>
        </div>
        <button
          onClick={() => setNotifications(!notifications)}
          className={`w-11 h-6 rounded-full transition-colors ${
            notifications ? 'bg-[#FF7F50]' : 'bg-white/20'
          }`}
        >
          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
            notifications ? 'translate-x-5' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Monitor className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Dark Mode</p>
            <p className="text-xs text-gray-500">Switch between light and dark themes</p>
          </div>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`w-11 h-6 rounded-full transition-colors ${
            darkMode ? 'bg-[#FF7F50]' : 'bg-white/20'
          }`}
        >
          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
            darkMode ? 'translate-x-5' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Language
        </label>
        <select className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-[#FF7F50] focus:ring-2 focus:ring-[#FF7F50]/20 transition">
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
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
}