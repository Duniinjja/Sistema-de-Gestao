import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  console.log(useAuth())

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
