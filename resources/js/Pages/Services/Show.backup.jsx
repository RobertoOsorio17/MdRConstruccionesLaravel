import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import DOMPurify from 'dompurify';
import axios from 'axios';
import MainLayout from '@/Layouts/MainLayout';

// Import New Enhanced Components
import BeforeAfterSlider from '@/Components/Services/BeforeAfterSlider';
import CertificationsBadges from '@/Components/Services/CertificationsBadges';
import Enhanced3DTimeline from '@/Components/Services/Enhanced3DTimeline';
import PlanComparator from '@/Components/Services/PlanComparator';
import FAQInteractive from '@/Components/Services/FAQInteractive';
import FloatingCTA from '@/Components/Services/FloatingCTA';
import EnhancedHeroSection from '@/Components/Services/EnhancedHeroSection';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Stack,
    Chip,
    Avatar,
    IconButton,
    Breadcrumbs,
    Paper,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Divider,
    Tab,
    Tabs,
    Rating,
    Tooltip,
    LinearProgress,
    Alert,
    Snackbar,
    useTheme,
    useMediaQuery,
    Fade,
    Zoom,
    Link as MuiLink,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stepper,
    Step,
    StepLabel,
    StepContent,
} from '@mui/material';
import {
    ArrowForward,
    CheckCircle,
    Star,
    Phone,
    WhatsApp,
    Email,
    Schedule,
    Security,
    Build,
    NavigateNext,
    Home,
    RequestQuote,
    Favorite,
    FavoriteBorder,
    Share,
    PlayCircleOutline,
    Download,
    CheckCircleOutline,
    Groups,
    Engineering,
    Timer,
    Verified,
    TrendingUp,
    EmojiEvents,
    Assignment,
    AttachMoney,
    CalendarMonth,
    LocalOffer,
    Handshake,
    Architecture,
    Construction,
    LocationOn,
    ThumbUp,
    Speed,
    Palette,
    AutoAwesome,
    KeyboardArrowDown,
    KeyboardArrowUp,
    Close,
    FormatQuote,
    Business,
    Person,
    Event,
} from '@mui/icons-material';

