import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';
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
    Switch,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    useTheme,
    alpha,
    Tooltip,
    Badge
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    DragIndicator as DragIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ServicesIndex = ({ services }) => {
    const theme = useTheme();
    const [deleteDialog, setDeleteDialog] = useState({ open: false, service: null });
    const [draggedItem, setDraggedItem] = useState(null);

    const handleDelete = (service) => {
        setDeleteDialog({ open: true, service });
    };

    const confirmDelete = () => {
        if (deleteDialog.service) {
            router.delete(`/admin/services/${deleteDialog.service.id}`, {
                onSuccess: () => {
                    setDeleteDialog({ open: false, service: null });
                }
            });
        }
    };

    const toggleStatus = (service) => {
        router.post(`/admin/services/${service.id}/toggle-status`, {}, {
            preserveScroll: true
        });
    };

    const toggleFeatured = (service) => {
        router.post(`/admin/services/${service.id}/toggle-featured`, {}, {
            preserveScroll: true
        });
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <AdminLayoutNew title="Gestión de Servicios">
            <Head title="Servicios - Dashboard" />
            
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" gutterBottom fontWeight="bold">
                            Servicios
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Gestiona los servicios que aparecen en tu sitio web
                        </Typography>
                    </Box>
                    
                    <Button
                        component={Link}
                        href="/admin/services/create"
                        variant="contained"
                        startIcon={<AddIcon />}
                        size="large"
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1.5,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 600
                        }}
                    >
                        Nuevo Servicio
                    </Button>
                </Box>

                {/* Estadísticas rápidas */}
                <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, mb: 4 }}>
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            backdropFilter: 'blur(14px)',
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`
                        }}
                    >
                        <Typography variant="h3" color="primary" fontWeight="bold">
                            {services.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total Servicios
                        </Typography>
                    </Paper>

                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            backdropFilter: 'blur(14px)',
                            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                            boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.12)}`
                        }}
                    >
                        <Typography variant="h3" color="success.main" fontWeight="bold">
                            {services.filter(s => s.is_active).length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Activos
                        </Typography>
                    </Paper>

                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            backdropFilter: 'blur(14px)',
                            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                            boxShadow: `0 8px 24px ${alpha(theme.palette.warning.main, 0.12)}`
                        }}
                    >
                        <Typography variant="h3" color="warning.main" fontWeight="bold">
                            {services.filter(s => s.featured).length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Destacados en Home
                        </Typography>
                    </Paper>
                </Box>
            </Box>

            {/* Tabla de servicios */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', background: alpha(theme.palette.background.paper, 0.6), backdropFilter: 'blur(10px)', border: `1px solid ${alpha(theme.palette.divider, 0.12)}`, boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}` }}>
                <TableContainer sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                    <Table>
                        <TableHead sx={{ '& th': { position: 'sticky', top: 0, zIndex: 2, background: alpha(theme.palette.background.paper, 0.85), backdropFilter: 'blur(6px)' } }}>
                            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                                <TableCell>Orden</TableCell>
                                <TableCell>Servicio</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>En Home</TableCell>
                                <TableCell>Fecha</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {services.map((service, index) => (
                                <TableRow
                                    key={service.id}
                                    component={motion.tr}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    sx={{
                                        backgroundColor: index % 2 ? alpha(theme.palette.action.hover, 0.04) : 'transparent',
                                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.06) }
                                    }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <DragIcon sx={{ color: 'text.disabled', cursor: 'grab' }} />
                                            <Chip
                                                label={service.sort_order}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="600">
                                                {service.title}
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                color="text.secondary"
                                                sx={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 1,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {service.excerpt}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Switch
                                                checked={service.is_active}
                                                onChange={() => toggleStatus(service)}
                                                size="small"
                                            />
                                            <Chip
                                                label={service.is_active ? 'Activo' : 'Inactivo'}
                                                color={service.is_active ? 'success' : 'default'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Tooltip title={service.featured ? 'Quitar del Home' : 'Mostrar en Home'}>
                                            <IconButton
                                                onClick={() => toggleFeatured(service)}
                                                color={service.featured ? 'warning' : 'default'}
                                            >
                                                {service.featured ? <StarIcon /> : <StarBorderIcon />}
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatDate(service.created_at)}
                                        </Typography>
                                    </TableCell>
                                    
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                            <Tooltip title="Ver servicio">
                                                <IconButton
                                                    component={Link}
                                                    href={`/servicios/${service.slug}`}
                                                    target="_blank"
                                                    size="small"
                                                    color="primary"
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                            
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    component={Link}
                                                    href={`/admin/services/${service.id}/edit`}
                                                    size="small"
                                                    color="primary"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            
                                            <Tooltip title="Eliminar">
                                                <IconButton
                                                    onClick={() => handleDelete(service)}
                                                    size="small"
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {services.length === 0 && (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No hay servicios registrados
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Comienza creando tu primer servicio
                        </Typography>
                        <Button
                            component={Link}
                            href="/admin/services/create"
                            variant="contained"
                            startIcon={<AddIcon />}
                        >
                            Crear Primer Servicio
                        </Button>
                    </Box>
                )}
            </Paper>

            {/* Dialog de confirmación para eliminar */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, service: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    ¿Eliminar servicio?
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Estás seguro de que quieres eliminar el servicio "{deleteDialog.service?.title}"? 
                        Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button 
                        onClick={() => setDeleteDialog({ open: false, service: null })}
                        variant="outlined"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={confirmDelete}
                        variant="contained"
                        color="error"
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayoutNew>
    );
};

export default ServicesIndex;