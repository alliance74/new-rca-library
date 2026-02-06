import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
  withCredentials: true, // Important for session-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      // Add JWT token if available
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }

      // Skip CSRF token for now (temporarily disabled)
      // Get CSRF token for non-GET requests
      // if (config.method !== 'get') {
      //   const csrfResponse = await axios.get('/csrf/token', {
      //     baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      //     withCredentials: true,
      //   });
        
      //   if (csrfResponse.data?.token) {
      //     config.headers['X-CSRF-Token'] = csrfResponse.data.token;
      //   }
      // }
    } catch (error) {
      console.warn('Failed to get CSRF token:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling (no token refresh needed with HTTP-only cookies)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;