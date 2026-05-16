import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Laravel backend URL
  headers: {
    'Accept': 'application/json',
  },
});

// Intercept requests to add the auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const STORAGE_URL = 'http://localhost:8000/storage';

export default apiClient;
