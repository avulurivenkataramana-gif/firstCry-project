import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, Eye, EyeOff, User as UserIcon, Phone,
  Baby, School, Building2, ShieldAlert, CheckCircle2,
  Shield, UserPlus, Check, X as XIcon, LogIn,
} from 'lucide-react';
import Logo from '../components/Logo';

// Password strength rules
const strengthRules = [
  { label: 'At least 6 characters', test: (p) => p.length >= 6 },
  { label: 'Contains a number', test: (p) => /\d/.test(p) },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
];

const PasswordStrength = ({ password }) => {
  const passed = strengthRules.filter((r) => r.test(password)).length;
  const colors = ['bg-red-500', 'bg-amber-500', 'bg-emerald-500'];
  const labels = ['Weak', 'Fair', 'Strong'];

  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < passed ? colors[passed - 1] : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
      {password && (
        <p className={`text-[10px] font-bold font-sans ${
          passed === 1 ? 'text-red-500' : passed === 2 ? 'text-amber-500' : 'text-emerald-500'
        }`}>
          {labels[passed - 1] || ''}
        </p>
      )}
      <div className="space-y-0.5">
        {strengthRules.map((rule) => (
          <div key={rule.label} className="flex items-center gap-1.5">
            {rule.test(password) ? (
              <Check className="h-3 w-3 text-emerald-500 flex-shrink-0" />
            ) : (
              <XIcon className="h-3 w-3 text-slate-400 flex-shrink-0" />
            )}
            <span className={`text-[10px] font-sans ${rule.test(password) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ROLE_OPTIONS = [
  { id: 'teacher',     label: 'Teacher',      icon: School },
  { id: 'coordinator', label: 'Coordinator',   icon: Building2 },
  { id: 'parent',      label: 'Parent',        icon: Baby },
];

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole]                   = useState('teacher');
  const [name, setName]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirm]     = useState('');
  const [showPassword, setShowPwd]        = useState(false);
  const [showConfirm, setShowConf]        = useState(false);
  const [phoneNumber, setPhone]           = useState('');
  const [classroom, setClassroom]         = useState('');
  const [childName, setChildName]         = useState('');
  const [department, setDept]             = useState('');

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [successMsg, setSuccess] = useState(null);
  const [pendingApproval, setPendingApproval] = useState(false);

  const validate = () => {
    if (!name.trim()) return 'Please enter your full name.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return 'Please enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!phoneNumber.trim()) return 'Please enter your phone number.';
    if (role === 'teacher' && !classroom.trim()) return 'Please enter your classroom assignment.';
    if (role === 'coordinator' && !department.trim()) return 'Please enter your department.';
    if (role === 'parent' && !childName.trim()) return "Please enter your child's name.";
    if (role === 'parent' && !classroom.trim()) return "Please enter your child's classroom.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) return setError(validationError);

    let finalClassroom = classroom;
    if (role === 'coordinator') finalClassroom = department || 'Curriculum Office';

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      phoneNumber: phoneNumber.trim(),
      classroom: finalClassroom,
      childName: role === 'parent' ? childName.trim() : '',
    };

    setLoading(true);
    try {
      const result = await register(payload);
      if (result && result.pending) {
        setPendingApproval(true);
      } else {
        setSuccess('Account created! Redirecting to dashboard...');
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-lg glass-panel p-8 rounded-3xl shadow-xl flex flex-col z-10 border border-white/30 dark:border-white/5 my-8">

        {/* Pending Approval Screen */}
        {pendingApproval ? (
          <div className="text-center space-y-6 py-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 dark:text-white font-sans">Account Created!</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-sans max-w-xs mx-auto leading-relaxed">
                  Your account has been created successfully and is awaiting Admin approval. You can log in only after your account has been approved by the Admin.
                </p>
              </div>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-left space-y-2">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 font-sans">What happens next?</p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 font-sans space-y-1 list-disc list-inside">
                <li>The Admin will review your registration</li>
                <li>You will be notified once approved</li>
                <li>After approval, sign in with your credentials</li>
              </ul>
            </div>
            <Link
              to="/login"
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-lg shadow-brand-500/25 transition-all font-sans flex items-center justify-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Go to Sign In
            </Link>
          </div>
        ) : (
        <>
        <div className="text-center mb-6 flex flex-col items-center justify-center">
          <Logo size="lg" centered={true} />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-sans">
            Create your school portal account
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-500/15">
            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
            <span className="font-sans">{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span className="font-sans">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Role Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-sans">
              I am a...
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLE_OPTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setRole(id); setError(null); }}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold font-sans transition-all duration-150 ${
                    role === id
                      ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:bg-brand-950/35 dark:text-brand-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input type="text" required autoComplete="name" value={name}
                  onChange={(e) => { setName(e.target.value); setError(null); }}
                  placeholder="Jane Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm glass-input font-sans" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input type="email" required autoComplete="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="jane@school.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm glass-input font-sans" />
              </div>
            </div>
          </div>

          {/* Password + Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input type={showPassword ? 'text' : 'password'} required autoComplete="new-password"
                  value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm glass-input font-sans" />
                <button type="button" tabIndex={-1} onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input type={showConfirm ? 'text' : 'password'} required autoComplete="new-password"
                  value={confirmPassword} onChange={(e) => { setConfirm(e.target.value); setError(null); }}
                  placeholder="Repeat password"
                  className={`w-full pl-10 pr-10 py-3 rounded-xl text-sm glass-input font-sans ${
                    confirmPassword && confirmPassword !== password ? 'border-red-400 dark:border-red-500' : ''
                  }`} />
                <button type="button" tabIndex={-1} onClick={() => setShowConf(v => !v)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[10px] text-red-500 mt-1 font-sans font-semibold">Passwords do not match</p>
              )}
              {confirmPassword && confirmPassword === password && (
                <p className="text-[10px] text-emerald-500 mt-1 font-sans font-semibold flex items-center gap-1">
                  <Check className="h-3 w-3" /> Passwords match
                </p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input type="tel" required autoComplete="tel" value={phoneNumber}
                onChange={(e) => { setPhone(e.target.value); setError(null); }}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm glass-input font-sans" />
            </div>
          </div>

          {/* Role-specific fields */}
          {role === 'teacher' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Classroom Assignment</label>
              <div className="relative">
                <School className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input type="text" required value={classroom}
                  onChange={(e) => { setClassroom(e.target.value); setError(null); }}
                  placeholder="e.g. Nursery-A, LKG-B"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm glass-input font-sans" />
              </div>
            </div>
          )}

          {role === 'coordinator' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Department / Office Unit</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input type="text" required value={department}
                  onChange={(e) => { setDept(e.target.value); setError(null); }}
                  placeholder="e.g. Curriculum Office"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm glass-input font-sans" />
              </div>
            </div>
          )}

          {role === 'parent' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Child's Name</label>
                <div className="relative">
                  <Baby className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input type="text" required value={childName}
                    onChange={(e) => { setChildName(e.target.value); setError(null); }}
                    placeholder="Aarav Patel"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm glass-input font-sans" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Child's Classroom</label>
                <div className="relative">
                  <School className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input type="text" required value={classroom}
                    onChange={(e) => { setClassroom(e.target.value); setError(null); }}
                    placeholder="e.g. Nursery-A"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm glass-input font-sans" />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            id="signup-submit-btn"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-sm shadow-lg shadow-brand-500/25 transition-all duration-200 font-sans flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-5 text-xs font-medium text-slate-500 dark:text-slate-400 font-sans">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 font-bold underline underline-offset-2 ml-0.5 transition-colors">
            Sign In
          </Link>
        </div>
        </>
        )}

      </div>
    </div>
  );
};

export default Signup;
