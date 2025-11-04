import React, { useState, useRef, useEffect } from 'react';
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
    Collapse,
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
// ⚡ PERFORMANCE: Using inline SVG icons instead of @mui/icons-material
// This saves 6.3 MB from the initial bundle
import {
    MenuIcon,
    PhoneIcon,
    WhatsAppIcon,
    BuildIcon,
    EmailIcon,
    PersonIcon,
    LoginIcon,
    RegisterIcon,
    SettingsIcon,
    LogoutIcon,
    DashboardIcon,
    HomeIcon,
    ServicesIcon,
    ProjectsIcon,
    BlogIcon,
    CompanyIcon,
    ContactIcon,
    CloseIcon,
    SearchIcon,
    NotificationsIcon,
    ExpandMoreIcon,
    ExpandLessIcon,
    ApartmentIcon,
    KitchenIcon,
    BathroomIcon
} from '@/Components/Icons/InlineIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, usePage, router } from '@inertiajs/react';
import { AuthProvider, useAuth } from '@/Components/AuthGuard';
import PremiumFooter from '@/Components/Layout/PremiumFooter';
import GlobalSearch from '@/Components/GlobalSearch';
import TwoFactorWarningBanner from '@/Components/Security/TwoFactorWarningBanner';
import ImpersonationBanner from '@/Components/Security/ImpersonationBanner';
import SessionExpiredModal from '@/Components/SessionExpiredModal';
import { useAppTheme } from '@/theme/ThemeProvider';
import DarkModeToggle from '@/Components/UI/DarkModeToggle';
import MegaMenu from '@/Components/Navigation/MegaMenu';
import Breadcrumbs from '@/Components/Navigation/Breadcrumbs';
import KeyboardShortcuts from '@/Components/Navigation/KeyboardShortcuts';
import useScrollTrigger from '@/Hooks/useScrollTrigger';
import NotificationDropdown from '@/Components/Notifications/NotificationDropdown';
import NotificationSystem from '@/Components/Admin/NotificationSystem';
import useAdminNotificationsRealtime from '@/Hooks/useAdminNotificationsRealtime';
import { InactivityProvider } from '@/Contexts/InactivityContext';
import InactivityDetector from '@/Components/Admin/InactivityDetector';
import InactivityTimer from '@/Components/Admin/InactivityTimer';

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Link secundario para Login */}
                <Button
                    onClick={() => router.visit('/login')}
                    variant="text"
                    sx={{
                        fontWeight: 500,
                        fontSize: '0.9375rem',
                        color: (theme) => theme.palette.mode === 'dark' ? 'grey.300' : 'text.secondary',
                        textTransform: 'none',
                        px: 1.5,
                        '&:hover': {
                            background: 'transparent',
                            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : 'text.primary',
                            textDecoration: 'underline'
                        }
                    }}
                >
                    Iniciar sesión
                </Button>

                {/* CTA principal para Registro */}
                <Button
                    onClick={() => router.visit('/register')}
                    variant="contained"
                    startIcon={<RegisterIcon />}
                    sx={{
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        background: (theme) => theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                            : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: '#fff',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                        '&:hover': {
                            background: (theme) => theme.palette.mode === 'dark'
                                ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                                : 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                            boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
                            transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    Comenzar gratis
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
                        backdropFilter: 'blur(12px)',
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
                  auth.user?.roles?.some(r => r.name === 'admin' || r.name === 'editor')) && [
                    <Divider key="admin-divider" sx={{ my: 1 }} />,
                    <MenuItem
                        key="admin-panel"
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
                ]}

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
    const [servicesOpen, setServicesOpen] = useState(false);
    const scrolled = useScrollTrigger(50);
    const page = usePage();
    const { url, props: { flash } } = page;
    const auth = useAuth();

    // ✅ NEW: Session expired modal state
    const [sessionExpiredModal, setSessionExpiredModal] = useState({
        open: false,
        reason: null
    });

    // ✅ NEW: Detect session termination from flash message
    useEffect(() => {
        if (flash?.session_terminated) {
            setSessionExpiredModal({
                open: true,
                reason: flash.session_terminated
            });
        }
    }, [flash]);

    // Ref para controlar el timeout del megamenu
    const megaMenuTimeoutRef = useRef(null);

    // Check if user is admin
    const isAdmin = !auth.isGuest && (auth.user?.role === 'admin' || auth.user?.roles?.some(r => r.name === 'admin'));

    // Admin notifications hook (only enabled for admins)
    const {
        notifications: adminNotifications,
        markAsRead: adminMarkAsRead,
        markAllAsRead: adminMarkAllAsRead,
        deleteNotification: adminDeleteNotification,
        deleteAllRead: adminDeleteAllRead,
        dndEnabled,
        toggleDnd: adminToggleDnd
    } = useAdminNotificationsRealtime(isAdmin);

    const handleSearchOpen = () => {
        setSearchOpen(true);
    };

    const handleSearchClose = () => {
        setSearchOpen(false);
    };

    const handleMegaMenuOpen = (event) => {
        // Cancelar cualquier timeout pendiente
        if (megaMenuTimeoutRef.current) {
            clearTimeout(megaMenuTimeoutRef.current);
            megaMenuTimeoutRef.current = null;
        }
        setMegaMenuAnchor(event.currentTarget);
    };

    const handleMegaMenuClose = () => {
        // Cerrar con un pequeño delay para evitar cierres accidentales
        megaMenuTimeoutRef.current = setTimeout(() => {
            setMegaMenuAnchor(null);
        }, 150);
    };

    const handleMegaMenuCloseImmediate = () => {
        // Cerrar inmediatamente (para click away)
        if (megaMenuTimeoutRef.current) {
            clearTimeout(megaMenuTimeoutRef.current);
            megaMenuTimeoutRef.current = null;
        }
        setMegaMenuAnchor(null);
    };

    const handleMegaMenuNavigate = (href) => {
        handleMegaMenuCloseImmediate();
        router.visit(href);
    };

    // Limpiar timeout al desmontar
    useEffect(() => {
        return () => {
            if (megaMenuTimeoutRef.current) {
                clearTimeout(megaMenuTimeoutRef.current);
            }
        };
    }, []);

    const navigationItems = [
        { title: 'Inicio', href: '/', icon: <HomeIcon /> },
        { title: 'Servicios', href: '/servicios', icon: <ServicesIcon /> },
        { title: 'Proyectos', href: '/proyectos', icon: <ProjectsIcon /> },
        { title: 'Blog', href: '/blog', icon: <BlogIcon /> },
        { title: 'Empresa', href: '/empresa', icon: <CompanyIcon /> },
        { title: 'Contacto', href: '/contacto', icon: <ContactIcon /> },
    ];

    // Servicios destacados para menú móvil (coinciden con destacados del MegaMenu)
    const servicesFeaturedMobile = [
        { id: 'albanileria-general', title: 'Reformas Integrales', href: '/servicios/albanileria-general', icon: <HomeIcon /> },
        { id: 'rehabilitacion-de-fachadas', title: 'Rehabilitación de Fachadas', href: '/servicios/rehabilitacion-de-fachadas', icon: <ApartmentIcon /> },
        { id: 'reforma-de-cocinas', title: 'Cocinas', href: '/servicios/reforma-de-cocinas', icon: <KitchenIcon /> },
        { id: 'reforma-de-banos', title: 'Baños', href: '/servicios/reforma-de-banos', icon: <BathroomIcon /> },
    ];

    const handleDrawerToggle = () => {
        if (mobileOpen) setServicesOpen(false);
        setMobileOpen(!mobileOpen);
    };

    const isActive = (href) => {
        if (href === '/') return url === '/';
        return url.startsWith(href);
    };

    // Enhanced mobile drawer with solid background
    const drawer = (
        <Box
            sx={{
                width: isMobile ? 280 : 300,
                height: '100%',
                background: (theme) => theme.palette.mode === 'dark'
                    ? 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)'
                    : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                borderLeft: (theme) => theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(0, 0, 0, 0.08)',
                position: 'relative',
                overflow: 'auto',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '-8px 0 24px rgba(0, 0, 0, 0.5)'
                    : '-8px 0 24px rgba(0, 0, 0, 0.15)',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(145deg, rgba(59,130,246,0.04) 0%, transparent 50%)'
                        : 'linear-gradient(145deg, rgba(59, 130, 246, 0.03) 0%, transparent 50%)',
                    pointerEvents: 'none',
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.4) 50%, transparent 100%)'
                        : 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)',
                    pointerEvents: 'none',
                }
            }}
        >
            {/* Enhanced Header with Solid Background */}
            <Box sx={{
                p: 3.5,
                borderBottom: (theme) => theme.palette.mode === 'dark'
                    ? '1px solid rgba(255,255,255,0.1)'
                    : '1px solid rgba(0, 0, 0, 0.08)',
                position: 'relative',
                zIndex: 1,
                background: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(30, 41, 59, 0.5)'
                    : 'rgba(248, 250, 252, 0.8)',
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
                            aria-label="Cerrar menú"
                            sx={{
                                color: 'text.secondary',
                                backgroundColor: (theme) => theme.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.08)'
                                    : 'rgba(0, 0, 0, 0.04)',
                                border: (theme) => theme.palette.mode === 'dark'
                                    ? '1px solid rgba(255, 255, 255, 0.12)'
                                    : '1px solid rgba(0, 0, 0, 0.08)',
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                '&:hover': {
                                    backgroundColor: (theme) => theme.palette.mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.12)'
                                        : 'rgba(0, 0, 0, 0.08)',
                                    transform: 'scale(1.05) rotate(90deg)',
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

            {/* Mobile search quick access */}
            <Box sx={{ px: 2.5, pt: 2 }}>
                <Box
                    onClick={() => { handleDrawerToggle(); handleSearchOpen(); }}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.25,
                        borderRadius: 3,
                        cursor: 'pointer',
                        background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.06)',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                            background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'
                        }
                    }}
                >
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Buscar artículos, servicios...
                    </Typography>
                </Box>
            </Box>

            {/* Theme quick toggle */}
            <Box sx={{ px: 2.5, pt: 1 }}>
                <DarkModeToggle showLabel size="small" />
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
                                    if (item.title === 'Servicios') {
                                        setServicesOpen((v) => !v);
                                        return;
                                    }
                                    handleDrawerToggle();
                                    router.visit(item.href);
                                }}
                                aria-haspopup={item.title === 'Servicios' ? true : undefined}
                                aria-expanded={item.title === 'Servicios' ? servicesOpen : undefined}
                                aria-controls={item.title === 'Servicios' ? 'mobile-services-submenu' : undefined}
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
                                        backgroundColor: (theme) => isActive(item.href)
                                            ? 'rgba(59, 130, 246, 0.2)'
                                            : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(255, 255, 255, 0.8)'),
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
                                {item.title === 'Servicios' ? (
                                    servicesOpen ? <ExpandLessIcon sx={{ color: 'text.secondary' }} /> : <ExpandMoreIcon sx={{ color: 'text.secondary' }} />
                                ) : (
                                    isActive(item.href) && (
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
                                    )
                                )}
                            </ListItemButton>
                        </ListItem>
                        {item.title === 'Servicios' && (
                            <Collapse in={servicesOpen} timeout="auto" unmountOnExit>
                                <List id="mobile-services-submenu" component="div" disablePadding sx={{ pl: 1 }}>
                                    {servicesFeaturedMobile.map((svc) => (
                                        <ListItem key={svc.id} disablePadding>
                                            <ListItemButton
                                                onClick={() => {
                                                    handleDrawerToggle();
                                                    router.visit(svc.href);
                                                }}
                                                sx={{
                                                    borderRadius: 3,
                                                    mx: 1.5,
                                                    mb: 1,
                                                    minHeight: 52,
                                                    px: 2,
                                    background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                                    border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                                    '&:hover': {
                                        background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
                                    }
                                }}
                            >
                                                <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                                                    {svc.icon}
                                                </ListItemIcon>
                                                <ListItemText primary={svc.title} primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 550 }} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                    <ListItem disablePadding>
                                        <ListItemButton
                                            onClick={() => {
                                                handleDrawerToggle();
                                                router.visit('/servicios');
                                            }}
                                            sx={{ mx: 1.5, mb: 1, borderRadius: 3 }}
                                        >
                                            <ListItemText
                                                primary="Ver todos los servicios"
                                                primaryTypographyProps={{ color: 'primary.main', fontWeight: 600 }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                </List>
                            </Collapse>
                        )}
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
                        ? scrolled
                            ? 'linear-gradient(145deg, rgba(20, 20, 20, 0.98) 0%, rgba(10, 10, 10, 0.95) 100%)'
                            : 'linear-gradient(145deg, rgba(30, 30, 30, 0.95) 0%, rgba(18, 18, 18, 0.9) 100%)'
                        : scrolled
                            ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 250, 252, 0.95) 100%)'
                            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    backdropFilter: scrolled ? 'blur(20px)' : 'blur(12px)',
                    WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'blur(12px)',
                    borderBottom: (theme) => theme.palette.mode === 'dark'
                        ? scrolled
                            ? '1px solid rgba(255, 255, 255, 0.15)'
                            : '1px solid rgba(255, 255, 255, 0.1)'
                        : scrolled
                            ? '1px solid rgba(0, 0, 0, 0.1)'
                            : '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: scrolled
                        ? '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                        : (theme) => theme.palette.mode === 'dark'
                            ? '0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                            : '0 4px 24px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: scrolled ? 'translateY(0)' : 'translateY(0)',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: (theme) => theme.palette.mode === 'dark'
                            ? scrolled
                                ? 'linear-gradient(145deg, rgba(59, 130, 246, 0.06) 0%, rgba(147, 197, 253, 0.06) 100%)'
                                : 'linear-gradient(145deg, rgba(59, 130, 246, 0.04) 0%, rgba(147, 197, 253, 0.04) 100%)'
                            : scrolled
                                ? 'linear-gradient(145deg, rgba(59, 130, 246, 0.03) 0%, rgba(147, 197, 253, 0.03) 100%)'
                                : 'linear-gradient(145deg, rgba(59, 130, 246, 0.02) 0%, rgba(147, 197, 253, 0.02) 100%)',
                        pointerEvents: 'none',
                        opacity: scrolled ? 1 : 0.7,
                        transition: 'opacity 0.4s ease'
                    }
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr auto' : 'auto 1fr auto',
                            alignItems: 'center',
                            gap: isMobile ? 2 : 4,
                            py: scrolled ? 0.5 : 1,
                            minHeight: scrolled ? 56 : 64,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            px: { xs: 1, sm: 2 }
                        }}
                    >
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
                                    fontSize: scrolled ? 26 : 28,
                                    filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))',
                                    transition: 'font-size 0.3s ease'
                                }}
                            />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    color: 'text.primary',
                                    letterSpacing: '-0.02em',
                                    fontSize: scrolled ? '1.1rem' : '1.25rem',
                                    transition: 'font-size 0.3s ease',
                                    display: { xs: 'none', sm: 'block' }
                                }}
                            >
                                MDR Construcciones
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    color: 'text.primary',
                                    letterSpacing: '-0.02em',
                                    fontSize: scrolled ? '1rem' : '1.1rem',
                                    transition: 'font-size 0.3s ease',
                                    display: { xs: 'block', sm: 'none' }
                                }}
                            >
                                MDR
                            </Typography>
                        </Box>

                        {/* Desktop Navigation - Centrado y mejorado */}
                        {!isMobile && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 0.5
                                }}
                            >
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
                                            onMouseLeave={() => {
                                                if (isServiciosMenu) {
                                                    handleMegaMenuClose();
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (isServiciosMenu && (e.key === 'ArrowDown')) {
                                                    handleMegaMenuOpen(e);
                                                }
                                            }}
                                            aria-haspopup={isServiciosMenu ? true : undefined}
                                            aria-controls={isServiciosMenu ? 'services-megamenu' : undefined}
                                            aria-expanded={isServiciosMenu ? Boolean(megaMenuAnchor) : undefined}
                                            aria-current={isActive(item.href) ? 'page' : undefined}
                                            sx={{
                                                fontWeight: isActive(item.href) ? 600 : 500,
                                                fontSize: '0.9375rem',
                                                minHeight: scrolled ? 40 : 44,
                                                px: 2.5,
                                                color: isActive(item.href) ? 'primary.main' : 'text.primary',
                                                position: 'relative',
                                                borderRadius: 2,
                                                textTransform: 'none',
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
                        )}

                        {/* Acciones de Usuario - Lado derecho */}
                        {!isMobile && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                                <IconButton
                                    onClick={handleSearchOpen}
                                    aria-label="Buscar"
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
                                    <>
                                        {/* Show NotificationSystem for admins, NotificationDropdown for regular users */}
                                        {isAdmin ? (
                                            <NotificationSystem
                                                notifications={adminNotifications}
                                                onMarkAsRead={adminMarkAsRead}
                                                onMarkAllAsRead={adminMarkAllAsRead}
                                                onDeleteNotification={adminDeleteNotification}
                                                onDeleteAllRead={adminDeleteAllRead}
                                                dndEnabled={dndEnabled}
                                                onToggleDnd={adminToggleDnd}
                                            />
                                        ) : (
                                            <NotificationDropdown
                                                unreadCount={auth.user?.unread_notifications || 0}
                                            />
                                        )}

                                        {/* Inactivity Timer - Muestra tiempo restante antes de logout */}
                                        <InactivityTimer />
                                    </>
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
                                        textTransform: 'none',
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
                        )}

                        {/* Mobile Menu Button */}
                        {isMobile && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DarkModeToggle size="small" />
                                <IconButton
                                    color="inherit"
                                    edge="start"
                                    onClick={handleDrawerToggle}
                                    sx={{
                                        color: 'text.primary',
                                        borderRadius: 2,
                                        '&:hover': {
                                            background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)'
                                        }
                                    }}
                                    aria-label="Abrir menú"
                                >
                                    <MenuIcon />
                                </IconButton>
                            </Box>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                    sx: { zIndex: (theme) => theme.zIndex.drawer }
                }}
                BackdropProps={{ sx: { zIndex: (theme) => theme.zIndex.drawer - 1 } }}
                PaperProps={{ sx: { zIndex: (theme) => theme.zIndex.drawer + 1 } }}
                sx={{ zIndex: (theme) => theme.zIndex.drawer }}
            >
                {drawer}
            </Drawer>

            {/* MegaMenu para Servicios */}
            <MegaMenu
                id="services-megamenu"
                anchorEl={megaMenuAnchor}
                open={Boolean(megaMenuAnchor)}
                onClose={handleMegaMenuClose}
                onCloseImmediate={handleMegaMenuCloseImmediate}
                onNavigate={handleMegaMenuNavigate}
                onMouseEnter={() => {
                    if (megaMenuTimeoutRef.current) {
                        clearTimeout(megaMenuTimeoutRef.current);
                        megaMenuTimeoutRef.current = null;
                    }
                }}
            />

            {/* Keyboard Shortcuts */}
            <KeyboardShortcuts onSearch={handleSearchOpen} />

            {/* Impersonation Banner */}
            <ImpersonationBanner />

            {/* 2FA Warning Banner */}
            <TwoFactorWarningBanner flash={page.props.flash} security={page.props.security} />

            {/* Breadcrumbs */}
            <Breadcrumbs />

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    marginTop: page.props.impersonation?.isActive ? '64px' : 0,
                    transition: 'margin-top 0.3s ease',
                }}
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
                    zIndex: (theme) => theme.zIndex.drawer - 2,
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

            {/* Inactivity Detector - Auto-logout por inactividad para todos los usuarios autenticados */}
            {!auth.isGuest && (
                <InactivityDetector
                    enabled={true}
                    inactivityTimeout={15 * 60 * 1000} // 15 minutos
                    warningTime={3 * 60 * 1000} // Advertencia 3 minutos antes
                    heartbeatInterval={2 * 60 * 1000} // Heartbeat cada 2 minutos
                    debug={false}
                />
            )}

            {/* ✅ NEW: Session Expired Modal */}
            <SessionExpiredModal
                open={sessionExpiredModal.open}
                reason={sessionExpiredModal.reason}
                onClose={() => {
                    setSessionExpiredModal({ open: false, reason: null });
                    // Redirect to login if not already there
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                }}
            />
        </Box>
    );
};

export default function MainLayout({ children }) {
    return (
        <AuthProvider>
            <InactivityProvider totalTimeout={15 * 60 * 1000}>
                <MainLayoutContent children={children} />
            </InactivityProvider>
        </AuthProvider>
    );
}
