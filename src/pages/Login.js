import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, refreshUser, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(formData.email, formData.password);
      const role = data?.user?.role;
      if (role === 'admin' || role === 'super-admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Unable to login. Please check your credentials.';
      toast.error(message);
      if (status === 403 && /verify/i.test(message)) {
        setIsUnverified(true);
      } else {
        setIsUnverified(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!formData.email) {
      toast.error('Enter your email to resend the code.');
      return;
    }
    setResendLoading(true);
    try {
      await api.post('/auth/reset-verification', { email: formData.email });
      toast.success('A new verification code has been sent to your email.');
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to resend code. Please try again later.';
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  };

  const verifyNow = async () => {
    if (!formData.email || verificationCode.trim().length !== 6) {
      toast.error('Enter your email and the 6-digit code.');
      return;
    }
    setVerifyLoading(true);
    try {
      await api.post('/auth/verify-email', { email: formData.email, token: verificationCode.trim() });
      await refreshUser();
      toast.success('Email verified!');
      navigate('/profile', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed. Please try again.';
      toast.error(message);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    verifyNow();
  };

  useEffect(() => {
    if (isUnverified && verificationCode.trim().length === 6 && !verifyLoading) {
      verifyNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationCode, isUnverified]);

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin]);

  return (
    <Layout>
      {/* Page Header */}
      <motion.div 
        className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-border py-8 sm:py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Sign In</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <i className="fas fa-home text-primary"></i>
              Home / <span className="text-primary">Login</span>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Login Form */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Welcome Message */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wide mb-2">
                Welcome Back
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
                Sign in to your account
              </h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Access your exclusive collection, view order history, and enjoy personalized shopping experiences.
            </p>
            <div className="space-y-4">
              {[
                { icon: 'fas fa-shield-alt', text: 'Secure & encrypted' },
                { icon: 'fas fa-bolt', text: 'Quick sign in process' },
                { icon: 'fas fa-user-check', text: 'Personalized experience' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <i className={`${item.icon} text-primary`}></i>
                  </div>
                  <span className="text-foreground font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground">Login</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                    <input
                      type="email"
                      className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full bg-muted border border-border rounded-lg pl-12 pr-12 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-primary hover:text-accent transition-colors duration-300">
                    Forgot your password?
                  </Link>
                </div>

                {/* Sign In Button */}
                <motion.button 
                  type="submit" 
                  disabled={loading}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt"></i>
                      Sign In
                    </>
                  )}
                </motion.button>
              </form>

              {/* Email Verification Section */}
              {isUnverified && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg space-y-4"
                >
                  <div>
                    <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                      <i className="fas fa-info-circle text-accent"></i>
                      Verify Your Email
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code sent to <strong>{formData.email}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleVerify} className="space-y-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\\d{6}"
                      maxLength={6}
                      className="w-full text-center text-2xl tracking-widest bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 font-mono"
                      name="code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="000000"
                      required
                    />
                    <motion.button 
                      type="submit" 
                      disabled={verifyLoading}
                      className="w-full px-4 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {verifyLoading ? 'Verifying...' : 'Verify & Continue'}
                    </motion.button>
                  </form>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="w-full text-sm text-primary hover:text-accent transition-colors duration-200 py-2"
                  >
                    {resendLoading ? 'Resending...' : 'Resend code'}
                  </button>
                </motion.div>
              )}

              {/* Sign Up Link */}
              <div className="pt-4 border-t border-border text-center">
                <p className="text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link to="/register" className="text-primary font-semibold hover:text-accent transition-colors duration-300">
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Login;
