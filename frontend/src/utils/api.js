import axios from 'axios';
import { getToken, setToken, clearToken, getRefreshToken, setRefreshToken } from './authHelper';


const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://localhost:3443/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});


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


API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    
                    clearToken();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL || 'https://localhost:3443/api'}/auth/refresh-token`,
                    { refreshToken },
                    { _retry: true, withCredentials: true }
                );

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                
                setToken(accessToken);
                setRefreshToken(newRefreshToken);

                
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                
                return API(originalRequest);
            } catch (error) {
                
                clearToken();
                
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default API;