// src/app/pages/ResetPassword.tsx
// Reached from the e-mailed recovery link. supabase-js turns the link into a (recovery) session,
// which is what authorises updateUser({ password }).
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';

const MIN = 8;

export default function ResetPassword() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN) { setError(t('settings.security.password.tooShort', { min: MIN })); return; }
    if (password !== confirm) { setError(t('settings.security.password.mismatch')); return; }
    setBusy(true); setError('');
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) setError(t('settings.security.password.failed'));
      else navigate('/dashboard', { replace: true });
    } catch {
      setError(t('settings.security.password.failed'));
    } finally {
      setBusy(false);
    }
  };

  const field = (id: string, label: string, value: string, set: (v: string) => void, hint?: string) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-white/80 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" aria-hidden="true" />
        <input id={id} type="password" autoComplete="new-password" required value={value} dir="ltr"
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => { set(e.target.value); setError(''); }}
          className="w-full ps-11 pe-4 py-3 rounded-xl border border-white/15 bg-white/5 text-sm text-white focus:outline-none focus:border-[#FF7F50] focus-visible:ring-2 focus-visible:ring-[#FF7F50]/60" />
      </div>
      {hint && <p id={`${id}-hint`} className="text-xs text-white/70">{hint}</p>}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-10 bg-[#050507] text-white font-sans">
      <section aria-labelledby="reset-title" className="w-full max-w-md bg-[#0d0d12] border border-white/[0.06] rounded-2xl p-8 shadow-2xl space-y-6">
        <h1 id="reset-title" className="text-3xl font-bold tracking-tight text-center">{t('auth.reset.title')}</h1>

        {loading ? (
          <p role="status" className="text-center text-white/70">{t('common.loading')}</p>
        ) : !user ? (
          <div className="space-y-4 text-center">
            <p role="alert" className="text-sm text-red-300">{t('auth.reset.invalidLink')}</p>
            <Link to="/forgot-password" className="inline-block text-sm text-[#FF7F50] underline underline-offset-2">{t('auth.reset.requestNew')}</Link>
          </div>
        ) : (
          <form onSubmit={(e) => void submit(e)} noValidate className="space-y-4">
            {error && (
              <p role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" /> {error}
              </p>
            )}
            {field('reset-new', t('settings.security.password.new'), password, setPassword, t('settings.security.password.hint', { min: MIN }))}
            {field('reset-confirm', t('settings.security.password.confirm'), confirm, setConfirm)}
            <button type="submit" disabled={busy} aria-busy={busy}
              className="w-full bg-[#FF7F50] hover:bg-[#ff8f66] disabled:opacity-50 text-black font-bold py-3.5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
              {busy ? t('settings.security.password.updating') : t('auth.reset.button')}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
