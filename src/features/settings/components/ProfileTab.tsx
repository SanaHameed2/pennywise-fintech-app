import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabaseClient';
import { User, Mail, Globe, Camera } from 'lucide-react';

interface ProfileData {
  full_name: string;
  email: string;
  avatar_url: string | null;
  currency: string;
}

export default function ProfileTab() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    email: '',
    avatar_url: null,
    currency: 'USD'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          avatar_url: data.avatar_url || null,
          currency: data.currency || 'USD'
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        currency: profile.currency,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to update profile: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      await supabase.auth.refreshSession();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        {/* Aligned loading spinner to core centralized brand token */}
        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold text-foreground mb-2">Profile Information</h2>
      <p className="text-muted-foreground text-sm mb-6">Manage your personal account details</p>

      {message && (
        <div className={`p-3 rounded-xl mb-4 text-sm ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
            : 'bg-brand-destructive/10 border border-brand-destructive/20 text-brand-destructive'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-4">
          {/* Avatar frame aligned with system layout rules instead of orange gradient */}
          <div className="w-20 h-20 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-2xl font-bold text-brand-primary">
            {profile.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm text-foreground/70 hover:bg-muted/50 transition-colors"
          >
            <Camera className="w-4 h-4" />
            Change Photo
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/60 mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-brand-primary transition-colors"
              placeholder="Your full name"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/60 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-muted/30 text-muted-foreground cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-muted-foreground/60 mt-1">Email cannot be changed for security reasons</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/60 mb-1.5">Account Currency</label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <select
              value={profile.currency}
              onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
              className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-border bg-card text-foreground appearance-none focus:outline-none focus:border-brand-primary transition-colors"
            >
              {/* Added dark styles block for standard native dropdown cross-compatibility */}
              <option value="USD" className="bg-background text-foreground">🇺🇸 USD - US Dollar</option>
              <option value="EUR" className="bg-background text-foreground">🇪🇺 EUR - Euro</option>
              <option value="GBP" className="bg-background text-foreground">🇬🇧 GBP - British Pound</option>
              <option value="PKR" className="bg-background text-foreground">🇵🇰 PKR - Pakistani Rupee</option>
              <option value="INR" className="bg-background text-foreground">🇮🇳 INR - Indian Rupee</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-foreground/40">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Clean, high-signal engineering first brand execution button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand-primary text-background py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            'Save Profile Changes'
          )}
        </button>
      </form>
    </div>
  );
}