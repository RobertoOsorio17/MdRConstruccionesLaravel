import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    IconButton,
    InputAdornment,
    Alert,
    Checkbox,
    FormControlLabel,
    Divider,
    Paper,
    Container,
    useTheme,
    alpha,
    Fade,
    Slide,
    CircularProgress,
    Chip
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Security,
    AdminPanelSettings,
    Shield,
    Lock,
    Email,
    Login as LoginIcon,
    ArrowBack,
    Fingerprint,
    VpnKey
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Glassmorphism theme
const THEME = {
    glass: 'rgba(255, 255, 255, 0.1)',
    surface: 'rgba(255, 255, 255, 0.15)',
    primary: '#2563eb',
    secondary: '#1e40af',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    text: {
        primary: 'rgba(255, 255, 255, 0.95)',
        secondary: 'rgba(255, 255, 255, 0.7)',
        light: 'rgba(255, 255, 255, 0.6)'
    }
};

export default function AdminLogin({ status, canResetPassword }) {
    const theme = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [securityLevel, setSecurityLevel] = useState('standard');
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        post(route('admin.auth.login.store'), {
            onFinish: () => {
                setIsLoading(false);
                reset('password');
            },
        });
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const backgroundVariants = {
        animate: {
            background: [
                'linear-gradient(45deg, #1e3a8a 0%, #3730a3 50%, #1e40af 100%)',
                'linear-gradient(45deg, #3730a3 0%, #1e40af 50%, #1e3a8a 100%)',
                'linear-gradient(45deg, #1e40af 0%, #1e3a8a 50%, #3730a3 100%)',
            ],
            transition: {
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <>
            <Head title="Admin Login - MDR Construcciones" />
            
            {/* Animated Background */}
            <motion.div
                variants={backgroundVariants}
                animate="animate"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: -2
                }}
            />
            
            {/* Background Overlay */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.3)',
                    zIndex: -1
                }}
            />

            <Container maxWidth="sm" sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: 4
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ width: '100%' }}
                >
                    <Card
                        sx={{
                            backgroundColor: THEME.glass,
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: 4,
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                            position: 'relative'
                        }}
                    >
                        {/* Header Section */}
                        <Box
                            sx={{
                                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(30, 64, 175, 0.2) 100%)',
                                p: 4,
                                textAlign: 'center',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            >
                                <AdminPanelSettings 
                                    sx={{ 
                                        fontSize: 60, 
                                        color: THEME.primary,
                                        mb: 2,
                                        filter: 'drop-shadow(0 4px 8px rgba(37, 99, 235, 0.3))'
                                    }} 
                                />
                            </motion.div>
                            
                            <Typography 
                                variant="h4" 
                                fontWeight="bold" 
                                color={THEME.text.primary}
                                sx={{ mb: 1 }}
                            >
                                Panel de Administración
                            </Typography>
                            
                            <Typography 
                                variant="body1" 
                                color={THEME.text.secondary}
                                sx={{ mb: 2 }}
                            >
                                MDR Construcciones
                            </Typography>

                            <Chip
                                icon={<Shield />}
                                label="Acceso Seguro"
                                variant="outlined"
                                sx={{
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    color: THEME.text.light,
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }}
                            />
                        </Box>

                        <CardContent sx={{ p: 4 }}>
                            {/* Status Messages */}
                            <AnimatePresence>
                                {status && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        style={{ marginBottom: 24 }}
                                    >
                                        <Alert 
                                            severity="success"
                                            sx={{
                                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                                color: THEME.text.primary
                                            }}
                                        >
                                            {status}
                                        </Alert>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Login Form */}
                            <form onSubmit={submit}>
                                <Box sx={{ mb: 3 }}>
                                    <TextField
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        fullWidth
                                        label="Correo Electrónico"
                                        variant="outlined"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Email sx={{ color: THEME.text.light }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                backdropFilter: 'blur(10px)',
                                                '& fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: THEME.primary,
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: THEME.text.light,
                                            },
                                            '& .MuiInputBase-input': {
                                                color: THEME.text.primary,
                                            },
                                        }}
                                    />
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <TextField
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        error={!!errors.password}
                                        helperText={errors.password}
                                        fullWidth
                                        label="Contraseña"
                                        variant="outlined"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Lock sx={{ color: THEME.text.light }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowPassword}
                                                        edge="end"
                                                        sx={{ color: THEME.text.light }}
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                backdropFilter: 'blur(10px)',
                                                '& fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: THEME.primary,
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: THEME.text.light,
                                            },
                                            '& .MuiInputBase-input': {
                                                color: THEME.text.primary,
                                            },
                                        }}
                                    />
                                </Box>

                                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={data.remember}
                                                onChange={(e) => setData('remember', e.target.checked)}
                                                sx={{
                                                    color: THEME.text.light,
                                                    '&.Mui-checked': {
                                                        color: THEME.primary,
                                                    },
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography variant="body2" color={THEME.text.secondary}>
                                                Recordarme
                                            </Typography>
                                        }
                                    />
                                </Box>

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={processing || isLoading}
                                    startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
                                    sx={{
                                        py: 1.5,
                                        mb: 3,
                                        background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.secondary} 100%)`,
                                        boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
                                        '&:hover': {
                                            background: `linear-gradient(135deg, ${THEME.secondary} 0%, ${THEME.primary} 100%)`,
                                            boxShadow: '0 12px 35px rgba(37, 99, 235, 0.4)',
                                            transform: 'translateY(-2px)',
                                        },
                                        '&:disabled': {
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            color: THEME.text.light,
                                        },
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                </Button>
                            </form>

                            <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

                            {/* Back to Site */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Button
                                    component={Link}
                                    href="/"
                                    startIcon={<ArrowBack />}
                                    sx={{
                                        color: THEME.text.secondary,
                                        '&:hover': {
                                            color: THEME.text.primary,
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    }}
                                >
                                    Volver al sitio web
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </motion.div>
            </Container>
        </>
    );
}
