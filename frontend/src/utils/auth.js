// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_INFO_KEY = 'user_info';

// Save tokens to localStorage
export const setTokens = (accessToken, refreshToken) => {
    if (accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
};

// Get access token
export const getToken = () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Get refresh token
export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// Save user info
export const setUser = (user) => {
    if (user) {
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
    }
};

// Get user info
export const getUser = () => {
    const user = localStorage.getItem(USER_INFO_KEY);
    return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!getToken();
};

// Check if user has admin role
export const isAdmin = () => {
    const user = getUser();
    return user?.role === 'admin';
};

// Clear all auth data
export const clearAuth = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
};

// Set access token
export const setToken = (token) => {
    if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
};

// Set refresh token
export const setRefreshToken = (token) => {
    if (token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
};

// Clear tokens
export const clearToken = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Get auth header for API requests
export const getAuthHeader = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Check if token is expired
export const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        const currentTime = Date.now() / 1000;

        return payload.exp < currentTime;
    } catch (error) {
        return true;
    }
};

export default {
    setTokens,
    getToken,
    getRefreshToken,
    setUser,
    getUser,
    isAuthenticated,
    isAdmin,
    clearAuth,
    setToken,
    setRefreshToken,
    clearToken,
    getAuthHeader,
    isTokenExpired
};
