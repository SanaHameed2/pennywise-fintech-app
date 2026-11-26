// src/app/pages/TransferWizard.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  ChevronRight, ChevronLeft, CheckCircle2, Search, UserPlus, AlertCircle, Download, ShieldCheck, Info,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { useTransferSupabase, BeneficiaryError, type Beneficiary } from '../../hooks/useTransferSupabase';
import { useTransactionPin } from '../../hooks/useTransactionPin';
import { useStepUpMfa } from '../../hooks/useStepUpMfa';
import { PinInput } from '../../components/PinInput';
import { StepHeading } from '../../components/StepHeading';
import Footer from '../components/Footer';
import { formatMoney, safeParseMoney } from '../../utils/money';
import { maskIban } from '../../utils/iban';
import { TRANSFER_LIMITS } from '../../lib/limits';
import {
  errorKey, errorParams, type RpcFailure, type TransferSuccess,
} from '../../lib/rpc';

const STEP_COUNT = 4;

/** Numbers/IBANs must keep left-to-right order inside Urdu (RTL) text. */
const Ltr = ({ children }: { children: React.ReactNode }) => <bdi dir="ltr">{children}</bdi>;
const Money = ({ value }: { value: number | string }) => <Ltr>Rs. {formatMoney(value)}</Ltr>;

