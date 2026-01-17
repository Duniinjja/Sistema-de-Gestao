import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  InputAdornment,
  FormControlLabel,
  Switch,
  Grow,
  Fade,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
  getProduto,
  createProduto,
  updateProduto,
} from '../services/api';

const CadastroProdutoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    codigo: '',
    preco: '',
    estoque: 0,
    ativo: true,
  });

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (id) {
      loadProduto();
    }
  }, [id]);

  const loadProduto = async () => {
    try {
      setLoading(true);
      const response = await getProduto(id);
      const produto = response.data;
      setFormData({
        nome: produto.nome || '',
        descricao: produto.descricao || '',
        codigo: produto.codigo || '',
        preco: produto.preco || '',
        estoque: produto.estoque || 0,
        ativo: produto.ativo !== undefined ? produto.ativo : true,
      });
    } catch (error) {
      toast.error('Erro ao carregar produto');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast.error('Nome do produto é obrigatório');
      return;
    }
    if (!formData.preco || parseFloat(formData.preco) < 0) {
      toast.error('Preço deve ser maior ou igual a zero');
      return;
    }

    try {
      setLoading(true);

      if (!user?.empresa_id) {
        toast.error('Usuário sem empresa vinculada');
        return;
      }

      const data = {
        ...formData,
        empresa: user.empresa_id,
      };

      if (id) {
        await updateProduto(id, data);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await createProduto(data);
        toast.success('Produto cadastrado com sucesso!');
      }
      navigate('/cadastros');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      const errorMessage = error.response?.data?.detail
        || error.response?.data?.message
        || Object.values(error.response?.data || {}).flat().join(', ')
        || error.message;
      toast.error('Erro ao salvar produto: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Fade in={mounted} timeout={300}>
      <Box>
        <Grow in={mounted} timeout={400}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/cadastros')}
              variant="outlined"
            >
              Voltar
            </Button>
            <InventoryIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4">
              {id ? 'Editar Produto' : 'Novo Produto'}
            </Typography>
          </Box>
        </Grow>

        <Grow in={mounted} timeout={500} style={{ transformOrigin: '0 0 0' }}>
          <Paper
            sx={{
              p: 3,
              boxShadow: mounted ? '0 8px 32px rgba(0, 0, 0, 0.1)' : 'none',
              transition: 'box-shadow 0.3s ease',
            }}
          >
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Nome */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome do Produto"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Camiseta Básica"
                  />
                </Grid>

                {/* Código */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Código"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleChange}
                    placeholder="Ex: PROD-001"
                  />
                </Grid>

                {/* Descrição */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder="Descrição detalhada do produto"
                  />
                </Grid>

                {/* Preço */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Preço"
                    name="preco"
                    type="number"
                    value={formData.preco}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">R$</InputAdornment>
                      ),
                    }}
                    inputProps={{
                      step: '0.01',
                      min: '0',
                    }}
                  />
                </Grid>

                {/* Estoque */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Estoque"
                    name="estoque"
                    type="number"
                    value={formData.estoque}
                    onChange={handleChange}
                    inputProps={{
                      min: '0',
                    }}
                  />
                </Grid>

                {/* Ativo */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.ativo}
                        onChange={handleChange}
                        name="ativo"
                        color="primary"
                      />
                    }
                    label="Produto Ativo"
                  />
                </Grid>

                {/* Botões */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/cadastros')}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={loading}
                    >
                      {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grow>
      </Box>
    </Fade>
  );
};

export default CadastroProdutoForm;
