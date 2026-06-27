import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  Check,
  X as XIcon,
} from 'lucide-react';
import Logo from '../components/Logo';

const strengthRules = [
  { label: 'At least 6 characters', test: (p) => p.length >= 6 },
  { label: 'Contains a number', test: (p) => /\d/.test(p) },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
];

const OTP_LENGTH = 6;

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail]             = useState('');
  const [otp, setOtp]                 = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [showPwd, setShowPwd]         = useState(false);
  const [showConf, setShowConf]       = useState(false);

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(decodeURIComponent(emailParam));
  }, [searchParams]);

  const validate = () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return 'Please enter a valid email address.';
    if (!/^\d{6}$/.test(otp)) return 'OTP must be exactly 6 digits.';
    if (newPassword.length < 6) return 'Password must be at least 6 characters.';
    if (newPassword !== confirmPwd) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const err = validate();
    if (err) return setError(err);

    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase(), otp.trim(), newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login?reset=success'), 2500);
    } catch (err) {
      setError(err.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-xl flex flex-col z-10 border border-white/30 dark:border-white/5">

        {/* Back */}
        <Link to="/forgot-password" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-500 dark:text-slate-400 dark:hover:text-brand-400 font-semibold font-sans mb-6 transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>

        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
            <ShieldCheck className="h-7 w-7 text-brand-500" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white font-sans">Reset Password</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-sans leading-relaxed">
            Enter the 6-digit OTP sent to your email and set a new password.
          </p>
        </div>

        {/* Success state */}
        {success ? (
          <div className="space-y-4 text-center">
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
              <p className="font-bold text-sm text-slate-800 dark:text-white font-sans">Password Reset Successfully!</p>
              <p className="text-xs text-slate-500 font-sans">Redirecting you to sign in...</p>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-500/15">
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                <span className="font-sans">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Email (editable if not prefilled) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                  Email Address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="you@school.com"
                  className="w-full px-4 py-3 rounded-xl text-sm glass-input font-sans"
                />
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(null); }}
                  placeholder="123456"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl text-sm glass-input font-sans tracking-[0.5em] text-center font-bold text-lg"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                  {otp.length}/6 digits entered
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-sm glass-input font-sans"
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Strength rules */}
                {newPassword && (
                  <div className="mt-2 space-y-0.5">
                    {strengthRules.map((r) => (
                      <div key={r.label} className="flex items-center gap-1.5">
                        {r.test(newPassword)
                          ? <Check className="h-3 w-3 text-emerald-500" />
                          : <XIcon className="h-3 w-3 text-slate-400" />}
                        <span className={`text-[10px] font-sans ${r.test(newPassword) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                          {r.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showConf ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPwd}
                    onChange={(e) => { setConfirmPwd(e.target.value); setError(null); }}
                    placeholder="Repeat new password"
                    className={`w-full pl-10 pr-10 py-3 rounded-xl text-sm glass-input font-sans ${
                      confirmPwd && confirmPwd !== newPassword ? 'border-red-400 dark:border-red-500' : ''
                    }`}
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowConf(v => !v)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                    {showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPwd && confirmPwd !== newPassword && (
                  <p className="text-[10px] text-red-500 mt-1 font-sans font-semibold">Passwords do not match</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="reset-submit-btn"
                disabled={loading || otp.length !== OTP_LENGTH}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-sm shadow-lg shadow-brand-500/25 transition-all font-sans flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}

        <div className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400 font-sans">
          <Link to="/forgot-password" className="text-brand-500 hover:text-brand-600 font-bold underline underline-offset-2 transition-colors">
            Request a new OTP
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