// ──────────────────────────── Step bar ────────────────────────────
const StepBar = React.memo(({ current }: { current: number }) => {
  const { t } = useTranslation();
  const steps = [
    t('transfer.stepBeneficiary'), t('transfer.stepAmount'), t('transfer.stepPin'), t('transfer.stepReceipt'),
  ];
  return (
    <nav aria-label={t('transfer.progress')} className="w-full mb-8">
      <ol className="flex items-center gap-0">
        {steps.map((label, i) => (
          <li
            key={label}
            aria-current={i === current ? 'step' : undefined}
            className="flex items-center flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center">
              <div
                aria-hidden="true"
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i < current ? 'bg-[#FF7F50] text-black'
                  : i === current ? 'bg-[#FF7F50] text-black ring-4 ring-[#FF7F50]/20'
                  : 'bg-white/10 text-white/70'}`}
              >
                {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`mt-1 text-xs font-medium whitespace-nowrap ${i <= current ? 'text-[#FF7F50]' : 'text-white/60'}`}>
                <span className="sr-only">
                  {t('transfer.stepOf', { n: i + 1, total: STEP_COUNT })}:{' '}
                </span>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div aria-hidden="true" className={`flex-1 h-0.5 mb-5 mx-1 transition-all duration-500 ${i < current ? 'bg-[#FF7F50]' : 'bg-white/10'}`} />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
});
StepBar.displayName = 'StepBar';

const fieldClass =
  'w-full px-4 py-2.5 rounded-lg border border-white/15 bg-white/5 text-white placeholder:text-white/50 text-sm ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]/60 focus:border-[#FF7F50]';

function ErrorBanner({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="flex items-start gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" /> <span>{children}</span>
    </p>
  );
}

// ──────────────────────────── Step 1: beneficiary ────────────────────────────
const BeneficiaryCard = React.memo(({ beneficiary, isSelected, onSelect }: {
  beneficiary: Beneficiary; isSelected: boolean; onSelect: (b: Beneficiary) => void;
}) => {
  const initials = beneficiary.avatar
    || beneficiary.name.split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(beneficiary)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]/60 ${
        isSelected ? 'border-[#FF7F50] bg-[#FF7F50]/10 shadow-sm' : 'border-white/10 hover:bg-white/5'}`}
    >
      <span aria-hidden="true" className="w-10 h-10 rounded-full bg-[#FF7F50] text-black flex items-center justify-center text-xs font-bold flex-shrink-0">
        {initials}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-white truncate">{beneficiary.name}</span>
        <span className="block text-xs text-white/70 truncate"><Ltr>{maskIban(beneficiary.iban)}</Ltr></span>
        <span className="block text-xs text-white/70 truncate">{beneficiary.bank}</span>
      </span>
      {isSelected && <CheckCircle2 className="w-5 h-5 text-[#FF7F50] flex-shrink-0" aria-hidden="true" />}
    </button>
  );
});
BeneficiaryCard.displayName = 'BeneficiaryCard';

function Step1({ onNext, beneficiaries, loading, onAddBeneficiary, focusHeading }: {
  onNext: (b: Beneficiary) => void;
  beneficiaries: Beneficiary[];
  loading: boolean;
  onAddBeneficiary: (name: string, iban: string, bank: string) => Promise<Beneficiary>;
  focusHeading: boolean;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Beneficiary | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIban, setNewIban] = useState('');
  const [newBank, setNewBank] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return beneficiaries.filter((b) => b.name.toLowerCase().includes(q) || b.bank.toLowerCase().includes(q));
  }, [beneficiaries, query]);

  const handleAdd = useCallback(async () => {
    setFormError(null);
    setIsAdding(true);
    try {
      const created = await onAddBeneficiary(newName, newIban, newBank);
      setShowAddForm(false);
      setNewName(''); setNewIban(''); setNewBank('');
      setSelected(created);
    } catch (err) {
      const code = err instanceof BeneficiaryError ? err.code : 'unknown';
      setFormError(t(`transfer.beneficiaryErrors.${code}`));
    } finally {
      setIsAdding(false);
    }
  }, [newName, newIban, newBank, onAddBeneficiary, t]);

  if (loading) {
    return (
      <div className="space-y-5" role="status" aria-live="polite">
        <div className="animate-pulse space-y-4" aria-hidden="true">
          <div className="h-8 bg-white/10 rounded w-3/4" />
          <div className="h-12 bg-white/10 rounded w-full" />
          <div className="h-20 bg-white/10 rounded w-full" />
        </div>
        <p className="text-center text-white/70 text-sm">{t('transfer.loadingBeneficiaries')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-start gap-3">
        <div>
          <StepHeading focus={focusHeading}>{t('transfer.selectBeneficiary')}</StepHeading>
          <p className="text-sm text-white/70 mt-0.5">{t('transfer.searchPayees')}</p>
        </div>
        <button
          type="button"
          aria-expanded={showAddForm}
          aria-controls="add-beneficiary-form"
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-1 text-[#FF7F50] text-sm hover:text-[#ff8f66] transition rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]/60 whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" aria-hidden="true" /> {t('transfer.addNew')}
        </button>
      </div>

      {showAddForm && (
        <form
          id="add-beneficiary-form"
          onSubmit={(e) => { e.preventDefault(); void handleAdd(); }}
          className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3"
          noValidate
        >
          <h3 className="text-white font-medium text-sm">{t('transfer.addBeneficiary')}</h3>
          <div>
            <label htmlFor="ben-name" className="block text-xs text-white/70 mb-1">{t('transfer.fullName')}</label>
            <input id="ben-name" type="text" autoComplete="off" value={newName} onChange={(e) => setNewName(e.target.value)} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="ben-iban" className="block text-xs text-white/70 mb-1">{t('transfer.iban')}</label>
            <input
              id="ben-iban" type="text" autoComplete="off" spellCheck={false} dir="ltr"
              aria-describedby="ben-iban-hint" value={newIban} onChange={(e) => setNewIban(e.target.value)}
              className={`${fieldClass} font-mono`}
            />
            <p id="ben-iban-hint" className="text-xs text-white/60 mt-1">{t('transfer.ibanHint')}</p>
          </div>
          <div>
            <label htmlFor="ben-bank" className="block text-xs text-white/70 mb-1">{t('transfer.bankName')}</label>
            <input id="ben-bank" type="text" autoComplete="off" value={newBank} onChange={(e) => setNewBank(e.target.value)} className={fieldClass} />
          </div>
          {formError && <ErrorBanner>{formError}</ErrorBanner>}
          <button
            type="submit" disabled={isAdding}
            className="w-full bg-[#FF7F50] hover:bg-[#ff8f66] disabled:opacity-50 text-black py-2.5 rounded-lg text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {isAdding ? t('transfer.adding') : t('transfer.addBeneficiaryBtn')}
          </button>
        </form>
      )}

      <div>
        <label htmlFor="ben-search" className="sr-only">{t('transfer.searchLabel')}</label>
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" aria-hidden="true" />
          <input
            id="ben-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={t('transfer.searchPlaceholder')}
            className={`${fieldClass} ps-9 rounded-xl`}
          />
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pe-1" aria-live="polite">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-white/70 py-4">{t('transfer.noBeneficiaries')}</p>
        ) : (
          filtered.map((b) => (
            <BeneficiaryCard key={b.id} beneficiary={b} isSelected={selected?.id === b.id} onSelect={setSelected} />
          ))
        )}
      </div>

      <button
        type="button" disabled={!selected} onClick={() => selected && onNext(selected)}
        className="w-full flex items-center justify-center gap-2 bg-[#FF7F50] hover:bg-[#ff8f66] disabled:opacity-40 disabled:cursor-not-allowed text-black py-3 rounded-xl font-semibold transition-all text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {t('common.continue')} <ChevronRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
      </button>
    </div>
  );
}

