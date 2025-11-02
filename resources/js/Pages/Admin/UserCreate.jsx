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
    alpha,
    LinearProgress,
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
    VpnKey as VpnKeyIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
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
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Calculate password strength
    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 25;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 12.5;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5;
        return Math.min(strength, 100);
    };

    const handlePasswordChange = (password) => {
        setData('password', password);
        setPasswordStrength(calculatePasswordStrength(password));
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength < 25) return '#EF4444';
        if (passwordStrength < 50) return '#F59E0B';
        if (passwordStrength < 75) return '#3B82F6';
        return '#10B981';
    };

    const getPasswordStrengthLabel = () => {
        if (passwordStrength < 25) return 'Muy débil';
        if (passwordStrength < 50) return 'Débil';
        if (passwordStrength < 75) return 'Buena';
        return 'Excelente';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleCancel = () => {
        router.get(route('admin.users.index'));
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 16; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setData('password', password);
        setData('password_confirmation', password);
        setPasswordStrength(calculatePasswordStrength(password));
    };

    return (
        <AdminLayoutNew>
            <Head title="Crear Usuario" />

            <Box sx={{ p: 3 }}>
                {/* Animated Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Box sx={{
                        mb: 4,
                        p: 3,
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                            opacity: 0.4,
                        }
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                            <IconButton
                                onClick={handleCancel}
                                sx={{
                                    mr: 2,
                                    color: '#fff',
                                    backgroundColor: alpha('#fff', 0.2),
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': {
                                        backgroundColor: alpha('#fff', 0.3),
                                    }
                                }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
                                    Crear Nuevo Usuario
                                </Typography>
                                <Typography variant="body1" sx={{ color: alpha('#fff', 0.9) }}>
                                    Completa la información para crear un nuevo usuario del sistema
                                </Typography>
                            </Box>
                            <PersonIcon sx={{ fontSize: 64, color: alpha('#fff', 0.2) }} />
                        </Box>
                    </Box>
                </motion.div>

                {/* Form with CSS Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <form onSubmit={handleSubmit}>
                        {/* CSS Grid Layout */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: 'repeat(12, 1fr)',
                            },
                            gap: 3,
                        }}>
                            {/* Left Column - Main Form (8 columns) */}
                            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 8' } }}>
                                {/* Basic Information Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                >
                                    <Card sx={{
                                        mb: 3,
                                        borderRadius: 4,
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
                                        backdropFilter: 'blur(20px)',
                                        boxShadow: `0 8px 32px ${alpha('#667eea', 0.15)}`,
                                        border: `1px solid ${alpha('#667eea', 0.1)}`,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: `0 12px 48px ${alpha('#667eea', 0.2)}`,
                                            transform: 'translateY(-2px)',
                                        }
                                    }}>
                                        <CardContent sx={{ p: 4 }}>
                                            {/* Section Header */}
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 3,
                                                pb: 2,
                                                borderBottom: `2px solid ${alpha('#667eea', 0.1)}`
                                            }}>
                                                <Box sx={{
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    mr: 2,
                                                }}>
                                                    <PersonIcon sx={{ color: '#fff', fontSize: 28 }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2D3748' }}>
                                                        Información Básica
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                                        Datos personales del usuario
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Form Fields Grid */}
                                            <Box sx={{
                                                display: 'grid',
                                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                                                gap: 3,
                                            }}>
                                                <TextField
                                                    fullWidth
                                                    required
                                                    label="Nombre Completo"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    error={!!errors.name}
                                                    helperText={errors.name}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <PersonIcon sx={{ color: '#667eea' }} />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 3,
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                boxShadow: `0 4px 12px ${alpha('#667eea', 0.15)}`,
                                                            },
                                                            '&.Mui-focused': {
                                                                boxShadow: `0 4px 16px ${alpha('#667eea', 0.25)}`,
                                                            }
                                                        }
                                                    }}
                                                />

                                                <TextField
                                                    fullWidth
                                                    required
                                                    label="Correo Electrónico"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    error={!!errors.email}
                                                    helperText={errors.email}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <EmailIcon sx={{ color: '#667eea' }} />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 3,
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                boxShadow: `0 4px 12px ${alpha('#667eea', 0.15)}`,
                                                            },
                                                            '&.Mui-focused': {
                                                                boxShadow: `0 4px 16px ${alpha('#667eea', 0.25)}`,
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Security Information Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                >
                                    <Card sx={{
                                        mb: 3,
                                        borderRadius: 4,
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
                                        backdropFilter: 'blur(20px)',
                                        boxShadow: `0 8px 32px ${alpha('#EF4444', 0.15)}`,
                                        border: `1px solid ${alpha('#EF4444', 0.1)}`,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: `0 12px 48px ${alpha('#EF4444', 0.2)}`,
                                            transform: 'translateY(-2px)',
                                        }
                                    }}>
                                        <CardContent sx={{ p: 4 }}>
                                            {/* Section Header */}
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 3,
                                                pb: 2,
                                                borderBottom: `2px solid ${alpha('#EF4444', 0.1)}`
                                            }}>
                                                <Box sx={{
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                                                    mr: 2,
                                                }}>
                                                    <LockIcon sx={{ color: '#fff', fontSize: 28 }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2D3748' }}>
                                                        Información de Seguridad
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                                        Credenciales de acceso
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Password Fields */}
                                            <Box sx={{
                                                display: 'grid',
                                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                                                gap: 3,
                                                mb: 3,
                                            }}>
                                                <Box>
                                                    <TextField
                                                        fullWidth
                                                        required
                                                        label="Contraseña"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={data.password}
                                                        onChange={(e) => handlePasswordChange(e.target.value)}
                                                        error={!!errors.password}
                                                        helperText={errors.password || 'Mínimo 8 caracteres'}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <LockIcon sx={{ color: '#EF4444' }} />
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
                                                                borderRadius: 3,
                                                                transition: 'all 0.3s ease',
                                                                '&:hover': {
                                                                    boxShadow: `0 4px 12px ${alpha('#EF4444', 0.15)}`,
                                                                },
                                                                '&.Mui-focused': {
                                                                    boxShadow: `0 4px 16px ${alpha('#EF4444', 0.25)}`,
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<VpnKeyIcon />}
                                                        onClick={generatePassword}
                                                        sx={{
                                                            mt: 1.5,
                                                            textTransform: 'none',
                                                            borderRadius: 2,
                                                            borderColor: alpha('#667eea', 0.5),
                                                            color: '#667eea',
                                                            '&:hover': {
                                                                borderColor: '#667eea',
                                                                backgroundColor: alpha('#667eea', 0.05),
                                                            }
                                                        }}
                                                    >
                                                        Generar Contraseña Segura
                                                    </Button>
                                                </Box>

                                                <TextField
                                                    fullWidth
                                                    required
                                                    label="Confirmar Contraseña"
                                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    error={!!errors.password_confirmation}
                                                    helperText={errors.password_confirmation}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <LockIcon sx={{ color: '#EF4444' }} />
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
                                                            borderRadius: 3,
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                boxShadow: `0 4px 12px ${alpha('#EF4444', 0.15)}`,
                                                            },
                                                            '&.Mui-focused': {
                                                                boxShadow: `0 4px 16px ${alpha('#EF4444', 0.25)}`,
                                                            }
                                                        }
                                                    }}
                                                />
                                            </Box>

                                            {/* Password Strength Indicator */}
                                            {data.password && (
                                                <Box sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600 }}>
                                                            Fortaleza de la contraseña:
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: getPasswordStrengthColor(), fontWeight: 700 }}>
                                                            {getPasswordStrengthLabel()}
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={passwordStrength}
                                                        sx={{
                                                            height: 8,
                                                            borderRadius: 4,
                                                            backgroundColor: alpha(getPasswordStrengthColor(), 0.2),
                                                            '& .MuiLinearProgress-bar': {
                                                                borderRadius: 4,
                                                                backgroundColor: getPasswordStrengthColor(),
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            )}

                                            {/* Password Requirements */}
                                            <Box sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                backgroundColor: alpha('#3B82F6', 0.05),
                                                border: `1px solid ${alpha('#3B82F6', 0.2)}`,
                                            }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#2D3748', mb: 1 }}>
                                                    Requisitos de contraseña:
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {data.password.length >= 8 ?
                                                            <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} /> :
                                                            <CancelIcon sx={{ fontSize: 16, color: '#EF4444' }} />
                                                        }
                                                        <Typography variant="body2" sx={{ color: '#718096' }}>
                                                            Mínimo 8 caracteres
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {/[A-Z]/.test(data.password) && /[a-z]/.test(data.password) ?
                                                            <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} /> :
                                                            <CancelIcon sx={{ fontSize: 16, color: '#EF4444' }} />
                                                        }
                                                        <Typography variant="body2" sx={{ color: '#718096' }}>
                                                            Mayúsculas y minúsculas
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {/[0-9]/.test(data.password) ?
                                                            <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} /> :
                                                            <CancelIcon sx={{ fontSize: 16, color: '#EF4444' }} />
                                                        }
                                                        <Typography variant="body2" sx={{ color: '#718096' }}>
                                                            Al menos un número
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {/[^a-zA-Z0-9]/.test(data.password) ?
                                                            <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} /> :
                                                            <CancelIcon sx={{ fontSize: 16, color: '#EF4444' }} />
                                                        }
                                                        <Typography variant="body2" sx={{ color: '#718096' }}>
                                                            Al menos un carácter especial
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                            </Box>

                            {/* Right Column - Sidebar (4 columns) */}
                            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                                {/* Role and Permissions Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.5 }}
                                >
                                    <Card sx={{
                                        mb: 3,
                                        borderRadius: 4,
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
                                        backdropFilter: 'blur(20px)',
                                        boxShadow: `0 8px 32px ${alpha('#10B981', 0.15)}`,
                                        border: `1px solid ${alpha('#10B981', 0.1)}`,
                                        position: { md: 'sticky' },
                                        top: { md: 24 },
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: `0 12px 48px ${alpha('#10B981', 0.2)}`,
                                            transform: 'translateY(-2px)',
                                        }
                                    }}>
                                        <CardContent sx={{ p: 4 }}>
                                            {/* Section Header */}
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 3,
                                                pb: 2,
                                                borderBottom: `2px solid ${alpha('#10B981', 0.1)}`
                                            }}>
                                                <Box sx={{
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                                    mr: 2,
                                                }}>
                                                    <AdminIcon sx={{ color: '#fff', fontSize: 28 }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2D3748' }}>
                                                        Rol y Permisos
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                                        Configuración de acceso
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Role Select */}
                                            <FormControl fullWidth sx={{ mb: 3 }}>
                                                <InputLabel>Rol del Usuario</InputLabel>
                                                <Select
                                                    value={data.role}
                                                    label="Rol del Usuario"
                                                    onChange={(e) => setData('role', e.target.value)}
                                                    sx={{
                                                        borderRadius: 3,
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            boxShadow: `0 4px 12px ${alpha('#10B981', 0.15)}`,
                                                        },
                                                        '&.Mui-focused': {
                                                            boxShadow: `0 4px 16px ${alpha('#10B981', 0.25)}`,
                                                        }
                                                    }}
                                                >
                                                    <MenuItem value="user">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <PersonIcon sx={{ fontSize: 20, color: '#3B82F6' }} />
                                                            <Box>
                                                                <Typography variant="body1">Usuario</Typography>
                                                                <Typography variant="caption" sx={{ color: '#718096' }}>
                                                                    Acceso básico
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </MenuItem>
                                                    <MenuItem value="editor">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <PersonIcon sx={{ fontSize: 20, color: '#F59E0B' }} />
                                                            <Box>
                                                                <Typography variant="body1">Editor</Typography>
                                                                <Typography variant="caption" sx={{ color: '#718096' }}>
                                                                    Puede editar contenido
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </MenuItem>
                                                    <MenuItem value="admin">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <AdminIcon sx={{ fontSize: 20, color: '#EF4444' }} />
                                                            <Box>
                                                                <Typography variant="body1">Administrador</Typography>
                                                                <Typography variant="caption" sx={{ color: '#718096' }}>
                                                                    Acceso completo
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </MenuItem>
                                                </Select>
                                            </FormControl>

                                            {/* Role Description */}
                                            <Alert
                                                severity={
                                                    data.role === 'admin' ? 'error' :
                                                    data.role === 'editor' ? 'warning' :
                                                    'info'
                                                }
                                                sx={{ mb: 3, borderRadius: 2 }}
                                            >
                                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                    {data.role === 'admin' && 'Administrador'}
                                                    {data.role === 'editor' && 'Editor'}
                                                    {data.role === 'user' && 'Usuario'}
                                                </Typography>
                                                <Typography variant="caption">
                                                    {data.role === 'admin' && 'Acceso completo al sistema, puede gestionar usuarios y configuración.'}
                                                    {data.role === 'editor' && 'Puede crear y editar contenido, sin acceso a configuración.'}
                                                    {data.role === 'user' && 'Acceso básico al sistema, solo puede ver contenido.'}
                                                </Typography>
                                            </Alert>

                                            {/* Switches */}
                                            <Box sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                backgroundColor: alpha('#718096', 0.05),
                                                border: `1px solid ${alpha('#718096', 0.1)}`,
                                            }}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={data.is_active}
                                                            onChange={(e) => setData('is_active', e.target.checked)}
                                                            color="success"
                                                        />
                                                    }
                                                    label={
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                Usuario Activo
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: '#718096' }}>
                                                                Puede iniciar sesión
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}
                                                />
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={data.send_welcome_email}
                                                            onChange={(e) => setData('send_welcome_email', e.target.checked)}
                                                            color="primary"
                                                        />
                                                    }
                                                    label={
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                Email de Bienvenida
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: '#718096' }}>
                                                                Enviar credenciales por email
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    sx={{ display: 'flex', alignItems: 'flex-start' }}
                                                />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Action Buttons Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.6 }}
                                >
                                    <Card sx={{
                                        borderRadius: 4,
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
                                        backdropFilter: 'blur(20px)',
                                        boxShadow: `0 8px 32px ${alpha('#667eea', 0.15)}`,
                                        border: `1px solid ${alpha('#667eea', 0.1)}`,
                                    }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    disabled={processing}
                                                    startIcon={<SaveIcon />}
                                                    fullWidth
                                                    sx={{
                                                        py: 1.5,
                                                        textTransform: 'none',
                                                        borderRadius: 3,
                                                        fontSize: '1rem',
                                                        fontWeight: 600,
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        boxShadow: `0 4px 16px ${alpha('#667eea', 0.4)}`,
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                                            boxShadow: `0 6px 24px ${alpha('#667eea', 0.5)}`,
                                                            transform: 'translateY(-2px)',
                                                        },
                                                        '&:disabled': {
                                                            background: alpha('#718096', 0.3),
                                                        }
                                                    }}
                                                >
                                                    {processing ? 'Creando Usuario...' : 'Crear Usuario'}
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    onClick={handleCancel}
                                                    disabled={processing}
                                                    fullWidth
                                                    sx={{
                                                        py: 1.5,
                                                        textTransform: 'none',
                                                        borderRadius: 3,
                                                        fontSize: '1rem',
                                                        fontWeight: 600,
                                                        borderColor: alpha('#718096', 0.3),
                                                        color: '#718096',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            borderColor: '#718096',
                                                            backgroundColor: alpha('#718096', 0.05),
                                                        }
                                                    }}
                                                >
                                                    Cancelar
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Box>
                        </Box>
                    </form>
                </motion.div>
            </Box>
        </AdminLayoutNew>
    );
};

export default UserCreate;
