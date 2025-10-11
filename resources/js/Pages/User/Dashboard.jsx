import React, { useState, useMemo, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    CardActions,
    Avatar,
    Chip,
    IconButton,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    LinearProgress,
    Alert,
    useTheme,
    alpha,
    Stack,
    Tab,
    Tabs,
    Badge,
    Tooltip,
    Fab,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Skeleton,
    Grow,
    Slide,
    CircularProgress,
    Zoom,
    TextField,
    MenuItem,
    Checkbox
} from '@mui/material';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import {
    Dashboard as DashboardIcon,
    Comment as CommentIcon,
    Bookmark as BookmarkIcon,
    People as PeopleIcon,
    Settings as SettingsIcon,
    TrendingUp as TrendingUpIcon,
    Article as ArticleIcon,
    Delete as DeleteIcon,
    RemoveRedEye as ViewIcon,
    Edit as EditIcon,
    AdminPanelSettings as AdminIcon,
    Analytics as AnalyticsIcon,
    Security as SecurityIcon,
    Group as GroupIcon,
    Notifications as NotificationsIcon,
    Speed as PerformanceIcon,
    Build as ToolsIcon,
    Timeline as TimelineIcon,
    Category as CategoryIcon,
    PostAdd as PostAddIcon,
    ManageAccounts as ManageAccountsIcon,
    ReportGmailerrorred as ReportsIcon,
    BarChart as ChartIcon,
    Schedule as ScheduleIcon,
    Favorite as FavoriteIcon,
    Share as ShareIcon,
    MoreVert as MoreVertIcon,
    Add as AddIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';
import { usePage } from '@inertiajs/react';
import { useNotification } from '@/Context/NotificationContext';
import ErrorBoundary from '@/Components/ErrorBoundary';

// Componente mejorado para tarjetas de estadísticas con efectos premium
const EnhancedDashboardCard = ({ title, value, icon, color, subtitle, to, trend, trendValue, admin = false, delay = 0 }) => {
    const theme = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -8, scale: 1.03 }}
            transition={{ duration: 0.6, delay: delay * 0.1 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <Card 
                sx={{ 
                    height: '100%',
                    background: admin 
                        ? `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 50%, ${alpha(color, 0.6)} 100%)`
                        : `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.03)} 50%, ${alpha(color, 0.08)} 100%)`,
                    border: admin ? 'none' : `2px solid ${alpha(color, 0.15)}`,
                    color: admin ? 'white' : 'inherit',
                    cursor: to ? 'pointer' : 'default',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: isHovered 
                        ? `0 20px 40px ${alpha(color, admin ? 0.5 : 0.25)}`
                        : `0 8px 16px ${alpha(color, admin ? 0.3 : 0.12)}`,
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
                onClick={to ? () => router.visit(to) : undefined}
            >
                <CardContent sx={{ pb: admin ? 2 : 3, position: 'relative', zIndex: 2 }}>
                    <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2.5}>
                        <Box sx={{ 
                            bgcolor: admin ? alpha('#fff', 0.25) : alpha(color, 0.12),
                            borderRadius: 3,
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {React.cloneElement(icon, {
                                sx: {
                                    fontSize: '1.8rem',
                                    color: admin ? '#fff' : color
                                }
                            })}
                        </Box>
                        
                        {trend && (
                            <Chip
                                label={`${trendValue > 0 ? '+' : ''}${trendValue}%`}
                                size="small"
                                color={trendValue > 0 ? 'success' : 'error'}
                                sx={{ 
                                    bgcolor: admin ? alpha('#fff', 0.25) : undefined,
                                    color: admin ? '#fff' : undefined,
                                    fontWeight: 700
                                }}
                            />
                        )}
                    </Box>
                    
                    <Typography 
                        variant="h3" 
                        component="div" 
                        fontWeight={800}
                        sx={{ 
                            color: admin ? '#fff' : color,
                            mb: 1,
                            fontSize: { xs: '2rem', md: '2.5rem' }
                        }}
                    >
                        {value}
                    </Typography>
                    
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            opacity: admin ? 0.95 : 0.85,
                            fontWeight: 600,
                            color: admin ? 'inherit' : color,
                            mb: subtitle ? 1 : 0
                        }}
                    >
                        {title}
                    </Typography>
                    
                    {subtitle && (
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                opacity: admin ? 0.8 : 0.7, 
                                fontWeight: 500
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </CardContent>
                
                {admin && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: alpha('#fff', 0.25),
                            borderRadius: '50%',
                            p: 1
                        }}
                    >
                        <AdminIcon sx={{ fontSize: '1.2rem', color: '#fff' }} />
                    </Box>
                )}
            </Card>
        </motion.div>
    );
};

