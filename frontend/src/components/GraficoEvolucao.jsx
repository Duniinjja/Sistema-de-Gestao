import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
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
  ReferenceLine,
  LabelList,
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

const formatCompact = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value || 0);
};

// Cores do grafico
const BAR_COLOR = '#1e3c72';
const LINE_COLOR = '#e67e22';

const GraficoEvolucao = () => {
  const { selectedEmpresa } = useFilter();
  const { user, isAdminChefe } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState(null);
  const [meses, setMeses] = useState(12);

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

      const response = await getAnaliseReceita(params);
      setDados(response.data);
    } catch (error) {
      console.error('Erro ao carregar dados de evolucao:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || error.message;
      toast.error(`Erro ao carregar dados: ${errorMsg}`);
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

  if (!dados || !dados.dados_mensais || dados.dados_mensais.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">Nenhum dado disponivel</Typography>
      </Box>
    );
  }

  const { dados_mensais, consolidado } = dados;

  // Preparar dados para o grafico
  const chartData = dados_mensais.map((mes) => ({
    mes: mes.mes,
    volume: mes.qtde_vendas,
    receita: mes.receita_operacional_liquida,
    ticket: mes.ticket_medio,
  }));

  // Custom label para mostrar valores nas barras
  const CustomBarLabel = (props) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y + 20}
        fill="white"
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
      >
        {formatNumber(value)}
      </text>
    );
  };

  // Custom label para a linha
  const CustomLineLabel = (props) => {
    const { x, y, value } = props;
    return (
      <text
        x={x}
        y={y - 10}
        fill={LINE_COLOR}
        textAnchor="middle"
        fontSize={10}
        fontWeight={600}
      >
        {formatCompact(value)}
      </text>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Evolucao da Receita Operacional Liquida
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {consolidado ? 'Consolidado Grupo' : 'Empresa Selecionada'}
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={meses}
          exclusive
          onChange={(e, v) => v && setMeses(v)}
          size="small"
        >
          <ToggleButton value={6}>6 meses</ToggleButton>
          <ToggleButton value={12}>12 meses</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Tabela de resumo acima do grafico */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', mb: 2 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
                  {consolidado ? 'CONSOLIDADO GRUPO' : 'EMPRESA'}
                </TableCell>
                {chartData.map((d, idx) => (
                  <TableCell key={idx} align="right" sx={{ fontWeight: 600, minWidth: 80 }}>
                    {d.mes}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 500, borderRight: '1px solid #e0e0e0' }}>
                  RECEITA OPERACIONAL LIQUIDA (R$)
                </TableCell>
                {chartData.map((d, idx) => (
                  <TableCell key={idx} align="right">
                    {formatCompact(d.receita)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 500, borderRight: '1px solid #e0e0e0' }}>
                  VOLUME DE VENDAS (#)
                </TableCell>
                {chartData.map((d, idx) => (
                  <TableCell key={idx} align="right">
                    {formatNumber(d.volume)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 500, borderRight: '1px solid #e0e0e0' }}>
                  TICKET MEDIO (R$)
                </TableCell>
                {chartData.map((d, idx) => (
                  <TableCell key={idx} align="right">
                    {formatCurrency(d.ticket)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Grafico */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
          RECEITA OPERACIONAL LIQUIDA
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 11, fontWeight: 600 }}
              tickLine={false}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              tickFormatter={(v) => formatCompact(v)}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={[0, 'auto']}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => formatCompact(v)}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={[0, 'auto']}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'volume') return [formatNumber(value), 'Volume de Vendas'];
                if (name === 'receita') return [formatCurrency(value), 'Receita Op. Liquida'];
                return [value, name];
              }}
              labelStyle={{ fontWeight: 600 }}
              contentStyle={{ borderRadius: 8 }}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value) => {
                if (value === 'volume') return 'VOLUME DE VENDAS (#)';
                if (value === 'receita') return 'RECEITA OPERACIONAL LIQUIDA (R$)';
                return value;
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="volume"
              fill={BAR_COLOR}
              radius={[4, 4, 0, 0]}
              barSize={40}
            >
              <LabelList
                dataKey="volume"
                position="inside"
                fill="white"
                fontSize={10}
                fontWeight={600}
                formatter={(v) => formatNumber(v)}
              />
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="receita"
              stroke={LINE_COLOR}
              strokeWidth={3}
              dot={{ fill: LINE_COLOR, r: 5, strokeWidth: 2, stroke: 'white' }}
              activeDot={{ r: 8 }}
            >
              <LabelList
                dataKey="receita"
                position="top"
                fill={LINE_COLOR}
                fontSize={10}
                fontWeight={600}
                formatter={(v) => formatCompact(v)}
                offset={10}
              />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legenda adicional */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3, mt: 2, pr: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: LINE_COLOR, borderRadius: 1 }} />
            <Typography variant="caption">RECEITA OPERACIONAL LIQUIDA (R$)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, bgcolor: BAR_COLOR, borderRadius: 1 }} />
            <Typography variant="caption">VOLUME DE VENDAS (#)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 3, bgcolor: 'success.main', borderRadius: 1 }} />
            <Typography variant="caption">TICKET MEDIO (R$)</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default GraficoEvolucao;
