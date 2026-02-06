import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { authService } from '@/services/authService';
import { loginStart, loginSuccess, loginFailure, logout } from '@/store/slices/authSlice';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [hasTokens, setHasTokens] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Check for tokens and update state
  useEffect(() => {
    const checkTokens = () => {
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const tokensExist = !!(accessToken && refreshToken);

        setHasTokens(tokensExist);
        setIsInitialized(true);
      }
    };

    checkTokens();

    // Listen for storage changes (when tokens are added/removed)
    window.addEventListener('storage', checkTokens);

    // Also check periodically in case of same-tab changes
    const interval = setInterval(checkTokens, 2000);

    return () => {
      window.removeEventListener('storage', checkTokens);
      clearInterval(interval);
    };
  }, []);

  // Get current user - only if tokens exist
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: authService.getCurrentUser,
    enabled: hasTokens && isInitialized, // Only run query if tokens exist and we're initialized
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Handle authentication errors
  useEffect(() => {
    if (error && hasTokens) {
      console.error('🔑 Authentication error:', error);
      // If we get a 401 or authentication error, clear the tokens
      if ((error as any)?.response?.status === 401 || (error as any)?.response?.status === 403) {
        console.log('🔑 Authentication failed, clearing invalid tokens');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        setHasTokens(false);
        queryClient.clear();
      }
    }
  }, [error, hasTokens, queryClient]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onMutate: () => {
      dispatch(loginStart());
    },
    onSuccess: (userData) => {
      dispatch(loginSuccess(userData));
      queryClient.setQueryData(['auth', 'user'], userData);
      safeNotify('success', 'Login Successful', `Welcome back, ${userData.name || 'User'}!`);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      safeNotify('error', 'Login Failed', errorMessage);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear tokens from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      dispatch(logout());
      queryClient.clear();
      setHasTokens(false);
      setIsInitialized(true); // Keep initialized state

      safeNotify('success', 'Logged Out', 'You have been successfully logged out.');

      // Redirect to home page after a short delay to show the toast
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    },
    onError: (error) => {
      // Even if logout fails on backend, clear local state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      dispatch(logout());
      queryClient.clear();
      setHasTokens(false);
      setIsInitialized(true);

      safeNotify('success', 'Logged Out', 'You have been logged out.');

      // Redirect to home page after a short delay to show the toast
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    },
  });

  return {
    user: hasTokens ? user : null,
    isLoading: !isInitialized || (hasTokens && isLoading),
    isInitialized,
    hasTokens,
    error,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    getOAuthLoginUrl: authService.getOAuthLoginUrl,
  };
};