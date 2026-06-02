import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('register');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdStrength, setPwdStrength] = useState({ score: 0, label: 'Very weak', color: 'bg-destructive' });
  const { register, refreshUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === 'password') {
      setPwdStrength(evaluatePassword(e.target.value));
    }
  };

  const evaluatePassword = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    let label = 'Very weak';
    let color = 'bg-destructive';
    switch (score) {
      case 0:
      case 1:
        label = 'Very weak';
        color = 'bg-destructive';
        break;
      case 2:
        label = 'Weak';
        color = 'bg-destructive';
        break;
      case 3:
        label = 'Fair';
        color = 'bg-yellow-500';
        break;
      case 4:
        label = 'Strong';
        color = 'bg-blue-500';
        break;
      case 5:
        label = 'Very strong';
        color = 'bg-green-500';
        break;
      default:
        break;
    }
    return { score, label, color };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await register(formData.name, formData.email, formData.password);
      toast.success(response.message || 'Account created successfully. Please verify your email.');
      setPendingEmail(formData.email);
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      setStep('verify');
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to create account.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();

    if (!pendingEmail || verificationCode.trim().length !== 6) {
      toast.error('Enter the 6-digit code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-email', { email: pendingEmail, token: verificationCode.trim() });
      await refreshUser();
      toast.success('Email verified! Redirecting to your dashboard...');
      setTimeout(() => navigate('/profile'), 700);
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 'verify' && verificationCode.trim().length === 6 && !loading) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationCode, step]);

  const handleResend = async () => {
    if (!pendingEmail) return;
    setResendLoading(true);
    try {
      await api.post('/auth/reset-verification', { email: pendingEmail });
      toast.success('A new verification code has been sent to your email.');
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to resend code. Try again later.';
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  };

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
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Create Account</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <i className="fas fa-home text-primary"></i>
              Home / <span className="text-primary">Register</span>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Registration Form */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wide mb-2">
                Join Raddazle
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
                Create your account
              </h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Join thousands of satisfied customers and enjoy exclusive benefits, personalized recommendations, and faster checkout.
            </p>
            <div className="space-y-4">
              {[
                { icon: 'fas fa-heart', text: 'Save your favorite items' },
                { icon: 'fas fa-rocket', text: 'Fast & secure checkout' },
                { icon: 'fas fa-gift', text: 'Exclusive member offers' },
                { icon: 'fas fa-truck', text: 'Track your orders' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
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
              {step === 'register' ? (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-foreground">Sign Up</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                        <input
                          type="text"
                          className="w-full bg-muted border border-border rounded-lg pl-12 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          autoComplete="name"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
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

                    {/* Password */}
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
                          placeholder="Min. 8 characters"
                          required
                          minLength={8}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                        </button>
                      </div>
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-2">
                          <div className={`flex-1 h-1.5 rounded-full ${pwdStrength.color}`}></div>
                          <div className={`flex-1 h-1.5 rounded-full ${pwdStrength.score >= 2 ? pwdStrength.color : 'bg-muted'}`}></div>
                          <div className={`flex-1 h-1.5 rounded-full ${pwdStrength.score >= 3 ? pwdStrength.color : 'bg-muted'}`}></div>
                          <div className={`flex-1 h-1.5 rounded-full ${pwdStrength.score >= 4 ? pwdStrength.color : 'bg-muted'}`}></div>
                          <div className={`flex-1 h-1.5 rounded-full ${pwdStrength.score >= 5 ? pwdStrength.color : 'bg-muted'}`}></div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Strength: <span className="font-medium text-foreground">{pwdStrength.label}</span>
                        </p>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          className="w-full bg-muted border border-border rounded-lg pl-12 pr-12 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          required
                          minLength={8}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                          aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        >
                          <i className={`fas fa-eye${showConfirm ? '-slash' : ''}`}></i>
                        </button>
                      </div>
                    </div>

                    {/* Sign Up Button */}
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
                          Creating account...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-plus"></i>
                          Create Account
                        </>
                      )}
                    </motion.button>
                  </form>

                  {/* Sign In Link */}
                  <div className="pt-4 border-t border-border text-center">
                    <p className="text-muted-foreground">
                      Already have an account?{' '}
                      <Link to="/login" className="text-primary font-semibold hover:text-accent transition-colors duration-300">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-envelope text-primary text-lg"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Verify your email</h3>
                    <p className="text-muted-foreground">
                      Enter the 6-digit code sent to<br />
                      <span className="font-medium text-foreground">{pendingEmail}</span>
                    </p>
                  </div>

                  <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                      <label htmlFor="code" className="block text-sm font-medium text-foreground mb-2">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="\\d{6}"
                        maxLength={6}
                        className="w-full text-center text-3xl tracking-widest bg-muted border-2 border-border rounded-lg px-4 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 font-mono"
                        id="code"
                        name="code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="000000"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-2">Code expires in 24 hours</p>
                    </div>

                    <motion.button 
                      type="submit" 
                      disabled={loading}
                      className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? 'Verifying...' : 'Verify & Continue'}
                    </motion.button>
                  </form>

                  <div className="pt-4 border-t border-border space-y-3">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendLoading}
                      className="w-full text-sm text-primary hover:text-accent transition-colors duration-200 py-2 font-medium"
                    >
                      {resendLoading ? 'Resending...' : 'Resend code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep('register')}
                      className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 py-2"
                    >
                      Change email address
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Register;
