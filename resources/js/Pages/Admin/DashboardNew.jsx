import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    IconButton,
    Avatar,
    Chip,
    LinearProgress,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Divider,
    Button,
    useTheme,
    alpha,
    Tooltip,
    CircularProgress
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    People as PeopleIcon,
    Article as ArticleIcon,
    Build as BuildIcon,
    Work as WorkIcon,
    Comment as CommentIcon,
    Visibility as VisibilityIcon,
    Security as SecurityIcon,
    Notifications as NotificationsIcon,
    Speed as SpeedIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    MoreVert as MoreVertIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';

// Glassmorphism card styles
const glassmorphismCard = {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        background: 'rgba(255, 255, 255, 0.3)',
    }
};

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5
        }
    }
};

const StatCard = ({ title, value, change, changeType, icon, color, subtitle }) => {
    const theme = useTheme();
    
    return (
        <motion.div variants={itemVariants}>
            <Card sx={glassmorphismCard}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ 
                            p: 1.5, 
                            borderRadius: '12px', 
                            background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                            border: `1px solid ${color}30`
                        }}>
                            {React.cloneElement(icon, { sx: { color: color, fontSize: 28 } })}
                        </Box>
                        <IconButton size="small" sx={{ color: 'rgba(0,0,0,0.5)' }}>
                            <MoreVertIcon />
                        </IconButton>
                    </Box>
                    
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2D3748', mb: 1 }}>
                        {value.toLocaleString()}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: '#718096', mb: 2 }}>
                        {title}
                    </Typography>
                    
                    {subtitle && (
                        <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block', mb: 1 }}>
                            {subtitle}
                        </Typography>
                    )}
                    
                    {change !== undefined && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {changeType === 'increase' ? (
                                <ArrowUpwardIcon sx={{ color: '#48BB78', fontSize: 16 }} />
                            ) : (
                                <ArrowDownwardIcon sx={{ color: '#F56565', fontSize: 16 }} />
                            )}
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: changeType === 'increase' ? '#48BB78' : '#F56565',
                                    fontWeight: 600
                                }}
                            >
                                {Math.abs(change)}% vs mes anterior
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

const QuickActionCard = ({ title, description, icon, color, onClick, badge }) => {
    return (
        <motion.div variants={itemVariants}>
            <Card 
                sx={{
                    ...glassmorphismCard,
                    cursor: 'pointer',
                    height: '100%'
                }}
                onClick={onClick}
            >
                <CardContent sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                        <Box sx={{ 
                            p: 2, 
                            borderRadius: '16px', 
                            background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                            border: `1px solid ${color}30`,
                            display: 'inline-block'
                        }}>
                            {React.cloneElement(icon, { sx: { color: color, fontSize: 32 } })}
                        </Box>
                        {badge && (
                            <Chip 
                                label={badge} 
                                size="small" 
                                color="error"
                                sx={{ 
                                    position: 'absolute', 
                                    top: -8, 
                                    right: -8,
                                    minWidth: 24,
                                    height: 24
                                }}
                            />
                        )}
                    </Box>
                    
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748', mb: 1 }}>
                        {title}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ color: '#718096' }}>
                        {description}
                    </Typography>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const ActivityItem = ({ user, action, time, severity }) => {
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return '#F56565';
            case 'high': return '#ED8936';
            case 'medium': return '#4299E1';
            case 'low': return '#48BB78';
            default: return '#718096';
        }
    };

    return (
        <ListItem sx={{ px: 0 }}>
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: getSeverityColor(severity), width: 32, height: 32 }}>
                    <SecurityIcon sx={{ fontSize: 16 }} />
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#2D3748' }}>
                        {user}
                    </Typography>
                }
                secondary={
                    <Box>
                        <Typography variant="caption" sx={{ color: '#718096' }}>
                            {action}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block' }}>
                            {time}
                        </Typography>
                    </Box>
                }
            />
            <Chip 
                label={severity} 
                size="small" 
                sx={{ 
                    bgcolor: alpha(getSeverityColor(severity), 0.1),
                    color: getSeverityColor(severity),
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.7rem'
                }}
            />
        </ListItem>
    );
};

