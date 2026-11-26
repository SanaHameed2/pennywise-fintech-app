// src/app/pages/ForgotPassword.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError(t('auth.invalidEmail')); return; }
    setBusy(true); setError('');
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
      // Network/rate-limit problems are reported; "no such account" is deliberately NOT revealed.
      if (err && /fetch|network|rate/i.test(err.message)) setError(t('auth.forgot.failed'));
      else setSent(true);
    } catch {
      setError(t('auth.forgot.failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-10 bg-[#050507] text-white font-sans">
      <section aria-labelledby="forgot-title" className="w-full max-w-md bg-[#0d0d12] border border-white/[0.06] rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 id="forgot-title" className="text-3xl font-bold tracking-tight">{t('auth.forgot.title')}</h1>
          <p className="text-sm text-white/70">{t('auth.forgot.subtitle')}</p>
        </div>

        {sent ? (
          <div role="status" className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p>{t('auth.forgot.sent')}</p>
          </div>
        ) : (
          <form onSubmit={(e) => void submit(e)} noValidate className="space-y-4">
            {error && (
              <p role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" /> {error}
              </p>
            )}
            <div className="space-y-1.5">
              <label htmlFor="forgot-email" className="text-xs font-semibold text-white/80 uppercase tracking-wide">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" aria-hidden="true" />
                <input id="forgot-email" type="email" inputMode="email" autoComplete="email" dir="ltr" required value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="you@email.com"
                  className="w-full ps-11 pe-4 py-3 rounded-xl border border-white/15 bg-white/5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-[#FF7F50] focus-visible:ring-2 focus-visible:ring-[#FF7F50]/60" />
              </div>
            </div>
            <button type="submit" disabled={busy} aria-busy={busy}
              className="w-full bg-[#FF7F50] hover:bg-[#ff8f66] disabled:opacity-50 text-black font-bold py-3.5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
              {busy ? t('transfer.processing') : t('auth.forgot.button')}
            </button>
          </form>
        )}

        <p className="text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-[#FF7F50] hover:text-[#ff8f66] rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]">
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" /> {t('auth.forgot.back')}
          </Link>
        </p>
      </section>
    </div>
  );
}
