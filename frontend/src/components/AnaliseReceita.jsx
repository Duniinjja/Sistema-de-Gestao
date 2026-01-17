import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  AttachMoney,
  Receipt,
  ShoppingCart,
  LocalOffer,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts';
import { getAnaliseReceita } from '../services/api';
import { useFilter } from '../context/FilterContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat('pt-BR').format(value || 0);
};

const VariacaoChip = ({ value, suffix = '%' }) => {
  if (value === undefined || value === null) return null;

  const isPositive = value > 0;
  const isZero = value === 0;

  return (
    <Chip
      icon={isZero ? <TrendingFlat fontSize="small" /> : isPositive ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
      label={`${isPositive ? '+' : ''}${typeof value === 'number' ? value.toFixed(1) : value}${suffix}`}
      size="small"
      sx={{
        bgcolor: isZero ? 'grey.100' : isPositive ? 'success.lighter' : 'error.lighter',
        color: isZero ? 'grey.700' : isPositive ? 'success.dark' : 'error.dark',
        fontWeight: 600,
        fontSize: '0.7rem',
        '& .MuiChip-icon': {
          color: 'inherit',
        },
      }}
    />
  );
};

const KPICard = ({ title, value, subtitle, icon: Icon, color, variacao }) => (
  <Card
    sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}30`,
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase' }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', my: 0.5 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          {variacao !== undefined && (
            <Box sx={{ mt: 1 }}>
              <VariacaoChip value={variacao} />
            </Box>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: color,
            borderRadius: '50%',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AnaliseReceita = () => {
  const { selectedEmpresa } = useFilter();
  const { user, isAdminChefe } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState(null);
  const [meses, setMeses] = useState(3);

  useEffect(() => {
    loadData();
  }, [selectedEmpresa, meses]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {
        meses,
      };

      // Para Admin Chefe: usa empresa selecionada (se valida) ou deixa vazio para consolidado
      // Para outros usuarios: sempre usa a empresa do usuario
      if (isAdminChefe()) {
        if (selectedEmpresa && selectedEmpresa !== 'todos' && !isNaN(selectedEmpresa)) {
          params.empresa_id = selectedEmpresa;
        }
        // Se nao especificou empresa, backend retorna consolidado
      } else {
        // Usuario normal: sempre usa sua propria empresa
        params.empresa_id = user?.empresa_id;
      }

      const response = await getAnaliseReceita(params);
      setDados(response.data);
    } catch (error) {
      console.error('Erro ao carregar analise de receita:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || error.message;
      toast.error(`Erro ao carregar analise de receita: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!dados) {
    return null;
  }

  const { dados_mensais, totais, consolidado } = dados;
  const ultimoMes = dados_mensais[dados_mensais.length - 1];
  const penultimoMes = dados_mensais.length > 1 ? dados_mensais[dados_mensais.length - 2] : null;

  // Dados para o grafico
  const chartData = dados_mensais.map(d => ({
    name: d.mes,
    'Receita Bruta': d.receita_bruta,
    'Receita Liquida': d.receita_operacional_liquida,
    'Ticket Medio': d.ticket_medio,
    'Volume Vendas': d.qtde_vendas,
  }));

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Analise de Receita {consolidado && '- Consolidado Grupo'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Periodo: {dados.periodo.data_inicio} a {dados.periodo.data_fim}
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={meses}
          exclusive
          onChange={(e, value) => value && setMeses(value)}
          size="small"
        >
          <ToggleButton value={3}>3 Meses</ToggleButton>
          <ToggleButton value={6}>6 Meses</ToggleButton>
          <ToggleButton value={12}>12 Meses</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Receita Bruta"
            value={formatCurrency(totais.receita_bruta)}
            subtitle={`${formatNumber(totais.qtde_vendas)} vendas`}
            icon={AttachMoney}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Descontos"
            value={formatCurrency(totais.descontos)}
            subtitle={`${totais.descontos_perc}% da receita`}
            icon={LocalOffer}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Chargeback"
            value={formatCurrency(totais.chargeback)}
            subtitle={`${totais.chargeback_perc}% da receita`}
            icon={Receipt}
            color="#f44336"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Receita Operacional Liquida"
            value={formatCurrency(totais.receita_operacional_liquida)}
            subtitle={`Ticket medio: ${formatCurrency(totais.ticket_medio)}`}
            icon={ShoppingCart}
            color="#4caf50"
          />
        </Grid>
      </Grid>

      {/* Grafico de Evolucao */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Evolucao da Receita Operacional Liquida
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => formatNumber(v)} />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'Volume Vendas') return [formatNumber(value), name];
                return [formatCurrency(value), name];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="Receita Liquida" fill="#4caf50" name="Receita Liquida (R$)" />
            <Line yAxisId="right" type="monotone" dataKey="Volume Vendas" stroke="#2196f3" strokeWidth={2} name="Volume de Vendas (#)" />
          </ComposedChart>
        </ResponsiveContainer>
      </Paper>

      {/* Tabela Detalhada */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: '#1e3c72', color: 'white' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Detalhamento Mensal
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>Indicador</TableCell>
                {dados_mensais.map((d, idx) => (
                  <TableCell key={idx} align="right" sx={{ fontWeight: 600 }}>
                    {d.mes}
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'primary.lighter' }}>
                  TOTAL
                </TableCell>
                {dados_mensais.length > 1 && (
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Var. Ultimo Mes
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Qtde Vendas */}
              <TableRow>
                <TableCell sx={{ fontWeight: 500 }}># Qtde Vendas</TableCell>
                {dados_mensais.map((d, idx) => (
                  <TableCell key={idx} align="right">{formatNumber(d.qtde_vendas)}</TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'primary.lighter' }}>
                  {formatNumber(totais.qtde_vendas)}
                </TableCell>
                {dados_mensais.length > 1 && (
                  <TableCell align="center">
                    <VariacaoChip value={ultimoMes.variacao_qtde} />
                  </TableCell>
                )}
              </TableRow>

              {/* Receita Bruta */}
              <TableRow>
                <TableCell sx={{ fontWeight: 500 }}>Receita Bruta de Vendas</TableCell>
                {dados_mensais.map((d, idx) => (
                  <TableCell key={idx} align="right">{formatCurrency(d.receita_bruta)}</TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'primary.lighter' }}>
                  {formatCurrency(totais.receita_bruta)}
                </TableCell>
                {dados_mensais.length > 1 && (
                  <TableCell align="center">
                    <VariacaoChip value={ultimoMes.variacao_receita_bruta} />
                  </TableCell>
                )}
              </TableRow>

              {/* Descontos */}
              <TableRow>
                <TableCell sx={{ fontWeight: 500, color: 'warning.main' }}>(-) Descontos</TableCell>
                {dados_mensais.map((d, idx) => (
                  <TableCell key={idx} align="right" sx={{ color: 'warning.main' }}>
                    {formatCurrency(d.descontos)}
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 600, color: 'warning.main', bgcolor: 'primary.lighter' }}>
                  {formatCurrency(totais.descontos)}
                </TableCell>
                {dados_mensais.length > 1 && (
                  <TableCell align="center">
                    <VariacaoChip value={ultimoMes.variacao_descontos} />
                  </TableCell>
                )}
              </TableRow>

              {/* % Descontos */}
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ pl: 4, fontStyle: 'italic', color: 'text.secondary' }}>%</TableCell>
                {dados_mensais.map((d, idx) => (
                  <TableCell key={idx} align="right" sx={{ color: 'text.secondary' }}>
                    {d.descontos_perc}%
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ color: 'text.secondary', bgcolor: 'primary.lighter' }}>
                  {totais.descontos_perc}%
                </TableCell>
                {dados_mensais.length > 1 && <TableCell />}
              </TableRow>

              {/* Chargeback */}
              <TableRow>
                <TableCell sx={{ fontWeight: 500, color: 'error.main' }}>(-) Chargeback</TableCell>
                {dados_mensais.map((d, idx) => (
                  <TableCell key={idx} align="right" sx={{ color: 'error.main' }}>
                    {formatCurrency(d.chargeback)}
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 600, color: 'error.main', bgcolor: 'primary.lighter' }}>
                  {formatCurrency(totais.chargeback)}
                </TableCell>
                {dados_mensais.length > 1 && (
                  <TableCell align="center">
                    <VariacaoChip value={ultimoMes.variacao_chargeback} />
                  </TableCell>
                )}
              </TableRow>

              {/* % Chargeback */}
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ pl: 4, fontStyle: 'italic', color: 'text.secondary' }}>%</TableCell>
                {dados_mensais.map((d, idx) => (
                  <TableCell key={idx} align="right" sx={{ color: 'text.secondary' }}>
                    {d.chargeback_perc}%
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ color: 'text.secondary', bgcolor: 'primary.lighter' }}>
                  {totais.chargeback_perc}%
                </TableCell>
                {dados_mensais.length > 1 && <TableCell />}
              </TableRow>

              {/* Reversao Chargeback */}
              <TableRow>
                <TableCell sx={{ fontWeight: 500, color: 'success.main' }}>(+) Reversao de Chargeback</TableCell>
                {dados_mensais.map((d, idx) => (
                  <TableCell key={idx} align="right" sx={{ color: 'success.main' }}>
                    {formatCurrency(d.reversao_chargeback)}
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main', bgcolor: 'primary.lighter' }}>
                  {formatCurrency(totais.reversao_chargeback)}
                </TableCell>
                {dados_mensais.length > 1 && <TableCell />}
              </TableRow>

              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell colSpan={dados_mensais.length + 3}><Divider /></TableCell>
              </TableRow>

              {/* Receita Operacional Liquida */}
              <TableRow sx={{ bgcolor: '#1e3c72' }}>
                <TableCell sx={{ fontWeight: 700, color: 'white' }}>RECEITA OPERACIONAL LIQUIDA</TableCell>
                {dados_mensais.map((d, idx) => (
                  <TableCell key={idx} align="right" sx={{ fontWeight: 700, color: 'white' }}>
                    {formatCurrency(d.receita_operacional_liquida)}
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 700, color: 'white', bgcolor: '#142850' }}>
                  {formatCurrency(totais.receita_operacional_liquida)}
                </TableCell>
                {dados_mensais.length > 1 && (
                  <TableCell align="center" sx={{ bgcolor: '#1e3c72' }}>
                    <VariacaoChip value={ultimoMes.variacao_receita_liquida} />
                  </TableCell>
                )}
              </TableRow>

              {/* Ticket Medio */}
              <TableRow>
                <TableCell sx={{ fontWeight: 500 }}>TICKET MEDIO</TableCell>
                {dados_mensais.map((d, idx) => (
                  <TableCell key={idx} align="right">{formatCurrency(d.ticket_medio)}</TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'primary.lighter' }}>
                  {formatCurrency(totais.ticket_medio)}
                </TableCell>
                {dados_mensais.length > 1 && (
                  <TableCell align="center">
                    <VariacaoChip value={ultimoMes.variacao_ticket_medio} suffix="" />
                  </TableCell>
                )}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AnaliseReceita;
