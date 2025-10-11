import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Download as DownloadIcon,
    MoreVert as MoreVertIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Work as ProjectIcon,
    CheckCircle as CompletedIcon,
    Schedule as InProgressIcon,
    Pause as PausedIcon,
    Cancel as CancelledIcon,
    LocationOn as LocationIcon,
    Euro as EuroIcon,
    CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ProjectsIndex = ({ projects, filters }) => {
    const theme = useTheme();
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [actionMenu, setActionMenu] = useState({ open: false, anchorEl: null, project: null });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, project: null });
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [featuredFilter, setFeaturedFilter] = useState(filters.featured || '');

    const handleSearch = (value) => {
        setSearchTerm(value);
        router.get(route('admin.projects.index'), {
            ...filters,
            search: value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        router.get(route('admin.projects.index'), {
            ...filters,
            status: status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFeaturedFilter = (featured) => {
        setFeaturedFilter(featured);
        router.get(route('admin.projects.index'), {
            ...filters,
            featured: featured,
        }, {
            preserveState: true,
            replace: true,
        });
    };

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

    const handleActionMenu = (event, project) => {
        setActionMenu({ open: true, anchorEl: event.currentTarget, project });
    };

    const closeActionMenu = () => {
        setActionMenu({ open: false, anchorEl: null, project: null });
    };

    const handleDelete = (project) => {
        setDeleteDialog({ open: true, project });
        closeActionMenu();
    };

    const confirmDelete = () => {
        if (deleteDialog.project) {
            router.delete(route('admin.projects.destroy', deleteDialog.project.id), {
                onSuccess: () => {
                    setDeleteDialog({ open: false, project: null });
                }
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'primary';
            case 'paused': return 'warning';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CompletedIcon />;
            case 'in_progress': return <InProgressIcon />;
            case 'paused': return <PausedIcon />;
            case 'cancelled': return <CancelledIcon />;
            default: return <ProjectIcon />;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'completed': return 'Completado';
            case 'in_progress': return 'En Progreso';
            case 'paused': return 'Pausado';
            case 'cancelled': return 'Cancelado';
            case 'planning': return 'Planificación';
            default: return status;
        }
    };

    return (
        <AdminLayoutNew>
            <Head title="Gestión de Proyectos" />
            
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Gestión de Proyectos
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            sx={{
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            }}
                        >
                            Exportar
                        </Button>
                        <Button
                            component={Link}
                            href={route('admin.projects.create')}
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            }}
                        >
                            Nuevo Proyecto
                        </Button>
                    </Box>
                </Box>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card
                        sx={{
                            mb: 3,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            borderRadius: 3,
                        }}
                    >
                        <CardContent>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        placeholder="Buscar proyectos..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                                                backdropFilter: 'blur(10px)',
                                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            }
                                        }}
                                    />
                                </Grid>
                                
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Estado</InputLabel>
                                        <Select
                                            value={statusFilter}
                                            label="Estado"
                                            onChange={(e) => handleStatusFilter(e.target.value)}
                                            sx={{
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                                                backdropFilter: 'blur(10px)',
                                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            }}
                                        >
                                            <MenuItem value="">Todos</MenuItem>
                                            <MenuItem value="planning">Planificación</MenuItem>
                                            <MenuItem value="in_progress">En Progreso</MenuItem>
                                            <MenuItem value="paused">Pausado</MenuItem>
                                            <MenuItem value="completed">Completado</MenuItem>
                                            <MenuItem value="cancelled">Cancelado</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Destacado</InputLabel>
                                        <Select
                                            value={featuredFilter}
                                            label="Destacado"
                                            onChange={(e) => handleFeaturedFilter(e.target.value)}
                                            sx={{
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                                                backdropFilter: 'blur(10px)',
                                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            }}
                                        >
                                            <MenuItem value="">Todos</MenuItem>
                                            <MenuItem value="true">Destacados</MenuItem>
                                            <MenuItem value="false">No Destacados</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                
                                <Grid item xs={12} md={2}>
                                    <Typography variant="body2" color="text.secondary">
                                        {projects.total} proyecto{projects.total !== 1 ? 's' : ''} encontrado{projects.total !== 1 ? 's' : ''}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Projects Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card
                        sx={{
                            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            borderRadius: 3,
                            overflow: 'hidden',
                        }}
                    >
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={selectedProjects.length > 0 && selectedProjects.length < projects.data.length}
                                                checked={projects.data.length > 0 && selectedProjects.length === projects.data.length}
                                                onChange={handleSelectAll}
                                            />
                                        </TableCell>
                                        <TableCell>Proyecto</TableCell>
                                        <TableCell>Estado</TableCell>
                                        <TableCell>Ubicación</TableCell>
                                        <TableCell>Presupuesto</TableCell>
                                        <TableCell>Fechas</TableCell>
                                        <TableCell align="center">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {projects.data.map((project) => (
                                        <TableRow key={project.id} hover>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedProjects.includes(project.id)}
                                                    onChange={() => handleSelectProject(project.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        {project.title}
                                                        {project.featured && (
                                                            <Chip
                                                                label="Destacado"
                                                                size="small"
                                                                color="warning"
                                                                sx={{ ml: 1 }}
                                                            />
                                                        )}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {project.summary}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={getStatusIcon(project.status)}
                                                    label={getStatusLabel(project.status)}
                                                    color={getStatusColor(project.status)}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <LocationIcon fontSize="small" color="action" />
                                                    <Typography variant="body2">
                                                        {project.location || 'No especificada'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <EuroIcon fontSize="small" color="action" />
                                                    <Typography variant="body2">
                                                        {project.budget ? `${project.budget.toLocaleString()}€` : 'No especificado'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <CalendarIcon fontSize="small" color="action" />
                                                    <Typography variant="body2">
                                                        {project.start_date ? new Date(project.start_date).toLocaleDateString('es-ES') : 'No definida'}
                                                        {project.end_date && ` - ${new Date(project.end_date).toLocaleDateString('es-ES')}`}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    onClick={(e) => handleActionMenu(e, project)}
                                                    sx={{
                                                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.2)})`,
                                                        backdropFilter: 'blur(10px)',
                                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                                    }}
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
                            onPageChange={(e, page) => {
                                router.get(route('admin.projects.index'), {
                                    ...filters,
                                    page: page + 1,
                                });
                            }}
                            rowsPerPage={projects.per_page}
                            onRowsPerPageChange={(e) => {
                                router.get(route('admin.projects.index'), {
                                    ...filters,
                                    per_page: e.target.value,
                                });
                            }}
                        />
                    </Card>
                </motion.div>
            </Box>

            {/* Action Menu */}
            <Menu
                anchorEl={actionMenu.anchorEl}
                open={actionMenu.open}
                onClose={closeActionMenu}
                PaperProps={{
                    sx: {
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }
                }}
            >
                <MenuItem
                    component={Link}
                    href={actionMenu.project ? route('admin.projects.show', actionMenu.project.id) : '#'}
                    onClick={closeActionMenu}
                >
                    <ViewIcon sx={{ mr: 1 }} />
                    Ver Detalles
                </MenuItem>
                <MenuItem
                    component={Link}
                    href={actionMenu.project ? route('admin.projects.edit', actionMenu.project.id) : '#'}
                    onClick={closeActionMenu}
                >
                    <EditIcon sx={{ mr: 1 }} />
                    Editar
                </MenuItem>
                <MenuItem
                    onClick={() => handleDelete(actionMenu.project)}
                    sx={{ color: theme.palette.error.main }}
                >
                    <DeleteIcon sx={{ mr: 1 }} />
                    Eliminar
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, project: null })}
                PaperProps={{
                    sx: {
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }
                }}
            >
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Estás seguro de que deseas eliminar el proyecto "{deleteDialog.project?.title}"? 
                        Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, project: null })}>
                        Cancelar
                    </Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayoutNew>
    );
};

export default ProjectsIndex;
