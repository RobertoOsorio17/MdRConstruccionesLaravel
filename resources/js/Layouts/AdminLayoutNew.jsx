import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { InactivityProvider } from '@/Contexts/InactivityContext';
import InactivityDetector from '@/Components/Admin/InactivityDetector';
import InactivityTimer from '@/Components/Admin/InactivityTimer';
import {
    Box,
    CssBaseline,
    IconButton,
    Typography,
    useTheme,
    alpha,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Badge,
    Tooltip,
    Paper,
    Collapse,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    AppBar,
    Toolbar,
    Drawer,
    Alert,
    Snackbar,
    useMediaQuery
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Build as BuildIcon,
    Work as WorkIcon,
    Article as ArticleIcon,
    People as PeopleIcon,
    Settings as SettingsIcon,
    ExitToApp as LogoutIcon,
    Person as PersonIcon,
    Home as HomeIcon,
    Notifications as NotificationsIcon,
    Security as SecurityIcon,
    ExpandLess,
    ExpandMore,
    Shield as ShieldIcon,
    Comment as CommentIcon,
    Analytics as AnalyticsIcon,
    Category as CategoryIcon,
    Tag as TagIcon,
    ContactMail as ContactMailIcon,
    Close as CloseIcon,
    Flag as FlagIcon,
    PhotoLibrary as PhotoLibraryIcon,
    Gavel as GavelIcon
} from '@mui/icons-material';
import NotificationCenter from '@/Components/Admin/NotificationCenter';
import BreadcrumbsWithFilters from '@/Components/Admin/BreadcrumbsWithFilters';
import ImpersonationBanner from '@/Components/Security/ImpersonationBanner';
import SessionExpiredModal from '@/Components/SessionExpiredModal';

const drawerWidth = 280;
const drawerWidthCollapsed = 72;

// Solid surface styles for better contrast in data-heavy interfaces
const glassmorphismStyles = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
};

// Sidebar with solid surface for better readability
const getSidebarStyles = (theme) => ({
    background: theme.palette.mode === 'dark'
        ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
        : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    backdropFilter: 'blur(8px)',
    borderRight: theme.palette.mode === 'dark'
        ? '1px solid rgba(255, 255, 255, 0.08)'
        : '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: theme.palette.mode === 'dark'
        ? '2px 0 12px rgba(0, 0, 0, 0.3)'
        : '2px 0 12px rgba(0, 0, 0, 0.05)',
});

