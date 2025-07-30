import axios from 'axios';
import { getToken, setToken, clearToken, getRefreshToken, setRefreshToken } from '../utils/auth';

// Create axios instance with base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://localhost:3443/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // Important for sending cookies (if using httpOnly cookies)
});

// Request interceptor to add auth token and CSRF token to requests
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        const csrfToken = localStorage.getItem('csrfToken');

        console.log('API Request - Token exists:', !!token);
        console.log('API Request - URL:', config.url);
        console.log('API Request - Headers:', config.headers);

        // Add Authorization header if token exists
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Added Authorization header with token');
        } else {
            console.warn('No token found for request to', config.url);
        }

        // Add CSRF token for state-changing requests
        if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
            config.headers['X-CSRF-Token'] = csrfToken;
            console.log('Added CSRF token to request');
        }

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh and CSRF token updates
api.interceptors.response.use(
    (response) => {
        console.log('API Response - Status:', response.status, response.statusText);
        console.log('API Response - Headers:', response.headers);

        // Check for new CSRF token in response headers
        const csrfToken = response.headers['x-csrf-token'];
        if (csrfToken) {
            localStorage.setItem('csrfToken', csrfToken);
            console.log('Updated CSRF token from response');
        }
        return response;
    },
    async (error) => {
        console.error('API Error:', error);
        console.error('API Error Response:', error.response);

        const originalRequest = error.config;

        // If error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    // No refresh token available, redirect to login
                    clearToken();
                    localStorage.removeItem('csrfToken');
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Try to refresh the token
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL || 'https://localhost:3443/api'}/auth/refresh-token`,
                    { refreshToken },
                    { _retry: true, withCredentials: true }
                );

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // Store the new tokens
                setToken(accessToken);
                setRefreshToken(newRefreshToken);

                // Update the authorization header
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                // Check for new CSRF token in response
                const csrfToken = response.headers['x-csrf-token'];
                if (csrfToken) {
                    localStorage.setItem('csrfToken', csrfToken);
                    originalRequest.headers['X-CSRF-Token'] = csrfToken;
                }

                // Retry the original request
                return api(originalRequest);
            } catch (error) {
                // Refresh token failed, clear everything and redirect to login
                clearToken();
                localStorage.removeItem('csrfToken');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
