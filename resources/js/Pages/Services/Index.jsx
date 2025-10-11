import React, { useState, useMemo } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Breadcrumbs,
    Link as MuiLink,
    Stack,
    Chip,
    Paper,
    Fade,
    Skeleton,
    Button
} from '@mui/material';
import {
    Build as BuildIcon,
    Bathtub as BathtubIcon,
    Kitchen as KitchenIcon,
    Apartment as ApartmentIcon,
    FormatPaint as PaintIcon,
    ElectricalServices as ElectricalIcon,
    Construction as ConstructionIcon,
    Star as StarIcon,
    CheckCircle as CheckIcon,
    TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';
import GlassmorphismHero from '@/Components/Services/GlassmorphismHero';
import GlassmorphismServiceCard from '@/Components/Services/GlassmorphismServiceCard';
import { useAppTheme } from '@/theme/ThemeProvider';
import SkeletonGrid from '@/Components/UI/SkeletonGrid';

const getServiceIcon = (iconName) => {
    const icons = {
        'Bathtub': <BathtubIcon />,
        'Kitchen': <KitchenIcon />,
        'Apartment': <ApartmentIcon />,
        'FormatPaint': <PaintIcon />,
        'ElectricalServices': <ElectricalIcon />,
        'Construction': <ConstructionIcon />,
    };
    return icons[iconName] || <BuildIcon />;
};

export default function ServicesIndex({ services = [], featuredServices = [], stats = {} }) {
    const { designSystem } = useAppTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isLoading, setIsLoading] = useState(false);

    // Enhanced filtering with search and category logic
    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchesSearch = !searchTerm ||
                service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (service.features && service.features.some(feature =>
                    feature.toLowerCase().includes(searchTerm.toLowerCase())
                ));

            const matchesFilter = filterType === 'all' ||
                                (filterType === 'featured' && service.featured) ||
                                (filterType === 'popular' && service.views_count > 100);

            return matchesSearch && matchesFilter;
        });
    }, [services, searchTerm, filterType]);

    // Add service icons to services data
    const servicesWithIcons = useMemo(() => {
        return filteredServices.map(service => ({
            ...service,
            icon: getServiceIcon(service.icon_name),
            features: service.features || [
                'Materiales de calidad',
                'Garantía incluida',
                'Profesionales certificados'
            ]
        }));
    }, [filteredServices]);

    const handleSearchChange = (newSearchTerm) => {
        setSearchTerm(newSearchTerm);
    };

    const handleFilterChange = (newFilter) => {
        setFilterType(newFilter);
    };

    const handleFavoriteToggle = (serviceId, isFavorited) => {
        // Handle favorite logic here
        console.log(`Service ${serviceId} favorited: ${isFavorited}`);
    };

    const handleShare = (service) => {
        // Handle share logic here
        if (navigator.share) {
            navigator.share({
                title: service.title,
                text: service.excerpt,
                url: window.location.origin + `/servicios/${service.slug}`
            });
        }
    };

    return (
        <MainLayout>
            <Head title="Servicios - MDR Construcciones" />
            
            {/* Breadcrumbs */}
            <Container maxWidth="lg" sx={{ pt: 2, pb: 1 }}>
                <Breadcrumbs aria-label="breadcrumb">
                    <MuiLink
                        component={Link}
                        href="/"
                        color="inherit"
                        sx={{
                            textDecoration: 'none',
                            '&:hover': { color: designSystem.colors.primary[600] }
                        }}
                    >
                        Inicio
                    </MuiLink>
                    <Typography color={designSystem.colors.text.primary} fontWeight={500}>
                        Servicios
                    </Typography>
                </Breadcrumbs>
            </Container>

            {/* Glassmorphism Hero Section */}
            <GlassmorphismHero
                onSearchChange={handleSearchChange}
                onFilterChange={handleFilterChange}
                searchTerm={searchTerm}
                filterType={filterType}
                stats={{
                    total_services: services.length,
                    completed_projects: '150+',
                    satisfaction: '98%',
                    experience: '10+'
                }}
            />

            {/* Services Results Section */}
            <Container maxWidth="lg" sx={{ py: 6 }}>
                {/* Results Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={2}
                        sx={{ mb: 4 }}
                    >
                        <Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    color: designSystem.colors.text.primary,
                                    mb: 1
                                }}
                            >
                                {filterType === 'all' ? 'Todos los Servicios' :
                                 filterType === 'featured' ? 'Servicios Destacados' :
                                 'Servicios Populares'}
                            </Typography>
                            <Typography variant="body1" color={designSystem.colors.text.secondary}>
                                {servicesWithIcons.length} servicios disponibles
                            </Typography>
                        </Box>

                        {/* Filter Chips */}
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip
                                label="Todos"
                                variant={filterType === 'all' ? 'filled' : 'outlined'}
                                onClick={() => handleFilterChange('all')}
                                sx={{
                                    bgcolor: filterType === 'all' ? designSystem.colors.primary[500] : 'transparent',
                                    color: filterType === 'all' ? 'white' : designSystem.colors.text.secondary,
                                    '&:hover': {
                                        bgcolor: filterType === 'all' ? designSystem.colors.primary[600] : designSystem.colors.primary[50]
                                    }
                                }}
                            />
                            <Chip
                                label="Destacados"
                                variant={filterType === 'featured' ? 'filled' : 'outlined'}
                                onClick={() => handleFilterChange('featured')}
                                sx={{
                                    bgcolor: filterType === 'featured' ? designSystem.colors.primary[500] : 'transparent',
                                    color: filterType === 'featured' ? 'white' : designSystem.colors.text.secondary,
                                    '&:hover': {
                                        bgcolor: filterType === 'featured' ? designSystem.colors.primary[600] : designSystem.colors.primary[50]
                                    }
                                }}
                            />
                            <Chip
                                label="Populares"
                                variant={filterType === 'popular' ? 'filled' : 'outlined'}
                                onClick={() => handleFilterChange('popular')}
                                sx={{
                                    bgcolor: filterType === 'popular' ? designSystem.colors.primary[500] : 'transparent',
                                    color: filterType === 'popular' ? 'white' : designSystem.colors.text.secondary,
                                    '&:hover': {
                                        bgcolor: filterType === 'popular' ? designSystem.colors.primary[600] : designSystem.colors.primary[50]
                                    }
                                }}
                            />
                        </Stack>
                    </Stack>
                </motion.div>

                {/* Glassmorphism Services Grid */}
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <SkeletonGrid 
                            variant="card" 
                            count={6} 
                            columns={{ xs: 1, sm: 2, md: 2, lg: 3 }}
                            spacing={4}
                            height={400}
                        />
                    ) : servicesWithIcons.length > 0 ? (
                        <Grid container spacing={4}>
                            {servicesWithIcons.map((service, index) => (
                                <Grid item xs={12} sm={6} md={6} lg={4} key={service.id}>
                                    <GlassmorphismServiceCard
                                        service={service}
                                        index={index}
                                        featured={service.featured}
                                        onFavoriteToggle={handleFavoriteToggle}
                                        onShare={handleShare}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Paper
                                sx={{
                                    p: 8,
                                    textAlign: 'center',
                                    borderRadius: 4,
                                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8))',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <ConstructionIcon
                                    sx={{
                                        fontSize: 64,
                                        color: designSystem.colors.text.muted,
                                        mb: 2
                                    }}
                                />
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 600,
                                        color: designSystem.colors.text.primary,
                                        mb: 2
                                    }}
                                >
                                    No se encontraron servicios
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: designSystem.colors.text.secondary,
                                        mb: 3
                                    }}
                                >
                                    Intenta ajustar los filtros o términos de búsqueda
                                </Typography>
                                <Stack direction="row" spacing={2} justifyContent="center">
                                    <Chip
                                        label="Ver todos"
                                        onClick={() => {
                                            handleSearchChange('');
                                            handleFilterChange('all');
                                        }}
                                        sx={{
                                            bgcolor: designSystem.colors.primary[500],
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: designSystem.colors.primary[600]
                                            }
                                        }}
                                    />
                                </Stack>
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Container>

            {/* Premium CTA Section */}
            <Box
                sx={{
                    position: 'relative',
                    py: 8,
                    background: `linear-gradient(135deg,
                        ${designSystem.colors.primary[500]} 0%,
                        ${designSystem.colors.primary[700]} 100%
                    )`,
                    color: 'white',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                                    radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)`,
                        pointerEvents: 'none'
                    }
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <Stack spacing={4} alignItems="center" textAlign="center">
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 800,
                                    fontSize: { xs: '2rem', md: '3rem' }
                                }}
                            >
                                ¿Necesitas algo específico?
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    opacity: 0.9,
                                    maxWidth: 600,
                                    lineHeight: 1.6
                                }}
                            >
                                Cada proyecto es único. Contacta con nosotros para una solución
                                personalizada que se adapte perfectamente a tus necesidades.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    component={Link}
                                    href="/contacto"
                                    sx={{
                                        bgcolor: 'white',
                                        color: designSystem.colors.primary[600],
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    Solicitar Presupuesto
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    component={Link}
                                    href="/proyectos"
                                    sx={{
                                        borderColor: 'rgba(255, 255, 255, 0.5)',
                                        color: 'white',
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        '&:hover': {
                                            borderColor: 'white',
                                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    Ver Proyectos
                                </Button>
                            </Stack>
                        </Stack>
                    </motion.div>
                </Container>
            </Box>
        </MainLayout>
    );
}