import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Alert,
    Divider,
    IconButton,
    InputAdornment,
    Chip,
    Grid,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';

const UserCreate = ({ roles = [] }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        is_active: true,
        send_welcome_email: true,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    // Glassmorphism styles
    const glassmorphismCard = {
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.admin.users.store'), {
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleCancel = () => {
        router.get(route('admin.admin.users.index'));
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setData('password', password);
        setData('password_confirmation', password);
    };

    return (
        <AdminLayoutNew>
            <Head title="Crear Usuario" />
            
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ padding: '24px' }}
            >
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                onClick={handleCancel}
                                sx={{
                                    mr: 2,
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    '&:hover': {
                                        background: 'rgba(255, 255, 255, 0.2)',
                                    }
                                }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 600, color: '#2D3748', mb: 1 }}>
                                    Crear Nuevo Usuario
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#718096' }}>
                                    Completa la información para crear un nuevo usuario del sistema
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </motion.div>

                {/* Form */}
                <motion.div variants={itemVariants}>
                    <Card sx={glassmorphismCard}>
                        <CardContent sx={{ p: 4 }}>
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={3}>
                                    {/* Basic Information */}
                                    <Grid item xs={12}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748', mb: 2, display: 'flex', alignItems: 'center' }}>
                                            <PersonIcon sx={{ mr: 1, color: '#667eea' }} />
                                            Información Básica
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Nombre Completo"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            error={!!errors.name}
                                            helperText={errors.name}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon sx={{ color: '#718096' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                }
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Correo Electrónico"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            error={!!errors.email}
                                            helperText={errors.email}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <EmailIcon sx={{ color: '#718096' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                }
                                            }}
                                        />
                                    </Grid>

                                    {/* Security Information */}
                                    <Grid item xs={12}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748', mb: 2, mt: 3, display: 'flex', alignItems: 'center' }}>
                                            <LockIcon sx={{ mr: 1, color: '#667eea' }} />
                                            Información de Seguridad
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Contraseña"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            error={!!errors.password}
                                            helperText={errors.password || 'Mínimo 8 caracteres'}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockIcon sx={{ color: '#718096' }} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            edge="end"
                                                        >
                                                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={generatePassword}
                                            sx={{ mt: 1, textTransform: 'none' }}
                                        >
                                            Generar Contraseña
                                        </Button>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Confirmar Contraseña"
                                            type={showPasswordConfirmation ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            error={!!errors.password_confirmation}
                                            helperText={errors.password_confirmation}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LockIcon sx={{ color: '#718096' }} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                            edge="end"
                                                        >
                                                            {showPasswordConfirmation ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                }
                                            }}
                                        />
                                    </Grid>

                                    {/* Role and Permissions */}
                                    <Grid item xs={12}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748', mb: 2, mt: 3, display: 'flex', alignItems: 'center' }}>
                                            <AdminIcon sx={{ mr: 1, color: '#667eea' }} />
                                            Rol y Permisos
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Rol del Usuario</InputLabel>
                                            <Select
                                                value={data.role}
                                                label="Rol del Usuario"
                                                onChange={(e) => setData('role', e.target.value)}
                                                sx={{
                                                    borderRadius: '12px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                }}
                                            >
                                                <MenuItem value="user">Usuario</MenuItem>
                                                <MenuItem value="admin">Administrador</MenuItem>
                                                <MenuItem value="editor">Editor</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={data.is_active}
                                                        onChange={(e) => setData('is_active', e.target.checked)}
                                                        color="primary"
                                                    />
                                                }
                                                label="Usuario Activo"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={data.send_welcome_email}
                                                        onChange={(e) => setData('send_welcome_email', e.target.checked)}
                                                        color="primary"
                                                    />
                                                }
                                                label="Enviar Email de Bienvenida"
                                            />
                                        </Box>
                                    </Grid>

                                    {/* Actions */}
                                    <Grid item xs={12}>
                                        <Divider sx={{ my: 3 }} />
                                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="outlined"
                                                onClick={handleCancel}
                                                disabled={processing}
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: '8px',
                                                    px: 3,
                                                }}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                disabled={processing}
                                                startIcon={<SaveIcon />}
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: '8px',
                                                    px: 3,
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                }}
                                            >
                                                {processing ? 'Creando...' : 'Crear Usuario'}
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </AdminLayoutNew>
    );
};

export default UserCreate;
