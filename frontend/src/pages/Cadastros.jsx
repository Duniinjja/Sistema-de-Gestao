import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Cadastros
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Usuários" />
          <Tab label="Clientes" />
          <Tab label="Produtos" />
          <Tab label="Categorias" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography>Gerenciamento de Usuários</Typography>
          <Typography variant="body2" color="textSecondary">
            Aqui você pode cadastrar e gerenciar usuários do sistema.
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography>Gerenciamento de Clientes</Typography>
          <Typography variant="body2" color="textSecondary">
            Aqui você pode cadastrar e gerenciar clientes.
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography>Gerenciamento de Produtos</Typography>
          <Typography variant="body2" color="textSecondary">
            Aqui você pode cadastrar e gerenciar produtos e serviços.
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography>Gerenciamento de Categorias</Typography>
          <Typography variant="body2" color="textSecondary">
            Aqui você pode cadastrar categorias de despesas e receitas.
          </Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Cadastros;
