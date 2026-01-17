import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Chip,
  Avatar,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Warning,
  ShoppingCart,
  Receipt,
  Business,
  AttachMoney,
  Analytics,
  Dashboard as DashboardIcon,
  Assessment,
  ShowChart,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useFilter } from '../context/FilterContext';
import AdminFilters from '../components/AdminFilters';
import AnaliseReceita from '../components/AnaliseReceita';
import DRE from '../components/DRE';
import GraficoEvolucao from '../components/GraficoEvolucao';
import {
  getDespesas,
  getVendas,
  getReceitas,
  getEmpresas,
} from '../services/api';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <Card
    sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}30`,
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 24px ${color}20`,
        border: `1px solid ${color}50`,
      },
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            sx={{ fontWeight: 500, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            component="div"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '2rem' },
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: color,
            width: 56,
            height: 56,
            boxShadow: `0 4px 12px ${color}40`,
          }}
        >
          <Icon sx={{ fontSize: 28 }} />
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const InfoCard = ({ title, items, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: '100%',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        borderColor: color || 'primary.main',
      },
    }}
  >
    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: color || 'text.primary' }}>
      {title}
    </Typography>
    <Divider sx={{ my: 2 }} />
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {item.icon && (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: `${item.color || color}15`,
                  color: item.color || color,
                }}
              >
                {item.icon}
              </Avatar>
            )}
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {item.value}
          </Typography>
        </Box>
      ))}
    </Box>
  </Paper>
);

const AlertCard = ({ title, message, severity = 'warning', count }) => {
  const colors = {
    warning: { bg: '#fff3e0', border: '#ff9800', text: '#e65100' },
    error: { bg: '#ffebee', border: '#f44336', text: '#c62828' },
    info: { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' },
    success: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32' },
  };

  const color = colors[severity];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: color.bg,
        border: `1px solid ${color.border}40`,
        borderRadius: 2,
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar sx={{ bgcolor: color.border, width: 48, height: 48 }}>
          <Warning />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: color.text }}>
            {title}
          </Typography>
          {count !== undefined && (
            <Chip
              label={`${count} ${count === 1 ? 'item' : 'itens'}`}
              size="small"
              sx={{
                mt: 0.5,
                bgcolor: color.border,
                color: 'white',
                fontWeight: 600,
              }}
            />
          )}
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Paper>
  );
};

