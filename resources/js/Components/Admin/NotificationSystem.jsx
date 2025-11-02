import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    Snackbar,
    Alert,
    AlertTitle,
    Badge,
    IconButton,
    Menu,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    Typography,
    Box,
    Chip,
    Divider,
    Button,
    Paper,
    Fade,
    Slide,
    useTheme,
    alpha,
    Tabs,
    Tab,
    TextField,
    InputAdornment,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Switch,
    FormControlLabel,
    Pagination
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    NotificationsActive,
    Close as CloseIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    CheckCircle as SuccessIcon,
    Security as SecurityIcon,
    Person as UserIcon,
    Article as ContentIcon,
    Build as SystemIcon,
    Delete as DeleteIcon,
    MarkAsUnread as MarkUnreadIcon,
    MarkEmailRead as MarkReadIcon,
    NotificationsOff as NotificationsOffIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    DeleteSweep as DeleteSweepIcon,
    PriorityHigh as PriorityIcon
} from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationSystem = ({
    notifications = [],
    onMarkAsRead,
    onMarkAllAsRead,
    onDeleteNotification,
    onDeleteAllRead,
    maxToastNotifications = 3,
    dndEnabled = false,
    onToggleDnd,
    unreadCountOverride
}) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);
    const [toastNotifications, setToastNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const shownToastIdsRef = useRef(new Set());

    // New state for tabs and filters
    const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Unread, 2: Read, 3: Important
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleting, setIsDeleting] = useState(false);
    const itemsPerPage = 10;

    // Calculate unread count (allow override from backend)
    useEffect(() => {
        if (typeof unreadCountOverride === 'number') {
            setUnreadCount(unreadCountOverride);
        } else {
            const unread = notifications.filter(n => !n.read).length;
            setUnreadCount(unread);
        }
    }, [notifications, unreadCountOverride]);

    // OPTIMIZED: Memoize unseen notifications to avoid recalculation on every render
    const unseenNotifications = useMemo(() => {
        if (dndEnabled) return [];

        return notifications
            .filter(n => !n.read && n.showAsToast && !shownToastIdsRef.current.has(n.id))
            .slice(0, maxToastNotifications);
    }, [notifications, maxToastNotifications, dndEnabled]);

    // Handle new notifications for toast display (show once, respect DND)
    useEffect(() => {
        if (unseenNotifications.length > 0) {
            unseenNotifications.forEach(n => shownToastIdsRef.current.add(n.id));
            setToastNotifications(unseenNotifications);
        } else if (dndEnabled) {
            setToastNotifications([]);
        }
    }, [unseenNotifications, dndEnabled]);

    // OPTIMIZED: useCallback to prevent recreation on every render
    const handleMenuOpen = useCallback((event) => {
        setAnchorEl(event.currentTarget);
    }, []);

    // OPTIMIZED: useCallback to prevent recreation on every render
    const handleMenuClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleMarkAsRead = useCallback((notificationId) => {
        if (onMarkAsRead) {
            onMarkAsRead(notificationId);
        }
    }, [onMarkAsRead]);

    const handleMarkAllAsRead = useCallback(() => {
        if (onMarkAllAsRead) {
            onMarkAllAsRead();
        }
        handleMenuClose();
    }, [onMarkAllAsRead]);

    const handleDeleteNotification = useCallback((notificationId) => {
        if (onDeleteNotification) {
            onDeleteNotification(notificationId);
        }
    }, [onDeleteNotification]);

    const handleDeleteAllRead = useCallback(async () => {
        if (!onDeleteAllRead) return;
        setIsDeleting(true);
        try {
            await onDeleteAllRead();
        } finally {
            setIsDeleting(false);
        }
    }, [onDeleteAllRead]);

    // OPTIMIZED: useCallback to prevent recreation on every render
    const handleTabChange = useCallback((event, newValue) => {
        setActiveTab(newValue);
        setCurrentPage(1); // Reset to first page when changing tabs
    }, []);

    // OPTIMIZED: useCallback to prevent recreation on every render
    const handleSearchChange = useCallback((event) => {
        setSearchQuery(event.target.value);
        setCurrentPage(1); // Reset to first page when searching
    }, []);

    // OPTIMIZED: useCallback to prevent recreation on every render
    const handleTypeFilterChange = useCallback((event) => {
        setTypeFilter(event.target.value);
        setCurrentPage(1); // Reset to first page when filtering
    }, []);

    // OPTIMIZED: useCallback to prevent recreation on every render
    const handlePageChange = useCallback((event, value) => {
        setCurrentPage(value);
    }, []);

    // OPTIMIZED: useCallback to prevent recreation on every render
    const getNotificationIcon = useCallback((type) => {
        const iconProps = { fontSize: 'small' };
        switch (type) {
            case 'success': return <SuccessIcon {...iconProps} color="success" />;
            case 'warning': return <WarningIcon {...iconProps} color="warning" />;
            case 'error': return <ErrorIcon {...iconProps} color="error" />;
            case 'security': return <SecurityIcon {...iconProps} color="secondary" />;
            case 'user': return <UserIcon {...iconProps} color="primary" />;
            case 'content': return <ContentIcon {...iconProps} color="info" />;
            case 'system': return <SystemIcon {...iconProps} color="action" />;
            default: return <InfoIcon {...iconProps} color="info" />;
        }
    }, []);

    // OPTIMIZED: useCallback to prevent recreation on every render
    const getNotificationSeverity = useCallback((type) => {
        switch (type) {
            case 'success': return 'success';
            case 'warning': return 'warning';
            case 'error': return 'error';
            default: return 'info';
        }
    }, []);

    // OPTIMIZED: useCallback to prevent recreation on every render
    const formatTimeAgo = useCallback((timestamp) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - notificationTime) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInSeconds < 10) return 'Ahora mismo';
        if (diffInSeconds < 60) return `Hace ${diffInSeconds} seg`;
        if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
        if (diffInHours < 24) return `Hace ${diffInHours} h`;
        if (diffInDays === 1) return 'Ayer';
        if (diffInDays < 7) return `Hace ${diffInDays} días`;
        if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
        return notificationTime.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    }, []);

    // Filter notifications based on active tab, search, and type filter
    const filteredNotifications = useMemo(() => {
        let filtered = [...notifications];

        // Filter by tab
        switch (activeTab) {
            case 1: // Unread
                filtered = filtered.filter(n => !n.read);
                break;
            case 2: // Read
                filtered = filtered.filter(n => n.read);
                break;
            case 3: // Important (error or warning)
                filtered = filtered.filter(n => n.type === 'error' || n.type === 'warning');
                break;
            default: // All
                break;
        }

        // Filter by type
        if (typeFilter !== 'all') {
            filtered = filtered.filter(n => n.type === typeFilter);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(n =>
                n.title?.toLowerCase().includes(query) ||
                n.message?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [notifications, activeTab, typeFilter, searchQuery]);

    // Paginate filtered notifications
    const paginatedNotifications = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredNotifications.slice(startIndex, endIndex);
    }, [filteredNotifications, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

    // Count notifications by category
    const notificationCounts = useMemo(() => {
        return {
            all: notifications.length,
            unread: notifications.filter(n => !n.read).length,
            read: notifications.filter(n => n.read).length,
            important: notifications.filter(n => n.type === 'error' || n.type === 'warning').length
        };
    }, [notifications]);

    const removeToastNotification = (notificationId) => {
        setToastNotifications(prev => 
            prev.filter(n => n.id !== notificationId)
        );
    };

    return (
        <>
            {/* Notification Bell Icon */}
            <IconButton
                onClick={handleMenuOpen}
                sx={{
                    color: theme.palette.mode === 'dark' ? 'white' : theme.palette.text.primary,
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    }
                }}
            >
                <Badge
                    badgeContent={unreadCount}
                    color="error"
                    max={99}
                    sx={{
                        '& .MuiBadge-badge': {
                            animation: unreadCount > 0 && !dndEnabled ? 'pulse 2s infinite' : 'none',
                            '@keyframes pulse': {
                                '0%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.1)' },
                                '100%': { transform: 'scale(1)' }
                            }
                        }
                    }}
                >
                    {dndEnabled ? (
                        <NotificationsOffIcon />
                    ) : unreadCount > 0 ? (
                        <NotificationsActive />
                    ) : (
                        <NotificationsIcon />
                    )}
                </Badge>
            </IconButton>

            {/* Notification Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        width: 500,
                        maxHeight: 700,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {/* Header */}
                <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Notificaciones
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {/* DND Toggle */}
                            <Tooltip title={dndEnabled ? 'Desactivar No Molestar' : 'Activar No Molestar'}>
                                <IconButton
                                    size="small"
                                    onClick={onToggleDnd}
                                    color={dndEnabled ? 'warning' : 'default'}
                                >
                                    {dndEnabled ? <NotificationsOffIcon fontSize="small" /> : <NotificationsIcon fontSize="small" />}
                                </IconButton>
                            </Tooltip>

                            {/* Mark All as Read */}
                            {unreadCount > 0 && (
                                <Tooltip title="Marcar todas como leídas">
                                    <IconButton size="small" onClick={handleMarkAllAsRead}>
                                        <MarkReadIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}

                            {/* Delete All Read */}
                            {notificationCounts.read > 0 && (
                                <Tooltip title="Eliminar todas las leídas">
                                    <IconButton
                                        size="small"
                                        onClick={handleDeleteAllRead}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? <CircularProgress size={16} /> : <DeleteSweepIcon fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    </Box>

                    {/* Unread Count */}
                    {unreadCount > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer
                        </Typography>
                    )}

                    {/* DND Status */}
                    {dndEnabled && (
                        <Chip
                            icon={<NotificationsOffIcon />}
                            label="Modo No Molestar activado"
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ mb: 1 }}
                        />
                    )}
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            minHeight: 40,
                            '& .MuiTab-root': {
                                minHeight: 40,
                                fontSize: '0.75rem',
                                textTransform: 'none'
                            }
                        }}
                    >
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    Todas
                                    <Chip label={notificationCounts.all} size="small" sx={{ height: 16, fontSize: '0.6rem' }} />
                                </Box>
                            }
                        />
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    No leídas
                                    <Chip label={notificationCounts.unread} size="small" color="primary" sx={{ height: 16, fontSize: '0.6rem' }} />
                                </Box>
                            }
                        />
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    Leídas
                                    <Chip label={notificationCounts.read} size="small" sx={{ height: 16, fontSize: '0.6rem' }} />
                                </Box>
                            }
                        />
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <PriorityIcon fontSize="small" />
                                    Importantes
                                    <Chip label={notificationCounts.important} size="small" color="error" sx={{ height: 16, fontSize: '0.6rem' }} />
                                </Box>
                            }
                        />
                    </Tabs>
                </Box>

                {/* Filters */}
                <Box sx={{ p: 2, display: 'flex', gap: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    {/* Search */}
                    <TextField
                        size="small"
                        placeholder="Buscar notificaciones..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flex: 1 }}
                    />

                    {/* Type Filter */}
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                            value={typeFilter}
                            onChange={handleTypeFilterChange}
                            displayEmpty
                            startAdornment={
                                <InputAdornment position="start">
                                    <FilterIcon fontSize="small" />
                                </InputAdornment>
                            }
                        >
                            <MenuItem value="all">Todos los tipos</MenuItem>
                            <MenuItem value="success">Éxito</MenuItem>
                            <MenuItem value="info">Info</MenuItem>
                            <MenuItem value="warning">Advertencia</MenuItem>
                            <MenuItem value="error">Error</MenuItem>
                            <MenuItem value="security">Seguridad</MenuItem>
                            <MenuItem value="user">Usuario</MenuItem>
                            <MenuItem value="content">Contenido</MenuItem>
                            <MenuItem value="system">Sistema</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* Notifications List */}
                <List sx={{ maxHeight: 350, overflow: 'auto', p: 0 }}>
                    {filteredNotifications.length === 0 ? (
                        <ListItem>
                            <ListItemText
                                primary={
                                    searchQuery || typeFilter !== 'all'
                                        ? "No se encontraron notificaciones"
                                        : "No hay notificaciones"
                                }
                                secondary={
                                    searchQuery || typeFilter !== 'all'
                                        ? "Intenta ajustar los filtros de búsqueda"
                                        : "Todas las notificaciones aparecerán aquí"
                                }
                                sx={{ textAlign: 'center', py: 4 }}
                            />
                        </ListItem>
                    ) : (
                        <AnimatePresence mode="wait">
                            {paginatedNotifications.map((notification, index) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <ListItem
                                        sx={{
                                            backgroundColor: !notification.read
                                                ? alpha(theme.palette.primary.main, 0.05)
                                                : 'transparent',
                                            borderLeft: !notification.read
                                                ? `3px solid ${theme.palette.primary.main}`
                                                : '3px solid transparent',
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.action.hover, 0.1)
                                            },
                                            cursor: notification.action_url ? 'pointer' : 'default',
                                            py: 1.5
                                        }}
                                        onClick={() => {
                                            if (!notification.read) {
                                                handleMarkAsRead(notification.id);
                                            }
                                            if (notification.action_url) {
                                                window.location.href = notification.action_url;
                                            }
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            {getNotificationIcon(notification.type)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: !notification.read ? 600 : 400,
                                                            flex: 1
                                                        }}
                                                    >
                                                        {notification.title}
                                                    </Typography>
                                                    {!notification.read && (
                                                        <Chip
                                                            label="Nuevo"
                                                            size="small"
                                                            color="primary"
                                                            sx={{
                                                                height: 16,
                                                                fontSize: '0.6rem',
                                                                animation: 'pulse 2s infinite',
                                                                '@keyframes pulse': {
                                                                    '0%, 100%': { opacity: 1 },
                                                                    '50%': { opacity: 0.7 }
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            mb: 0.5,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        {notification.message}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatTimeAgo(notification.timestamp)}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                {!notification.read && (
                                                    <Tooltip title="Marcar como leída">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMarkAsRead(notification.id);
                                                            }}
                                                        >
                                                            <MarkReadIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="Eliminar">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteNotification(notification.id);
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    {index < paginatedNotifications.length - 1 && <Divider />}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </List>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{
                        p: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        borderTop: `1px solid ${theme.palette.divider}`
                    }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            size="small"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                )}
            </Menu>

            {/* Toast Notifications */}
            <AnimatePresence>
                {toastNotifications.map((notification, index) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 50, scale: 0.3 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        style={{
                            position: 'fixed',
                            top: 20 + (index * 80),
                            right: 20,
                            zIndex: 9999,
                        }}
                    >
                        <Snackbar
                            open={true}
                            autoHideDuration={6000}
                            onClose={() => removeToastNotification(notification.id)}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <Alert
                                onClose={() => removeToastNotification(notification.id)}
                                severity={getNotificationSeverity(notification.type)}
                                variant="filled"
                                sx={{
                                    minWidth: 300,
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
                                }}
                            >
                                <AlertTitle>{notification.title}</AlertTitle>
                                {notification.message}
                            </Alert>
                        </Snackbar>
                    </motion.div>
                ))}
            </AnimatePresence>
        </>
    );
};

export default NotificationSystem;
