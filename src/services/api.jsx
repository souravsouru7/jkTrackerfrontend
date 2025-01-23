import axios from 'axios';
import config from '../config';

const API = axios.create({
    baseURL: config.API_URL,
});

// Add a request interceptor
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);

// Export the API instance
export default API;
