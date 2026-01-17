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
import { getVendas, deleteVenda } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFilter } from '../context/FilterContext';
import AdminFilters from '../components/AdminFilters';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Vendas = () => {
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
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendas();
  }, [selectedUsuario, selectedEmpresa, dataInicio, dataFim]);

  const loadVendas = async () => {
    try {
      setLoading(true);
      const params = getFilterParams(false);
      const response = await getVendas(params);
      let data = response.data.results || response.data;

      // Filtrar por período no frontend
      if (dataInicio && dataFim) {
        const dataInicioDate = new Date(dataInicio + 'T00:00:00');
        const dataFimDate = new Date(dataFim + 'T23:59:59');

        data = data.filter(v => {
          const dataVenda = new Date(v.data_venda);
          return dataVenda >= dataInicioDate && dataVenda <= dataFimDate;
        });
      }

      setVendas(data);
    } catch (error) {
      toast.error('Erro ao carregar vendas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta venda?')) {
      return;
    }

    try {
      await deleteVenda(id);
      toast.success('Venda excluída com sucesso!');
      loadVendas();
    } catch (error) {
      toast.error('Erro ao excluir venda');
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PAGA: 'success',
      PENDENTE: 'warning',
      CANCELADA: 'error',
    };
    return colors[status] || 'default';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Calcular total das vendas exibidas
  const totalVendas = vendas.reduce((sum, v) => sum + parseFloat(v.valor_final || 0), 0);

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
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Vendas</Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdminChefe() && getActiveFilterLabel() !== 'Visão Geral' && `${getActiveFilterLabel()} | `}
            Período: {getDateRangeLabel()}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/vendas/nova')}
        >
          Nova Venda
        </Button>
      </Box>

      {/* Filtros - com data e empresa */}
      <AdminFilters showUsuarioFilter={false} showEmpresaFilter={true} showDateFilter={true} />

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Valor Total</TableCell>
              <TableCell>Desconto</TableCell>
              <TableCell>Valor Final</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Nenhuma venda encontrada no período selecionado
                </TableCell>
              </TableRow>
            ) : (
              vendas.map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell>{venda.id}</TableCell>
                  <TableCell>{venda.cliente_nome}</TableCell>
                  <TableCell>
                    {format(new Date(venda.data_venda), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{formatCurrency(venda.valor_total)}</TableCell>
                  <TableCell>{formatCurrency(venda.desconto)}</TableCell>
                  <TableCell>{formatCurrency(venda.valor_final)}</TableCell>
                  <TableCell>
                    <Chip
                      label={venda.status}
                      color={getStatusColor(venda.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/vendas/editar/${venda.id}`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(venda.id)}
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

      {/* Total de Vendas - no final da página */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mt: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Total de Vendas no Período ({vendas.length} {vendas.length === 1 ? 'registro' : 'registros'})
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {formatCurrency(totalVendas)}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Vendas;
