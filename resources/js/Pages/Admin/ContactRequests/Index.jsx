import React, { useState } from 'react';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';
import { Head, router } from '@inertiajs/react';
import ContactRequestDrawer from '@/Components/Admin/ContactRequestDrawer';
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
    CircularProgress,
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
        setDetailsDialog(true); // Open drawer instead of dialog
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
        <AdminLayoutNew title="Solicitudes de Contacto">
            <Head title="Solicitudes de Contacto" />
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

                {/* Filters - Premium Glassmorphism Design */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <Card
                        sx={{
                            ...glassStyle,
                            mb: 3,
                            overflow: 'visible',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Stack spacing={3}>
                                {/* Header */}
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                        }}
                                    >
                                        <FilterList sx={{ color: '#fff', fontSize: 20 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" fontWeight={600} sx={{ color: '#2D3748' }}>
                                            Filtros de Búsqueda
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#718096' }}>
                                            Refina los resultados según tus criterios
                                        </Typography>
                                    </Box>
                                </Stack>

                                {/* Filters Grid */}
                                <Grid container spacing={2.5}>
                                    {/* Search Field */}
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            placeholder="Buscar por nombre, email o teléfono..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            InputProps={{
                                                startAdornment: (
                                                    <Search sx={{ mr: 1.5, color: '#667eea', fontSize: 22 }} />
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: alpha('#fff', 0.6),
                                                    backdropFilter: 'blur(10px)',
                                                    borderRadius: '12px',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        backgroundColor: alpha('#fff', 0.8),
                                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                                                    },
                                                    '&.Mui-focused': {
                                                        backgroundColor: alpha('#fff', 0.95),
                                                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.25)',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>

                                    {/* Status Filter */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <FormControl fullWidth>
                                            <InputLabel>Estado</InputLabel>
                                            <Select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                label="Estado"
                                                sx={{
                                                    backgroundColor: alpha('#fff', 0.6),
                                                    backdropFilter: 'blur(10px)',
                                                    borderRadius: '12px',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        backgroundColor: alpha('#fff', 0.8),
                                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                                                    },
                                                    '&.Mui-focused': {
                                                        backgroundColor: alpha('#fff', 0.95),
                                                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.25)',
                                                    },
                                                }}
                                            >
                                                <MenuItem value="">
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#718096' }} />
                                                        <span>Todos los estados</span>
                                                    </Stack>
                                                </MenuItem>
                                                <MenuItem value="new">
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4299E1' }} />
                                                        <span>Nuevas</span>
                                                    </Stack>
                                                </MenuItem>
                                                <MenuItem value="read">
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F6AD55' }} />
                                                        <span>Leídas</span>
                                                    </Stack>
                                                </MenuItem>
                                                <MenuItem value="responded">
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#48BB78' }} />
                                                        <span>Respondidas</span>
                                                    </Stack>
                                                </MenuItem>
                                                <MenuItem value="archived">
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#718096' }} />
                                                        <span>Archivadas</span>
                                                    </Stack>
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Service Filter */}
                                    <Grid item xs={12} sm={6} md={3}>
                                        <FormControl fullWidth>
                                            <InputLabel>Servicio</InputLabel>
                                            <Select
                                                value={serviceFilter}
                                                onChange={(e) => setServiceFilter(e.target.value)}
                                                label="Servicio"
                                                sx={{
                                                    backgroundColor: alpha('#fff', 0.6),
                                                    backdropFilter: 'blur(10px)',
                                                    borderRadius: '12px',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        backgroundColor: alpha('#fff', 0.8),
                                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                                                    },
                                                    '&.Mui-focused': {
                                                        backgroundColor: alpha('#fff', 0.95),
                                                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.25)',
                                                    },
                                                }}
                                            >
                                                <MenuItem value="">Todos los servicios</MenuItem>
                                                <MenuItem value="Reformas Integrales">Reformas Integrales</MenuItem>
                                                <MenuItem value="Construcción Nueva">Construcción Nueva</MenuItem>
                                                <MenuItem value="Rehabilitación">Rehabilitación</MenuItem>
                                                <MenuItem value="Diseño de Interiores">Diseño de Interiores</MenuItem>
                                                <MenuItem value="Proyectos Comerciales">Proyectos Comerciales</MenuItem>
                                                <MenuItem value="Otro">Otro</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Action Buttons */}
                                    <Grid item xs={12} md={2}>
                                        <Stack spacing={1.5} direction={{ xs: 'row', md: 'column' }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={handleSearch}
                                                startIcon={<FilterList />}
                                                sx={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    borderRadius: '12px',
                                                    py: 1.5,
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                                        transform: 'translateY(-2px)',
                                                    },
                                                }}
                                            >
                                                Aplicar
                                            </Button>
                                            {(search || statusFilter || serviceFilter) && (
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    onClick={() => {
                                                        setSearch('');
                                                        setStatusFilter('');
                                                        setServiceFilter('');
                                                        router.get(route('admin.contact-requests.index'));
                                                    }}
                                                    sx={{
                                                        borderRadius: '12px',
                                                        py: 1.5,
                                                        fontWeight: 600,
                                                        textTransform: 'none',
                                                        borderColor: alpha('#667eea', 0.3),
                                                        color: '#667eea',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            borderColor: '#667eea',
                                                            backgroundColor: alpha('#667eea', 0.05),
                                                            transform: 'translateY(-2px)',
                                                        },
                                                    }}
                                                >
                                                    Limpiar
                                                </Button>
                                            )}
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Stack>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Bulk Actions - Premium Design */}
                {selectedRequests.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card
                            sx={{
                                ...glassStyle,
                                mb: 3,
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                border: '2px solid rgba(102, 126, 234, 0.3)',
                            }}
                        >
                            <CardContent sx={{ p: 2.5 }}>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={2}
                                    alignItems={{ xs: 'stretch', sm: 'center' }}
                                    justifyContent="space-between"
                                >
                                    {/* Selection Info */}
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: '10px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                            }}
                                        >
                                            <CheckCircle sx={{ color: '#fff', fontSize: 18 }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body1" fontWeight={600} sx={{ color: '#2D3748' }}>
                                                {selectedRequests.length} {selectedRequests.length === 1 ? 'solicitud seleccionada' : 'solicitudes seleccionadas'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#718096' }}>
                                                Elige una acción para aplicar
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {/* Action Buttons */}
                                    <Stack
                                        direction={{ xs: 'column', sm: 'row' }}
                                        spacing={1.5}
                                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                                    >
                                        <Button
                                            size="medium"
                                            onClick={() => handleBulkAction('mark_read')}
                                            startIcon={<Visibility />}
                                            sx={{
                                                borderRadius: '10px',
                                                px: 2.5,
                                                py: 1,
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                backgroundColor: alpha('#F6AD55', 0.1),
                                                color: '#F6AD55',
                                                border: `1px solid ${alpha('#F6AD55', 0.3)}`,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    backgroundColor: alpha('#F6AD55', 0.2),
                                                    borderColor: '#F6AD55',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(246, 173, 85, 0.3)',
                                                },
                                            }}
                                        >
                                            Marcar leídas
                                        </Button>
                                        <Button
                                            size="medium"
                                            onClick={() => handleBulkAction('mark_responded')}
                                            startIcon={<CheckCircle />}
                                            sx={{
                                                borderRadius: '10px',
                                                px: 2.5,
                                                py: 1,
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                backgroundColor: alpha('#48BB78', 0.1),
                                                color: '#48BB78',
                                                border: `1px solid ${alpha('#48BB78', 0.3)}`,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    backgroundColor: alpha('#48BB78', 0.2),
                                                    borderColor: '#48BB78',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)',
                                                },
                                            }}
                                        >
                                            Respondidas
                                        </Button>
                                        <Button
                                            size="medium"
                                            onClick={() => handleBulkAction('archive')}
                                            startIcon={<Archive />}
                                            sx={{
                                                borderRadius: '10px',
                                                px: 2.5,
                                                py: 1,
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                backgroundColor: alpha('#718096', 0.1),
                                                color: '#718096',
                                                border: `1px solid ${alpha('#718096', 0.3)}`,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    backgroundColor: alpha('#718096', 0.2),
                                                    borderColor: '#718096',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(113, 128, 150, 0.3)',
                                                },
                                            }}
                                        >
                                            Archivar
                                        </Button>
                                        <Button
                                            size="medium"
                                            onClick={() => handleBulkAction('delete')}
                                            startIcon={<Delete />}
                                            sx={{
                                                borderRadius: '10px',
                                                px: 2.5,
                                                py: 1,
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                backgroundColor: alpha('#E53E3E', 0.1),
                                                color: '#E53E3E',
                                                border: `1px solid ${alpha('#E53E3E', 0.3)}`,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    backgroundColor: alpha('#E53E3E', 0.2),
                                                    borderColor: '#E53E3E',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(229, 62, 62, 0.3)',
                                                },
                                            }}
                                        >
                                            Eliminar
                                        </Button>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </motion.div>
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

                {/* Contact Request Drawer */}
                <ContactRequestDrawer
                    request={selectedRequest}
                    attachments={selectedRequest?.attachments || []}
                    open={detailsDialog}
                    onClose={() => {
                        setDetailsDialog(false);
                        setSelectedRequest(null);
                        // Reload list to reflect any changes
                        router.reload({ only: ['requests'] });
                    }}
                />

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
        </AdminLayoutNew>
    );
}
