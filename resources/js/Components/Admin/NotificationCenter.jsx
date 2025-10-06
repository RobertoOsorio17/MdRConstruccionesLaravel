import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Divider,
    Button,
    Chip,
    Tooltip,
    Tab,
    Tabs,
    alpha,
    CircularProgress,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    NotificationsActive as NotificationsActiveIcon,
    CheckCircle as CheckCircleIcon,
    Delete as DeleteIcon,
    DoneAll as DoneAllIcon,
    FilterList as FilterListIcon,
    Refresh as RefreshIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    CheckCircleOutline as SuccessIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';

const NotificationCenter = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [hasNewNotifications, setHasNewNotifications] = useState(false);
    const audioRef = useRef(null);
    const previousCountRef = useRef(0);

    const open = Boolean(anchorEl);

    // Fetch notifications
    const fetchNotifications = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        
        try {
            const response = await fetch(route('admin.api.notifications.index', { limit: 20 }));
            const data = await response.json();
            
            if (data.success) {
                const newCount = data.unread_count;
                
                // Check if there are new notifications
                if (newCount > previousCountRef.current && previousCountRef.current > 0) {
                    setHasNewNotifications(true);
                    playNotificationSound();
                    
                    // Reset animation after 3 seconds
                    setTimeout(() => setHasNewNotifications(false), 3000);
                }
                
                previousCountRef.current = newCount;
                setNotifications(data.notifications);
                setUnreadCount(newCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Play notification sound
    const playNotificationSound = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(err => console.log('Audio play failed:', err));
        }
    };

    // Polling every 30 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => fetchNotifications(), 30000);
        return () => clearInterval(interval);
    }, []);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification) => {
        try {
            // Mark as read
            if (!notification.read_at) {
                await fetch(route('admin.api.notifications.read', notification.id), {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    },
                });
                
                // Update local state
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            
            // Navigate to action URL
            if (notification.action_url) {
                router.visit(notification.action_url);
            }
        } catch (error) {
            console.error('Error handling notification click:', error);
        }
        
        handleClose();
    };

    const handleMarkAllAsRead = async () => {
        try {
            await fetch(route('admin.api.notifications.mark-all-read'), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });
            
            setNotifications(prev =>
                prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDeleteNotification = async (notificationId, event) => {
        event.stopPropagation();

        try {
            await fetch(route('admin.api.notifications.destroy', notificationId), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });
            
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            
            // Update unread count if notification was unread
            const notification = notifications.find(n => n.id === notificationId);
            if (notification && !notification.read_at) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <SuccessIcon sx={{ color: '#48BB78' }} />;
            case 'warning':
                return <WarningIcon sx={{ color: '#F6AD55' }} />;
            case 'error':
                return <ErrorIcon sx={{ color: '#E53E3E' }} />;
            default:
                return <InfoIcon sx={{ color: '#667eea' }} />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent':
                return '#E53E3E';
            case 'high':
                return '#F6AD55';
            case 'medium':
                return '#667eea';
            default:
                return '#718096';
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read_at;
        if (filter === 'read') return n.read_at;
        return true;
    });

    const glassmorphismStyles = {
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        borderRadius: '16px',
    };

    return (
        <>
            {/* Hidden audio element for notification sound */}
            <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />

            {/* Notification Bell Button */}
            <Tooltip title="Notificaciones">
                <IconButton
                    onClick={handleClick}
                    sx={{
                        color: 'white',
                        transition: 'all 0.3s ease',
                        animation: hasNewNotifications ? 'shake 0.5s ease-in-out' : 'none',
                        '@keyframes shake': {
                            '0%, 100%': { transform: 'rotate(0deg)' },
                            '10%, 30%, 50%, 70%, 90%': { transform: 'rotate(-10deg)' },
                            '20%, 40%, 60%, 80%': { transform: 'rotate(10deg)' },
                        },
                        '&:hover': {
                            transform: 'scale(1.1)',
                        },
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
                                    '0%': { transform: 'scale(1)', opacity: 1 },
                                    '50%': { transform: 'scale(1.2)', opacity: 0.8 },
                                    '100%': { transform: 'scale(1)', opacity: 1 },
                                },
                            },
                        }}
                    >
                        {unreadCount > 0 ? <NotificationsActiveIcon /> : <NotificationsIcon />}
                    </Badge>
                </IconButton>
            </Tooltip>

            {/* Notification Menu */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        ...glassmorphismStyles,
                        mt: 1.5,
                        width: 450,
                        maxHeight: 600,
                        overflow: 'hidden',
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {/* Header */}
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#2D3748' }}>
                            Notificaciones
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Actualizar">
                                <IconButton size="small" onClick={() => fetchNotifications(true)} disabled={loading}>
                                    <RefreshIcon sx={{ fontSize: 20, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                                </IconButton>
                            </Tooltip>
                            {unreadCount > 0 && (
                                <Tooltip title="Marcar todas como leídas">
                                    <IconButton size="small" onClick={handleMarkAllAsRead}>
                                        <DoneAllIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    </Box>

                    {/* Filter Tabs */}
                    <Tabs
                        value={filter}
                        onChange={(e, newValue) => setFilter(newValue)}
                        sx={{
                            minHeight: 36,
                            '& .MuiTab-root': {
                                minHeight: 36,
                                py: 0.5,
                                px: 2,
                                fontSize: '0.875rem',
                                textTransform: 'none',
                                fontWeight: 500,
                            },
                        }}
                    >
                        <Tab label="Todas" value="all" />
                        <Tab label={`No leídas (${unreadCount})`} value="unread" />
                        <Tab label="Leídas" value="read" />
                    </Tabs>
                </Box>

                {/* Notifications List */}
                <Box sx={{ maxHeight: 450, overflowY: 'auto' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={32} />
                        </Box>
                    ) : filteredNotifications.length > 0 ? (
                        <AnimatePresence>
                            {filteredNotifications.map((notification, index) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <MenuItem
                                        onClick={() => handleNotificationClick(notification)}
                                        sx={{
                                            py: 1.5,
                                            px: 2,
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            backgroundColor: notification.read_at ? 'transparent' : 'rgba(102, 126, 234, 0.05)',
                                            borderLeft: `4px solid ${getPriorityColor(notification.priority)}`,
                                            '&:hover': {
                                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                            },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', gap: 1.5, width: '100%', alignItems: 'flex-start' }}>
                                            {/* Icon */}
                                            <Box sx={{ mt: 0.5 }}>
                                                {getNotificationIcon(notification.type)}
                                            </Box>

                                            {/* Content */}
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                                    <Typography 
                                                        variant="body2" 
                                                        fontWeight={notification.read_at ? 400 : 600}
                                                        sx={{ color: '#2D3748', pr: 1 }}
                                                    >
                                                        {notification.title}
                                                    </Typography>
                                                    {!notification.read_at && (
                                                        <Box
                                                            sx={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                backgroundColor: '#667eea',
                                                                flexShrink: 0,
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                                
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{
                                                        color: '#718096',
                                                        mb: 0.5,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                    }}
                                                >
                                                    {notification.message}
                                                </Typography>
                                                
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="caption" sx={{ color: '#A0AEC0', fontSize: '0.7rem' }}>
                                                        {new Date(notification.created_at).toLocaleString('es-ES', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </Typography>
                                                    
                                                    {notification.is_dismissible && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => handleDeleteNotification(notification.id, e)}
                                                            sx={{ 
                                                                opacity: 0.6,
                                                                '&:hover': { opacity: 1, color: '#E53E3E' }
                                                            }}
                                                        >
                                                            <DeleteIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </MenuItem>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
                            <Typography variant="body2" color="text.secondary">
                                {filter === 'unread' ? 'No hay notificaciones sin leer' : 
                                 filter === 'read' ? 'No hay notificaciones leídas' : 
                                 'No hay notificaciones'}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Menu>
        </>
    );
};

export default NotificationCenter;

