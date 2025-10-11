import React, { useState } from 'react';
import {
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { router } from '@inertiajs/react';

/**
 * Admin-only comment delete button component
 * Only visible to users with admin role
 */
const CommentDeleteButton = ({ 
    comment, 
    user, 
    onDeleted = null,
    size = 'small',
    variant = 'icon' // 'icon' | 'button'
}) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Only show for admin users
    if (!user || !user.roles?.some(role => role.name === 'admin')) {
        return null;
    }

    const handleDelete = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/comments/${comment.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();

            if (data.success) {
                setOpen(false);
                
                // Call callback if provided
                if (onDeleted) {
                    onDeleted(comment.id);
                }

                // Show success notification
                if (window.showNotification) {
                    window.showNotification(data.message, 'success');
                }

                // Refresh page if no callback provided
                if (!onDeleted) {
                    window.location.reload();
                }
            } else {
                setError(data.message || 'Error al eliminar el comentario');
            }
        } catch (err) {
            console.error('Error deleting comment:', err);
            setError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setOpen(false);
            setError(null);
        }
    };

    const renderButton = () => {
        if (variant === 'button') {
            return (
                <Button
                    size={size}
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setOpen(true)}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.1)'
                        }
                    }}
                >
                    Eliminar
                </Button>
            );
        }

        return (
            <Tooltip title="Eliminar comentario (Solo Admin)" arrow>
                <IconButton
                    size={size}
                    color="error"
                    onClick={() => setOpen(true)}
                    sx={{
                        opacity: 0.7,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            opacity: 1,
                            backgroundColor: 'rgba(211, 47, 47, 0.1)',
                            transform: 'scale(1.1)'
                        }
                    }}
                >
                    <DeleteIcon fontSize={size === 'small' ? 'small' : 'medium'} />
                </IconButton>
            </Tooltip>
        );
    };

    return (
        <>
            {renderButton()}

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 3
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <WarningIcon color="error" />
                        <Typography variant="h6" component="span">
                            Confirmar Eliminación
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        ¿Estás seguro de que deseas eliminar este comentario?
                    </Typography>

                    <Box
                        sx={{
                            p: 2,
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            borderRadius: 2,
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            mb: 2
                        }}
                    >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Autor:</strong> {comment.user?.name || comment.author_name || 'Usuario anónimo'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Fecha:</strong> {new Date(comment.created_at).toLocaleDateString('es-ES')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            "{comment.content?.substring(0, 100)}{comment.content?.length > 100 ? '...' : ''}"
                        </Typography>
                    </Box>

                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            <strong>Esta acción no se puede deshacer.</strong> El comentario y todas sus respuestas serán eliminados permanentemente.
                        </Typography>
                    </Alert>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button
                        onClick={handleClose}
                        disabled={loading}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            minWidth: 120
                        }}
                    >
                        {loading ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CommentDeleteButton;
