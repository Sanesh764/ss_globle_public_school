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
    if (!email.trim() || !password.trim()) {
      addToast('Please enter both email/username and password.', 'error');
      return;
    }
    try {
      setSubmitting(true);
      const res = await login(email.trim(), password);
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
    <div className="min-h-screen bg-[#EBE2CC] text-[#252821] flex items-center justify-center p-4 sm:p-6 font-sans">
      <SEO
        title="Admin Portal Sign In | S.S. Global Public School"
        description="Admin Authentication Control Panel for S.S. Global Public School staff and administrators."
        noindex={true}
      />

      <div className="max-w-md w-full space-y-5">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#34483B] hover:text-[#27372D] bg-[#F4EFE3] hover:bg-[#DED5C1] px-3.5 py-2 rounded-sm border border-[#CFC5B1] transition-colors"
          >
            <FiHome className="text-[#AD8746] text-sm" /> Return to Website
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#34483B] uppercase tracking-wider bg-[#F4EFE3] px-3 py-1.5 rounded-sm border border-[#CFC5B1]">
            <FiShield className="text-[#AD8746]" /> Administrative Portal
          </span>
        </div>

        <div className="bg-[#F4EFE3] border border-[#CFC5B1] border-t-4 border-t-[#34483B] rounded-sm p-8 sm:p-10 space-y-6 shadow-sm">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-sm bg-[#EBE2CC] p-1 border border-[#CFC5B1] flex items-center justify-center mx-auto">
              <img
                src="/logo.webp"
                alt="S.S. Global Public School Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo.jpg';
                }}
              />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#34483B] tracking-tight">
                Admin Control Panel
              </h1>
              <p className="text-[11px] text-[#AD8746] font-semibold tracking-[0.16em] uppercase mt-1">
                Secure Administration Portal
              </p>
              <p className="text-xs text-[#55594E] mt-0.5">
                S.S. Global Public School • Daudnagar, Bihar
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div>
              <label htmlFor="email" className="block text-[11px] font-semibold text-[#34483B] uppercase tracking-wider mb-1.5">
                Admin Email Address or Username
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-3.5 text-[#55594E] text-base" />
                <input
                  id="email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email or username"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CFC5B1] rounded-sm text-sm text-[#252821] placeholder-[#55594E]/60 focus:outline-none focus:border-[#34483B] focus:ring-1 focus:ring-[#34483B] transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-semibold text-[#34483B] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-3.5 text-[#55594E] text-base" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CFC5B1] rounded-sm text-sm text-[#252821] placeholder-[#55594E]/60 focus:outline-none focus:border-[#34483B] focus:ring-1 focus:ring-[#34483B] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-sm tracking-wide transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              <span>{submitting ? 'Authenticating Credentials...' : 'Sign In To Dashboard'}</span>
              <FiArrowRight className="text-[#AD8746]" />
            </button>
          </form>

          <div className="pt-3 border-t border-[#CFC5B1] text-center">
            <p className="text-[11px] text-[#55594E] flex items-center justify-center gap-1.5 font-medium">
              <FiLock className="text-[#34483B] text-xs" /> Encrypted Administrative Session
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
