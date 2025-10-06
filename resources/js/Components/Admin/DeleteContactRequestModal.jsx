import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Button,
    Stack,
    Checkbox,
    FormControlLabel,
    IconButton,
    alpha,
    CircularProgress,
} from '@mui/material';
import {
    Close,
    Warning,
    Delete,
    CheckCircle,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { router } from '@inertiajs/react';

export default function DeleteContactRequestModal({ open, onClose, request }) {
    const [deleteConfirmed, setDeleteConfirmed] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = () => {
        if (!deleteConfirmed) return;

        setDeleting(true);
        router.delete(route('admin.contact-requests.destroy', request.id), {
            onSuccess: () => {
                onClose();
                setDeleteConfirmed(false);
            },
            onError: () => {
                setDeleting(false);
            },
        });
    };

    const handleClose = () => {
        if (!deleting) {
            setDeleteConfirmed(false);
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
                    overflow: 'visible',
                },
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                },
            }}
        >
            <DialogContent sx={{ p: 0, position: 'relative' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Close Button */}
                        <IconButton
                            onClick={handleClose}
                            disabled={deleting}
                            sx={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                zIndex: 1,
                                backgroundColor: alpha('#fff', 0.8),
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: alpha('#E53E3E', 0.1),
                                    transform: 'rotate(90deg)',
                                },
                            }}
                        >
                            <Close />
                        </IconButton>

                        {/* Warning Icon */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                pt: 4,
                                pb: 2,
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 15,
                                    delay: 0.1,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 8px 24px rgba(229, 62, 62, 0.4)',
                                        position: 'relative',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            inset: -8,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)',
                                            opacity: 0.2,
                                            animation: 'pulse 2s ease-in-out infinite',
                                        },
                                        '@keyframes pulse': {
                                            '0%, 100%': {
                                                transform: 'scale(1)',
                                                opacity: 0.2,
                                            },
                                            '50%': {
                                                transform: 'scale(1.1)',
                                                opacity: 0.3,
                                            },
                                        },
                                    }}
                                >
                                    <Warning sx={{ fontSize: 40, color: '#fff' }} />
                                </Box>
                            </motion.div>
                        </Box>

                        {/* Content */}
                        <Box sx={{ px: 4, pb: 4 }}>
                            <Stack spacing={3}>
                                {/* Title */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                        sx={{
                                            color: '#2D3748',
                                            mb: 1,
                                        }}
                                    >
                                        ¿Eliminar solicitud?
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#718096',
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        Esta acción no se puede deshacer
                                    </Typography>
                                </Box>

                                {/* Request Info Card */}
                                <Box
                                    sx={{
                                        background: alpha('#E53E3E', 0.05),
                                        border: `1px solid ${alpha('#E53E3E', 0.2)}`,
                                        borderRadius: '16px',
                                        p: 2.5,
                                    }}
                                >
                                    <Stack spacing={1.5}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: '#E53E3E',
                                                }}
                                            />
                                            <Typography variant="body2" fontWeight={600} sx={{ color: '#2D3748' }}>
                                                {request?.name}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body2" sx={{ color: '#718096', pl: 3 }}>
                                            {request?.email}
                                        </Typography>
                                        {request?.attachments_count > 0 && (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    pl: 3,
                                                    pt: 1,
                                                }}
                                            >
                                                <Warning sx={{ fontSize: 16, color: '#F6AD55' }} />
                                                <Typography variant="caption" sx={{ color: '#F6AD55', fontWeight: 600 }}>
                                                    {request.attachments_count} {request.attachments_count === 1 ? 'archivo adjunto' : 'archivos adjuntos'} será{request.attachments_count === 1 ? '' : 'n'} eliminado{request.attachments_count === 1 ? '' : 's'}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </Box>

                                {/* Confirmation Checkbox */}
                                <Box
                                    sx={{
                                        background: alpha('#667eea', 0.05),
                                        border: `1px solid ${alpha('#667eea', 0.2)}`,
                                        borderRadius: '12px',
                                        p: 2,
                                    }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={deleteConfirmed}
                                                onChange={(e) => setDeleteConfirmed(e.target.checked)}
                                                disabled={deleting}
                                                sx={{
                                                    color: '#667eea',
                                                    '&.Mui-checked': {
                                                        color: '#667eea',
                                                    },
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography variant="body2" sx={{ color: '#2D3748', fontWeight: 500 }}>
                                                Confirmo que deseo eliminar esta solicitud permanentemente
                                            </Typography>
                                        }
                                    />
                                </Box>

                                {/* Action Buttons */}
                                <Stack direction="row" spacing={2}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={handleClose}
                                        disabled={deleting}
                                        sx={{
                                            borderRadius: '12px',
                                            py: 1.5,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            borderColor: alpha('#718096', 0.3),
                                            color: '#718096',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                borderColor: '#718096',
                                                backgroundColor: alpha('#718096', 0.05),
                                                transform: 'translateY(-2px)',
                                            },
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleDelete}
                                        disabled={!deleteConfirmed || deleting}
                                        startIcon={deleting ? <CircularProgress size={20} color="inherit" /> : <Delete />}
                                        sx={{
                                            borderRadius: '12px',
                                            py: 1.5,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            background: deleteConfirmed
                                                ? 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)'
                                                : alpha('#718096', 0.3),
                                            color: '#fff',
                                            boxShadow: deleteConfirmed ? '0 4px 12px rgba(229, 62, 62, 0.3)' : 'none',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: deleteConfirmed
                                                    ? 'linear-gradient(135deg, #C53030 0%, #E53E3E 100%)'
                                                    : alpha('#718096', 0.3),
                                                boxShadow: deleteConfirmed ? '0 6px 20px rgba(229, 62, 62, 0.4)' : 'none',
                                                transform: deleteConfirmed ? 'translateY(-2px)' : 'none',
                                            },
                                            '&.Mui-disabled': {
                                                background: alpha('#718096', 0.2),
                                                color: alpha('#fff', 0.5),
                                            },
                                        }}
                                    >
                                        {deleting ? 'Eliminando...' : 'Eliminar solicitud'}
                                    </Button>
                                </Stack>
                            </Stack>
                        </Box>
                    </motion.div>
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}

