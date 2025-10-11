import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
    Alert,
    Snackbar,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    alpha,
    useTheme,
    useMediaQuery,
    Stack,
    Chip,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Avatar,
    Rating,
    Breadcrumbs,
    CircularProgress,
    InputAdornment,
    Link as MuiLink,
    Radio,
    RadioGroup,
    FormLabel,
    FormHelperText,
    Slider,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import {
    Phone,
    Email,
    LocationOn,
    WhatsApp,
    Send,
    Schedule,
    CheckCircle,
    AccessTime,
    Person,
    Message,
    Business,
    ExpandMore,
    HelpOutline,
    Verified,
    TrendingUp,
    Shield,
    Euro,
    NavigateNext,
    CheckCircleOutline,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import PrivacyPolicyModal from '@/Components/PrivacyPolicyModal';

/**
 * Contact Form Component with reCAPTCHA
 * Internal component that uses the reCAPTCHA hook
 */
function ContactFormContent({ contactInfo, services, seo, flash }) {
    const theme = useTheme();
    const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const { executeRecaptcha } = useGoogleReCaptcha();

    // Local state
    const [submitted, setSubmitted] = useState(false);
    const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // Form handling with Inertia.js
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        service: '',
        preferred_contact: 'Email',
        contact_time: '',
        sqm: 60,
        quality: 'Estándar',
        files: [],
        message: '',
        privacy_accepted: false,
        recaptcha_token: '',
    });

    // Refs for first error focus
    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const phoneRef = useRef(null);
    const serviceRef = useRef(null);
    const messageRef = useRef(null);
    const privacyRef = useRef(null);

    // Check availability based on working hours
    useEffect(() => {
        const checkAvailability = () => {
            const now = new Date();
            const day = now.getDay(); // 0-6 (Sunday-Saturday)
            const hour = now.getHours(); // 0-23

            // Monday-Friday: 8:00-18:00
            if (day >= 1 && day <= 5) {
                setIsAvailable(hour >= 8 && hour < 18);
            }
            // Saturday: 9:00-14:00
            else if (day === 6) {
                setIsAvailable(hour >= 9 && hour < 14);
            }
            // Sunday: Closed
            else {
                setIsAvailable(false);
            }
        };

        checkAvailability();
        const interval = setInterval(checkAvailability, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    // Restore and persist draft
    useEffect(() => {
        try {
            const draft = localStorage.getItem('contact_form_draft');
            if (draft) {
                const parsed = JSON.parse(draft);
                Object.entries(parsed).forEach(([k, v]) => {
                    if (k in data) setData(k, v);
                });
                setSnackbarMessage('Hemos restaurado tu borrador de contacto.');
                setSnackbarSeverity('info');
                setSnackbarOpen(true);
            }
        } catch {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const draft = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            service: data.service,
            preferred_contact: data.preferred_contact,
            contact_time: data.contact_time,
            sqm: data.sqm,
            quality: data.quality,
            message: data.message,
            privacy_accepted: data.privacy_accepted,
        };
        try { localStorage.setItem('contact_form_draft', JSON.stringify(draft)); } catch {}
    }, [data.name, data.email, data.phone, data.service, data.preferred_contact, data.contact_time, data.sqm, data.quality, data.message, data.privacy_accepted]);

    const clearDraft = () => {
        try { localStorage.removeItem('contact_form_draft'); } catch {}
        setSnackbarMessage('Borrador eliminado.');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
    };

    // Build sanitized WhatsApp link
    const sanitizedWa = (contactInfo?.whatsapp || '').replace(/[^0-9]/g, '');
    const waHref = sanitizedWa ? `https://wa.me/${sanitizedWa}` : '';

    // Quick estimator
    const basePerM2 = (() => {
        switch (data.service) {
            case 'Reformas Integrales': return 650;
            case 'Construcción Nueva': return 900;
            case 'Rehabilitación': return 500;
            case 'Diseño de Interiores': return 250;
            case 'Proyectos Comerciales': return 800;
            default: return 550;
        }
    })();
    const qualityFactor = data.quality === 'Alta' ? 1.25 : data.quality === 'Básica' ? 0.85 : 1.0;
    const estimate = Math.round((data.sqm || 0) * basePerM2 * qualityFactor);
    const estimateMin = Math.round(estimate * 0.9);
    const estimateMax = Math.round(estimate * 1.15);
    const appendEstimateToMessage = () => {
        const line = `\n\nEstimación orientativa: ${data.sqm} m², ${data.quality}, ${data.service || 'Servicio por definir'} → ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(estimateMin)} - ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(estimateMax)}`;
        setData('message', (data.message || '') + line);
    };

    // Form submission handler with MANDATORY reCAPTCHA
    const handleSubmit = async (e) => {
        e.preventDefault();

        // reCAPTCHA is MANDATORY - do not allow submission without it
        if (!executeRecaptcha) {
            alert('Error: reCAPTCHA no está disponible. Por favor, recarga la página.');
            return;
        }

        try {
            // Execute reCAPTCHA and get token
            const token = await executeRecaptcha('contact_form');

            // Set token in form data
            setData('recaptcha_token', token);

            // Submit form with token
            post(route('contact.submit'), {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    setSubmitted(true);
                    setSnackbarMessage('¡Gracias por tu mensaje! Te contactaremos en las próximas 24 horas.');
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
                    reset();
                    setTimeout(() => setSubmitted(false), 5000);
                    try { localStorage.removeItem('contact_form_draft'); } catch {}
                },
                onError: (errors) => {
                    console.error('Form submission errors:', errors);
                    if (errors.recaptcha_token) {
                        setSnackbarMessage('Error de verificación de seguridad. Por favor, inténtalo de nuevo.');
                        setSnackbarSeverity('error');
                        setSnackbarOpen(true);
                    } else {
                        setSnackbarMessage('Ocurrió un error al enviar el formulario. Por favor, revisa los campos.');
                        setSnackbarSeverity('error');
                        setSnackbarOpen(true);
                    }
                    // Focus first errored field
                    const order = ['name','email','phone','service','message','privacy_accepted'];
                    for (const key of order) {
                        if (errors[key]) {
                            const map = { name: nameRef, email: emailRef, phone: phoneRef, service: serviceRef, message: messageRef, privacy_accepted: privacyRef };
                            map[key]?.current?.focus?.();
                            break;
                        }
                    }
                },
            });
        } catch (error) {
            console.error('reCAPTCHA error:', error);
            alert('Error al verificar la seguridad. Por favor, recarga la página e inténtalo de nuevo.');
        }
    };

    // Premium Glassmorphism style - Simplified and Uniform
    const glassStyle = {
        background: alpha('#ffffff', 0.75),
        backdropFilter: 'blur(30px)',
        borderRadius: '16px',
        border: `1px solid ${alpha('#ffffff', 0.3)}`,
        boxShadow: `
            0 8px 32px 0 ${alpha('#000000', 0.1)},
            inset 0 1px 0 0 ${alpha('#ffffff', 0.8)}
        `,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
            boxShadow: `
                0 8px 32px 0 ${alpha('#000000', 0.1)},
                inset 0 1px 0 0 ${alpha('#ffffff', 0.8)}
            `,
            transform: 'translateY(-2px)',
            border: `1px solid ${alpha('#ffffff', 0.4)}`,
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

    // Contact methods data
    const contactMethods = [
        {
            icon: <Phone sx={{ fontSize: 40 }} />,
            title: 'Teléfono',
            value: contactInfo?.phone || '+34 123 456 789',
            color: theme.palette.primary.main,
            action: `tel:${contactInfo?.phone || '+34123456789'}`,
            description: 'Llámanos ahora',
        },
        {
            icon: <Email sx={{ fontSize: 40 }} />,
            title: 'Email',
            value: contactInfo?.email || 'info@mdrconstrucciones.com',
            color: theme.palette.secondary.main,
            action: `mailto:${contactInfo?.email || 'info@mdrconstrucciones.com'}`,
            description: 'Escríbenos',
        },
        {
            icon: <WhatsApp sx={{ fontSize: 40 }} />,
            title: 'WhatsApp',
            value: contactInfo?.whatsapp || '+34 123 456 789',
            color: '#25D366',
            action: `https://wa.me/${(contactInfo?.whatsapp || '34123456789').replace(/[^0-9]/g, '')}`,
            description: 'Chat directo',
        },
        {
            icon: <LocationOn sx={{ fontSize: 40 }} />,
            title: 'Dirección',
            value: contactInfo?.address || 'Calle Principal 123, Madrid',
            color: theme.palette.error.main,
            action: `https://maps.google.com/?q=${encodeURIComponent(contactInfo?.address || 'Calle Principal 123, Madrid')}`,
            description: 'Visítanos',
        },
    ];

    // Services list for select
    const servicesList = [
        'Reformas Integrales',
        'Construcción Nueva',
        'Rehabilitación',
        'Diseño de Interiores',
        'Proyectos Comerciales',
        'Otro',
    ];

    // Working hours
    const workingHours = [
        { day: 'Lunes - Viernes', hours: '8:00 - 18:00' },
        { day: 'Sábados', hours: '9:00 - 14:00' },
        { day: 'Domingos', hours: 'Cerrado' },
    ];

    // FAQ data
    const faqs = [
        {
            question: '¿Cuánto tiempo tarda una reforma integral?',
            answer: 'El tiempo depende del tamaño y complejidad del proyecto. Una reforma integral de un piso de 80m² suele tardar entre 6-8 semanas. Realizamos una planificación detallada antes de comenzar para garantizar el cumplimiento de plazos.',
        },
        {
            question: '¿Ofrecen presupuesto sin compromiso?',
            answer: 'Sí, ofrecemos presupuestos completamente gratuitos y sin compromiso. Visitamos tu propiedad, evaluamos el proyecto y te entregamos un presupuesto detallado en 24-48 horas.',
        },
        {
            question: '¿Qué garantías ofrecen en sus trabajos?',
            answer: 'Todos nuestros trabajos incluyen garantía de 2 años en mano de obra y hasta 10 años en elementos estructurales. Además, trabajamos solo con materiales de primeras marcas que incluyen sus propias garantías.',
        },
        {
            question: '¿Se encargan de los permisos y licencias?',
            answer: 'Sí, nos encargamos de toda la gestión de permisos, licencias y trámites necesarios con el ayuntamiento y comunidad de vecinos. Incluido en nuestro servicio integral.',
        },
        {
            question: '¿Puedo seguir viviendo en casa durante la reforma?',
            answer: 'Depende del tipo de reforma. En reformas parciales (cocina, baño) es posible con algunas molestias. En reformas integrales recomendamos desalojar temporalmente para mayor seguridad y rapidez.',
        },
        {
            question: '¿Qué formas de pago aceptan?',
            answer: 'Aceptamos transferencia bancaria, tarjeta y efectivo. Trabajamos con un sistema de pagos por fases: 40% al inicio, 40% a mitad de obra y 20% final. También ofrecemos financiación sin intereses.',
        },
    ];

    // Testimonials data
    const testimonials = [
        {
            name: 'María González',
            role: 'Reforma Integral - Chamberí',
            rating: 5,
            comment: 'Excelente trabajo en nuestra reforma integral. Cumplieron plazos, presupuesto y la calidad superó nuestras expectativas. Muy profesionales.',
            avatar: 'M',
        },
        {
            name: 'Carlos Ruiz',
            role: 'Construcción Nueva - Pozuelo',
            rating: 5,
            comment: 'Construyeron nuestra casa desde cero. Atentos a cada detalle, transparentes en costes y siempre disponibles. 100% recomendables.',
            avatar: 'C',
        },
        {
            name: 'Ana Martínez',
            role: 'Diseño de Interiores - Salamanca',
            rating: 5,
            comment: 'El equipo de diseño transformó completamente nuestro hogar. Ideas innovadoras, ejecución impecable. Estamos encantados con el resultado.',
            avatar: 'A',
        },
    ];

    // Why choose us data
    const whyChooseUs = [
        {
            icon: <Verified sx={{ fontSize: 50 }} />,
            title: '+8 Años de Experiencia',
            description: 'Más de 500 proyectos completados con éxito en Madrid y alrededores.',
            color: theme.palette.primary.main,
        },
        {
            icon: <Shield sx={{ fontSize: 50 }} />,
            title: 'Garantía Total',
            description: 'Garantía de 2 años en mano de obra y hasta 10 años en estructuras.',
            color: theme.palette.success.main,
        },
        {
            icon: <TrendingUp sx={{ fontSize: 50 }} />,
            title: 'Calidad Premium',
            description: 'Trabajamos solo con materiales de primeras marcas y profesionales certificados.',
            color: theme.palette.warning.main,
        },
        {
            icon: <Euro sx={{ fontSize: 50 }} />,
            title: 'Precio Justo',
            description: 'Presupuestos transparentes sin sorpresas. Financiación disponible sin intereses.',
            color: theme.palette.info.main,
        },
    ];

    return (
        <MainLayout>
            <Head title={seo?.title || 'Contacto - MDR Construcciones'}>
                <meta name="description" content={seo?.description || 'Contacta con MDR Construcciones para tu proyecto de reforma o construcción. Presupuesto gratuito en 24-48 horas.'} />
                <meta property="og:title" content={seo?.title || 'Contacto - MDR Construcciones'} />
                <meta property="og:description" content={seo?.description || 'Te respondemos en menos de 24h.'} />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={seo?.image || '/images/og-contact.jpg'} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seo?.title || 'Contacto - MDR Construcciones'} />
                <meta name="twitter:description" content={seo?.description || 'Te respondemos en menos de 24h.'} />
                <meta name="twitter:image" content={seo?.image || '/images/og-contact.jpg'} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'LocalBusiness',
                    name: 'MDR Construcciones',
                    url: typeof window !== 'undefined' ? window.location.origin : undefined,
                    telephone: contactInfo?.phone || '+34 123 456 789',
                    email: contactInfo?.email || 'info@mdrconstrucciones.com',
                    address: {
                        '@type': 'PostalAddress',
                        streetAddress: (contactInfo?.address || 'Calle Principal 123'),
                        addressLocality: 'Madrid',
                        addressCountry: 'ES',
                    },
                    openingHours: ['Mo-Fr 08:00-18:00','Sa 09:00-14:00'],
                }) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        { '@type': 'ListItem', position: 1, name: 'Inicio', item: (typeof window !== 'undefined' ? window.location.origin : '') + '/' },
                        { '@type': 'ListItem', position: 2, name: 'Contacto', item: (typeof window !== 'undefined' ? window.location.href : '') },
                    ],
                }) }} />
            </Head>

            {/* Hero Section */}
            <Box
                component={motion.div}
                initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={reduceMotion ? undefined : { duration: 0.6 }}
                sx={{
                    position: 'relative',
                    minHeight: { xs: '300px', md: '400px' },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'url(/images/hero-contact.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.2,
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.4)} 0%, ${alpha(theme.palette.primary.dark, 0.2)} 100%)`,
                    },
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    {/* Breadcrumbs with Animation */}
                    <motion.div
                        initial={reduceMotion ? undefined : { opacity: 0, x: -20 }}
                        animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                        transition={reduceMotion ? undefined : { duration: 0.6, delay: 0.2 }}
                    >
                        <Breadcrumbs
                            separator={<NavigateNext fontSize="small" />}
                            sx={{ mb: 3, color: 'white' }}
                        >
                            <Link href={route('home')} style={{ color: 'white', textDecoration: 'none' }}>
                                Inicio
                            </Link>
                            <Typography color="white">Contacto</Typography>
                        </Breadcrumbs>
                    </motion.div>

                    {/* Title with Premium Gradient */}
                    <motion.div
                        initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
                        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={reduceMotion ? undefined : { duration: 0.6, delay: 0.4 }}
                    >
                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                                fontWeight: 800,
                                mb: 2,
                                background: `linear-gradient(135deg, #ffffff 0%, ${alpha('#ffffff', 0.8)} 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Hablemos de tu Proyecto
                        </Typography>
                    </motion.div>

                    {/* Subtitle */}
                    <motion.div
                        initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
                        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={reduceMotion ? undefined : { duration: 0.6, delay: 0.6 }}
                    >
                        <Typography
                            variant="h5"
                            sx={{
                                fontSize: { xs: '1.1rem', md: '1.3rem' },
                                fontWeight: 300,
                                mb: 3,
                                maxWidth: '800px',
                                lineHeight: 1.6,
                                letterSpacing: '0.01em',
                                color: '#ffffff',
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            }}
                        >
                            Estamos listos para convertir tus ideas en realidad. Contáctanos y recibe un presupuesto personalizado sin compromiso.
                        </Typography>
                    </motion.div>

                    {/* Status Chips with Premium Gradients */}
                    <motion.div
                        initial={reduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
                        animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                        transition={reduceMotion ? undefined : { duration: 0.6, delay: 0.8, type: 'spring', stiffness: 200 }}
                    >
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Chip
                                icon={isAvailable ? <CheckCircle /> : <Schedule />}
                                label={isAvailable ? 'Disponibles Ahora' : 'Fuera de Horario'}
                                sx={{
                                    background: isAvailable
                                        ? alpha('#4caf50', 0.9)
                                        : alpha('#ffffff', 0.15),
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    py: 2.5,
                                    px: 2,
                                    boxShadow: isAvailable
                                        ? `0 2px 8px 0 ${alpha('#4caf50', 0.3)}`
                                        : 'none',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: isAvailable
                                            ? `0 4px 12px 0 ${alpha('#4caf50', 0.4)}`
                                            : `0 2px 8px 0 ${alpha('#ffffff', 0.2)}`,
                                    },
                                }}
                            />
                            <Chip
                                icon={<AccessTime />}
                                label="Respondemos en < 24h"
                                sx={{
                                    background: alpha('#2196f3', 0.9),
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    py: 2.5,
                                    px: 2,
                                    boxShadow: `0 2px 8px 0 ${alpha('#2196f3', 0.3)}`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: `0 4px 12px 0 ${alpha('#2196f3', 0.4)}`,
                                    },
                                }}
                            />
                        </Stack>
                    </motion.div>
                </Container>
            </Box>

            {/* Form + Contact Info Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
                <Grid container spacing={4}>
                    {/* Contact Form - 60% */}
                    <Grid item xs={12} lg={7}>
                        <motion.div
                            initial={reduceMotion ? undefined : { opacity: 0, x: -30 }}
                            animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                            transition={reduceMotion ? undefined : { duration: 0.6, delay: 0.2 }}
                        >
                            <Card sx={{ ...glassStyle, p: { xs: 2, md: 4 } }}>
                                <CardContent>
                                    <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                                        Envíanos un Mensaje
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                        Completa el formulario y nos pondremos en contacto contigo lo antes posible.
                                    </Typography>

                                    <form onSubmit={handleSubmit} aria-busy={processing}>
                                        <Stack spacing={3}>
                                            {/* Name Field */}
                                            <TextField
                                                fullWidth
                                                label="Nombre Completo"
                                                inputRef={nameRef}
                                                autoComplete="name"
                                                placeholder="Ej. Juan Pérez"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                error={!!errors.name}
                                                helperText={errors.name}
                                                required
                                                variant="outlined"
                                                disabled={processing}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Person color={errors.name ? 'error' : 'action'} />
                                                            </InputAdornment>
                                                        ),
                                                    },
                                                }}
                                            />

                                            {/* Email Field */}
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                type="email"
                                                inputRef={emailRef}
                                                autoComplete="email"
                                                placeholder="ejemplo@correo.com"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                error={!!errors.email}
                                                helperText={errors.email}
                                                required
                                                variant="outlined"
                                                disabled={processing}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Email color={errors.email ? 'error' : 'action'} />
                                                            </InputAdornment>
                                                        ),
                                                    },
                                                }}
                                            />

                                            {/* Phone Field */}
                                            <TextField
                                                fullWidth
                                                label="Teléfono (Opcional)"
                                                type="tel"
                                                inputRef={phoneRef}
                                                autoComplete="tel"
                                                placeholder="+34 612 345 678"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                error={!!errors.phone}
                                                helperText={errors.phone}
                                                variant="outlined"
                                                disabled={processing}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Phone color={errors.phone ? 'error' : 'action'} />
                                                            </InputAdornment>
                                                        ),
                                                    },
                                                }}
                                            />

                                            {/* Preferencia de Contacto */}
                                            <FormControl component="fieldset" disabled={processing}>
                                                <FormLabel component="legend">Preferencia de Contacto</FormLabel>
                                                <RadioGroup
                                                    row
                                                    value={data.preferred_contact}
                                                    onChange={(e) => setData('preferred_contact', e.target.value)}
                                                >
                                                    {['Email','Teléfono','WhatsApp'].map((opt) => (
                                                        <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>

                                            {/* Service Select */}
                                            <FormControl fullWidth disabled={processing} error={!!errors.service}>
                                                <InputLabel id="service-select-label">Servicio de Interés</InputLabel>
                                                <Select
                                                    labelId="service-select-label"
                                                    id="service-select"
                                                    inputRef={serviceRef}
                                                    value={data.service}
                                                    onChange={(e) => setData('service', e.target.value)}
                                                    label="Servicio de Interés"
                                                    startAdornment={
                                                        <InputAdornment position="start">
                                                            <Business color="action" />
                                                        </InputAdornment>
                                                    }
                                                >
                                                    <MenuItem value="">
                                                        <em>Selecciona un servicio</em>
                                                    </MenuItem>
                                                    {servicesList.map((service) => (
                                                        <MenuItem key={service} value={service}>
                                                            {service}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {!!errors.service && (
                                                    <FormHelperText>{errors.service}</FormHelperText>
                                                )}
                                            </FormControl>

                                            {/* Franja de contacto */}
                                            <FormControl fullWidth size="small" disabled={processing}>
                                                <InputLabel id="time-slot-label">Franja de contacto</InputLabel>
                                                <Select
                                                    labelId="time-slot-label"
                                                    value={data.contact_time}
                                                    label="Franja de contacto"
                                                    onChange={(e) => setData('contact_time', e.target.value)}
                                                >
                                                    {['Mañana (9-12)','Tarde (12-18)','Cualquier'].map((t) => (
                                                        <MenuItem key={t} value={t}>{t}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            {/* Estimación rápida (orientativa) */}
                                            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                                    Estimación rápida (orientativa)
                                                </Typography>
                                                <Stack spacing={2}>
                                                    <Box>
                                                        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                                                            Superficie (m²): {data.sqm}
                                                        </Typography>
                                                        <Slider
                                                            value={data.sqm}
                                                            onChange={(_, v) => setData('sqm', v)}
                                                            step={1}
                                                            min={10}
                                                            max={250}
                                                            disabled={processing}
                                                            valueLabelDisplay="auto"
                                                        />
                                                    </Box>
                                                    <FormControl fullWidth size="small" disabled={processing}>
                                                        <InputLabel id="quality-label">Calidad</InputLabel>
                                                        <Select
                                                            labelId="quality-label"
                                                            value={data.quality}
                                                            label="Calidad"
                                                            onChange={(e) => setData('quality', e.target.value)}
                                                        >
                                                            {['Básica','Estándar','Alta'].map((q) => (
                                                                <MenuItem key={q} value={q}>{q}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Rango estimado:
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight={700}>
                                                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(estimateMin)} - {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(estimateMax)}
                                                        </Typography>
                                                        <Button size="small" onClick={appendEstimateToMessage}>
                                                            Agregar al mensaje
                                                        </Button>
                                                    </Stack>
                                                </Stack>
                                            </Card>

                                            {/* Message Field */}
                                            <TextField
                                                fullWidth
                                                label="Mensaje"
                                                multiline
                                                rows={6}
                                                inputRef={messageRef}
                                                placeholder="Cuéntanos en pocas líneas qué necesitas, tiempos, estilo y presupuesto aproximado."
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                error={!!errors.message}
                                                helperText={errors.message || `${(data.message || '').length}/1000`}
                                                required
                                                variant="outlined"
                                                disabled={processing}
                                                inputProps={{ maxLength: 1000 }}
                                                slotProps={{
                                                    input: {
                                                        startAdornment: (
                                                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                                                                <Message color={errors.message ? 'error' : 'action'} />
                                                            </InputAdornment>
                                                        ),
                                                    },
                                                }}
                                            />

                                            {/* Archivos opcionales */}
                                            <Box>
                                                <Button variant="outlined" component="label" disabled={processing}>
                                                    Añadir archivos (imágenes/PDF)
                                                    <input
                                                        type="file"
                                                        hidden
                                                        multiple
                                                        accept=".jpg,.jpeg,.png,.pdf"
                                                        onChange={(e) => setData('files', e.target.files)}
                                                    />
                                                </Button>
                                                {data.files && data.files.length > 0 && (
                                                    <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                                                        {Array.from(data.files).map((f) => f.name).join(', ')}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Privacy Checkbox */}
                                            <Box>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            inputRef={privacyRef}
                                                            checked={data.privacy_accepted}
                                                            onChange={(e) => setData('privacy_accepted', e.target.checked)}
                                                            color="primary"
                                                            inputProps={{ 'aria-describedby': 'privacy-helper-text', 'aria-invalid': !!errors.privacy_accepted }}
                                                            disabled={processing}
                                                        />
                                                    }
                                                    label={
                                                        <Typography variant="body2">
                                                            Acepto la{' '}
                                                            <MuiLink
                                                                component="button"
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setPrivacyModalOpen(true);
                                                                }}
                                                                sx={{ color: 'primary.main', textDecoration: 'underline' }}
                                                            >
                                                                política de privacidad
                                                            </MuiLink>
                                                        </Typography>
                                                    }
                                                />
                                                {errors.privacy_accepted && (
                                                    <FormHelperText id="privacy-helper-text" error>
                                                        {errors.privacy_accepted}
                                                    </FormHelperText>
                                                )}
                                            </Box>

                                            {/* Premium Submit Button */}
                                            <motion.div
                                                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                                                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                                            >
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    size="large"
                                                    fullWidth
                                                    disabled={processing}
                                                    endIcon={processing ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                                    sx={{
                                                        py: 1.5,
                                                        fontSize: '1.1rem',
                                                        fontWeight: 600,
                                                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                                        boxShadow: `0 8px 24px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        '&::before': {
                                                            content: '""',
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: '-100%',
                                                            width: '100%',
                                                            height: '100%',
                                                            background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.3)}, transparent)`,
                                                            transition: 'left 0.5s',
                                                        },
                                                        '&:hover': {
                                                            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                                            boxShadow: `0 12px 32px 0 ${alpha(theme.palette.primary.main, 0.5)}`,
                                                            transform: reduceMotion ? 'none' : 'translateY(-2px)',
                                                        },
                                                        '&:hover::before': {
                                                            left: '100%',
                                                        },
                                                        '&:disabled': {
                                                            background: alpha(theme.palette.action.disabledBackground, 0.5),
                                                            boxShadow: 'none',
                                                        },
                                                    }}
                                                >
                                                    {processing ? 'Enviando...' : 'Enviar Mensaje'}
                                                </Button>
                                            </motion.div>
                                            {waHref && (
                                                <Button
                                                    variant="outlined"
                                                    color="success"
                                                    startIcon={<WhatsApp />}
                                                    component="a"
                                                    href={waHref}
                                                    target="_blank"
                                                >
                                                    Contactar por WhatsApp
                                                </Button>
                                            )}
                                        </Stack>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    {/* Contact Info - 40% */}
                    <Grid item xs={12} lg={5}>
                        <Stack spacing={3}>
                            {/* Contact Methods - Premium Design */}
                            {contactMethods.map((method, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                                    whileHover={{ x: -8, scale: 1.02 }}
                                >
                                    <Card
                                        component="a"
                                        href={method.action}
                                        target={method.action.startsWith('http') ? '_blank' : undefined}
                                        rel={method.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                                        sx={{
                                            ...glassStyle,
                                            textDecoration: 'none',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: '-100%',
                                                width: '100%',
                                                height: '100%',
                                                background: `linear-gradient(90deg, transparent, ${alpha(method.color, 0.15)}, transparent)`,
                                                transition: 'left 0.6s',
                                            },
                                            '&:hover::before': {
                                                left: '100%',
                                            },
                                            '&:hover': {
                                                border: `1px solid ${alpha(method.color, 0.3)}`,
                                                boxShadow: `0 12px 32px 0 ${alpha(method.color, 0.25)}`,
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ p: 3 }}>
                                            <Stack direction="row" spacing={2.5} alignItems="center">
                                                <motion.div
                                                    whileHover={{ scale: 1.1, y: -2 }}
                                                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 64,
                                                            height: 64,
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: `radial-gradient(circle, ${alpha(method.color, 0.2)} 0%, ${alpha(method.color, 0.05)} 100%)`,
                                                            color: method.color,
                                                            boxShadow: `0 4px 16px 0 ${alpha(method.color, 0.25)}`,
                                                            transition: 'all 0.3s ease',
                                                        }}
                                                    >
                                                        {method.icon}
                                                    </Box>
                                                </motion.div>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: alpha(theme.palette.text.secondary, 0.7),
                                                            fontWeight: 600,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.8px',
                                                            fontSize: '0.7rem',
                                                        }}
                                                    >
                                                        {method.title}
                                                    </Typography>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: theme.palette.text.primary,
                                                            my: 0.5,
                                                            fontSize: '1.05rem',
                                                            letterSpacing: '-0.01em',
                                                        }}
                                                    >
                                                        {method.value}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: method.color,
                                                            fontWeight: 600,
                                                            fontSize: '0.8rem',
                                                        }}
                                                    >
                                                        {method.description} →
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}

                            {/* Working Hours */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                            >
                                <Card sx={glassStyle}>
                                    <CardContent>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                            <AccessTime color="primary" />
                                            <Typography variant="h6" fontWeight="bold">
                                                Horario de Atención
                                            </Typography>
                                        </Stack>
                                        <Divider sx={{ mb: 2 }} />
                                        <Stack spacing={1.5}>
                                            {workingHours.map((schedule, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                                    }}
                                                >
                                                    <Typography variant="body2" fontWeight="500">
                                                        {schedule.day}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {schedule.hours}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>

            {/* Google Maps */}
            <Box sx={{ bgcolor: alpha(theme.palette.grey[100], 0.5), py: { xs: 6, md: 8 } }}>
                <Container maxWidth="lg">
                    <motion.div
                        initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
                        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={reduceMotion ? undefined : { duration: 0.6 }}
                    >
                        <Box
                            sx={{
                                width: '100%',
                                height: '400px',
                                borderRadius: 4,
                                overflow: 'hidden',
                                ...glassStyle,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: alpha(theme.palette.grey[200], 0.3),
                            }}
                        >
                            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                                <iframe
                                    title="Mapa de ubicación"
                                    src={`https://www.google.com/maps?q=${encodeURIComponent(contactInfo?.address || 'Calle Principal 123, Madrid')}&output=embed`}
                                    loading="lazy"
                                    style={{ border: 0, width: '100%', height: '100%' }}
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </Box>
                        </Box>
                    </motion.div>
                </Container>
            </Box>

            {/* Why Choose Us Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
                <motion.div
                    initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={reduceMotion ? undefined : { duration: 0.6 }}
                >
                    <Typography
                        variant="h3"
                        align="center"
                        gutterBottom
                        sx={{
                            fontWeight: 800,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-0.02em',
                            mb: 2,
                        }}
                    >
                        ¿Por Qué Elegirnos?
                    </Typography>
                    <Typography
                        variant="body1"
                        align="center"
                        sx={{
                            mb: 6,
                            maxWidth: '800px',
                            mx: 'auto',
                            fontSize: '1.1rem',
                            color: alpha(theme.palette.text.primary, 0.7),
                            lineHeight: 1.6,
                        }}
                    >
                        Somos tu mejor opción para proyectos de construcción y reforma. Calidad, experiencia y compromiso garantizados.
                    </Typography>
                </motion.div>

                <Grid container spacing={3}>
                    {whyChooseUs.map((item, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <motion.div
                                initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
                                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={reduceMotion ? undefined : { duration: 0.6, delay: index * 0.1 }}
                                whileHover={reduceMotion ? undefined : { y: -8 }}
                            >
                                <Card
                                    sx={{
                                        ...glassStyle,
                                        height: '100%',
                                        textAlign: 'center',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: '-100%',
                                            width: '100%',
                                            height: '100%',
                                            background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.2)}, transparent)`,
                                            transition: 'left 0.6s',
                                        },
                                        '&:hover::before': {
                                            left: '100%',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: `radial-gradient(circle, ${alpha(item.color, 0.15)} 0%, ${alpha(item.color, 0.05)} 100%)`,
                                                color: item.color,
                                                mx: 'auto',
                                                mb: 2,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.1) rotate(5deg)',
                                                    boxShadow: `0 8px 24px 0 ${alpha(item.color, 0.3)}`,
                                                },
                                            }}
                                        >
                                            {item.icon}
                                        </Box>
                                        <Typography
                                            variant="h6"
                                            gutterBottom
                                            sx={{
                                                fontWeight: 700,
                                                letterSpacing: '-0.01em',
                                            }}
                                        >
                                            {item.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: alpha(theme.palette.text.primary, 0.7),
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            {item.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Testimonials Section */}
            <Box sx={{ bgcolor: alpha(theme.palette.grey[100], 0.5), py: { xs: 6, md: 10 } }}>
                <Container maxWidth="lg">
                    <motion.div
                        initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
                        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={reduceMotion ? undefined : { duration: 0.6 }}
                    >
                        <Typography
                            variant="h3"
                            align="center"
                            gutterBottom
                            sx={{
                                fontWeight: 800,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                letterSpacing: '-0.02em',
                                mb: 2,
                            }}
                        >
                            Lo Que Dicen Nuestros Clientes
                        </Typography>
                        <Typography
                            variant="body1"
                            align="center"
                            sx={{
                                mb: 6,
                                maxWidth: '800px',
                                mx: 'auto',
                                fontSize: '1.1rem',
                                color: alpha(theme.palette.text.primary, 0.7),
                                lineHeight: 1.6,
                            }}
                        >
                            La satisfacción de nuestros clientes es nuestra mejor carta de presentación.
                        </Typography>
                    </motion.div>

                    <Grid container spacing={4}>
                        {testimonials.map((testimonial, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.15,
                                        ease: [0.4, 0, 0.2, 1],
                                    }}
                                    whileHover={{
                                        y: -4,
                                        transition: { duration: 0.3 }
                                    }}
                                >
                                    <Card
                                        sx={{
                                            ...glassStyle,
                                            height: '100%',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: '-100%',
                                                width: '100%',
                                                height: '100%',
                                                background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.3)}, transparent)`,
                                                transition: 'left 0.7s',
                                            },
                                            '&:hover::before': {
                                                left: '100%',
                                            },
                                            '&:hover': {
                                                boxShadow: `
                                                    0 20px 60px 0 ${alpha('#000000', 0.2)},
                                                    inset 0 1px 0 0 ${alpha('#ffffff', 1)}
                                                `,
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ p: 4 }}>
                                            <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 3 }}>
                                                <motion.div
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                    transition={{ type: 'spring', stiffness: 300 }}
                                                >
                                                    <Avatar
                                                        sx={{
                                                            width: 64,
                                                            height: 64,
                                                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                                            fontSize: '1.6rem',
                                                            fontWeight: 'bold',
                                                            boxShadow: `0 8px 24px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                                                        }}
                                                    >
                                                        {testimonial.avatar}
                                                    </Avatar>
                                                </motion.div>
                                                <Box>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontWeight: 700,
                                                            letterSpacing: '-0.01em',
                                                        }}
                                                    >
                                                        {testimonial.name}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: alpha(theme.palette.text.secondary, 0.8),
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {testimonial.role}
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            {/* Premium Star Rating */}
                                            <Box sx={{ mb: 2.5, display: 'flex', gap: 0.5 }}>
                                                {[...Array(testimonial.rating)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, scale: 0 }}
                                                        whileInView={{ opacity: 1, scale: 1 }}
                                                        viewport={{ once: true }}
                                                        transition={{ delay: 0.5 + i * 0.1 }}
                                                        whileHover={{ scale: 1.15 }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                color: '#FFD700',
                                                                filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3))',
                                                                fontSize: '1.3rem',
                                                            }}
                                                        >
                                                            ★
                                                        </Box>
                                                    </motion.div>
                                                ))}
                                            </Box>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: alpha(theme.palette.text.primary, 0.8),
                                                    fontStyle: 'italic',
                                                    lineHeight: 1.7,
                                                    fontSize: '0.95rem',
                                                    position: 'relative',
                                                    pl: 2,
                                                    '&::before': {
                                                        content: '"""',
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: -5,
                                                        fontSize: '2rem',
                                                        color: alpha(theme.palette.primary.main, 0.3),
                                                        fontFamily: 'Georgia, serif',
                                                    },
                                                }}
                                            >
                                                {testimonial.comment}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* FAQ Section */}
            <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <Typography
                        variant="h3"
                        align="center"
                        gutterBottom
                        sx={{
                            fontWeight: 800,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-0.02em',
                            mb: 2,
                        }}
                    >
                        Preguntas Frecuentes
                    </Typography>
                    <Typography
                        variant="body1"
                        align="center"
                        sx={{
                            mb: 6,
                            fontSize: '1.1rem',
                            color: alpha(theme.palette.text.primary, 0.7),
                            lineHeight: 1.6,
                        }}
                    >
                        Resolvemos las dudas más comunes sobre nuestros servicios.
                    </Typography>
                </motion.div>

                <Stack spacing={3}>
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.6,
                                delay: index * 0.1,
                                type: 'spring',
                                stiffness: 100,
                            }}
                        >
                            <Accordion
                                sx={{
                                    ...glassStyle,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&:before': {
                                        display: 'none',
                                    },
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '4px',
                                        height: '100%',
                                        background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease',
                                    },
                                    '&:hover::after': {
                                        opacity: 1,
                                    },
                                    '&:hover': {
                                        boxShadow: `
                                            0 12px 40px 0 ${alpha('#000000', 0.15)},
                                            inset 0 1px 0 0 ${alpha('#ffffff', 0.9)}
                                        `,
                                    },
                                    '&.Mui-expanded': {
                                        margin: '16px 0 !important',
                                        '&::after': {
                                            opacity: 1,
                                        },
                                    },
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={
                                        <ExpandMore
                                            sx={{
                                                color: theme.palette.primary.main,
                                                transition: 'transform 0.3s ease',
                                            }}
                                        />
                                    }
                                    sx={{
                                        py: 2,
                                        px: 3,
                                        '& .MuiAccordionSummary-content': {
                                            alignItems: 'center',
                                            my: 1,
                                        },
                                        '&:hover': {
                                            background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 100%)`,
                                        },
                                    }}
                                >
                                    <motion.div
                                        whileHover={reduceMotion ? undefined : { scale: 1.08 }}
                                        transition={reduceMotion ? undefined : { duration: 0.25 }}
                                        style={{ display: 'flex', marginRight: '16px' }}
                                    >
                                        <HelpOutline color="primary" />
                                    </motion.div>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            letterSpacing: '-0.01em',
                                            color: theme.palette.text.primary,
                                        }}
                                    >
                                        {faq.question}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails
                                    sx={{
                                        px: 3,
                                        pb: 3,
                                        pt: 0,
                                        pl: 7,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: alpha(theme.palette.text.primary, 0.75),
                                            lineHeight: 1.8,
                                            fontSize: '0.95rem',
                                        }}
                                    >
                                        {faq.answer}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        </motion.div>
                    ))}
                </Stack>
            </Container>

            {/* Privacy Policy Modal */}
            <PrivacyPolicyModal
                open={privacyModalOpen}
                onClose={() => setPrivacyModalOpen(false)}
            />

            {/* Success/Error Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                aria-live="polite"
                role="status"
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    variant="filled"
                    sx={{ width: '100%' }}
                    action={
                        snackbarSeverity === 'success' && waHref ? (
                            <Button
                                color="inherit"
                                size="small"
                                href={`${waHref}?text=${encodeURIComponent('Hola, acabo de enviar un mensaje de contacto.')}`}
                                target="_blank"
                                sx={{ textDecoration: 'none' }}
                            >
                                WhatsApp
                            </Button>
                        ) : null
                    }
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* Mobile Dock for quick contact */}
            <Box
                sx={{
                    display: { xs: 'flex', md: 'none' },
                    position: 'fixed',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'background.paper',
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                    p: 1,
                    gap: 1,
                    zIndex: 1200,
                }}
            >
                <Button fullWidth variant="outlined" component="a" href={`tel:${contactInfo?.phone || '+34123456789'}`}>
                    Llamar
                </Button>
                {waHref && (
                    <Button fullWidth variant="contained" color="success" component="a" href={waHref} target="_blank">
                        WhatsApp
                    </Button>
                )}
            </Box>
        </MainLayout>
    );
}

/**
 * Main Contact Component
 * Wraps ContactFormContent with GoogleReCaptchaProvider
 */
export default function Contact(props) {
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    // If reCAPTCHA is configured, wrap with provider
    if (recaptchaSiteKey) {
        return (
            <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
                <ContactFormContent {...props} />
            </GoogleReCaptchaProvider>
        );
    }

    // Otherwise, render without reCAPTCHA
    return <ContactFormContent {...props} />;
}
