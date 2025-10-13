import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    Chip,
    Grid,
    IconButton,
    Divider
} from '@mui/material';
import {
    Close as CloseIcon,
    Keyboard as KeyboardIcon,
    Home as HomeIcon,
    BusinessCenter as ServicesIcon,
    Work as ProjectsIcon,
    Article as BlogIcon,
    ContactMail as ContactIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

const shortcuts = [
    { keys: ['g', 'h'], description: 'Ir a Inicio', icon: <HomeIcon />, action: () => router.visit('/') },
    { keys: ['g', 's'], description: 'Ir a Servicios', icon: <ServicesIcon />, action: () => router.visit('/servicios') },
    { keys: ['g', 'p'], description: 'Ir a Proyectos', icon: <ProjectsIcon />, action: () => router.visit('/proyectos') },
    { keys: ['g', 'b'], description: 'Ir a Blog', icon: <BlogIcon />, action: () => router.visit('/blog') },
    { keys: ['g', 'c'], description: 'Ir a Contacto', icon: <ContactIcon />, action: () => router.visit('/contacto') },
    { keys: ['/'], description: 'Buscar', icon: <SearchIcon />, action: 'search' },
    { keys: ['?'], description: 'Ver atajos', icon: <KeyboardIcon />, action: 'help' }
];

export default function KeyboardShortcuts({ onSearch }) {
    const [open, setOpen] = useState(false);
    const [keySequence, setKeySequence] = useState([]);

    useEffect(() => {
        let timeoutId;

        const handleKeyDown = (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            const key = event.key.toLowerCase();

            if (key === '?') {
                event.preventDefault();
                setOpen(true);
                return;
            }

            if (key === 'escape') {
                setOpen(false);
                setKeySequence([]);
                return;
            }

            if (key === '/') {
                event.preventDefault();
                if (onSearch) onSearch();
                return;
            }

            if (key === 'g' || (keySequence.length > 0 && keySequence[0] === 'g')) {
                event.preventDefault();
                const newSequence = [...keySequence, key];
                setKeySequence(newSequence);

                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    setKeySequence([]);
                }, 2000);

                const shortcut = shortcuts.find(
                    s => s.keys.length === newSequence.length &&
                         s.keys.every((k, i) => k === newSequence[i])
                );

                if (shortcut && typeof shortcut.action === 'function') {
                    shortcut.action();
                    setKeySequence([]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(timeoutId);
        };
    }, [keySequence, onSearch]);

    return (
        <>
            <AnimatePresence>
                {keySequence.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        style={{
                            position: 'fixed',
                            bottom: 24,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 9999
                        }}
                    >
                        <Box
                            sx={{
                                px: 3,
                                py: 2,
                                borderRadius: 3,
                                background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.98), rgba(18, 18, 18, 0.95))',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5
                            }}
                        >
                            <KeyboardIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {keySequence.map((key, index) => (
                                    <Chip
                                        key={index}
                                        label={key.toUpperCase()}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(59, 130, 246, 0.2)',
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '0.9rem',
                                            minWidth: 32,
                                            height: 32,
                                            border: '1px solid rgba(59, 130, 246, 0.4)',
                                            boxShadow: '0 0 12px rgba(59, 130, 246, 0.3)'
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: (theme) => theme.palette.mode === 'dark'
                            ? 'linear-gradient(145deg, rgba(30, 30, 30, 0.98), rgba(18, 18, 18, 0.95))'
                            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95))',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
                        border: (theme) => theme.palette.mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(0, 0, 0, 0.08)'
                    }
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <KeyboardIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Atajos de Teclado
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setOpen(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <Divider />

                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={2}>
                        {shortcuts.map((shortcut, index) => (
                            <Grid item xs={12} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            borderRadius: 2,
                                            background: (theme) => theme.palette.mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.03)'
                                                : 'rgba(0, 0, 0, 0.02)',
                                            border: (theme) => theme.palette.mode === 'dark'
                                                ? '1px solid rgba(255, 255, 255, 0.05)'
                                                : '1px solid rgba(0, 0, 0, 0.05)',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                background: (theme) => theme.palette.mode === 'dark'
                                                    ? 'rgba(59, 130, 246, 0.08)'
                                                    : 'rgba(59, 130, 246, 0.05)',
                                                borderColor: 'rgba(59, 130, 246, 0.2)'
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: 'primary.main',
                                                    color: 'white'
                                                }}
                                            >
                                                {shortcut.icon}
                                            </Box>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {shortcut.description}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            {shortcut.keys.map((key, keyIndex) => (
                                                <Chip
                                                    key={keyIndex}
                                                    label={key === '/' ? '/' : key.toUpperCase()}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: (theme) => theme.palette.mode === 'dark'
                                                            ? 'rgba(255, 255, 255, 0.1)'
                                                            : 'rgba(0, 0, 0, 0.08)',
                                                        color: 'text.primary',
                                                        fontWeight: 700,
                                                        fontSize: '0.75rem',
                                                        minWidth: 28,
                                                        height: 28,
                                                        border: (theme) => theme.palette.mode === 'dark'
                                                            ? '1px solid rgba(255, 255, 255, 0.15)'
                                                            : '1px solid rgba(0, 0, 0, 0.1)'
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>

                    <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            💡 Consejo
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                            Presiona <strong>?</strong> en cualquier momento para ver estos atajos
                        </Typography>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}
