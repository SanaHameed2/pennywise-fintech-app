// src/app/pages/Signup.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, validateEmail, validateName, sanitizeInput } from '../../hooks/useAuth';

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
// ✅ Main Signup Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // ✅ State for email verification message
  const [loading, setLoading] = useState(false);

  // ✅ useCallback: Handle form submission with validation & sanitization
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // ✅ Sanitize inputs (XSS Protection)
    const sanitizedName = sanitizeInput(name.trim());
    const sanitizedEmail = sanitizeInput(email.trim());

    // ✅ Validate name
    if (!validateName(sanitizedName)) {
      setError('Name must be at least 2 characters.');
      return;
    }

    // ✅ Validate email
    if (!validateEmail(sanitizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    // ✅ Day 19: Strict Password Validation (8+ chars, 1 uppercase, 1 number, 1 special char)
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters, including 1 uppercase, 1 number, and 1 special character.');
      return;
    }

    setLoading(true);

    try {
      const result = await signup(sanitizedName, sanitizedEmail, password);
      if (result?.success) {
        // ✅ Day 19: Show verification message instead of navigating
        setSuccess('Account created successfully! Please check your email inbox to verify your account before logging in.');
        setName('');
        setEmail('');
        setPassword('');
      } else {
        setError(result?.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [name, email, password, signup]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setError('');
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  }, []);

  const trustBadges = useMemo(() => [
    { icon: Shield, label: '256-bit encryption' },
    { icon: Smartphone, label: 'Secure access' },
    { icon: CheckCircle2, label: 'Bank-grade security' },
  ], []);

  const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden relative selection:bg-[#FF7F50]/20 antialiased font-sans flex items-center justify-center p-4">

      {/* Background Glows - Pennywise theme */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#FF7F50]/10 to-transparent blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-[#FF7F50]/4 blur-[160px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-[#FF7F50]/3 blur-[160px] rounded-full pointer-events-none z-0" />

      {/* Main Form Container */}
      <div className="max-w-md w-full relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-[#0d0d12] border border-white/[0.06] rounded-2xl p-8 shadow-2xl space-y-6"
        >
          {/* Success Screen (Email Verification) */}
          {success ? (
            <div className="text-center space-y-6 py-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <Mail className="w-10 h-10 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Verify your email</h2>
                <p className="text-sm text-gray-400 mt-2">{success}</p>
              </div>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full bg-[#FF7F50] hover:bg-[#ff8f66] text-black font-bold py-3.5 rounded-xl transition-all"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Header Section */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FF7F50]/20 bg-[#FF7F50]/5 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF7F50] animate-pulse" />
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#FF7F50] font-bold">
                    Get Started
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Create your account
                </h1>
                <p className="text-sm text-gray-400">
                  Start managing your money in minutes — it's free
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" /> {error}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={handleNameChange}
                      placeholder="Your full name"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF7F50] focus:ring-2 focus:ring-[#FF7F50]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="you@email.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF7F50] focus:ring-2 focus:ring-[#FF7F50]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Create a strong password"
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF7F50] focus:ring-2 focus:ring-[#FF7F50]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500">Must be 8+ chars with 1 uppercase, 1 number, 1 special character.</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FF7F50] hover:bg-[#ff8f66] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(255,127,80,0.2)] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#0d0d12] px-3 text-gray-500">or</span>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-gray-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#FF7F50] hover:text-[#ff8f66] font-semibold transition">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 font-mono"
        >
          {trustBadges.map((badge, idx) => (
            <React.Fragment key={idx}>
              <TrustBadge icon={badge.icon} label={badge.label} />
              {idx < trustBadges.length - 1 && <span className="text-gray-700">•</span>}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </div>
  );
}