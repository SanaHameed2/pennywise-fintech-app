// src/app/components/MfaSetup.tsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Shield, AlertCircle, RefreshCw, CheckCircle2, Trash2, Eye, EyeOff } from 'lucide-react';

interface MfaSetupProps {
  onComplete: (action: 'enabled' | 'disabled') => void;
}

export default function MfaSetup({ onComplete }: MfaSetupProps) {
  // --- Loading & Error States ---
  const [isChecking, setIsChecking] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Setup States ---
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');

  // --- Existing MFA States ---
  const [isAlreadyEnabled, setIsAlreadyEnabled] = useState(false);
  const [existingFactorId, setExistingFactorId] = useState<string | null>(null);

  // --- Disable States ---
  const [showDisableOtp, setShowDisableOtp] = useState(false);
  const [disableOtpCode, setDisableOtpCode] = useState('');

  // ✅ 1. Extracted checkFactors function for reusable retry logic
  const checkFactors = useCallback(async () => {
    setIsChecking(true);
    setInitError(null);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const verifiedFactor = data?.all?.find(
        f => f.status === 'verified' && f.factor_type === 'totp'
      );
      
      if (verifiedFactor) {
        setIsAlreadyEnabled(true);
        setExistingFactorId(verifiedFactor.id);
      } else {
        setIsAlreadyEnabled(false);
        setExistingFactorId(null);
      }
    } catch (err: any) {
      setInitError(err.message || 'Failed to check existing MFA factors.');
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    checkFactors();
  }, [checkFactors]);

  // 2. Enrollment
  const enrollMfa = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `Pennywise-${Date.now()}`,
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  // 3. Verification & Enable
  const verifyMfa = async () => {
    if (!factorId || verifyCode.length !== 6) return;
    
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: factorId,
        code: verifyCode,
      });
      
      if (error) throw error;
      
      // Cleanup
      setQrCode(null);
      setSecret(null);
      setFactorId(null);
      setVerifyCode('');
      setShowSecret(false);
      
      onComplete('enabled');
      await checkFactors(); // Re-sync state
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Disable MFA (with specific unenroll failure handling)
  const verifyAndDisableMfa = async () => {
    if (!existingFactorId || disableOtpCode.length !== 6) return;
    
    setLoading(true);
    setError('');
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: existingFactorId
      });
      
      if (challengeError) throw challengeError;
      if (!challengeData) throw new Error('Failed to create challenge.');

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: existingFactorId,
        challengeId: challengeData.id,
        code: disableOtpCode
      });
      
      if (verifyError) throw verifyError;

      // Verification passed, now attempt to unenroll
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: existingFactorId });
      
      if (unenrollError) {
        // ✅ 2. Specific error if unenroll fails after successful verification
        throw new Error(`Verification successful, but failed to remove MFA factor: ${unenrollError.message}. MFA is still enabled.`);
      }
      
      // Success
      setIsAlreadyEnabled(false);
      setExistingFactorId(null);
      setShowDisableOtp(false);
      setDisableOtpCode('');
      
      onComplete('disabled');
      await checkFactors(); // Re-sync state
    } catch (err: any) {
      setError(err.message || 'Failed to disable MFA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---

  if (isChecking) {
    return (
      <div className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl p-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-[#FF7F50] animate-spin" />
        <p className="text-sm text-gray-400">Checking MFA status...</p>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="bg-[#0d0d12] border border-red-500/20 rounded-2xl p-8 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <p className="text-sm text-red-400">{initError}</p>
        {/* ✅ 1. Component-level retry without reloading the app */}
        <button 
          onClick={checkFactors} 
          className="text-xs text-white underline hover:text-[#FF7F50] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isAlreadyEnabled && !qrCode) {
    return (
      <div className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">MFA is Enabled</h2>
          <p className="text-sm text-gray-400 mt-1">
            Your account is protected with Two-Factor Authentication.
          </p>
        </div>
        
        {!showDisableOtp ? (
          <button
            onClick={() => setShowDisableOtp(true)}
            disabled={loading}
            className="w-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Disable MFA & Reset
          </button>
        ) : (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-gray-400">Enter OTP from your Authenticator app to disable:</p>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={disableOtpCode}
              onChange={(e) => setDisableOtpCode(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              className="w-full text-center text-xl tracking-widest px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-red-500"
            />
            <button
              onClick={verifyAndDisableMfa}
              disabled={loading || disableOtpCode.length !== 6}
              className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Verifying...' : 'Confirm & Disable MFA'}
            </button>
            <button
              onClick={() => setShowDisableOtp(false)}
              disabled={loading}
              className="text-xs text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        )}
        
        {error && <p className="text-sm text-red-400 flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>}
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl p-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-[#FF7F50]/10 border border-[#FF7F50]/20 flex items-center justify-center mx-auto">
        <Shield className="w-8 h-8 text-[#FF7F50]" />
      </div>
      
      <div>
        <h2 className="text-xl font-semibold text-white">Authenticator App (MFA)</h2>
        <p className="text-sm text-gray-400 mt-1">
          {qrCode ? 'Scan this QR code with Google Authenticator or Authy' : 'Add an extra layer of security to your account'}
        </p>
      </div>

      {!qrCode ? (
        <button
          onClick={enrollMfa}
          disabled={loading}
          className="w-full bg-[#FF7F50] hover:bg-[#ff8f66] disabled:opacity-50 text-black py-3 rounded-xl font-semibold transition"
        >
          {loading ? 'Generating...' : 'Setup Authenticator'}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl inline-block mx-auto">
            <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
          </div>
          
          <div className="text-xs text-gray-400 font-mono bg-white/5 p-2 rounded-lg break-all flex items-center justify-between">
            <span>{showSecret ? secret : '••••••••••••••••'}</span>
            <button onClick={() => setShowSecret(!showSecret)} className="p-1 hover:text-white transition-colors">
              {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>

          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
            maxLength={6}
            className="w-full text-center text-xl tracking-widest px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-[#FF7F50]"
          />
          
          <button
            onClick={verifyMfa}
            disabled={loading || verifyCode.length !== 6}
            className="w-full bg-[#FF7F50] hover:bg-[#ff8f66] disabled:opacity-50 text-black py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Verifying...' : 'Verify & Enable MFA'}
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}
    </div>
  );
}