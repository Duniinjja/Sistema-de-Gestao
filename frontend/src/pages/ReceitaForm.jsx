import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  InputAdornment,
  Grow,
  Fade,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
  getReceita,
  createReceita,
  updateReceita,
  getCategoriasParaReceitas,
} from '../services/api';

const ReceitaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    descricao: '',
    categoria: '',
    valor: '',
    data_prevista: '',
    data_recebimento: '',
    status: 'PENDENTE',
    forma_recebimento: 'DINHEIRO',
    observacoes: '',
  });

  useEffect(() => {
    // Ativa animação de entrada
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    loadCategorias();
    if (id) {
      loadReceita();
    }
  }, [id]);

  const loadCategorias = async () => {
    try {
      const response = await getCategoriasParaReceitas();
      setCategorias(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias: ' + (error.response?.data?.message || error.message));
    }
  };

  const loadReceita = async () => {
    try {
      setLoading(true);
      const response = await getReceita(id);
      const receita = response.data;
      setFormData({
        descricao: receita.descricao || '',
        categoria: receita.categoria || '',
        valor: receita.valor || '',
        data_prevista: receita.data_prevista || '',
        data_recebimento: receita.data_recebimento || '',
        status: receita.status || 'PENDENTE',
        forma_recebimento: receita.forma_recebimento || 'DINHEIRO',
        observacoes: receita.observacoes || '',
      });
    } catch (error) {
      toast.error('Erro ao carregar receita');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (!formData.descricao.trim()) {
      toast.error('Descrição é obrigatória');
      return;
    }
    if (!formData.categoria) {
      toast.error('Categoria é obrigatória');
      return;
    }
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      toast.error('Valor deve ser maior que zero');
      return;
    }
    if (!formData.data_prevista) {
      toast.error('Data prevista é obrigatória');
      return;
    }

    try {
      setLoading(true);
      const data = {
        ...formData,
        empresa: user.empresa_id,
        usuario_cadastro: user.id,
      };

      if (id) {
        await updateReceita(id, data);
        toast.success('Receita atualizada com sucesso!');
      } else {
        await createReceita(data);
        toast.success('Receita cadastrada com sucesso!');
      }
      navigate('/receitas');
    } catch (error) {
      toast.error('Erro ao salvar receita');
      console.error(error);
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
              onClick={() => navigate('/receitas')}
              variant="outlined"
            >
              Voltar
            </Button>
            <Typography variant="h4">
              {id ? 'Editar Receita' : 'Nova Receita'}
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
            {/* Descrição */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                required
                placeholder="Ex: Pagamento Cliente XYZ"
              />
            </Grid>

            {/* Categoria */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Categoria</InputLabel>
                <Select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  label="Categoria"
                >
                  {categorias.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Valor */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Valor"
                name="valor"
                type="number"
                value={formData.valor}
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

            {/* Data Prevista */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data Prevista"
                name="data_prevista"
                type="date"
                value={formData.data_prevista}
                onChange={handleChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Data Recebimento */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Recebimento"
                name="data_recebimento"
                type="date"
                value={formData.data_recebimento}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                helperText="Deixe em branco se ainda não foi recebido"
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="PENDENTE">Pendente</MenuItem>
                  <MenuItem value="RECEBIDA">Recebida</MenuItem>
                  <MenuItem value="CANCELADA">Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Forma de Recebimento */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Forma de Recebimento</InputLabel>
                <Select
                  name="forma_recebimento"
                  value={formData.forma_recebimento}
                  onChange={handleChange}
                  label="Forma de Recebimento"
                >
                  <MenuItem value="DINHEIRO">Dinheiro</MenuItem>
                  <MenuItem value="PIX">PIX</MenuItem>
                  <MenuItem value="CARTAO_CREDITO">Cartão de Crédito</MenuItem>
                  <MenuItem value="CARTAO_DEBITO">Cartão de Débito</MenuItem>
                  <MenuItem value="BOLETO">Boleto</MenuItem>
                  <MenuItem value="TRANSFERENCIA">Transferência</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Observações */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Informações adicionais sobre a receita"
              />
            </Grid>

            {/* Botões */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/receitas')}
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

export default ReceitaForm;
