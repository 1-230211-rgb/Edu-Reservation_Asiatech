import React, { useState, useEffect } from 'react';
import { Page, User, UserRole } from '../types';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface AuthProps {
  type: 'login' | 'register';
  setPage: (page: Page) => void;
  onSuccess: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ type, setPage, onSuccess }) => {
  const isLogin = type === 'login';
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Input details, 2: Input code
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    mobile: '',
    email: '',
    password: '',
    grade: 'Grade 1',
  });
  const [resetData, setResetData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
    code: '',
  });
  const [resetError, setResetError] = useState('');
  const [resetCodeError, setResetCodeError] = useState('');
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const [showPrivacyModal, setShowPrivacyModal] = useState(!isLogin);
  const [hasAgreedToPrivacy, setHasAgreedToPrivacy] = useState(false);

  useEffect(() => {
    if (!isLogin && !hasAgreedToPrivacy) {
      setShowPrivacyModal(true);
    }
  }, [type, isLogin, hasAgreedToPrivacy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetCodeError('');
    setVerificationError('');
    console.log("Form submitted. isForgotPassword:", isForgotPassword, "resetStep:", resetStep);
    
    if (isVerifying) {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: verificationEmail, code: verificationCode }),
        });
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('token', data.token);
          onSuccess(data.user);
          toast.success("Email verified and account activated!");
          setIsVerifying(false);
        } else {
          setVerificationError(data.message || "Verification failed");
        }
      } catch (error) {
        toast.error("Failed to verify email");
      }
      return;
    }

    if (!isLogin && !hasAgreedToPrivacy && !isForgotPassword) {
      toast.error("You must agree to the Data Privacy Act to register.");
      setShowPrivacyModal(true);
      return;
    }

    if (isForgotPassword) {
      if (resetStep === 1) {
        console.log("Attempting to send verification code for:", resetData.email);
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(resetData.email)) {
          setResetError("Invalid Email");
          return;
        }

        if (resetData.newPassword.length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
        }

        if (resetData.newPassword !== resetData.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        
        try {
          const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: resetData.email }),
          });
          const data = await response.json();
          console.log("Forgot password response:", data);
          if (data.success) {
            toast.success(data.message);
            setResetStep(2);
          } else {
            if (data.message === "Invalid Email") {
              setResetError("Invalid Email");
            } else {
              toast.error(data.message);
            }
          }
        } catch (error) {
          console.error("Forgot password fetch error:", error);
          toast.error("Failed to send verification code");
        }
      } else {
        console.log("Attempting to reset password for:", resetData.email, "with code:", resetData.code);
        try {
          const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: resetData.email, 
              code: resetData.code, 
              newPassword: resetData.newPassword 
            }),
          });
          const data = await response.json();
          console.log("Reset password response:", data);
          if (data.success) {
            toast.success("Password reset successful! You can now login.");
            setIsForgotPassword(false);
            setResetStep(1);
            setResetData({ email: '', newPassword: '', confirmPassword: '', code: '' });
          } else {
            setResetCodeError(data.message || "Invalid Code");
          }
        } catch (error) {
          console.error("Reset password fetch error:", error);
          toast.error("Failed to reset password");
        }
      }
      return;
    }

    if (!isLogin && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin 
      ? { email: formData.email, password: formData.password }
      : { ...formData, role };

    // Client-side UI validation for Admin role
    if (role === 'admin' && formData.email !== 'admin@asiatech.edu.ph') {
      toast.error("Only the official administrative email is allowed for Admin access.");
      return;
    }

    // Client-side UI validation for Student domain
    if (role === 'student') {
      const studentIdMatch = formData.email.match(/^1-\d{1,}/);
      if (!studentIdMatch || !formData.email.endsWith('@asiatech.edu.ph')) {
        toast.error("Students must use their institutional email");
        return;
      }
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        if (data.needsVerification) {
          setVerificationEmail(data.email);
          setIsVerifying(true);
          toast.info(data.message);
        } else {
          localStorage.setItem('token', data.token);
          onSuccess(data.user);
          toast.success(isLogin ? "Login successful!" : "Account created successfully!");
        }
      } else {
        if (data.needsVerification) {
          setVerificationEmail(data.email);
          setIsVerifying(true);
          toast.info(data.message);
        } else {
          toast.error(data.message || "Authentication failed");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };


  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f5f5f5]">
      {/* Left Side: School Branding */}
      <div className="w-full lg:w-1/2 bg-[#e2efda] flex flex-col items-center justify-center p-8 lg:p-12 relative overflow-hidden min-h-[40vh] lg:min-h-screen">
        <div className="text-center mb-8 lg:mb-12 z-10">
          <h2 className="text-xl lg:text-2xl font-semibold text-[#385723] leading-tight max-w-md mx-auto">
            Asia Technological School of Science and Arts
          </h2>
        </div>
        
        <img 
          src="/logo.jpg" 
          alt="School Logo" 
          className="w-48 h-48 lg:w-80 lg:h-80 object-contain z-10"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/school/400/400';
          }}
        />
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-8 lg:p-12 relative">
        {/* Data Privacy Modal */}
        {!isLogin && showPrivacyModal && !hasAgreedToPrivacy && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl border-t-8 border-[#385723]"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#e2efda] rounded-full flex items-center justify-center text-[#385723]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h2 className="text-2xl font-bold text-[#385723]">Data Privacy Notice</h2>
              </div>
              
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p className="font-semibold text-gray-800">Data Privacy Act of 2012 (Philippines):</p>
                <p>
                  Personal data is collected only when necessary, stored securely, and protected through Role-Based Access Control (RBAC) and Row-Level Security (RLS).
                </p>
                <div className="bg-gray-50 p-4 rounded-lg text-sm border-l-4 border-[#548235]">
                  By creating an account, you consent to the collection and processing of your school-related information for the sole purpose of uniform reservation and management.
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setHasAgreedToPrivacy(true);
                    setShowPrivacyModal(false);
                  }}
                  className="w-full py-4 bg-[#385723] hover:bg-[#2d461c] text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  I Agree and Continue
                </button>
                <button
                  onClick={() => {
                    setPage('login');
                    setShowPrivacyModal(false);
                  }}
                  className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                >
                  Cancel and Return to Login
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-[#548235] mb-2 tracking-tight">EDURESERVE</h1>
            <p className="text-gray-600 text-sm">Asia Technological School of Science and Arts</p>
          </div>

          {isForgotPassword ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <button 
                  onClick={() => {
                    setIsForgotPassword(false);
                    setResetStep(1);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <h2 className="text-2xl font-bold text-[#385723]">Reset Password</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700 font-medium">Email Address*</label>
                    {resetError && <span className="text-red-500 text-xs font-bold animate-pulse">{resetError}</span>}
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    className={`w-full px-4 py-3 bg-[#f2f2f2] border-2 rounded-lg focus:ring-2 focus:ring-[#548235] transition-all ${resetError ? 'border-red-400' : 'border-transparent'}`}
                    value={resetData.email}
                    onChange={(e) => {
                      setResetData({ ...resetData, email: e.target.value });
                      if (resetError) setResetError('');
                    }}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">New Password*</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      placeholder="Min. 6 characters"
                      className={`w-full px-4 py-3 bg-[#f2f2f2] border-2 rounded-lg focus:ring-2 focus:ring-[#548235] transition-all pr-12 ${
                        resetData.newPassword && resetData.newPassword.length < 6 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-transparent'
                      }`}
                      value={resetData.newPassword}
                      onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Confirm New Password*</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Repeat new password"
                      className={`w-full px-4 py-3 bg-[#f2f2f2] border-2 rounded-lg focus:ring-2 focus:ring-[#548235] transition-all pr-12 ${
                        resetData.confirmPassword && resetData.confirmPassword.length < 6 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-transparent'
                      }`}
                      value={resetData.confirmPassword}
                      onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-[#385723] hover:bg-[#2d461c] text-white font-bold text-xl rounded-xl shadow-lg transition-all"
                >
                  Send Verification Code
                </button>
              </form>

              {/* Verification Code Modal Overlay */}
              {resetStep === 2 && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Enter Reset Code</h3>
                      <p className="text-gray-500 text-sm mt-2">
                        We've sent a 6-digit code to <br/><span className="font-semibold text-gray-700">{resetData.email}</span>
                      </p>
                      {resetCodeError && (
                        <div className="mt-4 p-2 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-red-600 text-xs font-bold animate-pulse">{resetCodeError}</p>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="000000"
                          className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-xl focus:ring-0 transition-all text-center text-3xl tracking-[0.3em] font-bold ${resetCodeError ? 'border-red-400 text-red-500' : 'border-gray-100 text-gray-900 focus:border-[#548235]'}`}
                          value={resetData.code}
                          onChange={(e) => {
                            setResetData({ ...resetData, code: e.target.value.replace(/\D/g, '') });
                            if (resetCodeError) setResetCodeError('');
                          }}
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setResetStep(1)}
                          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-[#4ade80] hover:bg-[#22c55e] text-white font-bold rounded-xl shadow-lg transition-all"
                        >
                          Confirm
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : isVerifying ? (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-[#e2efda] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#385723" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17.002a6.002 6.002 0 0 1-11.83 1.667"/><path d="M25 13a10 10 0 1 0-5.94 1.35"/><path d="m17 10 2 2 4-4"/></svg>
                </div>
                <h2 className="text-3xl font-bold text-[#385723] mb-2">Verify Email</h2>
                <p className="text-gray-600">
                  We've sent a code to <br/><span className="font-semibold">{verificationEmail}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    className={`w-full px-4 py-4 bg-[#f2f2f2] border-2 rounded-xl text-center text-3xl tracking-widest font-bold focus:ring-[#548235] transition-all ${verificationError ? 'border-red-400 text-red-500' : 'border-transparent text-gray-900'}`}
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value.replace(/\D/g, ''));
                      if (verificationError) setVerificationError('');
                    }}
                  />
                  {verificationError && <p className="text-red-500 text-sm mt-2 text-center font-medium animate-pulse">{verificationError}</p>}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsVerifying(false)}
                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-[#385723] hover:bg-[#2d461c] text-white font-bold rounded-xl shadow-lg transition-all"
                  >
                    Verify Code
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-8">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  role === 'student'
                    ? 'bg-[#385723] text-white shadow-md'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                Student
              </button>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    role === 'admin'
                      ? 'bg-[#385723] text-white shadow-md'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  Admin
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">First name*</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-[#f2f2f2] border-none rounded-lg focus:ring-2 focus:ring-[#548235] transition-all"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Last name*</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-[#f2f2f2] border-none rounded-lg focus:ring-2 focus:ring-[#548235] transition-all"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">User name*</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-[#f2f2f2] border-none rounded-lg focus:ring-2 focus:ring-[#548235] transition-all"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Mobile number*</label>
                  <input
                    type="tel"
                    required
                    pattern="09[0-9]{9}"
                    placeholder="09xxxxxxxxx"
                    title="Please enter an 11-digit mobile number starting with 09"
                    className="w-full px-4 py-3 bg-[#f2f2f2] border-none rounded-lg focus:ring-2 focus:ring-[#548235] transition-all"
                    value={formData.mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                      setFormData({ ...formData, mobile: val });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Grade Level*</label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-[#f2f2f2] border-none rounded-lg focus:ring-2 focus:ring-[#548235] transition-all"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  >
                    {['Pre-School', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {role === 'admin' ? 'Email*' : 'Institutional Email*'}
              </label>
              <input
                type="email"
                required
                placeholder={role === 'admin' ? "Enter your email" : ""}
                className={`w-full px-4 py-3 bg-[#f2f2f2] border-none rounded-lg focus:ring-2 focus:ring-[#548235] transition-all`}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value.trim() })}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-gray-700 font-medium">Password*</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setResetStep(1);
                    }}
                    className="text-xs font-semibold text-[#385723] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-3 bg-[#f2f2f2] border-none rounded-lg focus:ring-2 focus:ring-[#548235] transition-all pr-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#4ade80] hover:bg-[#22c55e] text-white font-bold text-xl rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLogin ? 'Login' : 'Create account'}
            </button>
          </form>
          </>
          )}

          {role !== 'admin' && !isForgotPassword && (
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setPage(isLogin ? 'register' : 'login');
                    if (isLogin) setRole('student');
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
