import axios from 'axios';

<<<<<<< HEAD
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
=======
/**
 * Configura os interceptors do axios para adicionar automaticamente
 * o token de autenticação nas requisições e tratar erros de autenticação
 */
export default function setupAxiosInterceptors() {
  // Interceptor de requisição: adiciona o token em todas as requisições
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

  // Interceptor de resposta: trata erros de autenticação
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Se receber 401 (não autorizado), limpa os dados de autenticação
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        
        // Redireciona para a página de login se não estiver já lá
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
      
      return Promise.reject(error);
    }
  );
}
>>>>>>> 2b99da440d03a4eb49a87e5b3ba0368d3658542b
