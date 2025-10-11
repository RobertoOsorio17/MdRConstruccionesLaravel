import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    Link as MuiLink,
    CircularProgress,
    Card,
    CardContent,
    Divider,
    InputAdornment,
    IconButton,
    LinearProgress,
    useTheme
} from '@mui/material';
import {
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Email as EmailIcon
} from '@mui/icons-material';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';

const PasswordStrengthIndicator = ({ password }) => {
    const getStrength = () => {
        let score = 0;
        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        return score;
    };

    const strength = getStrength();
    const getColor = () => {
        if (strength <= 2) return 'error';
        if (strength <= 3) return 'warning';
        return 'success';
    };

    const getLabel = () => {
        if (strength <= 2) return 'Débil';
        if (strength <= 3) return 'Media';
        return 'Fuerte';
    };

    if (!password) return null;

    return (
        <Box sx={{ mt: 1 }}>
            <LinearProgress
                variant="determinate"
                value={(strength / 5) * 100}
                color={getColor()}
                sx={{ height: 4, borderRadius: 2 }}
            />
            <Typography variant="caption" color={`${getColor()}.main`} sx={{ mt: 0.5, display: 'block' }}>
                Seguridad: {getLabel()}
            </Typography>
        </Box>
    );
};

const PasswordRequirements = ({ password }) => {
    const requirements = [
        { test: (p) => p.length >= 8, label: 'Mínimo 8 caracteres' },
        { test: (p) => /[A-Z]/.test(p), label: 'Una mayúscula' },
        { test: (p) => /[a-z]/.test(p), label: 'Una minúscula' },
        { test: (p) => /[0-9]/.test(p), label: 'Un número' },
        { test: (p) => /[^A-Za-z0-9]/.test(p), label: 'Un carácter especial' },
    ];

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                La contraseña debe cumplir:
            </Typography>
            {requirements.map((req, index) => {
                const isValid = req.test(password);
                return (
                    <Box key={index} display="flex" alignItems="center" sx={{ mb: 0.5 }}>
                        {isValid ? (
                            <CheckIcon sx={{ fontSize: 16, color: 'success.main', mr: 1 }} />
                        ) : (
                            <CancelIcon sx={{ fontSize: 16, color: 'error.main', mr: 1 }} />
                        )}
                        <Typography 
                            variant="caption" 
                            color={isValid ? 'success.main' : 'text.secondary'}
                        >
                            {req.label}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
};

export default function ResetPassword({ token, email }) {
    const theme = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const isPasswordValid = () => {
        return data.password.length >= 8 && 
               /[A-Z]/.test(data.password) && 
               /[a-z]/.test(data.password) && 
               /[0-9]/.test(data.password) && 
               /[^A-Za-z0-9]/.test(data.password);
    };

    const passwordsMatch = data.password === data.password_confirmation && data.password.length > 0;

    return (
        <MainLayout>
            <Head title="Cambiar Contraseña" />
            
            <Container maxWidth="sm" sx={{ py: 8 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card elevation={4}>
                        <CardContent sx={{ p: 4 }}>
                            {/* Header */}
                            <Box textAlign="center" mb={4}>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                >
                                    <LockIcon 
                                        sx={{ 
                                            fontSize: 60, 
                                            color: 'primary.main',
                                            mb: 2
                                        }} 
                                    />
                                </motion.div>
                                
                                <Typography variant="h4" gutterBottom fontWeight="bold">
                                    Nueva Contraseña
                                </Typography>
                                
                                <Typography variant="body1" color="text.secondary">
                                    Ingresa tu nueva contraseña para la cuenta: <strong>{email}</strong>
                                </Typography>
                            </Box>

                            {/* Error Alert */}
                            {Object.keys(errors).length > 0 && (
                                <Alert severity="error" sx={{ mb: 3 }}>
                                    <Typography variant="body2">
                                        Por favor corrige los errores antes de continuar
                                    </Typography>
                                </Alert>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                {/* Email (readonly) */}
                                <TextField
                                    fullWidth
                                    type="email"
                                    label="Email"
                                    value={data.email}
                                    disabled
                                    sx={{ mb: 3 }}
                                    InputProps={{
                                        startAdornment: (
                                            <EmailIcon sx={{ color: 'text.secondary', mr: 1 }} />
                                        ),
                                    }}
                                />

                                {/* New Password */}
                                <TextField
                                    fullWidth
                                    type={showPassword ? 'text' : 'password'}
                                    label="Nueva Contraseña"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    error={!!errors.password}
                                    helperText={errors.password}
                                    required
                                    autoFocus
                                    sx={{ mb: 1 }}
                                    InputProps={{
                                        startAdornment: (
                                            <LockIcon sx={{ color: 'text.secondary', mr: 1 }} />
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                
                                <PasswordStrengthIndicator password={data.password} />
                                
                                {data.password && (
                                    <PasswordRequirements password={data.password} />
                                )}

                                {/* Confirm Password */}
                                <TextField
                                    fullWidth
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    label="Confirmar Contraseña"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    error={!!errors.password_confirmation}
                                    helperText={errors.password_confirmation}
                                    required
                                    sx={{ mt: 3, mb: 3 }}
                                    InputProps={{
                                        startAdornment: (
                                            <LockIcon sx={{ color: 'text.secondary', mr: 1 }} />
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                    edge="end"
                                                >
                                                    {showPasswordConfirmation ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                                {data.password_confirmation && (
                                                    passwordsMatch ? (
                                                        <CheckIcon sx={{ color: 'success.main', ml: 1 }} />
                                                    ) : (
                                                        <CancelIcon sx={{ color: 'error.main', ml: 1 }} />
                                                    )
                                                )}
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={processing || !isPasswordValid() || !passwordsMatch}
                                    sx={{ 
                                        mb: 3,
                                        height: 56,
                                        fontSize: '1.1rem',
                                        fontWeight: 600
                                    }}
                                >
                                    {processing ? (
                                        <>
                                            <CircularProgress size={20} sx={{ mr: 2 }} />
                                            Cambiando Contraseña...
                                        </>
                                    ) : (
                                        'Cambiar Contraseña'
                                    )}
                                </Button>
                            </form>

                            <Divider sx={{ my: 3 }} />

                            {/* Footer Links */}
                            <Box textAlign="center">
                                <Typography variant="body2" color="text.secondary">
                                    ¿Recordaste tu contraseña?{' '}
                                    <MuiLink
                                        component={Link}
                                        href="/login"
                                        sx={{ 
                                            color: 'primary.main',
                                            textDecoration: 'none',
                                            fontWeight: 600,
                                            '&:hover': {
                                                textDecoration: 'underline'
                                            }
                                        }}
                                    >
                                        Iniciar Sesión
                                    </MuiLink>
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>
        </MainLayout>
    );
}