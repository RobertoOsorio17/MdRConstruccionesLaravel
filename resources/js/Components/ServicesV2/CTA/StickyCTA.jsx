/**
 * StickyCTA Component
 * 
 * Panel sticky lateral (desktop) y barra inferior (mobile) con CTAs principales,
 * WhatsApp, teléfono y acceso al wizard de cotización.
 * 
 * Props:
 * - ctaConfig: object - Configuración de CTAs
 * - position: string - 'right' (desktop) | 'bottom' (mobile)
 * - service: object - Datos del servicio actual
 * - onOpenWizard: function - Callback para abrir wizard
 * - showScrollTop: boolean - Mostrar botón scroll to top
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    IconButton,
    Fab,
    Tooltip,
    Zoom,
    Slide,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import {
    RequestQuote,
    WhatsApp,
    Phone,
    KeyboardArrowUp,
    Close,
    CalendarMonth
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import designSystem from '@/theme/designSystem';
import { useDeviceBreakpoints, useScrollDirection } from '@/Hooks/useDeviceBreakpoints';
import { trackCTAClick } from '@/Utils/trackEvent';

const StickyCTA = ({
    ctaConfig = {},
    position = 'auto', // 'auto', 'right', 'bottom'
    service = {},
    onOpenWizard,
    showScrollTop = true
}) => {
    const theme = useTheme();
    const { isMobile, isTablet } = useDeviceBreakpoints();
    const { scrollDirection, scrollY } = useScrollDirection();
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Determinar posición automática basada en dispositivo
    const actualPosition = position === 'auto' 
        ? (isMobile || isTablet ? 'bottom' : 'right')
        : position;

    // Mostrar CTA después de scroll inicial
    useEffect(() => {
        const threshold = 300; // Mostrar después de 300px de scroll
        setIsVisible(scrollY > threshold);
    }, [scrollY]);

    // Ocultar en mobile cuando se hace scroll down (para no obstruir contenido)
    const shouldHide = actualPosition === 'bottom' && scrollDirection === 'down' && scrollY > 500;

    const handleScrollTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackCTAClick('scroll_top', 'Volver arriba', service?.slug);
    };

    const handleWhatsAppClick = () => {
        const message = encodeURIComponent(
            `Hola, estoy interesado en el servicio: ${service?.title || 'Construcción'}`
        );
        const whatsappNumber = ctaConfig.whatsapp?.number || '34123456789';
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
        trackCTAClick('whatsapp', 'WhatsApp Directo', service?.slug);
    };

    const handlePhoneClick = () => {
        const phoneNumber = ctaConfig.phone?.number || '+34123456789';
        window.location.href = `tel:${phoneNumber}`;
        trackCTAClick('phone', 'Llamar Ahora', service?.slug);
    };

    const handleWizardClick = () => {
        if (onOpenWizard) {
            onOpenWizard();
        }
        trackCTAClick('primary', 'Solicitar Asesoría', service?.slug);
    };

    // Desktop: Panel lateral derecho
    if (actualPosition === 'right') {
        return (
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={{
                            position: 'fixed',
                            right: designSystem.spacing[4],
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: designSystem.zIndex.fab
                        }}
                    >
                        <Stack
                            spacing={designSystem.spacing[2]}
                            sx={{
                                ...designSystem.glassmorphism.medium,
                                borderRadius: designSystem.borders.radius.xl,
                                p: designSystem.spacing[3],
                                boxShadow: designSystem.shadows.glass,
                                minWidth: 200
                            }}
                        >
                            {/* CTA Principal */}
                            <Tooltip title="Solicitar asesoría personalizada" placement="left">
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<RequestQuote />}
                                    onClick={handleWizardClick}
                                    sx={{
                                        background: `linear-gradient(135deg, ${designSystem.colors.primary[600]} 0%, ${designSystem.colors.accent.purple} 100%)`,
                                        color: designSystem.colors.text.inverse,
                                        fontWeight: 700,
                                        py: designSystem.spacing[2],
                                        transition: designSystem.transitions.presets.allNormal,
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: designSystem.shadows.colored.primaryHover
                                        }
                                    }}
                                >
                                    Solicitar Asesoría
                                </Button>
                            </Tooltip>

                            {/* WhatsApp */}
                            <Tooltip title="Contactar por WhatsApp" placement="left">
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<WhatsApp />}
                                    onClick={handleWhatsAppClick}
                                    sx={{
                                        borderColor: '#25D366',
                                        color: '#25D366',
                                        fontWeight: 600,
                                        '&:hover': {
                                            borderColor: '#25D366',
                                            bgcolor: 'rgba(37, 211, 102, 0.1)'
                                        }
                                    }}
                                >
                                    WhatsApp
                                </Button>
                            </Tooltip>

                            {/* Teléfono */}
                            <Tooltip title="Llamar ahora" placement="left">
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<Phone />}
                                    onClick={handlePhoneClick}
                                    sx={{
                                        borderColor: designSystem.colors.primary[600],
                                        color: designSystem.colors.primary[600],
                                        fontWeight: 600
                                    }}
                                >
                                    Llamar
                                </Button>
                            </Tooltip>

                            {/* Scroll to Top */}
                            {showScrollTop && scrollY > 500 && (
                                <Zoom in={scrollY > 500}>
                                    <IconButton
                                        onClick={handleScrollTop}
                                        sx={{
                                            bgcolor: designSystem.colors.surface.primary,
                                            border: `1px solid ${designSystem.colors.border.main}`,
                                            '&:hover': {
                                                bgcolor: designSystem.colors.surface.secondary
                                            }
                                        }}
                                    >
                                        <KeyboardArrowUp />
                                    </IconButton>
                                </Zoom>
                            )}
                        </Stack>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    // Mobile/Tablet: Barra inferior
    return (
        <Slide direction="up" in={isVisible && !shouldHide} mountOnEnter unmountOnExit>
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: designSystem.zIndex.fab,
                    ...designSystem.glassmorphism.strong,
                    borderTop: `1px solid ${designSystem.colors.border.light}`,
                    boxShadow: `0 -4px 20px rgba(0,0,0,0.1)`,
                    p: designSystem.spacing[2]
                }}
            >
                <Stack
                    direction="row"
                    spacing={designSystem.spacing[2]}
                    sx={{ maxWidth: 600, mx: 'auto' }}
                >
                    {/* CTA Principal */}
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<RequestQuote />}
                        onClick={handleWizardClick}
                        sx={{
                            background: `linear-gradient(135deg, ${designSystem.colors.primary[600]} 0%, ${designSystem.colors.accent.purple} 100%)`,
                            color: designSystem.colors.text.inverse,
                            fontWeight: 700,
                            py: designSystem.spacing[2],
                            fontSize: '0.9rem',
                            transition: designSystem.transitions.presets.allNormal
                        }}
                    >
                        Solicitar
                    </Button>

                    {/* WhatsApp */}
                    <Tooltip title="WhatsApp">
                        <IconButton
                            onClick={handleWhatsAppClick}
                            sx={{
                                bgcolor: '#25D366',
                                color: 'white',
                                width: 48,
                                height: 48,
                                '&:hover': {
                                    bgcolor: '#20BA5A'
                                }
                            }}
                        >
                            <WhatsApp />
                        </IconButton>
                    </Tooltip>

                    {/* Teléfono */}
                    <Tooltip title="Llamar">
                        <IconButton
                            onClick={handlePhoneClick}
                            sx={{
                                bgcolor: designSystem.colors.primary[600],
                                color: 'white',
                                width: 48,
                                height: 48,
                                '&:hover': {
                                    bgcolor: designSystem.colors.primary[700]
                                }
                            }}
                        >
                            <Phone />
                        </IconButton>
                    </Tooltip>
                </Stack>

                {/* Scroll to Top FAB */}
                {showScrollTop && scrollY > 500 && (
                    <Zoom in={scrollY > 500}>
                        <Fab
                            size="small"
                            onClick={handleScrollTop}
                            sx={{
                                position: 'absolute',
                                bottom: 80,
                                right: 16,
                                bgcolor: designSystem.colors.surface.primary,
                                boxShadow: designSystem.shadows.lg,
                                '&:hover': {
                                    bgcolor: designSystem.colors.surface.secondary
                                }
                            }}
                        >
                            <KeyboardArrowUp />
                        </Fab>
                    </Zoom>
                )}
            </Box>
        </Slide>
    );
};

export default StickyCTA;

