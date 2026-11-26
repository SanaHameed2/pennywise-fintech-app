// src/features/settings/components/TransactionPinCard.tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { PinInput } from '../../../components/PinInput';
import { useTransactionPin } from '../../../hooks/useTransactionPin';
import { errorKey, errorParams } from '../../../lib/rpc';

export default function TransactionPinCard() {
  const { t } = useTranslation();
  const { hasPin, savePin } = useTransactionPin();
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const reset = () => { setEditing(false); setCurrent(''); setNext(''); setConfirm(''); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (next.length !== 6) { setStatus({ ok: false, text: t('errors.pin_format') }); return; }
    if (next !== confirm) { setStatus({ ok: false, text: t('pin.mismatch') }); return; }
    setBusy(true);
    const result = await savePin(next, hasPin ? current : undefined);
    setBusy(false);
    if (result.success) { reset(); setStatus({ ok: true, text: t('settings.security.pin.saved') }); }
    else setStatus({ ok: false, text: t(errorKey(result.code), errorParams(result)) });
  };

  return (
    <section aria-labelledby="pin-card-title" className="border border-border rounded-xl p-6 bg-card/50 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <KeyRound className="w-5 h-5 text-brand-primary mt-0.5" aria-hidden="true" />
          <div>
            <h3 id="pin-card-title" className="text-lg font-medium text-foreground">{t('settings.security.pin.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {hasPin ? t('settings.security.pin.statusSet') : t('settings.security.pin.statusNotSet')}
            </p>
          </div>
        </div>
        {!editing && hasPin !== null && (
          <button type="button" onClick={() => { setStatus(null); setEditing(true); }}
            className="shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm bg-brand-primary text-background hover:bg-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
            {hasPin ? t('settings.security.pin.change') : t('settings.security.pin.set')}
          </button>
        )}
      </div>

      {editing && (
        <form onSubmit={(e) => void submit(e)} className="space-y-4 pt-2" noValidate>
          {hasPin && (
            <div className="space-y-2">
              <p className="text-sm text-foreground text-center">{t('pin.currentPin')}</p>
              <PinInput value={current} onChange={setCurrent} label={t('pin.currentPin')} masked autoComplete="current-password" focusOnMount />
            </div>
          )}
          <div className="space-y-2">
            <p className="text-sm text-foreground text-center">{t('pin.newPin')}</p>
            <PinInput value={next} onChange={setNext} label={t('pin.newPin')} masked autoComplete="new-password" focusOnMount={!hasPin} />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-foreground text-center">{t('pin.confirmPin')}</p>
            <PinInput value={confirm} onChange={setConfirm} label={t('pin.confirmPin')} masked autoComplete="new-password" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={reset} disabled={busy}
              className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={busy}
              className="flex-1 bg-brand-primary text-background py-2.5 rounded-xl font-semibold hover:bg-brand-hover disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
              {busy ? t('transfer.processing') : t('settings.security.pin.save')}
            </button>
          </div>
        </form>
      )}

      {status && (
        <p role={status.ok ? 'status' : 'alert'}
          className={`p-3 rounded-xl text-sm flex items-center gap-2 ${status.ok ? 'bg-green-500/10 border border-green-500/20 text-green-300' : 'bg-destructive/10 border border-destructive/30 text-destructive'}`}>
          {status.ok ? <CheckCircle className="w-4 h-4" aria-hidden="true" /> : <AlertCircle className="w-4 h-4" aria-hidden="true" />}
          {status.text}
        </p>
      )}
    </section>
  );
}
