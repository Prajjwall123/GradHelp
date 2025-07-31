import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import {
    getToken,
    getUser,
    clearUserData,
    isAuthenticated
} from '../utils/authHelper';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                if (isAuthenticated()) {
                    const userData = getUser();
                    if (userData) {
                        setCurrentUser(userData);
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                if (error.response?.status === 401) {
                    clearUserData();
                    setCurrentUser(null);
                }
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = (userData) => {
        setCurrentUser(userData);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearUserData();
            setCurrentUser(null);
        }
    };

    const updateUser = (userData) => {
        const updatedUser = {
            ...currentUser,
            ...userData
        };
        setCurrentUser(updatedUser);
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;