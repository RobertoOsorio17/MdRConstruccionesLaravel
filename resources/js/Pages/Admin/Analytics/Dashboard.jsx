import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    MenuItem,
    TextField,
    Tabs,
    Tab,
    CircularProgress,
    Breadcrumbs
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    People as PeopleIcon,
    Article as ArticleIcon,
    Comment as CommentIcon,
    Work as WorkIcon,
    NavigateNext as NavigateNextIcon,
    Home as HomeIcon,
    Analytics as AnalyticsIcon
} from '@mui/icons-material';
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
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AnalyticsDashboard = () => {
    const [period, setPeriod] = useState('30');
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        users: null,
        content: null,
        services: null,
        projects: null,
        system: null
    });

    useEffect(() => {
        loadAnalytics();
    }, [period]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const [users, content, services, projects, system] = await Promise.all([
                axios.get(`/admin/api/analytics/users?period=${period}`),
                axios.get(`/admin/api/analytics/content?period=${period}`),
                axios.get(`/admin/api/analytics/services?period=${period}`),
                axios.get(`/admin/api/analytics/projects?period=${period}`),
                axios.get(`/admin/api/analytics/system`)
            ]);

            setData({
                users: users.data,
                content: content.data,
                services: services.data,
                projects: projects.data,
                system: system.data
            });
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{ height: '100%' }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography color="text.secondary" gutterBottom variant="body2">
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                            {value}
                        </Typography>
                        {trend && (
                            <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'} sx={{ mt: 1 }}>
                                {trend > 0 ? '+' : ''}{trend}% vs período anterior
                            </Typography>
                        )}
                    </Box>
                    <Box
                        sx={{
                            bgcolor: `${color}.lighter`,
                            p: 1.5,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Icon sx={{ color: `${color}.main`, fontSize: 32 }} />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    const UsersTab = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
                <StatCard
                    title="Total Usuarios"
                    value={data.users?.demographics?.total_users || 0}
                    icon={PeopleIcon}
                    color="primary"
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <StatCard
                    title="Usuarios Verificados"
                    value={data.users?.demographics?.verified_users || 0}
                    icon={PeopleIcon}
                    color="success"
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <StatCard
                    title="Nuevos Registros"
                    value={data.users?.registrations?.length || 0}
                    icon={TrendingUpIcon}
                    color="info"
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <StatCard
                    title="Tasa de Retención"
                    value={`${data.users?.activity?.retention_rate || 0}%`}
                    icon={TrendingUpIcon}
                    color="warning"
                />
            </Grid>

            <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Registros de Usuarios
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data.users?.registrations || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => format(new Date(date), 'dd MMM', { locale: es })}
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={(date) => format(new Date(date), 'dd MMMM yyyy', { locale: es })}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="count"
                                name="Registros"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.6}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Usuarios por Rol
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.users?.demographics?.by_role || []}
                                dataKey="count"
                                nameKey="role"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
                                {(data.users?.demographics?.by_role || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>
        </Grid>
    );

    const ContentTab = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Posts Publicados
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.content?.posts?.published || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => format(new Date(date), 'dd MMM', { locale: es })}
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="count"
                                name="Posts"
                                stroke="#82ca9d"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Engagement de Contenido
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Comentarios por Usuario
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                            {data.users?.engagement?.comments_per_user?.toFixed(2) || 0}
                        </Typography>
                    </Box>
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Favoritos por Usuario
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                            {data.users?.engagement?.favorites_per_user?.toFixed(2) || 0}
                        </Typography>
                    </Box>
                </Paper>
            </Grid>

            <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Vistas de Posts
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.content?.posts?.views_trend || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => format(new Date(date), 'dd MMM', { locale: es })}
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total_views" name="Vistas" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>
        </Grid>
    );

    return (
        <AdminLayout>
            <Head title="Analytics Dashboard" />

            <Box sx={{ p: 3 }}>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <HomeIcon fontSize="small" />
                        <Typography>Dashboard</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AnalyticsIcon fontSize="small" />
                        <Typography color="text.primary">Analytics</Typography>
                    </Box>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">
                        Analytics Dashboard
                    </Typography>
                    <TextField
                        select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        size="small"
                        sx={{ minWidth: 150 }}
                    >
                        <MenuItem value="7">Últimos 7 días</MenuItem>
                        <MenuItem value="30">Últimos 30 días</MenuItem>
                        <MenuItem value="90">Últimos 90 días</MenuItem>
                        <MenuItem value="365">Último año</MenuItem>
                    </TextField>
                </Box>

                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                    <Tab label="Usuarios" />
                    <Tab label="Contenido" />
                </Tabs>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {activeTab === 0 && <UsersTab />}
                        {activeTab === 1 && <ContentTab />}
                    </>
                )}
            </Box>
        </AdminLayout>
    );
};

export default AnalyticsDashboard;

