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
  Grow,
  Fade,
} from '@mui/material';
import {
  Save as SaveIcon,
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
  getCliente,
  createCliente,
  updateCliente
} from '../services/api';

const CadastroClienteForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAdminChefe, isAdminEmpresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf_cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    ativo: true,
    observacoes: '',
  });

  useEffect(() => {
    // Ativa animação de entrada
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (id) {
      loadCliente();
    }
  }, [id]);

  const loadCliente = async () => {
    try {
      setLoading(true);
      const response = await getCliente(id);
      console.log('Cliente carregado:', response);
      const cliente = response.data;
      setFormData({
        nome: cliente.nome || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        cpf_cnpj: cliente.cpf_cnpj || '',
        endereco: cliente.endereco || '',
        cidade: cliente.cidade || '',
        estado: cliente.estado || '',
        ativo: cliente.ativo !== undefined ? cliente.ativo : true,
        observacoes: cliente.observacoes || '',
      });
    } catch (error) {
      toast.error('Erro ao carregar cliente');
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

    console.log('Dados do formulário:', formData);

    // Validações
    if (!formData.nome || !formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!formData.email || !formData.email.trim()) {
      toast.error('Email é obrigatório');
      return;
    }
    if (!formData.cpf_cnpj || !formData.cpf_cnpj.trim()) {
      toast.error('CPF/CNPJ é obrigatório');
      return;
    }

    try {
      setLoading(true);

      if (id) {
        // Na edição, NÃO enviar empresa (não pode ser alterada)
        const updateData = {
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          cpf_cnpj: formData.cpf_cnpj,
          endereco: formData.endereco,
          cidade: formData.cidade,
          estado: formData.estado,
          ativo: formData.ativo,
          observacoes: formData.observacoes,
          empresa: user.empresa_id
        };
        console.log('Dados do update:', parseInt(id), updateData);

        await updateCliente(id, updateData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        // Na criação, validar empresa e incluir senha
        if (!user?.empresa_id) {
          toast.error('Usuário sem empresa vinculada');
          return;
        }
        const createData = {
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          cpf_cnpj: formData.cpf_cnpj,
          endereco: formData.endereco,
          cidade: formData.cidade,
          estado: formData.estado,
          ativo: formData.ativo,
          observacoes: formData.observacoes,
          empresa: user.empresa_id,
        };
        await createCliente(createData);
        toast.success('Cliente cadastrado com sucesso!');
      }
      navigate('/cadastros');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      const errorMessage = error.response?.data?.message
        || error.response?.data?.detail
        || error.response?.data?.error
        || Object.values(error.response?.data || {}).flat().join(', ')
        || error.message;
      toast.error('Erro ao salvar cliente: ' + errorMessage);
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
              onClick={() => navigate('/cadastros',{tab:1})}
              variant="outlined"
            >
              Voltar
            </Button>
            <Typography variant="h4">
              {id ? 'Editar Cliente' : 'Novo Cliente'}
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
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Dados do Cliente
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Nome */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome"
                    name="nome"
                    type="text"
                    value={formData.nome || ''}
                    onChange={handleChange}
                    required
                    placeholder="João da Silva"
                  />
                </Grid>

                {/* CPF/CNPJ */}
                <Grid item xs={12}md={6}>
                  <TextField
                    fullWidth
                    label="CPF/CNPJ"
                    name="cpf_cnpj"
                    type="text"
                    value={formData.cpf_cnpj || ''}
                    onChange={handleChange}
                    required
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12}md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    required
                    placeholder="usuario@email.com"
                  />
                </Grid>

                {/* Telefone */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    name="telefone"
                    type="text"
                    value={formData.telefone || ''}
                    onChange={handleChange}
                    required
                    placeholder="(00) 00000-0000"
                  />
                </Grid>

                {/* Endereço */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Endereço"
                    name="endereco"
                    type="text"
                    value={formData.endereco || ''}
                    onChange={handleChange}
                    required
                    placeholder="Rua, número, bairro"
                  />
                </Grid>

                {/* Cidade */}
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Cidade"
                    name="cidade"
                    type="text"
                    value={formData.cidade || ''}
                    onChange={handleChange}
                    required
                    placeholder="Cidade"
                  />
                </Grid>
                {/* Estado */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Estado"
                    name="estado"
                    type="text"
                    value={formData.estado || ''}
                    onChange={handleChange}
                    required
                    placeholder="Estado"
                  />
                </Grid>

                {/* Status - apenas para edição */}
                {id && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="ativo"
                        value={formData.ativo}
                        onChange={handleChange}
                        label="Status"
                      >
                        <MenuItem value={true}>Ativo</MenuItem>
                        <MenuItem value={false}>Inativo</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}

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
                    placeholder="Informações adicionais sobre o cliente"
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

export default CadastroClienteForm;
