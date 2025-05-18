import axios from 'axios';

const API_URL = 'http://10.119.33.100/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for authentication if needed
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// Add response interceptor for error handling
api.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
        // Log errors or perform global error handling
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);
