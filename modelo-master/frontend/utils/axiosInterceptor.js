import axios from 'axios';

const setupAxiosInterceptors = () => {
  if (typeof window !== 'undefined') {
    axios.interceptors.request.use(
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

    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token expirado ou inválido
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          if (window.location.pathname !== '/login') {
             window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }
};

export default setupAxiosInterceptors;
