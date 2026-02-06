import api from '@/lib/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  level?: string;
  role: 'STUDENT' | 'TEACHER' | 'LIBRARIAN';
  profilePicture?: string;
}

export const authService = {
  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get('/auth/me');
      console.log('🔍 Auth response:', response.data);
      // Backend returns { user: userDetails, currentBorrows, borrowHistory }
      return response.data.user;
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      throw error;
    }
  },

  // Login with credentials (for librarians)
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Logout (clears HTTP-only cookie)
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if the backend call fails, we should still clear local tokens
      console.warn('Backend logout failed, but clearing local tokens anyway');
    }
  },

  // OAuth login URL for students (RCA MIS)
  getOAuthLoginUrl: (): string => {
    const misLoginUrl = 'http://5.252.53.111:9099/auth/login';
    // Use current window location for redirect URL
    const appRedirectUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    
    // Build the OAuth URL with RCA MIS specific parameters
    const oauthUrl = `${misLoginUrl}?redirect=${encodeURIComponent(appRedirectUrl)}?redirect=%2F&oauth=true`;
    
    return oauthUrl;
  },

  // Check authentication status (via HTTP-only cookie)
  checkAuth: async (): Promise<User | null> => {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      return null;
    }
  },
};