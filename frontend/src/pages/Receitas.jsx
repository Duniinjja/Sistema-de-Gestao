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
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Receitas = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceitas();
  }, []);

  const loadReceitas = async () => {
    try {
      setLoading(true);
      const params = user.empresa_id ? { empresa: user.empresa_id } : {};
      const response = await getReceitas(params);
      setReceitas(response.data.results || response.data);
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
        <Typography variant="h4">Receitas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/receitas/nova')}
        >
          Nova Receita
        </Button>
      </Box>

      <TableContainer component={Paper}>
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
                  Nenhuma receita encontrada
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
    </Box>
  );
};

export default Receitas;
