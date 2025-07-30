import axios from 'axios';
import { getToken, setToken, clearToken, getRefreshToken, setRefreshToken } from './authHelper';

// Create axios instance with base URL
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://localhost:3443/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token to requests
API.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    // No refresh token available, redirect to login
                    clearToken();
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

                // Retry the original request
                return API(originalRequest);
            } catch (error) {
                // Refresh token failed, clear tokens and redirect to login
                clearToken();
                // window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default API;