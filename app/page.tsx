'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticateToken } from '@/hooks/useAuthenticateToken';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/services/authService';
import { Eye, EyeOff } from 'lucide-react';
import * as yup from 'yup';

// Validation schema
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

interface FormErrors {
  email?: string;
  password?: string;
}

function HomePageContent() {
  const [userType, setUserType] = useState<'student' | 'librarian'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const { isProcessing: isTokenProcessing } = useAuthenticateToken();
  const { user, isLoading: authLoading, isInitialized } = useAuth();
  const router = useRouter();

  // Real-time validation
  const validateField = async (fieldName: string, value: string) => {
    try {
      const fieldSchema = yup.reach(loginSchema, fieldName) as yup.StringSchema;
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
    validateField('email', value);
  };

  // Handle password change with validation
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    validateField('password', value);
  };

  // Safe notification function that only works if provider is available
  const safeNotify = (type: 'success' | 'error', title: string, message: string) => {
    try {
      // Dynamically import to avoid circular dependency during provider initialization
      import('@/hooks/useGlobalNotification').then(({ useGlobalNotification }) => {
        const { showSuccess, showError } = useGlobalNotification();
        if (type === 'success') {
          showSuccess(title, message);
        } else {
          showError(title, message);
        }
      }).catch(() => {
        // Silently fail if notification system isn't ready
        console.log(`${type}: ${title} - ${message}`);
      });
    } catch {
      // Fallback to console if notifications aren't available
      console.log(`${type}: ${title} - ${message}`);
    }
  };

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isInitialized && !authLoading && user && !isTokenProcessing) {
      const authenticatedUser = user as User;
      if (authenticatedUser.role === 'STUDENT') {
        router.push('/user');
      } else if (authenticatedUser.role === 'LIBRARIAN') {
        router.push('/librarian');
      }
    }
  }, [user, authLoading, isInitialized, isTokenProcessing, router]);

  // Show processing state if token is being processed
  if (isTokenProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/assets/logo.png" 
              alt="RCA Library" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <p className="text-gray-600">Processing MIS authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/assets/logo.png" 
              alt="RCA Library" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLibrarianLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate form
    try {
      await loginSchema.validate({ email, password }, { abortEarly: false });
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store tokens
        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
        
        // Get user profile to determine role
        const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${data.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          const user = profileData.user;
          
          // Show success toast
          safeNotify('success', 'Login Successful', `Welcome back, ${user.name || 'User'}!`);
          
          // Redirect based on role
          if (user.role === 'LIBRARIAN') {
            router.push('/librarian');
          } else if (user.role === 'STUDENT') {
            router.push('/user');
          } else {
            router.push('/librarian'); // Default for librarian login
          }
        } else {
          // Default redirect if profile fetch fails
          safeNotify('success', 'Login Successful', 'Welcome back!');
          router.push('/librarian');
        }
      } else {
        const errorData = await response.json();
        
        // Handle specific field errors
        if (response.status === 401) {
          if (errorData.message?.toLowerCase().includes('email')) {
            setFormErrors({ email: 'Email not found' });
          } else if (errorData.message?.toLowerCase().includes('password')) {
            setFormErrors({ password: 'Incorrect password' });
          } else {
            setFormErrors({ 
              email: 'Invalid email or password',
              password: 'Invalid email or password'
            });
          }
        } else {
          const errorMessage = errorData.message || 'Invalid credentials. Please check your email and password.';
          safeNotify('error', 'Login Failed', errorMessage);
        }
        setIsLoading(false);
      }
    } catch (err: any) {
      const errorMessage = 'Login failed. Please check your connection and try again.';
      safeNotify('error', 'Login Failed', errorMessage);
      setIsLoading(false);
    }
  };

  const handleStudentLogin = () => {
    setIsLoading(true);
    // Redirect to RCA MIS OAuth
    const misLoginUrl = 'http://5.252.53.111:9099/auth/login';
    const appRedirectUrl = 'http://localhost:3000';
    const oauthUrl = `${misLoginUrl}?redirect=${encodeURIComponent(appRedirectUrl)}?redirect=%2F&oauth=true`;
    
    window.location.href = oauthUrl;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/assets/logo.png" 
                  alt="RCA Library" 
                  className="h-12 w-12 object-contain"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">RCA Library</h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back !!</h2>
            <p className="text-gray-600">Please enter your credentials to log in</p>
          </div>

          {/* User Type Toggle */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setUserType('student')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                userType === 'student'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setUserType('librarian')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                userType === 'librarian'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Librarian
            </button>
          </div>

          {/* All errors now show as toasts instead of static displays */}

          {/* Student Login */}
          {userType === 'student' && (
            <div className="space-y-4">
              <p className="text-center text-gray-600 mb-6">
                Use your RCA MIS credentials to access the library
              </p>
              <button
                onClick={handleStudentLogin}
                disabled={isLoading}
                className="w-full py-3 px-4 text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#001240' }}
              >
                {isLoading ? 'Redirecting...' : 'Continue with RCA MIS'}
              </button>
            </div>
          )}

          {/* Librarian Login */}
          {userType === 'librarian' && (
            <form onSubmit={handleLibrarianLogin} className="space-y-4">
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
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      formErrors.password ? 'border-red-500' : 'border-gray-300'
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
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#001240' }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              
              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push('/reset-password-otp')}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          )}

          {/* Additional Info for Librarians */}
          {userType === 'librarian' && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Librarian accounts are created by administrators. 
                Contact your system administrator if you need access.
              </p>
            </div>
          )}

          {/* Debug: Clear tokens button */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.reload();
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear stored tokens
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div 
        className="hidden lg:flex flex-1 items-center justify-center text-white relative overflow-hidden"
        style={{ backgroundColor: '#001240' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white/20"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-white/10"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5"></div>
        </div>
        
        {/* Content */}
        <div className="text-center z-10">
          <div className="flex justify-center mb-8">
            <img 
              src="/assets/white-book.png" 
              alt="RCA Library" 
              className="h-24 w-24 object-contain"
            />
          </div>
          <h2 className="text-4xl font-bold mb-4">RCA Library</h2>
          <p className="text-xl text-blue-100 max-w-md">
            Your gateway to knowledge and academic resources
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}