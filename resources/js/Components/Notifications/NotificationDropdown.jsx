import React, { useState, useEffect } from 'react';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
    Divider,
    Button,
    CircularProgress,
    alpha,
    Tooltip,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    NotificationsActive as NotificationsActiveIcon,
    Reply as ReplyIcon,
    ThumbUp as ThumbUpIcon,
    CheckCircle as CheckCircleIcon,
    Article as ArticleIcon,
    Star as StarIcon,
    PersonAdd as PersonAddIcon,
    RateReview as RateReviewIcon,
    MarkEmailRead as MarkEmailReadIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { router } from '@inertiajs/react';
import axios from 'axios';

// Icon mapping based on notification type
const iconMap = {
    Reply: ReplyIcon,
    ThumbUp: ThumbUpIcon,
    CheckCircle: CheckCircleIcon,
    Article: ArticleIcon,
    Star: StarIcon,
    PersonAdd: PersonAddIcon,
    RateReview: RateReviewIcon,
    Notifications: NotificationsIcon,
};

// Color mapping based on notification type
const colorMap = {
    primary: 'primary.main',
    error: 'error.main',
    success: 'success.main',
    info: 'info.main',
    warning: 'warning.main',
    secondary: 'secondary.main',
    default: 'text.secondary',
};

export default function NotificationDropdown({ unreadCount: initialUnreadCount = 0 }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const [loading, setLoading] = useState(false);
    const open = Boolean(anchorEl);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (open && notifications.length === 0) {
            fetchNotifications();
        }
    }, [open]);

    // Fetch unread count periodically
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('notifications.recent'));
            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get(route('notifications.unread-count'));
            setUnreadCount(response.data.count || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await axios.post(route('notifications.mark-read', notificationId));
            
            // Update local state
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, is_read: true, read_at: new Date() } : n
                )
            );
            
            // Update unread count
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.post(route('notifications.mark-all-read'));
            
            // Update local state
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true, read_at: new Date() }))
            );
            
            // Reset unread count
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            await axios.delete(route('notifications.destroy', notificationId));
            
            // Remove from local state
            const notification = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            
            // Update unread count if it was unread
            if (notification && !notification.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (iconName) => {
        const IconComponent = iconMap[iconName] || NotificationsIcon;
        return IconComponent;
    };

    const getNotificationMessage = (notification) => {
        const data = notification.data || {};
        
        switch (notification.type) {
            case 'comment_reply':
                return `${data.user_name || 'Alguien'} respondió a tu comentario`;
            case 'comment_like':
                return `A ${data.user_name || 'alguien'} le gustó tu comentario`;
            case 'comment_approved':
                return 'Tu comentario ha sido aprobado';
            case 'post_published':
                return `Nuevo post publicado: ${data.post_title || 'Sin título'}`;
            case 'post_featured':
                return `Tu post "${data.post_title || 'Sin título'}" ha sido destacado`;
            case 'user_followed':
                return `${data.user_name || 'Alguien'} comenzó a seguirte`;
            case 'review_received':
                return `Nueva reseña recibida de ${data.user_name || 'un usuario'}`;
            default:
                return data.message || 'Nueva notificación';
        }
    };

    return (
        <>
            <Tooltip title="Notificaciones">
                <IconButton
                    onClick={handleClick}
                    aria-label="Notificaciones"
                    sx={{
                        minWidth: 40,
                        minHeight: 40,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                            transform: 'scale(1.05)'
                        }
                    }}
                >
                    <Badge
                        badgeContent={unreadCount}
                        color="error"
                        max={99}
                        sx={{
                            '& .MuiBadge-badge': {
                                fontSize: '0.65rem',
                                minWidth: 18,
                                height: 18,
                                padding: '0 4px',
                                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                                animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                                '@keyframes pulse': {
                                    '0%, 100%': { opacity: 1 },
                                    '50%': { opacity: 0.7 }
                                }
                            }
                        }}
                    >
                        {unreadCount > 0 ? (
                            <NotificationsActiveIcon sx={{ color: 'text.primary', fontSize: '1.5rem' }} />
                        ) : (
                            <NotificationsIcon sx={{ color: 'text.primary', fontSize: '1.5rem' }} />
                        )}
                    </Badge>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        mt: 1.5,
                        width: 400,
                        maxHeight: 500,
                        overflow: 'hidden',
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {/* Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Notificaciones
                        </Typography>
                        {unreadCount > 0 && (
                            <Button
                                size="small"
                                onClick={handleMarkAllAsRead}
                                startIcon={<MarkEmailReadIcon />}
                                sx={{ textTransform: 'none' }}
                            >
                                Marcar todas como leídas
                            </Button>
                        )}
                    </Box>
                </Box>

                {/* Notifications List */}
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress size={32} />
                        </Box>
                    ) : notifications.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                No tienes notificaciones
                            </Typography>
                        </Box>
                    ) : (
                        notifications.map((notification, index) => {
                            const IconComponent = getNotificationIcon(notification.icon);
                            const message = getNotificationMessage(notification);
                            
                            return (
                                <React.Fragment key={notification.id}>
                                    <MenuItem
                                        sx={{
                                            py: 1.5,
                                            px: 2,
                                            backgroundColor: notification.is_read ? 'transparent' : alpha('#3b82f6', 0.05),
                                            '&:hover': {
                                                backgroundColor: notification.is_read 
                                                    ? alpha('#000', 0.04) 
                                                    : alpha('#3b82f6', 0.1),
                                            },
                                        }}
                                    >
                                        <ListItemIcon>
                                            <IconComponent 
                                                sx={{ 
                                                    color: colorMap[notification.color] || 'text.secondary',
                                                    fontSize: 28 
                                                }} 
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={message}
                                            secondary={notification.created_at_human}
                                            primaryTypographyProps={{
                                                variant: 'body2',
                                                fontWeight: notification.is_read ? 400 : 600,
                                            }}
                                            secondaryTypographyProps={{
                                                variant: 'caption',
                                            }}
                                        />
                                        <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                                            {!notification.is_read && (
                                                <Tooltip title="Marcar como leída">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkAsRead(notification.id);
                                                        }}
                                                    >
                                                        <MarkEmailReadIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Eliminar">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(notification.id);
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </MenuItem>
                                    {index < notifications.length - 1 && <Divider />}
                                </React.Fragment>
                            );
                        })
                    )}
                </Box>
            </Menu>
        </>
    );
}

