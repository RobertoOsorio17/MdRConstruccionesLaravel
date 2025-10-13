import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
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
    Close as CloseIcon
} from '@mui/icons-material';
import NotificationCenter from '@/Components/Admin/NotificationCenter';

const drawerWidth = 280;

// Glassmorphism styles
const glassmorphismStyles = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
};

const sidebarGlassmorphism = {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '4px 0 24px rgba(0, 0, 0, 0.1)',
};

const headerGlassmorphism = {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.1))',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
};

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

const AdminLayoutNew = ({ children, title = 'Admin Panel' }) => {
    const theme = useTheme();
    const { auth, flash } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const [expandedMenus, setExpandedMenus] = useState({});
    const [flashMessage, setFlashMessage] = useState(null);
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    // Handle flash messages
    useEffect(() => {
        if (flash?.success || flash?.error || flash?.info) {
            setFlashMessage(flash);
        }
    }, [flash]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };

    const handleMenuExpand = (menuKey) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    // Navigation menu items
    const menuItems = [
        {
            key: 'dashboard',
            label: 'Dashboard',
            icon: <DashboardIcon />,
            href: '/admin/dashboard',
            active: route().current('admin.dashboard')
        },
        {
            key: 'content',
            label: 'Contenido',
            icon: <ArticleIcon />,
            expandable: true,
            children: [
                {
                    key: 'posts',
                    label: 'Posts',
                    icon: <ArticleIcon />,
                    href: '/admin/posts',
                    active: route().current('admin.posts.*')
                },
                {
                    key: 'categories',
                    label: 'Categorías',
                    icon: <CategoryIcon />,
                    href: '/admin/categories',
                    active: route().current('admin.categories.*')
                },
                {
                    key: 'tags',
                    label: 'Tags',
                    icon: <TagIcon />,
                    href: '/admin/tags',
                    active: route().current('admin.tags.*')
                },
                {
                    key: 'comments',
                    label: 'Comentarios',
                    icon: <CommentIcon />,
                    href: '/admin/comment-management',
                    active: route().current('admin.comment-management.*')
                }
            ]
        },
        {
            key: 'services',
            label: 'Servicios',
            icon: <BuildIcon />,
            href: route('admin.services.index'),
            active: route().current('admin.services.*')
        },
        {
            key: 'projects',
            label: 'Proyectos',
            icon: <WorkIcon />,
            href: route('admin.projects.index'),
            active: route().current('admin.projects.*')
        },
        {
            key: 'users',
            label: 'Usuarios',
            icon: <PeopleIcon />,
            href: route('admin.users.index'),
            active: route().current('admin.users.*')
        },
        {
            key: 'contact-requests',
            label: 'Solicitudes de Contacto',
            icon: <ContactMailIcon />,
            href: route('admin.contact-requests.index'),
            active: route().current('admin.contact-requests.*')
        },
        {
            key: 'analytics',
            label: 'Analytics',
            icon: <AnalyticsIcon />,
            href: '/admin/analytics',
            active: route().current('admin.analytics.*')
        },
        {
            key: 'security',
            label: 'Seguridad',
            icon: <SecurityIcon />,
            expandable: true,
            children: [
                {
                    key: 'audit-logs',
                    label: 'Logs de Auditoría',
                    icon: <ShieldIcon />,
                    href: '/admin/audit-logs',
                    active: route().current('admin.audit-logs.*')
                }
            ]
        },
        {
            key: 'settings',
            label: 'Configuración',
            icon: <SettingsIcon />,
            href: '/admin/settings',
            active: route().current('admin.settings.*')
        }
    ];

    const renderMenuItem = (item, depth = 0) => {
        const isExpanded = expandedMenus[item.key];
        const hasChildren = item.children && item.children.length > 0;

        return (
            <React.Fragment key={item.key}>
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
                                backgroundColor: item.active ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                },
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.label}
                                sx={{ 
                                    color: 'white',
                                    '& .MuiTypography-root': {
                                        fontWeight: item.active ? 600 : 400
                                    }
                                }}
                            />
                            {hasChildren && (
                                <IconButton size="small" sx={{ color: 'white' }}>
                                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                </IconButton>
                            )}
                        </ListItemButton>
                    </ListItem>
                </motion.div>
                
                {hasChildren && (
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
                <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                        MDR Admin
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Panel de Administración
                    </Typography>
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
                <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {auth.user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                                {auth.user.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {auth.user.role}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </motion.div>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Head title={title} />
            <CssBaseline />

            {/* Header */}
            <AppBar
                position="fixed"
                sx={{
                    width: { lg: `calc(100% - ${drawerWidth}px)` },
                    ml: { lg: `${drawerWidth}px` },
                    ...headerGlassmorphism,
                    zIndex: theme.zIndex.drawer + 1,
                }}
                elevation={0}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { lg: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'white' }}>
                        {title}
                    </Typography>

                    {/* Notifications */}
                    <NotificationCenter />

                    {/* User Menu */}
                    <Tooltip title="Perfil de usuario">
                        <IconButton
                            color="inherit"
                            onClick={handleUserMenuOpen}
                        >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                {auth.user.name.charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box
                component="nav"
                sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', lg: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            ...sidebarGlassmorphism,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                        display: { xs: 'none', lg: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            ...sidebarGlassmorphism,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                    width: { lg: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    position: 'relative',
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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ position: 'relative', zIndex: 1 }}
                >
                    <Box sx={{ p: 3 }}>
                        {children}
                    </Box>
                </motion.div>
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
                    }
                }}
            >
                <MenuItem component={Link} href="/user/dashboard" onClick={handleUserMenuClose}>
                    <PersonIcon sx={{ mr: 2 }} />
                    Mi Perfil
                </MenuItem>
                <MenuItem component={Link} href="/" onClick={handleUserMenuClose}>
                    <HomeIcon sx={{ mr: 2 }} />
                    Ver Sitio Web
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 2 }} />
                    Cerrar Sesión
                </MenuItem>
            </Menu>

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
        </Box>
    );
};

export default AdminLayoutNew;
