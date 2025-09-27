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
    Avatar,
    Badge,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    ArrowBack as BackIcon,
    Visibility as ViewsIcon,
    Favorite as FavoriteIcon,
    Star as StarIcon,
    Category as CategoryIcon,
    CalendarToday as DateIcon,
    TrendingUp as TrendingIcon,
    CheckCircle as ActiveIcon,
    Cancel as InactiveIcon,
    Image as ImageIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ServiceShow = ({ service, analytics = null }) => {
    const theme = useTheme();
    const [deleteDialog, setDeleteDialog] = useState(false);

    const handleDelete = () => {
        router.delete(route('admin.services.destroy', service.id), {
            onSuccess: () => {
                router.visit(route('admin.services.index'));
            }
        });
    };

    const toggleFeatured = () => {
        router.patch(route('admin.services.update', service.id), {
            is_featured: !service.is_featured
        }, {
            preserveScroll: true,
        });
    };

    const toggleActive = () => {
        router.patch(route('admin.services.update', service.id), {
            is_active: !service.is_active
        }, {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayoutNew>
            <Head title={`Servicio: ${service.title}`} />
            
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            component={Link}
                            href={route('admin.services.index')}
                            sx={{
                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.2)})`,
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            }}
                        >
                            <BackIcon />
                        </IconButton>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            Detalles del Servicio
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            component={Link}
                            href={route('admin.services.edit', service.id)}
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
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                                    backdropFilter: 'blur(20px)',
                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                }}
                            >
                                {service.image && (
                                    <CardMedia
                                        component="img"
                                        height="300"
                                        image={service.image}
                                        alt={service.title}
                                        sx={{
                                            objectFit: 'cover',
                                        }}
                                    />
                                )}
                                
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                                            {service.title}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Chip
                                                icon={service.is_active ? <ActiveIcon /> : <InactiveIcon />}
                                                label={service.is_active ? 'Activo' : 'Inactivo'}
                                                color={service.is_active ? 'success' : 'error'}
                                                variant="outlined"
                                                onClick={toggleActive}
                                                sx={{ cursor: 'pointer' }}
                                            />
                                            <Chip
                                                icon={<StarIcon />}
                                                label={service.is_featured ? 'Destacado' : 'Normal'}
                                                color={service.is_featured ? 'warning' : 'default'}
                                                variant={service.is_featured ? 'filled' : 'outlined'}
                                                onClick={toggleFeatured}
                                                sx={{ cursor: 'pointer' }}
                                            />
                                        </Box>
                                    </Box>

                                    {service.short_description && (
                                        <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                                            {service.short_description}
                                        </Typography>
                                    )}

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                        {service.description}
                                    </Typography>

                                    {service.features && service.features.length > 0 && (
                                        <>
                                            <Divider sx={{ my: 3 }} />
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                                Características
                                            </Typography>
                                            <List>
                                                {service.features.map((feature, index) => (
                                                    <ListItem key={index} sx={{ py: 0.5 }}>
                                                        <ListItemIcon>
                                                            <CheckCircle color="success" />
                                                        </ListItemIcon>
                                                        <ListItemText primary={feature} />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md={4}>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {/* Service Info */}
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
                                        Información del Servicio
                                    </Typography>
                                    
                                    <List>
                                        {service.category && (
                                            <ListItem sx={{ px: 0 }}>
                                                <ListItemIcon>
                                                    <CategoryIcon color="primary" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Categoría" 
                                                    secondary={service.category.name}
                                                />
                                            </ListItem>
                                        )}
                                        
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemIcon>
                                                <ViewsIcon color="info" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Visualizaciones" 
                                                secondary={service.views_count?.toLocaleString() || '0'}
                                            />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemIcon>
                                                <FavoriteIcon color="error" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Favoritos" 
                                                secondary={service.favorites_count?.toLocaleString() || '0'}
                                            />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemIcon>
                                                <DateIcon color="secondary" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Creado" 
                                                secondary={new Date(service.created_at).toLocaleDateString('es-ES')}
                                            />
                                        </ListItem>
                                        
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemIcon>
                                                <DateIcon color="secondary" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Actualizado" 
                                                secondary={new Date(service.updated_at).toLocaleDateString('es-ES')}
                                            />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>

                            {/* Analytics Card */}
                            {analytics && (
                                <Card
                                    sx={{
                                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.9)})`,
                                        backdropFilter: 'blur(20px)',
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        borderRadius: 3,
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                            Estadísticas
                                        </Typography>
                                        
                                        <List>
                                            <ListItem sx={{ px: 0 }}>
                                                <ListItemIcon>
                                                    <TrendingIcon color="success" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Vistas este mes" 
                                                    secondary={analytics.monthly_views || '0'}
                                                />
                                            </ListItem>
                                            
                                            <ListItem sx={{ px: 0 }}>
                                                <ListItemIcon>
                                                    <FavoriteIcon color="error" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary="Favoritos este mes" 
                                                    secondary={analytics.monthly_favorites || '0'}
                                                />
                                            </ListItem>
                                        </List>
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
                        ¿Estás seguro de que deseas eliminar el servicio "{service.title}"? 
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

export default ServiceShow;
