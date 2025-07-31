import axios from 'axios';
import { getToken, setToken, clearToken, getRefreshToken, setRefreshToken } from '../utils/auth';


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://localhost:3443/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});


api.interceptors.request.use(
    (config) => {
        const token = getToken();
        const csrfToken = sessionStorage.getItem('csrfToken');






        if (token) {
            config.headers.Authorization = `Bearer ${token}`;

        } else {
            console.warn('No token found for request to', config.url);
        }


        if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
            config.headers['X-CSRF-Token'] = csrfToken;

        }

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);


api.interceptors.response.use(
    (response) => {




        const csrfToken = response.headers['x-csrf-token'];
        if (csrfToken) {
            sessionStorage.setItem('csrfToken', csrfToken);

        }
        return response;
    },
    async (error) => {
        console.error('API Error:', error);
        console.error('API Error Response:', error.response);

        const originalRequest = error.config;


        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = getRefreshToken();
                if (!refreshToken) {

                    clearToken();
                    sessionStorage.removeItem('csrfToken');

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


                const csrfToken = response.headers['x-csrf-token'];
                if (csrfToken) {
                    sessionStorage.setItem('csrfToken', csrfToken);
                    originalRequest.headers['X-CSRF-Token'] = csrfToken;
                }


                return api(originalRequest);
            } catch (error) {

                clearToken();
                sessionStorage.removeItem('csrfToken');

                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
