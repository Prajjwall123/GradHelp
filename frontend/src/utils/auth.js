
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_INFO_KEY = 'user_info';


export const setTokens = (accessToken, refreshToken) => {
    if (accessToken) {
        sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
};


export const getToken = () => {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
};


export const getRefreshToken = () => {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
};


export const setUser = (user) => {
    if (user) {
        sessionStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
    }
};


export const getUser = () => {
    const user = sessionStorage.getItem(USER_INFO_KEY);
    return user ? JSON.parse(user) : null;
};


export const isAuthenticated = () => {
    return !!getToken();
};


export const isAdmin = () => {
    const user = getUser();
    return user?.role === 'admin';
};


export const clearAuth = () => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_INFO_KEY);
};


export const setToken = (token) => {
    if (token) {
        sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
};


export const setRefreshToken = (token) => {
    if (token) {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
};


export const clearToken = () => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};


export const getAuthHeader = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};


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
