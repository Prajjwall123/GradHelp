import API from './api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Cookie helper functions
const setCookie = (name, value, days = 30) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict;Secure`;
};

const getCookie = (name) => {
    const cookieName = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return '';
};

const deleteCookie = (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
};

// Store access token
const storeAccessToken = (token) => {
    try {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
        return true;
    } catch (error) {
        console.error('Error storing access token:', error);
        return false;
    }
};

// Get access token
const getToken = () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Set access token (alias for storeAccessToken for backward compatibility)
const setToken = (token) => storeAccessToken(token);

// Get refresh token from cookie
const getRefreshToken = () => {
    return getCookie(REFRESH_TOKEN_KEY);
};

// Set refresh token in HTTP-only cookie
const setRefreshToken = (token) => {
    if (!token) return false;
    try {
        setCookie(REFRESH_TOKEN_KEY, token, 30); // 30 days expiry
        return true;
    } catch (error) {
        console.error('Error storing refresh token:', error);
        return false;
    }
};

// Check if user is authenticated
const isAuthenticated = () => {
    return !!getToken();
};

const clearUserData = () => {
    try {
        // Clear access token from localStorage
        localStorage.removeItem(ACCESS_TOKEN_KEY);

        // Clear refresh token from cookies
        deleteCookie(REFRESH_TOKEN_KEY);

        return true;
    } catch (error) {
        console.error('Error clearing auth data:', error);
        return false;
    }
};

const loginUser = async (credentials) => {
    try {
        console.log("Logging in with credentials:", credentials);
        const response = await API.post("/auth/login", credentials);

        if (response.data && response.data.access_token && response.data.refresh_token) {
            // Store access token in localStorage
            setToken(response.data.access_token);

            // Store refresh token in HTTP-only cookie
            setRefreshToken(response.data.refresh_token);

            const isNewUser = localStorage.getItem('isNewUser') === 'true';
            localStorage.removeItem('isNewUser');

            return {
                success: true,
                message: 'Login successful',
                user: response.data.user,
                isNewUser
            };
        }

        throw new Error('Invalid response from server');

    } catch (error) {
        const errorWithStatus = new Error(error.response?.data?.message || error.message || "Login failed");
        errorWithStatus.status = error.response?.status || 500;
        errorWithStatus.response = error.response;
        throw errorWithStatus;
    }
};

const registerUser = async (userData) => {
    try {
        console.log("registering:", userData);
        const response = await API.post("/users/register", userData);

        localStorage.setItem('isNewUser', 'true');
        return response.data;
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }
};

const verifyOTP = async (payload) => {
    try {
        const response = await API.post("/auth/verify-otp", payload);

        if (response.data && response.data.access_token && response.data.refresh_token) {
            // Store access token in localStorage
            setToken(response.data.access_token);

            // Store refresh token in HTTP-only cookie
            setRefreshToken(response.data.refresh_token);

            return {
                success: true,
                message: 'OTP verified successfully',
                user: response.data.user
            };
        }

        throw new Error('Invalid OTP or session expired');

    } catch (error) {
        console.error("Error verifying OTP:", error);
        const errorWithStatus = new Error(error.response?.data?.message || error.message || "OTP verification failed");
        errorWithStatus.status = error.response?.status || 500;
        errorWithStatus.response = error.response;
        throw errorWithStatus;
    }
};

// Get current user from token (minimal implementation)
const getUser = () => {
    const token = getToken();
    if (!token) return null;

    try {
        // Extract user info from token (only non-sensitive data)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role
            // Add other non-sensitive claims as needed
        };
    } catch (error) {
        console.error('Error parsing token:', error);
        return null;
    }
};

// Export all functions
export {
    clearUserData,
    clearUserData as clearToken, // Alias for compatibility
    getToken,
    getRefreshToken,
    getUser,
    isAuthenticated,
    loginUser,
    registerUser,
    setToken,
    setRefreshToken,
    verifyOTP
};