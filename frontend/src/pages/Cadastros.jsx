import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
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
  Tabs,
  Tab,
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

import {
  deleteUsuario,
  getUsuarios,
  getClientes,
  deleteCliente,
  
} from '../services/api';

//teste

const TabPanel = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Cadastros = () => {
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();
  const { isAdminChefe } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDeleteUsuario = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      await deleteUsuario(id);
      toast.success('Usuário excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir despesa');
    }
    finally {
      loadUsuarios();
    }
  };

    const handleDeleteCliente = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      await deleteCliente(id);
      toast.success('Cliente excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir cliente');
    }
    finally {
      loadClientes();
    }
  };

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await getUsuarios();
      let data = response.data.results || response.data;

      // Garantir que data é um array
      if (!Array.isArray(data)) {
        data = [];
      }

      await setUsuarios(data);

    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }

  const loadClientes = async () => {
    try {
      setLoading(true);
      const response = await getClientes();
      let data = response.data.results || response.data;

      // Garantir que data é um array
      if (!Array.isArray(data)) {
        data = [];
      }

      await setClientes(data);

    } catch (error) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }

    const getStatusColor = (status) => {
    const colors = {
      true: 'success',
      false: 'error',
    };
    return colors[status] || 'default';
  };

  useEffect(() => {
  loadUsuarios()
  loadClientes()
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Cadastros
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          {!isAdminChefe() && (<Tab label="Usuários" />)}
          {!isAdminChefe() && (<Tab label="Clientes" />)}
          {!isAdminChefe() && (<Tab label="Produtos" />)}
          {!isAdminChefe() && (<Tab label="Categorias" />)}       
          {isAdminChefe() && (<Tab label="Empresas" />)}
        </Tabs>

  {!isAdminChefe() && (
    <Box>
    <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
            <Box>
              <Typography>Gerenciamento de Usuários</Typography>
              <Typography variant="body2" color="textSecondary">
                Aqui você pode cadastrar e gerenciar usuários do sistema.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/cadastros/usuario/nova')}
                  >
                  Novo Usuário
                </Button>
            </Box>
          </Box>
          <Box sx={{ mt: 2 }}>
            <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Cargo</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhuma despesa encontrada no período selecionado
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>{usuario.first_name} {usuario.last_name}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell align="center">{usuario.tipo_usuario === "ADMIN_EMPRESA" ? "Administrador" : "Usuário"}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={usuario.is_active ? 'ATIVO' : 'INATIVO'}
                      color={getStatusColor(usuario.is_active)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/cadastros/usuario/editar/${usuario.id}`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteUsuario(usuario.id)}
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
        </TabPanel>


        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
            <Box>
              <Typography>Gerenciamento de Clientes</Typography>
              <Typography variant="body2" color="textSecondary">
                Aqui você pode cadastrar e gerenciar clientes.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/cadastros/cliente/nova')}
                >
                Novo Cliente
              </Button>
            </Box>
          </Box>
          <Box sx={{ mt: 2 }}>
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="center">Cidade</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Nenhuma despesa encontrada no período selecionado
                      </TableCell>
                    </TableRow>
                  ) : (
                    clientes.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell>{cliente.nome} </TableCell>
                        <TableCell>{cliente.email}</TableCell>
                        <TableCell align="center">{cliente.cidade} - {cliente.estado}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={cliente.ativo ? 'ATIVO' : 'INATIVO'}
                            color={getStatusColor(cliente.ativo)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/cadastros/cliente/editar/${cliente.id}`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteCliente(cliente.id)}
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
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
            <Box>
              <Typography>Gerenciamento de Produtos</Typography>
              <Typography variant="body2" color="textSecondary">
                Aqui você pode cadastrar e gerenciar produtos e serviços.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/cadastros/produto/nova')}
                >
                Novo Produto
              </Button>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
            <Box>
          <Typography>Gerenciamento de Categorias</Typography>
          <Typography variant="body2" color="textSecondary">
            Aqui você pode cadastrar categorias de despesas e receitas.
          </Typography>
          </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/cadastros/categoria/nova')}
                >
                Nova Categoria
              </Button>
            </Box>
          </Box>
        </TabPanel>
        </Box>
        )}
        {isAdminChefe() && (

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
              <Box>
            <Typography>Gerenciamento de Empresas</Typography>
            <Typography variant="body2" color="textSecondary">
              Aqui você pode cadastrar empresas.
            </Typography>
            </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/cadastros/empresa/nova')}
                  >
                  Nova Empresa
                </Button>
              </Box>
            </Box>
          </TabPanel>
        )}
      </Paper>
    </Box>
  );
};

export default Cadastros;
