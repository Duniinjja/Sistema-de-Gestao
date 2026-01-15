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
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Warning,
  ShoppingCart,
  Receipt,
  People,
  AttachMoney,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getEmpresaDashboard } from '../services/api';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
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
          {trend && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {trend > 0 ? (
                <TrendingUp fontSize="small" sx={{ color: 'success.main' }} />
              ) : (
                <TrendingDown fontSize="small" sx={{ color: 'error.main' }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  color: trend > 0 ? 'success.main' : 'error.main',
                  fontWeight: 600,
                }}
              >
                {trend > 0 ? '+' : ''}{trend}% vs mês anterior
              </Typography>
            </Box>
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const empresaId = user.empresa_id;
      if (empresaId) {
        const response = await getEmpresaDashboard(empresaId);
        setStats(response.data.estatisticas);
      }
    } catch (error) {
      toast.error('Erro ao carregar dashboard');
      console.error(error);
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

  const saldoMes = stats?.saldo_mes || 0;

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
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visão geral da empresa • {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Receitas do Mês"
            value={formatCurrency(stats?.total_receitas_mes)}
            subtitle="Receitas recebidas"
            icon={AttachMoney}
            color="#4caf50"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Vendas do Mês"
            value={formatCurrency(stats?.total_vendas_mes)}
            subtitle="Total em vendas"
            icon={ShoppingCart}
            color="#2196f3"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Despesas do Mês"
            value={formatCurrency(stats?.total_despesas_mes)}
            subtitle="Gastos do período"
            icon={Receipt}
            color="#f44336"
            trend={-5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Saldo do Mês"
            value={formatCurrency(saldoMes)}
            subtitle={saldoMes >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
            icon={AccountBalance}
            color={saldoMes >= 0 ? '#4caf50' : '#f44336'}
          />
        </Grid>
      </Grid>

      {/* Info and Alerts */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <InfoCard
            title="Informações Rápidas"
            color="#1976d2"
            items={[
              {
                icon: <People fontSize="small" />,
                label: 'Total de Usuários',
                value: stats?.total_usuarios || 0,
                color: '#1976d2',
              },
              {
                icon: <Receipt fontSize="small" />,
                label: 'Despesas Pendentes',
                value: stats?.despesas_pendentes || 0,
                color: '#f44336',
              },
              {
                icon: <ShoppingCart fontSize="small" />,
                label: 'Vendas no Mês',
                value: stats?.vendas_mes || 0,
                color: '#2196f3',
              },
            ]}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          {stats?.despesas_pendentes > 0 ? (
            <AlertCard
              severity="warning"
              title="Atenção às Despesas"
              message={`Você tem ${stats.despesas_pendentes} despesa(s) pendente(s) que precisam de atenção.`}
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

      {/* Additional Info */}
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
              Resumo Financeiro do Mês
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Receitas
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {formatCurrency(stats?.total_receitas_mes)}
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
                    {formatCurrency(stats?.total_despesas_mes)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={
                    stats?.total_receitas_mes > 0
                      ? (stats?.total_despesas_mes / stats?.total_receitas_mes) * 100
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
                    color: saldoMes >= 0 ? 'success.main' : 'error.main',
                  }}
                >
                  {formatCurrency(saldoMes)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
