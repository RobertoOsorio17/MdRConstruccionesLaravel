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
    ListItemIcon,
    useTheme,
    useMediaQuery,
    Fab,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Slide,
    Backdrop
} from '@mui/material';
import {
    Menu as MenuIcon,
    Phone as PhoneIcon,
    WhatsApp as WhatsAppIcon,
    Build as BuildIcon,
    Email as EmailIcon,
    Person as PersonIcon,
    Login as LoginIcon,
    PersonAdd as RegisterIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Dashboard as DashboardIcon,
    Home as HomeIcon,
    BusinessCenter as ServicesIcon,
    Work as ProjectsIcon,
    Article as BlogIcon,
    Info as CompanyIcon,
    ContactMail as ContactIcon,
    Close as CloseIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, usePage, router } from '@inertiajs/react';
import { AuthProvider, useAuth } from '@/Components/AuthGuard';
import PremiumFooter from '@/Components/Layout/PremiumFooter';
import GlobalSearch from '@/Components/GlobalSearch';
import TwoFactorWarningBanner from '@/Components/Security/TwoFactorWarningBanner';
import { useAppTheme } from '@/theme/ThemeProvider';
import DarkModeToggle from '@/Components/UI/DarkModeToggle';

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
                    onClick={() => router.visit('/login')}
                    color="inherit"
                    startIcon={<LoginIcon />}
                    sx={{ fontWeight: 500 }}
                >
                    Entrar
                </Button>
                <Button
                    onClick={() => router.visit('/register')}
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

                <MenuItem onClick={() => { handleClose(); router.visit('/user/dashboard'); }}>
                    <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                    Mi Perfil
                </MenuItem>

                <MenuItem onClick={() => { handleClose(); router.visit('/profile/settings'); }}>
                    <SettingsIcon sx={{ mr: 2, color: 'secondary.main' }} />
                    Configuración
                </MenuItem>

                {/* Admin Panel Access - Only for admin/editor roles */}
                {(auth.user?.role === 'admin' || auth.user?.role === 'editor' ||
                  auth.user?.roles?.some(r => r.name === 'admin' || r.name === 'editor')) && (
                    <>
                        <Divider sx={{ my: 1 }} />
                        <MenuItem
                            onClick={() => { handleClose(); router.visit('/admin/dashboard'); }}
                            sx={{
                                background: 'linear-gradient(135deg, rgba(11, 107, 203, 0.1), rgba(11, 107, 203, 0.05))',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, rgba(11, 107, 203, 0.2), rgba(11, 107, 203, 0.1))',
                                }
                            }}
                        >
                            <DashboardIcon sx={{ mr: 2, color: 'primary.main' }} />
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    Panel de Administración
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    Gestionar contenido
                                </Typography>
                            </Box>
                        </MenuItem>
                    </>
                )}

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
    const { designSystem } = useAppTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const page = usePage();
    const { url } = page;
    const auth = useAuth();

    const handleSearchOpen = () => {
        setSearchOpen(true);
    };

    const handleSearchClose = () => {
        setSearchOpen(false);
    };

    const navigationItems = [
        { title: 'Inicio', href: '/', icon: <HomeIcon /> },
        { title: 'Servicios', href: '/servicios', icon: <ServicesIcon /> },
        { title: 'Proyectos', href: '/proyectos', icon: <ProjectsIcon /> },
        { title: 'Blog', href: '/blog', icon: <BlogIcon /> },
        { title: 'Empresa', href: '/empresa', icon: <CompanyIcon /> },
        { title: 'Contacto', href: '/contacto', icon: <ContactIcon /> },
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const isActive = (href) => {
        if (href === '/') return url === '/';
        return url.startsWith(href);
    };

    // Enhanced mobile drawer with premium glassmorphism
    const drawer = (
        <Box
            sx={{
                width: isMobile ? 280 : 300,
                height: '100%',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)', // Safari support
                borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 197, 253, 0.08) 50%, rgba(99, 102, 241, 0.08) 100%)',
                    pointerEvents: 'none',
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)',
                    pointerEvents: 'none',
                }
            }}
        >
            {/* Enhanced Header with Premium Design */}
            <Box sx={{
                p: 3.5,
                borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
                position: 'relative',
                zIndex: 1,
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
                backdropFilter: 'blur(12px)',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, x: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Avatar
                                sx={{
                                    width: 52,
                                    height: 52,
                                    background: 'linear-gradient(145deg, #3b82f6 0%, #6366f1 100%)',
                                    boxShadow: '0 12px 24px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: '0 16px 32px rgba(59, 130, 246, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.3)',
                                    }
                                }}
                            >
                                <BuildIcon sx={{ color: 'white', fontSize: 26 }} />
                            </Avatar>
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                        color: 'text.primary',
                                        fontSize: '1.15rem',
                                        lineHeight: 1.2,
                                        letterSpacing: '-0.01em'
                                    }}
                                >
                                    MDR Construcciones
                                </Typography>
                            </Box>
                        </Box>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <IconButton
                            onClick={handleDrawerToggle}
                            sx={{
                                color: 'text.secondary',
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                width: 44,
                                height: 44,
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                    transform: 'scale(1.1) rotate(90deg)',
                                    borderColor: 'rgba(255, 255, 255, 0.4)',
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <CloseIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </motion.div>
                </Box>
                <Typography
                    variant="body2"
                    sx={{
                        color: 'text.secondary',
                        fontSize: '0.85rem',
                        opacity: 0.85,
                        fontWeight: 500,
                        letterSpacing: '0.01em'
                    }}
                >
                    Construcción y reformas profesionales
                </Typography>
            </Box>

            {/* Enhanced Navigation Items */}
            <List sx={{ p: 2.5, position: 'relative', zIndex: 1 }}>
                {navigationItems.map((item, index) => (
                    <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -30, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{
                            delay: index * 0.08,
                            duration: 0.4,
                            type: "spring",
                            stiffness: 300,
                            damping: 25
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <ListItem disablePadding sx={{ mb: 1.5 }}>
                            <ListItemButton
                                onClick={() => {
                                    handleDrawerToggle();
                                    router.visit(item.href);
                                }}
                                sx={{
                                    borderRadius: 4,
                                    minHeight: 60, // Enhanced touch-friendly height
                                    px: 2.5,
                                    py: 2,
                                    backgroundColor: isActive(item.href)
                                        ? 'rgba(59, 130, 246, 0.18)'
                                        : 'rgba(255, 255, 255, 0.05)',
                                    border: isActive(item.href)
                                        ? '1px solid rgba(59, 130, 246, 0.35)'
                                        : '1px solid rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(12px)',
                                    boxShadow: isActive(item.href)
                                        ? '0 8px 16px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                        : '0 4px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        backgroundColor: isActive(item.href)
                                            ? 'rgba(59, 130, 246, 0.2)'
                                            : 'rgba(255, 255, 255, 0.8)',
                                        transform: 'translateX(4px)',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                    },
                                    '&:active': {
                                        transform: 'translateX(2px) scale(0.98)',
                                    }
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 44,
                                        color: isActive(item.href) ? 'primary.main' : 'text.secondary',
                                        transition: 'all 0.3s ease',
                                        '& svg': {
                                            fontSize: '1.4rem',
                                            filter: isActive(item.href) ? 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))' : 'none'
                                        }
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.title}
                                    primaryTypographyProps={{
                                        fontWeight: isActive(item.href) ? 650 : 520,
                                        fontSize: '1.05rem',
                                        color: isActive(item.href) ? 'primary.main' : 'text.primary',
                                        transition: 'all 0.3s ease',
                                        letterSpacing: '0.01em'
                                    }}
                                />
                                {isActive(item.href) && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(145deg, #3b82f6 0%, #6366f1 100%)',
                                                ml: 1,
                                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </ListItemButton>
                        </ListItem>
                    </motion.div>
                ))}
            </List>

            {/* Enhanced User Section */}
            <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 3,
                borderTop: '1px solid rgba(255, 255, 255, 0.25)',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
                backdropFilter: 'blur(12px)',
                zIndex: 1
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <UserMenu />
                </motion.div>
            </Box>
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
                                onClick={() => router.visit('/')}
                                sx={{
                                    cursor: 'pointer',
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
                                        onClick={() => router.visit(item.href)}
                                        color={isActive(item.href) ? 'primary' : 'inherit'}
                                        sx={{ 
                                            fontWeight: isActive(item.href) ? 600 : 400,
                                            minHeight: 44,
                                            px: 2
                                        }}
                                    >
                                        {item.title}
                                    </Button>
                                ))}
                                <IconButton
                                    onClick={handleSearchOpen}
                                    color="inherit"
                                    sx={{
                                        ml: 1,
                                        minWidth: 44,
                                        minHeight: 44,
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    }}
                                >
                                    <SearchIcon />
                                </IconButton>
                                <DarkModeToggle />
                                <Button
                                    variant="contained"
                                    color="warning"
                                    onClick={() => router.visit('/contacto')}
                                    sx={{ 
                                        ml: 2,
                                        minHeight: 44
                                    }}
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

            {/* 2FA Warning Banner */}
            <TwoFactorWarningBanner flash={page.props.flash} security={page.props.security} />

            {/* Main Content */}
            <Box 
                component="main" 
                id="main-content"
                sx={{ flexGrow: 1 }}
            >
                {children}
            </Box>

            {/* Floating Action Button - WhatsApp */}
            <Fab
                color="success"
                aria-label="Contactar por WhatsApp"
                sx={{
                    position: 'fixed',
                    bottom: isMobile ? 80 : 24,
                    right: isMobile ? 16 : 24,
                    bgcolor: '#25D366',
                    minWidth: 56,
                    minHeight: 56,
                    zIndex: designSystem.zIndex.fab,
                    boxShadow: designSystem.shadows.xl,
                    transition: designSystem.transitions.presets.allNormal,
                    '&:hover': { 
                        bgcolor: '#128C7E',
                        transform: 'scale(1.1)',
                        boxShadow: designSystem.shadows['2xl']
                    },
                    '&:active': {
                        transform: 'scale(0.95)'
                    }
                }}
                href="https://wa.me/1234567890"
                component="a"
                target="_blank"
                rel="noopener noreferrer"
            >
                <WhatsAppIcon />
            </Fab>

            {/* Premium Footer */}
            <PremiumFooter />

            {/* Global Search Dialog */}
            <GlobalSearch open={searchOpen} onClose={handleSearchClose} />
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