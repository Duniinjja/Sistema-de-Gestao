import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login as apiLogin, getCurrentUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// URL base para mídia
const MEDIA_BASE_URL = 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para construir URL completa da foto (com validação robusta)
  const getFullPhotoUrl = useCallback((photoPath) => {
    // Validação rigorosa - retorna null se não for uma string válida
    if (!photoPath || typeof photoPath !== 'string' || photoPath.trim() === '') {
      return null;
    }

    try {
      // Se já é uma URL completa, retorna como está
      if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
        return photoPath;
      }
      // Constrói a URL completa
      const separator = photoPath.startsWith('/') ? '' : '/';
      return `${MEDIA_BASE_URL}${separator}${photoPath}`;
    } catch (error) {
      console.error('Erro ao processar URL da foto:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    // Verifica se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    if (savedUser && token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Verifica se o token não expirou
        if (decoded.exp > currentTime) {
          const parsedUser = JSON.parse(savedUser);
          // Atualiza dados do servidor para ter as informações mais recentes
          fetchCurrentUser(parsedUser);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      }
    }

    setLoading(false);
  }, []);

  // Buscar dados atuais do usuário no servidor
  const fetchCurrentUser = async (fallbackUser = null) => {
    try {
      const response = await getCurrentUser();
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      if (fallbackUser) {
        setUser(fallbackUser);
      }
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      const { access, refresh, user: userData } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Erro ao fazer login',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Atualizar dados do usuário (busca do servidor e atualiza estado)
  const updateUser = async () => {
    return await fetchCurrentUser();
  };

  // Atualizar dados locais do usuário imediatamente (sem fetch)
  const updateUserLocal = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Obter URL completa da foto do usuário (com fallback seguro)
  const getUserPhotoUrl = () => {
    try {
      const foto = user?.foto;
      // Verifica se foto existe e é uma string válida
      if (foto && typeof foto === 'string' && foto.trim() !== '') {
        return getFullPhotoUrl(foto);
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter URL da foto:', error);
      return null;
    }
  };

  // Obter iniciais do usuário para avatar (com fallback seguro)
  const getUserInitials = () => {
    try {
      const firstName = user?.first_name || user?.nome || '';
      const lastName = user?.last_name || '';

      if (typeof firstName === 'string' && firstName.length > 0) {
        if (typeof lastName === 'string' && lastName.length > 0) {
          return `${firstName[0]}${lastName[0]}`.toUpperCase();
        }
        return firstName.substring(0, 2).toUpperCase();
      }

      if (user?.email && typeof user.email === 'string') {
        return user.email.substring(0, 2).toUpperCase();
      }

      return 'U';
    } catch (error) {
      console.error('Erro ao obter iniciais:', error);
      return 'U';
    }
  };

  const isAdminChefe = () => user?.tipo_usuario === 'ADMIN_CHEFE';
  const isAdminEmpresa = () => user?.tipo_usuario === 'ADMIN_EMPRESA';
  const isUsuarioEmpresa = () => user?.tipo_usuario === 'USUARIO_EMPRESA';

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    updateUserLocal,
    getUserPhotoUrl,
    getUserInitials,
    getFullPhotoUrl,
    isAdminChefe,
    isAdminEmpresa,
    isUsuarioEmpresa,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
