import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
    Box,
    Container,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider,
    Breadcrumbs,
    Link as MuiLink,
    Chip,
    useTheme,
    useMediaQuery,
    Drawer,
    IconButton,
    Fab,
} from '@mui/material';
import {
    Home as HomeIcon,
    Gavel as GavelIcon,
    Menu as MenuIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import GuestLayout from '@/Layouts/GuestLayout';

export default function TermsOfService() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [activeSection, setActiveSection] = useState('introduccion');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
            
            // Update active section based on scroll position
            const sections = ['introduccion', 'uso', 'propiedad', 'limitaciones', 'modificaciones', 'contacto'];
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 150 && rect.bottom >= 150) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const sections = [
        { id: 'introduccion', title: '1. Introducción' },
        { id: 'uso', title: '2. Uso del Servicio' },
        { id: 'propiedad', title: '3. Propiedad Intelectual' },
        { id: 'limitaciones', title: '4. Limitaciones de Responsabilidad' },
        { id: 'modificaciones', title: '5. Modificaciones' },
        { id: 'contacto', title: '6. Contacto' },
    ];

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const sidebar = (
        <Box sx={{ width: isMobile ? 250 : '100%', p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <GavelIcon color="primary" />
                Contenido
            </Typography>
            <List>
                {sections.map((section) => (
                    <ListItem key={section.id} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={activeSection === section.id}
                            onClick={() => scrollToSection(section.id)}
                            sx={{
                                borderRadius: 2,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    },
                                },
                            }}
                        >
                            <ListItemText primary={section.title} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <GuestLayout>
            <Head title="Términos y Condiciones - MDR Construcciones" />

            {/* Progress Bar */}
            <motion.div
                style={{
                    scaleX,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    transformOrigin: '0%',
                    zIndex: 9999,
                }}
            />

            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50',
                    pt: 4,
                    pb: 8,
                }}
            >
                <Container maxWidth="xl">
                    {/* Breadcrumbs */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Breadcrumbs sx={{ mb: 3 }}>
                            <MuiLink
                                component={Link}
                                href="/"
                                underline="hover"
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                            >
                                <HomeIcon fontSize="small" />
                                Inicio
                            </MuiLink>
                            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <GavelIcon fontSize="small" />
                                Términos y Condiciones
                            </Typography>
                        </Breadcrumbs>
                    </motion.div>

                    <Box sx={{ display: 'flex', gap: 3 }}>
                        {/* Sidebar - Desktop */}
                        {!isMobile && (
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <Paper
                                    elevation={3}
                                    sx={{
                                        width: 280,
                                        position: 'sticky',
                                        top: 100,
                                        maxHeight: 'calc(100vh - 120px)',
                                        overflow: 'auto',
                                    }}
                                >
                                    {sidebar}
                                </Paper>
                            </motion.div>
                        )}

                        {/* Mobile Menu Button */}
                        {isMobile && (
                            <Fab
                                color="primary"
                                sx={{ position: 'fixed', bottom: 80, left: 16, zIndex: 1000 }}
                                onClick={() => setMobileOpen(true)}
                            >
                                <MenuIcon />
                            </Fab>
                        )}

                        {/* Mobile Drawer */}
                        <Drawer
                            anchor="left"
                            open={mobileOpen}
                            onClose={() => setMobileOpen(false)}
                        >
                            {sidebar}
                        </Drawer>

                        {/* Main Content */}
                        <Box sx={{ flex: 1 }}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <Paper elevation={3} sx={{ p: { xs: 3, md: 5 } }}>
                                    {/* Header */}
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                                            Términos y Condiciones
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                            <Chip label="Última actualización: 19 de Octubre, 2025" color="primary" variant="outlined" />
                                            <Chip label="Versión 1.0" color="secondary" variant="outlined" />
                                        </Box>
                                    </Box>

                                    <Divider sx={{ mb: 4 }} />

                                    {/* Section 1 */}
                                    <Box id="introduccion" sx={{ mb: 5, scrollMarginTop: '100px' }}>
                                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            1. Introducción
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            Bienvenido a MDR Construcciones. Estos términos y condiciones describen las reglas y regulaciones
                                            para el uso del sitio web de MDR Construcciones, ubicado en www.mdrconstrucciones.com.
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            Al acceder a este sitio web, asumimos que aceptas estos términos y condiciones. No continúes
                                            usando MDR Construcciones si no estás de acuerdo con todos los términos y condiciones establecidos
                                            en esta página.
                                        </Typography>
                                    </Box>

                                    {/* Section 2 */}
                                    <Box id="uso" sx={{ mb: 5, scrollMarginTop: '100px' }}>
                                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            2. Uso del Servicio
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            Al utilizar nuestros servicios, te comprometes a:
                                        </Typography>
                                        <List sx={{ pl: 2 }}>
                                            <ListItem>
                                                <Typography variant="body1">• Proporcionar información precisa y actualizada</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1">• Mantener la seguridad de tu cuenta</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1">• No utilizar el servicio para fines ilegales</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1">• Respetar los derechos de propiedad intelectual</Typography>
                                            </ListItem>
                                        </List>
                                    </Box>

                                    {/* Section 3 */}
                                    <Box id="propiedad" sx={{ mb: 5, scrollMarginTop: '100px' }}>
                                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            3. Propiedad Intelectual
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            A menos que se indique lo contrario, MDR Construcciones y/o sus licenciantes poseen los derechos
                                            de propiedad intelectual de todo el material en MDR Construcciones. Todos los derechos de
                                            propiedad intelectual están reservados.
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            Puedes acceder a esto desde MDR Construcciones para tu uso personal sujeto a las restricciones
                                            establecidas en estos términos y condiciones.
                                        </Typography>
                                    </Box>

                                    {/* Section 4 */}
                                    <Box id="limitaciones" sx={{ mb: 5, scrollMarginTop: '100px' }}>
                                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            4. Limitaciones de Responsabilidad
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            En ningún caso MDR Construcciones, ni ninguno de sus funcionarios, directores y empleados, será
                                            responsable de cualquier cosa que surja de o esté de alguna manera relacionada con tu uso de este
                                            sitio web.
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            MDR Construcciones, incluidos sus funcionarios, directores y empleados, no serán responsables de
                                            ningún daño indirecto, consecuente o especial que surja de o esté relacionado con el uso de este
                                            sitio web.
                                        </Typography>
                                    </Box>

                                    {/* Section 5 */}
                                    <Box id="modificaciones" sx={{ mb: 5, scrollMarginTop: '100px' }}>
                                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            5. Modificaciones
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            MDR Construcciones se reserva el derecho de revisar estos términos en cualquier momento según lo
                                            considere oportuno, y al usar este sitio web se espera que revises estos términos de forma regular.
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            Si continúas utilizando el sitio web después de que se publiquen cambios en estos términos,
                                            se considerará que has aceptado esos cambios.
                                        </Typography>
                                    </Box>

                                    {/* Section 6 */}
                                    <Box id="contacto" sx={{ mb: 5, scrollMarginTop: '100px' }}>
                                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            6. Contacto
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            Si tienes alguna pregunta sobre estos Términos y Condiciones, puedes contactarnos:
                                        </Typography>
                                        <List sx={{ pl: 2 }}>
                                            <ListItem>
                                                <Typography variant="body1">• Por correo electrónico: info@mdrconstrucciones.com</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1">• Por teléfono: +34 XXX XXX XXX</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1">• Visitando esta página en nuestro sitio web: www.mdrconstrucciones.com/contacto</Typography>
                                            </ListItem>
                                        </List>
                                    </Box>

                                    <Divider sx={{ my: 4 }} />

                                    {/* Footer */}
                                    <Box sx={{ textAlign: 'center', py: 3 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            © 2025 MDR Construcciones. Todos los derechos reservados.
                                        </Typography>
                                    </Box>
                                </Paper>
                            </motion.div>
                        </Box>
                    </Box>
                </Container>

                {/* Scroll to Top Button */}
                {showScrollTop && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                    >
                        <Fab
                            color="primary"
                            sx={{ position: 'fixed', bottom: 16, right: 16 }}
                            onClick={scrollToTop}
                        >
                            <KeyboardArrowUpIcon />
                        </Fab>
                    </motion.div>
                )}
            </Box>
        </GuestLayout>
    );
}

