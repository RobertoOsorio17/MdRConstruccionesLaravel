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
    useTheme,
    Skeleton,
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
    FileDownload as FileDownloadIcon,
    Timeline as TimelineIcon,
} from '@mui/icons-material';

const NotificationCenter = () => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [typeFilter, setTypeFilter] = useState('all'); // all, info, warning, error, success
    const [viewMode, setViewMode] = useState('list'); // list, timeline
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
            setInitialLoading(false);
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

    const handleExport = () => {
        // Export notifications as JSON
        const dataStr = JSON.stringify(filteredNotifications, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `notifications-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
        // Filter by read status
        if (filter === 'unread' && n.read_at) return false;
        if (filter === 'read' && !n.read_at) return false;

        // Filter by type
        if (typeFilter !== 'all' && n.type !== typeFilter) return false;

        return true;
    });

    // Neutral card styles instead of glassmorphism
    const neutralCardStyles = {
        background: theme.palette.mode === 'dark'
            ? '#1e293b'
            : '#ffffff',
        border: theme.palette.mode === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0, 0, 0, 0.5)'
            : '0 4px 20px rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
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
                        color: 'text.primary',
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
                        ...neutralCardStyles,
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
                <Box sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: theme.palette.mode === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)'
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                                color: theme.palette.mode === 'dark' ? 'white' : '#2D3748'
                            }}
                        >
                            Notificaciones
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title={viewMode === 'list' ? 'Vista Timeline' : 'Vista Lista'}>
                                <IconButton
                                    size="small"
                                    onClick={() => setViewMode(viewMode === 'list' ? 'timeline' : 'list')}
                                    sx={{
                                        color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                                    }}
                                >
                                    <TimelineIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Exportar">
                                <IconButton
                                    size="small"
                                    onClick={handleExport}
                                    sx={{
                                        color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                                    }}
                                >
                                    <FileDownloadIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Actualizar">
                                <IconButton
                                    size="small"
                                    onClick={() => fetchNotifications(true)}
                                    disabled={loading}
                                    sx={{
                                        color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                                    }}
                                >
                                    <RefreshIcon sx={{
                                        fontSize: 20,
                                        animation: loading ? 'spin 1s linear infinite' : 'none',
                                        '@keyframes spin': {
                                            '0%': { transform: 'rotate(0deg)' },
                                            '100%': { transform: 'rotate(360deg)' }
                                        }
                                    }} />
                                </IconButton>
                            </Tooltip>
                            {unreadCount > 0 && (
                                <Tooltip title="Marcar todas como leídas">
                                    <IconButton
                                        size="small"
                                        onClick={handleMarkAllAsRead}
                                        sx={{
                                            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                                        }}
                                    >
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
                                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                '&.Mui-selected': {
                                    color: theme.palette.mode === 'dark' ? 'white' : 'primary.main'
                                }
                            },
                        }}
                    >
                        <Tab label="Todas" value="all" />
                        <Tab label={`No leídas (${unreadCount})`} value="unread" />
                        <Tab label="Leídas" value="read" />
                    </Tabs>

                    {/* Type Filter Chips */}
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5, flexWrap: 'wrap' }}>
                        <Chip
                            label="Todas"
                            size="small"
                            onClick={() => setTypeFilter('all')}
                            sx={{
                                backgroundColor: typeFilter === 'all'
                                    ? theme.palette.mode === 'dark' ? '#667eea' : '#667eea'
                                    : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                color: typeFilter === 'all'
                                    ? 'white'
                                    : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                fontWeight: typeFilter === 'all' ? 600 : 400,
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: typeFilter === 'all'
                                        ? '#5568d3'
                                        : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                                }
                            }}
                        />
                        <Chip
                            icon={<InfoIcon sx={{ fontSize: 16, color: typeFilter === 'info' ? 'white' : '#667eea' }} />}
                            label="Info"
                            size="small"
                            onClick={() => setTypeFilter('info')}
                            sx={{
                                backgroundColor: typeFilter === 'info'
                                    ? '#667eea'
                                    : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                color: typeFilter === 'info'
                                    ? 'white'
                                    : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                fontWeight: typeFilter === 'info' ? 600 : 400,
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: typeFilter === 'info'
                                        ? '#5568d3'
                                        : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                                }
                            }}
                        />
                        <Chip
                            icon={<SuccessIcon sx={{ fontSize: 16, color: typeFilter === 'success' ? 'white' : '#48BB78' }} />}
                            label="Éxito"
                            size="small"
                            onClick={() => setTypeFilter('success')}
                            sx={{
                                backgroundColor: typeFilter === 'success'
                                    ? '#48BB78'
                                    : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                color: typeFilter === 'success'
                                    ? 'white'
                                    : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                fontWeight: typeFilter === 'success' ? 600 : 400,
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: typeFilter === 'success'
                                        ? '#38a169'
                                        : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                                }
                            }}
                        />
                        <Chip
                            icon={<WarningIcon sx={{ fontSize: 16, color: typeFilter === 'warning' ? 'white' : '#F6AD55' }} />}
                            label="Aviso"
                            size="small"
                            onClick={() => setTypeFilter('warning')}
                            sx={{
                                backgroundColor: typeFilter === 'warning'
                                    ? '#F6AD55'
                                    : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                color: typeFilter === 'warning'
                                    ? 'white'
                                    : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                fontWeight: typeFilter === 'warning' ? 600 : 400,
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: typeFilter === 'warning'
                                        ? '#ed8936'
                                        : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                                }
                            }}
                        />
                        <Chip
                            icon={<ErrorIcon sx={{ fontSize: 16, color: typeFilter === 'error' ? 'white' : '#E53E3E' }} />}
                            label="Error"
                            size="small"
                            onClick={() => setTypeFilter('error')}
                            sx={{
                                backgroundColor: typeFilter === 'error'
                                    ? '#E53E3E'
                                    : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                color: typeFilter === 'error'
                                    ? 'white'
                                    : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                fontWeight: typeFilter === 'error' ? 600 : 400,
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: typeFilter === 'error'
                                        ? '#c53030'
                                        : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                                }
                            }}
                        />
                    </Box>
                </Box>

                {/* Notifications List */}
                <Box sx={{ maxHeight: 450, overflowY: 'auto' }}>
                    {initialLoading ? (
                        // Skeleton loaders for initial load
                        <Box sx={{ px: 2, py: 1 }}>
                            {[1, 2, 3, 4, 5].map((item) => (
                                <Box key={item} sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                        <Skeleton variant="circular" width={24} height={24} />
                                        <Box sx={{ flex: 1 }}>
                                            <Skeleton variant="text" width="80%" height={20} />
                                            <Skeleton variant="text" width="60%" height={16} sx={{ mt: 0.5 }} />
                                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} />
                                                <Skeleton variant="text" width={80} height={16} />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    ) : loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={32} />
                        </Box>
                    ) : filteredNotifications.length > 0 ? (
                        viewMode === 'timeline' ? (
                            // Timeline View
                            <Box sx={{ px: 2, py: 2 }}>
                                <AnimatePresence>
                                    {filteredNotifications.map((notification, index) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Box
                                                onClick={() => handleNotificationClick(notification)}
                                                sx={{
                                                    display: 'flex',
                                                    gap: 2,
                                                    mb: 3,
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    '&:hover .notification-content': {
                                                        backgroundColor: theme.palette.mode === 'dark'
                                                            ? 'rgba(102, 126, 234, 0.15)'
                                                            : 'rgba(102, 126, 234, 0.1)',
                                                    },
                                                }}
                                            >
                                                {/* Timeline line and dot */}
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                                    {/* Timestamp on left */}
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: '#A0AEC0',
                                                            fontSize: '0.7rem',
                                                            mb: 0.5,
                                                            minWidth: 60,
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        {new Date(notification.created_at).toLocaleTimeString('es-ES', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </Typography>

                                                    {/* Dot */}
                                                    <Box
                                                        sx={{
                                                            width: 12,
                                                            height: 12,
                                                            borderRadius: '50%',
                                                            backgroundColor: getPriorityColor(notification.priority),
                                                            border: `2px solid ${theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff'}`,
                                                            flexShrink: 0,
                                                            zIndex: 1,
                                                            animation: !notification.read_at ? 'timelinePulse 2s ease-in-out infinite' : 'none',
                                                            '@keyframes timelinePulse': {
                                                                '0%, 100%': {
                                                                    transform: 'scale(1)',
                                                                    boxShadow: `0 0 0 0 ${getPriorityColor(notification.priority)}`
                                                                },
                                                                '50%': {
                                                                    transform: 'scale(1.2)',
                                                                    boxShadow: `0 0 0 4px ${alpha(getPriorityColor(notification.priority), 0.3)}`
                                                                }
                                                            }
                                                        }}
                                                    />

                                                    {/* Vertical line */}
                                                    {index < filteredNotifications.length - 1 && (
                                                        <Box
                                                            sx={{
                                                                width: 2,
                                                                flex: 1,
                                                                minHeight: 40,
                                                                backgroundColor: theme.palette.mode === 'dark'
                                                                    ? 'rgba(255,255,255,0.1)'
                                                                    : 'rgba(0,0,0,0.1)',
                                                                mt: 0.5
                                                            }}
                                                        />
                                                    )}
                                                </Box>

                                                {/* Content card */}
                                                <Box
                                                    className="notification-content"
                                                    sx={{
                                                        flex: 1,
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        backgroundColor: notification.read_at
                                                            ? 'transparent'
                                                            : theme.palette.mode === 'dark'
                                                                ? 'rgba(102, 126, 234, 0.1)'
                                                                : 'rgba(102, 126, 234, 0.05)',
                                                        border: theme.palette.mode === 'dark'
                                                            ? '1px solid rgba(255,255,255,0.05)'
                                                            : '1px solid rgba(0,0,0,0.05)',
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                                                        {getNotificationIcon(notification.type)}
                                                        <Box sx={{ flex: 1 }}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                <Typography
                                                                    variant="body2"
                                                                    fontWeight={notification.read_at ? 400 : 600}
                                                                    sx={{
                                                                        color: theme.palette.mode === 'dark' ? 'white' : '#2D3748',
                                                                        pr: 1
                                                                    }}
                                                                >
                                                                    {notification.title}
                                                                </Typography>
                                                                {!notification.read_at && (
                                                                    <Chip
                                                                        label="Nuevo"
                                                                        size="small"
                                                                        sx={{
                                                                            height: 18,
                                                                            fontSize: '0.65rem',
                                                                            backgroundColor: '#667eea',
                                                                            color: 'white'
                                                                        }}
                                                                    />
                                                                )}
                                                            </Box>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: '#718096',
                                                                    display: 'block',
                                                                    mt: 0.5
                                                                }}
                                                            >
                                                                {notification.message}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: '#A0AEC0',
                                                                    fontSize: '0.7rem',
                                                                    display: 'block',
                                                                    mt: 0.5
                                                                }}
                                                            >
                                                                {new Date(notification.created_at).toLocaleDateString('es-ES', {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })}
                                                            </Typography>
                                                        </Box>
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
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </Box>
                        ) : (
                            // List View
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
                                                borderBottom: theme.palette.mode === 'dark'
                                                    ? '1px solid rgba(255,255,255,0.05)'
                                                    : '1px solid rgba(0,0,0,0.05)',
                                                backgroundColor: notification.read_at
                                                    ? 'transparent'
                                                    : theme.palette.mode === 'dark'
                                                        ? 'rgba(102, 126, 234, 0.1)'
                                                        : 'rgba(102, 126, 234, 0.05)',
                                                borderLeft: `4px solid ${getPriorityColor(notification.priority)}`,
                                                '&:hover': {
                                                    backgroundColor: theme.palette.mode === 'dark'
                                                        ? 'rgba(102, 126, 234, 0.15)'
                                                        : 'rgba(102, 126, 234, 0.1)',
                                                },
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', gap: 1.5, width: '100%', alignItems: 'flex-start' }}>
                                                {/* Icon with pulse animation for unread */}
                                                <Box
                                                    sx={{
                                                        mt: 0.5,
                                                        animation: !notification.read_at ? 'iconPulse 2s ease-in-out infinite' : 'none',
                                                        '@keyframes iconPulse': {
                                                            '0%, 100%': {
                                                                transform: 'scale(1)',
                                                                opacity: 1
                                                            },
                                                            '50%': {
                                                                transform: 'scale(1.1)',
                                                                opacity: 0.8
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {getNotificationIcon(notification.type)}
                                                </Box>

                                                {/* Content */}
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={notification.read_at ? 400 : 600}
                                                            sx={{
                                                                color: theme.palette.mode === 'dark' ? 'white' : '#2D3748',
                                                                pr: 1
                                                            }}
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
                                                                    animation: 'dotPulse 2s ease-in-out infinite',
                                                                    '@keyframes dotPulse': {
                                                                        '0%, 100%': {
                                                                            transform: 'scale(1)',
                                                                            opacity: 1,
                                                                            boxShadow: '0 0 0 0 rgba(102, 126, 234, 0.7)'
                                                                        },
                                                                        '50%': {
                                                                            transform: 'scale(1.2)',
                                                                            opacity: 0.8,
                                                                            boxShadow: '0 0 0 4px rgba(102, 126, 234, 0)'
                                                                        }
                                                                    }
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
                        )
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

