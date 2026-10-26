import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../hooks/useAuth';
import { Lock, Key, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function SecurityTab() {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // 1. Client-Side Edge Validations
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
      // 2. Strict Re-Authentication Step (Verification before mutation)
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (authError) {
        setMessage({ type: 'error', text: 'Current password verification failed. Please try again.' });
        setLoading(false);
        return;
      }

      // 3. Secure Mutation Layer
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setMessage({ type: 'error', text: 'Failed to update password: ' + updateError.message });
      } else {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      // ✅ no binding AND no `: any` — err was unused
      setMessage({ type: 'error', text: 'An unexpected system error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
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

      {/* Password Update Card Block */}
      <form onSubmit={handlePasswordUpdate} className="space-y-4 border border-border rounded-xl p-6 bg-card/50">
        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
          <Key className="w-5 h-5 text-brand-primary" />
          Change Password
        </h3>

        <div>
          <label className="block text-sm font-medium text-foreground/60 mb-1.5">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-brand-primary transition-colors"
              placeholder="Enter current password"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/60 mb-1.5">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-brand-primary transition-colors"
              placeholder="Enter new password (min 6 characters)"
              required
              minLength={6}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/60 mb-1.5">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-brand-primary transition-colors"
              placeholder="Confirm new password"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-primary text-background py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin" />
              Updating...
            </div>
          ) : (
            'Update Password'
          )}
        </button>
      </form>

      {/* 2FA Toggle Controller */}
      <div className="border border-border rounded-xl p-6 bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-brand-primary mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-foreground">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
              twoFactorEnabled ? 'bg-brand-primary' : 'bg-muted'
            }`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
              twoFactorEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
        {twoFactorEnabled && (
          <p className="text-sm text-green-400 mt-3 flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            2FA setup interface is ready (MFA verification streams can be connected next)
          </p>
        )}
      </div>
    </div>
  );
}