import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Person as PersonIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  CameraAlt as CameraIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser, updateUsuario, changePassword, uploadFotoPerfil } from '../services/api';
import { toast } from 'react-toastify';

const Perfil = () => {
  const { user, updateUser, updateUserLocal, getUserPhotoUrl, getUserInitials, getFullPhotoUrl } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Dados do perfil
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telefone: '',
  });

  // Preview da foto
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Dados para alteração de senha
  const [passwordData, setPasswordData] = useState({
    senha_atual: '',
    nova_senha: '',
    confirmar_senha: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await getCurrentUser();
      const userData = response.data;
      setFormData({
        first_name: userData.first_name || userData.nome || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        telefone: userData.telefone || '',
      });
      // Atualiza o contexto com os dados mais recentes
      updateUserLocal(userData);
    } catch (error) {
      toast.error('Erro ao carregar dados do perfil');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato inválido. Use JPG ou PNG.');
      return;
    }

    // Validar tamanho (máx 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Imagem muito grande. Máximo 5MB.');
      return;
    }

    setSelectedFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) return;

    try {
      setUploadingPhoto(true);

      const formDataUpload = new FormData();
      formDataUpload.append('foto', selectedFile);
      // Manter outros dados do usuário
      formDataUpload.append('first_name', formData.first_name);
      formDataUpload.append('last_name', formData.last_name);
      formDataUpload.append('email', formData.email);
      formDataUpload.append('telefone', formData.telefone);

      const response = await uploadFotoPerfil(user.id, formDataUpload);

      // Atualizar contexto imediatamente
      updateUserLocal(response.data);

      toast.success('Foto atualizada com sucesso!');
      setSelectedFile(null);
      setPhotoPreview(null);
    } catch (error) {
      toast.error('Erro ao atualizar foto');
      console.error(error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Tem certeza que deseja remover sua foto?')) return;

    try {
      setUploadingPhoto(true);

      const formDataUpload = new FormData();
      formDataUpload.append('foto', ''); // Enviar vazio para remover
      formDataUpload.append('first_name', formData.first_name);
      formDataUpload.append('last_name', formData.last_name);
      formDataUpload.append('email', formData.email);
      formDataUpload.append('telefone', formData.telefone);

      const response = await uploadFotoPerfil(user.id, formDataUpload);

      updateUserLocal(response.data);
      toast.success('Foto removida com sucesso!');
      setPhotoPreview(null);
      setSelectedFile(null);
    } catch (error) {
      toast.error('Erro ao remover foto');
      console.error(error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const cancelPhotoSelection = () => {
    setSelectedFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const response = await updateUsuario(user.id, formData);
      // Atualiza o contexto imediatamente
      updateUserLocal(response.data);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
      console.error(error);
    } finally {
      setSaving(false);
    }
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
      if (error.response?.data?.old_password) {
        setErrors(prev => ({ ...prev, senha_atual: 'Senha atual incorreta' }));
      } else {
        toast.error('Erro ao alterar senha');
      }
      console.error(error);
    } finally {
      setSavingPassword(false);
    }
  };

  // Determinar a foto a exibir (preview ou atual)
  const displayPhoto = photoPreview || getUserPhotoUrl();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Meu Perfil
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie suas informações pessoais
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Informações do Perfil */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            {/* Seção de Foto */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <IconButton
                      size="small"
                      onClick={handlePhotoClick}
                      disabled={uploadingPhoto}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        width: 32,
                        height: 32,
                      }}
                    >
                      <CameraIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <Avatar
                    src={displayPhoto}
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: 'primary.main',
                      fontSize: '2.5rem',
                      cursor: 'pointer',
                      border: '3px solid',
                      borderColor: 'primary.light',
                    }}
                    onClick={handlePhotoClick}
                  >
                    {!displayPhoto && getUserInitials()}
                  </Avatar>
                </Badge>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  hidden
                  onChange={handleFileSelect}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  {formData.first_name || 'Usuário'} {formData.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {user?.tipo_usuario?.replace('_', ' ')}
                </Typography>

                {/* Botões de ação da foto */}
                {selectedFile ? (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleUploadPhoto}
                      disabled={uploadingPhoto}
                      startIcon={uploadingPhoto ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    >
                      {uploadingPhoto ? 'Salvando...' : 'Salvar Foto'}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={cancelPhotoSelection}
                      disabled={uploadingPhoto}
                    >
                      Cancelar
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handlePhotoClick}
                      startIcon={<CameraIcon />}
                    >
                      {user?.foto ? 'Alterar Foto' : 'Adicionar Foto'}
                    </Button>
                    {user?.foto && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={handleRemovePhoto}
                        disabled={uploadingPhoto}
                        startIcon={<DeleteIcon />}
                      >
                        Remover
                      </Button>
                    )}
                  </Box>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Formatos aceitos: JPG, PNG (máx. 5MB)
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Dados Pessoais
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    error={!!errors.first_name}
                    helperText={errors.first_name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Sobrenome"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
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
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={saving}
                  >
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>

          {/* Alteração de Senha */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <LockIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Alterar Senha
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              Para alterar sua senha, informe a senha atual e a nova senha desejada.
            </Alert>

            <form onSubmit={handlePasswordSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Senha Atual"
                    name="senha_atual"
                    type="password"
                    value={passwordData.senha_atual}
                    onChange={handlePasswordChange}
                    error={!!errors.senha_atual}
                    helperText={errors.senha_atual}
                  />
                </Grid>
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
                <Grid item xs={12}>
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
        </Grid>

        {/* Informações da Conta */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Informações da Conta
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Tipo de Usuário
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {user?.tipo_usuario?.replace('_', ' ') || '-'}
                </Typography>
              </Box>

              {user?.empresa_nome && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Empresa
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {user.empresa_nome}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={500}
                  sx={{ color: user?.is_active ? 'success.main' : 'error.main' }}
                >
                  {user?.is_active ? 'Ativo' : 'Inativo'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Perfil;
