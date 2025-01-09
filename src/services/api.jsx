import axios from 'axios';

const API = axios.create({
    baseURL: 'https://modernbakery.shop/', // Correct base URL with protocol
});



export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);

