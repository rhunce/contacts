import axios, { AxiosError, AxiosResponse } from 'axios';

// For production, use a relative URL to inherit the protocol from the current page
// This avoids mixed content issues when frontend is HTTPS and API is HTTP
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth headers if needed
api.interceptors.request.use(
  (config) => {
    // Add any request logging or headers here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear any stored auth data
      if (typeof window !== 'undefined') {
        // Only redirect if we're in the browser and not already on login page
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
          window.location.href = '/login';
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