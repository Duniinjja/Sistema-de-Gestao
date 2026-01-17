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
  Person as PersonIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  CameraAlt as CameraIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
  createUsuario,
  updateUsuario,
  changePassword,
  getUsuario
} from '../services/api';

const CadastroUsuarioForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [errors, setErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
      senha_atual: '',
      nova_senha: '',
      confirmar_senha: '',
    });
  const [formData, setFormData] = useState({
    is_active: true,
  });

  useEffect(() => {
    if (id) {
      loadUsuario();
    }
  }, [id]);

  const loadUsuario = async () => {
    try {
      setLoading(true);
      const response = await getUsuario(id);
      const usuario = response.data;
      setFormData({
        email: usuario.email || '',
        first_name: usuario.first_name || '',
        last_name: usuario.last_name || '',
        tipo_usuario: usuario.tipo_usuario || '',
        is_active: usuario.is_active || true,
      });
    } catch (error) {
      toast.error('Erro ao carregar usuario');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

    const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.senha_atual) {
      newErrors.senha_atual = 'Senha atual é obrigatória';
    }

    if (!passwordData.nova_senha) {
      newErrors.nova_senha = 'Nova senha é obrigatória';
    } else if (passwordData.nova_senha.length < 6) {
      newErrors.nova_senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!passwordData.confirmar_senha) {
      newErrors.confirmar_senha = 'Confirmação de senha é obrigatória';
    } else if (passwordData.nova_senha !== passwordData.confirmar_senha) {
      newErrors.confirmar_senha = 'As senhas não conferem';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
      e.preventDefault();
  
      if (!validatePasswordForm()) {
        return;
      }
  
      try {
        setSavingPassword(true);
        await changePassword(user.id, {
          old_password: passwordData.senha_atual,
          new_password: passwordData.nova_senha,
        });
        toast.success('Senha alterada com sucesso!');
        setPasswordData({
          senha_atual: '',
          nova_senha: '',
          confirmar_senha: '',
        });
      } catch (error) {
        const responseData = error.response?.data;
  
        // Verifica diferentes formatos de erro do backend
        if (responseData?.old_password) {
          // Formato: { old_password: ['Senha atual incorreta.'] }
          const msg = Array.isArray(responseData.old_password)
            ? responseData.old_password[0]
            : responseData.old_password;
          setErrors(prev => ({ ...prev, senha_atual: msg }));
        } else if (responseData?.detail) {
          // Formato: { detail: 'Mensagem de erro' }
          toast.error(responseData.detail);
        } else {
          toast.error('Erro ao alterar senha');
        }
        console.error(error);
      } finally {
        setSavingPassword(false);
      }
    };

  const editPassword = async (suserId, password, password_confirm) => {
    try {
      const response = await changePassword(suserId, { password, password_confirm });

      console.log(response)
      toast.success('Senha alterada com sucesso!');
    }
    catch (error) {
      console.error('Erro ao alterar senha:', error);
      const errorMessage = error.response?.data?.message
        || error.response?.data?.detail
        || error.response?.data?.error
        || Object.values(error.response?.data || {}).flat().join(', ')
        || error.message;
      toast.error('Erro ao alterar senha: ' + errorMessage);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form Data:', formData);

    // Validações
    if (!formData.email.trim()) {
      toast.error('Email é obrigatório');
      return;
    }
    if (!formData.first_name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!formData.last_name.trim()) {
      toast.error('Sobrenome é obrigatório');
      return;
    }
    if (!formData.tipo_usuario) {
      toast.error('Tipo de usuário é obrigatório');
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
        // usuario_cadastro: user.id,
      };

      console.log('Dados enviados:', data);

      if (id) {
        await updateUsuario(id, data);
        if (formData.password && formData.password.trim()) await editPassword(id, formData.password, formData.password_confirm);
        toast.success('Usuário atualizada com sucesso!');
      } else {
        await createUsuario(data);
        toast.success('Usuário cadastrada com sucesso!');
      }
      navigate('/cadastros');
    } catch (error) {
      console.error('Erro ao salvar usuario:', error);
      console.log(error)
      const errorMessage = error.response?.data?.message
        || error.response?.data?.detail
        || error.response?.data?.error
        || Object.values(error.response?.data || {}).flat().join(', ')
        || error.message;
      toast.error('Erro ao salvar usuario: ' + errorMessage);
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
          onClick={() => navigate('/cadastros')}
          variant="outlined"
        >
          Voltar
        </Button>
        <Typography variant="h4">
          {id ? 'Editar Usuário' : 'Novo Usuário'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Email */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="user@email.com"
              />
            </Grid>

            {/* Senha */}
            {id == null && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Senha"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!id ? true : false}
                  placeholder="Password@123"
                  error={!!errors.nova_senha}
                  helperText={errors.nova_senha}
                />
              </Grid>
            )}

            {/* Confirmar Senha */}
            {id == null && (
              <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirmar Senha"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                required={!id ? true : false}
                placeholder="Password@123"
                error={!!errors.confirmar_senha}
                helperText={errors.confirmar_senha}
                />
              </Grid>
            )}

            {/* Nome */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="Nome"
              />
            </Grid>

            {/* Sobrenome */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sobrenome"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Sobrenome"
              />
            </Grid>

            {/* Tipo de Usuario */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Usuário</InputLabel>
                <Select
                  name="tipo_usuario"
                  value={formData.tipo_usuario}
                  onChange={handleChange}
                  label="Tipo de Usuário"
                >
                  <MenuItem value="USUARIO_EMPRESA">Usuário</MenuItem>
                  <MenuItem value="ADMIN_EMPRESA">Administrador</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Status */}
            {id && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="is_active"
                    value={formData.is_active}
                    onChange={handleChange}
                    label="Status"
                    >
                    <MenuItem value={true}>Ativo</MenuItem>
                    <MenuItem value={false}>Inativo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

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

      {/* Trocar Senha */}
      {id && (
        <Paper sx={{ p: 3 }}>
        <form onSubmit={handlePasswordSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nova Senha"
                name="nova_senha"
                type="password"
                value={passwordData.nova_senha}
                onChange={handlePasswordChange}
                error={!!errors.nova_senha}
                helperText={errors.nova_senha}
                />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirmar Nova Senha"
                name="confirmar_senha"
                type="password"
                value={passwordData.confirmar_senha}
                onChange={handlePasswordChange}
                error={!!errors.confirmar_senha}
                helperText={errors.confirmar_senha}
                />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="outlined"
                color="primary"
                startIcon={savingPassword ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                disabled={savingPassword}
                >
                {savingPassword ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </Grid>
          </Grid>
        </form>
        </Paper>
      )}
    </Box>
  );
};

export default CadastroUsuarioForm;
