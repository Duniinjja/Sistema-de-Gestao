import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Grid,
  Grow,
  Fade,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import {
  getCategoria,
  createCategoria,
  updateCategoria,
} from '../services/api';

const CadastroCategoriaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdminChefe } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'DESPESA',
    ativa: true,
    cor: '#1976d2',
    icone: '',
    ordem: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Verificar se é Admin Chefe
    if (!isAdminChefe()) {
      toast.error('Acesso negado. Apenas Admin Chefe pode gerenciar categorias.');
      navigate('/cadastros');
      return;
    }

    if (id) {
      loadCategoria();
    }
  }, [id]);

  const loadCategoria = async () => {
    try {
      setLoading(true);
      const response = await getCategoria(id);
      const categoria = response.data;
      setFormData({
        nome: categoria.nome || '',
        descricao: categoria.descricao || '',
        tipo: categoria.tipo || 'AMBOS',
        ativa: categoria.ativa !== undefined ? categoria.ativa : true,
        cor: categoria.cor || '#1976d2',
        icone: categoria.icone || '',
        ordem: categoria.ordem || 0,
      });
    } catch (error) {
      toast.error('Erro ao carregar categoria');
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

    // Validações
    if (!formData.nome || !formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!formData.tipo) {
      toast.error('Tipo é obrigatório');
      return;
    }

    try {
      setLoading(true);

      const data = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        tipo: formData.tipo,
        ativa: formData.ativa,
        cor: formData.cor,
        icone: formData.icone.trim(),
        ordem: parseInt(formData.ordem) || 0,
      };

      if (id) {
        await updateCategoria(id, data);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await createCategoria(data);
        toast.success('Categoria cadastrada com sucesso!');
      }
      navigate('/cadastros');
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      const errorMessage = error.response?.data?.nome?.[0]
        || error.response?.data?.detail
        || error.response?.data?.error
        || 'Erro ao salvar categoria';
      toast.error(errorMessage);
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/cadastros')}
              sx={{ mr: 2 }}
            >
              Voltar
            </Button>
            <Typography variant="h4">
              {id ? 'Editar Categoria' : 'Nova Categoria'}
            </Typography>
          </Box>
        </Grow>

        <Grow in={mounted} timeout={500}>
          <Paper sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Alimentação, Transporte, Salários..."
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Tipo de Categoria</InputLabel>
                    <Select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      label="Tipo de Categoria"
                    >
                      <MenuItem value="DESPESA">Categoria de Despesa</MenuItem>
                      <MenuItem value="RECEITA">Categoria de Receita</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder="Descrição opcional da categoria..."
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Cor"
                    name="cor"
                    type="color"
                    value={formData.cor}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& input': {
                        height: 50,
                        cursor: 'pointer',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Ícone (Material Icons)"
                    name="icone"
                    value={formData.icone}
                    onChange={handleChange}
                    placeholder="Ex: shopping_cart, home, work..."
                    helperText="Nome do ícone do Material Icons"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Ordem de Exibição"
                    name="ordem"
                    type="number"
                    value={formData.ordem}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 0 } }}
                    helperText="Menor número aparece primeiro"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.ativa}
                        onChange={handleChange}
                        name="ativa"
                        color="primary"
                      />
                    }
                    label="Categoria Ativa"
                  />
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', ml: 6 }}>
                    Categorias inativas não aparecem nos selects de despesas e receitas
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/cadastros')}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={loading}
                    >
                      {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grow>

        {/* Preview da categoria */}
        <Grow in={mounted} timeout={600}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: formData.cor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {formData.nome || 'Nome da Categoria'}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {formData.tipo === 'DESPESA' ? 'Categoria de Despesa' : 'Categoria de Receita'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grow>
      </Box>
    </Fade>
  );
};

export default CadastroCategoriaForm;
