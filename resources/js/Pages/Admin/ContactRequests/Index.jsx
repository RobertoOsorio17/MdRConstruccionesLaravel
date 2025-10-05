import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
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
    TablePagination,
    Chip,
    IconButton,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Grid,
    alpha,
    useTheme,
    Tooltip,
    Menu,
    Checkbox,
} from '@mui/material';
import {
    Visibility,
    Delete,
    CheckCircle,
    Reply,
    Archive,
    MoreVert,
    Search,
    FilterList,
    Email,
    Phone,
    Business,
    CalendarToday,
    NoteAdd,
    AttachFile,
    Download,
    PictureAsPdf,
    Image as ImageIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ContactRequestsIndex({ requests, stats, filters }) {
    const theme = useTheme();
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [serviceFilter, setServiceFilter] = useState(filters.service || '');
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [detailsDialog, setDetailsDialog] = useState(false);
    const [notesDialog, setNotesDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [notes, setNotes] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);

    // Glassmorphism style
    const glassStyle = {
        background: alpha('#ffffff', 0.85),
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: `1px solid ${alpha('#ffffff', 0.3)}`,
        boxShadow: `0 8px 32px 0 ${alpha('#000000', 0.1)}`,
    };

    const handleSearch = () => {
        router.get(route('admin.contact-requests.index'), {
            search,
            status: statusFilter,
            service: serviceFilter,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatusChange = (id, status) => {
        router.post(route(`admin.contact-requests.mark-${status}`, id), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar esta solicitud?')) {
            router.delete(route('admin.contact-requests.destroy', id), {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleBulkAction = (action) => {
        if (selectedRequests.length === 0) {
            alert('Selecciona al menos una solicitud');
            return;
        }

        router.post(route('admin.contact-requests.bulk-action'), {
            action,
            ids: selectedRequests,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setSelectedRequests([]),
        });
    };

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setDetailsDialog(true);
    };

    const handleAddNotes = (request) => {
        setSelectedRequest(request);
        setNotes(request.admin_notes || '');
        setNotesDialog(true);
    };

    const handleSaveNotes = () => {
        router.post(route('admin.contact-requests.add-notes', selectedRequest.id), {
            notes,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setNotesDialog(false);
                setNotes('');
            },
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            new: 'error',
            read: 'warning',
            responded: 'success',
            archived: 'default',
        };
        return colors[status] || 'default';
    };

    const getStatusLabel = (status) => {
        const labels = {
            new: 'Nueva',
            read: 'Leída',
            responded: 'Respondida',
            archived: 'Archivada',
        };
        return labels[status] || status;
    };

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <Card sx={{ ...glassStyle, height: '100%' }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h3" fontWeight="bold" color={color}>
                            {value}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            background: alpha(color, 0.1),
                            borderRadius: 2,
                            p: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Icon sx={{ color, fontSize: 40 }} />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <AdminLayout>
            <Head title="Solicitudes de Contacto" />

            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Solicitudes de Contacto
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Gestiona las solicitudes de contacto recibidas desde el formulario web
                    </Typography>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <StatCard
                                title="Total"
                                value={stats.total}
                                icon={Email}
                                color={theme.palette.primary.main}
                            />
                        </motion.div>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <StatCard
                                title="Nuevas"
                                value={stats.new}
                                icon={NoteAdd}
                                color={theme.palette.error.main}
                            />
                        </motion.div>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <StatCard
                                title="Leídas"
                                value={stats.read}
                                icon={Visibility}
                                color={theme.palette.warning.main}
                            />
                        </motion.div>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <StatCard
                                title="Respondidas"
                                value={stats.responded}
                                icon={CheckCircle}
                                color={theme.palette.success.main}
                            />
                        </motion.div>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Card sx={{ ...glassStyle, mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    placeholder="Buscar por nombre, email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    InputProps={{
                                        startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        label="Estado"
                                    >
                                        <MenuItem value="">Todos</MenuItem>
                                        <MenuItem value="new">Nuevas</MenuItem>
                                        <MenuItem value="read">Leídas</MenuItem>
                                        <MenuItem value="responded">Respondidas</MenuItem>
                                        <MenuItem value="archived">Archivadas</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Servicio</InputLabel>
                                    <Select
                                        value={serviceFilter}
                                        onChange={(e) => setServiceFilter(e.target.value)}
                                        label="Servicio"
                                    >
                                        <MenuItem value="">Todos</MenuItem>
                                        <MenuItem value="Reformas Integrales">Reformas Integrales</MenuItem>
                                        <MenuItem value="Construcción Nueva">Construcción Nueva</MenuItem>
                                        <MenuItem value="Rehabilitación">Rehabilitación</MenuItem>
                                        <MenuItem value="Diseño de Interiores">Diseño de Interiores</MenuItem>
                                        <MenuItem value="Proyectos Comerciales">Proyectos Comerciales</MenuItem>
                                        <MenuItem value="Otro">Otro</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleSearch}
                                    startIcon={<FilterList />}
                                >
                                    Filtrar
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Bulk Actions */}
                {selectedRequests.length > 0 && (
                    <Card sx={{ ...glassStyle, mb: 3 }}>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="body2">
                                    {selectedRequests.length} seleccionadas
                                </Typography>
                                <Button
                                    size="small"
                                    onClick={() => handleBulkAction('mark_read')}
                                    startIcon={<Visibility />}
                                >
                                    Marcar como leídas
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => handleBulkAction('mark_responded')}
                                    startIcon={<CheckCircle />}
                                >
                                    Marcar como respondidas
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => handleBulkAction('archive')}
                                    startIcon={<Archive />}
                                >
                                    Archivar
                                </Button>
                                <Button
                                    size="small"
                                    color="error"
                                    onClick={() => handleBulkAction('delete')}
                                    startIcon={<Delete />}
                                >
                                    Eliminar
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                {/* Table */}
                <Card sx={glassStyle}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedRequests.length === requests.data.length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedRequests(requests.data.map(r => r.id));
                                                } else {
                                                    setSelectedRequests([]);
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Servicio</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requests.data.map((request) => (
                                    <TableRow
                                        key={request.id}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                            },
                                        }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedRequests.includes(request.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedRequests([...selectedRequests, request.id]);
                                                    } else {
                                                        setSelectedRequests(selectedRequests.filter(id => id !== request.id));
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={request.status === 'new' ? 'bold' : 'normal'}>
                                                {request.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{request.email}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={request.service || 'N/A'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getStatusLabel(request.status)}
                                                color={getStatusColor(request.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption">
                                                {format(new Date(request.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="Ver detalles">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleViewDetails(request)}
                                                    >
                                                        <Visibility fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Agregar notas">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleAddNotes(request)}
                                                    >
                                                        <NoteAdd fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {request.status === 'new' && (
                                                    <Tooltip title="Marcar como leída">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleStatusChange(request.id, 'read')}
                                                        >
                                                            <CheckCircle fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {request.status !== 'responded' && (
                                                    <Tooltip title="Marcar como respondida">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleStatusChange(request.id, 'responded')}
                                                        >
                                                            <Reply fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="Eliminar">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDelete(request.id)}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={requests.total}
                        page={requests.current_page - 1}
                        onPageChange={(e, page) => {
                            router.get(route('admin.contact-requests.index'), {
                                ...filters,
                                page: page + 1,
                            }, {
                                preserveState: true,
                                preserveScroll: true,
                            });
                        }}
                        rowsPerPage={requests.per_page}
                        onRowsPerPageChange={() => {}}
                        rowsPerPageOptions={[15]}
                    />
                </Card>

                {/* Details Dialog */}
                <Dialog
                    open={detailsDialog}
                    onClose={() => setDetailsDialog(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        <Typography variant="h6" fontWeight="bold">
                            Detalles de la Solicitud
                        </Typography>
                    </DialogTitle>
                    <DialogContent dividers>
                        {selectedRequest && (
                            <Stack spacing={3}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Nombre
                                    </Typography>
                                    <Typography variant="body1" fontWeight="500">
                                        {selectedRequest.name}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Email
                                    </Typography>
                                    <Typography variant="body1" fontWeight="500">
                                        {selectedRequest.email}
                                    </Typography>
                                </Box>
                                {selectedRequest.phone && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Teléfono
                                        </Typography>
                                        <Typography variant="body1" fontWeight="500">
                                            {selectedRequest.phone}
                                        </Typography>
                                    </Box>
                                )}
                                {selectedRequest.service && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Servicio de Interés
                                        </Typography>
                                        <Typography variant="body1" fontWeight="500">
                                            {selectedRequest.service}
                                        </Typography>
                                    </Box>
                                )}
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Mensaje
                                    </Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {selectedRequest.message}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Estado
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Chip
                                            label={getStatusLabel(selectedRequest.status)}
                                            color={getStatusColor(selectedRequest.status)}
                                        />
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Fecha de Recepción
                                    </Typography>
                                    <Typography variant="body1">
                                        {format(new Date(selectedRequest.created_at), 'dd MMMM yyyy HH:mm', { locale: es })}
                                    </Typography>
                                </Box>
                                {selectedRequest.preferred_contact && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Preferencia de Contacto
                                        </Typography>
                                        <Typography variant="body1" fontWeight="500">
                                            {selectedRequest.preferred_contact}
                                        </Typography>
                                    </Box>
                                )}
                                {selectedRequest.contact_time && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Franja de Contacto
                                        </Typography>
                                        <Typography variant="body1" fontWeight="500">
                                            {selectedRequest.contact_time}
                                        </Typography>
                                    </Box>
                                )}
                                {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" gutterBottom>
                                            Archivos Adjuntos ({selectedRequest.attachments.length})
                                        </Typography>
                                        <Stack spacing={1} sx={{ mt: 1 }}>
                                            {selectedRequest.attachments.map((file, index) => (
                                                <Card
                                                    key={index}
                                                    variant="outlined"
                                                    sx={{
                                                        p: 1.5,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        '&:hover': {
                                                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                        },
                                                    }}
                                                >
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        {file.mime_type === 'application/pdf' ? (
                                                            <PictureAsPdf color="error" />
                                                        ) : (
                                                            <ImageIcon color="primary" />
                                                        )}
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {file.original_name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {(file.size / 1024).toFixed(2)} KB
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                    <Tooltip title="Descargar">
                                                        <IconButton
                                                            size="small"
                                                            href={route('admin.contact-requests.download-attachment', {
                                                                contactRequest: selectedRequest.id,
                                                                index: index,
                                                            })}
                                                            component="a"
                                                            target="_blank"
                                                        >
                                                            <Download fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Card>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}
                                {selectedRequest.admin_notes && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Notas Internas
                                        </Typography>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {selectedRequest.admin_notes}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDetailsDialog(false)}>
                            Cerrar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Notes Dialog */}
                <Dialog
                    open={notesDialog}
                    onClose={() => setNotesDialog(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        <Typography variant="h6" fontWeight="bold">
                            Agregar Notas Internas
                        </Typography>
                    </DialogTitle>
                    <DialogContent dividers>
                        <TextField
                            fullWidth
                            multiline
                            rows={6}
                            label="Notas"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Escribe notas internas sobre esta solicitud..."
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setNotesDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSaveNotes}
                            disabled={!notes.trim()}
                        >
                            Guardar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </AdminLayout>
    );
}