// ──────────────────────────── Step 2: amount ────────────────────────────
function Step2({ beneficiary, availableBalance, initialAmount, initialNote, onNext, onBack, focusHeading }: {
  beneficiary: Beneficiary; availableBalance: number; initialAmount: string; initialNote: string;
  onNext: (amount: string, note: string) => void; onBack: () => void; focusHeading: boolean;
}) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(initialAmount);
  const [note, setNote] = useState(initialNote);
  const [error, setError] = useState('');

  const handleContinue = () => {
    const num = safeParseMoney(amount);
    if (!amount || !(num > 0) || Math.round(Number(amount.replace(/,/g, '')) * 100) !== Math.round(num * 100)) {
      setError(t('transfer.validAmount')); return;
    }
    if (num > TRANSFER_LIMITS.perTransaction) {
      setError(t('errors.per_tx_limit', { limit: formatMoney(TRANSFER_LIMITS.perTransaction) })); return;
    }
    if (num > availableBalance) {
      setError(t('transfer.insufficientBalance', { balance: formatMoney(availableBalance) })); return;
    }
    setError('');
    onNext(String(num), note.trim());
  };

  return (
    <form className="space-y-5" noValidate onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
      <div>
        <StepHeading focus={focusHeading}>{t('transfer.enterAmount')}</StepHeading>
        <p className="text-sm text-white/70 mt-0.5">
          {t('transfer.sendingTo')} <span className="font-semibold text-white">{beneficiary.name}</span> · {beneficiary.bank}
        </p>
      </div>

      <div className="text-center py-2">
        <label htmlFor="transfer-amount" className="block text-xs text-white/70 mb-2">{t('transfer.amountLabel')}</label>
        <div className="flex items-center justify-center" dir="ltr">
          <span className="text-2xl text-white/70 font-light me-2" aria-hidden="true">Rs.</span>
          <input
            id="transfer-amount" type="text" inputMode="decimal" autoComplete="off"
            value={amount}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'amount-error amount-help' : 'amount-help'}
            onChange={(e) => { setAmount(e.target.value.replace(/[^\d.,]/g, '')); setError(''); }}
            placeholder="0.00"
            className={`w-full max-w-[220px] text-center text-4xl font-bold bg-transparent border-b-2 pb-3 focus:outline-none placeholder:text-white/50 transition-colors ${
              error ? 'border-red-400 text-red-300' : 'border-b-white/30 focus:border-[#FF7F50] text-white'}`}
          />
        </div>
      </div>

      {error && <ErrorBanner id="amount-error">{error}</ErrorBanner>}

      <div id="amount-help" className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-white/70">{t('transfer.availableBalance')}</span>
          <span className="font-semibold text-white"><Money value={availableBalance} /></span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-white/70">{t('transfer.perTransferLimit')}</span>
          <span className="font-semibold text-white"><Money value={TRANSFER_LIMITS.perTransaction} /></span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-white/70">{t('transfer.transferFee')}</span>
          <span className="font-semibold text-green-300">{t('transfer.free')}</span>
        </div>
      </div>

      <div>
        <label htmlFor="transfer-note" className="block text-xs text-white/70 mb-1">{t('transfer.noteLabel')}</label>
        <textarea
          id="transfer-note" maxLength={140} rows={2} value={note} onChange={(e) => setNote(e.target.value)}
          placeholder={t('transfer.addNote')}
          className={`${fieldClass} rounded-xl resize-none`}
        />
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="flex items-center gap-1 px-5 py-3 rounded-xl border border-white/15 text-sm font-semibold text-white hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]/60">
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" /> {t('common.back')}
        </button>
        <button type="submit"
          className="flex-1 flex items-center justify-center gap-2 bg-[#FF7F50] hover:bg-[#ff8f66] text-black py-3 rounded-xl font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
          {t('transfer.reviewTransfer')} <ChevronRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

