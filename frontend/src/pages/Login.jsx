import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  LogIn,
  Shield,
  School,
  Building2,
  Baby,
} from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Show success message if redirected from reset password
  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      setSuccessMsg('Password reset successfully! Please sign in with your new password.');
    }
    if (searchParams.get('expired') === 'true') {
      setError('Your session has expired. Please sign in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!email.trim()) return setError('Please enter your email address.');
    if (!password) return setError('Please enter your password.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError('Please enter a valid email address.');
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password, rememberMe);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail, rolePassword) => {
    setEmail(roleEmail);
    setPassword(rolePassword);
    setError(null);
  };

  const demoRoles = [
    { name: 'Admin', email: 'avulurivenkataramana@gmail.com', pass: 'venky123', icon: Shield, color: 'text-purple-500 bg-purple-500/10' },
    { name: 'Coordinator', email: 'coordinator@intellitots.com', pass: 'Coord@123', icon: Building2, color: 'text-blue-500 bg-blue-500/10' },
    { name: 'Teacher', email: 'teacher@intellitots.com', pass: 'Teach@123', icon: School, color: 'text-emerald-500 bg-emerald-500/10' },
    { name: 'Child / Parent', email: 'parent@intellitots.com', pass: 'Parent@123', icon: Baby, color: 'text-amber-500 bg-amber-500/10' }
  ];

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-xl flex flex-col z-10 border border-white/30 dark:border-white/5 my-8">

        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center justify-center">
          <Logo size="lg" centered={true} />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-sans">
            Sign in to your school portal
          </p>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span className="font-sans">{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-500/15">
            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
            <span className="font-sans">{error}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="you@school.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm glass-input font-sans"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 font-semibold font-sans transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl text-sm glass-input font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 py-1">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 border-slate-300 dark:border-slate-700 dark:bg-slate-900 cursor-pointer"
            />
            <label htmlFor="remember-me" className="text-xs text-slate-500 dark:text-slate-400 font-sans cursor-pointer select-none">
              Remember me for 30 days
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-sm shadow-lg shadow-brand-500/25 transition-all duration-200 font-sans flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Roles Quick Login */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 text-center font-sans">
            Demo Portal Access Roles
          </label>
          <div className="grid grid-cols-2 gap-2">
            {demoRoles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.name}
                  type="button"
                  onClick={() => handleQuickLogin(role.email, role.pass)}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500/60 bg-white/50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-all text-left group"
                >
                  <div className={`p-1.5 rounded-lg ${role.color} flex items-center justify-center`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-800 dark:text-white leading-none font-sans group-hover:text-brand-500 dark:group-hover:text-brand-400">
                      {role.name}
                    </p>
                    <p className="text-[8px] text-slate-400 dark:text-slate-500 truncate leading-none mt-1 font-mono">
                      {role.email.split('@')[0]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6 text-xs font-medium text-slate-500 dark:text-slate-400 font-sans">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 font-bold underline underline-offset-2 ml-0.5 transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
