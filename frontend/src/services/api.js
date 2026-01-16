import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se token expirou, tenta renovar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Se refresh falhar, redireciona para login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) =>
  api.post('/usuarios/login/', { email, password });

export const getCurrentUser = () =>
  api.get('/usuarios/me/');

// Empresas
export const getEmpresas = (params) =>
  api.get('/empresas/', { params });

export const getEmpresa = (id) =>
  api.get(`/empresas/${id}/`);

export const createEmpresa = (data) =>
  api.post('/empresas/', data);

export const updateEmpresa = (id, data) =>
  api.put(`/empresas/${id}/`, data);

export const deleteEmpresa = (id) =>
  api.delete(`/empresas/${id}/`);

export const getEmpresaDashboard = (id) =>
  api.get(`/empresas/${id}/dashboard/`);

// Usuários
export const getUsuarios = (params) =>
  api.get('/usuarios/', { params });

export const createUsuario = (data) =>
  api.post('/usuarios/', data);

export const updateUsuario = (id, data) =>
  api.put(`/usuarios/${id}/`, data);

export const deleteUsuario = (id) =>
  api.delete(`/usuarios/${id}/`);

export const changePassword = (id, data) =>
  api.post(`/usuarios/${id}/change_password/`, data);

export const getUsuario = (id) =>
  api.get(`/usuarios/${id}/`);

// Upload de foto de perfil - endpoint seguro que só altera a foto
export const uploadFotoPerfil = (id, formData) =>
  api.post(`/usuarios/${id}/upload_foto/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

// Remover foto de perfil
export const removeFotoPerfil = (id) =>
  api.delete(`/usuarios/${id}/upload_foto/`);

// Despesas
export const getDespesas = (params) =>
  api.get('/despesas/', { params });

export const getDespesa = (id) =>
  api.get(`/despesas/${id}/`);

export const createDespesa = (data) =>
  api.post('/despesas/', data);

export const updateDespesa = (id, data) =>
  api.put(`/despesas/${id}/`, data);

export const deleteDespesa = (id) =>
  api.delete(`/despesas/${id}/`);

export const getCategoriasDespesa = (params) =>
  api.get('/despesas/categorias/', { params });

// Vendas
export const getVendas = (params) =>
  api.get('/vendas/', { params });

export const getVenda = (id) =>
  api.get(`/vendas/${id}/`);

export const createVenda = (data) =>
  api.post('/vendas/', data);

export const updateVenda = (id, data) =>
  api.put(`/vendas/${id}/`, data);

export const deleteVenda = (id) =>
  api.delete(`/vendas/${id}/`);

export const getClientes = (params) =>
  api.get('/vendas/clientes/', { params });

export const getProdutos = (params) =>
  api.get('/vendas/produtos/', { params });

// Receitas
export const getReceitas = (params) =>
  api.get('/receitas/', { params });

export const getReceita = (id) =>
  api.get(`/receitas/${id}/`);

export const createReceita = (data) =>
  api.post('/receitas/', data);

export const updateReceita = (id, data) =>
  api.put(`/receitas/${id}/`, data);

export const deleteReceita = (id) =>
  api.delete(`/receitas/${id}/`);

export const getCategoriasReceita = (params) =>
  api.get('/receitas/categorias/', { params });

// Relatórios
export const getRelatorioFinanceiro = (params) =>
  api.get('/relatorios/financeiro/', { params });

export const getRelatorioConsolidado = (params) =>
  api.get('/relatorios/consolidado/', { params });

export default api;
