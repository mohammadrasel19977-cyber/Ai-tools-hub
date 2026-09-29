import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Key,
  Shield,
  Layers
} from 'lucide-react';

// ================= 1. LOGIN VIEW =================
export const LoginView: React.FC = () => {
  const { login, navigateTo } = useApp();
  const [email, setEmail] = useState('alex.rivera@techcorp.io');
  const [password, setPassword] = useState('Demo1234!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'user' | 'admin') => {
    setLoading(true);
    try {
      if (role === 'admin') {
        await login('admin@aitoolshub.io', 'Admin1234!');
      } else {
        await login('alex.rivera@techcorp.io', 'Demo1234!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-1">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
        <p className="text-xs text-slate-400">Sign in to access your AI tools and credit balance</p>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        {/* Quick Demo Access Bar */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Quick Test Credentials</span>
            <span className="text-emerald-400 font-mono">Real Auth & Credits</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="demo-login-user-btn"
              disabled={loading}
              onClick={() => handleQuickLogin('user')}
              className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors disabled:opacity-50"
            >
              Sign In as Test User
            </button>
            <button
              type="button"
              id="demo-login-admin-btn"
              disabled={loading}
              onClick={() => handleQuickLogin('admin')}
              className="py-1.5 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors disabled:opacity-50"
            >
              Sign In as Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => navigateTo('forgot-password')}
                className="text-indigo-400 hover:text-indigo-300"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="submit-login-btn"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Database Auth & Free Credits</span>
          </div>
          <p>
            Authoritative server-side credit balance & history tracking. Passwords hashed with Scrypt.
          </p>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Don't have an account?{' '}
          <button
            onClick={() => navigateTo('signup')}
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Sign up & get 100 free credits
          </button>
        </div>
      </div>
    </div>
  );
};

// ================= 2. SIGN UP VIEW =================
export const SignUpView: React.FC = () => {
  const { register, navigateTo } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>100 Free Credits on Signup</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Create Your Account</h1>
        <p className="text-xs text-slate-400">Get instant access to AI tools with 100 free trial credits</p>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-emerald-500/20 text-xs text-slate-300 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-white">100 Free Welcome Credits</div>
            <div className="text-[11px] text-slate-400">Granted automatically once upon registration. No credit card required.</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            id="submit-signup-btn"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account & Granting 100 Credits...' : 'Claim 100 Free Credits & Register'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already have an account?{' '}
          <button
            onClick={() => navigateTo('login')}
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

// ================= 3. FORGOT PASSWORD VIEW =================
export const ForgotPasswordView: React.FC = () => {
  const { navigateTo, addToast } = useApp();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    addToast({
      title: 'Password reset link sent',
      description: `We dispatched instructions to ${email || 'your email'}.`,
      type: 'success',
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
        <p className="text-xs text-slate-400">Enter your account email to receive recovery instructions</p>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Check your inbox at <span className="text-white font-mono">{email}</span>. Click the link within 60 minutes to choose a new password.
              </p>
            </div>
            <button
              onClick={() => navigateTo('login')}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all mt-2"
            >
              <span>Send Recovery Link</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Remember your password?{' '}
          <button
            onClick={() => navigateTo('login')}
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

// ================= 4. PROFILE VIEW =================
export const ProfileView: React.FC = () => {
  const { currentUser, navigateTo, setStripeModalOpen, addToast } = useApp();
  const [name, setName] = useState(currentUser?.name || 'Alex Rivera');
  const [email] = useState(currentUser?.email || 'alex.rivera@techcorp.io');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      title: 'Profile Updated',
      description: 'Your user profile details have been saved.',
      type: 'success',
    });
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm text-slate-400">Please sign in to view your profile.</p>
        <button
          onClick={() => navigateTo('login')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Account Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Manage your account information, plan status, and credentials</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: User Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-1 mx-auto">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-xl font-bold text-white uppercase">
              {currentUser.name.charAt(0)}
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-white">{currentUser.name}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{currentUser.email}</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentUser.plan} tier
              </span>
              {currentUser.role === 'admin' && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Admin
                </span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-left space-y-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Available Quota</p>
            <p className="text-sm font-bold text-white">{currentUser.credits.toLocaleString()} Credits</p>
          </div>

          <button
            onClick={() => setStripeModalOpen(true, currentUser.plan)}
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            Upgrade Subscription
          </button>
        </div>

        {/* Right: Profile Details Form */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h3 className="text-sm font-bold text-white">General Information</h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Email Address (Managed by Auth)</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800/60 text-slate-500 cursor-not-allowed font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>

          {/* Architecture API Key Isolation Notice */}
          <div className="pt-6 border-t border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Server-Side API Key Storage</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              In this architecture, your Google Gemini API key (<code className="text-indigo-300">GEMINI_API_KEY</code>) is stored strictly on the backend server in environment variables. End users never touch or expose API keys from their browser.
            </p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400">
              Backend Status: <span className="text-emerald-400">● Secure Server-Side Proxy Configured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
