import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Box,
    TextField,
    Button,
    Stack,
    Typography,
    Alert,
    CircularProgress,
    Paper,
    Chip,
    alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

/**
 * CommentEditForm Component
 * Premium glassmorphism design for editing comments
 * 
 * @param {Object} comment - The comment object to edit
 * @param {Function} onCancel - Callback when edit is cancelled
 * @param {Function} onSuccess - Callback when edit is successful
 */
export default function CommentEditForm({ comment, onCancel, onSuccess }) {
    const theme = useTheme();
    const [body, setBody] = useState(comment.body || '');
    const [editReason, setEditReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [showReasonHelper, setShowReasonHelper] = useState(false);

    const bodyCharCount = body.length;
    const reasonCharCount = editReason.length;
    const isBodyValid = bodyCharCount >= 10 && bodyCharCount <= 2000;
    const isReasonValid = editReason.length === 0 || (reasonCharCount >= 10 && reasonCharCount <= 500);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Client-side validation
        const newErrors = {};
        
        if (bodyCharCount < 10) {
            newErrors.body = 'El comentario debe tener al menos 10 caracteres';
        } else if (bodyCharCount > 2000) {
            newErrors.body = 'El comentario no puede exceder 2000 caracteres';
        }
        
        if (editReason && reasonCharCount < 10) {
            newErrors.edit_reason = 'El motivo debe tener al menos 10 caracteres si se proporciona';
        } else if (reasonCharCount > 500) {
            newErrors.edit_reason = 'El motivo no puede exceder 500 caracteres';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setIsSubmitting(true);
        setErrors({});
        
        try {
            const response = await axios.put(route('comments.update', comment.id), {
                body: body,
                edit_reason: editReason || null,
            });
            
            if (response.data.success) {
                // Call success callback with updated comment data
                if (onSuccess) {
                    onSuccess(response.data.comment);
                }
                
                // Show success message
                window.dispatchEvent(new CustomEvent('show-notification', {
                    detail: {
                        message: 'Comentario actualizado exitosamente',
                        severity: 'success'
                    }
                }));
            }
        } catch (error) {
            console.error('Error updating comment:', error);
            
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response?.data?.message) {
                setErrors({ general: error.response.data.message });
            } else {
                setErrors({ general: 'Error al actualizar el comentario. Por favor, inténtalo de nuevo.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }
            }}
        >
            <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={3}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EditIcon color="primary" />
                        <Typography variant="h6" fontWeight="600">
                            Editar Comentario
                        </Typography>
                        <Chip 
                            label={`${comment.edit_count || 0}/5 ediciones`}
                            size="small"
                            color={comment.edit_count >= 4 ? 'warning' : 'default'}
                            sx={{ ml: 'auto' }}
                        />
                    </Box>

                    {/* General Error */}
                    {errors.general && (
                        <Alert severity="error" onClose={() => setErrors({})}>
                            {errors.general}
                        </Alert>
                    )}

                    {/* Comment Body Field */}
                    <Box>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={body}
                            onChange={(e) => {
                                setBody(e.target.value);
                                if (errors.body) {
                                    setErrors(prev => ({ ...prev, body: null }));
                                }
                            }}
                            placeholder="Edita tu comentario..."
                            error={!!errors.body}
                            helperText={errors.body}
                            disabled={isSubmitting}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.background.paper, 1),
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: alpha(theme.palette.background.paper, 1),
                                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                                    },
                                },
                            }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                color: isBodyValid ? theme.palette.success.main : theme.palette.error.main,
                                mt: 0.5,
                                display: 'block',
                                fontWeight: 500,
                            }}
                        >
                            {bodyCharCount}/2000 caracteres {!isBodyValid && '(mínimo 10)'}
                        </Typography>
                    </Box>

                    {/* Edit Reason Field */}
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Motivo de la edición (opcional pero recomendado)
                            </Typography>
                            <InfoOutlinedIcon 
                                fontSize="small" 
                                color="action"
                                sx={{ cursor: 'pointer' }}
                                onClick={() => setShowReasonHelper(!showReasonHelper)}
                            />
                        </Box>
                        
                        {showReasonHelper && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Proporcionar un motivo ayuda a otros usuarios a entender por qué editaste tu comentario.
                                Ejemplos: "Corrección ortográfica", "Añadir información relevante", "Aclarar mi punto de vista"
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            value={editReason}
                            onChange={(e) => {
                                setEditReason(e.target.value);
                                if (errors.edit_reason) {
                                    setErrors(prev => ({ ...prev, edit_reason: null }));
                                }
                            }}
                            placeholder="Ej: Corrección de errores ortográficos, añadir información relevante..."
                            error={!!errors.edit_reason}
                            helperText={errors.edit_reason}
                            disabled={isSubmitting}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.background.paper, 1),
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: alpha(theme.palette.background.paper, 1),
                                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                                    },
                                },
                            }}
                        />
                        {editReason && (
                            <Typography
                                variant="caption"
                                sx={{
                                    color: isReasonValid ? theme.palette.success.main : theme.palette.error.main,
                                    mt: 0.5,
                                    display: 'block',
                                    fontWeight: 500,
                                }}
                            >
                                {reasonCharCount}/500 caracteres {editReason && !isReasonValid && '(mínimo 10)'}
                            </Typography>
                        )}
                    </Box>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            startIcon={<CloseIcon />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting || !isBodyValid || !isReasonValid}
                            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                                '&:hover': {
                                    boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.5)}`,
                                },
                            }}
                        >
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Paper>
    );
}

