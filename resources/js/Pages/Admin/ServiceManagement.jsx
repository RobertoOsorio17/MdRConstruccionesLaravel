import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Checkbox,
    IconButton,
    Menu,
    Chip,
    Avatar,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    alpha,
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as PersonAddIcon,
    Download as DownloadIcon,
    MoreVert as MoreVertIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    TrendingUp as TrendingUpIcon,
    CheckCircle as ActiveIcon,
    Cancel as InactiveIcon,
    Star as FeaturedIcon,
    Visibility as ViewsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import AdminLayoutNew from '../../Layouts/AdminLayoutNew';

const ServiceManagement = ({ services, categories, stats, filters, flash }) => {
    // State management
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [featuredFilter, setFeaturedFilter] = useState(filters.featured || '');
    const [selectedServices, setSelectedServices] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [bulkActionDialog, setBulkActionDialog] = useState(false);
    const [bulkAction, setBulkAction] = useState('');

    // Glassmorphism styles
    const glassmorphismCard = {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    };

    const glassmorphismStatCard = {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
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

    // Handle search
    const handleSearch = (value) => {
        setSearchTerm(value);
        router.get(route('admin.services.index'), { // ✅ Fixed route name
            ...filters,
            search: value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Handle filters
    const handleFilter = (filterType, value) => {
        const newFilters = { ...filters };
        newFilters[filterType] = value;
        
        if (filterType === 'category') setCategoryFilter(value);
        if (filterType === 'status') setStatusFilter(value);
        if (filterType === 'featured') setFeaturedFilter(value);

        router.get(route('admin.services.index'), newFilters, { // ✅ Fixed route name
            preserveState: true,
            replace: true,
        });
    };

    // Handle service selection
    const handleSelectService = (serviceId) => {
        setSelectedServices(prev => 
            prev.includes(serviceId) 
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedServices(services.data.map(service => service.id));
        } else {
            setSelectedServices([]);
        }
    };

    // Handle menu actions
    const handleMenuClick = (event, service) => {
        setAnchorEl(event.currentTarget);
        setSelectedService(service);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedService(null);
    };

    // Handle service actions
    const handleViewService = (service) => {
        router.visit(route('admin.services.show', service.id)); // ✅ Fixed route name
        handleMenuClose();
    };

    const handleEditService = (service) => {
        router.visit(route('admin.services.edit', service.id)); // ✅ Fixed route name
        handleMenuClose();
    };

    const handleDeleteService = (service) => {
        setServiceToDelete(service);
        setDeleteDialog(true);
        handleMenuClose();
    };

    const confirmDelete = () => {
        if (serviceToDelete) {
            router.delete(route('admin.services.destroy', serviceToDelete.id), { // ✅ Fixed route name
                onSuccess: () => {
                    setDeleteDialog(false);
                    setServiceToDelete(null);
                }
            });
        }
    };

    // Handle bulk actions
    const handleBulkAction = () => {
        if (selectedServices.length === 0) return;
        setBulkActionDialog(true);
    };

    const executeBulkAction = () => {
        router.post(route('admin.services.bulk-action'), { // ✅ Fixed route name
            action: bulkAction,
            service_ids: selectedServices,
        }, {
            onSuccess: () => {
                setBulkActionDialog(false);
                setBulkAction('');
                setSelectedServices([]);
            }
        });
    };

    // Helper functions
    const getStatusColor = (isActive) => {
        return isActive ? '#48BB78' : '#F56565';
    };

    const getStatusIcon = (isActive) => {
        return isActive ? <ActiveIcon sx={{ fontSize: 16 }} /> : <InactiveIcon sx={{ fontSize: 16 }} />;
    };

    const formatPrice = (price, priceType) => {
        if (!price) return 'Consultar';
        const formattedPrice = new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
        
        switch (priceType) {
            case 'hourly': return `${formattedPrice}/hora`;
            case 'project': return `${formattedPrice}/proyecto`;
            case 'quote': return 'Presupuesto';
            default: return formattedPrice;
        }
    };

    return (
        <AdminLayoutNew>
            <Head title="Gestión de Servicios" />
            
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ padding: '24px' }}
            >
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2D3748', mb: 1 }}>
                                Gestión de Servicios
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#718096' }}>
                                Administra servicios, categorías y configuraciones del sistema
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<PersonAddIcon />}
                            onClick={() => router.visit(route('admin.services.create'))} // ✅ Fixed route name
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                py: 1.5,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.6)',
                                },
                            }}
                        >
                            Nuevo Servicio
                        </Button>
                    </Box>
                </motion.div>

                {/* Statistics Cards */}
                <motion.div variants={itemVariants}>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={glassmorphismStatCard}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <TrendingUpIcon sx={{ fontSize: 32, color: '#667eea', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2D3748' }}>
                                                {stats.total_services}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#718096', fontWeight: 500 }}>
                                                Total Servicios
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#48BB78' }}>
                                        {stats.total_services} servicios registrados
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={glassmorphismStatCard}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <InactiveIcon sx={{ fontSize: 32, color: '#F56565', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2D3748' }}>
                                                {stats.inactive_services}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#718096', fontWeight: 500 }}>
                                                Servicios Inactivos
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#F56565' }}>
                                        {Math.round((stats.inactive_services / stats.total_services) * 100)}% del total
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={glassmorphismStatCard}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <FeaturedIcon sx={{ fontSize: 32, color: '#ED8936', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2D3748' }}>
                                                {stats.featured_services}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#718096', fontWeight: 500 }}>
                                                Servicios Destacados
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#ED8936' }}>
                                        {Math.round((stats.featured_services / stats.total_services) * 100)}% del total
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </motion.div>

                {/* Filters and Search */}
                <motion.div variants={itemVariants}>
                    <Card sx={{ ...glassmorphismCard, mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        placeholder="Buscar servicios..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ color: '#718096' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <FormControl fullWidth>
                                        <InputLabel>Categoría</InputLabel>
                                        <Select
                                            value={categoryFilter}
                                            label="Categoría"
                                            onChange={(e) => handleFilter('category', e.target.value)}
                                            sx={{
                                                borderRadius: '12px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            }}
                                        >
                                            <MenuItem value="">Todas</MenuItem>
                                            {categories.map(category => (
                                                <MenuItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <FormControl fullWidth>
                                        <InputLabel>Estado</InputLabel>
                                        <Select
                                            value={statusFilter}
                                            label="Estado"
                                            onChange={(e) => handleFilter('status', e.target.value)}
                                            sx={{
                                                borderRadius: '12px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            }}
                                        >
                                            <MenuItem value="">Todos</MenuItem>
                                            <MenuItem value="active">Activos</MenuItem>
                                            <MenuItem value="inactive">Inactivos</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <FormControl fullWidth>
                                        <InputLabel>Destacado</InputLabel>
                                        <Select
                                            value={featuredFilter}
                                            label="Destacado"
                                            onChange={(e) => handleFilter('featured', e.target.value)}
                                            sx={{
                                                borderRadius: '12px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            }}
                                        >
                                            <MenuItem value="">Todos</MenuItem>
                                            <MenuItem value="yes">Destacados</MenuItem>
                                            <MenuItem value="no">No Destacados</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                        {selectedServices.length > 0 && (
                                            <Button
                                                variant="outlined"
                                                onClick={handleBulkAction}
                                                sx={{
                                                    borderRadius: '12px',
                                                    textTransform: 'none',
                                                    borderColor: '#667eea',
                                                    color: '#667eea',
                                                }}
                                            >
                                                Acciones ({selectedServices.length})
                                            </Button>
                                        )}
                                        <Button
                                            variant="outlined"
                                            startIcon={<DownloadIcon />}
                                            onClick={() => router.visit(route('admin.services.export', filters))} // ✅ Fixed route name
                                            sx={{
                                                borderRadius: '12px',
                                                textTransform: 'none',
                                                borderColor: '#48BB78',
                                                color: '#48BB78',
                                            }}
                                        >
                                            Exportar
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Services Table */}
                <motion.div variants={itemVariants}>
                    <Card sx={glassmorphismCard}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={selectedServices.length > 0 && selectedServices.length < services.data.length}
                                                checked={services.data.length > 0 && selectedServices.length === services.data.length}
                                                onChange={handleSelectAll}
                                            />
                                        </TableCell>
                                        <TableCell>Servicio</TableCell>
                                        <TableCell>Categoría</TableCell>
                                        <TableCell>Precio</TableCell>
                                        <TableCell>Estado</TableCell>
                                        <TableCell>Destacado</TableCell>
                                        <TableCell>Vistas</TableCell>
                                        <TableCell align="center">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {services.data.map((service) => (
                                        <TableRow
                                            key={service.id}
                                            hover
                                            selected={selectedServices.includes(service.id)}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                }
                                            }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedServices.includes(service.id)}
                                                    onChange={() => handleSelectService(service.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar
                                                        src={service.image_url}
                                                        sx={{ width: 50, height: 50, borderRadius: '12px' }}
                                                        variant="rounded"
                                                    >
                                                        {service.title.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#2D3748' }}>
                                                            {service.title}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#718096' }}>
                                                            {service.excerpt?.substring(0, 50)}...
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={service.category?.name || 'Sin categoría'}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: alpha('#667eea', 0.1),
                                                        color: '#667eea',
                                                        fontWeight: 500,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: '#4A5568', fontWeight: 500 }}>
                                                    {service.price ? `€${service.price}` : 'Consultar'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {getStatusIcon(service.is_active)}
                                                    <Chip
                                                        label={service.is_active ? 'Activo' : 'Inactivo'}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: alpha(getStatusColor(service.is_active), 0.1),
                                                            color: getStatusColor(service.is_active),
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {service.featured && <FeaturedIcon sx={{ fontSize: 16, color: '#ED8936' }} />}
                                                    <Chip
                                                        label={service.featured ? 'Sí' : 'No'}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: service.featured
                                                                ? alpha('#ED8936', 0.1)
                                                                : alpha('#718096', 0.1),
                                                            color: service.featured ? '#ED8936' : '#718096',
                                                            fontWeight: 500,
                                                        }}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <ViewsIcon sx={{ fontSize: 16, color: '#718096' }} />
                                                    <Typography variant="body2" sx={{ color: '#4A5568' }}>
                                                        {service.views_count || 0}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    onClick={(e) => handleMenuClick(e, service)}
                                                    sx={{ color: '#718096' }}
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <TablePagination
                            component="div"
                            count={services.total}
                            page={services.current_page - 1}
                            onPageChange={(e, page) => {
                                router.get(route('admin.services.index'), { // ✅ Fixed route name
                                    ...filters,
                                    page: page + 1,
                                });
                            }}
                            rowsPerPage={services.per_page}
                            onRowsPerPageChange={(e) => {
                                router.get(route('admin.services.index'), { // ✅ Fixed route name
                                    ...filters,
                                    per_page: e.target.value,
                                });
                            }}
                            rowsPerPageOptions={[10, 15, 25, 50]}
                            labelRowsPerPage="Filas por página:"
                            labelDisplayedRows={({ from, to, count }) =>
                                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                            }
                        />
                    </Card>
                </motion.div>

                {/* Context Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                        sx: {
                            ...glassmorphismCard,
                            minWidth: 160,
                        }
                    }}
                >
                    <MenuItem onClick={() => handleViewService(selectedService)}>
                        <ViewIcon sx={{ mr: 1, fontSize: 18 }} />
                        Ver Detalles
                    </MenuItem>
                    <MenuItem onClick={() => handleEditService(selectedService)}>
                        <EditIcon sx={{ mr: 1, fontSize: 18 }} />
                        Editar
                    </MenuItem>
                    <MenuItem
                        onClick={() => handleDeleteService(selectedService)}
                        sx={{ color: '#E53E3E' }}
                    >
                        <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
                        Eliminar
                    </MenuItem>
                </Menu>

                {/* Bulk Action Dialog */}
                <Dialog
                    open={bulkActionDialog}
                    onClose={() => setBulkActionDialog(false)}
                    PaperProps={{
                        sx: {
                            ...glassmorphismCard,
                            minWidth: 400,
                        }
                    }}
                >
                    <DialogTitle>
                        Acción en Lote
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" sx={{ mb: 2, color: '#718096' }}>
                            Selecciona una acción para aplicar a {selectedServices.length} servicios seleccionados:
                        </Typography>
                        <FormControl fullWidth>
                            <InputLabel>Acción</InputLabel>
                            <Select
                                value={bulkAction}
                                label="Acción"
                                onChange={(e) => setBulkAction(e.target.value)}
                                sx={{ borderRadius: '12px' }}
                            >
                                <MenuItem value="activate">Activar Servicios</MenuItem>
                                <MenuItem value="deactivate">Desactivar Servicios</MenuItem>
                                <MenuItem value="feature">Marcar como Destacados</MenuItem>
                                <MenuItem value="unfeature">Desmarcar como Destacados</MenuItem>
                                <MenuItem value="delete" sx={{ color: '#E53E3E' }}>
                                    Eliminar Servicios
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setBulkActionDialog(false)}
                            sx={{ textTransform: 'none' }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={executeBulkAction}
                            variant="contained"
                            disabled={!bulkAction}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                background: bulkAction === 'delete'
                                    ? 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            }}
                        >
                            Ejecutar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteDialog}
                    onClose={() => setDeleteDialog(false)}
                    PaperProps={{
                        sx: {
                            ...glassmorphismCard,
                            minWidth: 400,
                        }
                    }}
                >
                    <DialogTitle sx={{ color: '#E53E3E' }}>
                        Confirmar Eliminación
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body1">
                            ¿Estás seguro de que deseas eliminar el servicio{' '}
                            <strong>{serviceToDelete?.title}</strong>?
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, color: '#718096' }}>
                            Esta acción no se puede deshacer y eliminará también la imagen asociada.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setDeleteDialog(false)}
                            sx={{ textTransform: 'none' }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            variant="contained"
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)',
                            }}
                        >
                            Eliminar
                        </Button>
                    </DialogActions>
                </Dialog>
            </motion.div>
        </AdminLayoutNew>
    );
};

export default ServiceManagement;
