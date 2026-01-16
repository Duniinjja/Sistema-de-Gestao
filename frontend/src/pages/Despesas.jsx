import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { getDespesas, deleteDespesa } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFilter } from '../context/FilterContext';
import AdminFilters from '../components/AdminFilters';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Despesas = () => {
  const navigate = useNavigate();
  const { isAdminChefe } = useAuth();
  const {
    getFilterParams,
    selectedUsuario,
    selectedEmpresa,
    dataInicio,
    dataFim,
    getActiveFilterLabel,
    getDateRangeLabel,
  } = useFilter();
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDespesas();
  }, [selectedUsuario, selectedEmpresa, dataInicio, dataFim]);

  const loadDespesas = async () => {
    try {
      setLoading(true);
      const params = getFilterParams(false); // Não inclui data nos params da API
      const response = await getDespesas(params);
      let data = response.data.results || response.data;

      // Garantir que data é um array
      if (!Array.isArray(data)) {
        data = [];
      }

      // Filtrar por período no frontend
      if (dataInicio && dataFim) {
        const dataInicioDate = new Date(dataInicio + 'T00:00:00');
        const dataFimDate = new Date(dataFim + 'T23:59:59');

        data = data.filter(d => {
          const dataVencimento = new Date(d.data_vencimento);
          return dataVencimento >= dataInicioDate && dataVencimento <= dataFimDate;
        });
      }

      setDespesas(data);
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
      toast.error('Erro ao carregar despesas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      return;
    }

    try {
      await deleteDespesa(id);
      toast.success('Despesa excluída com sucesso!');
      loadDespesas();
    } catch (error) {
      toast.error('Erro ao excluir despesa');
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PAGA: 'success',
      PENDENTE: 'warning',
      VENCIDA: 'error',
      CANCELADA: 'default',
    };
    return colors[status] || 'default';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Calcular total das despesas exibidas
  const totalDespesas = despesas.reduce((sum, d) => sum + parseFloat(d.valor || 0), 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Despesas</Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdminChefe() && getActiveFilterLabel() !== 'Visão Geral' && `${getActiveFilterLabel()} | `}
            Período: {getDateRangeLabel()}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/despesas/nova')}
        >
          Nova Despesa
        </Button>
      </Box>

      {/* Filtros - com data e empresa */}
      <AdminFilters showUsuarioFilter={false} showEmpresaFilter={true} showDateFilter={true} />

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Descrição</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Vencimento</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Forma Pgto</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {despesas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhuma despesa encontrada no período selecionado
                </TableCell>
              </TableRow>
            ) : (
              despesas.map((despesa) => (
                <TableRow key={despesa.id}>
                  <TableCell>{despesa.descricao}</TableCell>
                  <TableCell>{despesa.categoria_nome}</TableCell>
                  <TableCell>{formatCurrency(despesa.valor)}</TableCell>
                  <TableCell>
                    {format(new Date(despesa.data_vencimento), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={despesa.status}
                      color={getStatusColor(despesa.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{despesa.forma_pagamento}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/despesas/editar/${despesa.id}`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(despesa.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Total de Despesas - no final da página */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Total de Despesas no Período ({despesas.length} {despesas.length === 1 ? 'registro' : 'registros'})
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
            {formatCurrency(totalDespesas)}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Despesas;
