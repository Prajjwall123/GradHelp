import API from './api';


const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';


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


const storeAccessToken = (token) => {
    try {
        sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
        return true;
    } catch (error) {
        console.error('Error storing access token:', error);
        return false;
    }
};


const getToken = () => {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
};


const setToken = (token) => storeAccessToken(token);


const getRefreshToken = () => {
    return getCookie(REFRESH_TOKEN_KEY);
};


const setRefreshToken = (token) => {
    if (!token) return false;
    try {
        setCookie(REFRESH_TOKEN_KEY, token, 30);
        return true;
    } catch (error) {
        console.error('Error storing refresh token:', error);
        return false;
    }
};


const isAuthenticated = () => {
    return !!getToken();
};

const clearUserData = () => {
    try {

        sessionStorage.removeItem(ACCESS_TOKEN_KEY);


        deleteCookie(REFRESH_TOKEN_KEY);

        return true;
    } catch (error) {
        console.error('Error clearing auth data:', error);
        return false;
    }
};


export const fetchCSRFToken = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3443/api'}/auth/csrf-token`, {
            credentials: 'include',
        });
        const data = await response.json();
        if (data.csrfToken) {
            sessionStorage.setItem('csrfToken', data.csrfToken);
            return data.csrfToken;
        }

        const headerToken = response.headers.get('X-CSRF-Token');
        if (headerToken) {
            sessionStorage.setItem('csrfToken', headerToken);
            return headerToken;
        }
        throw new Error('CSRF token not found');
    } catch (err) {
        console.error('Failed to fetch CSRF token:', err);
        throw err;
    }
};

const loginUser = async (credentials) => {
    try {

        await fetchCSRFToken();


        const response = await API.post("/auth/login", credentials);

        if (response.data && response.data.access_token && response.data.refresh_token) {

            setToken(response.data.access_token);


            setRefreshToken(response.data.refresh_token);

            const isNewUser = sessionStorage.getItem('isNewUser') === 'true';
            sessionStorage.removeItem('isNewUser');


            const userData = getUser();

            return {
                success: true,
                message: 'Login successful',
                user: userData,
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

        const response = await API.post("/users/register", userData);

        sessionStorage.setItem('isNewUser', 'true');
        return response.data;
    } catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }
};

const verifyOTP = async (payload) => {
    try {
        const response = await API.post("/auth/verify-otp", payload);

        if (response.data && response.data.success) {

            if (response.data.message === "Registration successful") {
                return {
                    success: true,
                    redirectTo: '/login',
                    message: response.data.message
                };
            }


            if (response.data.access_token && response.data.refresh_token) {

                setToken(response.data.access_token);

                setRefreshToken(response.data.refresh_token);

                const userData = getUser();

                return {
                    success: true,
                    message: 'OTP verified successfully',
                    user: userData
                };
            }
        }

        throw new Error(response.data?.message || 'Invalid OTP or session expired');

    } catch (error) {
        console.error("Error verifying OTP:", error);
        const errorWithStatus = new Error(error.response?.data?.message || error.message || "OTP verification failed");
        errorWithStatus.status = error.response?.status || 500;
        errorWithStatus.response = error.response;
        throw errorWithStatus;
    }
};


const getUser = () => {
    const token = getToken();
    if (!token) return null;

    try {

        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,

        };
    } catch (error) {
        console.error('Error parsing token:', error);
        return null;
    }
};



const setUser = () => {
    console.warn('setUser is deprecated. User data is now only stored in the token.');
    return true;
};


export {
    clearUserData,
    clearUserData as clearToken,
    getToken,
    getRefreshToken,
    getUser,
    isAuthenticated,
    loginUser,
    registerUser,
    setToken,
    setRefreshToken,
    setUser,
    verifyOTP
};