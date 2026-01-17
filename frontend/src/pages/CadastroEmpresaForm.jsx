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
  FormControlLabel,
  Switch,
  Grow,
  Fade,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
  getEmpresa,
  createEmpresa,
  updateEmpresa,
} from '../services/api';

const CadastroEmpresaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdminChefe } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    ativa: true,
  });

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (id) {
      loadEmpresa();
    }
  }, [id]);

  const loadEmpresa = async () => {
    try {
      setLoading(true);
      const response = await getEmpresa(id);
      const empresa = response.data;
      setFormData({
        nome: empresa.nome || '',
        cnpj: empresa.cnpj || '',
        email: empresa.email || '',
        telefone: empresa.telefone || '',
        endereco: empresa.endereco || '',
        cidade: empresa.cidade || '',
        estado: empresa.estado || '',
        cep: empresa.cep || '',
        ativa: empresa.ativa !== undefined ? empresa.ativa : true,
      });
    } catch (error) {
      toast.error('Erro ao carregar empresa');
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
      toast.error('Nome da empresa é obrigatório');
      return;
    }

    try {
      setLoading(true);

      if (id) {
        await updateEmpresa(id, formData);
        toast.success('Empresa atualizada com sucesso!');
      } else {
        await createEmpresa(formData);
        toast.success('Empresa cadastrada com sucesso!');
      }
      navigate('/cadastros');
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      const errorMessage = error.response?.data?.detail
        || error.response?.data?.message
        || Object.values(error.response?.data || {}).flat().join(', ')
        || error.message;
      toast.error('Erro ao salvar empresa: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Verifica se é Admin Chefe
  if (!isAdminChefe()) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          Acesso negado. Apenas Admin Chefe pode cadastrar empresas.
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/cadastros')}
          sx={{ mt: 2 }}
        >
          Voltar
        </Button>
      </Box>
    );
  }

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
            <BusinessIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4">
              {id ? 'Editar Empresa' : 'Nova Empresa'}
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
                    label="Nome da Empresa"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Empresa ABC Ltda"
                  />
                </Grid>

                {/* CNPJ */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="CNPJ"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    placeholder="00.000.000/0000-00"
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contato@empresa.com"
                  />
                </Grid>

                {/* Telefone */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                  />
                </Grid>

                {/* Endereço */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Endereço"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    placeholder="Rua, número, bairro"
                  />
                </Grid>

                {/* Cidade */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Estado */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    placeholder="UF"
                    inputProps={{ maxLength: 2 }}
                  />
                </Grid>

                {/* CEP */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="CEP"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    placeholder="00000-000"
                  />
                </Grid>

                {/* Ativa */}
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
                    label="Empresa Ativa"
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

export default CadastroEmpresaForm;
