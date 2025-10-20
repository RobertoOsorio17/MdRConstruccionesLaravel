import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    Chip,
    Box,
    TextField,
    MenuItem,
    Breadcrumbs,
    Link,
    Fade,
    useTheme,
    alpha,
    IconButton,
    Tooltip,
    Stack
} from '@mui/material';
import {
    Search as SearchIcon,
    LocationOn as LocationIcon,
    Schedule as ScheduleIcon,
    Euro as EuroIcon,
    KeyboardArrowRight as ArrowIcon,
    Home as HomeIcon,
    Person as PersonIcon,
    Clear as ClearIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import { usePersistentFilters } from '@/hooks/usePersistentFilters';
import { motion } from 'framer-motion';
import AnimatedSection from '@/Components/AnimatedSection';

const ProjectsIndex = ({ projects, categories, filters: urlFilters = {} }) => {
    const theme = useTheme();
    const [hoveredCard, setHoveredCard] = useState(null);

    // Usar hook de filtros persistentes
    const {
        filters,
        setFilter,
        clearFilters,
        hasActiveFilters,
        getActiveFiltersCount
    } = usePersistentFilters({
        storageKey: 'projects-filters',
        initialFilters: {
            search: '',
            location: ''
        },
        urlFilters,
        routeName: 'projects.index',
        useLocalStorage: true,
        useUrlParams: true,
        debounceMs: 500
    });

    // Filtrar proyectos
    const filteredProjects = projects.filter(project => {
        const matchesSearch = !filters.search ||
                            project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                            project.summary.toLowerCase().includes(filters.search.toLowerCase()) ||
                            project.location.toLowerCase().includes(filters.search.toLowerCase());
        const matchesCategory = !filters.location || project.location.includes(filters.location);
        return matchesSearch && matchesCategory;
    });

    const uniqueLocations = [...new Set(projects.map(project => project.location))];

    const formatBudget = (budget) => {
        return budget ? `${budget.toLocaleString()}€` : 'Presupuesto a consultar';
    };

    return (
        <MainLayout>
            <Head title="Nuestros Proyectos - MDR Construcciones" />
            
            {/* Hero Section */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    py: { xs: 8, md: 12 },
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'url(https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.1
                    }}
                />
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Breadcrumbs 
                            aria-label="breadcrumb" 
                            sx={{ 
                                color: 'white', 
                                mb: 3,
                                '& .MuiBreadcrumbs-separator': { color: 'white' }
                            }}
                        >
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
                            <Typography color="white">Proyectos</Typography>
                        </Breadcrumbs>

                        <Typography 
                            variant="h1" 
                            sx={{ 
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                                fontWeight: 700,
                                mb: 2,
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                            }}
                        >
                            Nuestros Proyectos
                        </Typography>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontSize: { xs: '1.1rem', md: '1.25rem' },
                                mb: 4,
                                opacity: 0.9,
                                maxWidth: 600
                            }}
                        >
                            Descubre una selección de nuestros trabajos más destacados. 
                            Cada proyecto refleja nuestro compromiso con la excelencia y la innovación.
                        </Typography>
                    </motion.div>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 6 }}>
                {/* Filtros */}
                <AnimatedSection>
                    <Box 
                        sx={{ 
                            mb: 6,
                            p: 3,
                            borderRadius: 2,
                            background: alpha(theme.palette.primary.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                        }}
                    >
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={5}>
                                <TextField
                                    fullWidth
                                    placeholder="Buscar proyectos..."
                                    value={filters.search}
                                    onChange={(e) => setFilter('search', e.target.value)}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'white'
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Ubicación"
                                    value={filters.location}
                                    onChange={(e) => setFilter('location', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'white'
                                        }
                                    }}
                                >
                                    <MenuItem value="">Todas las ubicaciones</MenuItem>
                                    {uniqueLocations.map((location) => (
                                        <MenuItem key={location} value={location}>
                                            {location}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                {hasActiveFilters() && (
                                    <Tooltip title="Limpiar filtros">
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="error"
                                            startIcon={<ClearIcon />}
                                            onClick={clearFilters}
                                            sx={{
                                                height: '56px',
                                                borderRadius: 2,
                                                borderWidth: 2,
                                                fontWeight: 600,
                                                '&:hover': {
                                                    borderWidth: 2,
                                                    bgcolor: 'error.light',
                                                    color: 'white'
                                                }
                                            }}
                                        >
                                            Limpiar
                                        </Button>
                                    </Tooltip>
                                )}
                            </Grid>
                        </Grid>

                        {/* Active Filters Indicator */}
                        {hasActiveFilters() && (
                            <Box sx={{ mt: 2 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <FilterIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {getActiveFiltersCount()} filtro{getActiveFiltersCount() > 1 ? 's' : ''} activo{getActiveFiltersCount() > 1 ? 's' : ''}
                                    </Typography>
                                </Stack>
                            </Box>
                        )}
                    </Box>
                </AnimatedSection>

                {/* Estadísticas rápidas */}
                <AnimatedSection>
                    <Grid container spacing={3} sx={{ mb: 6 }}>
                        <Grid item xs={6} md={3}>
                            <Box textAlign="center">
                                <Typography variant="h3" color="primary" fontWeight="bold">
                                    {projects.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Proyectos Realizados
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box textAlign="center">
                                <Typography variant="h3" color="primary" fontWeight="bold">
                                    {uniqueLocations.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Ubicaciones
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box textAlign="center">
                                <Typography variant="h3" color="primary" fontWeight="bold">
                                    100%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Satisfacción
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box textAlign="center">
                                <Typography variant="h3" color="primary" fontWeight="bold">
                                    +15
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Años Experiencia
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </AnimatedSection>

                {/* Grid de Proyectos */}
                <AnimatedSection
                    staggerChildren={true}
                    staggerDelay={0.08}
                    staggerDelayMultiplier={0.04}
                    maxStaggerDelay={0.4}
                >
                    <Grid container spacing={4}>
                        {filteredProjects.map((project, index) => (
                            <Grid item xs={12} md={6} lg={4} key={project.id}>
                                <Card
                                        component={motion.div}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        onHoverStart={() => setHoveredCard(project.id)}
                                        onHoverEnd={() => setHoveredCard(null)}
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            boxShadow: hoveredCard === project.id ? 
                                                `0 16px 40px ${alpha(theme.palette.primary.main, 0.3)}` :
                                                `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
                                            transition: 'all 0.3s ease',
                                            position: 'relative'
                                        }}
                                    >
                                        {project.featured && (
                                            <Chip
                                                label="Destacado"
                                                color="primary"
                                                size="small"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    right: 12,
                                                    zIndex: 2,
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        )}
                                        
                                        <Box sx={{ position: 'relative', overflow: 'hidden', height: 240 }}>
                                            <CardMedia
                                                component="img"
                                                height="240"
                                                image={project.gallery ? JSON.parse(project.gallery)[0] : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'}
                                                alt={project.title}
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.3s ease',
                                                    transform: hoveredCard === project.id ? 'scale(1.1)' : 'scale(1)'
                                                }}
                                            />

                                            {/* Category Badge */}
                                            <Chip
                                                label={project.category || 'Proyecto'}
                                                size="small"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    left: 12,
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.9),
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    backdropFilter: 'blur(10px)'
                                                }}
                                            />

                                            {/* Status Badge */}
                                            {project.status && (
                                                <Chip
                                                    label={project.status}
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 12,
                                                        right: 12,
                                                        backgroundColor: project.status === 'Completado'
                                                            ? alpha(theme.palette.success.main, 0.9)
                                                            : project.status === 'En progreso'
                                                            ? alpha(theme.palette.warning.main, 0.9)
                                                            : alpha(theme.palette.info.main, 0.9),
                                                        color: 'white',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                        backdropFilter: 'blur(10px)'
                                                    }}
                                                />
                                            )}

                                            {/* Hover Overlay with Additional Info */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%)',
                                                    opacity: hoveredCard === project.id ? 1 : 0,
                                                    transition: 'opacity 0.3s ease',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'flex-end',
                                                    p: 2
                                                }}
                                            >
                                                <Stack spacing={1}>
                                                    {/* Location */}
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                        <LocationIcon sx={{ fontSize: 16, color: 'white' }} />
                                                        <Typography variant="caption" sx={{ color: 'white', fontSize: '0.85rem' }}>
                                                            {project.location}
                                                        </Typography>
                                                    </Stack>

                                                    {/* Client */}
                                                    {project.client && (
                                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                                            <PersonIcon sx={{ fontSize: 16, color: 'white' }} />
                                                            <Typography variant="caption" sx={{ color: 'white', fontSize: '0.85rem' }}>
                                                                {project.client}
                                                            </Typography>
                                                        </Stack>
                                                    )}

                                                    {/* Tags */}
                                                    {project.tags && project.tags.length > 0 && (
                                                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                                            {project.tags.slice(0, 3).map((tag, idx) => (
                                                                <Chip
                                                                    key={idx}
                                                                    label={tag}
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                                                                        color: 'white',
                                                                        backdropFilter: 'blur(10px)',
                                                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                                                        fontSize: '0.65rem',
                                                                        height: 20,
                                                                        '& .MuiChip-label': {
                                                                            px: 1
                                                                        }
                                                                    }}
                                                                />
                                                            ))}
                                                        </Stack>
                                                    )}
                                                </Stack>
                                            </Box>
                                        </Box>

                                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                            <Typography 
                                                variant="h6" 
                                                gutterBottom
                                                sx={{ 
                                                    fontWeight: 600,
                                                    lineHeight: 1.3,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {project.title}
                                            </Typography>
                                            
                                            <Typography 
                                                variant="body2" 
                                                color="text.secondary"
                                                sx={{ 
                                                    mb: 2,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    lineHeight: 1.5
                                                }}
                                            >
                                                {project.summary}
                                            </Typography>

                                            <Box sx={{ mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {project.location}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {project.start_date && project.end_date ? 
                                                            `${new Date(project.start_date).toLocaleDateString()} - ${new Date(project.end_date).toLocaleDateString()}` :
                                                            'Fechas por definir'
                                                        }
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <EuroIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {formatBudget(project.budget_estimate)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>

                                        <CardActions sx={{ p: 3, pt: 0 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                href={`/proyectos/${project.slug}`}
                                                endIcon={<ArrowIcon />}
                                                sx={{
                                                    borderRadius: 2,
                                                    py: 1.5,
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                Ver Detalles
                                            </Button>
                                        </CardActions>
                                    </Card>
                            </Grid>
                        ))}
                    </Grid>
                </AnimatedSection>

                {/* Mensaje si no hay resultados */}
                {filteredProjects.length === 0 && (
                    <AnimatedSection>
                        <Box textAlign="center" py={8}>
                            <Typography variant="h5" color="text.secondary" mb={2}>
                                No se encontraron proyectos
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Intenta modificar los filtros de búsqueda
                            </Typography>
                        </Box>
                    </AnimatedSection>
                )}

                {/* Call to Action */}
                <AnimatedSection>
                    <Box 
                        sx={{ 
                            mt: 8,
                            p: 6,
                            borderRadius: 3,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            color: 'white',
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="h4" gutterBottom fontWeight="bold">
                            ¿Tienes un proyecto en mente?
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                            Contacta con nosotros y hagamos realidad tu visión
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            href="/contacto"
                            sx={{
                                backgroundColor: 'white',
                                color: theme.palette.primary.main,
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 'bold',
                                '&:hover': {
                                    backgroundColor: alpha('white', 0.9),
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            Solicitar Presupuesto
                        </Button>
                    </Box>
                </AnimatedSection>
            </Container>
        </MainLayout>
    );
};

export default ProjectsIndex;