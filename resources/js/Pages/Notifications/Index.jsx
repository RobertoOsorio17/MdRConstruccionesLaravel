import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
    Container,
    Box,
    Typography,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    IconButton,
    Chip,
    Paper,
    Button,
    Stack,
    Divider,
    alpha,
    Badge,
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
    Delete as DeleteIcon,
    DoneAll as DoneAllIcon,
    DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function NotificationsIndex({ notifications, stats, filter }) {
    const [activeTab, setActiveTab] = useState(filter || 'all');

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        router.get(route('notifications.index'), { filter: newValue }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleMarkAsRead = (notificationId) => {
        router.post(route('notifications.mark-read', notificationId), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleMarkAllAsRead = () => {
        router.post(route('notifications.mark-all-read'), {}, {
            preserveState: true,
            onSuccess: () => {
                // Refresh the page
                router.reload();
            },
        });
    };

    const handleDelete = (notificationId) => {
        if (confirm('¿Estás seguro de eliminar esta notificación?')) {
            router.delete(route('notifications.destroy', notificationId), {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleDeleteAllRead = () => {
        if (confirm('¿Estás seguro de eliminar todas las notificaciones leídas?')) {
            router.delete(route('notifications.delete-all-read'), {}, {
                preserveState: true,
                onSuccess: () => {
                    router.reload();
                },
            });
        }
    };

    const glassStyle = {
        background: alpha('#ffffff', 0.7),
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: `1px solid ${alpha('#ffffff', 0.3)}`,
        boxShadow: `0 8px 32px 0 ${alpha('#000000', 0.1)}`,
    };

    return (
        <MainLayout>
            <Head title="Notificaciones" />

            <Box
                sx={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    pt: 12,
                    pb: 8,
                }}
            >
                <Container maxWidth="md">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Paper elevation={0} sx={{ ...glassStyle, p: 4, mb: 4 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    Notificaciones
                                </Typography>

                                <Stack direction="row" spacing={1}>
                                    {stats.unread > 0 && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<DoneAllIcon />}
                                            onClick={handleMarkAllAsRead}
                                        >
                                            Marcar todas como leídas
                                        </Button>
                                    )}
                                    {stats.read > 0 && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="error"
                                            startIcon={<DeleteSweepIcon />}
                                            onClick={handleDeleteAllRead}
                                        >
                                            Eliminar leídas
                                        </Button>
                                    )}
                                </Stack>
                            </Stack>

                            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                                <Tab
                                    label={
                                        <Badge badgeContent={stats.total} color="primary">
                                            Todas
                                        </Badge>
                                    }
                                    value="all"
                                />
                                <Tab
                                    label={
                                        <Badge badgeContent={stats.unread} color="error">
                                            No leídas
                                        </Badge>
                                    }
                                    value="unread"
                                />
                                <Tab
                                    label={
                                        <Badge badgeContent={stats.read} color="default">
                                            Leídas
                                        </Badge>
                                    }
                                    value="read"
                                />
                            </Tabs>
                        </Paper>
                    </motion.div>

                    <AnimatePresence>
                        {notifications.data && notifications.data.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <Paper elevation={0} sx={glassStyle}>
                                    <List sx={{ p: 0 }}>
                                        {notifications.data.map((notification, index) => (
                                            <React.Fragment key={notification.id}>
                                                <NotificationItem
                                                    notification={notification}
                                                    onMarkAsRead={handleMarkAsRead}
                                                    onDelete={handleDelete}
                                                    index={index}
                                                />
                                                {index < notifications.data.length - 1 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </Paper>

                                {/* Pagination */}
                                {notifications.links && (
                                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                        <Stack direction="row" spacing={1}>
                                            {notifications.links.map((link, index) => (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? 'contained' : 'outlined'}
                                                    size="small"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.visit(link.url)}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    sx={{
                                                        ...glassStyle,
                                                        minWidth: 40,
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Paper elevation={0} sx={{ ...glassStyle, p: 6, textAlign: 'center' }}>
                                    <NotificationsIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h5" gutterBottom>
                                        No hay notificaciones
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Cuando recibas notificaciones, aparecerán aquí
                                    </Typography>
                                </Paper>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Container>
            </Box>
        </MainLayout>
    );
}

// Notification Item Component
function NotificationItem({ notification, onMarkAsRead, onDelete, index }) {
    const IconComponent = iconMap[notification.icon] || NotificationsIcon;

    const handleClick = () => {
        if (!notification.is_read) {
            onMarkAsRead(notification.id);
        }
        if (notification.data.url) {
            window.location.href = notification.data.url;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <ListItem
                sx={{
                    cursor: 'pointer',
                    bgcolor: notification.is_read ? 'transparent' : alpha('#667eea', 0.05),
                    '&:hover': {
                        bgcolor: alpha('#667eea', 0.1),
                    },
                    transition: 'all 0.3s ease',
                }}
                secondaryAction={
                    <IconButton edge="end" onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}>
                        <DeleteIcon />
                    </IconButton>
                }
                onClick={handleClick}
            >
                <ListItemAvatar>
                    <Avatar sx={{ bgcolor: `${notification.color}.main` }}>
                        <IconComponent />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={notification.data.title}
                    secondary={`${notification.data.message} • ${notification.created_at_human}`}
                    primaryTypographyProps={{
                        variant: 'subtitle1',
                        fontWeight: notification.is_read ? 400 : 600
                    }}
                    secondaryTypographyProps={{
                        variant: 'body2',
                        color: 'text.secondary'
                    }}
                />
                {!notification.is_read && (
                    <Chip label="Nuevo" size="small" color="primary" sx={{ ml: 1 }} />
                )}
            </ListItem>
        </motion.div>
    );
}

