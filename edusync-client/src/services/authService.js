import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5244/api',
  withCredentials: true
});

// Function to set the auth header (now used only internally by the interceptor)
const setAuthHeader = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
};

// Add a request interceptor to set the auth header before every request
apiClient.interceptors.request.use(
  (config) => setAuthHeader(config),
  (error) => Promise.reject(error)
);

export const login = (email, password) => {
  return apiClient.post('/auth/login', { email, password });
};

export const register = (name, email, password, role) => {
  return apiClient.post('/auth/register', { name, email, password, role });
};

export const logout = () => {
  localStorage.removeItem('token');
  return apiClient.post('/auth/logout');
};

export const getCurrentUser = () => {
  return apiClient.get('/users/me');
};

export default apiClient;