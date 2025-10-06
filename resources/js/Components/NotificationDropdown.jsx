import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    Box,
    Button,
    Avatar,
    alpha,
    Stack,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Reply as ReplyIcon,
    ThumbUp as ThumbUpIcon,
    CheckCircle as CheckCircleIcon,
    Article as ArticleIcon,
    Star as StarIcon,
    PersonAdd as PersonAddIcon,
    RateReview as RateReviewIcon,
    DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import axios from 'axios';

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

export default function NotificationDropdown() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const open = Boolean(anchorEl);

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get(route('notifications.unread-count'));
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const fetchRecentNotifications = async () => {
        try {
            const response = await axios.get(route('notifications.recent'));
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        
        // Poll every 30 seconds
        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        fetchRecentNotifications();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read
        if (!notification.is_read) {
            try {
                await axios.post(route('notifications.mark-read', notification.id));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }

        // Navigate to URL
        if (notification.data.url) {
            window.location.href = notification.data.url;
        }

        handleClose();
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.post(route('notifications.mark-all-read'));
            setUnreadCount(0);
            fetchRecentNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleViewAll = () => {
        router.visit(route('notifications.index'));
        handleClose();
    };

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleClick}
                sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'scale(1.1)',
                    },
                }}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        minWidth: 360,
                        maxWidth: 400,
                        maxHeight: 500,
                        background: alpha('#ffffff', 0.95),
                        backdropFilter: 'blur(20px)',
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={600}>
                            Notificaciones
                        </Typography>
                        {unreadCount > 0 && (
                            <Button
                                size="small"
                                startIcon={<DoneAllIcon />}
                                onClick={handleMarkAllAsRead}
                            >
                                Marcar todas
                            </Button>
                        )}
                    </Stack>
                </Box>

                <Divider />

                {notifications.length > 0 ? (
                    <>
                        {notifications.map((notification) => (
                            <NotificationMenuItem
                                key={notification.id}
                                notification={notification}
                                onClick={() => handleNotificationClick(notification)}
                            />
                        ))}

                        <Divider />

                        <Box sx={{ p: 1 }}>
                            <Button
                                fullWidth
                                variant="text"
                                onClick={handleViewAll}
                            >
                                Ver todas las notificaciones
                            </Button>
                        </Box>
                    </>
                ) : (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            No hay notificaciones
                        </Typography>
                    </Box>
                )}
            </Menu>
        </>
    );
}

function NotificationMenuItem({ notification, onClick }) {
    const IconComponent = iconMap[notification.icon] || NotificationsIcon;

    return (
        <MenuItem
            onClick={onClick}
            sx={{
                py: 1.5,
                px: 2,
                bgcolor: notification.is_read ? 'transparent' : alpha('#667eea', 0.05),
                '&:hover': {
                    bgcolor: alpha('#667eea', 0.1),
                },
            }}
        >
            <ListItemIcon>
                <Avatar
                    sx={{
                        bgcolor: `${notification.color}.main`,
                        width: 40,
                        height: 40,
                    }}
                >
                    <IconComponent fontSize="small" />
                </Avatar>
            </ListItemIcon>
            <ListItemText
                primary={notification.data.title}
                secondary={notification.created_at_human}
                primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: notification.is_read ? 400 : 600,
                    sx: {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }
                }}
                secondaryTypographyProps={{
                    variant: 'caption',
                    color: 'text.secondary'
                }}
            />
            {!notification.is_read && (
                <Box
                    sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        ml: 1,
                    }}
                />
            )}
        </MenuItem>
    );
}

