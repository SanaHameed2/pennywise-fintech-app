// src/features/settings/components/SecurityTab.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../hooks/useAuth';
import { Lock, Key, Shield, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import MfaSetup from '../../../app/components/MfaSetup';

export default function SecurityTab() {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // ✅ MFA Modal & Status State
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [checkingMfa, setCheckingMfa] = useState(true);

  // ✅ Check MFA Status on Load
  useEffect(() => {
    const checkMfaStatus = async () => {
      try {
        const { data } = await supabase.auth.mfa.listFactors();
        const hasVerified = data?.all?.some(f => f.status === 'verified' && f.factor_type === 'totp');
        setIsMfaEnabled(!!hasVerified);
      } catch (err) {
        console.error("Error checking MFA:", err);
      } finally {
        setCheckingMfa(false);
      }
    };
    checkMfaStatus();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      setLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters!' });
      setLoading(false);
      return;
    }
    if (!user?.email) {
      setMessage({ type: 'error', text: 'User session not found.' });
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (authError) {
        setMessage({ type: 'error', text: 'Current password verification failed.' });
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

      if (updateError) {
        setMessage({ type: 'error', text: 'Failed to update password: ' + updateError.message });
      } else {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected system error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8 relative">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Account Security</h2>
        <p className="text-muted-foreground text-sm">Manage your password and security settings</p>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-brand-destructive/10 border border-brand-destructive/20 text-brand-destructive'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Password Update */}
      <form onSubmit={handlePasswordUpdate} className="space-y-4 border border-border rounded-xl p-6 bg-card/50">
        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
          <Key className="w-5 h-5 text-brand-primary" /> Change Password
        </h3>
        <div>
          <label className="block text-sm font-medium text-foreground/60 mb-1.5">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-brand-primary" placeholder="Enter current password" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/60 mb-1.5">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-brand-primary" placeholder="Enter new password" required minLength={6} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/60 mb-1.5">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-brand-primary" placeholder="Confirm new password" required />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-brand-primary text-background py-2.5 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50">
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      {/* ✅ Dynamic MFA Section */}
      <div className="border border-border rounded-xl p-6 bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-brand-primary mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                Two-Factor Authentication
                {isMfaEnabled && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isMfaEnabled 
                  ? 'Your account is protected by an Authenticator app.' 
                  : 'Use an Authenticator app (Google/Authy) for extra security.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowMfaModal(true)}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-opacity text-sm ${
              isMfaEnabled 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                : 'bg-brand-primary text-background hover:opacity-90'
            }`}
          >
            {checkingMfa ? 'Checking...' : isMfaEnabled ? 'Manage MFA' : 'Enable'}
          </button>
        </div>
      </div>

      {/* MFA Modal */}
      {showMfaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm relative">
            <button onClick={() => setShowMfaModal(false)} className="absolute -top-10 right-0 text-sm font-semibold text-white/70 hover:text-white">
              Close
            </button>
            <MfaSetup
              onComplete={(action) => {
                setShowMfaModal(false);
                setIsMfaEnabled(action === 'enabled'); // ✅ Update UI state dynamically
                setMessage({ 
                  type: 'success', 
                  text: action === 'enabled' ? 'MFA Successfully Enabled!' : 'MFA Successfully Disabled!' 
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}