// ──────────────────────────── PIN creation (first transfer) ────────────────────────────
function CreatePin({ onCreate }: { onCreate: (pin: string) => Promise<RpcFailure | null> }) {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (pin.length !== 6) { setError(t('errors.pin_format')); return; }
    if (pin !== confirm) { setError(t('pin.mismatch')); return; }
    setBusy(true);
    const failure = await onCreate(pin);
    setBusy(false);
    if (failure) setError(t(errorKey(failure.code), errorParams(failure)));
  };

  return (
    <div className="space-y-4 bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-start gap-2">
        <ShieldCheck className="w-5 h-5 text-[#FF7F50] flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-semibold text-white">{t('pin.createTitle')}</h3>
          <p className="text-xs text-white/70 mt-0.5">{t('pin.createHelp')}</p>
        </div>
      </div>
      <PinInput value={pin} onChange={(v) => { setPin(v); setError(''); }} label={t('pin.newPin')} masked autoComplete="new-password" />
      <PinInput value={confirm} onChange={(v) => { setConfirm(v); setError(''); }} label={t('pin.confirmPin')} masked autoComplete="new-password" />
      {error && <ErrorBanner>{error}</ErrorBanner>}
      <button type="button" onClick={() => void submit()} disabled={busy}
        className="w-full bg-[#FF7F50] hover:bg-[#ff8f66] disabled:opacity-50 text-black py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
        {busy ? t('transfer.processing') : t('pin.createButton')}
      </button>
    </div>
  );
}

// ──────────────────────────── Step 3: confirm (PIN + optional authenticator code) ────────────────────────────
type Banner = { failure: RpcFailure } | { text: string } | null;

