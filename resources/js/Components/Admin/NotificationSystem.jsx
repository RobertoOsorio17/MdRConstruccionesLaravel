import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    alpha
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
    NotificationsOff as NotificationsOffIcon
} from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationSystem = ({ 
    notifications = [], 
    onMarkAsRead, 
    onMarkAllAsRead, 
    onDeleteNotification,
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

    // Calculate unread count (allow override from backend)
    useEffect(() => {
        if (typeof unreadCountOverride === 'number') {
            setUnreadCount(unreadCountOverride);
        } else {
            const unread = notifications.filter(n => !n.read).length;
            setUnreadCount(unread);
        }
    }, [notifications, unreadCountOverride]);

    // Handle new notifications for toast display (show once, respect DND)
    useEffect(() => {
        if (dndEnabled) {
            setToastNotifications([]);
            return;
        }

        const unseen = notifications
            .filter(n => !n.read && n.showAsToast && !shownToastIdsRef.current.has(n.id))
            .slice(0, maxToastNotifications);

        if (unseen.length > 0) {
            unseen.forEach(n => shownToastIdsRef.current.add(n.id));
            setToastNotifications(unseen);
        }
    }, [notifications, maxToastNotifications, dndEnabled]);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

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

    const getNotificationIcon = (type) => {
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
    };

    const getNotificationSeverity = (type) => {
        switch (type) {
            case 'success': return 'success';
            case 'warning': return 'warning';
            case 'error': return 'error';
            default: return 'info';
        }
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Ahora mismo';
        if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
        if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
        return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
    };

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
                    color: theme.palette.mode === 'dark' ? 'white' : 'inherit',
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
                            animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                            '@keyframes pulse': {
                                '0%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.1)' },
                                '100%': { transform: 'scale(1)' }
                            }
                        }
                    }}
                >
                    {unreadCount > 0 ? <NotificationsActive /> : <NotificationsIcon />}
                </Badge>
            </IconButton>

            {/* Notification Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: {
                        width: 400,
                        maxHeight: 500,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Notificaciones
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Tooltip title={dndEnabled ? 'No molestar activado' : 'No molestar desactivado'}>
                                <IconButton size="small" onClick={onToggleDnd}>
                                    {dndEnabled ? <NotificationsOffIcon fontSize="small" /> : <NotificationsIcon fontSize="small" />}
                                </IconButton>
                            </Tooltip>
                            {unreadCount > 0 && (
                                <Button
                                    size="small"
                                    onClick={handleMarkAllAsRead}
                                    sx={{ 
                                        textTransform: 'none',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    Marcar todas como leídas
                                </Button>
                            )}
                        </Box>
                    </Box>
                    {unreadCount > 0 && (
                        <Typography variant="body2" color="text.secondary">
                            {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer
                        </Typography>
                    )}
                </Box>

                <List sx={{ maxHeight: 350, overflow: 'auto', p: 0 }}>
                    {notifications.length === 0 ? (
                        <ListItem>
                            <ListItemText
                                primary="No hay notificaciones"
                                secondary="Todas las notificaciones aparecerán aquí"
                                sx={{ textAlign: 'center' }}
                            />
                        </ListItem>
                    ) : (
                        notifications.map((notification, index) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
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
                                        cursor: notification.action_url ? 'pointer' : 'default'
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
                                    <ListItemIcon>
                                        {getNotificationIcon(notification.type)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: !notification.read ? 600 : 400 }}>
                                                    {notification.title}
                                                </Typography>
                                                {!notification.read && (
                                                    <Chip 
                                                        label="Nuevo" 
                                                        size="small" 
                                                        color="primary" 
                                                        sx={{ height: 16, fontSize: '0.6rem' }}
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
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
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    title="Marcar como leída"
                                                >
                                                    <MarkReadIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteNotification(notification.id)}
                                                title="Eliminar notificación"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < notifications.length - 1 && <Divider />}
                            </motion.div>
                        ))
                    )}
                </List>
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
