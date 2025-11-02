import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Stack,
    IconButton,
    Button,
    Divider,
    Link as MuiLink,
    Chip
} from '@mui/material';
import {
    Build as BuildIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationIcon,
    Schedule as ScheduleIcon,
    Facebook as FacebookIcon,
    Instagram as InstagramIcon,
    LinkedIn as LinkedInIcon,
    YouTube as YouTubeIcon,
    WhatsApp as WhatsAppIcon,
    ArrowUpward as ArrowUpIcon
} from '@mui/icons-material';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

// Premium design system
const THEME = {
    primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
    },
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8',
        light: '#f8fafc',
    },
    surface: {
        dark: '#1e293b',
        darker: '#0f172a',
    }
};

const PremiumFooter = () => {
    const currentYear = new Date().getFullYear();

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Get version from Inertia props
    const { version } = usePage().props;

    return (
        <Box
            component="footer"
            sx={{
                position: 'relative',
                background: `linear-gradient(135deg, 
                    ${THEME.surface.dark} 0%, 
                    ${THEME.surface.darker} 100%
                )`,
                color: THEME.text.light,
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                        radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(245, 165, 36, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 40% 60%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)
                    `,
                    pointerEvents: 'none'
                }
            }}
        >
            {/* Glassmorphism overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: `linear-gradient(90deg, 
                        transparent 0%, 
                        rgba(255, 255, 255, 0.2) 50%, 
                        transparent 100%
                    )`
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {/* Main Footer Content */}
                    <Box sx={{ py: { xs: 6, md: 8 } }}>
                        <Grid container spacing={{ xs: 4, md: 6 }}>
                            {/* Company Info */}
                            <Grid item xs={12} md={6} lg={4}>
                                <motion.div variants={itemVariants}>
                                    <Stack spacing={3}>
                                        {/* Logo */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Box
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    background: `linear-gradient(135deg, 
                                                        ${THEME.primary[500]} 0%, 
                                                        ${THEME.primary[600]} 100%
                                                    )`,
                                                    mr: 2,
                                                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
                                                }}
                                            >
                                                <BuildIcon sx={{ color: 'white', fontSize: 28 }} />
                                            </Box>
                                            <Typography
                                                variant="h5"
                                                sx={{
                                                    fontWeight: 700,
                                                    background: `linear-gradient(135deg, 
                                                        ${THEME.text.light} 0%, 
                                                        ${THEME.primary[200]} 100%
                                                    )`,
                                                    backgroundClip: 'text',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent'
                                                }}
                                            >
                                                MDR Construcciones
                                            </Typography>
                                        </Box>

                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: THEME.text.muted,
                                                lineHeight: 1.7,
                                                maxWidth: 300
                                            }}
                                        >
                                            Especialistas en reformas integrales y construcción con más de 8 años de experiencia. 
                                            Calidad, confianza y resultados excepcionales.
                                        </Typography>

                                        {/* Contact Info */}
                                        <Stack spacing={2}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <PhoneIcon sx={{ color: THEME.primary[400], fontSize: 20 }} />
                                                <Typography variant="body2" sx={{ color: THEME.text.muted }}>
                                                    +34 123 456 789
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <EmailIcon sx={{ color: THEME.primary[400], fontSize: 20 }} />
                                                <Typography variant="body2" sx={{ color: THEME.text.muted }}>
                                                    info@mdrconstrucciones.com
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <LocationIcon sx={{ color: THEME.primary[400], fontSize: 20 }} />
                                                <Typography variant="body2" sx={{ color: THEME.text.muted }}>
                                                    Madrid, España
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Stack>
                                </motion.div>
                            </Grid>

                            {/* Quick Links */}
                            <Grid item xs={12} sm={6} lg={2}>
                                <motion.div variants={itemVariants}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 600,
                                            mb: 3,
                                            color: THEME.text.light
                                        }}
                                    >
                                        Enlaces Rápidos
                                    </Typography>
                                    <Stack spacing={2}>
                                        {[
                                            { title: 'Inicio', href: '/' },
                                            { title: 'Servicios', href: '/servicios' },
                                            { title: 'Proyectos', href: '/proyectos' },
                                            { title: 'Blog', href: '/blog' },
                                            { title: 'Empresa', href: '/empresa' },
                                            { title: 'Contacto', href: '/contacto' }
                                        ].map((link) => (
                                            <MuiLink
                                                key={link.title}
                                                component={Link}
                                                href={link.href}
                                                sx={{
                                                    color: THEME.text.muted,
                                                    textDecoration: 'none',
                                                    fontSize: '0.9rem',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        color: THEME.primary[300],
                                                        transform: 'translateX(4px)'
                                                    }
                                                }}
                                            >
                                                {link.title}
                                            </MuiLink>
                                        ))}
                                    </Stack>
                                </motion.div>
                            </Grid>

                            {/* Services */}
                            <Grid item xs={12} sm={6} lg={3}>
                                <motion.div variants={itemVariants}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 600,
                                            mb: 3,
                                            color: THEME.text.light
                                        }}
                                    >
                                        Servicios
                                    </Typography>
                                    <Stack spacing={2}>
                                        {[
                                            'Reformas Integrales',
                                            'Cocinas y Baños',
                                            'Pintura y Decoración',
                                            'Instalaciones',
                                            'Mantenimiento',
                                            'Consultoría'
                                        ].map((service) => (
                                            <Typography
                                                key={service}
                                                variant="body2"
                                                sx={{
                                                    color: THEME.text.muted,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        color: THEME.primary[300],
                                                        transform: 'translateX(4px)'
                                                    }
                                                }}
                                            >
                                                {service}
                                            </Typography>
                                        ))}
                                    </Stack>
                                </motion.div>
                            </Grid>

                            {/* Social & Newsletter */}
                            <Grid item xs={12} lg={3}>
                                <motion.div variants={itemVariants}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 600,
                                            mb: 3,
                                            color: THEME.text.light
                                        }}
                                    >
                                        Síguenos
                                    </Typography>

                                    {/* Social Media */}
                                    <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
                                        {[
                                            { icon: FacebookIcon, color: '#1877F2', href: '#' },
                                            { icon: InstagramIcon, color: '#E4405F', href: '#' },
                                            { icon: LinkedInIcon, color: '#0A66C2', href: '#' },
                                            { icon: YouTubeIcon, color: '#FF0000', href: '#' }
                                        ].map((social, index) => (
                                            <IconButton
                                                key={index}
                                                href={social.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{
                                                    width: 44,
                                                    height: 44,
                                                    background: `linear-gradient(135deg, 
                                                        rgba(255, 255, 255, 0.1) 0%, 
                                                        rgba(255, 255, 255, 0.05) 100%
                                                    )`,
                                                    backdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    color: THEME.text.muted,
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        color: social.color,
                                                        transform: 'translateY(-2px) scale(1.1)',
                                                        boxShadow: `0 8px 25px ${social.color}40`,
                                                        borderColor: social.color
                                                    }
                                                }}
                                            >
                                                <social.icon />
                                            </IconButton>
                                        ))}
                                    </Stack>

                                    {/* Business Hours */}
                                    <Box
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            background: `linear-gradient(135deg, 
                                                rgba(255, 255, 255, 0.05) 0%, 
                                                rgba(255, 255, 255, 0.02) 100%
                                            )`,
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <ScheduleIcon sx={{ color: THEME.primary[400], mr: 1, fontSize: 20 }} />
                                            <Typography variant="subtitle2" sx={{ color: THEME.text.light, fontWeight: 600 }}>
                                                Horario de Atención
                                            </Typography>
                                        </Box>
                                        <Stack spacing={1}>
                                            <Typography variant="body2" sx={{ color: THEME.text.muted, fontSize: '0.85rem' }}>
                                                Lun - Vie: 8:00 - 18:00
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: THEME.text.muted, fontSize: '0.85rem' }}>
                                                Sáb: 9:00 - 14:00
                                            </Typography>
                                            <Chip
                                                label="Disponible 24/7 para emergencias"
                                                size="small"
                                                sx={{
                                                    backgroundColor: 'rgba(245, 165, 36, 0.2)',
                                                    color: '#F5A524',
                                                    fontSize: '0.75rem',
                                                    height: 24,
                                                    mt: 1
                                                }}
                                            />
                                        </Stack>
                                    </Box>
                                </motion.div>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Bottom Section */}
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 4 }} />
                    
                    <motion.div variants={itemVariants}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                justifyContent: 'space-between',
                                alignItems: { xs: 'center', md: 'center' },
                                gap: 3,
                                pb: 4
                            }}
                        >
                            {/* Copyright and Version */}
                            <Stack spacing={0.5} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: THEME.text.muted,
                                    }}
                                >
                                    © {currentYear} MDR Construcciones. Todos los derechos reservados.
                                </Typography>
                                {version && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: THEME.text.muted,
                                            opacity: 0.7,
                                            fontSize: '0.75rem',
                                        }}
                                    >
                                        Versión {version.full}
                                        {version.is_prerelease && (
                                            <Chip
                                                label={version.prerelease.toUpperCase()}
                                                size="small"
                                                sx={{
                                                    ml: 1,
                                                    height: '16px',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 600,
                                                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                                    color: THEME.primary[300],
                                                    border: `1px solid ${THEME.primary[400]}`,
                                                }}
                                            />
                                        )}
                                    </Typography>
                                )}
                            </Stack>

                            {/* Legal Links */}
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={3}
                                sx={{ textAlign: { xs: 'center', md: 'right' } }}
                            >
                                {[
                                    { title: 'Aviso Legal', href: '/aviso-legal' },
                                    { title: 'Privacidad', href: '/politica-privacidad' },
                                    { title: 'Cookies', href: '/politica-cookies' }
                                ].map((link) => (
                                    <MuiLink
                                        key={link.title}
                                        component={Link}
                                        href={link.href}
                                        sx={{
                                            color: THEME.text.muted,
                                            textDecoration: 'none',
                                            fontSize: '0.85rem',
                                            transition: 'color 0.3s ease',
                                            '&:hover': {
                                                color: THEME.primary[300]
                                            }
                                        }}
                                    >
                                        {link.title}
                                    </MuiLink>
                                ))}
                            </Stack>

                            {/* Scroll to Top */}
                            <IconButton
                                onClick={scrollToTop}
                                sx={{
                                    width: 44,
                                    height: 44,
                                    background: `linear-gradient(135deg, 
                                        ${THEME.primary[500]} 0%, 
                                        ${THEME.primary[600]} 100%
                                    )`,
                                    color: 'white',
                                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-3px) scale(1.1)',
                                        boxShadow: '0 8px 30px rgba(59, 130, 246, 0.4)'
                                    }
                                }}
                            >
                                <ArrowUpIcon />
                            </IconButton>
                        </Box>
                    </motion.div>
                </motion.div>
            </Container>
        </Box>
    );
};

export default PremiumFooter;
