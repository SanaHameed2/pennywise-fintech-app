// src/app/pages/SecurityFlow.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Fingerprint, CheckCircle2, AlertCircle,
  Lock, Unlock, Eye, EyeOff
} from 'lucide-react';
import Footer from '../components/Footer';
import MfaSetup from '../components/MfaSetup'; // ✅ Import MFA Component

/* ─── Types ─── */
type AuthState = 'choose' | 'pin' | 'mfa' | 'success';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: PinDots
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PinDots = React.memo(({ length, filled, error }: { length: number; filled: number; error: boolean }) => {
  return (
    <div className="flex justify-center gap-3 my-4">
      {Array.from({ length }).map((_, i) => (
        <motion.div
          key={i}
          animate={error && filled === 0 ? { x: [0, -6, 6, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
            i < filled
              ? error ? 'bg-destructive border-destructive' : 'bg-brand border-brand'
              : 'border-border bg-transparent'
          }`}
        />
      ))}
    </div>
  );
});

PinDots.displayName = 'PinDots';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: PinKey
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PinKey = React.memo(({
  keyChar,
  onPress
}: {
  keyChar: string;
  onPress: (key: string) => void;
}) => {
  if (keyChar === '') {
    return <div className="h-14 rounded-2xl invisible" />;
  }

  const isBackspace = keyChar === '⌫';

  return (
    <button
      onClick={() => onPress(keyChar)}
      className={`h-14 rounded-2xl text-lg font-semibold transition-all duration-150 select-none ${
        isBackspace
          ? 'bg-accent text-muted-foreground hover:bg-muted active:scale-95'
          : 'bg-white dark:bg-gray-700 border border-border shadow-sm hover:bg-brand-light hover:text-brand-dark hover:border-brand dark:hover:bg-brand-dark dark:hover:text-brand-muted active:scale-95 text-foreground'
      }`}
    >
      {isBackspace ? <span className="text-base">⌫</span> : keyChar}
    </button>
  );
});

PinKey.displayName = 'PinKey';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: PinPad
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PIN_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

const PinPad = React.memo(({ onKey }: { onKey: (k: string) => void }) => {
  return (
    <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
      {PIN_KEYS.map((k, i) => (
        <PinKey key={i} keyChar={k} onPress={onKey} />
      ))}
    </div>
  );
});

PinPad.displayName = 'PinPad';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ PIN Screen Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function PinScreen({ onSuccess }: { onSuccess: () => void }) {
  const [digits, setDigits] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(30);
  const [showPin, setShowPin] = useState(false);
  const CORRECT = '123456';

  // ✅ Lock countdown
  useEffect(() => {
    if (!locked) return;
    const interval = setInterval(() => {
      setLockTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setLocked(false);
          setAttempts(0);
          setLockTimer(30);
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [locked]);

  const handleKey = useCallback((k: string) => {
    if (locked) return;
    if (k === '⌫') {
      setDigits((d) => d.slice(0, -1));
      setError('');
      return;
    }
    const next = digits + k;
    setDigits(next);
    if (next.length === 6) {
      if (next === CORRECT) {
        setTimeout(onSuccess, 300);
      } else {
        const a = attempts + 1;
        setAttempts(a);
        setError(a >= 3 ? 'Account locked. Too many failed attempts.' : `Incorrect PIN. ${3 - a} attempt${3 - a === 1 ? '' : 's'} remaining.`);
        setTimeout(() => setDigits(''), 400);
        if (a >= 3) setLocked(true);
      }
    }
  }, [digits, attempts, locked, onSuccess]);

  const togglePinVisibility = useCallback(() => {
    setShowPin(prev => !prev);
  }, []);

  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-light dark:bg-brand-dark/40 flex items-center justify-center mx-auto">
        <Shield className="w-8 h-8 text-brand" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-foreground">Cryptographic PIN</h2>
        <p className="text-sm text-muted-foreground mt-1">Enter your 6-digit security PIN to authenticate</p>
      </div>

      {locked ? (
        <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-6 space-y-3">
          <Lock className="w-8 h-8 text-destructive mx-auto" />
          <p className="text-sm font-semibold text-destructive">Account Temporarily Locked</p>
          <p className="text-xs text-destructive/80">Too many failed attempts. Retry in</p>
          <span className="text-3xl font-bold text-destructive font-mono">{lockTimer}s</span>
        </div>
      ) : (
        <>
          <div className="relative">
            <PinDots length={6} filled={digits.length} error={!!error && digits.length === 0} />
            {showPin && digits && (
              <p className="text-sm font-mono text-brand tracking-widest mt-1">{digits.padEnd(6, '·')}</p>
            )}
            <button
              onClick={togglePinVisibility}
              className="absolute right-0 top-0 p-1 text-muted-foreground hover:text-foreground"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-1.5 text-sm text-destructive"
            >
              <AlertCircle className="w-4 h-4" /> {error}
            </motion.p>
          )}

          <PinPad onKey={handleKey} />
          <p className="text-xs text-muted-foreground">Demo PIN: <span className="font-mono font-bold text-brand">123456</span></p>
        </>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: AuthMethodButton
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const AuthMethodButton = React.memo(({
  icon: Icon,
  title,
  description,
  onClick
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] hover:border-[#FF7F50]/30 hover:bg-[#FF7F50]/5 transition-all group"
    >
      <div className="w-12 h-12 rounded-xl bg-[#FF7F50]/10 flex items-center justify-center group-hover:bg-[#FF7F50] transition-colors">
        <Icon className="w-6 h-6 text-[#FF7F50] group-hover:text-black transition-colors" />
      </div>
      <div className="text-left">
        <p className="font-semibold text-white">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </button>
  );
});

AuthMethodButton.displayName = 'AuthMethodButton';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ React.memo: TrustBadge
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TrustBadge = React.memo(({ icon: Icon, label }: { icon: React.ElementType; label: string }) => {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 text-[#FF7F50]" />
      <span>{label}</span>
    </div>
  );
});

TrustBadge.displayName = 'TrustBadge';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Main SecurityFlow Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function SecurityFlow() {
  const [authState, setAuthState] = useState<AuthState>('choose');
  const [mfaOpen, setMfaOpen] = useState(false); // Renamed from bioOpen

  const handlePinSuccess = useCallback(() => {
    setAuthState('success');
  }, []);

  const handleMfaOpen = useCallback(() => {
    setMfaOpen(true);
    setAuthState('mfa');
  }, []);

  const handleMfaClose = useCallback(() => {
    setMfaOpen(false);
    setAuthState('choose');
  }, []);

  const handleMfaSuccess = useCallback(() => {
    setMfaOpen(false);
    setAuthState('success');
  }, []);

  const handleGoBack = useCallback(() => {
    setAuthState('choose');
  }, []);

  const trustBadges = useMemo(() => [
    { icon: Shield, label: '256-bit encryption' },
    { icon: Fingerprint, label: 'MFA Ready' }, // Changed text
    { icon: CheckCircle2, label: 'Bank-grade security' },
  ], []);

  return (
    <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden relative selection:bg-[#FF7F50]/20 antialiased font-sans">
      {/* Background Glows - Pennywise theme */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#FF7F50]/10 to-transparent blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-[#FF7F50]/4 blur-[160px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-[#FF7F50]/3 blur-[160px] rounded-full pointer-events-none z-0" />

      <div className="max-w-lg mx-auto px-4 py-10 relative z-10">
        <AnimatePresence mode="wait">
          {authState === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl p-8 space-y-6 shadow-xl"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-[#FF7F50]/10 border border-[#FF7F50]/20 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-[#FF7F50]" />
                </div>
                <h1 className="text-2xl font-semibold text-white">Advanced Security</h1>
                <p className="text-sm text-gray-400">Choose your authentication method to proceed</p>
              </div>

              <div className="space-y-3">
                <AuthMethodButton
                  icon={Shield}
                  title="6-Digit Cryptographic PIN"
                  description="Enter your secure 6-digit numeric PIN"
                  onClick={() => setAuthState('pin')}
                />

                <AuthMethodButton
                  icon={Fingerprint} 
                  title="Authenticator App (MFA)"
                  description="Use Google Authenticator or Authy for 2FA"
                  onClick={handleMfaOpen}
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-white/5 border border-white/[0.06] rounded-xl text-xs text-gray-400">
                <Shield className="w-4 h-4 text-[#FF7F50] flex-shrink-0 mt-0.5" />
                All credentials are processed locally. MFA secrets are secured via Supabase Auth.
              </div>
            </motion.div>
          )}

          {authState === 'pin' && (
            <motion.div
              key="pin"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl p-8 shadow-xl"
            >
              <PinScreen onSuccess={handlePinSuccess} />
              <button onClick={handleGoBack} className="w-full mt-6 text-sm text-gray-400 hover:text-[#FF7F50] transition-colors">
                ← Use a different method
              </button>
            </motion.div>
          )}

          {authState === 'success' && (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl p-8 text-center space-y-6 shadow-xl"
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto"
              >
                <Unlock className="w-10 h-10 text-emerald-400" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Authentication Successful</h2>
                <p className="text-sm text-gray-400 mt-1">Your identity has been verified. You now have elevated access.</p>
              </div>
              <div className="bg-white/5 border border-white/[0.06] rounded-xl p-4 space-y-1 text-sm text-left">
                {[
                  ['Session Level', 'Elevated (Tier 2)'],
                  ['Verified At', new Date().toLocaleTimeString()],
                  ['Session Expires', '15 minutes'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-400">{k}</span>
                    <span className="font-semibold text-white">{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleGoBack} className="w-full bg-[#FF7F50] hover:bg-[#ff8f66] text-black font-bold py-3 rounded-xl transition-all shadow-[0_4px_20px_rgba(255,127,80,0.2)]">
                Back to Security Hub
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ MFA Modal Render */}
        <AnimatePresence>
          {mfaOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-sm"
              >
                <MfaSetup 
                  onComplete={handleMfaSuccess} 
                />
                <button 
                  onClick={handleMfaClose} 
                  className="w-full mt-4 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 font-mono"
        >
          {trustBadges.map((badge, idx) => (
            <React.Fragment key={idx}>
              <TrustBadge icon={badge.icon} label={badge.label} />
              {idx < trustBadges.length - 1 && <span className="text-gray-700">•</span>}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}