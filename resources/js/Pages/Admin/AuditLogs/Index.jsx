import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    InputAdornment,
    MenuItem,
    Grid,
    Card,
    CardContent,
    Breadcrumbs,
    Tooltip,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    CheckCircle as SuccessIcon,
    NavigateNext as NavigateNextIcon,
    Home as HomeIcon,
    Security as SecurityIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AuditLogsIndex = ({ logs, filters: initialFilters, stats }) => {
    const [filters, setFilters] = useState({
        search: initialFilters?.search || '',
        user_id: initialFilters?.user_id || '',
        action: initialFilters?.action || '',
        date_from: initialFilters?.date_from || '',
        date_to: initialFilters?.date_to || '',
    });

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);

    // Glassmorphism styles
    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        borderRadius: '16px',
    };

    const glassStatCard = {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        borderRadius: '16px',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.45)',
        },
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleSearch = () => {
        router.get(route('admin.audit-logs.index'), filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setFilters({
            search: '',
            user_id: '',
            action: '',
            date_from: '',
            date_to: '',
        });
        router.get(route('admin.audit-logs.index'), {}, {
            preserveState: true,
        });
    };

    const handleExport = () => {
        window.location.href = route('admin.audit-logs.export', filters);
    };

    const getActionColor = (action) => {
        const colors = {
            'create': 'success',
            'update': 'info',
            'delete': 'error',
            'login': 'primary',
            'logout': 'default',
            'view': 'default',
        };
        return colors[action] || 'default';
    };

    const getActionIcon = (action) => {
        const icons = {
            'create': <SuccessIcon fontSize="small" />,
            'update': <InfoIcon fontSize="small" />,
            'delete': <ErrorIcon fontSize="small" />,
            'login': <PersonIcon fontSize="small" />,
            'logout': <PersonIcon fontSize="small" />,
        };
        return icons[action] || <InfoIcon fontSize="small" />;
    };

    return (
        <AdminLayoutNew title="Logs de Auditoría">
            <Head title="Logs de Auditoría" />

            <Box
                component={motion.div}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Logs de Auditoría
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Registro completo de acciones administrativas y eventos del sistema
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={() => router.reload()}
                                sx={{
                                    borderRadius: '12px',
                                    borderColor: '#667eea',
                                    color: '#667eea',
                                    '&:hover': {
                                        borderColor: '#764ba2',
                                        background: 'rgba(102, 126, 234, 0.1)',
                                    },
                                }}
                            >
                                Actualizar
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={handleExport}
                                sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '12px',
                                    px: 3,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                                    },
                                }}
                            >
                                Exportar
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Stats Cards */}
                {stats && (
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card component={motion.div} variants={itemVariants} sx={glassStatCard}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, color: '#667eea' }}>
                                        <SecurityIcon sx={{ fontSize: 40 }} />
                                    </Box>
                                    <Typography variant="h3" fontWeight="bold" sx={{ color: '#2D3748', mb: 1 }}>
                                        {stats.total || 0}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#718096', fontWeight: 500 }}>
                                        Total de Logs
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card component={motion.div} variants={itemVariants} sx={glassStatCard}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, color: '#48BB78' }}>
                                        <CalendarIcon sx={{ fontSize: 40 }} />
                                    </Box>
                                    <Typography variant="h3" fontWeight="bold" sx={{ color: '#2D3748', mb: 1 }}>
                                        {stats.today || 0}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#718096', fontWeight: 500 }}>
                                        Hoy
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card component={motion.div} variants={itemVariants} sx={glassStatCard}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, color: '#F6AD55' }}>
                                        <CalendarIcon sx={{ fontSize: 40 }} />
                                    </Box>
                                    <Typography variant="h3" fontWeight="bold" sx={{ color: '#2D3748', mb: 1 }}>
                                        {stats.week || 0}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#718096', fontWeight: 500 }}>
                                        Esta Semana
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card component={motion.div} variants={itemVariants} sx={glassStatCard}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, color: '#4299E1' }}>
                                        <CalendarIcon sx={{ fontSize: 40 }} />
                                    </Box>
                                    <Typography variant="h3" fontWeight="bold" sx={{ color: '#2D3748', mb: 1 }}>
                                        {stats.month || 0}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#718096', fontWeight: 500 }}>
                                        Este Mes
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Filters */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FilterIcon />
                        Filtros
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Buscar"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Usuario, acción, descripción..."
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField
                                fullWidth
                                select
                                label="Acción"
                                value={filters.action}
                                onChange={(e) => handleFilterChange('action', e.target.value)}
                            >
                                <MenuItem value="">Todas</MenuItem>
                                <MenuItem value="create">Crear</MenuItem>
                                <MenuItem value="update">Actualizar</MenuItem>
                                <MenuItem value="delete">Eliminar</MenuItem>
                                <MenuItem value="login">Login</MenuItem>
                                <MenuItem value="logout">Logout</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Desde"
                                value={filters.date_from}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CalendarIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Hasta"
                                value={filters.date_to}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleSearch}
                                >
                                    Buscar
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={handleReset}
                                >
                                    Limpiar
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Table */}
                <Paper
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'primary.main' }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acción</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripción</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>IP</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {logs?.data?.length > 0 ? (
                                    logs.data.map((log) => (
                                        <TableRow
                                            key={log.id}
                                            hover
                                            sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                                        >
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <PersonIcon fontSize="small" color="action" />
                                                    <Typography variant="body2">
                                                        {log.user?.name || 'Sistema'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={log.action}
                                                    color={getActionColor(log.action)}
                                                    size="small"
                                                    icon={getActionIcon(log.action)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                                                    {log.description}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontFamily="monospace">
                                                    {log.ip_address}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                                                No se encontraron logs de auditoría
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {logs?.data?.length > 0 && (
                        <TablePagination
                            component="div"
                            count={logs.total || 0}
                            page={logs.current_page - 1 || 0}
                            onPageChange={(e, newPage) => {
                                router.get(route('admin.audit-logs.index'), {
                                    ...filters,
                                    page: newPage + 1
                                }, {
                                    preserveState: true,
                                    preserveScroll: true,
                                });
                            }}
                            rowsPerPage={logs.per_page || 15}
                            onRowsPerPageChange={(e) => {
                                router.get(route('admin.audit-logs.index'), {
                                    ...filters,
                                    per_page: e.target.value
                                }, {
                                    preserveState: true,
                                });
                            }}
                            labelRowsPerPage="Filas por página:"
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                        />
                    )}
                </Paper>
            </Box>
        </AdminLayoutNew>
    );
};

export default AuditLogsIndex;

