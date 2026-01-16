import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getEmpresas, getUsuarios } from '../services/api';

const FilterContext = createContext();

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

// Função para obter datas padrão (primeiro e último dia do mês atual)
const getDefaultDates = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    dataInicio: firstDay.toISOString().split('T')[0],
    dataFim: lastDay.toISOString().split('T')[0],
  };
};

export const FilterProvider = ({ children }) => {
  const { user, isAdminChefe } = useAuth();

  // Estados dos filtros
  const [selectedUsuario, setSelectedUsuario] = useState('todos');
  const [selectedEmpresa, setSelectedEmpresa] = useState('todos');

  // Filtro de data
  const defaultDates = getDefaultDates();
  const [dataInicio, setDataInicio] = useState(defaultDates.dataInicio);
  const [dataFim, setDataFim] = useState(defaultDates.dataFim);

  // Listas para os selects
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(true);

  // Carregar dados para os filtros quando o usuário for Admin Chefe
  useEffect(() => {
    // Verificar se user existe e é Admin Chefe
    if (user && isAdminChefe && isAdminChefe()) {
      loadFilterData();
    } else {
      setLoadingFilters(false);
    }
  }, [user]);

  const loadFilterData = async () => {
    try {
      setLoadingFilters(true);
      const [empresasRes, usuariosRes] = await Promise.all([
        getEmpresas().catch(() => ({ data: [] })),
        getUsuarios().catch(() => ({ data: [] })),
      ]);

      setEmpresas(empresasRes.data.results || empresasRes.data || []);
      setUsuarios(usuariosRes.data.results || usuariosRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados de filtros:', error);
    } finally {
      setLoadingFilters(false);
    }
  };

  // Função para obter parâmetros de filtro para as APIs
  const getFilterParams = (includeDate = true) => {
    const params = {};

    // Verificar se isAdminChefe existe e retorna true
    const isAdmin = isAdminChefe && isAdminChefe();

    // Se não for Admin Chefe, usa a empresa do usuário
    if (!isAdmin) {
      if (user?.empresa_id) {
        params.empresa = user.empresa_id;
      }
    } else {
      // Admin Chefe pode filtrar por empresa
      if (selectedEmpresa !== 'todos') {
        params.empresa = selectedEmpresa;
      }
      // Nota: O filtro de usuário (usuario_cadastro) não é enviado para API
      // pois o filtro é feito visualmente no frontend se necessário
    }

    // Nota: filtro de data é aplicado no frontend, não enviamos para a API
    // pois o backend usa campos específicos (data_vencimento, data_venda, etc.)

    return params;
  };

  // Função para resetar filtros
  const resetFilters = () => {
    setSelectedUsuario('todos');
    setSelectedEmpresa('todos');
    const defaults = getDefaultDates();
    setDataInicio(defaults.dataInicio);
    setDataFim(defaults.dataFim);
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = () => {
    const defaults = getDefaultDates();
    return (
      selectedUsuario !== 'todos' ||
      selectedEmpresa !== 'todos' ||
      dataInicio !== defaults.dataInicio ||
      dataFim !== defaults.dataFim
    );
  };

  // Obter nome do filtro ativo para exibição
  const getActiveFilterLabel = () => {
    const labels = [];

    if (selectedUsuario !== 'todos') {
      const usuarioObj = usuarios.find(u => u.id === parseInt(selectedUsuario));
      if (usuarioObj) {
        labels.push(`Usuário: ${usuarioObj.nome || usuarioObj.email}`);
      }
    }

    if (selectedEmpresa !== 'todos') {
      const empresaObj = empresas.find(e => e.id === parseInt(selectedEmpresa));
      if (empresaObj) {
        labels.push(`Empresa: ${empresaObj.nome}`);
      }
    }

    return labels.length > 0 ? labels.join(' | ') : 'Visão Geral';
  };

  // Formatar período de data para exibição
  const getDateRangeLabel = () => {
    if (!dataInicio || !dataFim) return '';

    const formatDate = (dateStr) => {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('pt-BR');
    };

    return `${formatDate(dataInicio)} até ${formatDate(dataFim)}`;
  };

  const value = {
    // Estados
    selectedUsuario,
    setSelectedUsuario,
    selectedEmpresa,
    setSelectedEmpresa,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    usuarios,
    empresas,
    loadingFilters,

    // Funções
    getFilterParams,
    resetFilters,
    hasActiveFilters,
    getActiveFilterLabel,
    getDateRangeLabel,
    reloadFilterData: loadFilterData,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};
