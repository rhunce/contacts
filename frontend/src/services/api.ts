import axios, { AxiosError, AxiosResponse } from 'axios';

// For production, use the API URL as provided
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === 'production'
    ? '' // force providing env in build; empty means misconfig will fail loudly
    : 'http://localhost:3000');

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// NOTE: Use to add/modify headers, logging, or make any other request modifications
// api.interceptors.request.use(
//   (config) => {
//     // Add any request logging, headers, or modifications here
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear any stored auth data
      if (typeof window !== 'undefined') {
        // Only redirect if we're in the browser and not already on login/register page
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath === '/login' || currentPath === '/register' || currentPath === '/';
        
        // Don't redirect if we're on an auth page or if this is a /me call (auth check)
        const isMeCall = error.config?.url?.includes('/me');
        
        if (!isAuthPage && !isMeCall) {
          console.log('API Interceptor: Redirecting to login due to 401 on protected page');
          window.location.href = '/login';
        } else {
          console.log('API Interceptor: 401 on auth page or /me call, not redirecting');
        }
      }
    }
    
    // Log error for debugging
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });
    
    return Promise.reject(error);
  }
);

export default api;