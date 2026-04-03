import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api'
});

// ✅ TOKEN FIX
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});



// If 401, clear storage and redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.log("API ERROR:", error.response?.status, error.config.url)
    
    if (error.response?.status === 401) {
      console.log("401 detected not loging out (debug mode)");
      
      // localStorage.removeItem('access_token')
      // localStorage.removeItem('user')
      // window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