function Step3({ beneficiary, amount, note, hasPin, mfaFresh, isProcessing, banner, onConfirm, onCreatePin, onBack, onChangeAmount, onChangeBeneficiary, focusHeading }: {
  beneficiary: Beneficiary; amount: string; note: string; hasPin: boolean | null; mfaFresh: boolean;
  isProcessing: boolean; banner: Banner;
  onConfirm: (pin: string, totp: string) => void;
  onCreatePin: (pin: string) => Promise<RpcFailure | null>;
  onBack: () => void; onChangeAmount: () => void; onChangeBeneficiary: () => void; focusHeading: boolean;
}) {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [totp, setTotp] = useState('');
  const num = safeParseMoney(amount);
  const needsMfa = num >= TRANSFER_LIMITS.mfaThreshold && !mfaFresh;

  const failure = banner && 'failure' in banner ? banner.failure : null;
  const bannerText = banner
    ? ('text' in banner ? banner.text : t(errorKey(banner.failure.code), errorParams(banner.failure)))
    : '';
  const mfaNotEnrolled = failure?.code === 'mfa_not_enrolled';
  const amountProblem = failure && ['insufficient_funds', 'per_tx_limit', 'daily_limit', 'invalid_amount'].includes(failure.code);
  const beneficiaryProblem = failure?.code === 'invalid_beneficiary';
  const locked = failure?.code === 'pin_locked';

  const ready = hasPin === true && pin.length === 6 && (!needsMfa || totp.length === 6) && !isProcessing && !locked;

  return (
    <form className="space-y-6" noValidate onSubmit={(e) => { e.preventDefault(); if (ready) onConfirm(pin, totp); }}>
      <div>
        <StepHeading focus={focusHeading}>{t('transfer.securePin')}</StepHeading>
        <p className="text-sm text-white/70 mt-0.5">{needsMfa ? t('transfer.largeTransfer') : t('transfer.enterPin')}</p>
      </div>

      <dl className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between gap-3"><dt className="text-white/70">{t('transfer.to')}</dt><dd className="font-semibold text-white text-end">{beneficiary.name}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-white/70">{t('transfer.bankName')}</dt><dd className="font-semibold text-white text-end">{beneficiary.bank}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-white/70">{t('transfer.iban')}</dt><dd className="font-semibold text-white text-end"><Ltr>{maskIban(beneficiary.iban)}</Ltr></dd></div>
        <div className="flex justify-between gap-3"><dt className="text-white/70">{t('common.amount')}</dt><dd className="font-bold text-white text-end text-base"><Money value={num} /></dd></div>
        {note && <div className="flex justify-between gap-3"><dt className="text-white/70">{t('transfer.noteLabel')}</dt><dd className="text-white text-end break-words max-w-[60%]">{note}</dd></div>}
      </dl>

      {hasPin === false && <CreatePin onCreate={onCreatePin} />}
      {hasPin === null && <p role="status" className="text-sm text-white/70 text-center">{t('common.loading')}</p>}

      {hasPin === true && (
        <>
          {needsMfa && (
            <div className="space-y-2">
              <p id="totp-label" className="text-sm font-medium text-white text-center">{t('transfer.authenticatorCode')}</p>
              <p className="text-xs text-white/70 text-center">{t('transfer.authenticatorHelp')}</p>
              <PinInput value={totp} onChange={setTotp} label={t('transfer.authenticatorCode')} autoComplete="one-time-code" disabled={isProcessing} focusOnMount={focusHeading} />
            </div>
          )}
          <div className="space-y-2">
            <p id="pin-label" className="text-sm font-medium text-white text-center">{t('transfer.transactionPin')}</p>
            <PinInput
              value={pin} onChange={setPin} label={t('transfer.transactionPin')} masked
              disabled={isProcessing || locked} invalid={failure?.code === 'wrong_pin'} describedBy={banner ? 'confirm-error' : undefined}
              focusOnMount={focusHeading && !needsMfa}
            />
          </div>
        </>
      )}

      {banner && (
        <div className="space-y-2">
          <ErrorBanner id="confirm-error">{bannerText}</ErrorBanner>
          {failure?.code === 'network' && (
            <p className="flex items-start gap-2 text-xs text-white/70"><Info className="w-4 h-4 flex-shrink-0" aria-hidden="true" />{t('transfer.retrySafe')}</p>
          )}
          {mfaNotEnrolled && (
            <Link to="/settings" className="inline-block text-sm text-[#FF7F50] underline underline-offset-2 hover:text-[#ff8f66]">{t('transfer.enable2fa')}</Link>
          )}
          {amountProblem && (
            <button type="button" onClick={onChangeAmount} className="text-sm text-[#FF7F50] underline underline-offset-2 hover:text-[#ff8f66]">{t('transfer.changeAmount')}</button>
          )}
          {beneficiaryProblem && (
            <button type="button" onClick={onChangeBeneficiary} className="text-sm text-[#FF7F50] underline underline-offset-2 hover:text-[#ff8f66]">{t('transfer.changeBeneficiary')}</button>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={isProcessing}
          className="flex items-center gap-1 px-5 py-3 rounded-xl border border-white/15 text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]/60">
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" /> {t('common.back')}
        </button>
        <button type="submit" disabled={!ready} aria-busy={isProcessing}
          className="flex-1 bg-[#FF7F50] text-black py-3 rounded-xl font-semibold text-sm hover:bg-[#ff8f66] disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
          {isProcessing ? t('transfer.processing') : t('transfer.confirmTransfer')}
        </button>
      </div>
    </form>
  );
}

// ──────────────────────────── Step 4: receipt (only ever shown for a real, server-confirmed transfer) ────────────────────────────
function Step4({ result, beneficiary, note, onReset, focusHeading }: {
  result: TransferSuccess; beneficiary: Beneficiary; note: string; onReset: () => void; focusHeading: boolean;
}) {
  const { t, i18n } = useTranslation();
  const dateStr = useMemo(
    () => new Intl.DateTimeFormat(i18n.language === 'ur' ? 'ur-PK' : 'en-PK', { dateStyle: 'medium', timeStyle: 'short' })
      .format(new Date(result.created_at)),
    [result.created_at, i18n.language],
  );

  const downloadReceipt = () => {
    const line = '='.repeat(41);
    const text = [
      line, `           ${t('transfer.receiptTitle')}`, line,
      `${t('transfer.date')}: ${dateStr}`,
      `${t('transfer.reference')}: ${result.reference}`,
      '-'.repeat(41),
      `${t('transfer.stepBeneficiary')}: ${beneficiary.name}`,
      `${t('transfer.bankName')}: ${beneficiary.bank}`,
      `${t('transfer.iban')}: ${maskIban(beneficiary.iban)}`,
      `${t('transfer.amountSent')}: Rs. ${formatMoney(result.amount)}`,
      ...(note ? [`${t('transfer.noteLabel')}: ${note}`] : []),
      `${t('common.status')}: ${t('common.completed')}`,
      line, `   ${t('transfer.sandboxNotice')}`, line, '',
    ].join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pennywise_Receipt_${result.reference}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const rows: Array<[string, React.ReactNode]> = [
    [t('transfer.date'), dateStr],
    [t('transfer.reference'), <Ltr key="r">{result.reference}</Ltr>],
    [t('transfer.stepBeneficiary'), beneficiary.name],
    [t('transfer.amountSent'), <Money key="a" value={result.amount} />],
    [t('transfer.newBalance'), <Money key="b" value={result.new_balance} />],
    [t('common.status'), <span key="s" className="text-green-300">{t('common.completed')}</span>],
  ];

  return (
    <div className="space-y-6 text-center">
      <div aria-hidden="true" className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-9 h-9 text-green-400" />
      </div>
      <div role="status">
        <StepHeading focus={focusHeading}>{t('transfer.transferSuccessful')}</StepHeading>
        <p className="text-sm text-white/70 mt-0.5">{result.replayed ? t('transfer.alreadyProcessed') : t('transfer.sandboxNotice')}</p>
      </div>

      <dl className="bg-white/5 border border-white/10 rounded-2xl p-5 text-start space-y-3">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 text-sm border-b border-white/10 pb-2 last:border-0 last:pb-0">
            <dt className="text-white/70">{k}</dt>
            <dd className="font-semibold text-white text-end">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-3">
        <button type="button" onClick={downloadReceipt}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 py-3 rounded-xl font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
          <Download className="w-4 h-4" aria-hidden="true" /> {t('transfer.downloadReceipt')}
        </button>
        <Link to="/transactions"
          className="block w-full border border-white/15 text-white hover:bg-white/5 py-3 rounded-xl font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]/60">
          {t('transfer.viewTransactions')}
        </Link>
        <button type="button" onClick={onReset}
          className="w-full bg-[#FF7F50] hover:bg-[#ff8f66] text-black py-3 rounded-xl font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
          {t('transfer.newTransfer')}
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────── Wizard ────────────────────────────
export default function TransferWizard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [liveBalance, setLiveBalance] = useState(0);
  const [banner, setBanner] = useState<Banner>(null);
  const [success, setSuccess] = useState<TransferSuccess | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [userHasNavigated, setUserHasNavigated] = useState(false);

  // One idempotency key per transfer *attempt*: reused on retry, replaced when details change.
  const attemptKey = useRef<string>(crypto.randomUUID());

  const { beneficiaries, loading, addBeneficiary, executeTransfer } = useTransferSupabase();
  const { hasPin, savePin } = useTransactionPin();
  const mfa = useStepUpMfa();

  useEffect(() => {
    let cancelled = false;
    const loadBalance = async () => {
      if (!userId) return;
      const { data } = await supabase.from('wallets').select('balance').eq('user_id', userId).maybeSingle();
      if (!cancelled && data) setLiveBalance(Number(data.balance));
    };
    void loadBalance();
    return () => { cancelled = true; };
  }, [userId, step]);

  // Tell screen readers where they are; focus itself moves via <StepHeading focus>.
  const go = useCallback((next: number) => {
    const labels = [t('transfer.stepBeneficiary'), t('transfer.stepAmount'), t('transfer.stepPin'), t('transfer.stepReceipt')];
    setUserHasNavigated(true);
    setBanner(null);
    setStep(next);
    setAnnouncement(`${t('transfer.stepOf', { n: next + 1, total: STEP_COUNT })}: ${labels[next]}`);
  }, [t]);

  const reset = useCallback(() => {
    attemptKey.current = crypto.randomUUID();
    mfa.reset();
    setBeneficiary(null); setAmount(''); setNote(''); setSuccess(null);
    go(0);
  }, [go, mfa]);

  const handleCreatePin = useCallback(async (pin: string): Promise<RpcFailure | null> => {
    const result = await savePin(pin);
    return result.success ? null : result;
  }, [savePin]);

  const handleConfirm = useCallback(async (pin: string, totp: string) => {
    if (!beneficiary) return;
    setIsProcessing(true);
    setBanner(null);
    try {
      if (safeParseMoney(amount) >= TRANSFER_LIMITS.mfaThreshold && !mfa.isFresh()) {
        const check = await mfa.verify(totp);
        if (!check.ok) {
          setBanner(check.reason === 'not_enrolled'
            ? { failure: { success: false, code: 'mfa_not_enrolled' } }
            : { text: t(check.reason === 'invalid_code' ? 'transfer.invalidAuthCode' : 'errors.unknown') });
          return;
        }
      }

      const result = await executeTransfer({
        amount: safeParseMoney(amount), beneficiaryId: beneficiary.id, note, pin, idempotencyKey: attemptKey.current,
      });

      if (result.success) {
        setLiveBalance(result.new_balance);
        setSuccess(result);
        void queryClient.invalidateQueries({ queryKey: ['insights'] });
        go(3);
      } else {
        // Failure: stay on the confirm step, say why, never show the receipt.
        setBanner({ failure: result });
      }
    } finally {
      setIsProcessing(false);
    }
  }, [amount, beneficiary, executeTransfer, go, mfa, note, queryClient, t]);

  const content = (() => {
    const focusHeading = userHasNavigated;
    switch (step) {
      case 0:
        return <Step1 onNext={(b) => { setBeneficiary(b); go(1); }} beneficiaries={beneficiaries} loading={loading} onAddBeneficiary={addBeneficiary} focusHeading={focusHeading} />;
      case 1:
        return beneficiary ? (
          <Step2
            beneficiary={beneficiary} availableBalance={liveBalance} initialAmount={amount} initialNote={note}
            onNext={(a, n) => { setAmount(a); setNote(n); attemptKey.current = crypto.randomUUID(); go(2); }}
            onBack={() => go(0)} focusHeading={focusHeading}
          />
        ) : null;
      case 2:
        return beneficiary ? (
          <Step3
            beneficiary={beneficiary} amount={amount} note={note} hasPin={hasPin} mfaFresh={mfa.isFresh()}
            isProcessing={isProcessing} banner={banner} onConfirm={(p, c) => void handleConfirm(p, c)}
            onCreatePin={handleCreatePin} onBack={() => go(1)} onChangeAmount={() => go(1)} onChangeBeneficiary={() => go(0)}
            focusHeading={focusHeading}
          />
        ) : null;
      case 3:
        return success && beneficiary ? (
          <Step4 result={success} beneficiary={beneficiary} note={note} onReset={reset} focusHeading={focusHeading} />
        ) : null;
      default:
        return null;
    }
  })();

  return (
    <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden relative selection:bg-[#FF7F50]/20 antialiased font-sans">
      <div aria-hidden="true" className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#FF7F50]/10 to-transparent blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-lg mx-auto px-4 py-10">
          <motion.section
            aria-labelledby="transfer-title"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#0d0d12] border border-white/[0.08] rounded-2xl shadow-lg p-6 md:p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <span aria-hidden="true" className="text-xl text-[#FF7F50] font-bold">Rs.</span>
              <h1 id="transfer-title" className="text-sm font-semibold text-white/70 uppercase tracking-widest">
                {t('transfer.title')}
              </h1>
            </div>

            <StepBar current={step} />

            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
              >
                {content}
              </motion.div>
            </AnimatePresence>
          </motion.section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
