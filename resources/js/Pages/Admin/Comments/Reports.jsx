import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';
import {
    Box,
    Paper,
    Typography,
    Button,
    ButtonGroup,
    LinearProgress,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Tooltip,
    Avatar,
    useTheme,
    alpha,
    Stack,
    Card,
    CardContent,
    Grid,
    Pagination,
    Tabs,
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Flag as ReportIcon,
    Check as ResolveIcon,
    Close as DismissIcon,
    Visibility as ViewIcon,
    Comment as CommentIcon,
    Person as PersonIcon,
    Article as ArticleIcon,
    ExpandMore as ExpandMoreIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ReportsIndex = ({ reports, filters, stats }) => {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || '');
    const [reporterTypeFilter, setReporterTypeFilter] = useState(filters.reporter_type || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [resolveDialog, setResolveDialog] = useState({ open: false, report: null });
    const [resolveNotes, setResolveNotes] = useState('');
    const [resolveAction, setResolveAction] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const formatISODate = (d) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    };

    const applyDatePreset = (days) => {
        const now = new Date();
        const from = new Date(now);
        from.setDate(now.getDate() - days);
        setDateFrom(formatISODate(from));
        setDateTo(formatISODate(now));
    };
    // Valor de pestañas activo
    const tabsValue = (priorityFilter === 'high' && statusFilter === 'pending')
        ? 'high_priority'
        : (statusFilter || 'all');


    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'resolved': return 'success';
            case 'dismissed': return 'info';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'resolved': return 'Resuelto';
            case 'dismissed': return 'Desestimado';
            default: return status;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'default';
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 'high': return 'Alta';
            case 'medium': return 'Media';
            case 'low': return 'Baja';
            default: return priority;
        }
    };

    const getCategoryLabel = (category) => {
        const labels = {
            'spam': 'Spam',
            'harassment': 'Acoso',
            'hate_speech': 'Discurso de odio',
            'inappropriate': 'Inapropiado',
            'misinformation': 'Desinformación',
            'off_topic': 'Fuera de tema',
            'other': 'Otro'
        };
        return labels[category] || category;
    };

    const getSeverityColor = (category) => {
        switch (category) {
            case 'hate_speech':
            case 'harassment':
                return 'error';
            case 'spam':
            case 'inappropriate':
            case 'misinformation':
                return 'warning';
            case 'off_topic':
            case 'other':
                return 'info';
            default:
                return 'default';
        }
    };

    const handleSearch = () => {
        setIsLoading(true);
        router.get(route('admin.comment-reports.index'), {
            search: searchTerm,
            status: statusFilter,
            category: categoryFilter,
            priority: priorityFilter,
            reporter_type: reporterTypeFilter,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            preserveScroll: false,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setCategoryFilter('');
        setPriorityFilter('');
        setReporterTypeFilter('');
        setDateFrom('');
        setDateTo('');
        setIsLoading(true);
        router.get(route('admin.comment-reports.index'), {}, {
            preserveScroll: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleResolveReport = (action) => {
        if (!resolveDialog.report) return;

        router.post(route('admin.comment-reports.resolve', resolveDialog.report.id), {
            status: action,
            notes: resolveNotes
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setResolveDialog({ open: false, report: null });
                setResolveNotes('');
                setResolveAction('');
            }
        });
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

    const truncateText = (text, maxLength = 100) => {
        return text && text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <AdminLayoutNew title="Reportes de Comentarios">
            <Head title="Reportes - Admin" />

            <Box sx={{ py: 4 }}>
                {/* Header con estadísticas */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Reportes de Comentarios
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Gestiona los reportes de comentarios inapropiados o spam
                    </Typography>

                    {/* Estadísticas rápidas */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card component={motion.div} whileHover={{ y: -4 }} elevation={0} sx={{ borderRadius: 3, backgroundColor: alpha(theme.palette.background.paper, 0.8), border: `1px solid ${alpha(theme.palette.divider, 0.12)}`, backdropFilter: 'blur(10px)', boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}` }}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <ReportIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                                    <Typography variant="h4" fontWeight="bold" color="error.main">
                                        {stats?.total || reports.total}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Reportes
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card component={motion.div} whileHover={{ y: -4 }} elevation={0} sx={{ borderRadius: 3, backgroundColor: alpha(theme.palette.background.paper, 0.8), border: `1px solid ${alpha(theme.palette.divider, 0.12)}`, backdropFilter: 'blur(10px)', boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}` }}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                                        {stats?.pending || reports.data.filter(r => r.status === 'pending').length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Pendientes
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card component={motion.div} whileHover={{ y: -4 }} elevation={0} sx={{ borderRadius: 3, backgroundColor: alpha(theme.palette.background.paper, 0.8), border: `1px solid ${alpha(theme.palette.divider, 0.12)}`, backdropFilter: 'blur(10px)', boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}` }}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <ResolveIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                                    <Typography variant="h4" fontWeight="bold" color="success.main">
                                        {stats?.resolved || reports.data.filter(r => r.status === 'resolved').length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Resueltos
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card component={motion.div} whileHover={{ y: -4 }} elevation={0} sx={{ borderRadius: 3, backgroundColor: alpha(theme.palette.background.paper, 0.8), border: `1px solid ${alpha(theme.palette.divider, 0.12)}`, backdropFilter: 'blur(10px)', boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}` }}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <DismissIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                                    <Typography variant="h4" fontWeight="bold" color="info.main">
                                        {stats?.dismissed || reports.data.filter(r => r.status === 'dismissed').length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Desestimados
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        {stats?.high_priority > 0 && (
                            <Grid item xs={12} sm={6} md={3}>
                                <Card component={motion.div} whileHover={{ y: -4 }} elevation={0} sx={{ borderRadius: 3, backgroundColor: alpha(theme.palette.error.main, 0.1), border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`, backdropFilter: 'blur(10px)', boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.2)}` }}>
                                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                        <WarningIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                                        <Typography variant="h4" fontWeight="bold" color="error.main">
                                            {stats.high_priority}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Alta Prioridad
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>
                </Box>

                {/* Filtros y búsqueda */}
                <Paper sx={{ position: 'sticky', top: 64, zIndex: 10, overflow: 'hidden', p: 3, mb: 3, backgroundColor: alpha(theme.palette.background.paper, 0.6), border: `1px solid ${alpha(theme.palette.divider, 0.12)}`, backdropFilter: 'blur(10px)', borderRadius: 2 }}>
                    {isLoading && (
                        <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, borderRadius: '8px 8px 0 0' }} />
                    )}

                    {/* Pestañas rápidas */}
                    <Tabs
                        value={tabsValue}
                        onChange={(e, val) => {
                            setStatusFilter(val === 'all' ? '' : val);
                            // Alta prioridad como scope si existe
                            if (val === 'high_priority') {
                                setStatusFilter('pending');
                                setPriorityFilter('high');
                            } else if (priorityFilter && val !== 'high_priority') {
                                // No forzar prioridad si no es la pestaña especial
                                setPriorityFilter(priorityFilter);
                            }
                            // Ejecutar búsqueda tras cambiar tab
                            setTimeout(() => handleSearch(), 0);
                        }}
                        sx={{ mb: 1 }}
                        variant="scrollable"
                        scrollButtons
                        allowScrollButtonsMobile
                    >
                        <Tab value="all" label={`Todos (${stats?.total ?? reports?.total ?? 0})`} />
                        <Tab value="pending" label={`Pendientes (${stats?.pending ?? 0})`} />
                        <Tab value="resolved" label={`Resueltos (${stats?.resolved ?? 0})`} />
                        <Tab value="dismissed" label={`Desestimados (${stats?.dismissed ?? 0})`} />
                        {stats?.high_priority > 0 && (
                            <Tab value="high_priority" label={`Alta prioridad (${stats.high_priority})`} />
                        )}
                    </Tabs>

                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={4}>
                        {/* Búsqueda a ancho completo */}
                        <Box sx={{ width: '100%' }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Buscar reportes, razones, usuarios, posts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </Box>

                        {/* Chips de filtros activos */}
                        {(statusFilter || categoryFilter || priorityFilter || reporterTypeFilter || dateFrom || dateTo || searchTerm) && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {searchTerm && (<Chip size="small" label={`Buscar: ${searchTerm}`} onDelete={() => setSearchTerm('')} />)}
                                {statusFilter && (<Chip size="small" label={`Estado: ${getStatusLabel(statusFilter)}`} onDelete={() => setStatusFilter('')} />)}
                                {categoryFilter && (<Chip size="small" label={`Categoría: ${getCategoryLabel(categoryFilter)}`} onDelete={() => setCategoryFilter('')} />)}
                                {priorityFilter && (<Chip size="small" label={`Prioridad: ${priorityFilter}`} onDelete={() => setPriorityFilter('')} />)}
                                {reporterTypeFilter && (<Chip size="small" label={`Reportante: ${reporterTypeFilter === 'user' ? 'Usuario' : 'Invitado'}`} onDelete={() => setReporterTypeFilter('')} />)}
                                {dateFrom && (<Chip size="small" label={`Desde: ${dateFrom}`} onDelete={() => setDateFrom('')} />)}
                                {dateTo && (<Chip size="small" label={`Hasta: ${dateTo}`} onDelete={() => setDateTo('')} />)}
                            </Box>
                        )}

                        {/* Fila de selects principales */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Estado</InputLabel>
                                    <Select value={statusFilter} label="Estado" onChange={(e) => setStatusFilter(e.target.value)}>
                                        <MenuItem value="">Todos</MenuItem>
                                        <MenuItem value="pending">Pendientes</MenuItem>
                                        <MenuItem value="resolved">Resueltos</MenuItem>
                                        <MenuItem value="dismissed">Desestimados</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Categoría</InputLabel>
                                    <Select value={categoryFilter} label="Categoría" onChange={(e) => setCategoryFilter(e.target.value)}>
                                        <MenuItem value="">Todas</MenuItem>
                                        <MenuItem value="spam">Spam</MenuItem>
                                        <MenuItem value="harassment">Acoso</MenuItem>
                                        <MenuItem value="hate_speech">Discurso de odio</MenuItem>
                                        <MenuItem value="inappropriate">Inapropiado</MenuItem>
                                        <MenuItem value="misinformation">Desinformación</MenuItem>
                                        <MenuItem value="off_topic">Fuera de tema</MenuItem>
                                        <MenuItem value="other">Otro</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Prioridad</InputLabel>
                                    <Select value={priorityFilter} label="Prioridad" onChange={(e) => setPriorityFilter(e.target.value)}>
                                        <MenuItem value="">Todas</MenuItem>
                                        <MenuItem value="high">Alta</MenuItem>
                                        <MenuItem value="medium">Media</MenuItem>
                                        <MenuItem value="low">Baja</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Reportante</InputLabel>
                                    <Select value={reporterTypeFilter} label="Reportante" onChange={(e) => setReporterTypeFilter(e.target.value)}>
                                        <MenuItem value="">Todos</MenuItem>
                                        <MenuItem value="user">Usuarios</MenuItem>
                                        <MenuItem value="guest">Invitados</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* Fila de fechas + presets */}
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField fullWidth size="small" label="Desde" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField fullWidth size="small" label="Hasta" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <ButtonGroup size="small" variant="outlined">
                                    <Button onClick={() => applyDatePreset(1)}>24h</Button>
                                    <Button onClick={() => applyDatePreset(7)}>7d</Button>
                                    <Button onClick={() => applyDatePreset(30)}>30d</Button>
                                </ButtonGroup>
                            </Grid>
                        </Grid>

                        {/* Fila de acciones */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button variant="outlined" onClick={handleClearFilters} sx={{ minWidth: 120 }}>Limpiar</Button>
                            <Button variant="contained" startIcon={<FilterIcon />} onClick={handleSearch} sx={{ minWidth: 120 }}>Filtrar</Button>
                        </Box>
                    </Stack>
                </Paper>

                {/* Lista de reportes */}
                <Paper elevation={0} sx={{ p: 1, backgroundColor: alpha(theme.palette.background.paper, 0.6), border: `1px solid ${alpha(theme.palette.divider, 0.12)}`, backdropFilter: 'blur(8px)', borderRadius: 2 }}>
                    {reports.data.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <ReportIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                No hay reportes para mostrar
                            </Typography>
                        </Box>
                    ) : (
                        reports.data.map((report, index) => (
                            <Accordion
                                key={report.id}
                                component={motion.div}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{
                                        backgroundColor: report.status === 'pending'
                                            ? alpha(theme.palette.warning.main, 0.05)
                                            : 'inherit'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                                        <ReportIcon
                                            color={getSeverityColor(report.category)}
                                            sx={{ mr: 1 }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="medium">
                                                {truncateText(report.reason, 60)}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Reportado por: {report.is_guest_report
                                                        ? `Invitado (${report.ip_address?.substring(0, report.ip_address.lastIndexOf('.'))}.xxx)`
                                                        : (report.user?.name || 'Usuario eliminado')
                                                    }
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    • {formatDate(report.created_at)}
                                                </Typography>
                                                {report.is_guest_report && (
                                                    <Chip
                                                        label="Invitado"
                                                        size="small"
                                                        color="warning"
                                                        variant="outlined"
                                                    />
                                                )}
                                                {report.category && (
                                                    <Chip
                                                        label={getCategoryLabel(report.category)}
                                                        size="small"
                                                        color={getSeverityColor(report.category)}
                                                        variant="filled"
                                                    />
                                                )}
                                                {report.priority && (
                                                    <Chip
                                                        label={getPriorityLabel(report.priority)}
                                                        size="small"
                                                        color={getPriorityColor(report.priority)}
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                        <Chip
                                            label={getStatusLabel(report.status)}
                                            color={getStatusColor(report.status)}
                                            size="small"
                                        />
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={3}>
                                        {/* Información del reporte */}
                                        <Grid item xs={12} md={6}>
                                            <Paper sx={{ p: 3, height: '100%', backgroundColor: alpha(theme.palette.background.paper, 0.6), border: `1px solid ${alpha(theme.palette.divider, 0.12)}`, backdropFilter: 'blur(8px)', borderRadius: 2 }}>
                                                <Typography variant="h6" gutterBottom sx={{ color: 'error.main' }}>
                                                    <ReportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    Detalles del Reporte
                                                </Typography>
                                                <Stack spacing={2}>
                                                    <Box>
                                                        <Typography variant="subtitle2" color="text.secondary">
                                                            Categoria:
                                                        </Typography>
                                                        <Chip
                                                            label={report.category ? report.category.replace('_', ' ').toUpperCase() : 'SIN CATEGORÍA'}
                                                            color={getSeverityColor(report.reason)}
                                                            size="small"
                                                            sx={{ mt: 0.5 }}
                                                        />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle2" color="text.secondary">
                                                            Razón del reporte:
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {report.reason}
                                                        </Typography>
                                                    </Box>
                                                    {report.description && (
                                                        <Box>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                Descripción adicional:
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                                                {report.description}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    <Box>
                                                        <Typography variant="subtitle2" color="text.secondary">
                                                            Reportado por:
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                            <Avatar sx={{ width: 24, height: 24 }}>
                                                                {report.is_guest_report ? '?' : (report.user?.name?.charAt(0) || '?')}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2">
                                                                    {report.is_guest_report
                                                                        ? `Invitado (${report.ip_address?.substring(0, report.ip_address.lastIndexOf('.'))}.xxx)`
                                                                        : (report.user?.name || 'Usuario eliminado')
                                                                    }
                                                                </Typography>
                                                                {report.is_guest_report && (
                                                                    <Typography variant="caption" color="warning.main">
                                                                        IP: {report.ip_address}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                    {report.notes && (
                                                        <Box>
                                                            <Typography variant="subtitle2" color="text.secondary">
                                                                Notas de moderación:
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                                                {report.notes}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Stack>
                                            </Paper>
                                        </Grid>

                                        {/* Comentario reportado */}
                                        <Grid item xs={12} md={6}>
                                            <Paper sx={{ p: 3, height: '100%', backgroundColor: alpha(theme.palette.background.paper, 0.6), border: `1px solid ${alpha(theme.palette.divider, 0.12)}`, backdropFilter: 'blur(8px)', borderRadius: 2 }}>
                                                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                                                    <CommentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    Comentario Reportado
                                                </Typography>
                                                <Stack spacing={2}>
                                                    <Box>
                                                        <Typography variant="body1" sx={{
                                                            backgroundColor: alpha(theme.palette.grey[100], 0.5),
                                                            p: 2,
                                                            borderRadius: 1,
                                                            border: `1px solid ${theme.palette.divider}`
                                                        }}>
                                                            {report.comment?.body || 'Comentario eliminado'}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle2" color="text.secondary">
                                                            Autor del comentario:
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                            <Avatar sx={{ width: 24, height: 24 }}>
                                                                {report.comment?.user?.name?.charAt(0) || '?'}
                                                            </Avatar>
                                                            <Typography variant="body2">
                                                                {report.comment?.user?.name || 'Usuario eliminado'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle2" color="text.secondary">
                                                            En el post:
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                                            <ArticleIcon fontSize="small" color="action" />
                                                            <Typography variant="body2">
                                                                {report.comment?.post?.title || 'Post eliminado'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Stack>
                                            </Paper>
                                        </Grid>

                                        {/* Acciones */}
                                        {report.status === 'pending' && (
                                            <Grid item xs={12}>
                                                <Paper sx={{ p: 3, backgroundColor: alpha(theme.palette.warning.main, 0.05), border: `1px solid ${alpha(theme.palette.divider, 0.12)}`, backdropFilter: 'blur(8px)', borderRadius: 2 }}>
                                                    <Typography variant="h6" gutterBottom>
                                                        Acciones de Moderación
                                                    </Typography>
                                                    <Stack direction="row" spacing={2}>
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            startIcon={<ResolveIcon />}
                                                            onClick={() => setResolveDialog({ open: true, report })}
                                                        >
                                                            Resolver
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            color="info"
                                                            startIcon={<DismissIcon />}
                                                            onClick={() => {
                                                                setResolveDialog({ open: true, report });
                                                                setResolveAction('dismissed');
                                                            }}
                                                        >
                                                            Desestimar
                                                        </Button>
                                                    </Stack>
                                                </Paper>
                                            </Grid>
                                        )}
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    )}

                    {/* Paginación */}
                    {reports.last_page > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <Pagination
                                count={reports.last_page}
                                page={reports.current_page}
                                onChange={(event, page) => {
                                    router.get(route('admin.comment-reports.index'), {
                                        ...filters,
                                        page
                                    });
                                }}
                                color="primary"
                            />
                        </Box>
                    )}
                </Paper>

                {/* Diálogo de resolución */}
                <Dialog
                    open={resolveDialog.open}
                    onClose={() => setResolveDialog({ open: false, report: null })}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{ sx: { backgroundColor: alpha(theme.palette.background.paper, 0.95), backdropFilter: 'blur(12px)', border: `1px solid ${alpha(theme.palette.divider, 0.12)}` } }}
                >
                    <DialogTitle>
                        {resolveAction === 'dismissed' ? 'Desestimar Reporte' : 'Resolver Reporte'}
                    </DialogTitle>
                    <DialogContent>
                        <Typography sx={{ mb: 2 }}>
                            {resolveAction === 'dismissed'
                                ? 'Este reporte será marcado como desestimado.'
                                : 'Este reporte será marcado como resuelto.'}
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Notas de moderación"
                            value={resolveNotes}
                            onChange={(e) => setResolveNotes(e.target.value)}
                            placeholder="Añade notas sobre la decisión tomada..."
                            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: alpha(theme.palette.background.paper, 0.6), backdropFilter: 'blur(6px)' } }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setResolveDialog({ open: false, report: null })}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => handleResolveReport(resolveAction || 'resolved')}
                            color={resolveAction === 'dismissed' ? 'info' : 'success'}
                            variant="contained"
                        >
                            {resolveAction === 'dismissed' ? 'Desestimar' : 'Resolver'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </AdminLayoutNew>
    );
};

export default ReportsIndex;