// src/app/pages/Login.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Smartphone, CheckCircle2, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, validateEmail, validatePassword } from '../../hooks/useAuth';

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
// ✅ Main Login Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false); // ✅ New state for demo button

  // ✅ useCallback: Handle form submission with validation
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // ✅ Validate email
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // ✅ Validate password
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        // ✅ Handle email not confirmed error
        if (result.error?.includes('Email not confirmed') || result.error?.includes('email_not_confirmed')) {
          setError('Please verify your email address before logging in.');
        } else {
          setError(result?.error || 'Invalid email or password. Please try again.');
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, login, navigate]);

  // ✅ Handle Demo Login (1-Click)
  const handleDemoLogin = useCallback(async () => {
    setError('');
    setDemoLoading(true);

    try {
      const result = await login('demo@pennywise.com', 'DemoUser123!');
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result?.error || 'Failed to login to demo account. Please try again.');
      }
    } catch {
      setError('Something went wrong while connecting to demo account.');
    } finally {
      setDemoLoading(false);
    }
  }, [login, navigate]);

  // ✅ useCallback: Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // ✅ useCallback: Handle email change
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  }, []);

  // ✅ useCallback: Handle password change
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  }, []);

  // ✅ useMemo: Trust badges
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

      {/* Background Glows */}
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
          {/* Header Section */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FF7F50]/20 bg-[#FF7F50]/5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7F50] animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#FF7F50] font-bold">
                Welcome Back
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Sign in to Pennywise
            </h1>
            <p className="text-sm text-gray-400">
              Manage your money, track spending, and save smarter
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center"
            >
              {error}
            </motion.div>
          )}

          {/* ✅ Try Demo Account Button (1-Click) */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={demoLoading || loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400 font-semibold py-3 rounded-xl hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {demoLoading ? (
              <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Try Demo Account (1-Click)
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0d0d12] px-3 text-gray-500">or sign in manually</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-[#FF7F50] hover:text-[#ff8f66] transition">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your password"
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
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-1 select-none">
              <input
                type="checkbox"
                className="rounded border-white/10 bg-white/5 text-[#FF7F50] focus:ring-[#FF7F50]/20 w-4 h-4"
              />
              <span className="text-xs text-gray-500">Remember me</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full bg-[#FF7F50] hover:bg-[#ff8f66] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(255,127,80,0.2)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-400">
              New to Pennywise?{' '}
              <Link to="/signup" className="text-[#FF7F50] hover:text-[#ff8f66] font-semibold transition">
                Create an account
              </Link>
            </p>
          </div>
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