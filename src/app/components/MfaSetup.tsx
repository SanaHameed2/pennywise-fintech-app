// src/app/components/MfaSetup.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Shield, AlertCircle, RefreshCw, CheckCircle2, Trash2 } from 'lucide-react';

export default function MfaSetup({ onComplete }: { onComplete: () => void }) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ✅ State to handle "Already Enabled" situation
  const [isAlreadyEnabled, setIsAlreadyEnabled] = useState(false);
  const [existingFactorId, setExistingFactorId] = useState<string | null>(null);

  // Check if MFA is already enabled on component mount
  useEffect(() => {
    const checkFactors = async () => {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verifiedFactor = factors?.all?.find(f => f.status === 'verified' && f.factor_type === 'totp');
      
      if (verifiedFactor) {
        setIsAlreadyEnabled(true);
        setExistingFactorId(verifiedFactor.id);
      }
    };
    checkFactors();
  }, []);

  const enrollMfa = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      
      if (factors?.all) {
        for (const factor of factors.all) {
          if (factor.status === 'unverified') {
            await supabase.auth.mfa.unenroll({ factorId: factor.id });
          }
        }
      }

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

  const verifyMfa = async () => {
    if (!factorId) return;
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: factorId,
        code: verifyCode,
      });
      if (error) throw error;
      
      setIsAlreadyEnabled(true); // Update state to show success
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Disable MFA Function
  const disableMfa = async () => {
    if (!existingFactorId) return;
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: existingFactorId });
      if (error) throw error;
      
      setIsAlreadyEnabled(false);
      setExistingFactorId(null);
      setQrCode(null);
      setSecret(null);
      setFactorId(null);
      setVerifyCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  };

  // ✅ UI: Already Enabled View
  if (isAlreadyEnabled && !qrCode) {
    return (
      <div className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">MFA is Enabled</h2>
          <p className="text-sm text-gray-400 mt-1">
            Your account is already protected with Two-Factor Authentication.
          </p>
        </div>
        
        <button
          onClick={disableMfa}
          disabled={loading}
          className="w-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {loading ? 'Disabling...' : 'Disable MFA & Reset'}
        </button>
        {error && <p className="text-sm text-red-400 flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>}
      </div>
    );
  }

  // ✅ UI: Setup / Scan View
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
          
          <div className="text-xs text-gray-400 font-mono bg-white/5 p-2 rounded-lg break-all">
            Secret: {secret}
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