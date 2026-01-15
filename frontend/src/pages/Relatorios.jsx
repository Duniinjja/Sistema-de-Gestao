import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { Assessment as AssessmentIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getRelatorioFinanceiro, getRelatorioConsolidado } from '../services/api';
import { toast } from 'react-toastify';

const Relatorios = () => {
  const { user, isAdminChefe } = useAuth();
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(false);

  const gerarRelatorio = async () => {
    if (!dataInicio || !dataFim) {
      toast.error('Selecione o período');
      return;
    }

    try {
      setLoading(true);

      let response;
      if (isAdminChefe()) {
        // Relatório consolidado
        response = await getRelatorioConsolidado({
          data_inicio: dataInicio,
          data_fim: dataFim,
        });
      } else {
        // Relatório da empresa
        response = await getRelatorioFinanceiro({
          empresa_id: user.empresa_id,
          data_inicio: dataInicio,
          data_fim: dataFim,
        });
      }

      setRelatorio(response.data);
      toast.success('Relatório gerado com sucesso');
    } catch (error) {
      toast.error('Erro ao gerar relatório');
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Relatórios
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          {isAdminChefe() ? 'Relatório Consolidado' : 'Relatório Financeiro'}
        </Typography>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Data Início"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Data Fim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AssessmentIcon />}
              onClick={gerarRelatorio}
              disabled={loading}
              sx={{ height: '56px' }}
            >
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </Grid>
        </Grid>

        {relatorio && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />

            {isAdminChefe() && relatorio.resumo_geral ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Resumo Geral
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" variant="body2">
                          Total de Empresas
                        </Typography>
                        <Typography variant="h5">
                          {relatorio.total_empresas}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" variant="body2">
                          Total Receitas
                        </Typography>
                        <Typography variant="h5" color="success.main">
                          {formatCurrency(relatorio.resumo_geral.total_receitas)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" variant="body2">
                          Total Despesas
                        </Typography>
                        <Typography variant="h5" color="error.main">
                          {formatCurrency(relatorio.resumo_geral.total_despesas)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" variant="body2">
                          Saldo Geral
                        </Typography>
                        <Typography variant="h5">
                          {formatCurrency(relatorio.resumo_geral.saldo_geral)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              relatorio.resumo && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Resumo do Período
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" variant="body2">
                            Total Receitas
                          </Typography>
                          <Typography variant="h5" color="success.main">
                            {formatCurrency(relatorio.resumo.total_receitas)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" variant="body2">
                            Total Despesas
                          </Typography>
                          <Typography variant="h5" color="error.main">
                            {formatCurrency(relatorio.resumo.total_despesas)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" variant="body2">
                            Saldo
                          </Typography>
                          <Typography variant="h5">
                            {formatCurrency(relatorio.resumo.saldo)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Relatorios;
