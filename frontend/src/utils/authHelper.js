import API from './api';

// Store user data in localStorage
const storeUserData = (data) => {
    try {
        localStorage.setItem('auth', JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error storing user data:', error);
        return false;
    }
};

// Get stored user data from localStorage
const getUserData = () => {
    try {
        const data = localStorage.getItem('auth');
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
};

// Get authentication token
const getToken = () => {
    const data = getUserData();
    return data ? data.token : null;
};

// Get user info
const getUserInfo = () => {
    const data = getUserData();
    return data ? data.user : null;
};

// Check if user is authenticated
const isAuthenticated = () => {
    return !!getToken();
};

// Clear user data from localStorage
const clearUserData = () => {
    try {
        localStorage.removeItem('auth');
        return true;
    } catch (error) {
        console.error('Error clearing user data:', error);
        return false;
    }
};

const loginUser = async (credentials) => {
    try {
        console.log("Logging in with credentials:", credentials);
        const response = await API.post("/users/login", credentials);

        // Store the complete response in localStorage
        storeUserData(response.data);

        // Check if this is a new user (coming from registration flow)
        const isNewUser = localStorage.getItem('isNewUser') === 'true';

        // Clear the flag after checking
        localStorage.removeItem('isNewUser');

        return {
            ...response.data,
            isNewUser
        };
    } catch (error) {
        throw error.response ? error.response.data : { message: "Network error" };
    }
};

const registerUser = async (userData) => {
    try {
        console.log("registering:", userData);
        const response = await API.post("/users/register", userData);
        // Store in localStorage that this is a new user
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
        const verifiedUser = response.data;

        // Store user data after successful OTP verification
        if (verifiedUser && verifiedUser.token) {
            storeUserData(verifiedUser);
            // Keep the isNewUser flag for the login redirect
            localStorage.setItem('isNewUser', 'true');
        }

        return verifiedUser;
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : { message: "Network error" };
    }
};

export {
    loginUser,
    registerUser,
    verifyOTP,
    storeUserData,
    getUserData,
    getToken,
    getUserInfo,
    isAuthenticated,
    clearUserData
};