function Dashboard({ stats, recentComments, recentSavedPosts }) {
    const { auth } = usePage().props;
    const theme = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const [currentTab, setCurrentTab] = useState(0);
    const [comments, setComments] = useState([]);
    const [pendingComments, setPendingComments] = useState([]);
    const [commentFilters, setCommentFilters] = useState({
        status: '',
        post_id: '',
        search: '',
        user_type: ''
    });
    const [commentStats, setCommentStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        spam: 0
    });
    const [availablePosts, setAvailablePosts] = useState([]);

    // Calculate isAdmin once
    const userName = auth?.user?.name || 'Usuario';
    const isAuthenticated = auth?.isAuthenticated || false;
    const userRole = auth?.user?.role || 'user';
    const isAdmin = stats?.total_posts !== undefined || userRole === 'admin' || auth?.user?.is_admin || false;

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);
    
    // Cargar datos de comentarios si es admin
    React.useEffect(() => {
        if (isAdmin) {
            loadCommentData();
        }
    }, [isAdmin, commentFilters]);
    
    const loadCommentData = async () => {
        try {
            const response = await fetch('/admin/comment-management?' + new URLSearchParams(commentFilters));
            const data = await response.json();
            setComments(data.comments?.data || []);
            setCommentStats(data.stats || {});
            setAvailablePosts(data.posts || []);
            
            // Cargar comentarios pendientes
            const pendingResponse = await fetch('/admin/comment-management/pending?limit=5');
            const pendingData = await pendingResponse.json();
            setPendingComments(pendingData.comments || []);
        } catch (error) {
            console.error('Error loading comment data:', error);
        }
    };
    
    const handleCommentStatusChange = async (commentId, newStatus) => {
        try {
            const response = await fetch(`/admin/comments/${commentId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (response.ok) {
                loadCommentData(); // Reload data
            }
        } catch (error) {
            console.error('Error updating comment status:', error);
        }
    };
    
    const handleBulkApprove = async (commentIds) => {
        try {
            const response = await fetch('/admin/comment-management/bulk-approve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ comment_ids: commentIds })
            });
            
            if (response.ok) {
                loadCommentData();
            }
        } catch (error) {
            console.error('Error bulk approving comments:', error);
        }
    };

    if (!isAuthenticated) {
        return (
            <MainLayout>
                <Head title="Mi Dashboard" />
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    <Alert severity="error" sx={{ mb: 4 }}>
                        Error de autenticación. Por favor, inicia sesión nuevamente.
                    </Alert>
                </Container>
            </MainLayout>
        );
    }

    const headerTitle = isAdmin ? 'Panel de Administrador' : 'Mi Dashboard';
    const headerIcon = isAdmin ? <AdminIcon sx={{ mr: 2, color: 'error.main' }} /> : <DashboardIcon sx={{ mr: 2, color: 'primary.main' }} />;

    return (
        <ErrorBoundary>
            <MainLayout>
                <Head title={headerTitle} />
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    {isLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                            <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main' }} />
                            <Typography variant="h6" sx={{ ml: 3, color: 'text.secondary' }}>
                                Cargando tu dashboard...
                            </Typography>
                        </Box>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Sección de bienvenida */}
                            <Paper 
                                sx={{ 
                                    p: 4, 
                                    mb: 4, 
                                    background: `linear-gradient(135deg, 
                                        ${alpha(theme.palette.primary.main, 0.08)} 0%, 
                                        ${alpha(theme.palette.secondary.main, 0.04)} 50%,
                                        ${alpha(theme.palette.primary.main, 0.08)} 100%
                                    )`,
                                    borderRadius: 4
                                }}
                            >
                                <Typography 
                                    variant="h3" 
                                    fontWeight={800} 
                                    gutterBottom 
                                    sx={{ 
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        mb: 2
                                    }}
                                >
                                    ¡Hola, {userName}! 👋
                                </Typography>
                                
                                <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                                    Bienvenido a tu {isAdmin ? 'panel de administrador' : 'dashboard personal'}
                                </Typography>
                            </Paper>

                            {/* Estadísticas */}
                            <Box mb={4}>
                                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                                    {isAdmin ? '📊 Estadísticas del Sistema' : '📈 Tu Actividad'}
                                </Typography>
                                
                                <Grid container spacing={3}>
                                    {isAdmin ? (
                                        <>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <EnhancedDashboardCard
                                                    title="Total Posts"
                                                    value={stats?.total_posts || 0}
                                                    icon={<ArticleIcon />}
                                                    color={theme.palette.error.main}
                                                    subtitle="Publicaciones del sitio"
                                                    to="/admin/posts"
                                                    trend={true}
                                                    trendValue={15}
                                                    admin={true}
                                                    delay={0}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <EnhancedDashboardCard
                                                    title="Total Usuarios"
                                                    value={stats?.total_users || 0}
                                                    icon={<GroupIcon />}
                                                    color={theme.palette.warning.main}
                                                    subtitle="Usuarios registrados"
                                                    to="/admin/users"
                                                    trend={true}
                                                    trendValue={8}
                                                    admin={true}
                                                    delay={1}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <EnhancedDashboardCard
                                                    title="Total Comentarios"
                                                    value={stats?.total_comments || 0}
                                                    icon={<CommentIcon />}
                                                    color={theme.palette.info.main}
                                                    subtitle="Comentarios en el sitio"
                                                    to="/admin/comments"
                                                    trend={true}
                                                    trendValue={-3}
                                                    admin={true}
                                                    delay={2}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <EnhancedDashboardCard
                                                    title="Performance"
                                                    value="98%"
                                                    icon={<PerformanceIcon />}
                                                    color={theme.palette.success.main}
                                                    subtitle="Rendimiento del sistema"
                                                    to="/admin/performance"
                                                    trend={true}
                                                    trendValue={2}
                                                    admin={true}
                                                    delay={3}
                                                />
                                            </Grid>
                                        </>
                                    ) : (
                                        <>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <EnhancedDashboardCard
                                                    title="Comentarios"
                                                    value={stats?.comments_count || 0}
                                                    icon={<CommentIcon />}
                                                    color={theme.palette.info.main}
                                                    subtitle="Total realizados"
                                                    to="/my/comments"
                                                    trend={true}
                                                    trendValue={5}
                                                    delay={0}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <EnhancedDashboardCard
                                                    title="Posts Guardados"
                                                    value={stats?.saved_posts_count || 0}
                                                    icon={<BookmarkIcon />}
                                                    color={theme.palette.success.main}
                                                    subtitle="Para leer después"
                                                    to="/my/saved-posts"
                                                    trend={true}
                                                    trendValue={12}
                                                    delay={1}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <EnhancedDashboardCard
                                                    title="Siguiendo"
                                                    value={stats?.following_count || 0}
                                                    icon={<PeopleIcon />}
                                                    color={theme.palette.primary.main}
                                                    subtitle="Autores que sigues"
                                                    to="/my/following"
                                                    trend={true}
                                                    trendValue={-2}
                                                    delay={2}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={3}>
                                                <EnhancedDashboardCard
                                                    title="Seguidores"
                                                    value={stats?.followers_count || 0}
                                                    icon={<GroupIcon />}
                                                    color={theme.palette.secondary.main}
                                                    subtitle="Te siguen"
                                                    trend={true}
                                                    trendValue={8}
                                                    delay={3}
                                                />
                                            </Grid>
                                        </>
                                    )}
                                </Grid>
                            </Box>

                            {/* Tabs del contenido principal */}
                            <Box mb={4}>
                                <Tabs 
                                    value={currentTab} 
                                    onChange={(event, newValue) => setCurrentTab(newValue)}
                                    variant="scrollable" 
                                    scrollButtons="auto"
                                    sx={{
                                        '& .MuiTab-root': {
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            minHeight: 60,
                                            py: 2
                                        },
                                        '& .Mui-selected': {
                                            color: `${theme.palette.primary.main} !important`
                                        }
                                    }}
                                >
                                    <Tab label="📊 Analytics" />
                                    <Tab label="📝 Editor" />
                                    <Tab label="📋 Posts" />
                                    {isAdmin && <Tab label="👥 Usuarios" />}
                                    {isAdmin && <Tab label="💬 Comentarios" />}
                                    <Tab label="📈 Reportes" />
                                </Tabs>
                            </Box>

                            {/* Sección de Analytics con gráficos */}
                            <Grid container spacing={4} mb={4}>
                                <Grid item xs={12} md={8}>
                                    <Paper sx={{ p: 3, height: 400 }}>
                                        <Typography variant="h6" gutterBottom>
                                            📈 Actividad del Sistema (Últimos 30 días)
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={[
                                                { name: '1 Ene', posts: 12, usuarios: 5, comentarios: 23 },
                                                { name: '5 Ene', posts: 19, usuarios: 8, comentarios: 31 },
                                                { name: '10 Ene', posts: 15, usuarios: 12, comentarios: 28 },
                                                { name: '15 Ene', posts: 22, usuarios: 18, comentarios: 45 },
                                                { name: '20 Ene', posts: 28, usuarios: 15, comentarios: 52 },
                                                { name: '25 Ene', posts: 25, usuarios: 22, comentarios: 48 },
                                                { name: '30 Ene', posts: 32, usuarios: 28, comentarios: 65 }
                                            ]}>
                                                <defs>
                                                    <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                                                    </linearGradient>
                                                    <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.1}/>
                                                    </linearGradient>
                                                    <linearGradient id="colorComentarios" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={theme.palette.warning.main} stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor={theme.palette.warning.main} stopOpacity={0.1}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                                                <XAxis 
                                                    dataKey="name" 
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                                                />
                                                <YAxis 
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                                                />
                                                <RechartsTooltip 
                                                    contentStyle={{
                                                        backgroundColor: theme.palette.background.paper,
                                                        border: `1px solid ${theme.palette.divider}`,
                                                        borderRadius: 8,
                                                        boxShadow: theme.shadows[8]
                                                    }}
                                                />
                                                <Legend />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="posts" 
                                                    stroke={theme.palette.primary.main}
                                                    fillOpacity={1}
                                                    fill="url(#colorPosts)"
                                                    name="Posts"
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="usuarios" 
                                                    stroke={theme.palette.success.main}
                                                    fillOpacity={1}
                                                    fill="url(#colorUsuarios)"
                                                    name="Usuarios"
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="comentarios" 
                                                    stroke={theme.palette.warning.main}
                                                    fillOpacity={1}
                                                    fill="url(#colorComentarios)"
                                                    name="Comentarios"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Stack spacing={2}>
                                        <Paper sx={{ p: 3 }}>
                                            <Typography variant="h6" gutterBottom>
                                                🚀 Acciones Populares
                                            </Typography>
                                            <List dense>
                                                <ListItem>
                                                    <ListItemText 
                                                        primary="Crear Posts" 
                                                        secondary="45 esta semana"
                                                    />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText 
                                                        primary="Gestión Usuarios" 
                                                        secondary="23 esta semana"
                                                    />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText 
                                                        primary="Moderación" 
                                                        secondary="15 esta semana"
                                                    />
                                                </ListItem>
                                            </List>
                                        </Paper>
                                        
                                        <Paper sx={{ p: 3 }}>
                                            <Typography variant="h6" gutterBottom>
                                                📊 Estado del Sistema
                                            </Typography>
                                            <Box mb={2}>
                                                <Typography variant="body2" color="text.secondary">
                                                    CPU Usage
                                                </Typography>
                                                <LinearProgress variant="determinate" value={35} sx={{ mt: 1 }} />
                                                <Typography variant="caption">35%</Typography>
                                            </Box>
                                            <Box mb={2}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Memory Usage
                                                </Typography>
                                                <LinearProgress variant="determinate" value={68} color="warning" sx={{ mt: 1 }} />
                                                <Typography variant="caption">68%</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Database Size
                                                </Typography>
                                                <LinearProgress variant="determinate" value={12} color="success" sx={{ mt: 1 }} />
                                                <Typography variant="caption">12%</Typography>
                                            </Box>
                                        </Paper>
                                    </Stack>
                                </Grid>
                            </Grid>

                            {/* Gráficos adicionales */}
                            <Grid container spacing={4} mb={4}>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, height: 350 }}>
                                        <Typography variant="h6" gutterBottom>
                                            🏷️ Distribución por Categorías
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={[
                                                { name: 'Construcción', posts: 12, color: '#1976d2' },
                                                { name: 'Reformas', posts: 8, color: '#388e3c' },
                                                { name: 'Diseño', posts: 5, color: '#f57c00' },
                                                { name: 'Consejos', posts: 7, color: '#7b1fa2' },
                                                { name: 'Proyectos', posts: 4, color: '#00796b' },
                                                { name: 'Noticias', posts: 3, color: '#d32f2f' }
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                                                <XAxis 
                                                    dataKey="name" 
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={80}
                                                />
                                                <YAxis 
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                                                />
                                                <RechartsTooltip 
                                                    contentStyle={{
                                                        backgroundColor: theme.palette.background.paper,
                                                        border: `1px solid ${theme.palette.divider}`,
                                                        borderRadius: 8,
                                                        boxShadow: theme.shadows[8]
                                                    }}
                                                />
                                                <Bar 
                                                    dataKey="posts" 
                                                    radius={[4, 4, 0, 0]}
                                                    fill={theme.palette.primary.main}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, height: 350 }}>
                                        <Typography variant="h6" gutterBottom>
                                            📊 Estado de Contenido
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Publicados', value: 25, color: theme.palette.success.main },
                                                        { name: 'Borradores', value: 12, color: theme.palette.warning.main },
                                                        { name: 'Programados', value: 5, color: theme.palette.info.main },
                                                        { name: 'Archivados', value: 3, color: theme.palette.grey[400] }
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                >
                                                    {[
                                                        { name: 'Publicados', value: 25, color: theme.palette.success.main },
                                                        { name: 'Borradores', value: 12, color: theme.palette.warning.main },
                                                        { name: 'Programados', value: 5, color: theme.palette.info.main },
                                                        { name: 'Archivados', value: 3, color: theme.palette.grey[400] }
                                                    ].map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip 
                                                    contentStyle={{
                                                        backgroundColor: theme.palette.background.paper,
                                                        border: `1px solid ${theme.palette.divider}`,
                                                        borderRadius: 8,
                                                        boxShadow: theme.shadows[8]
                                                    }}
                                                />
                                                <Legend 
                                                    verticalAlign="bottom"
                                                    height={36}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Performance y métricas en tiempo real */}
                            <Grid container spacing={4} mb={4}>
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, height: 300 }}>
                                        <Typography variant="h6" gutterBottom>
                                            ⚡ Performance en Tiempo Real
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={230}>
                                            <LineChart data={[
                                                { time: '00:00', cpu: 25, memoria: 45, respuesta: 120 },
                                                { time: '04:00', cpu: 32, memoria: 52, respuesta: 95 },
                                                { time: '08:00', cpu: 45, memoria: 68, respuesta: 150 },
                                                { time: '12:00', cpu: 55, memoria: 72, respuesta: 180 },
                                                { time: '16:00', cpu: 38, memoria: 58, respuesta: 110 },
                                                { time: '20:00', cpu: 28, memoria: 48, respuesta: 85 },
                                                { time: '24:00', cpu: 22, memoria: 42, respuesta: 75 }
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                                                <XAxis 
                                                    dataKey="time" 
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                                                />
                                                <YAxis 
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                                                />
                                                <RechartsTooltip 
                                                    contentStyle={{
                                                        backgroundColor: theme.palette.background.paper,
                                                        border: `1px solid ${theme.palette.divider}`,
                                                        borderRadius: 8,
                                                        boxShadow: theme.shadows[8]
                                                    }}
                                                />
                                                <Legend />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="cpu" 
                                                    stroke={theme.palette.error.main}
                                                    strokeWidth={2}
                                                    dot={{ fill: theme.palette.error.main, strokeWidth: 2, r: 4 }}
                                                    name="CPU %"
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="memoria" 
                                                    stroke={theme.palette.warning.main}
                                                    strokeWidth={2}
                                                    dot={{ fill: theme.palette.warning.main, strokeWidth: 2, r: 4 }}
                                                    name="Memoria %"
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="respuesta" 
                                                    stroke={theme.palette.info.main}
                                                    strokeWidth={2}
                                                    dot={{ fill: theme.palette.info.main, strokeWidth: 2, r: 4 }}
                                                    name="Respuesta (ms)"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, height: 300 }}>
                                        <Typography variant="h6" gutterBottom>
                                            📋 Actividad de Usuarios
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={230}>
                                            <AreaChart data={[
                                                { dia: 'Lun', sesiones: 45, nuevos: 5 },
                                                { dia: 'Mar', sesiones: 52, nuevos: 8 },
                                                { dia: 'Mié', sesiones: 48, nuevos: 3 },
                                                { dia: 'Jue', sesiones: 67, nuevos: 12 },
                                                { dia: 'Vie', sesiones: 73, nuevos: 15 },
                                                { dia: 'Sáb', sesiones: 38, nuevos: 4 },
                                                { dia: 'Dom', sesiones: 32, nuevos: 2 }
                                            ]}>
                                                <defs>
                                                    <linearGradient id="colorSesiones" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0.1}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                                                <XAxis 
                                                    dataKey="dia" 
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                                                />
                                                <YAxis 
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                                                />
                                                <RechartsTooltip 
                                                    contentStyle={{
                                                        backgroundColor: theme.palette.background.paper,
                                                        border: `1px solid ${theme.palette.divider}`,
                                                        borderRadius: 8,
                                                        boxShadow: theme.shadows[8]
                                                    }}
                                                />
                                                <Legend />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="sesiones" 
                                                    stroke={theme.palette.secondary.main}
                                                    fillOpacity={1}
                                                    fill="url(#colorSesiones)"
                                                    name="Sesiones"
                                                />
                                                <Bar 
                                                    dataKey="nuevos" 
                                                    fill={theme.palette.primary.main}
                                                    name="Nuevos Usuarios"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Grid>
                            </Grid>
                            <Paper sx={{ p: 4, mb: 4 }}>
                                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                                    ✏️ Editor de Contenido Avanzado
                                </Typography>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={8}>
                                        <Box sx={{ 
                                            border: '2px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            p: 3,
                                            minHeight: 400,
                                            bgcolor: 'background.paper'
                                        }}>
                                            <Typography variant="h6" gutterBottom>
                                                📝 Editor Rich Text
                                            </Typography>
                                            
                                            {/* Barra de herramientas del editor */}
                                            <Box sx={{ 
                                                borderBottom: '1px solid',
                                                borderColor: 'divider',
                                                pb: 2,
                                                mb: 3
                                            }}>
                                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                                    <IconButton size="small"><strong>B</strong></IconButton>
                                                    <IconButton size="small"><em>I</em></IconButton>
                                                    <IconButton size="small"><u>U</u></IconButton>
                                                    <Divider orientation="vertical" flexItem />
                                                    <IconButton size="small">H1</IconButton>
                                                    <IconButton size="small">H2</IconButton>
                                                    <IconButton size="small">H3</IconButton>
                                                    <Divider orientation="vertical" flexItem />
                                                    <IconButton size="small">•</IconButton>
                                                    <IconButton size="small">1.</IconButton>
                                                    <IconButton size="small">🔗</IconButton>
                                                    <IconButton size="small">🖼️</IconButton>
                                                </Stack>
                                            </Box>
                                            
                                            {/* Área de texto */}
                                            <Box sx={{ 
                                                minHeight: 250,
                                                p: 2,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                                bgcolor: 'background.default'
                                            }}>
                                                <Typography color="text.secondary">
                                                    Escribe tu contenido aquí... <br/><br/>
                                                    <strong>Editor Rich Text Avanzado:</strong><br/>
                                                    • Formateo de texto completo<br/>
                                                    • Inserción de imágenes y links<br/>
                                                    • Vista previa en tiempo real<br/>
                                                    • Guardado automático<br/>
                                                    • Soporte para Markdown
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={4}>
                                        <Stack spacing={2}>
                                            <Paper sx={{ p: 2 }}>
                                                <Typography variant="h6" gutterBottom>
                                                    📁 Configuración
                                                </Typography>
                                                <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
                                                    Categoría
                                                </Button>
                                                <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
                                                    Tags
                                                </Button>
                                                <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
                                                    Estado
                                                </Button>
                                                <Button fullWidth variant="outlined">
                                                    Programar
                                                </Button>
                                            </Paper>
                                            
                                            <Paper sx={{ p: 2 }}>
                                                <Typography variant="h6" gutterBottom>
                                                    🚀 Acciones
                                                </Typography>
                                                <Button fullWidth variant="contained" color="primary" sx={{ mb: 1 }}>
                                                    Guardar Borrador
                                                </Button>
                                                <Button fullWidth variant="contained" color="success" sx={{ mb: 1 }}>
                                                    Publicar
                                                </Button>
                                                <Button fullWidth variant="outlined" color="info">
                                                    Vista Previa
                                                </Button>
                                            </Paper>
                                            
                                            <Paper sx={{ p: 2 }}>
                                                <Typography variant="h6" gutterBottom>
                                                    📈 Estadísticas
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Palabras: 0<br/>
                                                    Caracteres: 0<br/>
                                                    Tiempo estimado de lectura: 0 min
                                                </Typography>
                                            </Paper>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Gestión de Posts con tabla avanzada */}
                            <Paper sx={{ p: 4, mb: 4 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h5" fontWeight={600}>
                                        📋 Gestión de Posts
                                    </Typography>
                                    <Box>
                                        <Button variant="outlined" sx={{ mr: 1 }}>
                                            🔍 Filtrar
                                        </Button>
                                        <Button variant="contained" color="primary">
                                            ➕ Nuevo Post
                                        </Button>
                                    </Box>
                                </Box>
                                
                                {/* Filtros y búsqueda */}
                                <Grid container spacing={2} mb={3}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Box sx={{ position: 'relative' }}>
                                            <Typography variant="caption" color="text.secondary">Buscar posts</Typography>
                                            <Box sx={{ 
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                                p: 1,
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                <Typography variant="body2" sx={{ mr: 1 }}>🔍</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Buscar títulos, contenido...
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Estado</Typography>
                                            <Box sx={{ 
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                                p: 1
                                            }}>
                                                <Typography variant="body2">Todos los estados</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Categoría</Typography>
                                            <Box sx={{ 
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                                p: 1
                                            }}>
                                                <Typography variant="body2">Todas las categorías</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Autor</Typography>
                                            <Box sx={{ 
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                                p: 1
                                            }}>
                                                <Typography variant="body2">Todos los autores</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Box display="flex" gap={1} pt={2}>
                                            <Button size="small" variant="outlined" fullWidth>
                                                🗑️ Limpiar
                                            </Button>
                                            <Button size="small" variant="contained" fullWidth>
                                                ✅ Aplicar
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                                
                                {/* Tabla de posts */}
                                <Box sx={{ 
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    overflow: 'hidden'
                                }}>
                                    {/* Encabezado de tabla */}
                                    <Box sx={{ 
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        p: 2
                                    }}>
                                        <Grid container alignItems="center">
                                            <Grid size={1}>
                                                <Typography variant="caption" fontWeight={600}>
                                                    #
                                                </Typography>
                                            </Grid>
                                            <Grid size={4}>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    Título y Estado
                                                </Typography>
                                            </Grid>
                                            <Grid size={2}>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    Categoría
                                                </Typography>
                                            </Grid>
                                            <Grid size={2}>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    Autor
                                                </Typography>
                                            </Grid>
                                            <Grid size={1}>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    Vistas
                                                </Typography>
                                            </Grid>
                                            <Grid size={1}>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    Fecha
                                                </Typography>
                                            </Grid>
                                            <Grid size={1}>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    Acciones
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                    
                                    {/* Filas de ejemplo */}
                                    {[
                                        {
                                            id: 1,
                                            title: "Guía Completa de Reformas Integrales",
                                            status: "published",
                                            category: "Construcción",
                                            author: "Admin UVH",
                                            views: 1247,
                                            date: "15/01/25",
                                            featured: true
                                        },
                                        {
                                            id: 2,
                                            title: "Tendencias en Diseño de Baños 2025",
                                            status: "draft",
                                            category: "Diseño",
                                            author: "Admin UVH",
                                            views: 0,
                                            date: "14/01/25",
                                            featured: false
                                        },
                                        {
                                            id: 3,
                                            title: "Optimizar Espacios en Cocinas Pequeñas",
                                            status: "scheduled",
                                            category: "Cocinas",
                                            author: "Admin UVH",
                                            views: 892,
                                            date: "20/01/25",
                                            featured: true
                                        }
                                    ].map((post, index) => (
                                        <Box key={post.id} sx={{ 
                                            p: 2,
                                            borderBottom: index < 2 ? '1px solid' : 'none',
                                            borderColor: 'divider',
                                            '&:hover': {
                                                bgcolor: 'action.hover'
                                            }
                                        }}>
                                            <Grid container alignItems="center">
                                                <Grid size={1}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        #{post.id}
                                                    </Typography>
                                                </Grid>
                                                <Grid size={4}>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {post.title}
                                                        </Typography>
                                                        <Box display="flex" gap={1} mt={0.5}>
                                                            <Chip 
                                                                label={post.status === 'published' ? '✅ Publicado' : 
                                                                       post.status === 'draft' ? '📝 Borrador' : '🕰️ Programado'}
                                                                color={post.status === 'published' ? 'success' : 
                                                                       post.status === 'draft' ? 'default' : 'info'}
                                                                size="small"
                                                            />
                                                            {post.featured && (
                                                                <Chip 
                                                                    label="⭐ Destacado" 
                                                                    size="small" 
                                                                    color="warning"
                                                                />
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                                <Grid size={2}>
                                                    <Chip 
                                                        label={post.category}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid size={2}>
                                                    <Typography variant="body2">
                                                        {post.author}
                                                    </Typography>
                                                </Grid>
                                                <Grid size={1}>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {post.views.toLocaleString()}
                                                    </Typography>
                                                </Grid>
                                                <Grid size={1}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {post.date}
                                                    </Typography>
                                                </Grid>
                                                <Grid size={1}>
                                                    <Box display="flex" gap={0.5}>
                                                        <Tooltip title="Editar">
                                                            <IconButton size="small" color="primary">
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Ver">
                                                            <IconButton size="small" color="info">
                                                                <ViewIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Eliminar">
                                                            <IconButton size="small" color="error">
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    ))}
                                </Box>
                                
                                {/* Paginación */}
                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                                    <Typography variant="body2" color="text.secondary">
                                        📊 Mostrando 3 de 7 posts • Total: 1,247 vistas
                                    </Typography>
                                    <Box display="flex" gap={1}>
                                        <IconButton size="small" disabled>
                                            ◀
                                        </IconButton>
                                        <Button size="small" variant="contained">1</Button>
                                        <Button size="small" variant="outlined">2</Button>
                                        <Button size="small" variant="outlined">3</Button>
                                        <IconButton size="small">
                                            ▶
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Paper>

                            {/* Gestión de Categorías */}
                            <Paper sx={{ p: 4, mb: 4 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h5" fontWeight={600}>
                                        🏷️ Gestión de Categorías
                                    </Typography>
                                    <Button variant="contained" color="secondary">
                                        ➕ Nueva Categoría
                                    </Button>
                                </Box>
                                
                                <Grid container spacing={3}>
                                    {[
                                        { name: "Construcción", posts: 12, color: "#1976d2", active: true, description: "Artículos sobre construcción" },
                                        { name: "Reformas", posts: 8, color: "#388e3c", active: true, description: "Reformas integrales y parciales" },
                                        { name: "Diseño", posts: 5, color: "#f57c00", active: true, description: "Diseño de interiores" },
                                        { name: "Noticias", posts: 3, color: "#d32f2f", active: false, description: "Noticias del sector" },
                                        { name: "Consejos", posts: 7, color: "#7b1fa2", active: true, description: "Consejos y tips" },
                                        { name: "Proyectos", posts: 4, color: "#00796b", active: true, description: "Proyectos destacados" }
                                    ].map((category, index) => (
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            <Card sx={{ 
                                                height: '100%',
                                                border: '2px solid',
                                                borderColor: category.active ? category.color : 'grey.300',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 4
                                                }
                                            }}>
                                                <CardContent>
                                                    <Box display="flex" alignItems="center" mb={2}>
                                                        <Box 
                                                            sx={{ 
                                                                width: 16, 
                                                                height: 16, 
                                                                borderRadius: '50%', 
                                                                bgcolor: category.color,
                                                                mr: 1 
                                                            }} 
                                                        />
                                                        <Typography variant="h6" fontWeight={600}>
                                                            {category.name}
                                                        </Typography>
                                                        <Chip 
                                                            label={category.active ? '✅ Activa' : '❌ Inactiva'}
                                                            color={category.active ? 'success' : 'default'}
                                                            size="small"
                                                            sx={{ ml: 'auto' }}
                                                        />
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" mb={1}>
                                                        {category.description}
                                                    </Typography>
                                                    <Box display="flex" alignItems="center" mb={2}>
                                                        <Typography variant="h4" fontWeight={700} color={category.color}>
                                                            {category.posts}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" ml={1}>
                                                            posts publicados
                                                        </Typography>
                                                    </Box>
                                                    <Box display="flex" gap={1}>
                                                        <Button size="small" variant="outlined" fullWidth startIcon={<EditIcon />}>
                                                            Editar
                                                        </Button>
                                                        <Button 
                                                            size="small" 
                                                            variant="outlined" 
                                                            color={category.active ? 'warning' : 'success'}
                                                            fullWidth
                                                        >
                                                            {category.active ? '⏸️ Pausar' : '▶️ Activar'}
                                                        </Button>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        </motion.div>
                    )}
                    
                    {/* Floating Action Button solo para admins */}
                    {isAdmin && (
                        <SpeedDial
                            ariaLabel="Acciones de Admin"
                            sx={{ position: 'fixed', bottom: 24, right: 24 }}
                            icon={<SpeedDialIcon />}
                            FabProps={{
                                sx: {
                                    bgcolor: 'error.main',
                                    '&:hover': {
                                        bgcolor: 'error.dark',
                                    }
                                }
                            }}
                        >
                            <SpeedDialAction
                                icon={<PostAddIcon />}
                                tooltipTitle="Crear Post"
                                onClick={() => router.visit('/admin/posts/create')}
                            />
                            <SpeedDialAction
                                icon={<ManageAccountsIcon />}
                                tooltipTitle="Gestionar Usuarios"
                                onClick={() => router.visit('/admin/users')}
                            />
                            <SpeedDialAction
                                icon={<AnalyticsIcon />}
                                tooltipTitle="Ver Analytics"
                                onClick={() => router.visit('/admin/analytics')}
                            />
                            <SpeedDialAction
                                icon={<SettingsIcon />}
                                tooltipTitle="Configuración"
                                onClick={() => router.visit('/admin/settings')}
                            />
                        </SpeedDial>
                    )}
                </Container>
            </MainLayout>
        </ErrorBoundary>
    );
}

export default Dashboard;