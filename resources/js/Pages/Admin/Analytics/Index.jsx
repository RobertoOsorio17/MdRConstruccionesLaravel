import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Avatar,
    Chip,
    Button,
    ButtonGroup,
    Paper,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    useTheme,
    alpha
} from '@mui/material';
import {
    Analytics as AnalyticsIcon,
    TrendingUp,
    People,
    Article,
    Build,
    Assignment,
    Computer,
    Refresh,
    Download,
    DateRange
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LazySectionWrapper, LazyDataWrapper } from '@/Components/Admin/LazyWrapper';
import { DashboardStatsSkeleton, ChartSkeleton, TableSkeleton } from '@/Components/Admin/SkeletonLoaders';
import cacheManager, { useCachedData } from '@/Utils/CacheManager';
import { usePerformanceMonitor } from '@/Hooks/useLazyLoading';

const AnalyticsIndex = ({ title, description }) => {
    const theme = useTheme();
    const [selectedTab, setSelectedTab] = useState(0);
    const [timeRange, setTimeRange] = useState('30');
    const [loading, setLoading] = useState(false);
    const [analyticsData, setAnalyticsData] = useState({
        users: null,
        content: null,
        services: null,
        projects: null,
        system: null
    });

    // Performance monitoring
    const { startMeasure, endMeasure, duration } = usePerformanceMonitor('analytics-page');

    const timeRanges = [
        { value: '7', label: '7 días' },
        { value: '30', label: '30 días' },
        { value: '90', label: '90 días' },
        { value: '365', label: '1 año' }
    ];

    const tabs = [
        { label: 'Usuarios', icon: <People />, key: 'users' },
        { label: 'Contenido', icon: <Article />, key: 'content' },
        { label: 'Servicios', icon: <Build />, key: 'services' },
        { label: 'Proyectos', icon: <Assignment />, key: 'projects' },
        { label: 'Sistema', icon: <Computer />, key: 'system' }
    ];

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

    useEffect(() => {
        loadAnalyticsData();
    }, [timeRange]);

    const loadAnalyticsData = async () => {
        setLoading(true);
        startMeasure();

        try {
            // Use cache manager for optimized data loading
            const cacheOptions = {
                ttl: 2 * 60 * 1000, // 2 minutes cache
                params: { timeRange }
            };

            const [users, content, services, projects, system] = await Promise.all([
                cacheManager.cachedFetch(`/admin/analytics/users?period=${timeRange}`, {
                    cacheKey: 'analytics-users',
                    ...cacheOptions
                }),
                cacheManager.cachedFetch(`/admin/analytics/content?period=${timeRange}`, {
                    cacheKey: 'analytics-content',
                    ...cacheOptions
                }),
                cacheManager.cachedFetch(`/admin/analytics/services?period=${timeRange}`, {
                    cacheKey: 'analytics-services',
                    ...cacheOptions
                }),
                cacheManager.cachedFetch(`/admin/analytics/projects?period=${timeRange}`, {
                    cacheKey: 'analytics-projects',
                    ...cacheOptions
                }),
                cacheManager.cachedFetch('/admin/analytics/system', {
                    cacheKey: 'analytics-system',
                    ttl: 5 * 60 * 1000 // 5 minutes for system data
                })
            ]);

            setAnalyticsData({
                users,
                content,
                services,
                projects,
                system
            });
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
            endMeasure();
        }
    };

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const handleTimeRangeChange = (range) => {
        setTimeRange(range);
    };

    const renderOverviewCards = () => {
        const overviewData = [
            {
                title: 'Usuarios Totales',
                value: analyticsData.users?.demographics?.total_users || 0,
                change: '+12%',
                icon: <People />,
                color: theme.palette.primary.main
            },
            {
                title: 'Posts Publicados',
                value: analyticsData.content?.posts?.total || 0,
                change: '+8%',
                icon: <Article />,
                color: theme.palette.success.main
            },
            {
                title: 'Servicios Activos',
                value: analyticsData.services?.performance?.total_services || 0,
                change: '+5%',
                icon: <Build />,
                color: theme.palette.warning.main
            },
            {
                title: 'Proyectos',
                value: analyticsData.projects?.timeline_analysis?.total_projects || 0,
                change: '+2%',
                icon: <Assignment />,
                color: theme.palette.info.main
            }
        ];

        return (
            <LazySectionWrapper
                skeletonType="dashboard"
                skeletonProps={{ items: 4 }}
                threshold={0.1}
                rootMargin="100px"
            >
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {overviewData.map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card
                            sx={{
                                background: `linear-gradient(135deg, ${alpha(item.color, 0.1)} 0%, ${alpha(item.color, 0.05)} 100%)`,
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${alpha(item.color, 0.2)}`,
                                borderRadius: 3,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 8px 32px ${alpha(item.color, 0.3)}`
                                }
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: item.color }}>
                                            {item.value}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.title}
                                        </Typography>
                                        <Chip
                                            label={item.change}
                                            size="small"
                                            sx={{
                                                mt: 1,
                                                backgroundColor: alpha(theme.palette.success.main, 0.1),
                                                color: theme.palette.success.main
                                            }}
                                        />
                                    </Box>
                                    <Avatar
                                        sx={{
                                            backgroundColor: alpha(item.color, 0.1),
                                            color: item.color,
                                            width: 56,
                                            height: 56
                                        }}
                                    >
                                        {item.icon}
                                    </Avatar>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    ))}
                </Grid>
            </LazySectionWrapper>
        );
    };

    const renderUserAnalytics = () => {
        if (!analyticsData.users) return <ChartSkeleton height={400} />;

        return (
            <LazySectionWrapper
                skeletonType="chart"
                skeletonProps={{ height: 400 }}
                threshold={0.1}
                rootMargin="50px"
            >
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Card sx={{ borderRadius: 3, backdropFilter: 'blur(20px)' }}>
                            <CardHeader title="Registros de Usuarios" />
                            <CardContent>
                                <Suspense fallback={<ChartSkeleton height={300} />}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={analyticsData.users.registrations}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="count" stroke={theme.palette.primary.main} fill={alpha(theme.palette.primary.main, 0.3)} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Suspense>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ borderRadius: 3, backdropFilter: 'blur(20px)' }}>
                            <CardHeader title="Demografía de Usuarios" />
                            <CardContent>
                                <Suspense fallback={<ChartSkeleton height={300} />}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={analyticsData.users.demographics.by_role}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="count"
                                                label
                                            >
                                                {analyticsData.users.demographics.by_role?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Suspense>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </LazySectionWrapper>
        );
    };

    const renderContentAnalytics = () => {
        if (!analyticsData.content) return <CircularProgress />;

        return (
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, backdropFilter: 'blur(20px)' }}>
                        <CardHeader title="Actividad de Contenido" />
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={analyticsData.content.posts?.daily_posts || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke={theme.palette.primary.main} strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    const renderSystemAnalytics = () => {
        if (!analyticsData.system) return <CircularProgress />;

        return (
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, backdropFilter: 'blur(20px)' }}>
                        <CardHeader title="Rendimiento del Sistema" />
                        <CardContent>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2">Tiempo de Respuesta</Typography>
                                <Typography variant="h6">{analyticsData.system.performance?.response_time}</Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2">Uptime</Typography>
                                <Typography variant="h6">{analyticsData.system.performance?.uptime}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2">Throughput</Typography>
                                <Typography variant="h6">{analyticsData.system.performance?.throughput}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, backdropFilter: 'blur(20px)' }}>
                        <CardHeader title="Estado del Sistema" />
                        <CardContent>
                            <Alert severity="success" sx={{ mb: 2 }}>
                                Sistema funcionando correctamente
                            </Alert>
                            <Typography variant="body2">
                                Servicios activos: {analyticsData.system.health?.services_up || 0}
                            </Typography>
                            <Typography variant="body2">
                                Servicios inactivos: {analyticsData.system.health?.services_down || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        );
    };

    const renderTabContent = () => {
        switch (selectedTab) {
            case 0:
                return renderUserAnalytics();
            case 1:
                return renderContentAnalytics();
            case 2:
                return <Typography>Análisis de servicios en desarrollo...</Typography>;
            case 3:
                return <Typography>Análisis de proyectos en desarrollo...</Typography>;
            case 4:
                return renderSystemAnalytics();
            default:
                return null;
        }
    };

    return (
        <AdminLayout>
            <Head title={title} />
            
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {description}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <ButtonGroup variant="outlined">
                            {timeRanges.map((range) => (
                                <Button
                                    key={range.value}
                                    variant={timeRange === range.value ? 'contained' : 'outlined'}
                                    onClick={() => handleTimeRangeChange(range.value)}
                                >
                                    {range.label}
                                </Button>
                            ))}
                        </ButtonGroup>
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={loadAnalyticsData}
                            disabled={loading}
                        >
                            Actualizar
                        </Button>
                    </Box>
                </Box>

                {/* Overview Cards */}
                {renderOverviewCards()}

                {/* Analytics Tabs */}
                <Paper sx={{ borderRadius: 3, backdropFilter: 'blur(20px)' }}>
                    <Tabs
                        value={selectedTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        {tabs.map((tab, index) => (
                            <Tab
                                key={index}
                                icon={tab.icon}
                                label={tab.label}
                                iconPosition="start"
                            />
                        ))}
                    </Tabs>
                    
                    <Box sx={{ p: 3 }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            renderTabContent()
                        )}
                    </Box>
                </Paper>
            </Box>
        </AdminLayout>
    );
};

export default AnalyticsIndex;
