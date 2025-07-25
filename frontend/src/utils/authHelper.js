import API from './api';

const storeUserData = (token) => {
    try {
        localStorage.setItem('auth', JSON.stringify({ token }));
        return true;
    } catch (error) {
        console.error('Error storing auth token:', error);
        return false;
    }
};

const getUserData = () => {
    try {
        const data = localStorage.getItem('auth');
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting auth data:', error);
        return null;
    }
};

const getToken = () => {
    const data = getUserData();
    return data ? data.token : null;
};

const isAuthenticated = () => {
    return !!getToken();
};

const clearUserData = () => {
    try {
        localStorage.removeItem('auth');
        return true;
    } catch (error) {
        console.error('Error clearing auth data:', error);
        return false;
    }
};

const loginUser = async (credentials) => {
    try {
        console.log("Logging in with credentials:", credentials);
        const response = await API.post("/users/login", credentials);

        storeUserData(response.data.token);

        const isNewUser = localStorage.getItem('isNewUser') === 'true';
        localStorage.removeItem('isNewUser');

        return {
            success: response.data.success,
            message: response.data.message,
            isNewUser
        };
    } catch (error) {
        const errorWithStatus = new Error(error.response?.data?.message || "Network error");
        errorWithStatus.status = error.response?.status;
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
        const response = await API.post("/users/verify-otp", payload);

        if (response.data.success && response.data.token) {
            storeUserData(response.data.token);
            return response.data;
        }

        return response.data;
    } catch (error) {
        console.error("Error verifying OTP:", error);
        throw error;
    }
};

export {
    clearUserData,
    getToken,
    getUserData,
    isAuthenticated,
    loginUser,
    registerUser,
    verifyOTP
};