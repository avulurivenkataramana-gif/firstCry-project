import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  ArrowLeft,
  SendHorizonal,
  CheckCircle2,
  ShieldAlert,
  KeyRound,
} from 'lucide-react';
import Logo from '../components/Logo';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [sent, setSent]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) return setError('Please enter your email address.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError('Please enter a valid email address.');
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-xl flex flex-col z-10 border border-white/30 dark:border-white/5">

        {/* Back link */}
        <Link to="/login" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-500 dark:text-slate-400 dark:hover:text-brand-400 font-semibold font-sans mb-6 transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
        </Link>

        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
            <KeyRound className="h-7 w-7 text-brand-500" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white font-sans">Forgot Password?</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-sans max-w-xs leading-relaxed">
            Enter your registered email and we'll send you a 6-digit OTP to reset your password.
          </p>
        </div>

        {/* Success state */}
        {sent ? (
          <div className="space-y-5">
            <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <div>
                <p className="font-bold text-sm text-slate-800 dark:text-white font-sans">OTP Sent!</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1">
                  Check your email at <span className="font-bold text-slate-700 dark:text-slate-300">{email}</span>
                </p>
                <p className="text-[11px] text-slate-400 font-sans mt-1">
                  (If SMTP is not configured, check the backend terminal for the OTP)
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-lg shadow-brand-500/25 transition-all font-sans flex items-center justify-center gap-2"
            >
              Enter OTP &amp; Reset Password →
            </button>
            <button
              type="button"
              onClick={() => { setSent(false); setError(null); }}
              className="w-full text-xs text-slate-500 hover:text-brand-500 font-sans font-semibold transition-colors"
            >
              Didn't receive it? Try again
            </button>
          </div>
        ) : (
          <>
            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-500/15">
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                <span className="font-sans">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    placeholder="you@school.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm glass-input font-sans"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                id="forgot-submit-btn"
                disabled={loading}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-sm shadow-lg shadow-brand-500/25 transition-all duration-200 font-sans flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <SendHorizonal className="h-4 w-4" />
                    <span>Send Reset OTP</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}

        <div className="text-center mt-6 text-xs font-medium text-slate-500 dark:text-slate-400 font-sans">
          Remember your password?{' '}
          <Link to="/login" className="text-brand-500 hover:text-brand-600 font-bold underline underline-offset-2 ml-0.5 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
