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
import { getReceitas, deleteReceita } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFilter } from '../context/FilterContext';
import AdminFilters from '../components/AdminFilters';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Receitas = () => {
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
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceitas();
  }, [selectedUsuario, selectedEmpresa, dataInicio, dataFim]);

  const loadReceitas = async () => {
    try {
      setLoading(true);
      const params = getFilterParams(false);
      const response = await getReceitas(params);
      let data = response.data.results || response.data;

      // Filtrar por período no frontend
      if (dataInicio && dataFim) {
        const dataInicioDate = new Date(dataInicio + 'T00:00:00');
        const dataFimDate = new Date(dataFim + 'T23:59:59');

        data = data.filter(r => {
          const dataPrevista = new Date(r.data_prevista);
          return dataPrevista >= dataInicioDate && dataPrevista <= dataFimDate;
        });
      }

      setReceitas(data);
    } catch (error) {
      toast.error('Erro ao carregar receitas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta receita?')) {
      return;
    }

    try {
      await deleteReceita(id);
      toast.success('Receita excluída com sucesso!');
      loadReceitas();
    } catch (error) {
      toast.error('Erro ao excluir receita');
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      RECEBIDA: 'success',
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

  // Calcular total das receitas exibidas
  const totalReceitas = receitas.reduce((sum, r) => sum + parseFloat(r.valor || 0), 0);

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
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Receitas</Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdminChefe() && getActiveFilterLabel() !== 'Visão Geral' && `${getActiveFilterLabel()} | `}
            Período: {getDateRangeLabel()}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/receitas/nova')}
        >
          Nova Receita
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
              <TableCell>Data Prevista</TableCell>
              <TableCell>Data Recebimento</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {receitas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhuma receita encontrada no período selecionado
                </TableCell>
              </TableRow>
            ) : (
              receitas.map((receita) => (
                <TableRow key={receita.id}>
                  <TableCell>{receita.descricao}</TableCell>
                  <TableCell>{receita.categoria_nome}</TableCell>
                  <TableCell>{formatCurrency(receita.valor)}</TableCell>
                  <TableCell>
                    {format(new Date(receita.data_prevista), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {receita.data_recebimento
                      ? format(new Date(receita.data_recebimento), 'dd/MM/yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={receita.status}
                      color={getStatusColor(receita.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/receitas/editar/${receita.id}`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(receita.id)}
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

      {/* Total de Receitas - no final da página */}
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
            Total de Receitas no Período ({receitas.length} {receitas.length === 1 ? 'registro' : 'registros'})
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
            {formatCurrency(totalReceitas)}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Receitas;
