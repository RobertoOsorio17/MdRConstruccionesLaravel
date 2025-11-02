import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    Stack,
    Card,
    CardContent,
    Grid,
    alpha,
    Pagination,
    useTheme,
    LinearProgress,
    Badge,
    Fade,
    Grow,
    Zoom,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    TrendingUp as TrendingUpIcon,
    HourglassEmpty as PendingIcon,
    CheckCircle as ApprovedIcon,
    Cancel as RejectedIcon,
    Gavel as GavelIcon,
    Info as InfoIcon,
    Speed as SpeedIcon,
    Timeline as TimelineIcon,
} from '@mui/icons-material';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';
import { motion } from 'framer-motion';

export default function Index({ appeals, filters, statistics, allowedStatuses }) {
    const theme = useTheme();
    const [currentTab, setCurrentTab] = useState(filters.status || 'pending');

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        router.get(route('admin.ban-appeals.index'), { status: newValue }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (event, page) => {
        router.get(route('admin.ban-appeals.index'), {
            status: currentTab,
            page: page,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'warning',
            approved: 'success',
            rejected: 'error',
            more_info_requested: 'info',
        };
        return colors[status] || 'default';
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Pendiente',
            approved: 'Aprobada',
            rejected: 'Rechazada',
            more_info_requested: 'Info Requerida',
        };
        return labels[status] || status;
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <PendingIcon />,
            approved: <ApprovedIcon />,
            rejected: <RejectedIcon />,
            more_info_requested: <InfoIcon />,
        };
        return icons[status] || <InfoIcon />;
    };

    // Calculate statistics percentages
    const totalAppeals = statistics.total || 1;
    const pendingPercentage = ((statistics.pending || 0) / totalAppeals) * 100;
    const approvedPercentage = ((statistics.approved || 0) / totalAppeals) * 100;
    const rejectedPercentage = ((statistics.rejected || 0) / totalAppeals) * 100;

    return (
        <AdminLayoutNew>
            <Head title="Gestión de Apelaciones de Baneos" />

            <Box sx={{ p: 3 }}>
                {/* Header with Animation */}
                <Fade in timeout={800}>
                    <Box sx={{ mb: 4 }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                            <motion.div
                                initial={{ rotate: -10, scale: 0.8 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ duration: 0.5, type: "spring" }}
                            >
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.dark, 0.1)} 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <GavelIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                                </Box>
                            </motion.div>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h3" fontWeight="800" sx={{
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 0.5,
                                }}>
                                    Apelaciones de Baneo
                                </Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography variant="body1" color="text.secondary">
                                        Revisa y gestiona las apelaciones de baneos de usuarios
                                    </Typography>
                                    <Chip
                                        icon={<SpeedIcon />}
                                        label={`${statistics.total || 0} Total`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>
                </Fade>

                {/* Statistics Cards with Enhanced Design */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Grow in timeout={600}>
                            <Card
                                component={motion.div}
                                whileHover={{ scale: 1.03, y: -6 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                sx={{
                                    background: theme.palette.mode === 'dark'
                                        ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`
                                        : `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                                    borderRadius: 3,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Stack spacing={2}>
                                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                                            <Box>
                                                <Typography variant="h2" fontWeight="800" color="warning.main" sx={{ mb: 0.5 }}>
                                                    {statistics.pending_count}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                                    Pendientes
                                                </Typography>
                                            </Box>
                                            <Box
                                                component={motion.div}
                                                whileHover={{ rotate: 360 }}
                                                transition={{ duration: 0.6 }}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2.5,
                                                    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.2)} 0%, ${alpha(theme.palette.warning.dark, 0.1)} 100%)`,
                                                    boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.3)}`,
                                                }}
                                            >
                                                <PendingIcon sx={{ fontSize: 36, color: 'warning.main' }} />
                                            </Box>
                                        </Stack>
                                        <Box>
                                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Progreso
                                                </Typography>
                                                <Typography variant="caption" fontWeight={600} color="warning.main">
                                                    {pendingPercentage.toFixed(0)}%
                                                </Typography>
                                            </Stack>
                                            <LinearProgress
                                                variant="determinate"
                                                value={pendingPercentage}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                                                    '& .MuiLinearProgress-bar': {
                                                        borderRadius: 3,
                                                        background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grow>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card
                            sx={{
                                background: theme.palette.mode === 'dark'
                                    ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.15)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`
                                    : `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.25)}`,
                                },
                            }}
                        >
                            <CardContent>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="h3" fontWeight="bold" color="success.main">
                                            {statistics.approved_count}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                            Aprobadas
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.success.main, 0.1),
                                        }}
                                    >
                                        <ApprovedIcon sx={{ fontSize: 40, color: 'success.main' }} />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card
                            sx={{
                                background: theme.palette.mode === 'dark'
                                    ? `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.15)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`
                                    : `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.25)}`,
                                },
                            }}
                        >
                            <CardContent>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="h3" fontWeight="bold" color="error.main">
                                            {statistics.rejected_count}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                            Rechazadas
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.error.main, 0.1),
                                        }}
                                    >
                                        <RejectedIcon sx={{ fontSize: 40, color: 'error.main' }} />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card
                            sx={{
                                background: theme.palette.mode === 'dark'
                                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
                                    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                                },
                            }}
                        >
                            <CardContent>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography variant="h3" fontWeight="bold" color="primary.main">
                                            {statistics.approval_rate}%
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                            Tasa de Aprobación
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        }}
                                    >
                                        <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tabs */}
                <Paper
                    sx={{
                        mb: 3,
                        borderRadius: 2,
                        overflow: 'hidden',
                    }}
                >
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                            },
                        }}
                    >
                        <Tab label="Todas" value="all" />
                        <Tab
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <span>Pendientes</span>
                                    {statistics.pending_count > 0 && (
                                        <Chip
                                            label={statistics.pending_count}
                                            size="small"
                                            color="warning"
                                            sx={{ height: 20, minWidth: 20 }}
                                        />
                                    )}
                                </Stack>
                            }
                            value="pending"
                        />
                        <Tab label="Aprobadas" value="approved" />
                        <Tab label="Rechazadas" value="rejected" />
                        <Tab label="Info Requerida" value="more_info_requested" />
                    </Tabs>
                </Paper>

                {/* Appeals Table */}
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: 2,
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 4px 20px rgba(0,0,0,0.5)'
                            : '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow
                                sx={{
                                    bgcolor: theme.palette.mode === 'dark'
                                        ? alpha(theme.palette.primary.main, 0.1)
                                        : alpha(theme.palette.primary.main, 0.05),
                                }}
                            >
                                <TableCell sx={{ fontWeight: 700 }}>Usuario</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Razón del Baneo</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Razón de Apelación</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Evidencia</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Revisada Por</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {appeals.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                        <GavelIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            No hay apelaciones en esta categoría
                                        </Typography>
                                        <Typography variant="body2" color="text.disabled">
                                            Las apelaciones aparecerán aquí cuando los usuarios las envíen
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                appeals.data.map((appeal) => (
                                    <TableRow
                                        key={appeal.id}
                                        hover
                                        sx={{
                                            '&:hover': {
                                                bgcolor: theme.palette.mode === 'dark'
                                                    ? alpha(theme.palette.primary.main, 0.05)
                                                    : alpha(theme.palette.primary.main, 0.02),
                                            },
                                        }}
                                    >
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="600">
                                                    {appeal.user.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {appeal.user.email}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={appeal.ban.reason}>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                    {appeal.ban.reason}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={appeal.reason}>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                                                    {appeal.reason}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={appeal.status_label}
                                                color={getStatusColor(appeal.status)}
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {appeal.has_evidence ? (
                                                <Chip
                                                    label="Sí"
                                                    color="info"
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ) : (
                                                <Chip
                                                    label="No"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: 'transparent',
                                                        border: '1px dashed',
                                                        borderColor: 'divider',
                                                    }}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" color="text.secondary">
                                                {appeal.created_at}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption" color="text.secondary">
                                                {appeal.reviewed_by || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Ver Detalles y Revisar">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => router.visit(route('admin.ban-appeals.show', appeal.id))}
                                                    sx={{
                                                        color: 'primary.main',
                                                        '&:hover': {
                                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        },
                                                    }}
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {appeals.last_page > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={appeals.last_page}
                            page={appeals.current_page}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                            showFirstButton
                            showLastButton
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    fontWeight: 600,
                                },
                            }}
                        />
                    </Box>
                )}
            </Box>
        </AdminLayoutNew>
    );
}

