import axios from 'axios';

const API_URL = import.meta.env.VITE_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Assuming the token is stored under 'token' key
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

// Add and export the signup function
export const signup = (userData) => {
  // Assuming the signup endpoint is /auth/signup and it expects user data in the body
  // The structure of userData should match the backend's RegisterUserDto
  return api.post('/auth/signup', userData);
};


export default api;