const DashboardNew = ({ 
    stats = {}, 
    recentPosts = [], 
    recentComments = [], 
    popularPosts = [], 
    monthlyStats = [], 
    categoryStats = [], 
    recentActivity = [], 
    quickActions = [],
    notifications = [],
    auditLogs = [],
    widgets = []
}) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);

    const handleRefresh = () => {
        setLoading(true);
        // Simulate refresh
        setTimeout(() => setLoading(false), 1000);
    };

    // Calculate percentage changes (mock data for demo)
    const getChangePercentage = (current, previous) => {
        if (!previous) return 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    return (
        <AdminLayoutNew title="Dashboard">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2D3748', mb: 1 }}>
                            Dashboard
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#718096' }}>
                            Bienvenido al panel de administración
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
                        onClick={handleRefresh}
                        disabled={loading}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                            }
                        }}
                    >
                        Actualizar
                    </Button>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="Total Usuarios"
                            value={stats.users?.total || 0}
                            change={12}
                            changeType="increase"
                            icon={<PeopleIcon />}
                            color="#4299E1"
                            subtitle={`${stats.users?.active || 0} activos`}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="Posts Publicados"
                            value={stats.posts?.published || 0}
                            change={8}
                            changeType="increase"
                            icon={<ArticleIcon />}
                            color="#48BB78"
                            subtitle={`${stats.posts?.draft || 0} borradores`}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="Servicios Activos"
                            value={stats.services?.active || 0}
                            change={5}
                            changeType="increase"
                            icon={<BuildIcon />}
                            color="#ED8936"
                            subtitle={`${stats.services?.favorites || 0} favoritos`}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatCard
                            title="Proyectos"
                            value={stats.projects?.total || 0}
                            change={-2}
                            changeType="decrease"
                            icon={<WorkIcon />}
                            color="#9F7AEA"
                            subtitle={`${stats.projects?.completed || 0} completados`}
                        />
                    </Grid>
                </Grid>

                {/* Quick Actions */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2D3748', mb: 3 }}>
                            Acciones Rápidas
                        </Typography>
                    </Grid>
                    {quickActions.slice(0, 4).map((action, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                            <QuickActionCard
                                title={action.title}
                                description={action.description}
                                icon={<ArticleIcon />}
                                color="#4299E1"
                                onClick={() => window.location.href = action.url}
                                badge={action.badge}
                            />
                        </Grid>
                    ))}
                </Grid>

                {/* Main Content Grid */}
                <Grid container spacing={3}>
                    {/* Recent Activity */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <motion.div variants={itemVariants}>
                            <Card sx={glassmorphismCard}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 3 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                                            Actividad Reciente
                                        </Typography>
                                        <Tooltip title="Logs de auditoría">
                                            <IconButton size="small">
                                                <SecurityIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>

                                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                                        {auditLogs.slice(0, 5).map((log, index) => (
                                            <React.Fragment key={log.id}>
                                                <ActivityItem
                                                    user={log.user}
                                                    action={log.description}
                                                    time={log.created_at}
                                                    severity={log.severity}
                                                />
                                                {index < auditLogs.length - 1 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                        {auditLogs.length === 0 && (
                                            <ListItem>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body2" sx={{ color: '#718096', textAlign: 'center' }}>
                                                            No hay actividad reciente
                                                        </Typography>
                                                    }
                                                />
                                            </ListItem>
                                        )}
                                    </List>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    {/* Recent Posts */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <motion.div variants={itemVariants}>
                            <Card sx={glassmorphismCard}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'between', mb: 3 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
                                            Posts Recientes
                                        </Typography>
                                        <Tooltip title="Ver todos los posts">
                                            <IconButton size="small">
                                                <ArticleIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>

                                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                                        {recentPosts.slice(0, 5).map((post, index) => (
                                            <React.Fragment key={post.id}>
                                                <ListItem sx={{ px: 0 }}>
                                                    <ListItemAvatar>
                                                        <Avatar sx={{ bgcolor: '#4299E1', width: 32, height: 32 }}>
                                                            <ArticleIcon sx={{ fontSize: 16 }} />
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#2D3748' }}>
                                                                {post.title}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <Box>
                                                                <Typography variant="caption" sx={{ color: '#718096' }}>
                                                                    Por {post.author?.name || 'Autor desconocido'}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: '#A0AEC0', display: 'block' }}>
                                                                    {post.created_at}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                    />
                                                    <Chip
                                                        label={post.status}
                                                        size="small"
                                                        color={post.status === 'published' ? 'success' : 'default'}
                                                        sx={{ textTransform: 'capitalize' }}
                                                    />
                                                </ListItem>
                                                {index < recentPosts.length - 1 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                        {recentPosts.length === 0 && (
                                            <ListItem>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body2" sx={{ color: '#718096', textAlign: 'center' }}>
                                                            No hay posts recientes
                                                        </Typography>
                                                    }
                                                />
                                            </ListItem>
                                        )}
                                    </List>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                </Grid>
            </motion.div>
        </AdminLayoutNew>
    );
};

export default DashboardNew;
