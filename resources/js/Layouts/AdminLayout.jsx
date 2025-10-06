import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { NotificationProvider } from '@/Contexts/NotificationContext';
import NotificationSystem from '@/Components/Admin/NotificationSystem';
import useAdminNotificationsRealtime from '@/Hooks/useAdminNotificationsRealtime';
import SessionManager from '@/Components/Admin/SessionManager';
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
    useTheme,
    alpha,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Chip,
    Alert,
    Snackbar,
    Badge,
    Tooltip,
    Paper,
    Collapse
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
    Comment as CommentIcon
} from '@mui/icons-material';

const drawerWidth = 280;

const AdminLayout = ({ children, title = 'Dashboard Admin' }) => {
    const theme = useTheme();
    const { auth, flash } = usePage().props;
    const {
        notifications: adminNotifications,
        unreadCount: adminUnreadCount,
        markAsRead: adminMarkAsRead,
        markAllAsRead: adminMarkAllAsRead,
        deleteNotification: adminDeleteNotification,
        dndEnabled,
        toggleDnd,
    } = useAdminNotificationsRealtime();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchor, setNotificationAnchor] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(!!flash?.success || !!flash?.error);
    const [expandedMenus, setExpandedMenus] = useState({});
    
    // Simulación de notificaciones (en producción vendría de API)
    const [notifications] = useState([
        { id: 1, message: 'Nuevo servicio creado', time: '5 min', unread: true },
        { id: 2, message: 'Proyecto actualizado', time: '1h', unread: true },
        { id: 3, message: 'Usuario registrado', time: '2h', unread: false }
    ]);
    
    const unreadCount = notifications.filter(n => n.unread).length;
    
    // Obtener rol principal del usuario
    const userRole = auth.user.roles?.[0] || { display_name: 'Usuario', color: '#6b7280' };
    
    // Verificar si el usuario puede acceder a un módulo
    const canAccess = (module) => {
        return auth.user.permissions?.some(p => p.module === module) || false;
    };

    const navigation = [
        {
            name: 'Dashboard',
            href: '/admin',
            icon: DashboardIcon,
            current: route().current('admin.dashboard'),
            requiredModule: 'dashboard'
        },
        {
            name: 'Servicios',
            href: '/admin/services',
            icon: BuildIcon,
            current: route().current('admin.services.*'),
            requiredModule: 'services'
        },
        {
            name: 'Proyectos',
            href: '/admin/projects',
            icon: WorkIcon,
            current: route().current('admin.projects.*'),
            requiredModule: 'projects'
        },
        {
            name: 'Blog',
            href: '/admin/posts',
            icon: ArticleIcon,
            current: route().current('admin.posts.*'),
            requiredModule: 'posts'
        },
        {
            name: 'Comentarios',
            icon: CommentIcon,
            current: route().current('admin.comments.*') || route().current('admin.comment-reports.*'),
            requiredModule: 'comments',
            children: [
                {
                    name: 'Todos los comentarios',
                    href: '/admin/comment-management',
                    current: route().current('admin.comment-management.*')
                },
                {
                    name: 'Reportes',
                    href: '/admin/comment-reports',
                    current: route().current('admin.comment-reports.*')
                },
                {
                    name: 'IPs Baneadas',
                    href: '/admin/ip-bans',
                    current: route().current('admin.ip-bans.*')
                }
            ]
        },
        {
            name: 'Usuarios',
            href: '/admin/users',
            icon: PeopleIcon,
            current: route().current('admin.users.*'),
            requiredModule: 'users'
        },
        {
            name: 'Configuración',
            href: '/admin/settings',
            icon: SettingsIcon,
            current: route().current('admin.settings.*'),
            requiredModule: 'settings'
        }
    ].filter(item => canAccess(item.requiredModule));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleExpandMenu = (menuName) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    const drawer = (
        <Box>
            <Toolbar
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white'
                }}
            >
                <Typography variant="h6" noWrap component="div" fontWeight="bold">
                    MDR Admin
                </Typography>
            </Toolbar>
            <Divider />
            <List sx={{ p: 2 }}>
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const hasChildren = item.children && item.children.length > 0;
                    const isExpanded = expandedMenus[item.name];
                    
                    return (
                        <React.Fragment key={item.name}>
                            <ListItem disablePadding sx={{ mb: 1 }}>
                                <ListItemButton
                                    component={hasChildren ? 'div' : Link}
                                    href={hasChildren ? undefined : item.href}
                                    onClick={hasChildren ? () => handleExpandMenu(item.name) : undefined}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 0.5,
                                        backgroundColor: item.current ? 
                                            alpha(theme.palette.primary.main, 0.1) : 
                                            'transparent',
                                        border: item.current ? 
                                            `1px solid ${alpha(theme.palette.primary.main, 0.3)}` : 
                                            '1px solid transparent',
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                        }
                                    }}
                                >
                                    <ListItemIcon>
                                        <Icon 
                                            sx={{ 
                                                color: item.current ? 
                                                    theme.palette.primary.main : 
                                                    'text.secondary' 
                                            }} 
                                        />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={item.name}
                                        sx={{
                                            '& .MuiListItemText-primary': {
                                                color: item.current ? 
                                                    theme.palette.primary.main : 
                                                    'text.primary',
                                                fontWeight: item.current ? 600 : 400
                                            }
                                        }}
                                    />
                                    {hasChildren && (
                                        isExpanded ? <ExpandLess /> : <ExpandMore />
                                    )}
                                </ListItemButton>
                            </ListItem>
                            
                            {/* Submenú */}
                            {hasChildren && (
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding sx={{ pl: 2 }}>
                                        {item.children.map((child) => (
                                            <ListItem key={child.name} disablePadding sx={{ mb: 0.5 }}>
                                                <ListItemButton
                                                    component={Link}
                                                    href={child.href}
                                                    sx={{
                                                        borderRadius: 1,
                                                        py: 1,
                                                        backgroundColor: child.current ? 
                                                            alpha(theme.palette.primary.main, 0.1) : 
                                                            'transparent',
                                                        '&:hover': {
                                                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                                        }
                                                    }}
                                                >
                                                    <ListItemText 
                                                        primary={child.name}
                                                        sx={{
                                                            '& .MuiListItemText-primary': {
                                                                fontSize: '0.875rem',
                                                                color: child.current ? 
                                                                    theme.palette.primary.main : 
                                                                    'text.secondary',
                                                                fontWeight: child.current ? 600 : 400
                                                            }
                                                        }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            )}
                        </React.Fragment>
                    );
                })}
            </List>
            <Divider />
            <Box sx={{ p: 2 }}>
                <ListItemButton
                    component={Link}
                    href="/"
                    sx={{
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.success.main, 0.2),
                        }
                    }}
                >
                    <ListItemIcon>
                        <HomeIcon sx={{ color: theme.palette.success.main }} />
                    </ListItemIcon>
                    <ListItemText 
                        primary="Ver Sitio Web"
                        sx={{
                            '& .MuiListItemText-primary': {
                                color: theme.palette.success.main,
                                fontWeight: 600
                            }
                        }}
                    />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <NotificationProvider>
            <Box sx={{ display: 'flex' }}>
            <Head title={title} />
            <CssBaseline />
            
            {/* AppBar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    backgroundColor: 'white',
                    color: 'text.primary',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        {title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                            label="Admin"
                            color="primary"
                            size="small"
                            variant="outlined"
                        />

                        <NotificationSystem
                            notifications={adminNotifications}
                            onMarkAsRead={adminMarkAsRead}
                            onMarkAllAsRead={adminMarkAllAsRead}
                            onDeleteNotification={adminDeleteNotification}
                            dndEnabled={dndEnabled}
                            onToggleDnd={toggleDnd}
                            unreadCountOverride={adminUnreadCount}
                        />

                        <IconButton
                            size="large"
                            edge="end"
                            aria-label="account of current user"
                            aria-controls="primary-search-account-menu"
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
                        >
                            <Avatar 
                                sx={{ 
                                    width: 32, 
                                    height: 32,
                                    backgroundColor: theme.palette.primary.main
                                }}
                            >
                                {auth.user.name.charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Profile Menu */}
            <Menu
                anchorEl={anchorEl}
                id="primary-search-account-menu"
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleProfileMenuClose}>
                    <ListItemIcon>
                        <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={auth.user.name} secondary={auth.user.email} />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Cerrar Sesión" />
                </MenuItem>
            </Menu>

            {/* Drawer */}
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { 
                            boxSizing: 'border-box', 
                            width: drawerWidth 
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { 
                            boxSizing: 'border-box', 
                            width: drawerWidth,
                            borderRight: `1px solid ${theme.palette.divider}`
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
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    backgroundColor: alpha(theme.palette.grey[50], 0.5)
                }}
            >
                <Toolbar />
                {children}
            </Box>

            {/* Flash Messages */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setSnackbarOpen(false)} 
                    severity={flash?.success ? 'success' : 'error'}
                    variant="filled"
                >
                    {flash?.success || flash?.error}
                </Alert>
            </Snackbar>

            {/* Session Manager */}
            <SessionManager user={auth.user} />
            </Box>
        </NotificationProvider>
    );
};

export default AdminLayout;
