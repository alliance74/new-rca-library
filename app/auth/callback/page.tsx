'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const error = searchParams.get('error');
        
        if (error) {
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
          setTimeout(() => router.push('/'), 3000);
          return;
        }

        if (!accessToken || !refreshToken) {
          setStatus('error');
          setMessage('Authentication tokens not received.');
          setTimeout(() => router.push('/'), 3000);
          return;
        }

        // Store tokens in localStorage
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        
        // Get user profile to determine role and redirect accordingly
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            const user = data.user;
            
            setStatus('success');
            setMessage('Authentication successful! Redirecting...');
            
            // Redirect based on user role
            setTimeout(() => {
              if (user.role === 'STUDENT') {
                router.push('/user');
              } else if (user.role === 'LIBRARIAN') {
                router.push('/librarian');
              } else {
                // Default fallback
                router.push('/user');
              }
            }, 2000);
          } else {
            throw new Error('Failed to get user profile');
          }
          
        } catch (profileError) {
          console.error('Failed to get user profile:', profileError);
          // Default to user dashboard if profile fetch fails
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          setTimeout(() => router.push('/user'), 2000);
        }
        
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
        setTimeout(() => router.push('/'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <img 
            src="/assets/logo.png" 
            alt="RCA Library" 
            className="h-16 w-16 object-contain"
          />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">RCA Library</h1>
        
        {status === 'loading' && (
          <div className="space-y-4">
            <p className="text-gray-600">{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-medium">{message}</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to home page...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Processing authentication...</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}