// Header with solid surface
const getHeaderStyles = (theme) => ({
    background: theme.palette.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.92)'
        : alpha(theme.palette.background.paper, 0.85),
    backdropFilter: 'blur(10px)',
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.16)}`,
    boxShadow: theme.palette.mode === 'dark'
        ? '0 2px 12px rgba(0, 0, 0, 0.35)'
        : `0 2px 12px ${alpha(theme.palette.common.black, 0.06)}`,
});

// Animation variants
const sidebarVariants = {
    open: {
        x: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    },
    closed: {
        x: -drawerWidth,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    }
};

const menuItemVariants = {
    hover: {
        scale: 1.02,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        transition: {
            duration: 0.2
        }
    },
    tap: {
        scale: 0.98
    }
};

const AdminLayoutNew = ({
    children,
    title = 'Admin Panel',
    breadcrumbs = [],
    quickFilters = [],
    onFilterChange,
    showFilters = true
}) => {
    const theme = useTheme();
    const { auth, flash, impersonation } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    // Load drawer collapsed state from localStorage
    const [drawerCollapsed, setDrawerCollapsed] = useState(() => {
        const saved = localStorage.getItem('admin-drawer-collapsed');
        return saved ? JSON.parse(saved) : false;
    });

    const [userMenuAnchor, setUserMenuAnchor] = useState(null);

    // Load expanded menus state from localStorage
    const [expandedMenus, setExpandedMenus] = useState(() => {
        const saved = localStorage.getItem('admin-expanded-menus');
        return saved ? JSON.parse(saved) : {};
    });

    const [flashMessage, setFlashMessage] = useState(null);
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const isMedium = useMediaQuery(theme.breakpoints.between('md', 'lg'));

    // ✅ NEW: Session expired modal state
    const [sessionExpiredModal, setSessionExpiredModal] = useState({
        open: false,
        reason: null
    });

    // Handle flash messages
    useEffect(() => {
        if (flash?.success || flash?.error || flash?.info) {
            setFlashMessage(flash);
        }
    }, [flash]);

    // ✅ NEW: Detect session termination from flash message
    useEffect(() => {
        if (flash?.session_terminated) {
            setSessionExpiredModal({
                open: true,
                reason: flash.session_terminated
            });
        }
    }, [flash]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleDrawerCollapse = () => {
        setDrawerCollapsed(prev => {
            const newValue = !prev;
            localStorage.setItem('admin-drawer-collapsed', JSON.stringify(newValue));
            return newValue;
        });
    };

    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };

    const handleMenuExpand = (menuKey) => {
        setExpandedMenus(prev => {
            const newState = {
                ...prev,
                [menuKey]: !prev[menuKey]
            };
            localStorage.setItem('admin-expanded-menus', JSON.stringify(newState));
            return newState;
        });
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    // Auto-collapse drawer on medium screens (only if not manually set)
    useEffect(() => {
        const manuallySet = localStorage.getItem('admin-drawer-collapsed');

        if (!manuallySet) {
            if (isMedium && !isMobile) {
                setDrawerCollapsed(true);
            } else if (!isMedium && !isMobile) {
                setDrawerCollapsed(false);
            }
        }
    }, [isMedium, isMobile]);

    // ========================================
    // ROLE-BASED ACCESS CONTROL
    // ========================================
    // Check if user is admin (has full access)
    // Support both role column and roles relationship
    const isAdmin = auth.user?.role === 'admin' ||
                    (auth.user?.roles && Array.isArray(auth.user.roles) && auth.user.roles.some(r => r.name === 'admin'));

    // Check if user is editor (restricted access)
    const isEditor = auth.user?.role === 'editor' ||
                     (auth.user?.roles && Array.isArray(auth.user.roles) && auth.user.roles.some(r => r.name === 'editor'));

    // Navigation menu items with role-based access control
    const allMenuItems = [
        {
            key: 'dashboard',
            label: 'Dashboard',
            icon: <DashboardIcon />,
            href: '/admin/dashboard',
            active: route().current('admin.dashboard'),
            adminOnly: false // Both admin and editor can access
        },
        {
            key: 'content',
            label: 'Contenido',
            icon: <ArticleIcon />,
            expandable: true,
            adminOnly: false, // Both admin and editor can access
            children: [
                {
                    key: 'posts',
                    label: 'Posts',
                    icon: <ArticleIcon />,
                    href: '/admin/posts',
                    active: route().current('admin.posts.*'),
                    adminOnly: false
                },
                {
                    key: 'categories',
                    label: 'Categorías',
                    icon: <CategoryIcon />,
                    href: '/admin/categories',
                    active: route().current('admin.categories.*'),
                    adminOnly: false
                },
                {
                    key: 'tags',
                    label: 'Tags',
                    icon: <TagIcon />,
                    href: '/admin/tags',
                    active: route().current('admin.tags.*'),
                    adminOnly: false
                },
                {
                    key: 'comments',
                    label: 'Comentarios',
                    icon: <CommentIcon />,
                    href: '/admin/comment-management',
                    active: route().current('admin.comment-management.*'),
                    adminOnly: false
                },
                {
                    key: 'comment-reports',
                    label: 'Reportes de comentarios',
                    icon: <FlagIcon />,
                    href: '/admin/comment-reports',
                    active: route().current('admin.comment-reports.*'),
                    adminOnly: false
                }
            ]
        },
        {
            key: 'media',
            label: 'Media',
            icon: <PhotoLibraryIcon />,
            href: '/admin/media',
            active: route().current('admin.media.*'),
            adminOnly: false // Editors need media library
        },
        {
            key: 'services',
            label: 'Servicios',
            icon: <BuildIcon />,
            href: route('admin.services.index'),
            active: route().current('admin.services.*'),
            adminOnly: true // Admin only
        },
        {
            key: 'projects',
            label: 'Proyectos',
            icon: <WorkIcon />,
            href: route('admin.projects.index'),
            active: route().current('admin.projects.*'),
            adminOnly: true // Admin only
        },
        {
            key: 'users',
            label: 'Usuarios',
            icon: <PeopleIcon />,
            expandable: true,
            adminOnly: true, // Admin only - CRITICAL
            children: [
                {
                    key: 'user-management',
                    label: 'Gestión de Usuarios',
                    icon: <PeopleIcon />,
                    href: route('admin.users.index'),
                    active: route().current('admin.users.*'),
                    adminOnly: true
                },
                {
                    key: 'ban-appeals',
                    label: 'Apelaciones de Baneo',
                    icon: <GavelIcon />,
                    href: route('admin.ban-appeals.index'),
                    active: route().current('admin.ban-appeals.*'),
                    adminOnly: true
                }
            ]
        },
        {
            key: 'user-notifications',
            label: 'Notificaciones de Usuarios',
            icon: <NotificationsIcon />,
            expandable: true,
            adminOnly: true, // Admin only
            children: [
                {
                    key: 'send-notification',
                    label: 'Enviar Notificación',
                    href: route('admin.user-notifications.send'),
                    active: route().current('admin.user-notifications.send'),
                    adminOnly: true
                },
                {
                    key: 'notification-history',
                    label: 'Historial',
                    href: route('admin.user-notifications.history'),
                    active: route().current('admin.user-notifications.history'),
                    adminOnly: true
                }
            ]
        },
        {
            key: 'contact-requests',
            label: 'Solicitudes de Contacto',
            icon: <ContactMailIcon />,
            href: route('admin.contact-requests.index'),
            active: route().current('admin.contact-requests.*'),
            adminOnly: true // Admin only
        },
        {
            key: 'analytics',
            label: 'Analytics',
            icon: <AnalyticsIcon />,
            href: '/admin/analytics',
            active: route().current('admin.analytics.*'),
            adminOnly: true // Admin only
        },
        {
            key: 'security',
            label: 'Seguridad',
            icon: <SecurityIcon />,
            expandable: true,
            adminOnly: true, // Admin only - CRITICAL
            children: [
                {
                    key: 'audit-logs',
                    label: 'Logs de Auditoría',
                    icon: <ShieldIcon />,
                    href: '/admin/audit-logs',
                    active: route().current('admin.audit-logs.*'),
                    adminOnly: true
                }
            ]
        },
        {
            key: 'settings',
            label: 'Configuración',
            icon: <SettingsIcon />,
            href: '/admin/settings',
            active: route().current('admin.settings.*'),
            adminOnly: true // Admin only - CRITICAL
        }
    ];

    // Filter menu items based on user role
    const menuItems = allMenuItems.filter(item => {
        // If item is admin-only and user is not admin, hide it
        if (item.adminOnly && !isAdmin) {
            return false;
        }

        // If item has children, filter them too
        if (item.children) {
            item.children = item.children.filter(child => {
                return !child.adminOnly || isAdmin;
            });

            // If all children are filtered out, hide parent too
            if (item.children.length === 0) {
                return false;
            }
        }

        return true;
    });

    const renderMenuItem = (item, depth = 0) => {
        const isExpanded = expandedMenus[item.key];
        const hasChildren = item.children && item.children.length > 0;
        const isCollapsed = drawerCollapsed && !isMobile;

        return (
            <React.Fragment key={item.key}>
                <Tooltip
                    title={isCollapsed ? item.label : ''}
                    placement="right"
                    arrow
                >
                    <motion.div
                        variants={menuItemVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        <ListItem disablePadding sx={{ pl: depth * 2 }}>
                            <ListItemButton
                                component={hasChildren ? 'div' : Link}
                                href={!hasChildren ? item.href : undefined}
                                onClick={hasChildren ? () => handleMenuExpand(item.key) : undefined}
                                sx={{
                                    borderRadius: 2,
                                    mx: 1,
                                    mb: 0.5,
                                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                                    backgroundColor: item.active
                                        ? (theme.palette.mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.15)'
                                            : 'rgba(0, 0, 0, 0.06)')
                                        : 'transparent',
                                    '&:hover': {
                                        backgroundColor: theme.palette.mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.1)'
                                            : 'rgba(0, 0, 0, 0.04)',
                                    },
                                    transition: 'all 0.2s ease-in-out'
                                }}
                            >
                                <ListItemIcon sx={{
                                    color: theme.palette.mode === 'dark' ? 'white' : '#1f2937',
                                    minWidth: isCollapsed ? 'auto' : 40,
                                    justifyContent: 'center'
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                {!isCollapsed && (
                                    <>
                                        <ListItemText
                                            primary={item.label}
                                            sx={{
                                                color: theme.palette.mode === 'dark' ? 'white' : '#1f2937',
                                                '& .MuiTypography-root': {
                                                    fontWeight: item.active ? 600 : 400
                                                }
                                            }}
                                        />
                                        {hasChildren && (
                                            <Box
                                                component={motion.div}
                                                animate={{
                                                    rotate: isExpanded ? 180 : 0,
                                                    scale: isExpanded ? 1.1 : 1
                                                }}
                                                transition={{
                                                    duration: 0.3,
                                                    ease: "easeInOut"
                                                }}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    color: theme.palette.mode === 'dark' ? 'white' : '#1f2937',
                                                    opacity: 0.8,
                                                    '&:hover': {
                                                        opacity: 1
                                                    }
                                                }}
                                            >
                                                <ExpandMore />
                                            </Box>
                                        )}
                                    </>
                                )}
                            </ListItemButton>
                        </ListItem>
                    </motion.div>
                </Tooltip>

                {hasChildren && !isCollapsed && (
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {item.children.map(child => renderMenuItem(child, depth + 1))}
                        </List>
                    </Collapse>
                )}
            </React.Fragment>
        );
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{
                    p: drawerCollapsed && !isMobile ? 2 : 3,
                    textAlign: 'center',
                    borderBottom: theme.palette.mode === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)',
                    position: 'relative'
                }}>
                    {drawerCollapsed && !isMobile ? (
                        <Typography variant="h5" sx={{
                            color: theme.palette.mode === 'dark' ? 'white' : 'primary.main',
                            fontWeight: 700
                        }}>
                            M
                        </Typography>
                    ) : (
                        <>
                            <Typography variant="h5" sx={{
                                color: theme.palette.mode === 'dark' ? 'white' : 'primary.main',
                                fontWeight: 700,
                                mb: 1
                            }}>
                                MDR Admin
                            </Typography>
                            <Typography variant="body2" sx={{
                                color: theme.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.7)'
                                    : 'rgba(0, 0, 0, 0.6)'
                            }}>
                                Panel de Administración
                            </Typography>
                        </>
                    )}

                    {/* Collapse/Expand button - only on desktop */}
                    {!isMobile && (
                        <IconButton
                            onClick={handleDrawerCollapse}
                            size="small"
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: theme.palette.mode === 'dark' ? 'white' : 'primary.main',
                                bgcolor: theme.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : 'rgba(0, 0, 0, 0.05)',
                                '&:hover': {
                                    bgcolor: theme.palette.mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.2)'
                                        : 'rgba(0, 0, 0, 0.1)'
                                }
                            }}
                        >
                            {drawerCollapsed ? <ExpandMore sx={{ transform: 'rotate(-90deg)' }} /> : <ExpandMore sx={{ transform: 'rotate(90deg)' }} />}
                        </IconButton>
                    )}
                </Box>
            </motion.div>

            {/* Navigation Menu */}
            <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
                <List>
                    {menuItems.map(item => renderMenuItem(item))}
                </List>
            </Box>

            {/* User Info Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Box sx={{
                    p: 2,
                    borderTop: theme.palette.mode === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)'
                }}>
                    {drawerCollapsed && !isMobile ? (
                        <Tooltip title={`${auth.user.name} (${auth.user.role})`} placement="right" arrow>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    {auth.user.name.charAt(0).toUpperCase()}
                                </Avatar>
                            </Box>
                        </Tooltip>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {auth.user.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{
                                    color: theme.palette.mode === 'dark' ? 'white' : 'text.primary',
                                    fontWeight: 600
                                }}>
                                    {auth.user.name}
                                </Typography>
                                <Typography variant="caption" sx={{
                                    color: theme.palette.mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.7)'
                                        : 'rgba(0, 0, 0, 0.6)'
                                }}>
                                    {auth.user.role}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            </motion.div>
        </Box>
    );

    const currentDrawerWidth = drawerCollapsed && !isMobile ? drawerWidthCollapsed : drawerWidth;

    return (
        <InactivityProvider totalTimeout={15 * 60 * 1000}>
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                <Head title={title} />
                <CssBaseline />

            {/* Header */}
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
                    ml: { sm: `${currentDrawerWidth}px` },
                    ...getHeaderStyles(theme),
                    zIndex: theme.zIndex.drawer + 1,
                    transition: 'all 0.3s ease-in-out'
                }}
                elevation={0}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' }, color: 'text.primary' }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
                        {title}
                    </Typography>

                    {/* Reloj de inactividad - Solo para admin, moderadores y editores */}
                    {(auth.user?.role === 'admin' || auth.user?.role === 'moderator' || auth.user?.role === 'editor') && (
                        <InactivityTimer />
                    )}

                    {/* Notifications */}
                    <NotificationCenter />

                    {/* User Menu */}
                    <Tooltip title={impersonation?.isActive ? `Impersonando a ${impersonation.target.name}` : "Perfil de usuario"}>
                        <IconButton
                            color="inherit"
                            onClick={handleUserMenuOpen}
                            sx={{ color: 'text.primary' }}
                        >
                            <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={
                                    impersonation?.isActive ? (
                                        <Box
                                            sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                bgcolor: '#805AD5',
                                                border: '2px solid',
                                                borderColor: 'background.paper',
                                                animation: 'pulse 2s infinite',
                                                '@keyframes pulse': {
                                                    '0%, 100%': { opacity: 1 },
                                                    '50%': { opacity: 0.5 },
                                                },
                                            }}
                                        />
                                    ) : null
                                }
                            >
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                    {auth.user.name.charAt(0).toUpperCase()}
                                </Avatar>
                            </Badge>
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box
                component="nav"
                sx={{
                    width: { sm: currentDrawerWidth },
                    flexShrink: { sm: 0 },
                    transition: 'width 0.3s ease-in-out'
                }}
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            ...getSidebarStyles(theme),
                        },
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                        <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    {drawer}
                </Drawer>

                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: currentDrawerWidth,
                            ...getSidebarStyles(theme),
                            transition: 'width 0.3s ease-in-out',
                            overflowX: 'hidden'
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    position: 'relative',
                    transition: 'width 0.3s ease-in-out',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        pointerEvents: 'none',
                    }
                }}
            >
                <Toolbar />

                {/* Breadcrumbs with Quick Filters */}
                {(breadcrumbs.length > 0 || showFilters) && (
                    <Box
                        sx={{
                            px: 3,
                            pt: 2,
                            pb: 1,
                            bgcolor: alpha(theme.palette.background.paper, 0.75),
                            backdropFilter: 'blur(8px)',
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        <BreadcrumbsWithFilters
                            items={breadcrumbs}
                            quickFilters={quickFilters}
                            onFilterChange={onFilterChange}
                            showFilters={showFilters}
                        />
                    </Box>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ position: 'relative', zIndex: 1, height: '100%' }}
                >
                    <Box sx={{
                        p: { xs: 2, sm: 3, md: 4 },
                        maxWidth: '1600px',
                        mx: 'auto',
                        width: '100%'
                    }}>
                        {children}
                    </Box>
                </motion.div>

                    {/* Footer - elegant */}
                    <Box
                        sx={{
                            px: { xs: 2, sm: 3, md: 4 },
                            py: 3,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 2,
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            mt: 'auto',
                            color: theme.palette.mode === 'dark' ? 'rgba(226, 232, 240, 0.85)' : 'rgba(30, 41, 59, 0.9)',
                            borderTop: theme.palette.mode === 'dark'
                                ? '1px solid rgba(255, 255, 255, 0.06)'
                                : '1px solid rgba(0, 0, 0, 0.06)',
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(241, 245, 249, 0.9)',
                            backgroundImage: theme.palette.mode === 'dark' ? 'linear-gradient(135deg, rgba(102,126,234,0.06), rgba(118,75,162,0.06))' : 'linear-gradient(135deg, rgba(102,126,234,0.06), rgba(118,75,162,0.06))',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 -6px 18px rgba(0,0,0,0.06)',
                            position: 'relative'
                        }}
                    >
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #667eea, #764ba2)', opacity: theme.palette.mode === 'dark' ? 0.6 : 0.85 }} />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, boxShadow: '0 2px 10px rgba(102, 126, 234, 0.35)' }}>
                                M
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>MDR Admin</Typography>
                                <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>Panel de gestión</Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', opacity: 0.85 }}>
                            <Typography variant="caption">Privacidad</Typography>
                            <Typography variant="caption">Términos</Typography>
                            <Typography variant="caption">Soporte</Typography>
                        </Box>

                        <Box sx={{ opacity: 0.95 }}>
                            <Typography variant="caption">v1.0 • Hecho con ❤️</Typography>
                        </Box>
                    </Box>

            </Box>

            {/* User Menu */}
            <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                PaperProps={{
                    sx: {
                        ...glassmorphismStyles,
                        mt: 1,
                        minWidth: 200,
                        backgroundColor: alpha(theme.palette.background.paper, 0.95),
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                    }
                }}
            >
                {impersonation?.isActive && (
                    <>
                        <Box sx={{ px: 2, py: 1.5, bgcolor: alpha('#805AD5', 0.1), borderRadius: 1, m: 1 }}>
                            <Typography variant="caption" sx={{ color: '#805AD5', fontWeight: 600, display: 'block' }}>
                                🎭 Impersonando
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                                {impersonation.target.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                {impersonation.target.email}
                            </Typography>
                        </Box>
                        <Divider sx={{
                            borderColor: theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(0, 0, 0, 0.1)'
                        }} />
                    </>
                )}
                <MenuItem component={Link} href="/user/dashboard" onClick={handleUserMenuClose}>
                    <PersonIcon sx={{ mr: 2 }} />
                    Mi Perfil
                </MenuItem>
                <MenuItem component={Link} href="/" onClick={handleUserMenuClose}>
                    <HomeIcon sx={{ mr: 2 }} />
                    Ver Sitio Web
                </MenuItem>
                <Divider sx={{
                    borderColor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.1)'
                }} />
                <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 2 }} />
                    Cerrar Sesión
                </MenuItem>
            </Menu>

            {/* Impersonation Banner */}
            <ImpersonationBanner />

            {/* Flash Messages */}
            <AnimatePresence>
                {flashMessage && (
                    <Snackbar
                        open={Boolean(flashMessage)}
                        autoHideDuration={6000}
                        onClose={() => setFlashMessage(null)}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <motion.div
                            initial={{ opacity: 0, x: 300 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 300 }}
                        >
                            <Alert
                                onClose={() => setFlashMessage(null)}
                                severity={flashMessage.success ? 'success' : flashMessage.error ? 'error' : 'info'}
                                sx={{ ...glassmorphismStyles }}
                            >
                                {flashMessage.success || flashMessage.error || flashMessage.info}
                            </Alert>
                        </motion.div>
                    </Snackbar>
                )}
            </AnimatePresence>

            {/* Inactivity Detector - Solo para admin, moderadores y editores */}
            {(auth.user?.role === 'admin' || auth.user?.role === 'moderator' || auth.user?.role === 'editor') && (
                <InactivityDetector
                    enabled={true}
                    inactivityTimeout={15 * 60 * 1000} // 15 minutos
                    warningTime={3 * 60 * 1000} // Advertencia 3 minutos antes
                    heartbeatInterval={2 * 60 * 1000} // Heartbeat cada 2 minutos
                    debug={true} // Cambiar a false para desactivar logs en consola
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
        </InactivityProvider>
    );
};

export default AdminLayoutNew;
