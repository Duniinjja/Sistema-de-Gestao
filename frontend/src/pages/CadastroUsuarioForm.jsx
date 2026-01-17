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
  createUsuario,
  updateUsuario,
  changePassword,
  getUsuario
} from '../services/api';

const CadastroUsuarioForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAdminChefe, isAdminEmpresa } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [errors, setErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    nova_senha: '',
    confirmar_senha: '',
  });
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    tipo_usuario: '',
    is_active: true,
  });

  useEffect(() => {
    // Ativa animação de entrada
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

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
        is_active: usuario.is_active !== undefined ? usuario.is_active : true,
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
      // Admin alterando senha de outro usuário - não precisa de senha atual
      await changePassword(id, {
        new_password: passwordData.nova_senha,
      });
      toast.success('Senha alterada com sucesso!');
      setPasswordData({
        nova_senha: '',
        confirmar_senha: '',
      });
    } catch (error) {
      const responseData = error.response?.data;
      if (responseData?.detail) {
        toast.error(responseData.detail);
      } else {
        toast.error('Erro ao alterar senha');
      }
      console.error(error);
    } finally {
      setSavingPassword(false);
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
    if (!formData.email || !formData.email.trim()) {
      toast.error('Email é obrigatório');
      return;
    }
    if (!formData.first_name || !formData.first_name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (!formData.tipo_usuario) {
      toast.error('Tipo de usuário é obrigatório');
      return;
    }

    // Validação de senha para novo usuário
    if (!id) {
      if (!formData.password || formData.password.length < 6) {
        toast.error('Senha deve ter pelo menos 6 caracteres');
        return;
      }
      if (formData.password !== formData.password_confirm) {
        toast.error('As senhas não conferem');
        return;
      }
    }

    try {
      setLoading(true);

      if (id) {
        // Na edição, NÃO enviar empresa (não pode ser alterada)
        const updateData = {
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          tipo_usuario: formData.tipo_usuario,
          is_active: formData.is_active,
        };
        await updateUsuario(id, updateData);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Na criação, validar empresa e incluir senha
        if (!user?.empresa_id) {
          toast.error('Usuário sem empresa vinculada');
          return;
        }
        const createData = {
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          tipo_usuario: formData.tipo_usuario,
          empresa: user.empresa_id,
          password: formData.password,
          password_confirm: formData.password_confirm,
        };
        await createUsuario(createData);
        toast.success('Usuário cadastrado com sucesso!');
      }
      navigate('/cadastros');
    } catch (error) {
      console.error('Erro ao salvar usuario:', error);
      const errorMessage = error.response?.data?.message
        || error.response?.data?.detail
        || error.response?.data?.error
        || Object.values(error.response?.data || {}).flat().join(', ')
        || error.message;
      toast.error('Erro ao salvar usuário: ' + errorMessage);
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
            <Typography variant="h4">
              {id ? 'Editar Usuário' : 'Novo Usuário'}
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
              Dados do Usuário
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Email */}
                <Grid item xs={12}>
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

                {/* Senha - apenas para novo usuário */}
                {!id && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Senha"
                        name="password"
                        type="password"
                        value={formData.password || ''}
                        onChange={handleChange}
                        required
                        placeholder="Mínimo 6 caracteres"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Confirmar Senha"
                        name="password_confirm"
                        type="password"
                        value={formData.password_confirm || ''}
                        onChange={handleChange}
                        required
                        placeholder="Repita a senha"
                      />
                    </Grid>
                  </>
                )}

                {/* Nome */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome"
                    name="first_name"
                    value={formData.first_name || ''}
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
                    value={formData.last_name || ''}
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
                      value={formData.tipo_usuario || ''}
                      onChange={handleChange}
                      label="Tipo de Usuário"
                    >
                      <MenuItem value="USUARIO_EMPRESA">Usuário</MenuItem>
                      <MenuItem value="ADMIN_EMPRESA">Administrador</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Status - apenas para edição */}
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
        </Grow>

        {/* Alterar Senha - apenas para edição */}
        {id && (
          <Grow in={mounted} timeout={600} style={{ transformOrigin: '0 0 0' }}>
            <Paper
              sx={{
                p: 3,
                mt: 3,
                boxShadow: mounted ? '0 8px 32px rgba(0, 0, 0, 0.1)' : 'none',
                transition: 'box-shadow 0.3s ease',
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Alterar Senha
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Digite uma nova senha para este usuário. Como administrador, você não precisa da senha atual.
              </Typography>
              <form onSubmit={handlePasswordSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Nova Senha"
                      name="nova_senha"
                      type="password"
                      value={passwordData.nova_senha}
                      onChange={handlePasswordChange}
                      error={!!errors.nova_senha}
                      helperText={errors.nova_senha || 'Mínimo 6 caracteres'}
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
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
                  <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Button
                      type="submit"
                      variant="outlined"
                      color="primary"
                      fullWidth
                      startIcon={savingPassword ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                      disabled={savingPassword}
                      sx={{ height: 56 }}
                    >
                      {savingPassword ? 'Salvando...' : 'Alterar'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grow>
        )}
      </Box>
    </Fade>
  );
};

export default CadastroUsuarioForm;
