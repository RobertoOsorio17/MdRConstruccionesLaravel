import React from 'react';
import { Box, Breadcrumbs as MuiBreadcrumbs, Link, Typography, Container } from '@mui/material';
import { NavigateNext as NavigateNextIcon, Home as HomeIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { router, usePage } from '@inertiajs/react';

export default function Breadcrumbs() {
    const { url } = usePage();
    
    const pathnames = url.split('/').filter(x => x);
    
    if (pathnames.length === 0) return null;

    const breadcrumbNameMap = {
        'servicios': 'Servicios',
        'proyectos': 'Proyectos',
        'blog': 'Blog',
        'empresa': 'Empresa',
        'contacto': 'Contacto',
        'admin': 'Administración',
        'dashboard': 'Panel',
        'profile': 'Perfil',
        'settings': 'Configuración'
    };

    return (
        <Box
            sx={{
                py: 2,
                borderBottom: (theme) => theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.08)'
                    : '1px solid rgba(0, 0, 0, 0.08)',
                background: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(18, 18, 18, 0.5)'
                    : 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)'
            }}
        >
            <Container maxWidth="lg">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <MuiBreadcrumbs
                        separator={<NavigateNextIcon fontSize="small" />}
                        aria-label="breadcrumb"
                        sx={{
                            '& .MuiBreadcrumbs-separator': {
                                color: 'text.secondary'
                            }
                        }}
                    >
                        <Link
                            component="button"
                            onClick={() => router.visit('/')}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                color: 'text.secondary',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    color: 'primary.main',
                                    textDecoration: 'none'
                                }
                            }}
                        >
                            <HomeIcon sx={{ mr: 0.5, fontSize: '1.1rem' }} />
                            Inicio
                        </Link>

                        {pathnames.map((value, index) => {
                            const last = index === pathnames.length - 1;
                            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                            const label = breadcrumbNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

                            return last ? (
                                <Typography
                                    key={to}
                                    sx={{
                                        color: 'text.primary',
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                    }}
                                >
                                    {label}
                                </Typography>
                            ) : (
                                <Link
                                    key={to}
                                    component="button"
                                    onClick={() => router.visit(to)}
                                    sx={{
                                        color: 'text.secondary',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            color: 'primary.main',
                                            textDecoration: 'none'
                                        }
                                    }}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </MuiBreadcrumbs>
                </motion.div>
            </Container>
        </Box>
    );
}
