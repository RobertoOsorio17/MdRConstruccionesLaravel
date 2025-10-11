import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Menu,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    InputAdornment,
    Alert,
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    GetApp as ExportIcon,
    Work as ProjectIcon,
    CheckCircle as CompletedIcon,
    Schedule as DraftIcon,
    Publish as PublishedIcon,
    Star as FeaturedIcon,
    LocationOn as LocationIcon,
    Euro as EuroIcon,
    CalendarToday as CalendarIcon,
    Visibility as ViewsIcon,
} from '@mui/icons-material';
import AdminLayoutNew from '../../Layouts/AdminLayoutNew';

const ProjectManagement = () => {
    const { projects, stats, filters, sort, flash } = usePage().props;
    
    // State management
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [featuredFilter, setFeaturedFilter] = useState(filters.featured || '');
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [bulkActionDialog, setBulkActionDialog] = useState(false);
    const [bulkAction, setBulkAction] = useState('');
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    // Glassmorphism styles
    const glassmorphismCard = {
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    };

    const glassmorphismStatCard = {
        ...glassmorphismCard,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.5)',
        },
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 },
        },
    };

    // Handle search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleFilter('search', search);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search]);

    // Filter and search functions
    const handleFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        if (!value) delete newFilters[key];

        router.get(route('admin.projects.index'), newFilters, { // ✅ Fixed route name
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSort = (field) => {
        const direction = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.projects.index'), { ...filters, sort: field, direction }, { // ✅ Fixed route name
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Selection functions
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedProjects(projects.data.map(project => project.id));
        } else {
            setSelectedProjects([]);
        }
    };

    const handleSelectProject = (projectId) => {
        setSelectedProjects(prev => 
            prev.includes(projectId) 
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        );
    };

    // Menu functions
    const handleMenuClick = (event, project) => {
        setAnchorEl(event.currentTarget);
        setSelectedProject(project);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedProject(null);
    };

    // Action functions
    const handleViewProject = (project) => {
        window.open(`/projects/${project.slug}`, '_blank');
        handleMenuClose();
    };

    const handleEditProject = (project) => {
        // TODO: Implement edit functionality
        console.log('Edit project:', project);
        handleMenuClose();
    };

    const handleDeleteProject = (project) => {
        setProjectToDelete(project);
        setDeleteDialog(true);
        handleMenuClose();
    };

    const confirmDelete = () => {
        if (projectToDelete) {
            router.delete(route('admin.projects.destroy', projectToDelete.id), { // ✅ Fixed route name
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteDialog(false);
                    setProjectToDelete(null);
                },
            });
        }
    };

    // Bulk actions
    const handleBulkAction = () => {
        if (selectedProjects.length > 0) {
            setBulkActionDialog(true);
        }
    };

    const executeBulkAction = () => {
        if (bulkAction && selectedProjects.length > 0) {
            router.post(route('admin.projects.bulk-action'), { // ✅ Fixed route name
                action: bulkAction,
                project_ids: selectedProjects,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setBulkActionDialog(false);
                    setBulkAction('');
                    setSelectedProjects([]);
                },
            });
        }
    };

    // Export function
    const handleExport = () => {
        window.location.href = route('admin.projects.export', filters); // ✅ Fixed route name
    };

    // Pagination
    const handleChangePage = (event, newPage) => {
        router.get(route('admin.projects.index'), { // ✅ Fixed route name
            ...filters,
            page: newPage + 1,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleChangeRowsPerPage = (event) => {
        router.get(route('admin.projects.index'), { // ✅ Fixed route name
            ...filters,
            per_page: event.target.value,
            page: 1,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Helper functions
    const getStatusIcon = (status) => {
        switch (status) {
            case 'draft': return <DraftIcon sx={{ fontSize: 18, color: '#F59E0B' }} />;
            case 'published': return <PublishedIcon sx={{ fontSize: 18, color: '#10B981' }} />;
            case 'completed': return <CompletedIcon sx={{ fontSize: 18, color: '#3B82F6' }} />;
            default: return <DraftIcon sx={{ fontSize: 18, color: '#6B7280' }} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return '#F59E0B';
            case 'published': return '#10B981';
            case 'completed': return '#3B82F6';
            default: return '#6B7280';
        }
    };

    const formatPrice = (price) => {
        if (!price) return 'No especificado';
        return `€${parseFloat(price).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
    };

    return (
        <AdminLayoutNew>
            <Head title="Gestión de Proyectos" />
            
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ padding: '24px' }}
            >
                {/* Flash Messages */}
                <AnimatePresence>
                    {flash?.success && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            style={{ marginBottom: '24px' }}
                        >
                            <Alert severity="success" sx={{ borderRadius: '12px' }}>
                                {flash.success}
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <motion.div variants={itemVariants} style={{ marginBottom: '32px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A202C', mb: 1 }}>
                                Gestión de Proyectos
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#718096' }}>
                                Administra proyectos, estados y configuraciones del sistema
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 4px 15px 0 rgba(102, 126, 234, 0.4)',
                                '&:hover': {
                                    boxShadow: '0 6px 20px 0 rgba(102, 126, 234, 0.6)',
                                },
                            }}
                        >
                            Nuevo Proyecto
                        </Button>
                    </Box>
                </motion.div>

                {/* Statistics Cards */}
                <motion.div variants={itemVariants} style={{ marginBottom: '32px' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={glassmorphismStatCard}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <ProjectIcon sx={{ fontSize: 32, color: '#667eea', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2D3748' }}>
                                                {stats.total_projects}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#718096', fontWeight: 500 }}>
                                                Total Proyectos
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#667eea' }}>
                                        {stats.total_projects} proyectos registrados
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={glassmorphismStatCard}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <CompletedIcon sx={{ fontSize: 32, color: '#48BB78', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2D3748' }}>
                                                {stats.completed_projects}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#718096', fontWeight: 500 }}>
                                                Proyectos Completados
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#48BB78' }}>
                                        {stats.total_projects > 0 ? Math.round((stats.completed_projects / stats.total_projects) * 100) : 0}% del total
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
                                                {stats.featured_projects}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#718096', fontWeight: 500 }}>
                                                Proyectos Destacados
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#ED8936' }}>
                                        {stats.total_projects > 0 ? Math.round((stats.featured_projects / stats.total_projects) * 100) : 0}% del total
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={glassmorphismStatCard}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <EuroIcon sx={{ fontSize: 32, color: '#38B2AC', mr: 2 }} />
                                        <Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2D3748' }}>
                                                €{stats.total_budget ? parseFloat(stats.total_budget).toLocaleString('es-ES', { maximumFractionDigits: 0 }) : '0'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#718096', fontWeight: 500 }}>
                                                Presupuesto Total
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#38B2AC' }}>
                                        Valor total de proyectos
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </motion.div>

                {/* Filters and Search */}
                <motion.div variants={itemVariants} style={{ marginBottom: '24px' }}>
                    <Card sx={glassmorphismCard}>
                        <CardContent sx={{ p: 3 }}>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        placeholder="Buscar proyectos..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
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
                                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            },
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <FormControl fullWidth>
                                        <InputLabel>Estado</InputLabel>
                                        <Select
                                            value={statusFilter}
                                            label="Estado"
                                            onChange={(e) => {
                                                setStatusFilter(e.target.value);
                                                handleFilter('status', e.target.value);
                                            }}
                                            sx={{ borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                                        >
                                            <MenuItem value="">Todos</MenuItem>
                                            <MenuItem value="draft">Borrador</MenuItem>
                                            <MenuItem value="published">Publicado</MenuItem>
                                            <MenuItem value="completed">Completado</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <FormControl fullWidth>
                                        <InputLabel>Destacado</InputLabel>
                                        <Select
                                            value={featuredFilter}
                                            label="Destacado"
                                            onChange={(e) => {
                                                setFeaturedFilter(e.target.value);
                                                handleFilter('featured', e.target.value);
                                            }}
                                            sx={{ borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                                        >
                                            <MenuItem value="">Todos</MenuItem>
                                            <MenuItem value="true">Destacados</MenuItem>
                                            <MenuItem value="false">No Destacados</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    {selectedProjects.length > 0 && (
                                        <Button
                                            variant="outlined"
                                            onClick={handleBulkAction}
                                            sx={{
                                                borderRadius: '12px',
                                                textTransform: 'none',
                                                borderColor: '#667eea',
                                                color: '#667eea',
                                                '&:hover': {
                                                    borderColor: '#764ba2',
                                                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                                },
                                            }}
                                        >
                                            Acciones ({selectedProjects.length})
                                        </Button>
                                    )}
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<ExportIcon />}
                                        onClick={handleExport}
                                        sx={{
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            borderColor: '#48BB78',
                                            color: '#48BB78',
                                            '&:hover': {
                                                borderColor: '#38A169',
                                                backgroundColor: 'rgba(72, 187, 120, 0.1)',
                                            },
                                        }}
                                    >
                                        Exportar
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Projects Table */}
                <motion.div variants={itemVariants}>
                    <Card sx={glassmorphismCard}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={selectedProjects.length > 0 && selectedProjects.length < projects.data.length}
                                                checked={projects.data.length > 0 && selectedProjects.length === projects.data.length}
                                                onChange={handleSelectAll}
                                                sx={{ color: '#667eea' }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#2D3748' }}>Proyecto</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#2D3748' }}>Ubicación</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#2D3748' }}>Presupuesto</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#2D3748' }}>Estado</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#2D3748' }}>Destacado</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#2D3748' }}>Fechas</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#2D3748' }}>Vistas</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#2D3748' }}>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {projects.data.map((project) => (
                                        <TableRow key={project.id} hover>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedProjects.includes(project.id)}
                                                    onChange={() => handleSelectProject(project.id)}
                                                    sx={{ color: '#667eea' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Box
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: '8px',
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            mr: 2,
                                                        }}
                                                    >
                                                        {project.title.charAt(0).toUpperCase()}
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#2D3748' }}>
                                                            {project.title}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#718096' }}>
                                                            {project.summary.length > 50 ? `${project.summary.substring(0, 50)}...` : project.summary}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <LocationIcon sx={{ fontSize: 16, color: '#718096', mr: 1 }} />
                                                    <Typography variant="body2" sx={{ color: '#4A5568' }}>
                                                        {project.location || 'No especificada'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#2D3748' }}>
                                                    {project.budget_formatted}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={getStatusIcon(project.status)}
                                                    label={project.status_label}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: `${getStatusColor(project.status)}20`,
                                                        color: getStatusColor(project.status),
                                                        fontWeight: 500,
                                                        border: `1px solid ${getStatusColor(project.status)}40`,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={project.featured ? 'Sí' : 'No'}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: project.featured ? '#ED893620' : '#E2E8F020',
                                                        color: project.featured ? '#ED8936' : '#718096',
                                                        fontWeight: 500,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: '#718096', display: 'block' }}>
                                                        Inicio: {project.start_date || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#718096', display: 'block' }}>
                                                        Fin: {project.end_date || 'N/A'}
                                                    </Typography>
                                                    {project.duration_days && (
                                                        <Typography variant="caption" sx={{ color: '#667eea', display: 'block' }}>
                                                            {project.duration_days} días
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <ViewsIcon sx={{ fontSize: 16, color: '#718096', mr: 1 }} />
                                                    <Typography variant="body2" sx={{ color: '#4A5568', fontWeight: 500 }}>
                                                        {project.views_count}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    onClick={(e) => handleMenuClick(e, project)}
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
                        <TablePagination
                            component="div"
                            count={projects.total}
                            page={projects.current_page - 1}
                            onPageChange={handleChangePage}
                            rowsPerPage={projects.per_page}
                            onRowsPerPageChange={handleChangeRowsPerPage}
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
                    <MenuItem onClick={() => handleViewProject(selectedProject)}>
                        <ViewIcon sx={{ mr: 1, fontSize: 18 }} />
                        Ver Proyecto
                    </MenuItem>
                    <MenuItem onClick={() => handleEditProject(selectedProject)}>
                        <EditIcon sx={{ mr: 1, fontSize: 18 }} />
                        Editar
                    </MenuItem>
                    <MenuItem
                        onClick={() => handleDeleteProject(selectedProject)}
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
                            Selecciona una acción para aplicar a {selectedProjects.length} proyectos seleccionados:
                        </Typography>
                        <FormControl fullWidth>
                            <InputLabel>Acción</InputLabel>
                            <Select
                                value={bulkAction}
                                label="Acción"
                                onChange={(e) => setBulkAction(e.target.value)}
                                sx={{ borderRadius: '12px' }}
                            >
                                <MenuItem value="publish">Publicar Proyectos</MenuItem>
                                <MenuItem value="draft">Marcar como Borrador</MenuItem>
                                <MenuItem value="complete">Marcar como Completados</MenuItem>
                                <MenuItem value="feature">Marcar como Destacados</MenuItem>
                                <MenuItem value="unfeature">Desmarcar como Destacados</MenuItem>
                                <MenuItem value="delete" sx={{ color: '#E53E3E' }}>
                                    Eliminar Proyectos
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
                            ¿Estás seguro de que deseas eliminar el proyecto{' '}
                            <strong>{projectToDelete?.title}</strong>?
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, color: '#718096' }}>
                            Esta acción no se puede deshacer y eliminará también las imágenes asociadas.
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

export default ProjectManagement;
