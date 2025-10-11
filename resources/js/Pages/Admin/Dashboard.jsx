import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    IconButton,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemButton,
    Paper,
    useTheme,
    alpha,
    LinearProgress,
    Divider,
    Button,
    Alert,
    Skeleton,
    Stack
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Article as ArticleIcon,
    Comment as CommentIcon,
    Category as CategoryIcon,
    Tag as TagIcon,
    People as PeopleIcon,
    Construction as ConstructionIcon,
    HomeRepairService as ServiceIcon,
    TrendingUp as TrendingIcon,
    Add as AddIcon,
    Visibility as ViewIcon,
    Schedule as ScheduleIcon,
    CheckCircle as CheckIcon,
    Pending as PendingIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreVert as MoreIcon
} from '@mui/icons-material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import { motion } from 'framer-motion';
import AdminLayout from '@/Layouts/AdminLayout';
import ErrorBoundary from '@/Components/ErrorBoundary';

const Dashboard = ({
    stats = {},
    recentPosts = [],
    recentComments = [],
    popularPosts = [],
    monthlyStats = [],
    categoryStats = [],
    recentActivity = [],
    quickActions = []
}) => {
    const theme = useTheme();

    // Estados para manejo de errores y carga - CORRECCIÓN CRÍTICA
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Validación de datos críticos
    const safeStats = {
        total_posts: stats?.total_posts || 0,
        total_comments: stats?.total_comments || 0,
        total_categories: stats?.total_categories || 0,
        total_users: stats?.total_users || 0,
        pending_comments: stats?.pending_comments || 0,
        draft_posts: stats?.draft_posts || 0,
        ...stats
    };

    // Manejo de errores de datos
    useEffect(() => {
        try {
            // Validar que los datos críticos estén presentes
            if (!stats && !recentPosts && !recentComments) {
                setError('No se pudieron cargar los datos del dashboard');
            }
        } catch (err) {
            setError('Error al procesar los datos del dashboard');
            console.error('Dashboard error:', err);
        }
    }, [stats, recentPosts, recentComments]);

    const statusColors = {
        published: theme.palette.success.main,
        draft: theme.palette.warning.main,
        scheduled: theme.palette.info.main,
        approved: theme.palette.success.main,
        pending: theme.palette.warning.main,
        spam: theme.palette.error.main,
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Componente StatCard mejorado con validaciones - CORRECCIÓN CRÍTICA
    const StatCard = ({ title = 'Sin título', value = 0, icon, color = theme.palette.primary.main, subtitle = '', trend }) => (
        <Card
            component={motion.div}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                            {value}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <Avatar 
                        sx={{ 
                            bgcolor: alpha('white', 0.2), 
                            color: 'white',
                            width: 56,
                            height: 56
                        }}
                    >
                        {icon}
                    </Avatar>
                </Box>
                
                {trend && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrendingIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">
                            {trend}
                        </Typography>
                    </Box>
                )}
            </CardContent>
            
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 100,
                    height: 100,
                    opacity: 0.1,
                    transform: 'translate(20px, 20px)'
                }}
            >
                {React.cloneElement(icon, { sx: { fontSize: 80 } })}
            </Box>
        </Card>
    );

    const QuickActionCard = ({ action }) => (
        <Card
            component={motion.div}
            whileHover={{ y: -2 }}
            sx={{ 
                height: '100%',
                cursor: 'pointer',
                border: `2px solid ${alpha(theme.palette[action.color].main, 0.2)}`,
                '&:hover': {
                    borderColor: theme.palette[action.color].main,
                    boxShadow: `0 8px 24px ${alpha(theme.palette[action.color].main, 0.3)}`
                }
            }}
            onClick={() => window.location.href = action.url}
        >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar 
                    sx={{ 
                        bgcolor: theme.palette[action.color].main,
                        mx: 'auto',
                        mb: 2,
                        width: 56,
                        height: 56
                    }}
                >
                    <AddIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                    {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {action.description}
                </Typography>
                {action.badge > 0 && (
                    <Chip 
                        label={action.badge}
                        color={action.color}
                        size="small"
                        sx={{ mt: 1 }}
                    />
                )}
            </CardContent>
        </Card>
    );

    // Mostrar error si existe - CORRECCIÓN CRÍTICA
    if (error) {
        return (
            <AdminLayout>
                <Head title="Dashboard - Panel Admin" />
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    <Alert severity="error" sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Error en el Dashboard
                        </Typography>
                        <Typography variant="body2">
                            {error}
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => window.location.reload()}
                            sx={{ mt: 2 }}
                        >
                            Recargar Página
                        </Button>
                    </Alert>
                </Container>
            </AdminLayout>
        );
    }

    return (
        <ErrorBoundary>
            <AdminLayout>
                <Head title="Dashboard - Panel Admin" />

                <Container maxWidth="xl" sx={{ py: 4 }}>
                    {/* Header - MEJORADO */}
                    <Box sx={{ mb: 6 }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                            <DashboardIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                            <Box>
                                <Typography variant="h4" fontWeight="bold" gutterBottom>
                                    Panel de Control
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Bienvenido al panel de administración de MDR Construcciones
                                </Typography>
                            </Box>
                        </Stack>

                        {/* Indicador de estado en tiempo real */}
                        <Chip
                            icon={<CheckIcon />}
                            label="Sistema Operativo"
                            color="success"
                            variant="outlined"
                            size="small"
                        />
                    </Box>

                {/* Stats Cards - CORREGIDAS CON VALIDACIÓN */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Posts"
                            value={safeStats?.posts?.total || safeStats.total_posts || 0}
                            icon={<ArticleIcon />}
                            color={theme.palette.primary.main}
                            subtitle={`${safeStats?.posts?.published || 0} publicados, ${safeStats?.posts?.draft || safeStats.draft_posts || 0} borradores`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Comentarios"
                            value={safeStats?.comments?.total || safeStats.total_comments || 0}
                            icon={<CommentIcon />}
                            color={theme.palette.secondary.main}
                            subtitle={`${safeStats?.comments?.pending || safeStats.pending_comments || 0} pendientes`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Categorías"
                            value={safeStats?.categories?.total || safeStats.total_categories || 0}
                            icon={<CategoryIcon />}
                            color={theme.palette.success.main}
                            subtitle={`${safeStats?.categories?.active || safeStats.total_categories || 0} activas`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Tags"
                            value={stats.tags.total}
                            icon={<TagIcon />}
                            color={theme.palette.info.main}
                            subtitle={`${stats.tags.used} en uso`}
                        />
                    </Grid>
                </Grid>

                {/* Quick Actions */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Acciones Rápidas
                    </Typography>
                    <Grid container spacing={3}>
                        {quickActions.map((action, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <QuickActionCard action={action} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                <Grid container spacing={4}>
                    {/* Monthly Stats Chart */}
                    <Grid item xs={12} lg={8}>
                        <Paper sx={{ p: 3, height: '400px' }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Estadísticas Mensuales
                            </Typography>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={monthlyStats}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="posts" fill={theme.palette.primary.main} name="Posts" />
                                    <Bar dataKey="comments" fill={theme.palette.secondary.main} name="Comentarios" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Category Distribution */}
                    <Grid item xs={12} lg={4}>
                        <Paper sx={{ p: 3, height: '400px' }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Distribución por Categorías
                            </Typography>
                            <ResponsiveContainer width="100%" height="90%">
                                <PieChart>
                                    <Pie
                                        data={categoryStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="posts_count"
                                    >
                                        {categoryStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <Box sx={{ mt: 2 }}>
                                {categoryStats.map((category, index) => (
                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box 
                                            sx={{ 
                                                width: 12, 
                                                height: 12, 
                                                bgcolor: category.color, 
                                                mr: 1,
                                                borderRadius: '50%'
                                            }} 
                                        />
                                        <Typography variant="caption">
                                            {category.name} ({category.posts_count})
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Recent Posts */}
                    <Grid item xs={12} lg={6}>
                        <Paper sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Posts Recientes
                                </Typography>
                                <Button 
                                    variant="outlined" 
                                    size="small"
                                    href="/admin/posts"
                                >
                                    Ver Todos
                                </Button>
                            </Box>
                            <List>
                                {recentPosts.map((post, index) => (
                                    <ListItem key={post.id} divider={index < recentPosts.length - 1}>
                                        <ListItemText
                                            primary={post.title}
                                            secondary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                    <Chip 
                                                        label={post.status}
                                                        size="small"
                                                        color={
                                                            post.status === 'published' ? 'success' :
                                                            post.status === 'draft' ? 'warning' : 'info'
                                                        }
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDate(post.created_at)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        • {post.views_count} vistas
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <IconButton 
                                            href={`/admin/posts/${post.id}/edit`}
                                            size="small"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Recent Comments */}
                    <Grid item xs={12} lg={6}>
                        <Paper sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Comentarios Recientes
                                </Typography>
                                <Button 
                                    variant="outlined" 
                                    size="small"
                                    href="/admin/comments"
                                >
                                    Ver Todos
                                </Button>
                            </Box>
                            <List>
                                {recentComments.map((comment, index) => (
                                    <ListItem key={comment.id} divider={index < recentComments.length - 1}>
                                        <ListItemText
                                            primary={comment.content}
                                            secondary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                    <Chip 
                                                        label={comment.status}
                                                        size="small"
                                                        color={
                                                            comment.status === 'approved' ? 'success' :
                                                            comment.status === 'pending' ? 'warning' : 'error'
                                                        }
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {comment.author_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        • {formatDate(comment.created_at)}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <IconButton 
                                            href={`/admin/comments/${comment.id}`}
                                            size="small"
                                        >
                                            <ViewIcon fontSize="small" />
                                        </IconButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Popular Posts */}
                    <Grid item xs={12} lg={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Posts Más Populares (30 días)
                            </Typography>
                            <List>
                                {popularPosts.map((post, index) => (
                                    <ListItem key={post.id} divider={index < popularPosts.length - 1}>
                                        <ListItemIcon>
                                            <Typography variant="h6" color="primary" fontWeight="bold">
                                                #{index + 1}
                                            </Typography>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={post.title}
                                            secondary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <ViewIcon sx={{ fontSize: 16 }} />
                                                    <Typography variant="caption">
                                                        {post.views_count} vistas
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        • {formatDate(post.published_at)}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Recent Activity */}
                    <Grid item xs={12} lg={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Actividad Reciente
                            </Typography>
                            <List>
                                {recentActivity.slice(0, 8).map((activity, index) => (
                                    <ListItem key={index} divider={index < 7}>
                                        <ListItemIcon>
                                            {activity.type === 'post' ? 
                                                <ArticleIcon color="primary" /> : 
                                                <CommentIcon color="secondary" />
                                            }
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2">
                                                    <strong>{activity.user}</strong> {activity.action} {activity.title}
                                                </Typography>
                                            }
                                            secondary={activity.created_at}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </AdminLayout>
        </ErrorBoundary>
    );
};

export default Dashboard;