import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { FiLock, FiMail, FiHome, FiShield, FiArrowRight } from 'react-icons/fi';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const expiredMsg = sessionStorage.getItem('sessionExpiredMsg');
    if (expiredMsg) {
      sessionStorage.removeItem('sessionExpiredMsg');
      addToast(expiredMsg, 'warning');
    }

    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await login(email, password);
      if (res.success) {
        addToast('Admin login successful!', 'success');
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid credentials or login failure.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden hero-gradient font-sans">
      <SEO
        title="Admin Portal Sign In | S.S. Global Public School"
        description="Admin Authentication Control Panel for S.S. Global Public School staff and administrators."
        noindex={true}
      />

      {/* Floating Animated Ambient Glow Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glass Card Container */}
      <div className="max-w-md w-full relative z-10 space-y-5 animate-in fade-in zoom-in-95 duration-500">
        {/* Top Header Navigation Link */}
        <div className="flex justify-between items-center px-1">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-slate-900/90 hover:bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-800 shadow-md backdrop-blur-md"
          >
            <FiHome className="text-amber-400 text-sm" /> Return to Public Website
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-300 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full border border-blue-400/30">
            <FiShield className="text-amber-400" /> Administrative System
          </span>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-blue-950/40 space-y-6 relative overflow-hidden group">
          {/* Subtle Top Accent Border */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-amber-400 to-sky-400" />

          {/* Header Block */}
          <div className="text-center space-y-3 pt-2">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-2xl bg-slate-950 p-1.5 border border-slate-700/80 shadow-xl shadow-blue-900/30 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/logo.webp"
                  alt="S.S. Global Public School Logo"
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/logo.jpg';
                  }}
                />
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-tight">
                Admin Control Panel
              </h1>
              <p className="text-xs text-amber-400 font-semibold tracking-wide uppercase mt-1">
                Secure Administration Portal
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                S.S. Global Public School • Daudnagar, Bihar
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <div className="relative group/input">
                <FiMail className="absolute left-4 top-3.5 text-slate-400 group-focus-within/input:text-blue-400 transition-colors text-base" />
                <input
                  id="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email address or username"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative group/input">
                <FiLock className="absolute left-4 top-3.5 text-slate-400 group-focus-within/input:text-blue-400 transition-colors text-base" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 transition-all duration-300 transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 group mt-2"
            >
              <span>{submitting ? 'Authenticating Credentials...' : 'Sign In To Dashboard'}</span>
              <FiArrowRight className="text-base transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Footer Security Badge Notice */}
          <div className="pt-3 border-t border-slate-800/80 text-center space-y-1.5">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
              <FiLock className="text-emerald-400 text-xs" /> 256-Bit Encrypted Admin Session
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
