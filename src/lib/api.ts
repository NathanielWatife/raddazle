import axios from 'axios';

// Get API URL from env or default to localhost
const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchProducts = async () => {
  const { data } = await api.get('/products');
  return data.products || data; 
};

export const fetchProduct = async (idOrSlug: string) => {
  const { data } = await api.get(`/products/${idOrSlug}`);
  return data;
};

export const fetchCategories = async () => {
  const { data } = await api.get('/categories');
  return data;
};

// Auth API
export const login = async (credentials: any) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const register = async (userData: any) => {
  const { data } = await api.post('/auth/signup', userData);
  return data;
};

export const logout = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data.user;
};

// More API wrappers can be added here
