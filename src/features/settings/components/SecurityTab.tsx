// src/features/settings/components/SecurityTab.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../hooks/useAuth';
import { Lock, Key, Shield, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import MfaSetup from '../../../app/components/MfaSetup';
import { Modal } from '../../../components/Modal';
import TransactionPinCard from './TransactionPinCard';

const MIN_PASSWORD_LENGTH = 8;
const inputClass =
  'w-full ps-11 pe-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-foreground/50 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus:border-brand-primary';

function PasswordField({ id, label, value, onChange, autoComplete, hint }: {
  id: string; label: string; value: string; onChange: (v: string) => void; autoComplete: string; hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground/80 mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60 pointer-events-none" aria-hidden="true" />
        <input id={id} type="password" value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete}
          aria-describedby={hint ? `${id}-hint` : undefined} className={inputClass} required />
      </div>
      {hint && <p id={`${id}-hint`} className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

export default function SecurityTab() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isGuest = Boolean(user?.is_anonymous);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [showMfaModal, setShowMfaModal] = useState(false);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [checkingMfa, setCheckingMfa] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const { data } = await supabase.auth.mfa.listFactors();
        if (!cancelled) setIsMfaEnabled(Boolean(data?.all?.some((f) => f.status === 'verified' && f.factor_type === 'totp')));
      } catch {
        /* leave as "not enabled"; the Manage dialog reports real errors */
      } finally {
        if (!cancelled) setCheckingMfa(false);
      }
    };
    void check();
    return () => { cancelled = true; };
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) { setMessage({ type: 'error', text: t('settings.security.password.mismatch') }); return; }
    if (newPassword.length < MIN_PASSWORD_LENGTH) { setMessage({ type: 'error', text: t('settings.security.password.tooShort', { min: MIN_PASSWORD_LENGTH }) }); return; }
    if (!user?.email) { setMessage({ type: 'error', text: t('errors.not_authenticated') }); return; }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email: user.email, password: oldPassword });
      if (authError) { setMessage({ type: 'error', text: t('settings.security.password.wrongCurrent') }); return; }
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) { setMessage({ type: 'error', text: t('settings.security.password.failed') }); return; }
      setMessage({ type: 'success', text: t('settings.security.password.updated') });
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch {
      setMessage({ type: 'error', text: t('settings.security.password.failed') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">{t('settings.security.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('settings.security.subtitle')}</p>
      </div>

      <div aria-live="polite">
        {message && (
          <p role={message.type === 'error' ? 'alert' : 'status'}
            className={`p-3 rounded-xl text-sm flex items-center gap-2 ${message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-300'
              : 'bg-destructive/10 border border-destructive/30 text-destructive'}`}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4" aria-hidden="true" /> : <AlertCircle className="w-4 h-4" aria-hidden="true" />}
            {message.text}
          </p>
        )}
      </div>

      <TransactionPinCard />

      {isGuest ? (
        <div className="border border-border rounded-xl p-6 bg-card/50 space-y-3">
          <p className="text-sm text-foreground/90">{t('settings.guest.notice')}</p>
          <Link to="/signup" className="inline-block px-5 py-2.5 rounded-xl font-semibold text-sm bg-brand-primary text-background hover:bg-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-white">{t('settings.guest.cta')}</Link>
        </div>
      ) : (
      <form onSubmit={(e) => void handlePasswordUpdate(e)} className="space-y-4 border border-border rounded-xl p-6 bg-card/50">
        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
          <Key className="w-5 h-5 text-brand-primary" aria-hidden="true" /> {t('settings.security.password.title')}
        </h3>
        <PasswordField id="pw-current" label={t('settings.security.password.current')} value={oldPassword} onChange={setOldPassword} autoComplete="current-password" />
        <PasswordField id="pw-new" label={t('settings.security.password.new')} value={newPassword} onChange={setNewPassword} autoComplete="new-password"
          hint={t('settings.security.password.hint', { min: MIN_PASSWORD_LENGTH })} />
        <PasswordField id="pw-confirm" label={t('settings.security.password.confirm')} value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
        <button type="submit" disabled={loading}
          className="w-full bg-brand-primary text-background py-2.5 rounded-xl font-semibold hover:bg-brand-hover disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
          {loading ? t('settings.security.password.updating') : t('settings.security.password.update')}
        </button>
      </form>
      )}

      <section aria-labelledby="mfa-title" className="border border-border rounded-xl p-6 bg-card/50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-brand-primary mt-0.5" aria-hidden="true" />
            <div>
              <h3 id="mfa-title" className="text-lg font-medium text-foreground flex items-center gap-2">
                {t('settings.security.mfa.title')}
                {isMfaEnabled && <ShieldCheck className="w-4 h-4 text-emerald-400" aria-label={t('settings.security.mfa.on')} />}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isMfaEnabled ? t('settings.security.mfa.enabledText') : t('settings.security.mfa.disabledText')}
              </p>
            </div>
          </div>
          <button type="button" onClick={() => setShowMfaModal(true)} disabled={checkingMfa}
            className={`shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60 ${
              isMfaEnabled
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-brand-primary text-background hover:bg-brand-hover'}`}>
            {checkingMfa ? t('settings.security.mfa.checking') : isMfaEnabled ? t('settings.security.mfa.manage') : t('settings.security.mfa.enable')}
          </button>
        </div>
      </section>

      <Modal open={showMfaModal} onClose={() => setShowMfaModal(false)} title={t('settings.security.mfa.dialogTitle')}>
        <MfaSetup
          onComplete={(action) => {
            setShowMfaModal(false);
            setIsMfaEnabled(action === 'enabled');
            setMessage({ type: 'success', text: action === 'enabled' ? t('settings.security.mfa.enabledMsg') : t('settings.security.mfa.disabledMsg') });
          }}
        />
      </Modal>
    </div>
  );
}
