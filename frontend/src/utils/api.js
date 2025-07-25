import axios from "axios";
import { getToken } from "./authHelper";

const API = axios.create({
    baseURL: "https://localhost:3443/api/",
    withCredentials: true
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

export default API;