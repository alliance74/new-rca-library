import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export const useAuthenticateToken = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

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

  useEffect(() => {
    const processToken = async () => {
      const token = searchParams.get('token');

      if (!token) return;

      setIsProcessing(true);
      setError(null);

      try {
        console.log('🔄 Processing token:', token);
        // Call backend to validate MIS token and get our JWT
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/callback?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        console.log('📡 Backend response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Authentication successful:', data);

          // Store our JWT tokens
          localStorage.setItem('access_token', data.accessToken);
          localStorage.setItem('refresh_token', data.refreshToken);

          // Show success toast
          safeNotify('success', 'Login Successful', `Welcome, ${data.user.name || 'Student'}!`);

          // Clean the URL by removing the token parameter
          const url = new URL(window.location.href);
          url.searchParams.delete('token');
          window.history.replaceState({}, '', url.toString());

          // Wait a moment for localStorage to be updated, then redirect
          setTimeout(() => {
            if (data.user.role === 'STUDENT') {
              console.log('🎓 Redirecting to user dashboard');
              window.location.href = '/user';
            } else if (data.user.role === 'LIBRARIAN') {
              console.log('📚 Redirecting to librarian dashboard');
              window.location.href = '/librarian';
            } else {
              console.log('❓ Unknown role, redirecting to user dashboard');
              window.location.href = '/user'; // Default fallback
            }
          }, 1500); // Increased delay to show the toast
        } else {
          const errorData = await response.text();
          console.error('❌ Authentication failed:', errorData);
          setError('Authentication failed');
          safeNotify('error', 'Login Failed', 'Authentication failed. Please try again.');

          // Clean the URL and redirect to home on error
          const url = new URL(window.location.href);
          url.searchParams.delete('token');
          window.history.replaceState({}, '', url.toString());

          setTimeout(() => router.push('/'), 3000);
        }
      } catch (err) {
        console.error('💥 Token processing error:', err);
        const errorMessage = 'Authentication failed. Please try again.';
        setError(errorMessage);
        safeNotify('error', 'Login Failed', errorMessage);

        // Clean the URL and redirect to home on error
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, '', url.toString());

        setTimeout(() => router.push('/'), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    processToken();
  }, [searchParams, router]);

  return {
    isProcessing,
    error,
  };
};