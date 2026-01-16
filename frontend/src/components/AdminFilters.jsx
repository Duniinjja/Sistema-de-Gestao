import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  Button,
  TextField,
  Divider,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { useFilter } from '../context/FilterContext';
import { useAuth } from '../context/AuthContext';

const AdminFilters = ({
  showUsuarioFilter = true,
  showEmpresaFilter = true,
  showDateFilter = true,
  onFilterChange,
}) => {
  const { isAdminChefe } = useAuth();
  const {
    selectedUsuario,
    setSelectedUsuario,
    selectedEmpresa,
    setSelectedEmpresa,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    usuarios,
    empresas,
    loadingFilters,
    hasActiveFilters,
    resetFilters,
    getActiveFilterLabel,
    getDateRangeLabel,
  } = useFilter();

  const [expanded, setExpanded] = React.useState(true);

  // Se não for Admin Chefe e não mostrar filtro de data, não renderiza nada
  if (!isAdminChefe() && !showDateFilter) {
    return null;
  }

  const handleUsuarioChange = (event) => {
    setSelectedUsuario(event.target.value);
    if (onFilterChange) {
      onFilterChange();
    }
  };

  const handleEmpresaChange = (event) => {
    setSelectedEmpresa(event.target.value);
    if (onFilterChange) {
      onFilterChange();
    }
  };

  const handleDataInicioChange = (event) => {
    setDataInicio(event.target.value);
    if (onFilterChange) {
      onFilterChange();
    }
  };

  const handleDataFimChange = (event) => {
    setDataFim(event.target.value);
    if (onFilterChange) {
      onFilterChange();
    }
  };

  const handleResetFilters = () => {
    resetFilters();
    if (onFilterChange) {
      onFilterChange();
    }
  };

  // Para usuários normais, mostra apenas filtro de data
  const showAdminFilters = isAdminChefe();
  const filterTitle = showAdminFilters ? 'Filtros Avançados' : 'Filtrar por Período';

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        border: '1px solid',
        borderColor: hasActiveFilters() ? 'primary.main' : 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header do filtro */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: hasActiveFilters() ? 'primary.50' : 'grey.50',
          borderBottom: expanded ? '1px solid' : 'none',
          borderColor: 'divider',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <FilterIcon color={hasActiveFilters() ? 'primary' : 'action'} />
          <Typography variant="subtitle1" fontWeight={600}>
            {filterTitle}
          </Typography>
          {showDateFilter && dataInicio && dataFim && (
            <Chip
              icon={<DateRangeIcon fontSize="small" />}
              label={getDateRangeLabel()}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          )}
          {showAdminFilters && hasActiveFilters() && getActiveFilterLabel() !== 'Visão Geral' && (
            <Chip
              label={getActiveFilterLabel()}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {hasActiveFilters() && (
            <Tooltip title="Limpar filtros">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetFilters();
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
      </Box>

      {/* Conteúdo dos filtros */}
      <Collapse in={expanded}>
        <Box sx={{ p: 3 }}>
          {/* Filtro de Data - sempre visível */}
          {showDateFilter && (
            <Box sx={{ mb: showAdminFilters ? 3 : 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <DateRangeIcon color="primary" fontSize="small" />
                <Typography variant="subtitle2" color="primary.main" fontWeight={600}>
                  Período
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr auto' },
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                <TextField
                  fullWidth
                  label="Data Início"
                  type="date"
                  value={dataInicio}
                  onChange={handleDataInicioChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    sx: { bgcolor: 'background.paper' },
                  }}
                />
                <TextField
                  fullWidth
                  label="Data Fim"
                  type="date"
                  value={dataFim}
                  onChange={handleDataFimChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    sx: { bgcolor: 'background.paper' },
                  }}
                />
                {!showAdminFilters && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleResetFilters}
                    disabled={!hasActiveFilters()}
                    startIcon={<ClearIcon />}
                    sx={{
                      height: 56,
                      minWidth: { xs: '100%', md: 150 },
                    }}
                  >
                    Limpar
                  </Button>
                )}
              </Box>
            </Box>
          )}

          {/* Filtros Admin Chefe */}
          {showAdminFilters && (showUsuarioFilter || showEmpresaFilter) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BusinessIcon color="secondary" fontSize="small" />
                <Typography variant="subtitle2" color="secondary.main" fontWeight={600}>
                  Filtros do Admin Chefe
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: showUsuarioFilter && showEmpresaFilter ? '1fr 1fr' : '1fr',
                    md: showUsuarioFilter && showEmpresaFilter ? '1fr 1fr auto' : '1fr auto',
                  },
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                {/* Filtro por Usuário */}
                {showUsuarioFilter && (
                  <FormControl fullWidth disabled={loadingFilters}>
                    <InputLabel id="usuario-filter-label">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonIcon fontSize="small" />
                        Filtrar por Usuário
                      </Box>
                    </InputLabel>
                    <Select
                      labelId="usuario-filter-label"
                      value={selectedUsuario}
                      onChange={handleUsuarioChange}
                      label="Filtrar por Usuário   "
                    >
                      <MenuItem value="todos">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography>Todos os Usuários</Typography>
                        </Box>
                      </MenuItem>
                      {usuarios.map((usuario) => (
                        <MenuItem key={usuario.id} value={usuario.id}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2">{usuario.nome || usuario.email}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {usuario.email} {usuario.empresa_nome ? `• ${usuario.empresa_nome}` : ''}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Filtro por Empresa */}
                {showEmpresaFilter && (
                  <FormControl fullWidth disabled={loadingFilters}>
                    <InputLabel id="empresa-filter-label">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BusinessIcon fontSize="small" />
                        Filtrar por Empresa
                      </Box>
                    </InputLabel>
                    <Select
                      labelId="empresa-filter-label"
                      value={selectedEmpresa}
                      onChange={handleEmpresaChange}
                      label="Filtrar por Empresa   "
                    >
                      <MenuItem value="todos">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon fontSize="small" color="action" />
                          <Typography>Todas as Empresas</Typography>
                        </Box>
                      </MenuItem>
                      {empresas.map((empresa) => (
                        <MenuItem key={empresa.id} value={empresa.id}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2">{empresa.nome}</Typography>
                            {empresa.cnpj && (
                              <Typography variant="caption" color="text.secondary">
                                CNPJ: {empresa.cnpj}
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Botão de reset */}
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleResetFilters}
                  disabled={!hasActiveFilters()}
                  startIcon={<ClearIcon />}
                  sx={{
                    height: 56,
                    minWidth: { xs: '100%', md: 150 },
                  }}
                >
                  Limpar Todos
                </Button>
              </Box>
            </>
          )}

          {/* Informação sobre os filtros ativos */}
          {hasActiveFilters() && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'primary.50',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <FilterIcon fontSize="small" color="primary" />
              <Typography variant="body2" color="primary.main">
                Filtros ativos: <strong>{getDateRangeLabel()}</strong>
                {showAdminFilters && getActiveFilterLabel() !== 'Visão Geral' && (
                  <> | <strong>{getActiveFilterLabel()}</strong></>
                )}
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AdminFilters;
