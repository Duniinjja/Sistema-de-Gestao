import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { FilterProvider } from './context/FilterContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Despesas from './pages/Despesas';
import DespesaForm from './pages/DespesaForm';
import Vendas from './pages/Vendas';
import VendaForm from './pages/VendaForm';
import Receitas from './pages/Receitas';
import ReceitaForm from './pages/ReceitaForm';
import Cadastros from './pages/Cadastros';
import CadastroUsuarioForm from './pages/CadastroUsuarioForm';
import CadastroEmpresaForm from './pages/CadastroEmpresaForm';
import CadastroClienteForm from './pages/CadastroClienteForm';
import CadastroProdutoForm from './pages/CadastroProdutoForm';
import CadastroCategoriaForm from './pages/CadastroCategoriaForm';

import Relatorios from './pages/Relatorios';
import Perfil from './pages/Perfil';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="despesas" element={<Despesas />} />
        <Route path="despesas/nova" element={<DespesaForm />} />
        <Route path="despesas/editar/:id" element={<DespesaForm />} />
        <Route path="vendas" element={<Vendas />} />
        <Route path="vendas/nova" element={<VendaForm />} />
        <Route path="vendas/editar/:id" element={<VendaForm />} />
        <Route path="receitas" element={<Receitas />} />
        <Route path="receitas/nova" element={<ReceitaForm />} />
        <Route path="receitas/editar/:id" element={<ReceitaForm />} />
        <Route path="cadastros" element={<Cadastros />} />
        <Route path="cadastros/usuario/nova" element={<CadastroClienteForm />} />
        <Route path="cadastros/usuario/editar/:id" element={<CadastroClienteForm />} />
        <Route path="cadastros/cliente/nova" element={<CadastroClienteForm />} />
        <Route path="cadastros/cliente/editar/:id" element={<CadastroClienteForm />} />
        <Route path="cadastros/produto/nova" element={<CadastroProdutoForm />} />
        <Route path="cadastros/produto/editar/:id" element={<CadastroProdutoForm />} />
        <Route path="cadastros/categoria/nova" element={<CadastroCategoriaForm />} />
        <Route path="cadastros/categoria/editar/:id" element={<CadastroCategoriaForm />} />
        <Route path="cadastros/empresa/nova" element={<CadastroEmpresaForm />} />
        <Route path="cadastros/empresa/editar/:id" element={<CadastroEmpresaForm />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <FilterProvider>
            <AppRoutes />
            <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            />
          </FilterProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
