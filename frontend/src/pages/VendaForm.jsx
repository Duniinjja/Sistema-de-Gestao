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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Grow,
  Fade,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
  getVenda,
  createVenda,
  updateVenda,
  getClientes,
  getProdutos,
} from '../services/api';

const VendaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    cliente: '',
    data_venda: new Date().toISOString().split('T')[0],
    desconto: '0',
    chargeback: '0',
    reversao_chargeback: '0',
    status: 'PENDENTE',
    forma_pagamento: 'DINHEIRO',
    observacoes: '',
  });
  const [itens, setItens] = useState([]);
  const [novoItem, setNovoItem] = useState({
    produto: '',
    quantidade: '1',
    preco_unitario: '',
  });

  useEffect(() => {
    // Ativa animação de entrada
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    loadClientes();
    loadProdutos();
    if (id) {
      loadVenda();
    }
  }, [id]);

  const loadClientes = async () => {
    try {
      const params = user?.empresa_id ? { empresa: user.empresa_id } : {};
      const response = await getClientes(params);
      setClientes(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes: ' + (error.response?.data?.message || error.message));
    }
  };

  const loadProdutos = async () => {
    try {
      const params = user?.empresa_id ? { empresa: user.empresa_id } : {};
      const response = await getProdutos(params);
      setProdutos(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos: ' + (error.response?.data?.message || error.message));
    }
  };

  const loadVenda = async () => {
    try {
      setLoading(true);
      const response = await getVenda(id);
      const venda = response.data;
      setFormData({
        cliente: venda.cliente || '',
        data_venda: venda.data_venda || '',
        desconto: venda.desconto || '0',
        chargeback: venda.chargeback || '0',
        reversao_chargeback: venda.reversao_chargeback || '0',
        status: venda.status || 'PENDENTE',
        forma_pagamento: venda.forma_pagamento || 'DINHEIRO',
        observacoes: venda.observacoes || '',
      });
      setItens(venda.itens || []);
    } catch (error) {
      toast.error('Erro ao carregar venda');
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

  const handleNovoItemChange = (e) => {
    const { name, value } = e.target;
    setNovoItem((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Se selecionar produto, preencher preço automaticamente
    if (name === 'produto') {
      const produto = produtos.find((p) => p.id === parseInt(value));
      if (produto) {
        setNovoItem((prev) => ({
          ...prev,
          preco_unitario: produto.preco_venda || '',
        }));
      }
    }
  };

  const adicionarItem = () => {
    if (!novoItem.produto) {
      toast.error('Selecione um produto');
      return;
    }
    if (!novoItem.quantidade || parseFloat(novoItem.quantidade) <= 0) {
      toast.error('Quantidade deve ser maior que zero');
      return;
    }
    if (!novoItem.preco_unitario || parseFloat(novoItem.preco_unitario) <= 0) {
      toast.error('Preço deve ser maior que zero');
      return;
    }

    const produto = produtos.find((p) => p.id === parseInt(novoItem.produto));
    const item = {
      produto: novoItem.produto,
      produto_nome: produto.nome,
      quantidade: parseFloat(novoItem.quantidade),
      preco_unitario: parseFloat(novoItem.preco_unitario),
      subtotal:
        parseFloat(novoItem.quantidade) * parseFloat(novoItem.preco_unitario),
    };

    setItens((prev) => [...prev, item]);
    setNovoItem({
      produto: '',
      quantidade: '1',
      preco_unitario: '',
    });
  };

  const removerItem = (index) => {
    setItens((prev) => prev.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    const subtotal = itens.reduce((sum, item) => sum + item.subtotal, 0);
    const desconto = parseFloat(formData.desconto) || 0;
    const chargeback = parseFloat(formData.chargeback) || 0;
    const reversaoChargeback = parseFloat(formData.reversao_chargeback) || 0;
    return {
      subtotal,
      desconto,
      chargeback,
      reversaoChargeback,
      total: subtotal - desconto,
      receitaLiquida: subtotal - desconto - chargeback + reversaoChargeback,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (!formData.cliente) {
      toast.error('Cliente é obrigatório');
      return;
    }
    if (!formData.data_venda) {
      toast.error('Data da venda é obrigatória');
      return;
    }
    if (itens.length === 0) {
      toast.error('Adicione pelo menos um item à venda');
      return;
    }

    try {
      setLoading(true);
      const totais = calcularTotal();
      const data = {
        ...formData,
        empresa: user.empresa_id,
        usuario_cadastro: user.id,
        valor_total: totais.subtotal,
        valor_final: totais.total,
        itens: itens.map((item) => ({
          produto: item.produto,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
        })),
      };

      if (id) {
        await updateVenda(id, data);
        toast.success('Venda atualizada com sucesso!');
      } else {
        await createVenda(data);
        toast.success('Venda cadastrada com sucesso!');
      }
      navigate('/vendas');
    } catch (error) {
      toast.error('Erro ao salvar venda');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading && id) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const totais = calcularTotal();

  return (
    <Fade in={mounted} timeout={300}>
      <Box>
        <Grow in={mounted} timeout={400}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/vendas')}
              variant="outlined"
            >
              Voltar
            </Button>
            <Typography variant="h4">
              {id ? 'Editar Venda' : 'Nova Venda'}
            </Typography>
          </Box>
        </Grow>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Informações da Venda */}
            <Grid item xs={12}>
              <Grow in={mounted} timeout={500} style={{ transformOrigin: '0 0 0' }}>
                <Paper
                  sx={{
                    p: 3,
                    boxShadow: mounted ? '0 8px 32px rgba(0, 0, 0, 0.1)' : 'none',
                    transition: 'box-shadow 0.3s ease',
                  }}
                >
              <Typography variant="h6" sx={{ mb: 3 }}>
                Informações da Venda
              </Typography>
              <Grid container spacing={2}>
                {/* Cliente */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Cliente</InputLabel>
                    <Select
                      name="cliente"
                      value={formData.cliente}
                      onChange={handleChange}
                      label="Cliente"
                    >
                      {clientes.map((cliente) => (
                        <MenuItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Data Venda */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Data da Venda"
                    name="data_venda"
                    type="date"
                    value={formData.data_venda}
                    onChange={handleChange}
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                {/* Status */}
                <Grid item xs={12} md={4}>
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
                      <MenuItem value="CANCELADA">Cancelada</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Forma de Pagamento */}
                <Grid item xs={12} md={4}>
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
                      <MenuItem value="CARTAO_CREDITO">
                        Cartão de Crédito
                      </MenuItem>
                      <MenuItem value="CARTAO_DEBITO">
                        Cartão de Débito
                      </MenuItem>
                      <MenuItem value="BOLETO">Boleto</MenuItem>
                      <MenuItem value="TRANSFERENCIA">Transferência</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Desconto */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Desconto"
                    name="desconto"
                    type="number"
                    value={formData.desconto}
                    onChange={handleChange}
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

                {/* Chargeback */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Chargeback"
                    name="chargeback"
                    type="number"
                    value={formData.chargeback}
                    onChange={handleChange}
                    helperText="Valor de estorno/contestacao"
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

                {/* Reversao Chargeback */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Reversao de Chargeback"
                    name="reversao_chargeback"
                    type="number"
                    value={formData.reversao_chargeback}
                    onChange={handleChange}
                    helperText="Valor de chargeback recuperado"
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

                {/* Observações */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observações"
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    placeholder="Informações adicionais sobre a venda"
                  />
                </Grid>
              </Grid>
                </Paper>
              </Grow>
            </Grid>

            {/* Adicionar Itens */}
            <Grid item xs={12}>
              <Grow in={mounted} timeout={600} style={{ transformOrigin: '0 0 0' }}>
                <Paper
                  sx={{
                    p: 3,
                    boxShadow: mounted ? '0 8px 32px rgba(0, 0, 0, 0.1)' : 'none',
                    transition: 'box-shadow 0.3s ease',
                  }}
                >
              <Typography variant="h6" sx={{ mb: 3 }}>
                Adicionar Produtos
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <FormControl fullWidth>
                    <InputLabel>Produto</InputLabel>
                    <Select
                      name="produto"
                      value={novoItem.produto}
                      onChange={handleNovoItemChange}
                      label="Produto"
                    >
                      {produtos.map((produto) => (
                        <MenuItem key={produto.id} value={produto.id}>
                          {produto.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="Quantidade"
                    name="quantidade"
                    type="number"
                    value={novoItem.quantidade}
                    onChange={handleNovoItemChange}
                    inputProps={{
                      step: '1',
                      min: '1',
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Preço Unitário"
                    name="preco_unitario"
                    type="number"
                    value={novoItem.preco_unitario}
                    onChange={handleNovoItemChange}
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

                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={adicionarItem}
                  >
                    Adicionar
                  </Button>
                </Grid>
              </Grid>
                </Paper>
              </Grow>
            </Grid>

            {/* Lista de Itens */}
            {itens.length > 0 && (
              <Grid item xs={12}>
                <Grow in={mounted} timeout={700} style={{ transformOrigin: '0 0 0' }}>
                  <Paper
                    sx={{
                      p: 3,
                      boxShadow: mounted ? '0 8px 32px rgba(0, 0, 0, 0.1)' : 'none',
                      transition: 'box-shadow 0.3s ease',
                    }}
                  >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Itens da Venda
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Produto</TableCell>
                        <TableCell align="right">Quantidade</TableCell>
                        <TableCell align="right">Preço Unit.</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itens.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.produto_nome}</TableCell>
                          <TableCell align="right">{item.quantidade}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.preco_unitario)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.subtotal)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removerItem(index)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 2 }} />

                {/* Totais */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Subtotal: {formatCurrency(totais.subtotal)}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, color: 'warning.main' }}>
                    (-) Desconto: {formatCurrency(totais.desconto)}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                    Total: {formatCurrency(totais.total)}
                  </Typography>
                  {(totais.chargeback > 0 || totais.reversaoChargeback > 0) && (
                    <>
                      <Typography variant="body2" sx={{ color: 'error.main' }}>
                        (-) Chargeback: {formatCurrency(totais.chargeback)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'success.main' }}>
                        (+) Reversao CB: {formatCurrency(totais.reversaoChargeback)}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'info.main', mt: 1 }}>
                        Receita Liquida: {formatCurrency(totais.receitaLiquida)}
                      </Typography>
                    </>
                  )}
                </Box>
                  </Paper>
                </Grow>
              </Grid>
            )}

            {/* Botões */}
            <Grid item xs={12}>
              <Grow in={mounted} timeout={800}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/vendas')}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <SaveIcon />
                    }
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </Box>
              </Grow>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Fade>
  );
};

export default VendaForm;
