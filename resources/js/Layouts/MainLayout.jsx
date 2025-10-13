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
    Backdrop,
    Badge
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
    Search as SearchIcon,
    Notifications as NotificationsIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, usePage, router } from '@inertiajs/react';
import { AuthProvider, useAuth } from '@/Components/AuthGuard';
import PremiumFooter from '@/Components/Layout/PremiumFooter';
import GlobalSearch from '@/Components/GlobalSearch';
import TwoFactorWarningBanner from '@/Components/Security/TwoFactorWarningBanner';
import { useAppTheme } from '@/theme/ThemeProvider';
import DarkModeToggle from '@/Components/UI/DarkModeToggle';
import MegaMenu from '@/Components/Navigation/MegaMenu';
import Breadcrumbs from '@/Components/Navigation/Breadcrumbs';
import KeyboardShortcuts from '@/Components/Navigation/KeyboardShortcuts';
import useScrollTrigger from '@/Hooks/useScrollTrigger';

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
                    startIcon={<LoginIcon />}
                    sx={{
                        fontWeight: 500,
                        color: (theme) => theme.palette.mode === 'dark' ? '#fff' : 'text.primary',
                        '&:hover': {
                            background: (theme) => theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(0, 0, 0, 0.04)'
                        }
                    }}
                >
                    Entrar
                </Button>
                <Button
                    onClick={() => router.visit('/register')}
                    variant="outlined"
                    startIcon={<RegisterIcon />}
                    sx={{
                        fontWeight: 500,
                        color: (theme) => theme.palette.mode === 'dark' ? '#fff' : 'text.primary',
                        borderColor: (theme) => theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.3)'
                            : 'rgba(0, 0, 0, 0.23)',
                        '&:hover': {
                            borderColor: (theme) => theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.5)'
                                : 'rgba(0, 0, 0, 0.4)',
                            background: (theme) => theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(0, 0, 0, 0.04)'
                        }
                    }}
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
    const [megaMenuAnchor, setMegaMenuAnchor] = useState(null);
    const scrolled = useScrollTrigger(50);
    const page = usePage();
    const { url } = page;
    const auth = useAuth();

    const handleSearchOpen = () => {
        setSearchOpen(true);
    };

    const handleSearchClose = () => {
        setSearchOpen(false);
    };

    const handleMegaMenuOpen = (event) => {
        setMegaMenuAnchor(event.currentTarget);
    };

    const handleMegaMenuClose = () => {
        setMegaMenuAnchor(null);
    };

    const handleMegaMenuNavigate = (href) => {
        router.visit(href);
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
            {/* Header con Glassmorphism Premium y Shrink Effect */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(145deg, rgba(30, 30, 30, 0.95) 0%, rgba(18, 18, 18, 0.9) 100%)'
                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: (theme) => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: scrolled
                        ? '0 6px 30px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.15)'
                        : (theme) => theme.palette.mode === 'dark'
                            ? '0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                            : '0 4px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: (theme) => theme.palette.mode === 'dark'
                            ? 'linear-gradient(145deg, rgba(59, 130, 246, 0.04) 0%, rgba(147, 197, 253, 0.04) 100%)'
                            : 'linear-gradient(145deg, rgba(59, 130, 246, 0.02) 0%, rgba(147, 197, 253, 0.02) 100%)',
                        pointerEvents: 'none'
                    }
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar sx={{ 
                        justifyContent: 'space-between', 
                        py: scrolled ? 0.5 : 1,
                        minHeight: scrolled ? 56 : 64,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        {/* Logo con animación */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.05)'
                                }
                            }}
                            onClick={() => router.visit('/')}
                        >
                            <BuildIcon
                                sx={{
                                    mr: 1,
                                    color: 'primary.main',
                                    fontSize: 28,
                                    filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))'
                                }}
                            />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    color: 'text.primary',
                                    letterSpacing: '-0.02em'
                                }}
                            >
                                MDR Construcciones
                            </Typography>
                        </Box>

                        {/* Desktop Navigation - Reorganizado con MegaMenu */}
                        {!isMobile && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {/* Navegación Principal */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 2 }}>
                                    {navigationItems.slice(0, -1).map((item) => {
                                        const isServiciosMenu = item.title === 'Servicios';
                                        return (
                                            <Button
                                                key={item.title}
                                                onClick={(e) => {
                                                    if (isServiciosMenu) {
                                                        handleMegaMenuOpen(e);
                                                    } else {
                                                        router.visit(item.href);
                                                    }
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (isServiciosMenu) {
                                                        handleMegaMenuOpen(e);
                                                    }
                                                }}
                                                sx={{
                                                    fontWeight: isActive(item.href) ? 600 : 450,
                                                    minHeight: scrolled ? 40 : 44,
                                                    px: 2,
                                                    color: isActive(item.href) ? 'primary.main' : 'text.primary',
                                                    position: 'relative',
                                                    borderRadius: 2,
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        bottom: 8,
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        width: isActive(item.href) ? '60%' : '0%',
                                                        height: '3px',
                                                        background: 'linear-gradient(90deg, rgba(59, 130, 246, 1), rgba(99, 102, 241, 1))',
                                                        borderRadius: '2px',
                                                        transition: 'width 0.3s ease',
                                                        boxShadow: isActive(item.href) ? '0 0 8px rgba(59, 130, 246, 0.5)' : 'none'
                                                    },
                                                    '&:hover': {
                                                        background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%)',
                                                        '&::before': {
                                                            width: '60%'
                                                        }
                                                    }
                                                }}
                                            >
                                                {item.title}
                                            </Button>
                                        );
                                    })}
                                </Box>

                                {/* Separador visual */}
                                <Box sx={{
                                    width: '1px',
                                    height: '32px',
                                    background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.1), transparent)',
                                    mx: 1
                                }} />

                                {/* Acciones de Usuario */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <IconButton
                                        onClick={handleSearchOpen}
                                        sx={{
                                            minWidth: scrolled ? 40 : 44,
                                            minHeight: scrolled ? 40 : 44,
                                            borderRadius: 2,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                                                transform: 'scale(1.05)'
                                            }
                                        }}
                                    >
                                        <SearchIcon sx={{ color: 'text.primary', fontSize: scrolled ? '1.3rem' : '1.5rem' }} />
                                    </IconButton>

                                    {!auth.isGuest && (
                                        <IconButton
                                            onClick={() => router.visit('/notifications')}
                                            sx={{
                                                minWidth: scrolled ? 40 : 44,
                                                minHeight: scrolled ? 40 : 44,
                                                borderRadius: 2,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                                                    transform: 'scale(1.05)'
                                                }
                                            }}
                                        >
                                            <Badge
                                                badgeContent={auth.user?.unread_notifications || 0}
                                                color="error"
                                                max={99}
                                                sx={{
                                                    '& .MuiBadge-badge': {
                                                        fontSize: '0.65rem',
                                                        minWidth: 18,
                                                        height: 18,
                                                        padding: '0 4px',
                                                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                                                        animation: auth.user?.unread_notifications > 0 ? 'pulse 2s infinite' : 'none',
                                                        '@keyframes pulse': {
                                                            '0%, 100%': { opacity: 1 },
                                                            '50%': { opacity: 0.7 }
                                                        }
                                                    }
                                                }}
                                            >
                                                <NotificationsIcon sx={{ color: 'text.primary', fontSize: scrolled ? '1.3rem' : '1.5rem' }} />
                                            </Badge>
                                        </IconButton>
                                    )}

                                    <DarkModeToggle />
                                    <Button
                                        variant="contained"
                                        onClick={() => router.visit('/contacto')}
                                        sx={{
                                            ml: 1,
                                            minHeight: scrolled ? 40 : 44,
                                            px: scrolled ? 2.5 : 3,
                                            borderRadius: 2,
                                            fontSize: scrolled ? '0.85rem' : '0.9rem',
                                            background: 'linear-gradient(45deg, #F5A524 30%, #F7B850 90%)',
                                            color: '#000',
                                            fontWeight: 600,
                                            boxShadow: '0 4px 12px rgba(245, 165, 36, 0.3)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #D4891E 30%, #F5A524 90%)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 20px rgba(245, 165, 36, 0.4)'
                                            }
                                        }}
                                    >
                                        Pide Presupuesto
                                    </Button>
                                    <UserMenu />
                                </Box>
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

            {/* MegaMenu para Servicios */}
            <MegaMenu
                anchorEl={megaMenuAnchor}
                open={Boolean(megaMenuAnchor)}
                onClose={handleMegaMenuClose}
                onNavigate={handleMegaMenuNavigate}
            />

            {/* Keyboard Shortcuts */}
            <KeyboardShortcuts onSearch={handleSearchOpen} />

            {/* 2FA Warning Banner */}
            <TwoFactorWarningBanner flash={page.props.flash} security={page.props.security} />

            {/* Breadcrumbs */}
            <Breadcrumbs />

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