import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Box,
    Grid,
    TextField,
    Button,
    Avatar,
    Typography,
    Alert,
    IconButton,
    Tooltip,
    CircularProgress,
    Paper
} from '@mui/material';
import {
    PhotoCamera as PhotoIcon,
    Delete as DeleteIcon,
    Save as SaveIcon
} from '@mui/icons-material';

const PersonalInfoTab = ({ user, mustVerifyEmail, status }) => {
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        profession: user.profession || '',
        phone: user.phone || '',
        website: user.website || ''
    });
    
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccessMessage('');

        router.put('/profile/update', formData, {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMessage('Perfil actualizado correctamente');
                setTimeout(() => setSuccessMessage(''), 3000);
            },
            onError: (errors) => {
                setErrors(errors);
            },
            onFinish: () => setLoading(false)
        });
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setErrors({ avatar: 'Por favor selecciona una imagen válida' });
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setErrors({ avatar: 'La imagen no debe superar los 2MB' });
            return;
        }

        setUploadingAvatar(true);
        setErrors({});

        const formData = new FormData();
        formData.append('avatar', file);

        router.post('/profile/avatar', formData, {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMessage('Foto de perfil actualizada correctamente');
                setTimeout(() => setSuccessMessage(''), 3000);
            },
            onError: (errors) => {
                setErrors(errors);
            },
            onFinish: () => setUploadingAvatar(false)
        });
    };

    const handleDeleteAvatar = () => {
        if (!confirm('¿Estás seguro de que deseas eliminar tu foto de perfil?')) return;

        setUploadingAvatar(true);
        router.delete('/profile/avatar', {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMessage('Foto de perfil eliminada correctamente');
                setTimeout(() => setSuccessMessage(''), 3000);
            },
            onError: (errors) => {
                setErrors(errors);
            },
            onFinish: () => setUploadingAvatar(false)
        });
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom fontWeight="600">
                Información Personal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Actualiza tu información personal y foto de perfil
            </Typography>

            {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
                    {successMessage}
                </Alert>
            )}

            {status === 'profile-updated' && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Perfil actualizado correctamente
                </Alert>
            )}

            {mustVerifyEmail && user.email_verified_at === null && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    Tu dirección de correo electrónico no está verificada.
                    <Button
                        size="small"
                        onClick={() => router.post('/email/verification-notification')}
                        sx={{ ml: 2 }}
                    >
                        Reenviar correo de verificación
                    </Button>
                </Alert>
            )}

            {/* Avatar Section */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar
                            src={user.avatar}
                            alt={user.name}
                            sx={{ width: 100, height: 100 }}
                        />
                        {uploadingAvatar && (
                            <CircularProgress
                                size={100}
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0
                                }}
                            />
                        )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                            Foto de Perfil
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            JPG, PNG o GIF. Tamaño máximo 2MB.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<PhotoIcon />}
                                disabled={uploadingAvatar}
                                size="small"
                            >
                                Subir Foto
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                />
                            </Button>
                            {user.avatar && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={handleDeleteAvatar}
                                    disabled={uploadingAvatar}
                                    size="small"
                                >
                                    Eliminar
                                </Button>
                            )}
                        </Box>
                        {errors.avatar && (
                            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                {errors.avatar}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Paper>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Nombre Completo"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={!!errors.name}
                            helperText={errors.name}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Correo Electrónico"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Profesión"
                            name="profession"
                            value={formData.profession}
                            onChange={handleChange}
                            error={!!errors.profession}
                            helperText={errors.profession}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Teléfono"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            error={!!errors.phone}
                            helperText={errors.phone}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Ubicación"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            error={!!errors.location}
                            helperText={errors.location}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Sitio Web"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            error={!!errors.website}
                            helperText={errors.website}
                            placeholder="https://ejemplo.com"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Biografía"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            error={!!errors.bio}
                            helperText={errors.bio || `${formData.bio.length}/500 caracteres`}
                            multiline
                            rows={4}
                            inputProps={{ maxLength: 500 }}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default PersonalInfoTab;

