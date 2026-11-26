// src/features/settings/components/ProfileTab.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabaseClient';

const inputClass =
  'w-full ps-11 pe-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-foreground/50 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus:border-brand-primary';

export default function ProfileTab() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id;
  const [fullName, setFullName] = useState<string>(() => String(user?.user_metadata?.full_name ?? ''));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await Promise.resolve();
      if (cancelled) return;
      if (!userId) { setLoading(false); return; }
      const { data } = await supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle();
      if (!cancelled) {
        if (data?.full_name) setFullName(data.full_name);
        setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const name = fullName.trim();
    if (!name) { setMessage({ ok: false, text: t('settings.profile.nameRequired') }); return; }

    setSaving(true);
    setMessage(null);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name, updated_at: new Date().toISOString() })
      .eq('id', userId);
    // keep the name shown in the navbar (auth metadata) in sync with the profile row
    const { error: metaError } = error ? { error } : await supabase.auth.updateUser({ data: { full_name: name } });
    setSaving(false);
    setMessage(error || metaError
      ? { ok: false, text: t('settings.profile.failed') }
      : { ok: true, text: t('settings.profile.saved') });
  };

  if (loading) {
    return <div role="status" className="py-12 text-center text-sm text-muted-foreground">{t('common.loading')}</div>;
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold text-foreground mb-2">{t('settings.profile.title')}</h2>
      <p className="text-muted-foreground text-sm mb-6">{t('settings.profile.subtitle')}</p>

      <div aria-live="polite" className="mb-4">
        {message && (
          <p role={message.ok ? 'status' : 'alert'}
            className={`p-3 rounded-xl text-sm flex items-center gap-2 ${message.ok
              ? 'bg-green-500/10 border border-green-500/20 text-green-300'
              : 'bg-destructive/10 border border-destructive/30 text-destructive'}`}>
            {message.ok ? <CheckCircle className="w-4 h-4" aria-hidden="true" /> : <AlertCircle className="w-4 h-4" aria-hidden="true" />}
            {message.text}
          </p>
        )}
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5" noValidate>
        <div>
          <label htmlFor="profile-name" className="block text-sm font-medium text-foreground/80 mb-1.5">{t('settings.profile.fullName')}</label>
          <div className="relative">
            <User className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60 pointer-events-none" aria-hidden="true" />
            <input id="profile-name" type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} maxLength={80} />
          </div>
        </div>

        <div>
          <label htmlFor="profile-email" className="block text-sm font-medium text-foreground/80 mb-1.5">{t('settings.profile.email')}</label>
          <div className="relative">
            <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60 pointer-events-none" aria-hidden="true" />
            <input id="profile-email" type="email" value={user?.email ?? ''} placeholder={user?.is_anonymous ? t('settings.profile.noEmail') : undefined} readOnly aria-describedby="profile-email-help" dir="ltr"
              className="w-full ps-11 pe-4 py-2.5 rounded-xl border border-border bg-muted/30 text-muted-foreground cursor-not-allowed" />
          </div>
          <p id="profile-email-help" className="text-xs text-muted-foreground mt-1">{t('settings.profile.emailHelp')}</p>
        </div>

        <div>
          <p className="block text-sm font-medium text-foreground/80 mb-1.5">{t('settings.profile.currency')}</p>
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground">
            <Wallet className="w-4 h-4 text-foreground/60" aria-hidden="true" />
            <span>{t('settings.profile.currencyValue')}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t('settings.profile.currencyHelp')}</p>
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-brand-primary text-background py-2.5 rounded-xl font-semibold hover:bg-brand-hover disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
          {saving ? t('settings.profile.saving') : t('settings.profile.save')}
        </button>
      </form>
    </div>
  );
}
