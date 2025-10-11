import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Box,
    Paper,
    Typography,
    Button,
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

const ReportsIndex = ({ reports, filters }) => {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [resolveDialog, setResolveDialog] = useState({ open: false, report: null });
    const [resolveNotes, setResolveNotes] = useState('');
    const [resolveAction, setResolveAction] = useState('');

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

    const getSeverityColor = (reason) => {
        const lowerReason = reason.toLowerCase();
        if (lowerReason.includes('spam') || lowerReason.includes('contenido inapropiado')) {
            return 'error';
        } else if (lowerReason.includes('ofensivo') || lowerReason.includes('acoso')) {
            return 'warning';
        } else {
            return 'info';
        }
    };

    const handleSearch = () => {
        router.get(route('admin.comment-reports.index'), {
            search: searchTerm,
            status: statusFilter,
        }, {
            preserveState: true,
            preserveScroll: false,
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
        <AdminLayout title="Reportes de Comentarios">
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
                            <Card component={motion.div} whileHover={{ y: -4 }}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <ReportIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                                    <Typography variant="h4" fontWeight="bold" color="error.main">
                                        {reports.total}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Reportes
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card component={motion.div} whileHover={{ y: -4 }}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                                        {reports.data.filter(r => r.status === 'pending').length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Pendientes
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card component={motion.div} whileHover={{ y: -4 }}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <ResolveIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                                    <Typography variant="h4" fontWeight="bold" color="success.main">
                                        {reports.data.filter(r => r.status === 'resolved').length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Resueltos
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card component={motion.div} whileHover={{ y: -4 }}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <DismissIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                                    <Typography variant="h4" fontWeight="bold" color="info.main">
                                        {reports.data.filter(r => r.status === 'dismissed').length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Desestimados
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Filtros y búsqueda */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                        <TextField
                            fullWidth
                            placeholder="Buscar reportes, razones, usuarios..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />
                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Estado</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Estado"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="pending">Pendientes</MenuItem>
                                <MenuItem value="resolved">Resueltos</MenuItem>
                                <MenuItem value="dismissed">Desestimados</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            startIcon={<FilterIcon />}
                            onClick={handleSearch}
                            sx={{ minWidth: 120 }}
                        >
                            Filtrar
                        </Button>
                    </Stack>
                </Paper>

                {/* Lista de reportes */}
                <Paper>
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
                                            color={getSeverityColor(report.reason)} 
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
                                                        label={report.category.replace('_', ' ').toUpperCase()} 
                                                        size="small" 
                                                        color={getSeverityColor(report.reason)}
                                                        variant="filled"
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
                                            <Paper sx={{ p: 3, height: '100%' }}>
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
                                            <Paper sx={{ p: 3, height: '100%' }}>
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
                                                <Paper sx={{ p: 3, backgroundColor: alpha(theme.palette.warning.main, 0.05) }}>
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
        </AdminLayout>
    );
};

export default ReportsIndex;