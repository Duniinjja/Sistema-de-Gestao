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
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Vendas = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendas();
  }, []);

  const loadVendas = async () => {
    try {
      setLoading(true);
      const params = user.empresa_id ? { empresa: user.empresa_id } : {};
      const response = await getVendas(params);
      setVendas(response.data.results || response.data);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Vendas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/vendas/nova')}
        >
          Nova Venda
        </Button>
      </Box>

      <TableContainer component={Paper}>
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
                  Nenhuma venda encontrada
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
    </Box>
  );
};

export default Vendas;
