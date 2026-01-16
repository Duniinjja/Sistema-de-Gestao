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

  // Função para construir URL completa da foto
  const getFullPhotoUrl = useCallback((photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    return `${MEDIA_BASE_URL}${photoPath.startsWith('/') ? '' : '/'}${photoPath}`;
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

  // Obter URL completa da foto do usuário
  const getUserPhotoUrl = () => {
    return getFullPhotoUrl(user?.foto);
  };

  // Obter iniciais do usuário para avatar
  const getUserInitials = () => {
    const firstName = user?.first_name || user?.nome || '';
    const lastName = user?.last_name || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
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
