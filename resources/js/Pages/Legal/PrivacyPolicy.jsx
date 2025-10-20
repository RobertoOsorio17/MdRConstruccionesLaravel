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
    Alert,
} from '@mui/material';
import {
    Home as HomeIcon,
    Security as SecurityIcon,
    Menu as MenuIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    Shield as ShieldIcon,
} from '@mui/icons-material';
import GuestLayout from '@/Layouts/GuestLayout';

export default function PrivacyPolicy() {
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
            
            const sections = ['introduccion', 'recopilacion', 'uso', 'cookies', 'seguridad', 'derechos', 'contacto'];
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
        { id: 'recopilacion', title: '2. Recopilación de Datos' },
        { id: 'uso', title: '3. Uso de Datos' },
        { id: 'cookies', title: '4. Cookies' },
        { id: 'seguridad', title: '5. Seguridad' },
        { id: 'derechos', title: '6. Tus Derechos' },
        { id: 'contacto', title: '7. Contacto' },
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
                <SecurityIcon color="primary" />
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
            <Head title="Política de Privacidad - MDR Construcciones" />

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
                                <SecurityIcon fontSize="small" />
                                Política de Privacidad
                            </Typography>
                        </Breadcrumbs>
                    </motion.div>

                    <Box sx={{ display: 'flex', gap: 3 }}>
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

                        {isMobile && (
                            <Fab
                                color="primary"
                                sx={{ position: 'fixed', bottom: 80, left: 16, zIndex: 1000 }}
                                onClick={() => setMobileOpen(true)}
                            >
                                <MenuIcon />
                            </Fab>
                        )}

                        <Drawer
                            anchor="left"
                            open={mobileOpen}
                            onClose={() => setMobileOpen(false)}
                        >
                            {sidebar}
                        </Drawer>

                        <Box sx={{ flex: 1 }}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <Paper elevation={3} sx={{ p: { xs: 3, md: 5 } }}>
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <ShieldIcon sx={{ fontSize: 48 }} />
                                            Política de Privacidad
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 3 }}>
                                            <Chip label="Última actualización: 19 de Octubre, 2025" color="primary" variant="outlined" />
                                            <Chip label="GDPR Compliant" color="success" variant="outlined" />
                                        </Box>
                                        <Alert severity="info" sx={{ mb: 3 }}>
                                            Tu privacidad es importante para nosotros. Esta política explica cómo recopilamos, usamos y protegemos tu información personal.
                                        </Alert>
                                    </Box>

                                    <Divider sx={{ mb: 4 }} />

                                    {/* Section 1 */}
                                    <Box id="introduccion" sx={{ mb: 5, scrollMarginTop: '100px' }}>
                                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            1. Introducción
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            En MDR Construcciones, accesible desde www.mdrconstrucciones.com, una de nuestras principales
                                            prioridades es la privacidad de nuestros visitantes. Este documento de Política de Privacidad
                                            contiene tipos de información que es recopilada y registrada por MDR Construcciones y cómo la usamos.
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            Si tienes preguntas adicionales o requieres más información sobre nuestra Política de Privacidad,
                                            no dudes en contactarnos.
                                        </Typography>
                                    </Box>

                                    {/* Section 2 */}
                                    <Box id="recopilacion" sx={{ mb: 5, scrollMarginTop: '100px' }}>
                                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            2. Recopilación de Datos
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            Recopilamos varios tipos de información para diversos propósitos para proporcionar y mejorar
                                            nuestro servicio para ti:
                                        </Typography>
                                        <List sx={{ pl: 2 }}>
                                            <ListItem>
                                                <Typography variant="body1"><strong>Datos personales:</strong> Nombre, dirección de correo electrónico, número de teléfono</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1"><strong>Datos de uso:</strong> Información sobre cómo se utiliza nuestro servicio</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1"><strong>Datos de seguimiento:</strong> Cookies y tecnologías de seguimiento similares</Typography>
                                            </ListItem>
                                        </List>
                                    </Box>

                                    {/* Section 3 */}
                                    <Box id="uso" sx={{ mb: 5, scrollMarginTop: '100px' }}>
                                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            3. Uso de Datos
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            MDR Construcciones utiliza los datos recopilados para varios propósitos:
                                        </Typography>
                                        <List sx={{ pl: 2 }}>
                                            <ListItem>
                                                <Typography variant="body1">• Proporcionar y mantener nuestro servicio</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1">• Notificarte sobre cambios en nuestro servicio</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1">• Permitirte participar en funciones interactivas cuando elijas hacerlo</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1">• Proporcionar atención y soporte al cliente</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1">• Proporcionar análisis o información valiosa para mejorar el servicio</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1">• Monitorear el uso del servicio</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1">• Detectar, prevenir y abordar problemas técnicos</Typography>
                                            </ListItem>
                                        </List>
                                    </Box>

                                    {/* Section 4 */}
                                    <Box id="cookies" sx={{ mb: 5, scrollMarginTop: '100px' }}>
                                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            4. Cookies y Tecnologías de Seguimiento
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            Utilizamos cookies y tecnologías de seguimiento similares para rastrear la actividad en nuestro
                                            servicio y mantener cierta información.
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            Las cookies son archivos con una pequeña cantidad de datos que pueden incluir un identificador
                                            único anónimo. Puedes instruir a tu navegador para que rechace todas las cookies o para que
                                            indique cuándo se está enviando una cookie.
                                        </Typography>
                                        <Alert severity="warning" sx={{ my: 2 }}>
                                            Si no aceptas cookies, es posible que no puedas usar algunas partes de nuestro servicio.
                                        </Alert>
                                    </Box>

                                    {/* Section 5 */}
                                    <Box id="seguridad" sx={{ mb: 5, scrollMarginTop: '100px' }}>
                                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            5. Seguridad de los Datos
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            La seguridad de tus datos es importante para nosotros, pero recuerda que ningún método de
                                            transmisión por Internet o método de almacenamiento electrónico es 100% seguro.
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            Si bien nos esforzamos por utilizar medios comercialmente aceptables para proteger tus datos
                                            personales, no podemos garantizar su seguridad absoluta.
                                        </Typography>
                                        <Alert severity="success" sx={{ my: 2 }}>
                                            Utilizamos encriptación SSL/TLS para proteger la transmisión de datos sensibles.
                                        </Alert>
                                    </Box>

                                    {/* Section 6 */}
                                    <Box id="derechos" sx={{ mb: 5, scrollMarginTop: '100px' }}>
                                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            6. Tus Derechos de Protección de Datos
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            Tienes ciertos derechos de protección de datos. MDR Construcciones tiene como objetivo tomar
                                            medidas razonables para permitirte corregir, modificar, eliminar o limitar el uso de tus datos
                                            personales.
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            Tienes los siguientes derechos:
                                        </Typography>
                                        <List sx={{ pl: 2 }}>
                                            <ListItem>
                                                <Typography variant="body1"><strong>Derecho de acceso:</strong> Tienes derecho a solicitar copias de tus datos personales</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1"><strong>Derecho de rectificación:</strong> Tienes derecho a solicitar que corrijamos cualquier información que creas que es inexacta</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1"><strong>Derecho de eliminación:</strong> Tienes derecho a solicitar que eliminemos tus datos personales</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1"><strong>Derecho a restringir el procesamiento:</strong> Tienes derecho a solicitar que restrinjamos el procesamiento de tus datos personales</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1"><strong>Derecho a la portabilidad de datos:</strong> Tienes derecho a solicitar que transfiramos los datos que hemos recopilado a otra organización</Typography>
                                            </ListItem>
                                        </List>
                                    </Box>

                                    {/* Section 7 */}
                                    <Box id="contacto" sx={{ mb: 5, scrollMarginTop: '100px' }}>
                                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                                            7. Contacto
                                        </Typography>
                                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                                            Si tienes alguna pregunta sobre esta Política de Privacidad, puedes contactarnos:
                                        </Typography>
                                        <List sx={{ pl: 2 }}>
                                            <ListItem>
                                                <Typography variant="body1">• Por correo electrónico: privacy@mdrconstrucciones.com</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1">• Por teléfono: +34 XXX XXX XXX</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant="body1">• Visitando esta página: www.mdrconstrucciones.com/contacto</Typography>
                                            </ListItem>
                                        </List>
                                    </Box>

                                    <Divider sx={{ my: 4 }} />

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

