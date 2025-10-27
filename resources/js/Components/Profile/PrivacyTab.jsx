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
    Radio,
    RadioGroup,
    FormControl,
    FormLabel,
    Divider,
    CircularProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Save as SaveIcon,
    Lock as LockIcon,
    Public as PublicIcon,
    People as PeopleIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Check as CheckIcon
} from '@mui/icons-material';

const PrivacyTab = ({ settings, user }) => {
    const [formData, setFormData] = useState({
        profile_visibility: settings?.profile_visibility ?? user?.profile_visibility ?? true,
        show_email: settings?.show_email ?? user?.show_email ?? false,
        show_phone: settings?.show_phone ?? user?.show_phone ?? false,
        show_location: settings?.show_location ?? user?.show_location ?? true,
        allow_comments: settings?.allow_comments ?? true,
        allow_messages: settings?.allow_messages ?? true,
        show_activity: settings?.show_activity ?? true,
        show_followers: settings?.show_followers ?? true,
        show_following: settings?.show_following ?? true,
        indexable: settings?.indexable ?? true
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

        router.put('/user/preferences', { privacy: formData }, {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMessage('Configuración de privacidad actualizada correctamente');
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
                Privacidad
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Controla quién puede ver tu información y actividad
            </Typography>

            {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
                    {successMessage}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                {/* Profile Visibility */}
                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary' }}>Visibilidad del Perfil</Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <VisibilityIcon color="primary" />
                        <Box>
                            <Typography variant="h6" fontWeight="600">
                                Visibilidad del Perfil
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Controla quién puede ver tu perfil
                            </Typography>
                        </Box>
                    </Box>

                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.profile_visibility}
                                    onChange={handleChange('profile_visibility')}
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="500">
                                        Perfil público
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Tu perfil será visible para todos los usuarios
                                    </Typography>
                                </Box>
                            }
                        />
                    </FormGroup>
                </Paper>

                {/* Information Visibility */}
                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary' }}>Información Visible</Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <LockIcon color="primary" />
                        <Box>
                            <Typography variant="h6" fontWeight="600">
                                Información Visible
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Elige qué información mostrar en tu perfil
                            </Typography>
                        </Box>
                    </Box>

                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.show_email}
                                    onChange={handleChange('show_email')}
                                />
                            }
                            label="Mostrar correo electrónico"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.show_phone}
                                    onChange={handleChange('show_phone')}
                                />
                            }
                            label="Mostrar teléfono"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.show_location}
                                    onChange={handleChange('show_location')}
                                />
                            }
                            label="Mostrar ubicación"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.show_followers}
                                    onChange={handleChange('show_followers')}
                                />
                            }
                            label="Mostrar seguidores"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.show_following}
                                    onChange={handleChange('show_following')}
                                />
                            }
                            label="Mostrar seguidos"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.show_activity}
                                    onChange={handleChange('show_activity')}
                                />
                            }
                            label="Mostrar actividad reciente"
                        />
                    </FormGroup>
                </Paper>

                {/* Interactions */}
                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary' }}>Interacciones</Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <PeopleIcon color="primary" />
                        <Box>
                            <Typography variant="h6" fontWeight="600">
                                Interacciones
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Controla cómo otros usuarios pueden interactuar contigo
                            </Typography>
                        </Box>
                    </Box>

                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.allow_comments}
                                    onChange={handleChange('allow_comments')}
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="500">
                                        Permitir comentarios
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Los usuarios pueden comentar en tus publicaciones
                                    </Typography>
                                </Box>
                            }
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.allow_messages}
                                    onChange={handleChange('allow_messages')}
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="500">
                                        Permitir mensajes
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Los usuarios pueden enviarte mensajes directos
                                    </Typography>
                                </Box>
                            }
                        />
                    </FormGroup>
                </Paper>

                {/* Search Engine */}
                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary' }}>Motores de Búsqueda</Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <PublicIcon color="primary" />
                        <Box>
                            <Typography variant="h6" fontWeight="600">
                                Motores de Búsqueda
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Controla si tu perfil aparece en buscadores
                            </Typography>
                        </Box>
                    </Box>

                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.indexable}
                                    onChange={handleChange('indexable')}
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="500">
                                        Permitir indexación
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Tu perfil puede aparecer en resultados de Google y otros buscadores
                                    </Typography>
                                </Box>
                            }
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
                        {loading ? 'Guardando...' : 'Guardar Configuración'}
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default PrivacyTab;

