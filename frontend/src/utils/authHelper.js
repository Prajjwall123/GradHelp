import API from './api';


const storeUserData = (data) => {
    try {
        localStorage.setItem('auth', JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error storing user data:', error);
        return false;
    }
};


const getUserData = () => {
    try {
        const data = localStorage.getItem('auth');
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
};


const getToken = () => {
    const data = getUserData();
    return data ? data.token : null;
};


const getUserInfo = () => {
    const data = getUserData();
    return data ? data.user : null;
};


const isAuthenticated = () => {
    return !!getToken();
};


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

        
        storeUserData(response.data);

        
        const isNewUser = localStorage.getItem('isNewUser') === 'true';

        
        localStorage.removeItem('isNewUser');

        return {
            ...response.data,
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
        const verifiedUser = response.data;

        
        if (verifiedUser && verifiedUser.token) {
            storeUserData(verifiedUser);
            
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