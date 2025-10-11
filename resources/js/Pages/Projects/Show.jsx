import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
    Container,
    Typography,
    Grid,
    Box,
    Button,
    Chip,
    Paper,
    Breadcrumbs,
    Link,
    Dialog,
    DialogContent,
    IconButton,
    Divider,
    Card,
    CardContent,
    CardMedia,
    useTheme,
    alpha,
    Fade
} from '@mui/material';
import {
    Close as CloseIcon,
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    LocationOn as LocationIcon,
    Schedule as ScheduleIcon,
    Euro as EuroIcon,
    Home as HomeIcon,
    Star as StarIcon,
    Share as ShareIcon,
    Print as PrintIcon,
    WhatsApp as WhatsAppIcon,
    Email as EmailIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSection from '@/Components/AnimatedSection';

const ProjectShow = ({ project, relatedProjects }) => {
    const theme = useTheme();
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Obtener galería de imágenes del proyecto
    const galleryImages = project.gallery ? JSON.parse(project.gallery) : [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800',
        'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800',
        'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800'
    ];

    const formatBudget = (budget) => {
        return budget ? `${budget.toLocaleString()}€` : 'Presupuesto a consultar';
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => 
            prev === 0 ? galleryImages.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => 
            prev === galleryImages.length - 1 ? 0 : prev + 1
        );
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: project.title,
                text: project.description,
                url: window.location.href,
            });
        }
    };

    return (
        <MainLayout>
            <Head 
                title={`${project.title} - MDR Construcciones`}
                description={project.summary}
            />
            
            {/* Breadcrumbs */}
            <Container maxWidth="lg" sx={{ pt: 3 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link 
                        color="inherit" 
                        href="/" 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
                        Inicio
                    </Link>
                    <Link 
                        color="inherit" 
                        href="/proyectos"
                        sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                        Proyectos
                    </Link>
                    <Typography color="text.primary">{project.title}</Typography>
                </Breadcrumbs>
            </Container>

            {/* Hero Section */}
            <Container maxWidth="lg" sx={{ pb: 6 }}>
                <Grid container spacing={4}>
                    {/* Imagen Principal */}
                    <Grid item xs={12} md={8}>
                        <AnimatedSection>
                            <Box
                                component={motion.div}
                                whileHover={{ scale: 1.02 }}
                                sx={{
                                    position: 'relative',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`
                                }}
                                onClick={() => setGalleryOpen(true)}
                            >
                                <img
                                    src={galleryImages[0]}
                                    alt={project.title}
                                    style={{
                                        width: '100%',
                                        height: '400px',
                                        objectFit: 'cover'
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 16,
                                        right: 16,
                                        backgroundColor: alpha(theme.palette.common.black, 0.7),
                                        color: 'white',
                                        px: 2,
                                        py: 1,
                                        borderRadius: 1,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    Ver Galería ({galleryImages.length} fotos)
                                </Box>
                                {project.featured && (
                                    <Chip
                                        label="Proyecto Destacado"
                                        color="primary"
                                        icon={<StarIcon />}
                                        sx={{
                                            position: 'absolute',
                                            top: 16,
                                            left: 16,
                                            fontWeight: 'bold'
                                        }}
                                    />
                                )}
                            </Box>
                        </AnimatedSection>
                    </Grid>

                    {/* Información del Proyecto */}
                    <Grid item xs={12} md={4}>
                        <AnimatedSection delay={0.2}>
                            <Box sx={{ position: 'sticky', top: 100 }}>
                                <Typography variant="h4" gutterBottom fontWeight="bold">
                                    {project.title}
                                </Typography>
                                
                                <Chip
                                    label={project.location}
                                    variant="outlined"
                                    color="primary"
                                    sx={{ mb: 3, fontWeight: 'bold' }}
                                />

                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <LocationIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                                        <Typography variant="body1">
                                            {project.location}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <ScheduleIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                                        <Typography variant="body1">
                                            {project.start_date && project.end_date ? 
                                                `${new Date(project.start_date).toLocaleDateString()} - ${new Date(project.end_date).toLocaleDateString()}` :
                                                'Fechas por definir'
                                            }
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <EuroIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                                        <Typography variant="body1">
                                            {formatBudget(project.budget_estimate)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                {/* Acciones */}
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            href="/contacto"
                                            sx={{ borderRadius: 2, py: 1.5 }}
                                        >
                                            Solicitar Presupuesto
                                        </Button>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={handleShare}
                                            startIcon={<ShareIcon />}
                                            sx={{ borderRadius: 2, py: 1.5 }}
                                        >
                                            Compartir
                                        </Button>
                                    </Grid>
                                </Grid>

                                {/* Enlaces de Contacto Rápido */}
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="body2" color="text.secondary" mb={1}>
                                        Contacto rápido:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <IconButton 
                                            color="primary"
                                            href="https://wa.me/34600123456"
                                            target="_blank"
                                            sx={{ 
                                                backgroundColor: alpha(theme.palette.success.main, 0.1),
                                                '&:hover': { backgroundColor: alpha(theme.palette.success.main, 0.2) }
                                            }}
                                        >
                                            <WhatsAppIcon />
                                        </IconButton>
                                        <IconButton 
                                            color="primary"
                                            href="mailto:info@mdrconstrucciones.com"
                                            sx={{ 
                                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) }
                                            }}
                                        >
                                            <EmailIcon />
                                        </IconButton>
                                        <IconButton 
                                            color="primary"
                                            onClick={() => window.print()}
                                            sx={{ 
                                                backgroundColor: alpha(theme.palette.grey[500], 0.1),
                                                '&:hover': { backgroundColor: alpha(theme.palette.grey[500], 0.2) }
                                            }}
                                        >
                                            <PrintIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Box>
                        </AnimatedSection>
                    </Grid>
                </Grid>
            </Container>

            {/* Contenido Detallado */}
            <Container maxWidth="lg" sx={{ pb: 6 }}>
                <Grid container spacing={6}>
                    <Grid item xs={12} md={8}>
                        {/* Descripción */}
                        <AnimatedSection>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
                                <Typography variant="h5" gutterBottom fontWeight="bold">
                                    Descripción del Proyecto
                                </Typography>
                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        lineHeight: 1.8,
                                        color: 'text.secondary',
                                        fontSize: '1.1rem',
                                        whiteSpace: 'pre-line'
                                    }}
                                >
                                    {project.body}
                                </Typography>
                            </Paper>
                        </AnimatedSection>

                        {/* Testimonio del Cliente - Temporalmente removido ya que no está en el nuevo esquema */}

                        {/* Minigalería */}
                        <AnimatedSection>
                            <Typography variant="h5" gutterBottom fontWeight="bold">
                                Galería del Proyecto
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                {galleryImages.slice(1, 5).map((image, index) => (
                                    <Grid item xs={6} md={3} key={index}>
                                        <Box
                                            component={motion.div}
                                            whileHover={{ scale: 1.05 }}
                                            sx={{
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                boxShadow: 2
                                            }}
                                            onClick={() => {
                                                setCurrentImageIndex(index + 1);
                                                setGalleryOpen(true);
                                            }}
                                        >
                                            <img
                                                src={image}
                                                alt={`Galería ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '120px',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                            <Button
                                variant="outlined"
                                onClick={() => setGalleryOpen(true)}
                                sx={{ borderRadius: 2 }}
                            >
                                Ver todas las fotos ({galleryImages.length})
                            </Button>
                        </AnimatedSection>
                    </Grid>

                    {/* Proyectos Relacionados */}
                    <Grid item xs={12} md={4}>
                        <AnimatedSection>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Proyectos Relacionados
                            </Typography>
                            {relatedProjects.map((relatedProject, index) => (
                                <Card 
                                    key={relatedProject.id} 
                                    sx={{ 
                                        mb: 3,
                                        borderRadius: 2,
                                        '&:hover': {
                                            boxShadow: 4,
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="120"
                                        image={relatedProject.gallery ? JSON.parse(relatedProject.gallery)[0] : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'}
                                        alt={relatedProject.title}
                                    />
                                    <CardContent>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                            {relatedProject.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {relatedProject.summary.substring(0, 100)}...
                                        </Typography>
                                        <Button
                                            size="small"
                                            href={`/proyectos/${relatedProject.slug}`}
                                            sx={{ mt: 1 }}
                                        >
                                            Ver Proyecto
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </AnimatedSection>
                    </Grid>
                </Grid>
            </Container>

            {/* Modal de Galería */}
            <Dialog
                open={galleryOpen}
                onClose={() => setGalleryOpen(false)}
                maxWidth={false}
                sx={{
                    '& .MuiDialog-paper': {
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        boxShadow: 'none',
                        margin: 0,
                        maxWidth: '100vw',
                        maxHeight: '100vh',
                        width: '100vw',
                        height: '100vh'
                    }
                }}
            >
                <DialogContent sx={{ p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconButton
                        onClick={() => setGalleryOpen(false)}
                        sx={{
                            position: 'absolute',
                            top: 20,
                            right: 20,
                            color: 'white',
                            backgroundColor: alpha('black', 0.5),
                            '&:hover': { backgroundColor: alpha('black', 0.7) }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <IconButton
                        onClick={handlePrevImage}
                        sx={{
                            position: 'absolute',
                            left: 20,
                            color: 'white',
                            backgroundColor: alpha('black', 0.5),
                            '&:hover': { backgroundColor: alpha('black', 0.7) }
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>

                    <IconButton
                        onClick={handleNextImage}
                        sx={{
                            position: 'absolute',
                            right: 20,
                            color: 'white',
                            backgroundColor: alpha('black', 0.5),
                            '&:hover': { backgroundColor: alpha('black', 0.7) }
                        }}
                    >
                        <ArrowForwardIcon />
                    </IconButton>

                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentImageIndex}
                            src={galleryImages[currentImageIndex]}
                            alt={`Galería ${currentImageIndex + 1}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                maxWidth: '90vw',
                                maxHeight: '90vh',
                                objectFit: 'contain'
                            }}
                        />
                    </AnimatePresence>

                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            color: 'white',
                            backgroundColor: alpha('black', 0.5),
                            px: 2,
                            py: 1,
                            borderRadius: 1
                        }}
                    >
                        {currentImageIndex + 1} / {galleryImages.length}
                    </Box>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
};

export default ProjectShow;