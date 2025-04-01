import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://event-management-for-college.onrender.com/api'
    : 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: import.meta.env.DEV 
        ? 'http://localhost:5000/api'  // Development server
        : 'https://event-management-for-college.onrender.com/api',  // Production server
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor
apiClient.interceptors.request.use(
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

// Add response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export const setAuthToken = (token) => {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
    }
};

export default apiClient;