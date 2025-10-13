import React, { useState, useMemo } from 'react';
import {
    Box,
    Container,
    Typography,
    Stack,
    Chip,
    Paper,
    Fade,
    Skeleton,
    Button,
    Card,
    CardContent,
    Avatar,
    Divider
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
    TrendingUp as TrendingIcon,
    Verified as VerifiedIcon,
    Speed as SpeedIcon,
    EmojiEvents as TrophyIcon,
    Groups as GroupsIcon
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

            {/* Why Choose Us Section */}
            <Box
                sx={{
                    py: { xs: 6, md: 8 },
                    background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)'
                        : 'linear-gradient(180deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.9) 100%)',
                }}
            >
                <Container maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <Typography
                            variant="h3"
                            align="center"
                            sx={{
                                fontWeight: 800,
                                mb: 2,
                                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                                background: (theme) => theme.palette.mode === 'dark'
                                    ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
                                    : `linear-gradient(135deg, ${designSystem.colors.primary[600]} 0%, ${designSystem.colors.primary[700]} 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}
                        >
                            ¿Por Qué Elegirnos?
                        </Typography>
                        <Typography
                            variant="h6"
                            align="center"
                            sx={{
                                color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : designSystem.colors.text.secondary,
                                mb: { xs: 4, md: 6 },
                                fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' },
                                maxWidth: 700,
                                mx: 'auto',
                                px: { xs: 2, sm: 0 }
                            }}
                        >
                            Más de 10 años transformando espacios con excelencia y compromiso
                        </Typography>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, 1fr)',
                                    lg: 'repeat(4, 1fr)'
                                },
                                gap: { xs: 3, md: 4 }
                            }}
                        >
                            {[
                                {
                                    icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
                                    title: 'Calidad Certificada',
                                    description: 'Materiales premium y acabados impecables en cada proyecto',
                                    color: '#10b981'
                                },
                                {
                                    icon: <SpeedIcon sx={{ fontSize: 40 }} />,
                                    title: 'Plazos Garantizados',
                                    description: 'Cumplimos religiosamente los tiempos acordados',
                                    color: '#3b82f6'
                                },
                                {
                                    icon: <TrophyIcon sx={{ fontSize: 40 }} />,
                                    title: '150+ Proyectos',
                                    description: 'Experiencia demostrada en todo tipo de reformas',
                                    color: '#f59e0b'
                                },
                                {
                                    icon: <GroupsIcon sx={{ fontSize: 40 }} />,
                                    title: 'Equipo Experto',
                                    description: 'Profesionales certificados y altamente cualificados',
                                    color: '#8b5cf6'
                                }
                            ].map((feature, index) => (
                                <Box key={index}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                        viewport={{ once: true }}
                                    >
                                        <Card
                                            sx={{
                                                height: '100%',
                                                textAlign: 'center',
                                                p: 3,
                                                borderRadius: 4,
                                                background: (theme) => theme.palette.mode === 'dark'
                                                    ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
                                                    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                                                backdropFilter: 'blur(20px)',
                                                WebkitBackdropFilter: 'blur(20px)',
                                                border: (theme) => theme.palette.mode === 'dark'
                                                    ? '1px solid rgba(255, 255, 255, 0.1)'
                                                    : '1px solid rgba(255, 255, 255, 0.3)',
                                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-8px)',
                                                    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)'
                                                }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: '50%',
                                                    background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}dd 100%)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 3,
                                                    color: 'white',
                                                    boxShadow: `0 8px 24px ${feature.color}40`
                                                }}
                                            >
                                                {feature.icon}
                                            </Box>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 700,
                                                    mb: 1,
                                                    color: (theme) => theme.palette.mode === 'dark' ? '#f1f5f9' : designSystem.colors.text.primary
                                                }}
                                            >
                                                {feature.title}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : designSystem.colors.text.secondary,
                                                    lineHeight: 1.6
                                                }}
                                            >
                                                {feature.description}
                                            </Typography>
                                        </Card>
                                    </motion.div>
                                </Box>
                            ))}
                        </Box>
                    </motion.div>
                </Container>
            </Box>

            {/* Services Results Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
                {/* Results Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 800,
                                mb: 2,
                                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                                background: (theme) => theme.palette.mode === 'dark'
                                    ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
                                    : `linear-gradient(135deg, ${designSystem.colors.primary[600]} 0%, ${designSystem.colors.primary[700]} 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}
                        >
                            {filterType === 'all' ? 'Todos los Servicios' :
                             filterType === 'featured' ? 'Servicios Destacados' :
                             'Servicios Populares'}
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : designSystem.colors.text.secondary,
                                mb: { xs: 3, md: 4 },
                                fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' }
                            }}
                        >
                            {servicesWithIcons.length} servicios disponibles
                        </Typography>

                        {/* Filter Chips */}
                        <Stack
                            direction="row"
                            spacing={{ xs: 1, sm: 2 }}
                            justifyContent="center"
                            flexWrap="wrap"
                            sx={{ gap: { xs: 1, sm: 2 } }}
                        >
                            <Chip
                                label="Todos"
                                variant={filterType === 'all' ? 'filled' : 'outlined'}
                                onClick={() => handleFilterChange('all')}
                                sx={{
                                    bgcolor: filterType === 'all' ? designSystem.colors.primary[500] : 'transparent',
                                    color: filterType === 'all' ? 'white' : (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : designSystem.colors.text.secondary,
                                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                                    px: 3,
                                    py: 2.5,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    '&:hover': {
                                        bgcolor: filterType === 'all' ? designSystem.colors.primary[600] : (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : designSystem.colors.primary[50]
                                    }
                                }}
                            />
                            <Chip
                                label="Destacados"
                                variant={filterType === 'featured' ? 'filled' : 'outlined'}
                                onClick={() => handleFilterChange('featured')}
                                sx={{
                                    bgcolor: filterType === 'featured' ? designSystem.colors.primary[500] : 'transparent',
                                    color: filterType === 'featured' ? 'white' : (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : designSystem.colors.text.secondary,
                                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                                    px: 3,
                                    py: 2.5,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    '&:hover': {
                                        bgcolor: filterType === 'featured' ? designSystem.colors.primary[600] : (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : designSystem.colors.primary[50]
                                    }
                                }}
                            />
                            <Chip
                                label="Populares"
                                variant={filterType === 'popular' ? 'filled' : 'outlined'}
                                onClick={() => handleFilterChange('popular')}
                                sx={{
                                    bgcolor: filterType === 'popular' ? designSystem.colors.primary[500] : 'transparent',
                                    color: filterType === 'popular' ? 'white' : (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : designSystem.colors.text.secondary,
                                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                                    px: 3,
                                    py: 2.5,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    '&:hover': {
                                        bgcolor: filterType === 'popular' ? designSystem.colors.primary[600] : (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : designSystem.colors.primary[50]
                                    }
                                }}
                            />
                        </Stack>
                    </Box>
                </motion.div>

                {/* Glassmorphism Services Grid */}
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <SkeletonGrid
                            variant="card"
                            count={6}
                            columns={{ xs: 1, sm: 2, md: 3 }}
                            spacing={4}
                            height={400}
                        />
                    ) : servicesWithIcons.length > 0 ? (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, 1fr)',
                                    md: 'repeat(3, 1fr)'
                                },
                                gap: { xs: 3, sm: 3, md: 4 },
                                mt: { xs: 2, md: 3 }
                            }}
                        >
                            {servicesWithIcons.map((service, index) => (
                                <Box key={service.id}>
                                    <GlassmorphismServiceCard
                                        service={service}
                                        index={index}
                                        featured={service.featured}
                                        onFavoriteToggle={handleFavoriteToggle}
                                        onShare={handleShare}
                                    />
                                </Box>
                            ))}
                        </Box>
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
                                    background: (theme) => theme.palette.mode === 'dark'
                                        ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)'
                                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8))',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    border: (theme) => theme.palette.mode === 'dark'
                                        ? '1px solid rgba(255, 255, 255, 0.1)'
                                        : '1px solid rgba(255, 255, 255, 0.3)',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <ConstructionIcon
                                    sx={{
                                        fontSize: 64,
                                        color: (theme) => theme.palette.mode === 'dark' ? '#475569' : designSystem.colors.text.muted,
                                        mb: 2
                                    }}
                                />
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 600,
                                        color: (theme) => theme.palette.mode === 'dark' ? '#f1f5f9' : designSystem.colors.text.primary,
                                        mb: 2
                                    }}
                                >
                                    No se encontraron servicios
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : designSystem.colors.text.secondary,
                                        mb: 3
                                    }}
                                >
                                    Intenta ajustar los filtros o términos de búsqueda
                                </Typography>
                                <Stack direction="row" spacing={2} justifyContent="center">
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            handleSearchChange('');
                                            handleFilterChange('all');
                                        }}
                                        sx={{
                                            bgcolor: designSystem.colors.primary[500],
                                            color: 'white',
                                            px: 4,
                                            py: 1.5,
                                            fontWeight: 600,
                                            '&:hover': {
                                                bgcolor: designSystem.colors.primary[600]
                                            }
                                        }}
                                    >
                                        Ver todos los servicios
                                    </Button>
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
                    py: { xs: 6, md: 8 },
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
                        <Stack spacing={{ xs: 3, md: 4 }} alignItems="center" textAlign="center">
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 800,
                                    fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' }
                                }}
                            >
                                ¿Necesitas algo específico?
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    opacity: 0.9,
                                    maxWidth: 600,
                                    lineHeight: 1.6,
                                    fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' },
                                    px: { xs: 2, sm: 0 }
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