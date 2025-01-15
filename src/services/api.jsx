import axios from 'axios';
import config from '../config';

const API = axios.create({
    baseURL: config.API_URL,
});

export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);
