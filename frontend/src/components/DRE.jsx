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
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  AccountBalance,
  Paid,
  Receipt,
  ShoppingCart,
  Remove,
  Add,
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
import { getDRE } from '../services/api';
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

const formatPercent = (value) => {
  return `${(value || 0).toFixed(1)}%`;
};

// Cores do header do Excel
const HEADER_BG = '#1e3c72';
const HEADER_DARK = '#142850';
const ROW_HIGHLIGHT = '#f5f5f5';
const ROW_TOTAL = '#e8f4f8';

const VariacaoChip = ({ value, inverted = false }) => {
  if (value === undefined || value === null) return null;

  // Para despesas, aumento é ruim (vermelho), diminuição é bom (verde)
  const isPositive = inverted ? value < 0 : value > 0;
  const isZero = value === 0;

  return (
    <Chip
      icon={isZero ? <TrendingFlat fontSize="small" /> : value > 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
      label={`${value > 0 ? '+' : ''}${typeof value === 'number' ? value.toFixed(1) : value}%`}
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

// Linha do DRE
const DRETableRow = ({ label, values, total, isHeader = false, isTotal = false, isNegative = false, isPositive = false, level = 0, showPercent = false, percentValues = [], percentTotal, variacao }) => {
  const theme = useTheme();

  const getBgColor = () => {
    if (isHeader) return HEADER_BG;
    if (isTotal) return ROW_TOTAL;
    if (level > 0) return ROW_HIGHLIGHT;
    return 'transparent';
  };

  const getTextColor = () => {
    if (isHeader) return 'white';
    if (isNegative) return theme.palette.error.main;
    if (isPositive) return theme.palette.success.main;
    return 'text.primary';
  };

  return (
    <TableRow sx={{ bgcolor: getBgColor() }}>
      <TableCell
        sx={{
          fontWeight: isHeader || isTotal ? 700 : level === 0 ? 600 : 400,
          color: getTextColor(),
          pl: 2 + level * 2,
          borderBottom: isHeader ? 'none' : undefined,
        }}
      >
        {isNegative && !isHeader && <Remove sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />}
        {isPositive && !isHeader && <Add sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />}
        {label}
      </TableCell>
      {values.map((value, idx) => (
        <TableCell
          key={idx}
          align="right"
          sx={{
            fontWeight: isHeader || isTotal ? 700 : 400,
            color: getTextColor(),
            borderBottom: isHeader ? 'none' : undefined,
          }}
        >
          {isNegative && value !== 0 ? '-' : ''}{formatCurrency(Math.abs(value))}
          {showPercent && percentValues[idx] !== undefined && (
            <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
              {formatPercent(percentValues[idx])}
            </Typography>
          )}
        </TableCell>
      ))}
      <TableCell
        align="right"
        sx={{
          fontWeight: 700,
          color: isHeader ? 'white' : getTextColor(),
          bgcolor: isHeader ? HEADER_DARK : alpha(theme.palette.primary.main, 0.08),
          borderBottom: isHeader ? 'none' : undefined,
        }}
      >
        {isNegative && total !== 0 ? '-' : ''}{formatCurrency(Math.abs(total))}
        {showPercent && percentTotal !== undefined && (
          <Typography variant="caption" display="block" sx={{ color: isHeader ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
            {formatPercent(percentTotal)}
          </Typography>
        )}
      </TableCell>
      {variacao !== undefined ? (
        <TableCell align="center" sx={{ bgcolor: isHeader ? HEADER_BG : undefined, borderBottom: isHeader ? 'none' : undefined }}>
          <VariacaoChip value={variacao} inverted={isNegative} />
        </TableCell>
      ) : (
        <TableCell sx={{ bgcolor: isHeader ? HEADER_BG : undefined, borderBottom: isHeader ? 'none' : undefined }} />
      )}
    </TableRow>
  );
};

const DRE = () => {
  const { selectedEmpresa } = useFilter();
  const { user, isAdminChefe } = useAuth();
  const theme = useTheme();
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

      if (isAdminChefe()) {
        if (selectedEmpresa && selectedEmpresa !== 'todos' && !isNaN(selectedEmpresa)) {
          params.empresa_id = selectedEmpresa;
        }
      } else {
        params.empresa_id = user?.empresa_id;
      }

      const response = await getDRE(params);
      setDados(response.data);
    } catch (error) {
      console.error('Erro ao carregar DRE:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || error.message;
      toast.error(`Erro ao carregar DRE: ${errorMsg}`);
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
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">Nenhum dado disponivel</Typography>
      </Box>
    );
  }

  const { totais, dados_mensais, periodo, consolidado } = dados;

  // Extrair valores mensais para a tabela
  const mesesLabels = dados_mensais.map(d => d.mes);
  const getValoresMensais = (campo) => dados_mensais.map(d => d[campo] || 0);
  const getPercentuaisMensais = (campo, baseField) => dados_mensais.map(d => {
    const base = d[baseField] || 0;
    const valor = d[campo] || 0;
    return base > 0 ? (valor / base * 100) : 0;
  });

  // Ultimo mes para variacao
  const ultimoMes = dados_mensais[dados_mensais.length - 1];

  // Funcao para obter valor de uma categoria especifica por mes
  const getValoresPorCategoria = (categoriaNome) => {
    return dados_mensais.map(d => {
      const cat = d.despesas_por_categoria?.find(c =>
        c.categoria?.toLowerCase().includes(categoriaNome.toLowerCase())
      );
      return cat ? cat.valor : 0;
    });
  };

  // Funcao para obter total de uma categoria no periodo
  const getTotalCategoria = (categoriaNome) => {
    const cat = totais.despesas_por_categoria?.find(c =>
      c.categoria?.toLowerCase().includes(categoriaNome.toLowerCase())
    );
    return cat ? cat.valor : 0;
  };

  // Agrupar categorias por tipo para o DRE
  // Custos Diretos: categorias que contêm "salario", "custo", "producao", "comissao"
  // Despesas Indiretas: "aluguel", "telefonia", "material", "escritorio", "manutencao", "servicos"
  // Marketing: "marketing", "publicidade", "propaganda"
  // Impostos: "imposto", "simples", "icms", "iss"
  // Financeiras: "financeira", "banco", "juros", "tarifa"

  const categorizarDespesas = (categorias) => {
    const grupos = {
      custos_diretos: 0,
      despesas_indiretas: 0,
      marketing: 0,
      impostos: 0,
      financeiras: 0,
      investimentos: 0,
      outros: 0,
    };

    const patterns = {
      custos_diretos: ['salario', 'custo', 'producao', 'comissao', 'mao de obra', 'terceiro'],
      despesas_indiretas: ['aluguel', 'telefonia', 'material', 'escritorio', 'manutencao', 'luz', 'agua', 'energia', 'limpeza'],
      marketing: ['marketing', 'publicidade', 'propaganda', 'anuncio'],
      impostos: ['imposto', 'simples', 'icms', 'iss', 'pis', 'cofins', 'nacional', 'taxa'],
      financeiras: ['financeira', 'banco', 'juros', 'tarifa', 'taxa bancaria', 'cartao'],
      investimentos: ['investimento', 'equipamento', 'software', 'tecnologia'],
    };

    categorias?.forEach(cat => {
      const nome = (cat.categoria || '').toLowerCase();
      let encontrado = false;

      for (const [grupo, palavras] of Object.entries(patterns)) {
        if (palavras.some(p => nome.includes(p))) {
          grupos[grupo] += cat.valor;
          encontrado = true;
          break;
        }
      }

      if (!encontrado) {
        grupos.outros += cat.valor;
      }
    });

    return grupos;
  };

  // Calcular grupos de despesas por mes
  const getDespesasAgrupadasPorMes = (grupo) => {
    return dados_mensais.map(d => {
      const grupos = categorizarDespesas(d.despesas_por_categoria);
      return grupos[grupo] || 0;
    });
  };

  // Calcular grupos de despesas totais
  const despesasAgrupadas = categorizarDespesas(totais.despesas_por_categoria);

  // Dados para grafico de evolucao
  const chartData = dados_mensais.map((mes) => ({
    mes: mes.mes,
    'Receita Bruta': mes.receita_bruta,
    'Receita Liquida': mes.receita_liquida,
    'Lucro Liquido': mes.lucro_liquido,
    'Despesas': mes.total_despesas,
  }));

  return (
    <Box>
      {/* Header com seletor de periodo */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            DRE - Demonstrativo de Resultado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {consolidado ? 'Consolidado Grupo' : 'Empresa Selecionada'} |{' '}
            Periodo: {periodo.data_inicio} a {periodo.data_fim}
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={meses}
          exclusive
          onChange={(e, v) => v && setMeses(v)}
          size="small"
        >
          <ToggleButton value={3}>3 meses</ToggleButton>
          <ToggleButton value={6}>6 meses</ToggleButton>
          <ToggleButton value={12}>12 meses</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* KPIs Cards Resumo */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">Receita Bruta</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatCurrency(totais.receita_bruta)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.05), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">Receita Liquida</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main' }}>{formatCurrency(totais.receita_liquida)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.05), border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">Total Despesas</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>{formatCurrency(totais.total_despesas)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ bgcolor: alpha(totais.lucro_liquido >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.05), border: `1px solid ${alpha(totais.lucro_liquido >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.2)}` }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">Lucro Liquido</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: totais.lucro_liquido >= 0 ? 'success.main' : 'error.main' }}>
                {formatCurrency(totais.lucro_liquido)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Margem: {formatPercent(totais.margem_liquida)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela DRE Principal - Estilo Excel */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', mb: 3 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: HEADER_BG }}>
                <TableCell sx={{ color: 'white', fontWeight: 700, width: '25%' }}>MES REFERENCIA</TableCell>
                {mesesLabels.map((mes, idx) => (
                  <TableCell key={idx} align="right" sx={{ color: 'white', fontWeight: 600 }}>{mes}</TableCell>
                ))}
                <TableCell align="right" sx={{ color: 'white', fontWeight: 700, bgcolor: HEADER_DARK }}>TOTAL {meses} MESES</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 600, width: '10%' }}>VAR.</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Receita Bruta de Vendas */}
              <DRETableRow
                label="Receita Bruta de Vendas"
                values={getValoresMensais('receita_vendas')}
                total={totais.receita_vendas}
                variacao={ultimoMes?.variacao_receita}
              />

              {/* Descontos */}
              <DRETableRow
                label="Descontos"
                values={getValoresMensais('descontos')}
                total={totais.descontos}
                isNegative
                showPercent
                percentValues={getPercentuaisMensais('descontos', 'receita_vendas')}
                percentTotal={totais.receita_vendas > 0 ? (totais.descontos / totais.receita_vendas * 100) : 0}
              />

              {/* Receita Liquida (Antes do CB) */}
              <DRETableRow
                label="Receita Liquida (Antes do CB)"
                values={dados_mensais.map(d => d.receita_vendas - d.descontos)}
                total={totais.receita_vendas - totais.descontos}
                isTotal
              />

              {/* Chargeback */}
              <DRETableRow
                label="Chargeback"
                values={getValoresMensais('chargeback')}
                total={totais.chargeback}
                isNegative
                showPercent
                percentValues={getPercentuaisMensais('chargeback', 'receita_vendas')}
                percentTotal={totais.receita_vendas > 0 ? (totais.chargeback / totais.receita_vendas * 100) : 0}
              />

              {/* Reversao de Chargeback */}
              <DRETableRow
                label="Reversao de Chargeback"
                values={getValoresMensais('reversao_chargeback')}
                total={totais.reversao_chargeback}
                isPositive
                showPercent
                percentValues={getPercentuaisMensais('reversao_chargeback', 'receita_vendas')}
                percentTotal={totais.receita_vendas > 0 ? (totais.reversao_chargeback / totais.receita_vendas * 100) : 0}
              />

              {/* RECEITA OPERACIONAL LIQUIDA - Header destacado */}
              <DRETableRow
                label="RECEITA OPERACIONAL LIQUIDA"
                values={getValoresMensais('receita_liquida')}
                total={totais.receita_liquida}
                isHeader
                variacao={ultimoMes?.variacao_receita}
              />

              {/* Separador */}
              <TableRow>
                <TableCell colSpan={mesesLabels.length + 3} sx={{ py: 0.5, bgcolor: '#f9f9f9' }} />
              </TableRow>

              {/* CUSTOS DIRETOS - usando dados reais de categorias */}
              <DRETableRow
                label="CUSTOS DIRETOS"
                values={getDespesasAgrupadasPorMes('custos_diretos')}
                total={despesasAgrupadas.custos_diretos}
                isNegative
                isTotal
              />

              {/* LUCRO BRUTO */}
              <DRETableRow
                label="LUCRO BRUTO"
                values={dados_mensais.map((d, idx) => d.receita_liquida - getDespesasAgrupadasPorMes('custos_diretos')[idx])}
                total={totais.receita_liquida - despesasAgrupadas.custos_diretos}
                isHeader
              />

              {/* Despesas Indiretas */}
              <DRETableRow
                label="DESPESAS INDIRETAS"
                values={getDespesasAgrupadasPorMes('despesas_indiretas')}
                total={despesasAgrupadas.despesas_indiretas}
                isNegative
              />

              {/* Despesas de Marketing */}
              <DRETableRow
                label="DESPESAS DE MARKETING"
                values={getDespesasAgrupadasPorMes('marketing')}
                total={despesasAgrupadas.marketing}
                isNegative
              />

              {/* Investimentos */}
              <DRETableRow
                label="INVESTIMENTOS"
                values={getDespesasAgrupadasPorMes('investimentos')}
                total={despesasAgrupadas.investimentos}
                isNegative
              />

              {/* Despesas Financeiras */}
              <DRETableRow
                label="DESPESAS FINANCEIRAS"
                values={getDespesasAgrupadasPorMes('financeiras')}
                total={despesasAgrupadas.financeiras}
                isNegative
              />

              {/* Impostos / Simples Nacional */}
              <DRETableRow
                label="IMPOSTOS / SIMPLES NACIONAL"
                values={getDespesasAgrupadasPorMes('impostos')}
                total={despesasAgrupadas.impostos}
                isNegative
              />

              {/* Outras Despesas */}
              {despesasAgrupadas.outros > 0 && (
                <DRETableRow
                  label="OUTRAS DESPESAS"
                  values={getDespesasAgrupadasPorMes('outros')}
                  total={despesasAgrupadas.outros}
                  isNegative
                />
              )}

              {/* Separador */}
              <TableRow>
                <TableCell colSpan={mesesLabels.length + 3} sx={{ py: 0.5, bgcolor: '#f9f9f9' }} />
              </TableRow>

              {/* LUCRO LIQUIDO - Header verde/vermelho */}
              <TableRow sx={{ bgcolor: totais.lucro_liquido >= 0 ? '#e8f5e9' : '#ffebee' }}>
                <TableCell sx={{ fontWeight: 700, color: totais.lucro_liquido >= 0 ? 'success.dark' : 'error.dark', pl: 2 }}>
                  LUCRO LIQUIDO
                </TableCell>
                {dados_mensais.map((d, idx) => (
                  <TableCell key={idx} align="right" sx={{ fontWeight: 700, color: d.lucro_liquido >= 0 ? 'success.dark' : 'error.dark' }}>
                    {formatCurrency(d.lucro_liquido)}
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 700, color: totais.lucro_liquido >= 0 ? 'success.dark' : 'error.dark', bgcolor: alpha(totais.lucro_liquido >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.15) }}>
                  {formatCurrency(totais.lucro_liquido)}
                </TableCell>
                <TableCell align="center">
                  <VariacaoChip value={ultimoMes?.variacao_lucro} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Detalhamento de Despesas por Categoria */}
      {totais.despesas_por_categoria && totais.despesas_por_categoria.length > 0 && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', mb: 3 }}>
          <Box sx={{ bgcolor: HEADER_BG, px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white' }}>
              Detalhamento de Despesas por Categoria
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Categoria</TableCell>
                  {mesesLabels.map((mes, idx) => (
                    <TableCell key={idx} align="right" sx={{ fontWeight: 600 }}>{mes}</TableCell>
                  ))}
                  <TableCell align="right" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.08) }}>TOTAL</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {totais.despesas_por_categoria.map((cat, catIdx) => (
                  <TableRow key={catIdx} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: cat.cor || '#666' }} />
                        {cat.categoria}
                      </Box>
                    </TableCell>
                    {dados_mensais.map((d, idx) => {
                      const catMes = d.despesas_por_categoria?.find(c => c.categoria === cat.categoria);
                      return (
                        <TableCell key={idx} align="right">
                          {formatCurrency(catMes?.valor || 0)}
                        </TableCell>
                      );
                    })}
                    <TableCell align="right" sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                      {formatCurrency(cat.valor)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'text.secondary' }}>
                      {totais.total_despesas > 0 ? formatPercent((cat.valor / totais.total_despesas) * 100) : '0%'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: ROW_TOTAL }}>
                  <TableCell sx={{ fontWeight: 700 }}>TOTAL DESPESAS</TableCell>
                  {dados_mensais.map((d, idx) => (
                    <TableCell key={idx} align="right" sx={{ fontWeight: 700 }}>
                      {formatCurrency(d.total_despesas)}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.15) }}>
                    {formatCurrency(totais.total_despesas)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Grafico de Evolucao */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Evolucao Mensal
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={(value) =>
                new Intl.NumberFormat('pt-BR', {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(value)
              }
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              labelStyle={{ fontWeight: 600 }}
            />
            <Legend />
            <Bar dataKey="Receita Bruta" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Despesas" fill={theme.palette.warning.main} radius={[4, 4, 0, 0]} />
            <Line
              type="monotone"
              dataKey="Lucro Liquido"
              stroke={theme.palette.success.main}
              strokeWidth={3}
              dot={{ fill: theme.palette.success.main, r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default DRE;
