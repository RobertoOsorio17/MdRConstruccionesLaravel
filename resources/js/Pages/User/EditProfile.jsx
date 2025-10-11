import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Box,
    Container,
    Typography,
    Avatar,
    Button,
    Grid,
    Card,
    CardContent,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    LinearProgress,
    Paper,
    useTheme,
    alpha,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    PhotoCamera as CameraIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';
import NotificationSnackbar from '@/Components/NotificationSnackbar';
import axios from 'axios';

const EditProfile = ({ user, profileCompleteness, socialLinks = {} }) => {
    const theme = useTheme();
    const [formData, setFormData] = useState({
        name: user.name || '',
        bio: user.bio || '',
        website: user.website || '',
        location: user.location || '',
        profession: user.profession || '',
        phone: user.phone || '',
        birth_date: user.birth_date || '',
        gender: user.gender || '',
        profile_visibility: user.profile_visibility ?? true,
        show_email: user.show_email ?? false,
        social_links: {
            twitter: socialLinks.twitter || '',
            linkedin: socialLinks.linkedin || '',
            facebook: socialLinks.facebook || '',
            instagram: socialLinks.instagram || '',
            github: socialLinks.github || ''
        }
    });
    
    const [loading, setLoading] = useState(false);
    const [avatarDialog, setAvatarDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user.avatar_url);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    const showNotification = (message, severity = 'info') => {
        setNotification({ open: true, message, severity });
    };

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSocialLinkChange = (platform, value) => {
        setFormData(prev => ({
            ...prev,
            social_links: {
                ...prev.social_links,
                [platform]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            router.put('/profile/update', formData, {
                onSuccess: () => {
                    showNotification('Perfil actualizado correctamente', 'success');
                },
                onError: (errors) => {
                    console.error('Errores:', errors);
                    showNotification('Error al actualizar el perfil', 'error');
                },
                onFinish: () => setLoading(false)
            });
        } catch (error) {
            setLoading(false);
            showNotification('Error al actualizar el perfil', 'error');
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 2048 * 1024) {
                showNotification('El archivo es demasiado grande. Máximo 2MB.', 'warning');
                return;
            }
            
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setPreviewUrl(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('avatar', selectedFile);

        try {
            const response = await axios.post('/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setPreviewUrl(response.data.avatar_url);
                setAvatarDialog(false);
                setSelectedFile(null);
                showNotification(response.data.message, 'success');
            }
        } catch (error) {
            showNotification('Error al subir el avatar', 'error');
        }
    };

    const handleAvatarDelete = async () => {
        try {
            const response = await axios.delete('/profile/avatar');
            
            if (response.data.success) {
                setPreviewUrl(response.data.avatar_url);
                setAvatarDialog(false);
                showNotification(response.data.message, 'success');
            }
        } catch (error) {
            showNotification('Error al eliminar el avatar', 'error');
        }
    };

    return (
        <MainLayout>
            <Head title="Editar Perfil" />
            
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                    Editar Perfil
                </Typography>
                
                {/* Progreso del perfil */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Completitud del perfil: {profileCompleteness}%
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={profileCompleteness}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: alpha(theme.palette.grey[500], 0.2),
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.info.main})`
                            }
                        }}
                    />
                </Paper>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        {/* Avatar */}
                        <Grid item xs={12} textAlign="center">
                            <Card sx={{ p: 3, borderRadius: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Foto de Perfil
                                </Typography>
                                <Avatar
                                    src={previewUrl}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        mx: 'auto',
                                        mb: 2,
                                        border: `4px solid ${theme.palette.primary.main}`
                                    }}
                                />
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<CameraIcon />}
                                        onClick={() => setAvatarDialog(true)}
                                    >
                                        Cambiar
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>

                        {/* Información básica */}
                        <Grid item xs={12}>
                            <Card sx={{ p: 3, borderRadius: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Información Básica
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Nombre completo"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Biografía"
                                            value={formData.bio}
                                            onChange={(e) => handleInputChange('bio', e.target.value)}
                                            multiline
                                            rows={3}
                                            helperText="Máximo 500 caracteres"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Profesión"
                                            value={formData.profession}
                                            onChange={(e) => handleInputChange('profession', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Ubicación"
                                            value={formData.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Sitio web"
                                            value={formData.website}
                                            onChange={(e) => handleInputChange('website', e.target.value)}
                                            type="url"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Teléfono"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Fecha de nacimiento"
                                            value={formData.birth_date}
                                            onChange={(e) => handleInputChange('birth_date', e.target.value)}
                                            type="date"
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Género</InputLabel>
                                            <Select
                                                value={formData.gender}
                                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                                label="Género"
                                            >
                                                <MenuItem value="">Seleccionar</MenuItem>
                                                <MenuItem value="male">Masculino</MenuItem>
                                                <MenuItem value="female">Femenino</MenuItem>
                                                <MenuItem value="other">Otro</MenuItem>
                                                <MenuItem value="prefer_not_to_say">Prefiero no decir</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Card>
                        </Grid>

                        {/* Redes sociales */}
                        <Grid item xs={12}>
                            <Card sx={{ p: 3, borderRadius: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Enlaces Sociales
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Twitter"
                                            value={formData.social_links.twitter}
                                            onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                                            placeholder="https://twitter.com/usuario"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="LinkedIn"
                                            value={formData.social_links.linkedin}
                                            onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                                            placeholder="https://linkedin.com/in/usuario"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Facebook"
                                            value={formData.social_links.facebook}
                                            onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                                            placeholder="https://facebook.com/usuario"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Instagram"
                                            value={formData.social_links.instagram}
                                            onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                                            placeholder="https://instagram.com/usuario"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="GitHub"
                                            value={formData.social_links.github}
                                            onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                                            placeholder="https://github.com/usuario"
                                        />
                                    </Grid>
                                </Grid>
                            </Card>
                        </Grid>

                        {/* Configuración de privacidad */}
                        <Grid item xs={12}>
                            <Card sx={{ p: 3, borderRadius: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Configuración de Privacidad
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.profile_visibility}
                                                onChange={(e) => handleInputChange('profile_visibility', e.target.checked)}
                                            />
                                        }
                                        label="Perfil público"
                                        labelPlacement="start"
                                        sx={{ justifyContent: 'space-between' }}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.show_email}
                                                onChange={(e) => handleInputChange('show_email', e.target.checked)}
                                            />
                                        }
                                        label="Mostrar email en el perfil"
                                        labelPlacement="start"
                                        sx={{ justifyContent: 'space-between' }}
                                    />
                                </Box>
                            </Card>
                        </Grid>

                        {/* Botones de acción */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<CancelIcon />}
                                    onClick={() => router.get('/dashboard')}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Container>

            {/* Dialog para avatar */}
            <Dialog open={avatarDialog} onClose={() => setAvatarDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Cambiar Foto de Perfil</DialogTitle>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Avatar
                            src={selectedFile ? previewUrl : user.avatar_url}
                            sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                        />
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="avatar-file-input"
                            type="file"
                            onChange={handleFileSelect}
                        />
                        <label htmlFor="avatar-file-input">
                            <Button variant="outlined" component="span" sx={{ mr: 1 }}>
                                Seleccionar Archivo
                            </Button>
                        </label>
                        {user.avatar && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleAvatarDelete}
                            >
                                Eliminar
                            </Button>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAvatarDialog(false)}>Cancelar</Button>
                    <Button
                        onClick={handleAvatarUpload}
                        variant="contained"
                        disabled={!selectedFile}
                    >
                        Subir
                    </Button>
                </DialogActions>
            </Dialog>

            <NotificationSnackbar
                open={notification.open}
                message={notification.message}
                severity={notification.severity}
                onClose={closeNotification}
            />
        </MainLayout>
    );
};

export default EditProfile;