const Dashboard = () => {
  const { user, isAdminChefe } = useAuth();
  const {
    getFilterParams,
    selectedUsuario,
    selectedEmpresa,
    dataInicio,
    dataFim,
    getActiveFilterLabel,
    getDateRangeLabel,
  } = useFilter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    total_receitas: 0,
    total_vendas: 0,
    total_despesas: 0,
    saldo: 0,
    total_empresas: 0,
    despesas_pendentes: 0,
    vendas_periodo: 0,
    receitas_pendentes: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, [selectedUsuario, selectedEmpresa, dataInicio, dataFim]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const params = getFilterParams(true);

      // Buscar dados em paralelo
      const requests = [
        getDespesas(params).catch(() => ({ data: [] })),
        getVendas(params).catch(() => ({ data: [] })),
        getReceitas(params).catch(() => ({ data: [] })),
      ];

      // Admin Chefe também busca empresas
      if (isAdminChefe()) {
        requests.push(getEmpresas().catch(() => ({ data: [] })));
      }

      const results = await Promise.all(requests);

      const despesas = results[0].data.results || results[0].data || [];
      const vendas = results[1].data.results || results[1].data || [];
      const receitas = results[2].data.results || results[2].data || [];
      const empresas = isAdminChefe() ? (results[3]?.data.results || results[3]?.data || []) : [];

      // Filtrar por período selecionado
      const dataInicioDate = new Date(dataInicio + 'T00:00:00');
      const dataFimDate = new Date(dataFim + 'T23:59:59');

      const despesasPeriodo = despesas.filter(d => {
        const data = new Date(d.data_vencimento);
        return data >= dataInicioDate && data <= dataFimDate;
      });

      const vendasPeriodo = vendas.filter(v => {
        const data = new Date(v.data_venda);
        return data >= dataInicioDate && data <= dataFimDate;
      });

      const receitasPeriodo = receitas.filter(r => {
        const data = new Date(r.data_prevista);
        return data >= dataInicioDate && data <= dataFimDate;
      });

      // Calcular totais do período
      const totalDespesas = despesasPeriodo.reduce((sum, d) => sum + parseFloat(d.valor || 0), 0);
      const totalVendas = vendasPeriodo.reduce((sum, v) => sum + parseFloat(v.valor_final || 0), 0);
      const totalReceitas = receitasPeriodo.reduce((sum, r) => sum + parseFloat(r.valor || 0), 0);

      // Contar pendentes (em todo o sistema, não só no período)
      const despesasPendentes = despesas.filter(d => d.status === 'PENDENTE' || d.status === 'VENCIDA').length;
      const receitasPendentes = receitas.filter(r => r.status === 'PENDENTE').length;

      setStats({
        total_receitas: totalReceitas,
        total_vendas: totalVendas,
        total_despesas: totalDespesas,
        saldo: totalReceitas + totalVendas - totalDespesas,
        total_empresas: empresas.length,
        despesas_pendentes: despesasPendentes,
        vendas_periodo: vendasPeriodo.length,
        receitas_pendentes: receitasPendentes,
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" color="text.secondary">
          Carregando dashboard...
        </Typography>
      </Box>
    );
  }

  const saldo = stats?.saldo || 0;

  // Itens de informações rápidas - diferentes para Admin Chefe e outros usuários
  const infoItems = isAdminChefe()
    ? [
        {
          icon: <Business fontSize="small" />,
          label: 'Total de Empresas',
          value: stats.total_empresas,
          color: '#9c27b0',
        },
      ]
    : [
        {
          icon: <Receipt fontSize="small" />,
          label: 'Despesas Pendentes',
          value: stats.despesas_pendentes,
          color: '#f44336',
        },
        {
          icon: <AttachMoney fontSize="small" />,
          label: 'Receitas Pendentes',
          value: stats.receitas_pendentes,
          color: '#4caf50',
        },
        {
          icon: <ShoppingCart fontSize="small" />,
          label: 'Vendas no Período',
          value: stats.vendas_periodo,
          color: '#2196f3',
        },
      ];

  return (
    <Box>
      {/* Header */}
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
          Dashboard {isAdminChefe() && '- Admin Chefe'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isAdminChefe() ? getActiveFilterLabel() : 'Visão geral da empresa'} | Período: {getDateRangeLabel()}
        </Typography>
      </Box>

      {/* Filtros - visível para todos */}
      <AdminFilters showUsuarioFilter={true} showEmpresaFilter={true} showDateFilter={true} />

      {/* Tabs de Navegacao */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
            },
          }}
        >
          <Tab icon={<DashboardIcon />} iconPosition="start" label="Visao Geral" />
          <Tab icon={<Analytics />} iconPosition="start" label="Analise de Receita" />
          <Tab icon={<Assessment />} iconPosition="start" label="DRE" />
          <Tab icon={<ShowChart />} iconPosition="start" label="Evolucao" />
        </Tabs>
      </Box>

      {/* Conteudo da Tab Visao Geral */}
      {activeTab === 0 && (
        <>
      {/* Stats Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Receitas do Período"
            value={formatCurrency(stats.total_receitas)}
            subtitle={`${stats.receitas_pendentes} pendente${stats.receitas_pendentes !== 1 ? 's' : ''}`}
            icon={AttachMoney}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Vendas do Período"
            value={formatCurrency(stats.total_vendas)}
            subtitle={`${stats.vendas_periodo} venda${stats.vendas_periodo !== 1 ? 's' : ''} realizada${stats.vendas_periodo !== 1 ? 's' : ''}`}
            icon={ShoppingCart}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Despesas do Período"
            value={formatCurrency(stats.total_despesas)}
            subtitle={`${stats.despesas_pendentes} pendente${stats.despesas_pendentes !== 1 ? 's' : ''}`}
            icon={Receipt}
            color="#f44336"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Saldo do Período"
            value={formatCurrency(saldo)}
            subtitle={saldo >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
            icon={AccountBalance}
            color={saldo >= 0 ? '#4caf50' : '#f44336'}
          />
        </Grid>
      </Grid>

      {/* Info and Alerts */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <InfoCard
            title="Informações Rápidas"
            color="#1976d2"
            items={infoItems}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          {stats.despesas_pendentes > 0 ? (
            <AlertCard
              severity="warning"
              title="Atenção às Despesas"
              message={`Você tem ${stats.despesas_pendentes} despesa(s) pendente(s) ou vencida(s) que precisam de atenção.`}
              count={stats.despesas_pendentes}
            />
          ) : (
            <AlertCard
              severity="success"
              title="Tudo em Dia!"
              message="Parabéns! Não há despesas pendentes no momento."
              count={0}
            />
          )}
        </Grid>
      </Grid>

      {/* Resumo Financeiro */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #667eea15 0%, #764ba205 100%)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Resumo Financeiro do Período
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              {getDateRangeLabel()}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Receitas + Vendas
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {formatCurrency(stats.total_receitas + stats.total_vendas)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'success.lighter',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'success.main',
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Despesas
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                    {formatCurrency(stats.total_despesas)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={
                    (stats.total_receitas + stats.total_vendas) > 0
                      ? Math.min((stats.total_despesas / (stats.total_receitas + stats.total_vendas)) * 100, 100)
                      : 0
                  }
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'error.lighter',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'error.main',
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Saldo Final
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: saldo >= 0 ? 'success.main' : 'error.main',
                  }}
                >
                  {formatCurrency(saldo)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
        </>
      )}

      {/* Conteudo da Tab Analise de Receita */}
      {activeTab === 1 && (
        <AnaliseReceita />
      )}

      {/* Conteudo da Tab DRE */}
      {activeTab === 2 && (
        <DRE />
      )}

      {/* Conteudo da Tab Evolucao */}
      {activeTab === 3 && (
        <GraficoEvolucao />
      )}
    </Box>
  );
};

export default Dashboard;
