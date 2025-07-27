import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api'; // Use the consolidated API client
import { 
    getToken, 
    getUserData, 
    setUser as setUserData, 
    clearUserData, 
    isAuthenticated 
} from '../utils/authHelper';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                if (isAuthenticated()) {
                    // Get user data from storage
                    const userData = getUserData();
                    if (userData) {
                        setCurrentUser(userData.user);
                    }
                    
                    // Optionally validate token with backend
                    // const { data } = await api.get('/auth/me');
                    // setCurrentUser(data.user);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                if (error.response?.status === 401) {
                    // Token is invalid, clear auth data
                    clearUserData();
                    setCurrentUser(null);
                }
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Login function
    const login = (userData) => {
        setCurrentUser(userData);
        // User data is already stored in authHelper's storeUserData
    };

    // Logout function
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear auth state regardless of API call result
            clearUserData();
            setCurrentUser(null);
        }
        // Note: Navigation is now handled in the component
    };

    // Update user data
    const updateUser = (userData) => {
        const updatedUser = {
            ...currentUser,
            ...userData
        };
        setCurrentUser(updatedUser);
        
        // Update user data in storage
        const token = getToken();
        if (token) {
            storeUserData(token, updatedUser);
        }
    };

    const value = {
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'admin',
        loading,
        login,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;