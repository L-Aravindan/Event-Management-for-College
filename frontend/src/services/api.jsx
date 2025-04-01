import axios from 'axios';

// Base URL for your backend API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.onrender.com/api'
    : 'http://localhost:5000/api';

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.log('Token expired or invalid. Redirecting to login...');
            localStorage.removeItem('token');
            window.location.href = '/'; // Redirect to login
        }
        return Promise.reject(error);
    }
);

// Create an Axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


// Function to set JWT token in headers
export const setAuthToken = (token) => {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
    }
};

// Export the Axios instance
export default apiClient;