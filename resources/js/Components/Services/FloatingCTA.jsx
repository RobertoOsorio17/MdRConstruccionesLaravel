import React, { useState, useEffect } from 'react';
import { Box, Fab, Zoom, Stack, Typography, Tooltip, Badge } from '@mui/material';
import {
    RequestQuote,
    Phone,
    WhatsApp,
    Email,
    Close,
    KeyboardArrowUp,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingCTA = ({ onRequestQuote, showScrollTop = true }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showScroll, setShowScroll] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScroll(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const actions = [
        {
            icon: <Phone />,
            label: 'Llamar',
            color: '#3b82f6',
            action: () => window.location.href = 'tel:+34123456789',
        },
        {
            icon: <WhatsApp />,
            label: 'WhatsApp',
            color: '#10b981',
            action: () => window.open('https://wa.me/34123456789', '_blank'),
        },
        {
            icon: <Email />,
            label: 'Email',
            color: '#8b5cf6',
            action: () => window.location.href = 'mailto:info@mdrconstrucciones.es',
        },
        {
            icon: <RequestQuote />,
            label: 'Presupuesto',
            color: '#f59e0b',
            action: onRequestQuote,
        },
    ];

    return (
        <>
            {/* Main FAB */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: { xs: 20, md: 32 },
                    right: { xs: 20, md: 32 },
                    zIndex: 9999,
                }}
            >
                <Stack spacing={2} alignItems="flex-end">
                    {/* Scroll to Top Button */}
                    {showScrollTop && (
                        <Zoom in={showScroll}>
                            <Tooltip title="Volver arriba" placement="left">
                                <Fab
                                    size="small"
                                    onClick={scrollToTop}
                                    sx={{
                                        bgcolor: 'white',
                                        color: '#64748b',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        '&:hover': {
                                            bgcolor: '#f8fafc',
                                        },
                                    }}
                                >
                                    <KeyboardArrowUp />
                                </Fab>
                            </Tooltip>
                        </Zoom>
                    )}

                    {/* Action Buttons */}
                    <AnimatePresence>
                        {isOpen && (
                            <Stack spacing={2} alignItems="flex-end">
                                {actions.map((action, index) => (
                                    <motion.div
                                        key={action.label}
                                        initial={{ opacity: 0, scale: 0, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0, y: 20 }}
                                        transition={{
                                            duration: 0.2,
                                            delay: index * 0.05,
                                        }}
                                    >
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: index * 0.05 + 0.1 }}
                                            >
                                                <Box
                                                    sx={{
                                                        bgcolor: 'white',
                                                        px: 2,
                                                        py: 1,
                                                        borderRadius: 2,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={600}
                                                        sx={{ whiteSpace: 'nowrap' }}
                                                    >
                                                        {action.label}
                                                    </Typography>
                                                </Box>
                                            </motion.div>
                                            <Tooltip title={action.label} placement="left">
                                                <Fab
                                                    size="medium"
                                                    onClick={action.action}
                                                    sx={{
                                                        bgcolor: action.color,
                                                        color: 'white',
                                                        boxShadow: `0 4px 12px ${action.color}40`,
                                                        '&:hover': {
                                                            bgcolor: action.color,
                                                            transform: 'scale(1.1)',
                                                        },
                                                    }}
                                                >
                                                    {action.icon}
                                                </Fab>
                                            </Tooltip>
                                        </Stack>
                                    </motion.div>
                                ))}
                            </Stack>
                        )}
                    </AnimatePresence>

                    {/* Main Toggle Button */}
                    <motion.div
                        animate={{
                            rotate: isOpen ? 45 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        <Badge
                            badgeContent={4}
                            color="error"
                            invisible={isOpen}
                            sx={{
                                '& .MuiBadge-badge': {
                                    fontSize: '0.7rem',
                                    height: 20,
                                    minWidth: 20,
                                    borderRadius: '10px',
                                },
                            }}
                        >
                            <Fab
                                color="primary"
                                onClick={() => setIsOpen(!isOpen)}
                                sx={{
                                    width: 64,
                                    height: 64,
                                    background: isOpen
                                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    boxShadow: isOpen
                                        ? '0 8px 24px rgba(239, 68, 68, 0.4)'
                                        : '0 8px 24px rgba(59, 130, 246, 0.4)',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                        boxShadow: isOpen
                                            ? '0 12px 32px rgba(239, 68, 68, 0.5)'
                                            : '0 12px 32px rgba(59, 130, 246, 0.5)',
                                    },
                                }}
                            >
                                {isOpen ? <Close sx={{ fontSize: 32 }} /> : <RequestQuote sx={{ fontSize: 32 }} />}
                            </Fab>
                        </Badge>
                    </motion.div>
                </Stack>
            </Box>

            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            backdropFilter: 'blur(2px)',
                            zIndex: 9998,
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default FloatingCTA;
