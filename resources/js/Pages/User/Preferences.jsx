import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Switch,
    FormControlLabel,
    FormGroup,
    Button,
    Divider,
    Alert,
    Card,
    CardContent,
    CardActions,
    Grid,
    TextField,
    Avatar,
    useTheme,
    alpha,
    Chip
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Notifications as NotificationsIcon,
    Email as EmailIcon,
    Security as SecurityIcon,
    Palette as PaletteIcon,
    Language as LanguageIcon,
    Save as SaveIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useNotification } from '@/Context/NotificationContext';
import { useAuth } from '@/Context/AuthContext';

const PreferenceSection = ({ title, icon, children }) => {
    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                    {icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                        {title}
                    </Typography>
                </Box>
                {children}
            </CardContent>
        </Card>
    );
};

const ProfileSummary = ({ user }) => {
    const theme = useTheme();
    
    const completenessFields = [
        { field: 'name', label: 'Nombre', required: true },
        { field: 'email', label: 'Email', required: true },
        { field: 'bio', label: 'Biografía', required: false },
        { field: 'avatar', label: 'Avatar', required: false },
        { field: 'profession', label: 'Profesión', required: false },
        { field: 'location', label: 'Ubicación', required: false },
        { field: 'website', label: 'Sitio web', required: false }
    ];
    
    const completedFields = completenessFields.filter(item => user[item.field]);
    const completeness = Math.round((completedFields.length / completenessFields.length) * 100);
    
    return (
        <Paper sx={{ p: 3, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                Resumen del Perfil
            </Typography>
            
            <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                    <Box display="flex" alignItems="center" mb={2}>
                        <Avatar 
                            src={user.avatar_url}
                            alt={user.name}
                            sx={{ width: 60, height: 60, mr: 2 }}
                        >
                            {user.name?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">
                                {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user.email}
                            </Typography>
                            {user.profession && (
                                <Typography variant="body2" color="text.secondary">
                                    {user.profession}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    
                    <Box mb={2}>
                        <Typography variant="body2" gutterBottom>
                            Completitud del perfil: {completeness}%
                        </Typography>
                        <Box 
                            sx={{ 
                                width: '100%', 
                                height: 8, 
                                bgcolor: 'grey.200', 
                                borderRadius: 1,
                                overflow: 'hidden'
                            }}
                        >
                            <Box 
                                sx={{ 
                                    width: `${completeness}%`, 
                                    height: '100%', 
                                    bgcolor: completeness > 70 ? 'success.main' : completeness > 40 ? 'warning.main' : 'error.main',
                                    transition: 'width 0.5s ease'
                                }}
                            />
                        </Box>
                    </Box>
                    
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        {completenessFields.map((item) => (
                            <Chip
                                key={item.field}
                                label={item.label}
                                size="small"
                                color={user[item.field] ? 'success' : 'default'}
                                variant={user[item.field] ? 'filled' : 'outlined'}
                            />
                        ))}
                    </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => router.visit('/profile/edit')}
                        >
                            Editar Perfil
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default function Preferences({ user, preferences: initialPreferences }) {
    const { showNotification } = useNotification();
    const { auth } = useAuth();
    const [preferences, setPreferences] = useState(initialPreferences);
    const [saving, setSaving] = useState(false);

    const handlePreferenceChange = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSavePreferences = async () => {
        setSaving(true);
        
        try {
            const response = await fetch('/my/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify(preferences)
            });

            if (response.ok) {
                showNotification('Preferencias actualizadas correctamente', 'success');
            } else {
                throw new Error('Error al guardar preferencias');
            }
        } catch (error) {
            showNotification('Error al guardar preferencias', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <Box display="flex" alignItems="center">
                    <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1">
                        Preferencias
                    </Typography>
                </Box>
            }
        >
            <Head title="Preferencias" />

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Profile Summary */}
                <ProfileSummary user={user} />

                {/* Notification Preferences */}
                <PreferenceSection
                    title="Notificaciones"
                    icon={<NotificationsIcon sx={{ color: 'primary.main' }} />}
                >
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={preferences.email_notifications}
                                    onChange={(e) => handlePreferenceChange('email_notifications', e.target.checked)}
                                />
                            }
                            label="Notificaciones por email"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                            Recibir emails sobre nuevos comentarios en tus posts y respuestas a tus comentarios
                        </Typography>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={preferences.browser_notifications}
                                    onChange={(e) => handlePreferenceChange('browser_notifications', e.target.checked)}
                                />
                            }
                            label="Notificaciones del navegador"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                            Mostrar notificaciones push en el navegador para actividad importante
                        </Typography>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={preferences.comment_notifications}
                                    onChange={(e) => handlePreferenceChange('comment_notifications', e.target.checked)}
                                />
                            }
                            label="Notificaciones de comentarios"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                            Notificar cuando alguien comenta en posts que has guardado o comentado
                        </Typography>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={preferences.follow_notifications}
                                    onChange={(e) => handlePreferenceChange('follow_notifications', e.target.checked)}
                                />
                            }
                            label="Notificaciones de seguimiento"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                            Notificar cuando autores que sigues publican nuevo contenido
                        </Typography>
                    </FormGroup>
                </PreferenceSection>

                {/* Email Preferences */}
                <PreferenceSection
                    title="Email Marketing"
                    icon={<EmailIcon sx={{ color: 'secondary.main' }} />}
                >
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={preferences.marketing_emails}
                                    onChange={(e) => handlePreferenceChange('marketing_emails', e.target.checked)}
                                />
                            }
                            label="Emails promocionales"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                            Recibir emails sobre nuevos servicios, ofertas especiales y contenido destacado
                        </Typography>
                    </FormGroup>
                </PreferenceSection>

                {/* Privacy & Security */}
                <PreferenceSection
                    title="Privacidad y Seguridad"
                    icon={<SecurityIcon sx={{ color: 'warning.main' }} />}
                >
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Para cambiar la configuración de privacidad de tu perfil, visita la página de 
                        <Button 
                            variant="text" 
                            size="small"
                            onClick={() => router.visit('/profile/edit')}
                        >
                            edición de perfil
                        </Button>
                    </Alert>
                    
                    <Typography variant="body2" color="text.secondary">
                        Configuraciones actuales:
                    </Typography>
                    <Box mt={1}>
                        <Chip
                            label={user.profile_visibility ? 'Perfil público' : 'Perfil privado'}
                            color={user.profile_visibility ? 'success' : 'warning'}
                            size="small"
                            sx={{ mr: 1 }}
                        />
                        <Chip
                            label={user.show_email ? 'Email visible' : 'Email oculto'}
                            color={user.show_email ? 'warning' : 'success'}
                            size="small"
                        />
                    </Box>
                </PreferenceSection>

                {/* Save Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Paper sx={{ p: 3, position: 'sticky', bottom: 20, zIndex: 10 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                                Los cambios se guardan automáticamente cuando haces clic en "Guardar Preferencias"
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                startIcon={<SaveIcon />}
                                onClick={handleSavePreferences}
                                disabled={saving}
                            >
                                {saving ? 'Guardando...' : 'Guardar Preferencias'}
                            </Button>
                        </Box>
                    </Paper>
                </motion.div>
            </Container>
        </AuthenticatedLayout>
    );
}