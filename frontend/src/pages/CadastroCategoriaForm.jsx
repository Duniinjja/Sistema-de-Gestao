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
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
  getDespesa,
  createDespesa,
  updateDespesa,
  getCategoriasDespesa,
} from '../services/api';

const DespesaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({
    descricao: '',
    categoria: '',
    valor: '',
    data_vencimento: '',
    data_pagamento: '',
    status: 'PENDENTE',
    forma_pagamento: 'DINHEIRO',
    observacoes: '',
  });

  useEffect(() => {
    loadCategorias();
    if (id) {
      loadDespesa();
    }
  }, [id]);

  const loadCategorias = async () => {
    try {
      const params = user?.empresa_id ? { empresa: user.empresa_id } : {};
      const response = await getCategoriasDespesa(params);
      setCategorias(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias: ' + (error.response?.data?.message || error.message));
    }
  };

  const loadDespesa = async () => {
    try {
      setLoading(true);
      const response = await getDespesa(id);
      const despesa = response.data;
      setFormData({
        descricao: despesa.descricao || '',
        categoria: despesa.categoria || '',
        valor: despesa.valor || '',
        data_vencimento: despesa.data_vencimento || '',
        data_pagamento: despesa.data_pagamento || '',
        status: despesa.status || 'PENDENTE',
        forma_pagamento: despesa.forma_pagamento || 'DINHEIRO',
        observacoes: despesa.observacoes || '',
      });
    } catch (error) {
      toast.error('Erro ao carregar despesa');
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
    if (!formData.data_vencimento) {
      toast.error('Data de vencimento é obrigatória');
      return;
    }

    try {
      setLoading(true);

      // Validar dados do usuário
      if (!user?.empresa_id) {
        toast.error('Usuário sem empresa vinculada');
        return;
      }

      const data = {
        ...formData,
        empresa: user.empresa_id,
        usuario_cadastro: user.id,
      };

      console.log('Dados enviados:', data);

      if (id) {
        await updateDespesa(id, data);
        toast.success('Despesa atualizada com sucesso!');
      } else {
        await createDespesa(data);
        toast.success('Despesa cadastrada com sucesso!');
      }
      navigate('/despesas');
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      const errorMessage = error.response?.data?.message
        || error.response?.data?.detail
        || error.response?.data?.error
        || Object.values(error.response?.data || {}).flat().join(', ')
        || error.message;
      toast.error('Erro ao salvar despesa: ' + errorMessage);
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
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/despesas')}
          variant="outlined"
        >
          Voltar
        </Button>
        <Typography variant="h4">
          {id ? 'Editar Despesa' : 'Nova Despesa'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
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
                placeholder="Ex: Energia Janeiro 2026"
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

            {/* Data Vencimento */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Vencimento"
                name="data_vencimento"
                type="date"
                value={formData.data_vencimento}
                onChange={handleChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Data Pagamento */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data de Pagamento"
                name="data_pagamento"
                type="date"
                value={formData.data_pagamento}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                helperText="Deixe em branco se ainda não foi pago"
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
                  <MenuItem value="PAGA">Paga</MenuItem>
                  <MenuItem value="VENCIDA">Vencida</MenuItem>
                  <MenuItem value="CANCELADA">Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Forma de Pagamento */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Forma de Pagamento</InputLabel>
                <Select
                  name="forma_pagamento"
                  value={formData.forma_pagamento}
                  onChange={handleChange}
                  label="Forma de Pagamento"
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
                placeholder="Informações adicionais sobre a despesa"
              />
            </Grid>

            {/* Botões */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/despesas')}
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
    </Box>
  );
};

export default DespesaForm;
