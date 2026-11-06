// src/app/pages/TransferWizard.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight, ChevronLeft, CheckCircle2,
  Search, UserPlus, AlertCircle, Download
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { useTransferSupabase } from '../../hooks/useTransferSupabase';
import Footer from '../components/Footer';
import { formatMoney, safeParseMoney } from '../../utils/money';

interface Beneficiary {
  id: number;
  name: string;
  iban: string;
  bank: string;
  avatar?: string;
}

const StepBar = React.memo(({ current }: { current: number }) => {
  const { t } = useTranslation();

  const steps = [
    t('transfer.stepBeneficiary'),
    t('transfer.stepAmount'),
    t('transfer.stepPin'),
    t('transfer.stepReceipt'),
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center gap-0">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                i < current ? 'bg-[#FF7F50] text-black' :
                i === current ? 'bg-[#FF7F50] text-black ring-4 ring-[#FF7F50]/20' :
                'bg-white/10 text-white/50'
              }`}>
                {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`mt-1 text-[10px] font-medium whitespace-nowrap ${
                i <= current ? 'text-[#FF7F50]' : 'text-white/40'
              }`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 mx-1 transition-all duration-500 ${
                i < current ? 'bg-[#FF7F50]' : 'bg-white/10'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

StepBar.displayName = 'StepBar';

const BeneficiaryCard = React.memo(({
  beneficiary,
  isSelected,
  onSelect
}: {
  beneficiary: Beneficiary;
  isSelected: boolean;
  onSelect: (b: Beneficiary) => void;
}) => {
  const getInitials = useCallback((name: string) => {
    if (!name) return '??';
    return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }, []);

  return (
    <button
      onClick={() => onSelect(beneficiary)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
        isSelected
          ? 'border-[#FF7F50] bg-[#FF7F50]/10 shadow-sm'
          : 'border-white/10 hover:bg-white/5'
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-[#FF7F50] text-black flex items-center justify-center text-xs font-bold flex-shrink-0">
        {beneficiary.avatar ? beneficiary.avatar : getInitials(beneficiary.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{beneficiary.name}</p>
        <p className="text-xs text-white/40 truncate">{beneficiary.iban}</p>
        <p className="text-xs text-white/40 truncate">{beneficiary.bank}</p>
      </div>
      {isSelected && <CheckCircle2 className="w-5 h-5 text-[#FF7F50] flex-shrink-0" />}
    </button>
  );
});

BeneficiaryCard.displayName = 'BeneficiaryCard';

function Step1({
  onNext,
  beneficiaries = [],
  loading,
  onAddBeneficiary
}: {
  onNext: (b: Beneficiary) => void;
  beneficiaries: Beneficiary[];
  loading: boolean;
  onAddBeneficiary: (name: string, iban: string, bank: string) => Promise<Beneficiary>;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Beneficiary | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIban, setNewIban] = useState('');
  const [newBank, setNewBank] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const safeBeneficiaries = useMemo(() => {
    return beneficiaries || [];
  }, [beneficiaries]);

  const filtered = useMemo(() => {
    return safeBeneficiaries.filter(
      (b) =>
        (b?.name || '').toLowerCase().includes(query.toLowerCase()) ||
        (b?.bank || '').toLowerCase().includes(query.toLowerCase()),
    );
  }, [safeBeneficiaries, query]);

  const handleSelect = useCallback((b: Beneficiary) => {
    setSelected(b);
  }, []);

  const handleContinue = useCallback(() => {
    if (selected) onNext(selected);
  }, [selected, onNext]);

  const handleAdd = useCallback(async () => {
    if (!newName || !newIban || !newBank) {
      alert(t('transfer.fillAllFields'));
      return;
    }
    setIsAdding(true);
    try {
      const newBeneficiary = await onAddBeneficiary(newName, newIban, newBank);
      setShowAddForm(false);
      setNewName('');
      setNewIban('');
      setNewBank('');
      setSelected(newBeneficiary);
    } catch (err: any) {
      alert(err.message || t('transfer.failedToAdd'));
    } finally {
      setIsAdding(false);
    }
  }, [newName, newIban, newBank, onAddBeneficiary, t]);

  const toggleAddForm = useCallback(() => {
    setShowAddForm(prev => !prev);
  }, []);

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-3/4"></div>
          <div className="h-12 bg-white/10 rounded w-full"></div>
          <div className="h-20 bg-white/10 rounded w-full"></div>
        </div>
        <p className="text-center text-white/40 text-sm">
          {t('transfer.loadingBeneficiaries', 'Loading beneficiaries layer...')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {t('transfer.selectBeneficiary')}
          </h2>
          <p className="text-sm text-white/50 mt-0.5">
            {t('transfer.searchPayees')}
          </p>
        </div>
        <button
          onClick={toggleAddForm}
          className="flex items-center gap-1 text-[#FF7F50] text-sm hover:text-[#ff8f66] transition"
        >
          <UserPlus className="w-4 h-4" /> {t('transfer.addNew')}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <h3 className="text-white font-medium text-sm">
            {t('transfer.addBeneficiary')}
          </h3>
          <input
            type="text"
            placeholder={t('transfer.fullName')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7F50]/30 focus:border-[#FF7F50]"
          />
          <input
            type="text"
            placeholder={t('transfer.ibanHint', 'IBAN (24 characters, e.g. PK36SCBL0000001123456702)')}
            value={newIban}
            onChange={(e) => setNewIban(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7F50]/30 focus:border-[#FF7F50]"
          />
          <input
            type="text"
            placeholder={t('transfer.bankName')}
            value={newBank}
            onChange={(e) => setNewBank(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7F50]/30 focus:border-[#FF7F50]"
          />
          <button
            onClick={handleAdd}
            disabled={isAdding}
            className="w-full bg-[#FF7F50] hover:bg-[#ff8f66] disabled:opacity-50 text-black py-2 rounded-lg text-sm font-semibold transition"
          >
            {isAdding ? t('transfer.adding', 'Adding...') : t('transfer.addBeneficiaryBtn', 'Add Beneficiary')}
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder={t('transfer.searchPlaceholder', 'Search by name or bank…')}
          value={query}
          onChange={handleQueryChange}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7F50]/30 focus:border-[#FF7F50] transition"
        />
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-white/40 py-4">
            {t('transfer.noBeneficiaries', 'No beneficiaries found. Click "Add New" to create one.')}
          </p>
        ) : (
          filtered.map((b) => (
            <BeneficiaryCard
              key={b.id}
              beneficiary={b}
              isSelected={selected?.id === b.id}
              onSelect={handleSelect}
            />
          ))
        )}
      </div>

      <button
        disabled={!selected}
        onClick={handleContinue}
        className="w-full flex items-center justify-center gap-2 bg-[#FF7F50] hover:bg-[#ff8f66] disabled:opacity-40 disabled:cursor-not-allowed text-black py-3 rounded-xl font-semibold transition-all text-sm"
      >
        {t('common.continue')} <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function Step2({
  beneficiary,
  availableBalance,
  onNext,
  onBack,
}: {
  beneficiary: Beneficiary;
  availableBalance: number;
  onNext: (amount: string, note: string) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleContinue = useCallback(() => {
    const num = safeParseMoney(amount);

    if (!amount || isNaN(num) || num <= 0) {
      setError(t('transfer.validAmount', 'Please enter a valid amount greater than 0.'));
      return;
    }
    if (num > availableBalance) {
      setError(
        t('transfer.insufficientBalance', { balance: formatMoney(availableBalance) })
      );
      return;
    }
    setError('');
    onNext(amount, note);
  }, [amount, note, availableBalance, onNext, t]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setError('');
  }, []);

  const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white">
          {t('transfer.enterAmount')}
        </h2>
        <p className="text-sm text-white/50 mt-0.5">
          {t('transfer.sendingTo')} <span className="font-semibold text-white">{beneficiary.name}</span> · {beneficiary.bank}
        </p>
      </div>

      <div className="relative text-center py-4 flex items-center justify-center">
        <span className="text-2xl text-white/40 font-light mr-2">Rs.</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={handleAmountChange}
          placeholder="0.00"
          className={`w-full max-w-[200px] text-center text-4xl font-bold bg-transparent border-b-2 pb-3 focus:outline-none transition-colors placeholder:text-white/20 ${
            error ? 'border-red-500 text-red-500' : 'border-b-white/20 focus:border-[#FF7F50] text-white'
          }`}
        />
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </p>
      )}

      <div className="bg-white/5 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/50">
            {t('transfer.availableBalance')}
          </span>
          <span className="font-semibold text-white">Rs. {formatMoney(availableBalance)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">
            {t('transfer.transferFee')}
          </span>
          <span className="font-semibold text-green-400">
            {t('transfer.free')}
          </span>
        </div>
      </div>

      <textarea
        placeholder={t('transfer.addNote')}
        value={note}
        onChange={handleNoteChange}
        rows={2}
        className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7F50]/30 focus:border-[#FF7F50] transition resize-none"
      />

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-5 py-3 rounded-xl border border-white/10 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> {t('common.back')}
        </button>
        <button
          onClick={handleContinue}
          className="flex-1 flex items-center justify-center gap-2 bg-[#FF7F50] hover:bg-[#ff8f66] text-black py-3 rounded-xl font-semibold text-sm transition-all"
        >
          {t('transfer.reviewTransfer')} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Step3({
  beneficiary,
  amount,
  onConfirm,
  onBack,
  isProcessing = false,
  onRequestOtp,
}: {
  beneficiary: Beneficiary;
  amount: string;
  onConfirm: (otp?: string) => void;
  onBack: () => void;
  isProcessing?: boolean;
  onRequestOtp: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const isLargeTransfer = Number(amount) >= 10000;

  const handleDigit = useCallback((val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...pin];
    next[idx] = val;
    setPin(next);
    setError('');
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  }, [pin]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  }, [pin]);

  const handleConfirm = useCallback(() => {
    if (isLargeTransfer) {
      if (!otp || otp.length < 6) {
        setError(t('transfer.enterOtp6', 'Enter 6-digit OTP.'));
        return;
      }
      onConfirm(otp);
    } else {
      const full = pin.join('');
      if (full.length < 6) {
        setError(t('transfer.enterAllDigits', 'Please enter all 6 digits.'));
        return;
      }
      if (full !== '123456') {
        setError(t('transfer.incorrectPin', 'Incorrect PIN.'));
        return;
      }
      onConfirm();
    }
  }, [pin, otp, isLargeTransfer, onConfirm, t]);

  const handleRequestOtp = async () => {
    try {
      setError('');
      await onRequestOtp();
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || t('transfer.failedOtp', 'Failed to send OTP'));
    }
  };

  const formattedAmount = useMemo(() => formatMoney(amount), [amount]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">
          {isLargeTransfer ? t('transfer.stepUpOtp') : t('transfer.securePin')}
        </h2>
        <p className="text-sm text-white/50 mt-0.5">
          {isLargeTransfer
            ? t('transfer.largeTransfer')
            : t('transfer.enterPin')}
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
        {[
          [t('transfer.to', 'To'), beneficiary.name],
          [t('common.amount'), `Rs. ${formattedAmount}`],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-white/50">{k}</span>
            <span className="font-semibold text-white text-right">{v}</span>
          </div>
        ))}
      </div>

      {isLargeTransfer ? (
        <div className="space-y-4">
          {!otpSent ? (
            <button
              onClick={handleRequestOtp}
              className="w-full bg-[#FF7F50] text-black py-3 rounded-xl font-semibold hover:bg-[#ff8f66]"
            >
              {t('transfer.sendOtp')}
            </button>
          ) : (
            <input
              type="text"
              placeholder={t('transfer.enterOtp')}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full text-center text-xl tracking-widest py-3 rounded-xl border-2 bg-white/5 border-white/20 text-white focus:border-[#FF7F50] focus:outline-none"
            />
          )}
        </div>
      ) : (
        <div className="flex justify-center gap-3">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              type="password"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigit(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="w-11 h-14 text-center text-xl font-bold rounded-xl border-2 bg-white/5 border-white/20 text-white focus:border-[#FF7F50] focus:outline-none"
            />
          ))}
        </div>
      )}

      {error && <p className="text-center text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="flex items-center gap-1 px-5 py-3 rounded-xl border border-white/10 text-sm font-semibold text-white hover:bg-white/5"
        >
          <ChevronLeft className="w-4 h-4" /> {t('common.back')}
        </button>
        <button
          onClick={handleConfirm}
          disabled={isProcessing}
          className="flex-1 bg-[#FF7F50] text-black py-3 rounded-xl font-semibold text-sm hover:bg-[#ff8f66]"
        >
          {isProcessing ? t('transfer.processing') : t('transfer.confirmTransfer')}
        </button>
      </div>
    </div>
  );
}

function Step4({
  beneficiary,
  amount,
  note: _note,
  onReset
}: {
  beneficiary: Beneficiary;
  amount: string;
  note?: string;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  const [txId] = useState(() => `PW-${Date.now().toString(36).toUpperCase()}`);
  const formattedAmount = useMemo(() => formatMoney(amount), [amount]);
  const dateStr = useMemo(() => new Date().toLocaleString(), []);

  const downloadReceipt = () => {
    const receiptContent = `
=========================================
           ${t('transfer.receiptTitle', 'PENNYWISE RECEIPT')}
=========================================
${t('transfer.date', 'Date')}:           ${dateStr}
${t('transfer.transactionId')}: ${txId}
-----------------------------------------
${t('transfer.stepBeneficiary')}:    ${beneficiary.name}
${t('transfer.bankName')}:           ${beneficiary.bank}
${t('transfer.iban')}:           ${beneficiary.iban}
${t('transfer.amountSent')}:    Rs. ${formattedAmount}
${t('common.status')}:         ${t('common.completed')}
=========================================
   ${t('transfer.thankYou', 'Thank you for using Pennywise!')}
   ${t('transfer.secureEncryptedShort', 'Secure. Encrypted. Built for you.')}
=========================================
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pennywise_Receipt_${txId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-9 h-9 text-green-400" />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white">
          {t('transfer.transferSuccessful')}
        </h2>
        <p className="text-sm text-white/50 mt-0.5">
          {t('transfer.fundsOnWay')}
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3">
        {[
          [t('transfer.date', 'Date'), dateStr],
          [t('transfer.transactionId'), txId],
          [t('transfer.stepBeneficiary'), beneficiary.name],
          [t('transfer.amountSent'), `Rs. ${formattedAmount}`],
          [t('common.status'), t('common.completed')],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm border-b border-white/10 pb-2 last:border-0 last:pb-0">
            <span className="text-white/50">{k}</span>
            <span className={`font-semibold text-right ${k === t('common.status') ? 'text-green-400' : 'text-white'}`}>{v}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <button
          onClick={downloadReceipt}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 py-3 rounded-xl font-semibold transition-all text-sm"
        >
          <Download className="w-4 h-4" /> {t('transfer.downloadReceipt')}
        </button>

        <button
          onClick={onReset}
          className="w-full bg-[#FF7F50] hover:bg-[#ff8f66] text-black py-3 rounded-xl font-semibold transition-all text-sm"
        >
          {t('transfer.newTransfer')}
        </button>
      </div>
    </div>
  );
}

export default function TransferWizard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const userId = user?.id;

  const [step, setStep] = useState(0);
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [liveBalance, setLiveBalance] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const { beneficiaries, loading, addBeneficiary, requestOtp } = useTransferSupabase();

  useEffect(() => {
    let cancelled = false;

    const loadBalance = async () => {
      if (!userId) return;
      try {
        const result = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', userId)
          .maybeSingle();

        if (!cancelled && result.data) {
          setLiveBalance(Number(result.data.balance));
        }
      } catch {
        if (!cancelled) setLiveBalance(0);
      }
    };

    void loadBalance();
    return () => { cancelled = true; };
  }, [userId, step]);

  const reset = useCallback(() => {
    setStep(0);
    setBeneficiary(null);
    setAmount('');
    setNote('');
  }, []);

  const handleConfirmTransfer = useCallback(async (otp?: string) => {
    if (!userId || !beneficiary) return;

    setIsProcessing(true);
    try {
      const transferAmount = safeParseMoney(amount);
      const idempotencyKey = crypto.randomUUID();

      const { data, error: rpcError } = await supabase.rpc('execute_transfer', {
        p_amount: transferAmount,
        p_recipient_id: beneficiary.id,
        p_recipient_name: beneficiary.name,
        p_note: note || null,
        p_idempotency_key: idempotencyKey,
        p_otp: otp || null,
      });

      if (rpcError) throw new Error(rpcError.message);

      const rpcData = data as { success: boolean; new_balance: number };
      setLiveBalance(Number(rpcData.new_balance));

      setStep(3);
    } catch (err) {
      console.error("Transfer Error:", err);
      setStep(3);
    } finally {
      setIsProcessing(false);
    }
  }, [userId, beneficiary, amount, note]);

  const handleNext = (b: Beneficiary) => {
    setBeneficiary(b);
    setStep(1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleAmountNext = (a: string, n: string) => {
    setAmount(a);
    setNote(n);
    setStep(2);
  };

  const stepContent = useMemo(() => {
    switch (step) {
      case 0:
        return (
          <Step1
            onNext={handleNext}
            beneficiaries={beneficiaries}
            loading={loading}
            onAddBeneficiary={addBeneficiary}
          />
        );
      case 1:
        return beneficiary ? (
          <Step2
            beneficiary={beneficiary}
            availableBalance={liveBalance}
            onNext={handleAmountNext}
            onBack={handleBack}
          />
        ) : null;
      case 2:
        return beneficiary && amount ? (
          <Step3
            beneficiary={beneficiary}
            amount={amount}
            onConfirm={handleConfirmTransfer}
            onBack={handleBack}
            isProcessing={isProcessing}
            onRequestOtp={requestOtp}
          />
        ) : null;
      case 3:
        return beneficiary ? (
          <Step4
            beneficiary={beneficiary}
            amount={amount}
            note={note}
            onReset={reset}
          />
        ) : null;
      default:
        return null;
    }
  }, [step, beneficiary, amount, note, liveBalance, loading, beneficiaries,
      addBeneficiary, isProcessing, handleConfirmTransfer, reset, requestOtp]);

  return (
    <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden relative selection:bg-[#FF7F50]/20 antialiased font-sans">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#FF7F50]/10 to-transparent blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-[#FF7F50]/4 blur-[160px] rounded-full pointer-events-none z-0" />

      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-lg mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl shadow-lg p-6 md:p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl text-[#FF7F50] font-bold">Rs.</span>
              <span className="text-sm font-semibold text-white/50 uppercase tracking-widest">
                {t('transfer.title')}
              </span>
            </div>

            <StepBar current={step} />

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
              >
                {stepContent}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}