// Swiper for testimonials carousel
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Enhanced Image Gallery with Lightbox
const ImageGalleryEnhanced = ({ images }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleImageClick = (image, index) => {
        setSelectedImage(image);
        setSelectedIndex(index);
    };

    const handleNext = () => {
        const nextIndex = (selectedIndex + 1) % images.length;
        setSelectedImage(images[nextIndex]);
        setSelectedIndex(nextIndex);
    };

    const handlePrev = () => {
        const prevIndex = selectedIndex === 0 ? images.length - 1 : selectedIndex - 1;
        setSelectedImage(images[prevIndex]);
        setSelectedIndex(prevIndex);
    };

    return (
        <>
            <Grid container spacing={2}>
                {images.slice(0, 6).map((image, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Card
                                sx={{
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    height: 250,
                                    '&:hover .overlay': {
                                        opacity: 1,
                                    }
                                }}
                                onClick={() => handleImageClick(image, index)}
                            >
                                <Box
                                    component="img"
                                    src={image.url}
                                    alt={image.alt || 'Proyecto'}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />
                                <Box
                                    className="overlay"
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        bgcolor: 'rgba(0,0,0,0.5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0,
                                        transition: 'opacity 0.3s',
                                    }}
                                >
                                    <PlayCircleOutline sx={{ color: 'white', fontSize: 60 }} />
                                </Box>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.95)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                        onClick={() => setSelectedImage(null)}
                    >
                        <IconButton
                            sx={{
                                position: 'absolute',
                                top: 20,
                                right: 20,
                                color: 'white',
                            }}
                        >
                            <Close />
                        </IconButton>
                        <IconButton
                            sx={{
                                position: 'absolute',
                                left: 20,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'white',
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePrev();
                            }}
                        >
                            <NavigateNext sx={{ transform: 'rotate(180deg)' }} />
                        </IconButton>
                        <IconButton
                            sx={{
                                position: 'absolute',
                                right: 20,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'white',
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNext();
                            }}
                        >
                            <NavigateNext />
                        </IconButton>
                        <motion.img
                            src={selectedImage.url}
                            alt={selectedImage.alt}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            style={{
                                maxWidth: '90%',
                                maxHeight: '90%',
                                objectFit: 'contain',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Modern Service Show Component
export default function ServiceShow({ 
    service, 
    relatedServices = [], 
    seo = {},
    auth = null,
    testimonials = [],
    projects = [] 
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [activeTab, setActiveTab] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const { scrollYProgress } = useScroll();

    // Toggle favorite
    const handleFavoriteToggle = async () => {
        if (!auth?.user) {
            window.location.href = '/login';
            return;
        }

        try {
            const response = await axios.post(`/api/services/${service.slug}/favorite`);
            if (response.data.success) {
                setIsFavorite(response.data.favorited);
                setSnackbar({
                    open: true,
                    message: response.data.favorited ? 'Añadido a favoritos' : 'Eliminado de favoritos',
                    severity: 'success'
                });
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error al actualizar favoritos',
                severity: 'error'
            });
        }
    };

    // Share functionality
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: service.title,
                    text: service.excerpt,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            setSnackbar({
                open: true,
                message: 'Enlace copiado al portapapeles',
                severity: 'success'
            });
        }
    };

    // Service process steps
    const processSteps = [
        {
            label: 'Consulta Inicial',
            description: 'Contacto inicial para entender tus necesidades y objetivos del proyecto',
            icon: <Phone />,
        },
        {
            label: 'Visita Técnica',
            description: 'Evaluación en sitio para analizar el espacio y tomar medidas precisas',
            icon: <Architecture />,
        },
        {
            label: 'Propuesta Detallada',
            description: 'Presentación de presupuesto detallado con planos y materiales',
            icon: <Assignment />,
        },
        {
            label: 'Ejecución',
            description: 'Desarrollo del proyecto con seguimiento continuo y control de calidad',
            icon: <Construction />,
        },
        {
            label: 'Entrega Final',
            description: 'Revisión final, limpieza y entrega del proyecto completado',
            icon: <Verified />,
        },
    ];

    // Service packages/plans
    const servicePlans = [
        {
            name: 'Básico',
            price: 'Desde €1,500',
            features: [
                'Consultoría inicial',
                'Diseño básico',
                'Materiales estándar',
                'Garantía 1 año',
                'Soporte por email',
            ],
            recommended: false,
        },
        {
            name: 'Profesional',
            price: 'Desde €3,500',
            features: [
                'Consultoría completa',
                'Diseño personalizado',
                'Materiales premium',
                'Garantía 2 años',
                'Soporte prioritario',
                'Seguimiento post-venta',
            ],
            recommended: true,
        },
        {
            name: 'Premium',
            price: 'Personalizado',
            features: [
                'Consultoría VIP',
                'Diseño exclusivo',
                'Materiales de lujo',
                'Garantía 3 años',
                'Soporte 24/7',
                'Mantenimiento incluido',
                'Proyecto llave en mano',
            ],
            recommended: false,
        },
    ];

    // Achievement stats
    const achievements = [
        { icon: <EmojiEvents />, value: '500+', label: 'Proyectos Completados' },
        { icon: <Groups />, value: '98%', label: 'Clientes Satisfechos' },
        { icon: <Timer />, value: '15+', label: 'Años de Experiencia' },
        { icon: <Verified />, value: '100%', label: 'Proyectos Garantizados' },
    ];

    return (
        <MainLayout>
            <Head title={seo.title || `${service.title} - MDR Construcciones`} />

            {/* Progress Bar */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                    height: 4,
                }}
            >
                <motion.div
                    style={{
                        scaleX: scrollYProgress,
                        height: '100%',
                        background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                        transformOrigin: 'left',
                    }}
                />
            </Box>

            {/* Enhanced Hero Section */}
            <EnhancedHeroSection
                service={service}
                achievements={achievements}
                onFavoriteToggle={handleFavoriteToggle}
                onShare={handleShare}
                isFavorite={isFavorite}
            />

            {/* Certifications and Badges Section */}
            <Container maxWidth="lg">
                <CertificationsBadges />
            </Container>

            {/* Before/After Section */}
            {service.before_image && service.after_image && (
                <Container maxWidth="lg" sx={{ py: 8 }}>
                    <BeforeAfterSlider
                        beforeImage={service.before_image}
                        afterImage={service.after_image}
                        title="Transformación Real"
                    />
                </Container>
            )}

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                {/* Service Details Tabs */}
                <Paper sx={{ mb: 6, borderRadius: 3, overflow: 'hidden' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        variant={isMobile ? "scrollable" : "fullWidth"}
                        scrollButtons="auto"
                        sx={{
                            bgcolor: '#f8fafc',
                            '& .MuiTab-root': {
                                fontWeight: 600,
                                fontSize: '1rem',
                            }
                        }}
                    >
                        <Tab label="Descripción" />
                        <Tab label="Proceso" />
                        <Tab label="Precios" />
                        <Tab label="Galería" />
                    </Tabs>

                    <Box sx={{ p: { xs: 3, md: 5 } }}>
                        {/* Description Tab */}
                        {activeTab === 0 && (
                            <Fade in={activeTab === 0}>
                                <Box>
                                    <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                                        Acerca del Servicio
                                    </Typography>
                                    <Box
                                        sx={{
                                            '& p': { mb: 2, lineHeight: 1.8, color: '#475569' },
                                            '& h2, & h3, & h4': { mt: 4, mb: 2, fontWeight: 600 },
                                            '& ul, & ol': { pl: 3, mb: 2 },
                                            '& li': { mb: 1 },
                                        }}
                                        dangerouslySetInnerHTML={{ 
                                            __html: DOMPurify.sanitize(service.body) 
                                        }}
                                    />

                                    {/* Features List */}
                                    <Box sx={{ mt: 6 }}>
                                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                                            Características Incluidas
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {[
                                                'Presupuesto sin compromiso',
                                                'Materiales de primera calidad',
                                                'Equipo profesional certificado',
                                                'Garantía completa',
                                                'Seguimiento personalizado',
                                                'Limpieza final incluida',
                                                'Asesoramiento técnico',
                                                'Plazos garantizados',
                                            ].map((feature, index) => (
                                                <Grid item xs={12} sm={6} md={4} key={index}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <CheckCircleOutline sx={{ color: '#10b981' }} />
                                                        <Typography>{feature}</Typography>
                                                    </Stack>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                </Box>
                            </Fade>
                        )}

                        {/* Process Tab */}
                        {activeTab === 1 && (
                            <Fade in={activeTab === 1}>
                                <Box sx={{ mx: -5, px: 5 }}>
                                    <Enhanced3DTimeline />
                                </Box>
                            </Fade>
                        )}

                        {/* Pricing Tab */}
                        {activeTab === 2 && (
                            <Fade in={activeTab === 2}>
                                <Box sx={{ mx: -5, px: 5 }}>
                                    <PlanComparator
                                        onSelectPlan={(plan) => {
                                            window.location.href = '/contacto';
                                        }}
                                    />
                                </Box>
                            </Fade>
                        )}

                        {/* Gallery Tab */}
                        {activeTab === 3 && (
                            <Fade in={activeTab === 3}>
                                <Box>
                                    <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
                                        Galería de Proyectos
                                    </Typography>
                                    {service.images && service.images.length > 0 ? (
                                        <ImageGalleryEnhanced images={service.images} />
                                    ) : (
                                        <Alert severity="info">
                                            No hay imágenes disponibles para este servicio actualmente.
                                        </Alert>
                                    )}
                                </Box>
                            </Fade>
                        )}
                    </Box>
                </Paper>

                {/* Testimonials Carousel */}
                {testimonials && testimonials.length > 0 && (
                    <Paper sx={{ p: { xs: 3, md: 5 }, mb: 6, borderRadius: 3 }}>
                        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
                            Lo Que Dicen Nuestros Clientes
                        </Typography>
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={30}
                            slidesPerView={isMobile ? 1 : isTablet ? 2 : 3}
                            navigation
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 5000, disableOnInteraction: false }}
                            style={{ padding: '20px 0 50px' }}
                        >
                            {testimonials.map((testimonial, index) => (
                                <SwiperSlide key={index}>
                                    <Card sx={{ height: '100%', p: 3 }}>
                                        <CardContent>
                                            <Stack spacing={2}>
                                                <Rating value={testimonial.rating || 5} readOnly />
                                                <Box>
                                                    <FormatQuote sx={{ color: '#cbd5e1', transform: 'rotate(180deg)' }} />
                                                    <Typography variant="body1" sx={{ fontStyle: 'italic', my: 2 }}>
                                                        {testimonial.comment}
                                                    </Typography>
                                                    <FormatQuote sx={{ color: '#cbd5e1', float: 'right' }} />
                                                </Box>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar sx={{ bgcolor: '#3b82f6' }}>
                                                        {testimonial.name?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {testimonial.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {testimonial.project || 'Cliente Verificado'}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </Paper>
                )}

                {/* FAQ Section */}
                <Box sx={{ mb: 6 }}>
                    <FAQInteractive />
                </Box>

                {/* Contact CTA Section */}
                <Paper 
                    sx={{ 
                        p: { xs: 4, md: 6 }, 
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.15) 0%, transparent 60%)',
                            pointerEvents: 'none',
                        }
                    }}
                >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                            ¿Interesado en este servicio?
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 4, opacity: 0.95 }}>
                            Contacta con nosotros para recibir un presupuesto personalizado sin compromiso
                        </Typography>
                        
                        <Stack 
                            direction={{ xs: 'column', sm: 'row' }} 
                            spacing={2} 
                            justifyContent="center"
                            sx={{ mb: 4 }}
                        >
                            <Button
                                component={Link}
                                href="/contacto"
                                variant="contained"
                                size="large"
                                startIcon={<RequestQuote />}
                                sx={{
                                    px: 4,
                                    py: 2,
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    background: 'white',
                                    color: '#3b82f6',
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                    '&:hover': {
                                        background: 'rgba(255,255,255,0.95)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 12px 35px rgba(0,0,0,0.2)',
                                    }
                                }}
                            >
                                Ir a Página de Contacto
                            </Button>
                            <Button
                                component="a"
                                href="https://wa.me/34123456789"
                                target="_blank"
                                variant="outlined"
                                size="large"
                                startIcon={<WhatsApp />}
                                sx={{
                                    px: 4,
                                    py: 2,
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    borderColor: 'rgba(255,255,255,0.5)',
                                    color: 'white',
                                    borderWidth: 2,
                                    '&:hover': {
                                        borderColor: 'white',
                                        borderWidth: 2,
                                        background: 'rgba(255,255,255,0.1)',
                                        transform: 'translateY(-2px)',
                                    }
                                }}
                            >
                                WhatsApp Directo
                            </Button>
                        </Stack>

                        <Grid container spacing={2} sx={{ maxWidth: 600, margin: '0 auto' }}>
                            {[
                                { icon: <Speed />, text: 'Respuesta en 24h' },
                                { icon: <Verified />, text: 'Presupuesto Gratuito' },
                                { icon: <Security />, text: 'Sin Compromiso' },
                            ].map((item, index) => (
                                <Grid item xs={12} sm={4} key={index}>
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                        {item.icon}
                                        <Typography variant="body2" fontWeight={600}>
                                            {item.text}
                                        </Typography>
                                    </Stack>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Paper>

                {/* Related Services */}
                {relatedServices && relatedServices.length > 0 && (
                    <Box sx={{ mt: 8 }}>
                        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>
                            Servicios Relacionados
                        </Typography>
                        <Grid container spacing={3}>
                            {relatedServices.slice(0, 3).map((related) => (
                                <Grid item xs={12} md={4} key={related.id}>
                                    <motion.div whileHover={{ y: -8 }}>
                                        <Card
                                            component={Link}
                                            href={`/servicios/${related.slug}`}
                                            sx={{
                                                textDecoration: 'none',
                                                height: '100%',
                                                transition: 'all 0.3s',
                                                '&:hover': {
                                                    boxShadow: 6,
                                                }
                                            }}
                                        >
                                            {related.featured_image && (
                                                <Box
                                                    sx={{
                                                        height: 200,
                                                        bgcolor: '#f1f5f9',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Box
                                                        component="img"
                                                        src={related.featured_image}
                                                        alt={related.title}
                                                        sx={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom fontWeight={600}>
                                                    {related.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {related.excerpt.substring(0, 100)}...
                                                </Typography>
                                                <Button
                                                    endIcon={<ArrowForward />}
                                                    sx={{ mt: 2 }}
                                                >
                                                    Ver más
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}
            </Container>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Floating CTA Button */}
            <FloatingCTA
                onRequestQuote={() => {
                    window.location.href = '/contacto';
                }}
                showScrollTop={true}
            />
        </MainLayout>
    );
}
