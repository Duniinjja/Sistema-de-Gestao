import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Popover,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as ShoppingCartIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidthExpanded = 240;
const drawerWidthCollapsed = 72;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdminChefe, isUsuarioEmpresa, getUserPhotoUrl, getUserInitials } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerExpandToggle = () => {
    setIsDrawerExpanded(!isDrawerExpanded);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };

  const handleNavigateProfile = () => {
    handleUserMenuClose();
    navigate('/perfil');
  };

 const menuItems = isUsuarioEmpresa() ? [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Despesas', icon: <ReceiptIcon />, path: '/despesas' },
    { text: 'Vendas', icon: <ShoppingCartIcon />, path: '/vendas' },
    { text: 'Receitas', icon: <AccountBalanceIcon />, path: '/receitas' },
    { text: 'Relatórios', icon: <AssessmentIcon />, path: '/relatorios' },
  ] : [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Despesas', icon: <ReceiptIcon />, path: '/despesas' },
    { text: 'Vendas', icon: <ShoppingCartIcon />, path: '/vendas' },
    { text: 'Receitas', icon: <AccountBalanceIcon />, path: '/receitas' },
    { text: 'Cadastros', icon: <PeopleIcon />, path: '/cadastros' },
    { text: 'Relatórios', icon: <AssessmentIcon />, path: '/relatorios' },
  ];

  // Determina a largura atual do drawer
  const currentDrawerWidth = isMobile
    ? drawerWidthExpanded
    : (isDrawerExpanded || isHovering ? drawerWidthExpanded : drawerWidthCollapsed);

  const drawer = (isCollapsed = false) => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)',
      }}
    >
      {/* Header com logo e botão de toggle */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          px: isCollapsed ? 1 : 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        {!isCollapsed && (
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              color: 'white',
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            {user?.empresa_nome || 'Gestão'}
          </Typography>
        )}
        {!isMobile && (
          <IconButton
            onClick={handleDrawerExpandToggle}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            {isDrawerExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
      </Box>

      {/* Menu Items */}
      <List sx={{ px: 1, py: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          const listItemButton = (
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                minHeight: 48,
                borderRadius: 2,
                mb: 0.5,
                px: isCollapsed ? 1.5 : 2,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                backgroundColor: isActive
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: isActive
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(255, 255, 255, 0.08)',
                },
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 4,
                  height: isActive ? '70%' : 0,
                  backgroundColor: '#fff',
                  borderRadius: '0 4px 4px 0',
                  transition: 'height 0.2s ease-in-out',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: isCollapsed ? 0 : 2,
                  justifyContent: 'center',
                  color: 'white',
                  '& svg': {
                    fontSize: 24,
                    transition: 'transform 0.2s ease-in-out',
                  },
                  '&:hover svg': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                    color: 'white',
                  }}
                />
              )}
            </ListItemButton>
          );

          return (
            <ListItem key={item.text} disablePadding>
              {isCollapsed ? (
                <Tooltip title={item.text} placement="right" arrow>
                  {listItemButton}
                </Tooltip>
              ) : (
                listItemButton
              )}
            </ListItem>
          );
        })}
      </List>

      {/* Footer com informações do usuário (apenas quando expandido) - clicável */}
      {!isCollapsed && (
        <Box
          onClick={handleUserMenuOpen}
          sx={{
            p: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={getUserPhotoUrl()}
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {getUserInitials()}
            </Avatar>
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.first_name || user?.nome} {user?.last_name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
              >
                {isAdminChefe() ? 'Admin Chefe' : user?.empresa_nome}
              </Typography>
            </Box>
            <ArrowUpIcon
              sx={{
                fontSize: 18,
                color: 'rgba(255, 255, 255, 0.6)',
                transition: 'transform 0.2s ease',
                transform: Boolean(userMenuAnchor) ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', md: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { md: `${currentDrawerWidth}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar>
          {/* Menu button para mobile */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Título */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            {user?.empresa_nome || 'Sistema de Gestão'}
          </Typography>

          {/* User menu - toda a área é clicável */}
          <Box
            onClick={handleUserMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: 3,
              transition: 'all 0.2s ease',
              border: '1px solid transparent',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                {user?.first_name || user?.nome} {user?.last_name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1 }}
              >
                {isAdminChefe() ? 'Admin Chefe' : user?.empresa_nome || 'Usuário'}
              </Typography>
            </Box>
            <Avatar
              src={getUserPhotoUrl()}
              sx={{
                width: 42,
                height: 42,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              }}
            >
              {getUserInitials()}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Popover elegante do menu do usuário */}
      <Popover
        open={Boolean(userMenuAnchor)}
        anchorEl={userMenuAnchor}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              width: 220,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
            },
          },
        }}
      >
        {/* Header do menu */}
        <Box
          sx={{
            p: 2,
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={getUserPhotoUrl()}
              sx={{
                width: 44,
                height: 44,
                border: '2px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              {getUserInitials()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.first_name || user?.nome} {user?.last_name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.85,
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Opções do menu */}
        <Box sx={{ py: 1 }}>
          <Box
            onClick={handleNavigateProfile}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.25,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: 'rgba(30, 60, 114, 0.08)',
              },
            }}
          >
            <PersonIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Meu Perfil
            </Typography>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <Box
            onClick={handleLogout}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.25,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.08)',
              },
            }}
          >
            <LogoutIcon sx={{ fontSize: 20, color: 'error.main' }} />
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main' }}>
              Sair
            </Typography>
          </Box>
        </Box>
      </Popover>

      {/* Drawer para mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidthExpanded,
            border: 'none',
          },
        }}
      >
        {drawer(false)}
      </Drawer>

      {/* Drawer permanente para desktop com hover */}
      <Drawer
        variant="permanent"
        onMouseEnter={() => !isDrawerExpanded && setIsHovering(true)}
        onMouseLeave={() => !isDrawerExpanded && setIsHovering(false)}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: currentDrawerWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            border: 'none',
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
          },
        }}
        open
      >
        {drawer(!isDrawerExpanded && !isHovering)}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xs: '100%', md: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { md: `${currentDrawerWidth}px` },
          minHeight: '100vh',
          backgroundColor: '#f5f7fa',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
