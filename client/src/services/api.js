import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust this to your backend URL
});

API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

export default API;
