'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'STUDENT' | 'LIBRARIAN';
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/'
}: ProtectedRouteProps) {
  const { user, isLoading, isInitialized, hasTokens, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only make decisions after we're initialized and not loading
    if (isInitialized && !isLoading) {
      // If there's an authentication error or no tokens/user, redirect to home
      if (!hasTokens || !user || error) {
        console.log('❌ No authentication or error, redirecting to home');
        router.push(redirectTo);
        return;
      }

      if (requiredRole && user.role !== requiredRole) {
        console.log('🔄 Role mismatch, redirecting to appropriate dashboard');
        // Redirect to appropriate dashboard based on role
        if (user.role === 'STUDENT') {
          router.push('/user');
        } else if (user.role === 'LIBRARIAN') {
          router.push('/librarian');
        }
        return;
      }
    }
  }, [user, isLoading, isInitialized, hasTokens, error, requiredRole, router, redirectTo]);

  // Show loading while initializing or loading user data
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <img 
            src="/assets/logo.png" 
            alt="Loading" 
            className="h-12 w-12 object-contain mx-auto mb-4"
          />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if we don't have tokens/user or there's an error (will redirect in useEffect)
  if (!hasTokens || !user || error) {
    return null;
  }

  // Don't render if role doesn't match (will redirect in useEffect)
  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}