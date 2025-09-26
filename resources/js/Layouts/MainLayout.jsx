import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    useTheme,
    useMediaQuery,
    Fab,
    Avatar,
    Menu,
    MenuItem,
    Divider
} from '@mui/material';
import {
    Menu as MenuIcon,
    Phone as PhoneIcon,
    WhatsApp as WhatsAppIcon,
    Build as BuildIcon,
    Person as PersonIcon,
    Login as LoginIcon,
    PersonAdd as RegisterIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Dashboard as DashboardIcon
} from '@mui/icons-material';
import { Link, usePage, router } from '@inertiajs/react';
import { AuthProvider, useAuth } from '@/Components/AuthGuard';
import PremiumFooter from '@/Components/Layout/PremiumFooter';

// Componente de menú de usuario
const UserMenu = () => {
    const auth = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        router.post('/logout');
        handleClose();
    };

    if (auth.isGuest) {
        return (
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                    component={Link}
                    href="/login"
                    color="inherit"
                    startIcon={<LoginIcon />}
                    sx={{ fontWeight: 500 }}
                >
                    Entrar
                </Button>
                <Button
                    component={Link}
                    href="/register"
                    variant="outlined"
                    color="inherit"
                    startIcon={<RegisterIcon />}
                    sx={{ fontWeight: 500 }}
                >
                    Registro
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
            >
                {auth.userAvatar ? (
                    <Avatar
                        src={auth.userAvatar}
                        sx={{ width: 32, height: 32 }}
                    />
                ) : (
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {auth.userInitials}
                    </Avatar>
                )}
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        minWidth: 220,
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        '& .MuiMenuItem-root': {
                            borderRadius: 2,
                            mx: 1,
                            my: 0.5,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                background: 'rgba(11, 107, 203, 0.1)',
                                transform: 'translateX(4px)',
                            }
                        },
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'rgba(255, 255, 255, 0.95)',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderBottom: 'none',
                            borderRight: 'none',
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleClose} sx={{ cursor: 'default', '&:hover': { background: 'transparent !important', transform: 'none !important' } }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {auth.userInitials}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Hola, {auth.user?.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {auth.user?.email}
                        </Typography>
                    </Box>
                </MenuItem>
                <Divider sx={{ my: 1 }} />

                <MenuItem component={Link} href="/user/dashboard" onClick={handleClose}>
                    <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                    Mi Perfil
                </MenuItem>

                <MenuItem component={Link} href="/profile/edit" onClick={handleClose}>
                    <SettingsIcon sx={{ mr: 2, color: 'secondary.main' }} />
                    Configuración
                </MenuItem>

                <Divider sx={{ my: 1 }} />

                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        color: 'error.main',
                        '&:hover': {
                            background: 'rgba(211, 47, 47, 0.1) !important',
                            color: 'error.dark'
                        }
                    }}
                >
                    <LogoutIcon sx={{ mr: 2 }} />
                    Cerrar Sesión
                </MenuItem>
            </Menu>
        </Box>
    );
};

// Componente interno del layout que tiene acceso al contexto de autenticación
const MainLayoutContent = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const { url } = usePage();
    const auth = useAuth();

    const navigationItems = [
        { title: 'Inicio', href: '/' },
        { title: 'Servicios', href: '/servicios' },
        { title: 'Proyectos', href: '/proyectos' },
        { title: 'Blog', href: '/blog' },
        { title: 'Empresa', href: '/empresa' },
        { title: 'Contacto', href: '/contacto' },
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const isActive = (href) => {
        if (href === '/') return url === '/';
        return url.startsWith(href);
    };

    const drawer = (
        <Box sx={{ width: 250 }}>
            <List>
                {navigationItems.map((item) => (
                    <ListItem key={item.title} disablePadding>
                        <ListItemButton
                            component={Link}
                            href={item.href}
                            selected={isActive(item.href)}
                            onClick={handleDrawerToggle}
                        >
                            <ListItemText primary={item.title} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <AppBar position="sticky" elevation={1}>
                <Container maxWidth="lg">
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        {/* Logo */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BuildIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography
                                variant="h6"
                                component={Link}
                                href="/"
                                sx={{
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    color: 'inherit',
                                }}
                            >
                                MDR Construcciones
                            </Typography>
                        </Box>

                        {/* Desktop Navigation */}
                        {!isMobile && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {navigationItems.slice(0, -1).map((item) => (
                                    <Button
                                        key={item.title}
                                        component={Link}
                                        href={item.href}
                                        color={isActive(item.href) ? 'primary' : 'inherit'}
                                        sx={{ fontWeight: isActive(item.href) ? 600 : 400 }}
                                    >
                                        {item.title}
                                    </Button>
                                ))}
                                <Button
                                    variant="contained"
                                    color="warning"
                                    component={Link}
                                    href="/contacto"
                                    sx={{ ml: 2 }}
                                >
                                    Pide Presupuesto
                                </Button>
                                <UserMenu />
                            </Box>
                        )}

                        {/* Mobile Menu Button */}
                        {isMobile && (
                            <IconButton
                                color="inherit"
                                edge="start"
                                onClick={handleDrawerToggle}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
            >
                {drawer}
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1 }}>
                {children}
            </Box>

            {/* Floating Action Button - WhatsApp */}
            <Fab
                color="success"
                aria-label="WhatsApp"
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    bgcolor: '#25D366',
                    '&:hover': { bgcolor: '#128C7E' },
                }}
                href="https://wa.me/1234567890"
                component="a"
                target="_blank"
            >
                <WhatsAppIcon />
            </Fab>

            {/* Premium Footer */}
            <PremiumFooter />
        </Box>
    );
};

export default function MainLayout({ children }) {
    return (
        <AuthProvider>
            <MainLayoutContent children={children} />
        </AuthProvider>
    );
}