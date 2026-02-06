'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import * as yup from 'yup';

// Validation schemas
const emailSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

const otpSchema = yup.object().shape({
  otp: yup
    .string()
    .matches(/^\d{6}$/, 'OTP must be exactly 6 digits')
    .required('OTP is required'),
});

const passwordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

interface FormErrors {
  email?: string;
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
}

type Step = 'email' | 'otp' | 'password';

export default function ResetPasswordOtpPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const router = useRouter();

  // Real-time validation
  const validateField = async (schema: any, fieldName: string, value: string) => {
    try {
      const fieldSchema = yup.reach(schema, fieldName) as yup.StringSchema;
      await fieldSchema.validate(value);
      setFormErrors(prev => ({ ...prev, [fieldName]: undefined }));
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setFormErrors(prev => ({ ...prev, [fieldName]: error.message }));
      }
    }
  };

  // Handle email change with validation
  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateField(emailSchema, 'email', value);
  };

  // Handle OTP change with validation
  const handleOtpChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numericValue);
    validateField(otpSchema, 'otp', numericValue);
  };

  // Handle password change with validation
  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    validateField(passwordSchema, 'newPassword', value);
    // Also revalidate confirm password if it has a value
    if (confirmPassword) {
      validateField(passwordSchema, 'confirmPassword', confirmPassword);
    }
  };

  // Handle confirm password change with validation
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    validateField(passwordSchema, 'confirmPassword', value);
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Validate email
    try {
      await emailSchema.validate({ email }, { abortEarly: false });
      setFormErrors({});
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: FormErrors = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path as keyof FormErrors] = err.message;
          }
        });
        setFormErrors(errors);
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('OTP has been sent to your email address. Please check your inbox.');
        setStep('otp');
      } else {
        setMessage(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setMessage('Failed to send OTP. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Validate OTP
    try {
      await otpSchema.validate({ otp }, { abortEarly: false });
      setFormErrors({});
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: FormErrors = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path as keyof FormErrors] = err.message;
          }
        });
        setFormErrors(errors);
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('OTP verified successfully! Please enter your new password.');
        setStep('password');
      } else {
        setMessage(data.message || 'Invalid or expired OTP. Please try again.');
      }
    } catch (err) {
      setMessage('Failed to verify OTP. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Validate passwords
    try {
      await passwordSchema.validate({ newPassword, confirmPassword }, { abortEarly: false });
      setFormErrors({});
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: FormErrors = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path as keyof FormErrors] = err.message;
          }
        });
        setFormErrors(errors);
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/reset-password-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage('Password has been reset successfully! You can now login with your new password.');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setMessage(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setMessage('Failed to reset password. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    if (isSuccess) {
      return (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="p-3 rounded-lg text-sm bg-green-50 text-green-800 border border-green-200">
            {message}
          </div>
          <p className="text-sm text-gray-500 mt-4">Redirecting to login page...</p>
        </div>
      );
    }

    switch (step) {
      case 'email':
        return (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reset Password</h3>
              <p className="text-sm text-gray-600">Enter your email address to receive an OTP for password reset.</p>
            </div>
            
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  formErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('sent') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#001240' }}
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        );

      case 'otp':
        return (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Enter OTP</h3>
              <p className="text-sm text-gray-600">We've sent a 6-digit OTP to <strong>{email}</strong></p>
            </div>
            
            <div>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => handleOtpChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-2xl tracking-widest ${
                  formErrors.otp ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={6}
                required
              />
              {formErrors.otp && (
                <p className="mt-1 text-sm text-red-600">{formErrors.otp}</p>
              )}
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('successfully') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#001240' }}
            >
              {isLoading ? 'Verifying OTP...' : 'Verify OTP'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Back to email
              </button>
            </div>
          </form>
        );

      case 'password':
        return (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Set New Password</h3>
              <p className="text-sm text-gray-600">Enter your new password below</p>
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    formErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{formErrors.newPassword}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
              )}
            </div>

            {message && !isSuccess && (
              <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#001240' }}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('otp')}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Back to OTP
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/assets/logo.png" 
                alt="RCA Library" 
                className="h-12 w-12 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">RCA Library</h1>
            
            {/* Step indicator */}
            <div className="flex justify-center space-x-2 mt-4">
              <div className={`w-3 h-3 rounded-full ${step === 'email' ? 'bg-blue-600' : step === 'otp' || step === 'password' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${step === 'otp' ? 'bg-blue-600' : step === 'password' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${step === 'password' ? 'bg-blue-600' : isSuccess ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            </div>
          </div>

          {renderStepContent()}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}