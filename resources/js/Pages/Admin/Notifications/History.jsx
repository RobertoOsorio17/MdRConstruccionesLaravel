import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
    Alert,
    Tooltip,
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    CheckCircle as SuccessIcon,
    Settings as SystemIcon,
    Send as SendIcon,
} from '@mui/icons-material';

export default function History({ auth, notifications, stats, senders, filters }) {
    const [localFilters, setLocalFilters] = useState({
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        type: filters.type || '',
        priority: filters.priority || '',
        status: filters.status || '',
        sent_by: filters.sent_by || '',
    });

    // Type icons mapping
    const typeIcons = {
        info: <InfoIcon fontSize="small" />,
        warning: <WarningIcon fontSize="small" />,
        error: <ErrorIcon fontSize="small" />,
        success: <SuccessIcon fontSize="small" />,
        system: <SystemIcon fontSize="small" />,
    };

    // Type colors mapping
    const typeColors = {
        info: 'info',
        warning: 'warning',
        error: 'error',
        success: 'success',
        system: 'default',
    };

    // Priority colors mapping
    const priorityColors = {
        low: 'default',
        medium: 'primary',
        high: 'warning',
        urgent: 'error',
    };

    const formatRelativeDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;
        if (diffMs < minute) return 'justo ahora';
        if (diffMs < hour) return `hace ${Math.floor(diffMs / minute)} minuto(s)`;
        if (diffMs < day) return `hace ${Math.floor(diffMs / hour)} hora(s)`;
        const days = Math.floor(diffMs / day);
        if (days < 7) return `hace ${days} día(s)`;
        return date.toLocaleString('es-ES');
    };

    const handleFilterChange = (field, value) => {
        setLocalFilters(prev => ({ ...prev, [field]: value }));
    };

    const applyFilters = () => {
        router.get(route('admin.user-notifications.history'), localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setLocalFilters({
            date_from: '',
            date_to: '',
            type: '',
            priority: '',
            sent_by: '',
        });
        router.get(route('admin.user-notifications.history'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (event, page) => {
        router.get(route('admin.user-notifications.history'), {
            ...localFilters,
            page,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AdminLayoutNew auth={auth}>
            <Head title="Historial de Notificaciones" />

            <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1600, mx: 'auto' }}>
                {/* Header */}
                <Box sx={{
                    mb: 4,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2
                }}>
                    <Box>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                            📜 Historial de Notificaciones
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Visualiza y filtra las notificaciones enviadas a usuarios
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<SendIcon />}
                        onClick={() => router.visit(route('admin.user-notifications.send'))}
                        sx={{
                            whiteSpace: 'nowrap',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                            }
                        }}
                    >
                        Enviar Nueva Notificación
                    </Button>
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 4 }}>
                    <Grid item xs={6} sm={4} md={2.4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2, sm: 2.5 },
                                textAlign: 'center',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                transition: 'all 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 3
                                }
                            }}
                        >
                            <Typography variant="h4" color="primary" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                                {stats.total}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
                                Total
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2.4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2, sm: 2.5 },
                                textAlign: 'center',
                                border: '1px solid',
                                borderColor: 'success.light',
                                borderRadius: 2,
                                bgcolor: 'success.50',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 3
                                }
                            }}
                        >
                            <Typography variant="h4" color="success.main" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                                {stats.sent}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
                                ✅ Enviadas
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2.4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2, sm: 2.5 },
                                textAlign: 'center',
                                border: '1px solid',
                                borderColor: 'info.light',
                                borderRadius: 2,
                                bgcolor: 'info.50',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 3
                                }
                            }}
                        >
                            <Typography variant="h4" color="info.main" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                                {stats.scheduled}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
                                📅 Programadas
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2.4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2, sm: 2.5 },
                                textAlign: 'center',
                                border: '1px solid',
                                borderColor: 'error.light',
                                borderRadius: 2,
                                bgcolor: 'error.50',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 3
                                }
                            }}
                        >
                            <Typography variant="h4" color="error.main" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                                {stats.failed}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
                                ❌ Fallidas
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} sm={4} md={2.4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2, sm: 2.5 },
                                textAlign: 'center',
                                border: '1px solid',
                                borderColor: 'warning.light',
                                borderRadius: 2,
                                bgcolor: 'warning.50',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 3
                                }
                            }}
                        >
                            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                                {stats.sent_today}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
                                🔥 Hoy
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Card
                    elevation={0}
                    sx={{
                        mb: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2
                    }}
                >
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600, mb: 3 }}>
                            <FilterIcon color="primary" />
                            Filtros de Búsqueda
                        </Typography>
                        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                            <Grid item xs={12} sm={6} md={2}>
                                <TextField
                                    fullWidth
                                    label="Desde"
                                    type="date"
                                    value={localFilters.date_from}
                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <TextField
                                    fullWidth
                                    label="Hasta"
                                    type="date"
                                    value={localFilters.date_to}
                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Tipo</InputLabel>
                                    <Select
                                        value={localFilters.type}
                                        onChange={(e) => handleFilterChange('type', e.target.value)}
                                        label="Tipo"
                                    >
                                        <MenuItem value="">Todos</MenuItem>
                                        <MenuItem value="info">Información</MenuItem>
                                        <MenuItem value="success">Éxito</MenuItem>
                                        <MenuItem value="warning">Advertencia</MenuItem>
                                        <MenuItem value="error">Error</MenuItem>
                                        <MenuItem value="system">Sistema</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Prioridad</InputLabel>
                                    <Select
                                        value={localFilters.priority}
                                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                                        label="Prioridad"
                                    >
                                        <MenuItem value="">Todas</MenuItem>
                                        <MenuItem value="low">Baja</MenuItem>
                                        <MenuItem value="medium">Media</MenuItem>
                                        <MenuItem value="high">Alta</MenuItem>
                                        <MenuItem value="urgent">Urgente</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        value={localFilters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        label="Estado"
                                    >
                                        <MenuItem value="">Todos</MenuItem>
                                        <MenuItem value="sent">✅ Enviadas</MenuItem>
                                        <MenuItem value="scheduled">📅 Programadas</MenuItem>
                                        <MenuItem value="failed">❌ Fallidas</MenuItem>
                                        <MenuItem value="draft">📝 Borrador</MenuItem>
                                        <MenuItem value="cancelled">🚫 Canceladas</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Enviado Por</InputLabel>
                                    <Select
                                        value={localFilters.sent_by}
                                        onChange={(e) => handleFilterChange('sent_by', e.target.value)}
                                        label="Enviado Por"
                                    >
                                        <MenuItem value="">Todos</MenuItem>
                                        {senders.map(sender => (
                                            <MenuItem key={sender.id} value={sender.id}>
                                                {sender.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={clearFilters}
                            >
                                Limpiar
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<FilterIcon />}
                                onClick={applyFilters}
                            >
                                Aplicar Filtros
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* Notifications Table */}
                <Card
                    elevation={0}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        overflow: 'hidden'
                    }}
                >
                    <TableContainer>
                        <Table sx={{ minWidth: { xs: 650, md: 750 } }}>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'action.hover' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Título</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Prioridad</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Programada</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Enviada</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Enviado Por</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {notifications.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h3" sx={{ mb: 2, opacity: 0.3 }}>
                                                    📭
                                                </Typography>
                                                <Typography variant="h6" gutterBottom color="text.secondary">
                                                    No hay notificaciones
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    No se encontraron notificaciones con los filtros aplicados
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    notifications.data.map((notification) => {
                                        const statusConfig = {
                                            sent: { label: '✅ Enviada', color: 'success' },
                                            scheduled: { label: '📅 Programada', color: 'info' },
                                            failed: { label: '❌ Fallida', color: 'error' },
                                            draft: { label: '📝 Borrador', color: 'default' },
                                            cancelled: { label: '🚫 Cancelada', color: 'warning' },
                                        };
                                        const status = statusConfig[notification.status] || statusConfig.sent;

                                        return (
                                            <TableRow
                                                key={notification.id}
                                                hover
                                                sx={{
                                                    '&:hover': {
                                                        bgcolor: 'action.hover',
                                                        cursor: 'pointer'
                                                    }
                                                }}
                                            >
                                                <TableCell>
                                                    <Box>
                                                        <Tooltip title={notification.title} arrow>
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight={500}
                                                                sx={{
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                    maxWidth: { xs: 150, sm: 250, md: 350 }
                                                                }}
                                                            >
                                                                {notification.title}
                                                            </Typography>
                                                        </Tooltip>
                                                        {notification.is_recurring && (
                                                            <Chip label="🔄 Recurrente" size="small" color="info" variant="outlined" sx={{ mt: 0.5 }} />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        icon={typeIcons[notification.type]}
                                                        label={notification.type}
                                                        color={typeColors[notification.type]}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={notification.priority}
                                                        color={priorityColors[notification.priority]}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {notification.status === 'failed' && notification.failure_reason ? (
                                                        <Tooltip title={notification.failure_reason} placement="top" arrow>
                                                            <Chip
                                                                label={status.label}
                                                                color={status.color}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        </Tooltip>
                                                    ) : (
                                                        <Chip
                                                            label={status.label}
                                                            color={status.color}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {notification.scheduled_at ? (
                                                        <Tooltip title={new Date(notification.scheduled_at).toLocaleString('es-ES')} arrow>
                                                            <Typography variant="body2">
                                                                {formatRelativeDate(notification.scheduled_at)}
                                                            </Typography>
                                                        </Tooltip>
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary">-</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {notification.sent_at ? (
                                                        <Tooltip title={new Date(notification.sent_at).toLocaleString('es-ES')} arrow>
                                                            <Typography variant="body2">
                                                                {formatRelativeDate(notification.sent_at)}
                                                            </Typography>
                                                        </Tooltip>
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary">-</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {notification.sent_by ? notification.sent_by.name : 'Sistema'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {notifications.last_page > 1 && (
                        <Box sx={{
                            p: 3,
                            display: 'flex',
                            justifyContent: 'center',
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'action.hover'
                        }}>
                            <Pagination
                                count={notifications.last_page}
                                page={notifications.current_page}
                                onChange={handlePageChange}
                                color="primary"
                                size="medium"
                                shape="rounded"
                                showFirstButton
                                showLastButton
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        fontWeight: 500
                                    }
                                }}
                            />
                        </Box>
                    )}
                </Card>
            </Box>
        </AdminLayoutNew>
    );
}

