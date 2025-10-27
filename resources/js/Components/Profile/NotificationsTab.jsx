import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Box,
    Typography,
    Paper,
    FormGroup,
    FormControlLabel,
    Switch,
    Button,
    Alert,
    Divider,
    CircularProgress
} from '@mui/material';
import {
    Save as SaveIcon,
    Email as EmailIcon,
    Notifications as NotificationsIcon,
    Comment as CommentIcon,
    ThumbUp as LikeIcon,
    Bookmark as BookmarkIcon
} from '@mui/icons-material';

const NotificationsTab = ({ settings }) => {
    const [formData, setFormData] = useState({
        email_comments: settings?.email_comments ?? true,
        email_likes: settings?.email_likes ?? true,
        email_follows: settings?.email_follows ?? true,
        email_mentions: settings?.email_mentions ?? true,
        email_newsletter: settings?.email_newsletter ?? false,
        push_comments: settings?.push_comments ?? true,
        push_likes: settings?.push_likes ?? false,
        push_follows: settings?.push_follows ?? true,
        push_mentions: settings?.push_mentions ?? true
    });

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState({});

    const handleChange = (name) => (event) => {
        setFormData(prev => ({
            ...prev,
            [name]: event.target.checked
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccessMessage('');

        router.put('/user/preferences', { notifications: formData }, {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMessage('Preferencias de notificaciones actualizadas correctamente');
                setTimeout(() => setSuccessMessage(''), 3000);
            },
            onError: (errors) => {
                setErrors(errors);
            },
            onFinish: () => setLoading(false)
        });
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom fontWeight="600">
                Notificaciones
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Configura cómo y cuándo deseas recibir notificaciones
            </Typography>

            {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
                    {successMessage}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                {/* Email Notifications */}
                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary' }}>Notificaciones por Email</Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <EmailIcon color="primary" />
                        <Box>
                            <Typography variant="h6" fontWeight="600">
                                Notificaciones por Email
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Recibe actualizaciones en tu correo electrónico
                            </Typography>
                        </Box>
                    </Box>

                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.email_comments}
                                    onChange={handleChange('email_comments')}
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="500">
                                        Nuevos comentarios
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Cuando alguien comenta en tus publicaciones
                                    </Typography>
                                </Box>
                            }
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.email_likes}
                                    onChange={handleChange('email_likes')}
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="500">
                                        Me gusta
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Cuando alguien da me gusta a tu contenido
                                    </Typography>
                                </Box>
                            }
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.email_follows}
                                    onChange={handleChange('email_follows')}
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="500">
                                        Nuevos seguidores
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Cuando alguien comienza a seguirte
                                    </Typography>
                                </Box>
                            }
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.email_mentions}
                                    onChange={handleChange('email_mentions')}
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="500">
                                        Menciones
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Cuando alguien te menciona en un comentario
                                    </Typography>
                                </Box>
                            }
                        />
                        <Divider sx={{ my: 2 }} />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.email_newsletter}
                                    onChange={handleChange('email_newsletter')}
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="500">
                                        Boletín informativo
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Recibe noticias y actualizaciones semanales
                                    </Typography>
                                </Box>
                            }
                        />
                    </FormGroup>
                </Paper>

                {/* Push Notifications */}
                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary' }}>Notificaciones Push</Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <NotificationsIcon color="primary" />
                        <Box>
                            <Typography variant="h6" fontWeight="600">
                                Notificaciones Push
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Recibe notificaciones en tiempo real en tu navegador
                            </Typography>
                        </Box>
                    </Box>

                    <Alert severity="info" sx={{ mb: 2 }}>
                        Las notificaciones push requieren permiso del navegador
                    </Alert>

                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.push_comments}
                                    onChange={handleChange('push_comments')}
                                />
                            }
                            label="Nuevos comentarios"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.push_likes}
                                    onChange={handleChange('push_likes')}
                                />
                            }
                            label="Me gusta"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.push_follows}
                                    onChange={handleChange('push_follows')}
                                />
                            }
                            label="Nuevos seguidores"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.push_mentions}
                                    onChange={handleChange('push_mentions')}
                                />
                            }
                            label="Menciones"
                        />
                    </FormGroup>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar Preferencias'}
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default NotificationsTab;

