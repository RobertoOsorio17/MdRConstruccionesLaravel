import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    alpha,
    Fade,
    Popper,
    ClickAwayListener
} from '@mui/material';
import {
    Build as BuildIcon,
    Home as HomeIcon,
    Apartment as ApartmentIcon,
    Foundation as FoundationIcon,
    Roofing as RoofingIcon,
    Kitchen as KitchenIcon,
    Bathroom as BathroomIcon,
    Landscape as LandscapeIcon,
    Construction as ConstructionIcon,
    Brush as PaintIcon,
    ElectricalServices as ElectricalIcon,
    Plumbing as PlumbingIcon,
    Hvac as HvacIcon,
    Window as WindowIcon,
    Deck as DeckIcon,
    Pool as PoolIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { router } from '@inertiajs/react';

const services = [
    {
        id: 'albanileria-general',
        title: 'Reformas Integrales',
        description: 'Transformación completa de espacios',
        icon: <HomeIcon />,
        color: '#3b82f6',
        href: '/servicios/albanileria-general',
        featured: true
    },
    {
        id: 'rehabilitacion-de-fachadas',
        title: 'Rehabilitación de Fachadas',
        description: 'Mejora de edificios y fachadas',
        icon: <ApartmentIcon />,
        color: '#10b981',
        href: '/servicios/rehabilitacion-de-fachadas',
        featured: true
    },
    {
        id: 'reforma-de-cocinas',
        title: 'Cocinas',
        description: 'Diseño y reforma de cocinas',
        icon: <KitchenIcon />,
        color: '#8b5cf6',
        href: '/servicios/reforma-de-cocinas',
        featured: true
    },
    {
        id: 'reforma-de-banos',
        title: 'Baños',
        description: 'Modernización y reformas',
        icon: <BathroomIcon />,
        color: '#06b6d4',
        href: '/servicios/reforma-de-banos',
        featured: true
    },
    {
        id: 'pintura-y-decoracion',
        title: 'Pintura y Decoración',
        description: 'Acabados profesionales',
        icon: <PaintIcon />,
        color: '#ec4899',
        href: '/servicios/pintura-y-decoracion'
    },
    {
        id: 'instalaciones-electricas',
        title: 'Instalaciones Eléctricas',
        description: 'Sistemas eléctricos completos',
        icon: <ElectricalIcon />,
        color: '#f59e0b',
        href: '/servicios/instalaciones-electricas'
    },
    {
        id: 'fontaneria',
        title: 'Fontanería',
        description: 'Instalación y reparación',
        icon: <PlumbingIcon />,
        color: '#0ea5e9',
        href: '/servicios'
    },
    {
        id: 'climatizacion',
        title: 'Climatización',
        description: 'Sistemas de calefacción y A/C',
        icon: <HvacIcon />,
        color: '#14b8a6',
        href: '/servicios'
    },
    {
        id: 'ventanas',
        title: 'Ventanas y Puertas',
        description: 'Instalación y cambio',
        icon: <WindowIcon />,
        color: '#6366f1',
        href: '/servicios'
    },
    {
        id: 'estructuras',
        title: 'Estructuras',
        description: 'Refuerzo estructural',
        icon: <FoundationIcon />,
        color: '#78716c',
        href: '/servicios'
    },
    {
        id: 'cubiertas',
        title: 'Cubiertas y Tejados',
        description: 'Instalación y reparación',
        icon: <RoofingIcon />,
        color: '#ef4444',
        href: '/servicios'
    },
    {
        id: 'exteriores',
        title: 'Exteriores',
        description: 'Jardines y terrazas',
        icon: <LandscapeIcon />,
        color: '#84cc16',
        href: '/servicios'
    },
    {
        id: 'piscinas',
        title: 'Piscinas',
        description: 'Construcción y mantenimiento',
        icon: <PoolIcon />,
        color: '#06b6d4',
        href: '/servicios'
    },
    {
        id: 'terrazas',
        title: 'Terrazas y Porches',
        description: 'Espacios al aire libre',
        icon: <DeckIcon />,
        color: '#a855f7',
        href: '/servicios'
    },
    {
        id: 'mantenimiento',
        title: 'Mantenimiento',
        description: 'Servicios de mantenimiento',
        icon: <ConstructionIcon />,
        color: '#f97316',
        href: '/servicios'
    }
];

export default function MegaMenu({ anchorEl, open, onClose, onNavigate }) {
    return (
        <Popper
            open={open}
            anchorEl={anchorEl}
            placement="bottom-start"
            transition
            disablePortal={false}
            modifiers={[
                {
                    name: 'offset',
                    options: {
                        offset: [0, 8],
                    },
                },
                {
                    name: 'preventOverflow',
                    options: {
                        boundary: 'viewport',
                        padding: 8,
                    },
                },
            ]}
            sx={{ zIndex: 1300 }}
        >
            {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={300}>
                    <Paper
                        elevation={0}
                        sx={{
                            mt: 1,
                            width: 720,
                            maxWidth: '90vw',
                            background: (theme) => theme.palette.mode === 'dark'
                                ? 'linear-gradient(145deg, rgba(30, 30, 30, 0.98) 0%, rgba(18, 18, 18, 0.95) 100%)'
                                : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            borderRadius: 4,
                            border: (theme) => theme.palette.mode === 'dark'
                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                : '1px solid rgba(0, 0, 0, 0.08)',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                            overflow: 'hidden',
                            position: 'relative',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '2px',
                                background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.6) 50%, transparent 100%)',
                            }
                        }}
                    >
                        <ClickAwayListener onClickAway={onClose}>
                            <Box sx={{ p: 3 }}>
                                {/* Servicios Destacados */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            mb: 2,
                                            fontWeight: 700,
                                            color: 'text.primary',
                                            fontSize: '1.1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 4,
                                                height: 24,
                                                background: 'linear-gradient(180deg, #3b82f6, #8b5cf6)',
                                                borderRadius: 1
                                            }}
                                        />
                                        Servicios Destacados
                                    </Typography>

                                    <Grid container spacing={2}>
                                        {services.filter(s => s.featured).map((service, index) => (
                                            <Grid item xs={12} sm={6} md={3} key={service.id}>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: index * 0.05,
                                                    duration: 0.3,
                                                    type: "spring",
                                                    stiffness: 300
                                                }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Box
                                                    onClick={() => {
                                                        onClose();
                                                        onNavigate(service.href);
                                                    }}
                                                    sx={{
                                                        p: 2.5,
                                                        borderRadius: 3,
                                                        cursor: 'pointer',
                                                        background: (theme) => theme.palette.mode === 'dark'
                                                            ? 'rgba(255, 255, 255, 0.03)'
                                                            : 'rgba(255, 255, 255, 0.5)',
                                                        border: (theme) => theme.palette.mode === 'dark'
                                                            ? '1px solid rgba(255, 255, 255, 0.05)'
                                                            : '1px solid rgba(0, 0, 0, 0.05)',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        '&::before': {
                                                            content: '""',
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            bottom: 0,
                                                            background: `linear-gradient(145deg, ${alpha(service.color, 0.1)}, transparent)`,
                                                            opacity: 0,
                                                            transition: 'opacity 0.3s ease',
                                                        },
                                                        '&:hover': {
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: `0 12px 24px ${alpha(service.color, 0.2)}`,
                                                            borderColor: alpha(service.color, 0.3),
                                                            '&::before': {
                                                                opacity: 1,
                                                            },
                                                            '& .service-icon': {
                                                                transform: 'scale(1.1) rotate(5deg)',
                                                                color: service.color,
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <Box
                                                        className="service-icon"
                                                        sx={{
                                                            width: 48,
                                                            height: 48,
                                                            borderRadius: 2,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            mb: 1.5,
                                                            background: alpha(service.color, 0.1),
                                                            color: service.color,
                                                            transition: 'all 0.3s ease',
                                                            '& svg': {
                                                                fontSize: 28
                                                            }
                                                        }}
                                                    >
                                                        {service.icon}
                                                    </Box>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: 'text.primary',
                                                            mb: 0.5,
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        {service.title}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: 'text.secondary',
                                                            display: 'block',
                                                            lineHeight: 1.4,
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        {service.description}
                                                    </Typography>
                                                </Box>
                                            </motion.div>
                                        </Grid>
                                    ))}
                                </Grid>
                                </Box>

                                {/* Todos los Servicios */}
                                <Box sx={{ mt: 3 }}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            mb: 2,
                                            fontWeight: 600,
                                            color: 'text.secondary',
                                            fontSize: '0.85rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}
                                    >
                                        Más Servicios
                                    </Typography>

                                    <Grid container spacing={1.5}>
                                        {services.filter(s => !s.featured).map((service, index) => (
                                            <Grid item xs={6} sm={4} md={3} key={service.id}>
                                                <Box
                                                    onClick={() => {
                                                        onClose();
                                                        onNavigate(service.href);
                                                    }}
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1.5,
                                                        background: (theme) => theme.palette.mode === 'dark'
                                                            ? 'rgba(255, 255, 255, 0.02)'
                                                            : 'rgba(0, 0, 0, 0.02)',
                                                        border: (theme) => theme.palette.mode === 'dark'
                                                            ? '1px solid rgba(255, 255, 255, 0.03)'
                                                            : '1px solid rgba(0, 0, 0, 0.03)',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            background: (theme) => theme.palette.mode === 'dark'
                                                                ? 'rgba(255, 255, 255, 0.05)'
                                                                : 'rgba(0, 0, 0, 0.04)',
                                                            borderColor: alpha(service.color, 0.3),
                                                            transform: 'translateX(4px)',
                                                            '& .service-icon-small': {
                                                                color: service.color,
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <Box
                                                        className="service-icon-small"
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: 1.5,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: alpha(service.color, 0.1),
                                                            color: service.color,
                                                            transition: 'all 0.2s ease',
                                                            flexShrink: 0,
                                                            '& svg': {
                                                                fontSize: 18
                                                            }
                                                        }}
                                                    >
                                                        {service.icon}
                                                    </Box>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: 500,
                                                            color: 'text.primary',
                                                            fontSize: '0.8rem',
                                                            lineHeight: 1.3
                                                        }}
                                                    >
                                                        {service.title}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>

                                <Box
                                    sx={{
                                        mt: 3,
                                        pt: 3,
                                        borderTop: (theme) => theme.palette.mode === 'dark'
                                            ? '1px solid rgba(255, 255, 255, 0.08)'
                                            : '1px solid rgba(0, 0, 0, 0.08)',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'primary.main',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateX(4px)',
                                                color: 'primary.dark'
                                            }
                                        }}
                                        onClick={() => {
                                            onClose();
                                            onNavigate('/servicios');
                                        }}
                                    >
                                        Ver todos los servicios
                                        <Box component="span" sx={{ fontSize: '1.2em' }}>→</Box>
                                    </Typography>
                                </Box>
                            </Box>
                        </ClickAwayListener>
                    </Paper>
                </Fade>
            )}
        </Popper>
    );
}
