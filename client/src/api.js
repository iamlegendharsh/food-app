import axios from 'axios';

const API_URL = "https://food-app-wis9.onrender.com";

const API = axios.create({ baseURL: API_URL });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
