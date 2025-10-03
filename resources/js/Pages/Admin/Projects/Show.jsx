import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Chip,
    Grid,
    Divider,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    LinearProgress,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
} from '@mui/lab';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    ArrowBack as BackIcon,
    Work as ProjectIcon,
    LocationOn as LocationIcon,
    Euro as EuroIcon,
    CalendarToday as DateIcon,
    CheckCircle as CompletedIcon,
    Schedule as InProgressIcon,
    Pause as PausedIcon,
    Cancel as CancelledIcon,
    Timeline as TimelineIcon,
    Image as ImageIcon,
    Description as DescriptionIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ProjectShow = ({ project, timeline = [] }) => {
    const theme = useTheme();
    const [deleteDialog, setDeleteDialog] = useState(false);

    const handleDelete = () => {
        router.delete(route('admin.projects.destroy', project.id), {
            onSuccess: () => {
                router.visit(route('admin.projects.index'));
            }
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'primary';
            case 'paused': return 'warning';
            case 'cancelled': return 'error';
            case 'planning': return 'info';
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

    const calculateProgress = () => {
        if (project.status === 'completed') return 100;
        if (project.status === 'cancelled') return 0;
        if (!project.start_date || !project.end_date) return 0;
        
        const start = new Date(project.start_date);
        const end = new Date(project.end_date);
        const now = new Date();
        
        if (now < start) return 0;
        if (now > end) return 100;
        
        const total = end - start;
        const elapsed = now - start;
        return Math.round((elapsed / total) * 100);
    };

    return (
        <AdminLayoutNew>
            <Head title={`Proyecto: ${project.title}`} />
            
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            component={Link}
                            href={route('admin.projects.index')}
                            sx={{
                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.2)})`,
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            }}
                        >
                            <BackIcon />
                        </IconButton>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            Detalles del Proyecto
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            component={Link}
                            href={route('admin.projects.edit', project.id)}
                            variant="contained"
                            startIcon={<EditIcon />}
                            sx={{
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            }}
                        >
                            Editar
                        </Button>
                        <Button
                            onClick={() => setDeleteDialog(true)}
                            variant="outlined"
                            startIcon={<DeleteIcon />}
                            color="error"
                            sx={{
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                            }}
                        >
                            Eliminar
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Main Content */}
                    <Grid item xs={12} md={8}>
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
                                    overflow: 'hidden',
                                }}
                            >
                                {project.images && project.images.length > 0 && (
                                    <CardMedia
                                        component="img"
                                        height="300"
                                        image={project.images[0]}
                                        alt={project.title}
                                        sx={{
                                            objectFit: 'cover',
                                        }}
                                    />
                                )}
                                
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                                            {project.title}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Chip
                                                icon={getStatusIcon(project.status)}
                                                label={getStatusLabel(project.status)}
                                                color={getStatusColor(project.status)}
                                                variant="outlined"
                                            />
                                            {project.featured && (
                                                <Chip
                                                    label="Destacado"
                                                    color="warning"
                                                    variant="filled"
                                                />
                                            )}
                                        </Box>
                                    </Box>

                                    {project.summary && (
                                        <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                                            {project.summary}
                                        </Typography>
                                    )}

                                    {/* Progress Bar */}
                                    <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Progreso del Proyecto
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {calculateProgress()}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={calculateProgress()}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 4,
                                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                        {project.description}
                                    </Typography>

                                    {project.technologies && project.technologies.length > 0 && (
                                        <>
                                            <Divider sx={{ my: 3 }} />
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                                Tecnologías Utilizadas
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {project.technologies.map((tech, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={tech}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                ))}
                                            </Box>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Timeline */}
                            {timeline && timeline.length > 0 && (
                                <Card
                                    sx={{
                                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                                        backdropFilter: 'blur(20px)',
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        borderRadius: 3,
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TimelineIcon />
                                            Cronología del Proyecto
                                        </Typography>
                                        
                                        <Timeline>
                                            {timeline.map((event, index) => (
                                                <TimelineItem key={index}>
                                                    <TimelineSeparator>
                                                        <TimelineDot color={event.type === 'milestone' ? 'primary' : 'secondary'} />
                                                        {index < timeline.length - 1 && <TimelineConnector />}
                                                    </TimelineSeparator>
                                                    <TimelineContent>
                                                        <Typography variant="h6" component="span">
                                                            {event.title}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {new Date(event.date).toLocaleDateString('es-ES')}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {event.description}
                                                        </Typography>
                                                    </TimelineContent>
                                                </TimelineItem>
                                            ))}
                                        </Timeline>
                                    </CardContent>
                                </Card>
                            )}
                        </motion.div>
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md={4}>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {/* Project Info */}
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
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                        Información del Proyecto
                                    </Typography>
                                    
                                    <List>
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemIcon>
                                                <LocationIcon color="primary" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Ubicación" 
                                                secondary={project.location || 'No especificada'}
                                            />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemIcon>
                                                <EuroIcon color="success" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Presupuesto" 
                                                secondary={project.budget ? `${project.budget.toLocaleString()}€` : 'No especificado'}
                                            />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemIcon>
                                                <DateIcon color="info" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Fecha de Inicio" 
                                                secondary={project.start_date ? new Date(project.start_date).toLocaleDateString('es-ES') : 'No definida'}
                                            />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemIcon>
                                                <DateIcon color="warning" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Fecha de Finalización" 
                                                secondary={project.end_date ? new Date(project.end_date).toLocaleDateString('es-ES') : 'No definida'}
                                            />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemIcon>
                                                <DateIcon color="secondary" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Creado" 
                                                secondary={new Date(project.created_at).toLocaleDateString('es-ES')}
                                            />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemIcon>
                                                <DateIcon color="secondary" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Actualizado" 
                                                secondary={new Date(project.updated_at).toLocaleDateString('es-ES')}
                                            />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>

                            {/* Project Images */}
                            {project.images && project.images.length > 1 && (
                                <Card
                                    sx={{
                                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                                        backdropFilter: 'blur(20px)',
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        borderRadius: 3,
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ImageIcon />
                                            Galería de Imágenes
                                        </Typography>
                                        
                                        <Grid container spacing={1}>
                                            {project.images.slice(1).map((image, index) => (
                                                <Grid item xs={6} key={index}>
                                                    <Box
                                                        component="img"
                                                        src={image}
                                                        alt={`${project.title} - Imagen ${index + 2}`}
                                                        sx={{
                                                            width: '100%',
                                                            height: 80,
                                                            objectFit: 'cover',
                                                            borderRadius: 1,
                                                            cursor: 'pointer',
                                                            transition: 'transform 0.2s',
                                                            '&:hover': {
                                                                transform: 'scale(1.05)',
                                                            }
                                                        }}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            )}
                        </motion.div>
                    </Grid>
                </Grid>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog}
                onClose={() => setDeleteDialog(false)}
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
                        ¿Estás seguro de que deseas eliminar el proyecto "{project.title}"? 
                        Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayoutNew>
    );
};

export default ProjectShow;
