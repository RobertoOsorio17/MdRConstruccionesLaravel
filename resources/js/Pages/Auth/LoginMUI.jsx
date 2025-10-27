import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    Alert,
    IconButton,
    InputAdornment,
    Divider,
    useTheme,
    alpha,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
    CircularProgress
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
    Login as LoginIcon,
    Google as GoogleIcon,
    Facebook as FacebookIcon,
    GitHub as GitHubIcon,
    Construction as ConstructionIcon,
    Security as SecurityIcon,
    VpnKey,
    Key,
    Warning,
    Error as ErrorIcon,
    CheckCircle,
    Block
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import MainLayout from '@/Layouts/MainLayout';

const LoginMUI = ({ status, canResetPassword }) => {
    const theme = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [twoFactorTab, setTwoFactorTab] = useState(0);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [twoFactorError, setTwoFactorError] = useState('');
    const [twoFactorProcessing, setTwoFactorProcessing] = useState(false);
    const [twoFactorSuccess, setTwoFactorSuccess] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [rateLimited, setRateLimited] = useState(false);
    const [rateLimitExpiry, setRateLimitExpiry] = useState(null);
    const [countdown, setCountdown] = useState(0);
    const [rememberDevice, setRememberDevice] = useState(false);
    const [urlMessage, setUrlMessage] = useState(null);

    // ✅ SECURITY FIX: Only allow whitelisted messages from URL
    // This prevents phishing attacks via crafted URLs
    useEffect(() => {
        const ALLOWED_MESSAGES = {
            'session_expired_inactivity': 'Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.',
            'session_expired': 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
            'concurrent_session': 'Se ha detectado otra sesión activa. Por favor, inicia sesión nuevamente.',
            'logout_success': 'Has cerrado sesión correctamente.',
            'account_suspended': 'Tu cuenta ha sido suspendida. Contacta al administrador.',
            'password_changed': 'Tu contraseña ha sido cambiada. Por favor, inicia sesión con tu nueva contraseña.',
        };

        const params = new URLSearchParams(window.location.search);
        const messageKey = params.get('message');

        if (messageKey && ALLOWED_MESSAGES[messageKey]) {
            setUrlMessage(ALLOWED_MESSAGES[messageKey]);
            // Clean URL without reloading
            window.history.replaceState({}, '', window.location.pathname);
        } else if (messageKey) {
            // Log suspicious attempt to inject arbitrary message
            console.warn('Attempted to inject unauthorized message:', messageKey);
        }
    }, []);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
            onError: (errors) => {
                // Check if response indicates 2FA is required
                if (errors.requires2FA) {
                    setShow2FAModal(true);
                    setTwoFactorError('');
                    setTwoFactorCode('');
                    setRecoveryCode('');
                    setAttempts(0);
                }
            },
            onBefore: () => {
                // Clear any previous errors
                return true;
            },
            preserveScroll: true,
            preserveState: true,
        });
    };

    const submit2FA = async (e) => {
        e.preventDefault();

        // Validate input
        if (twoFactorTab === 0) {
            if (!/^\d{6}$/.test(twoFactorCode)) {
                setTwoFactorError('⚠️ Por favor ingresa un código válido de 6 dígitos');
                return;
            }
        } else {
            if (!recoveryCode || recoveryCode.trim().length === 0) {
                setTwoFactorError('⚠️ Por favor ingresa un código de recuperación');
                return;
            }
        }

        setTwoFactorProcessing(true);
        setTwoFactorError('');

        try {
            // Simple approach: just send the request
            // The CSRF token should still be valid since we didn't regenerate the session
            const response = await axios.post(route('two-factor.verify'), {
                code: twoFactorTab === 0 ? twoFactorCode : '',
                recovery_code: twoFactorTab === 1 ? recoveryCode : '',
                remember_device: rememberDevice
            });

            // Success - show success state briefly then redirect
            setTwoFactorSuccess(true);

            // Check for low recovery codes warning
            if (response.data.low_recovery_codes) {
                const remainingCodes = response.data.remaining_codes;
                setTimeout(() => {
                    alert(`⚠️ ADVERTENCIA DE SEGURIDAD\n\nSolo te quedan ${remainingCodes} código(s) de recuperación.\n\nTe recomendamos regenerar tus códigos de recuperación inmediatamente desde tu perfil en la sección de Seguridad.`);
                }, 1600);
            }

            setTimeout(() => {
                if (response.data.redirect) {
                    window.location.href = response.data.redirect;
                } else {
                    router.visit(route('dashboard'));
                }
            }, response.data.low_recovery_codes ? 2500 : 1500);
        } catch (error) {
            setTwoFactorProcessing(false);

            // Log error for debugging
            console.error('2FA Verification Error:', error.response?.data);

            // Update attempts counter from backend response
            if (error.response?.data?.attempts) {
                setAttempts(error.response.data.attempts);
            }

            // Handle rate limiting
            if (error.response?.status === 429 || error.response?.data?.rate_limited) {
                const retryAfter = error.response?.data?.retry_after || 60; // Default 60 seconds
                const expiryTime = Date.now() + (retryAfter * 1000);

                setRateLimited(true);
                setRateLimitExpiry(expiryTime);
                setCountdown(retryAfter);

                // Store in localStorage to persist across page reloads
                localStorage.setItem('2fa_rate_limit_expiry', expiryTime.toString());

                setTwoFactorError(`⏱️ Demasiados intentos fallidos. Por favor espera ${retryAfter} segundos antes de intentar nuevamente.`);

                // Clear codes
                setTwoFactorCode('');
                setRecoveryCode('');
                return;
            }

            if (error.response?.data?.session_expired) {
                // Session expired - close modal and show login error
                setShow2FAModal(false);
                setTwoFactorCode('');
                setRecoveryCode('');
                setAttempts(0);

                // Reload page to show login form with error
                window.location.reload();
            } else if (error.response?.data?.errors) {
                // Extract error message from backend
                const errors = error.response.data.errors;
                let errorMsg = '';

                // Map backend error messages to Spanish
                if (errors.code) {
                    const codeError = errors.code;
                    if (codeError.includes('invalid')) {
                        errorMsg = '❌ El código ingresado es incorrecto. Por favor verifica e intenta nuevamente.';
                    } else if (codeError.includes('Too many attempts')) {
                        errorMsg = '⚠️ Demasiados intentos fallidos. Por favor espera 1 minuto antes de intentar nuevamente.';
                    } else if (codeError.includes('Session expired')) {
                        errorMsg = '⏱️ La sesión ha expirado. Por favor inicia sesión nuevamente.';
                    } else if (codeError.includes('2FA challenge expired')) {
                        errorMsg = '⏱️ El desafío 2FA ha expirado. Por favor inicia sesión nuevamente.';
                    } else if (codeError.includes('Please provide')) {
                        errorMsg = '⚠️ Por favor ingresa un código de autenticación o recuperación.';
                    } else {
                        errorMsg = codeError;
                    }
                } else if (errors.recovery_code) {
                    const recoveryError = errors.recovery_code;
                    if (recoveryError.includes('invalid')) {
                        errorMsg = '❌ El código de recuperación es incorrecto. Por favor verifica e intenta nuevamente.';
                    } else {
                        errorMsg = recoveryError;
                    }
                } else {
                    errorMsg = '❌ Código inválido. Por favor intenta de nuevo.';
                }

                setTwoFactorError(errorMsg);
            } else if (error.response?.status === 419) {
                // CSRF token mismatch
                setTwoFactorError('⚠️ Token de seguridad expirado. Recargando página...');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else if (error.code === 'ERR_NETWORK') {
                setTwoFactorError('🌐 Error de conexión. Por favor verifica tu conexión a internet.');
            } else {
                setTwoFactorError('❌ Ocurrió un error inesperado. Por favor intenta de nuevo.');
            }

            // Clear codes on error
            setTwoFactorCode('');
            setRecoveryCode('');
        }
    };

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    // Countdown timer for rate limiting
    useEffect(() => {
        if (rateLimited && rateLimitExpiry) {
            const timer = setInterval(() => {
                const now = Date.now();
                const remaining = Math.max(0, Math.ceil((rateLimitExpiry - now) / 1000));

                setCountdown(remaining);

                if (remaining <= 0) {
                    setRateLimited(false);
                    setRateLimitExpiry(null);
                    setAttempts(0);
                    setTwoFactorError('');
                    clearInterval(timer);
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [rateLimited, rateLimitExpiry]);

    const handleSocialLogin = (provider) => {
        window.location.href = route('social.redirect', { provider });
    };

    return (
        <MainLayout>
            <Head title="Iniciar Sesión - MDR Construcciones" />
            
            <Box
                component="section"
                sx={{
                    minHeight: { xs: '70vh', md: '75vh' },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    py: { xs: 6, md: 8 }
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="stretch">
                        {/* Panel lateral con beneficios */}
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Paper
                                    elevation={10}
                                    sx={{
                                        p: { xs: 3, md: 4 },
                                        borderRadius: 4,
                                        background: alpha(theme.palette.background.paper, 0.9),
                                        backdropFilter: 'blur(18px)',
                                        border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
                                        height: '100%'
                                    }}
                                >
                                    <Stack spacing={2.5}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.15) }}>
                                                <ConstructionIcon sx={{ color: 'primary.main' }} />
                                            </Box>
                                            <Typography variant="h5" fontWeight={800}>
                                                MDR Construcciones
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" color="text.secondary">
                                            Calidad, seguridad y soporte en cada paso. Accede para seguir tus proyectos y gestionar tus servicios.
                                        </Typography>
                                        <Divider />
                                        <List>
                                            <ListItem disableGutters>
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <SecurityIcon color="primary" />
                                                </ListItemIcon>
                                                <ListItemText primaryTypographyProps={{ fontWeight: 600 }}
                                                    primary="Acceso seguro con 2FA" secondary="Protegemos tu cuenta con verificación en dos pasos" />
                                            </ListItem>
                                            <ListItem disableGutters>
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <CheckCircle color="success" />
                                                </ListItemIcon>
                                                <ListItemText primaryTypographyProps={{ fontWeight: 600 }}
                                                    primary="Inicio de sesión rápido" secondary="Recuerda tu dispositivo de confianza" />
                                            </ListItem>
                                            <ListItem disableGutters>
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <LoginIcon color="secondary" />
                                                </ListItemIcon>
                                                <ListItemText primaryTypographyProps={{ fontWeight: 600 }}
                                                    primary="OAuth disponible" secondary="Accede con Google, Facebook o GitHub" />
                                            </ListItem>
                                        </List>
                                    </Stack>
                                </Paper>
                            </motion.div>
                        </Grid>
                        {/* Columna del formulario */}
                        <Grid item xs={12} md={6}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Paper
                            elevation={24}
                            sx={{
                                p: { xs: 3, md: 5 },
                                borderRadius: 4,
                                background: alpha(theme.palette.background.paper, 0.95),
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`
                            }}
                        >
                            {/* Header */}
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                >
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 3,
                                            '@keyframes pulse': {
                                                '0%': { transform: 'scale(1)', boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.7)}` },
                                                '70%': { transform: 'scale(1.05)', boxShadow: `0 0 0 10px ${alpha(theme.palette.primary.main, 0)}` },
                                                '100%': { transform: 'scale(1)', boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}` }
                                            },
                                            animation: 'pulse 2s infinite'
                                        }}
                                    >
                                        <ConstructionIcon sx={{ fontSize: 40, color: 'white' }} />
                                    </Box>
                                </motion.div>
                                
                                <Typography
                                    variant="h4"
                                    fontWeight="bold"
                                    sx={{
                                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        mb: 1
                                    }}
                                >
                                    Bienvenido de vuelta
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Inicia sesión en tu cuenta de MDR Construcciones
                                </Typography>
                            </Box>

                            {/* Status Alert */}
                            {status && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                                        {status}
                                    </Alert>
                                </motion.div>
                            )}

                            {/* ✅ URL Message Alert (e.g., session expired) */}
                            {urlMessage && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Alert
                                        severity="warning"
                                        sx={{ mb: 3, borderRadius: 2 }}
                                        onClose={() => setUrlMessage(null)}
                                    >
                                        {urlMessage}
                                    </Alert>
                                </motion.div>
                            )}

                            {/* Social Login */}
                            <Box sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<GoogleIcon />}
                                        onClick={() => handleSocialLogin('google')}
                                        sx={{
                                            py: 1.5,
                                            borderRadius: 3,
                                            borderColor: alpha(theme.palette.text.primary, 0.2),
                                            '&:hover': {
                                                borderColor: '#ea4335',
                                                backgroundColor: alpha('#ea4335', 0.1),
                                                color: '#ea4335'
                                            }
                                        }}
                                    >
                                        Google
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<FacebookIcon />}
                                        onClick={() => handleSocialLogin('facebook')}
                                        sx={{
                                            py: 1.5,
                                            borderRadius: 3,
                                            borderColor: alpha(theme.palette.text.primary, 0.2),
                                            '&:hover': {
                                                borderColor: '#1877f2',
                                                backgroundColor: alpha('#1877f2', 0.1),
                                                color: '#1877f2'
                                            }
                                        }}
                                    >
                                        Facebook
                                    </Button>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<GitHubIcon />}
                                        onClick={() => handleSocialLogin('github')}
                                        sx={{
                                            py: 1.5,
                                            borderRadius: 3,
                                            borderColor: alpha(theme.palette.text.primary, 0.2),
                                            '&:hover': {
                                                borderColor: '#333',
                                                backgroundColor: alpha('#333', 0.1),
                                                color: '#333'
                                            }
                                        }}
                                    >
                                        GitHub
                                    </Button>
                                </Box>
                                
                                <Divider sx={{ my: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        O continúa con email
                                    </Typography>
                                </Divider>
                            </Box>

                            {/* Login Form */}
                            <form onSubmit={submit}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <TextField
                                        fullWidth
                                        type="email"
                                        label="Correo electrónico"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        autoComplete="username"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            mb: 3,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                                '&:hover fieldset': {
                                                    borderColor: theme.palette.primary.main,
                                                },
                                            }
                                        }}
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <TextField
                                        fullWidth
                                        type={showPassword ? 'text' : 'password'}
                                        label="Contraseña"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        error={!!errors.password}
                                        helperText={errors.password}
                                        autoComplete="current-password"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon color="action" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={handleClickShowPassword}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            mb: 2,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                                '&:hover fieldset': {
                                                    borderColor: theme.palette.primary.main,
                                                },
                                            }
                                        }}
                                    />
                                </motion.div>

                                {/* Remember & Forgot Password */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={data.remember}
                                                onChange={(e) => setData('remember', e.target.checked)}
                                                sx={{
                                                    '&.Mui-checked': {
                                                        color: theme.palette.primary.main,
                                                    }
                                                }}
                                            />
                                        }
                                        label="Recordarme"
                                    />
                                    
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            style={{
                                                color: theme.palette.primary.main,
                                                textDecoration: 'none',
                                                fontSize: '0.875rem',
                                                fontWeight: 500
                                            }}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    )}
                                </Box>

                                {/* Submit Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={processing}
                                        startIcon={<LoginIcon />}
                                        sx={{
                                            py: 1.5,
                                            borderRadius: 3,
                                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                                            '&:hover': {
                                                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                                            },
                                            '&:disabled': {
                                                background: alpha(theme.palette.primary.main, 0.5),
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {processing ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                    </Button>
                                </motion.div>
                            </form>

                            {/* Register Link */}
                            <Box sx={{ textAlign: 'center', mt: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                    ¿No tienes una cuenta?{' '}
                                    <Link
                                        href={route('register')}
                                        style={{
                                            color: theme.palette.primary.main,
                                            textDecoration: 'none',
                                            fontWeight: 600
                                        }}
                                    >
                                        Regístrate aquí
                                    </Link>
                                </Typography>
                            </Box>

                            {/* Back to Home */}
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Link
                                    href={route('home')}
                                    style={{
                                        color: theme.palette.text.secondary,
                                        textDecoration: 'none',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    ← Volver al inicio
                                </Link>
                            </Box>
                        </Paper>
                    </motion.div>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* 2FA Modal */}
            <Dialog
                open={show2FAModal}
                onClose={() => !twoFactorProcessing && setShow2FAModal(false)}
                maxWidth="sm"
                fullWidth
                disableEscapeKeyDown={twoFactorProcessing}
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        background: '#ffffff',
                        backdropFilter: 'blur(20px)',
                        boxShadow: `0 20px 60px ${alpha('#000', 0.3)}`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        overflow: 'hidden',
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '6px',
                            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        }
                    }
                }}
                BackdropProps={{
                    sx: {
                        backgroundColor: alpha('#000', 0.7),
                        backdropFilter: 'blur(8px)',
                    }
                }}
            >
                <DialogTitle sx={{ pb: 2, pt: 4, px: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: 3,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                                position: 'relative',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    inset: -2,
                                    borderRadius: 3,
                                    padding: '2px',
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                    WebkitMaskComposite: 'xor',
                                    maskComposite: 'exclude',
                                    opacity: 0.3
                                }
                            }}
                        >
                            <SecurityIcon sx={{ fontSize: 36, color: 'white' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" fontWeight="700" sx={{
                                color: theme.palette.text.primary,
                                mb: 0.5
                            }}>
                                Verificación de Seguridad
                            </Typography>
                            <Typography variant="body2" sx={{
                                color: theme.palette.text.secondary,
                                fontWeight: 500
                            }}>
                                Autenticación de Dos Factores
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ pt: 2, px: 4, pb: 3 }}>
                    {twoFactorProcessing || twoFactorSuccess ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                py: 8,
                                gap: 3,
                                background: twoFactorSuccess
                                    ? `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`
                                    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
                                borderRadius: 3,
                                mx: -2,
                                border: twoFactorSuccess
                                    ? `2px solid ${alpha(theme.palette.success.main, 0.2)}`
                                    : 'none'
                            }}>
                                {twoFactorSuccess ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1, rotate: 360 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 15
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: '50%',
                                                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: `0 12px 28px ${alpha(theme.palette.success.main, 0.4)}`
                                            }}
                                        >
                                            <CheckCircle sx={{ fontSize: 48, color: 'white' }} />
                                        </Box>
                                    </motion.div>
                                ) : (
                                    <Box sx={{ position: 'relative' }}>
                                        <CircularProgress
                                            size={70}
                                            thickness={4}
                                            sx={{
                                                color: theme.palette.primary.main,
                                                '& .MuiCircularProgress-circle': {
                                                    strokeLinecap: 'round',
                                                }
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: 50,
                                                height: 50,
                                                borderRadius: '50%',
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <SecurityIcon sx={{ fontSize: 24, color: theme.palette.primary.main }} />
                                        </Box>
                                    </Box>
                                )}
                                <Box sx={{ textAlign: 'center' }}>
                                    <motion.div
                                        key={twoFactorSuccess ? 'success' : 'loading'}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Typography variant="h6" fontWeight="700" gutterBottom sx={{
                                            color: twoFactorSuccess ? theme.palette.success.main : theme.palette.text.primary
                                        }}>
                                            {twoFactorSuccess ? '¡Verificación exitosa!' : 'Verificando código...'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                                            {twoFactorSuccess
                                                ? 'Redirigiendo al dashboard...'
                                                : 'Por favor espera mientras verificamos tu identidad'}
                                        </Typography>
                                    </motion.div>
                                </Box>
                            </Box>
                        </motion.div>
                    ) : (
                        <>
                            <Box sx={{
                                mb: 3,
                                p: 2.5,
                                borderRadius: 2.5,
                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                            }}>
                                <Typography variant="body1" sx={{
                                    color: theme.palette.text.primary,
                                    textAlign: 'center',
                                    fontWeight: 500,
                                    lineHeight: 1.6
                                }}>
                                    Confirma el acceso a tu cuenta ingresando el código de autenticación
                                </Typography>
                            </Box>

                            {rateLimited && countdown > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20
                                    }}
                                >
                                    <Alert
                                        severity="error"
                                        icon={
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.1, 1]
                                                }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity
                                                }}
                                            >
                                                <Block />
                                            </motion.div>
                                        }
                                        sx={{
                                            mb: 3,
                                            borderRadius: 2.5,
                                            border: `2px solid ${alpha(theme.palette.error.main, 0.3)}`,
                                            background: `linear-gradient(135deg, ${alpha(theme.palette.error.light, 0.15)} 0%, ${alpha(theme.palette.error.main, 0.1)} 100%)`,
                                            boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
                                        }}
                                    >
                                        <Typography variant="body2" fontWeight="700" sx={{ mb: 1 }}>
                                            🚫 Cuenta bloqueada temporalmente
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 500, mb: 2 }}>
                                            Demasiados intentos fallidos. Por seguridad, debes esperar antes de intentar nuevamente.
                                        </Typography>

                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            p: 2,
                                            borderRadius: 2,
                                            background: alpha('#fff', 0.5)
                                        }}>
                                            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                                <CircularProgress
                                                    variant="determinate"
                                                    value={(countdown / 60) * 100}
                                                    size={60}
                                                    thickness={4}
                                                    sx={{
                                                        color: theme.palette.error.main,
                                                        '& .MuiCircularProgress-circle': {
                                                            strokeLinecap: 'round',
                                                        }
                                                    }}
                                                />
                                                <Box
                                                    sx={{
                                                        top: 0,
                                                        left: 0,
                                                        bottom: 0,
                                                        right: 0,
                                                        position: 'absolute',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Typography
                                                        variant="h6"
                                                        component="div"
                                                        fontWeight="700"
                                                        sx={{ color: theme.palette.error.main }}
                                                    >
                                                        {countdown}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight="700" sx={{ mb: 0.5 }}>
                                                    Tiempo restante
                                                </Typography>
                                                <Typography variant="h5" fontWeight="700" sx={{ color: theme.palette.error.main }}>
                                                    {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                                    minutos
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Alert>
                                </motion.div>
                            )}

                            {!rateLimited && attempts >= 3 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20
                                    }}
                                >
                                    <Alert
                                        severity="warning"
                                        icon={
                                            <motion.div
                                                animate={{
                                                    rotate: [0, -10, 10, -10, 0],
                                                    scale: [1, 1.1, 1]
                                                }}
                                                transition={{
                                                    duration: 0.5,
                                                    repeat: Infinity,
                                                    repeatDelay: 2
                                                }}
                                            >
                                                <Warning />
                                            </motion.div>
                                        }
                                        sx={{
                                            mb: 3,
                                            borderRadius: 2.5,
                                            border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                                            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                                            boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.2)}`,
                                            '& .MuiAlert-icon': {
                                                fontSize: 28
                                            }
                                        }}
                                    >
                                        <Typography variant="body2" fontWeight="700" sx={{ mb: 0.5 }}>
                                            ⚠️ Múltiples intentos fallidos detectados
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 500 }}>
                                            Después de 5 intentos fallidos, serás bloqueado temporalmente por seguridad.
                                        </Typography>
                                        <Box sx={{
                                            mt: 1.5,
                                            display: 'flex',
                                            gap: 0.5
                                        }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Box
                                                    key={i}
                                                    sx={{
                                                        flex: 1,
                                                        height: 6,
                                                        borderRadius: 1,
                                                        background: i < attempts
                                                            ? theme.palette.warning.main
                                                            : alpha(theme.palette.warning.main, 0.2),
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Alert>
                                </motion.div>
                            )}

                            {twoFactorError && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, x: -20 }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        x: 0
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 25
                                    }}
                                >
                                    <motion.div
                                        animate={{
                                            x: [0, -5, 5, -5, 5, 0]
                                        }}
                                        transition={{
                                            duration: 0.5,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <Alert
                                            severity="error"
                                            icon={
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.2, 1],
                                                        rotate: [0, -10, 10, 0]
                                                    }}
                                                    transition={{
                                                        duration: 0.5
                                                    }}
                                                >
                                                    <ErrorIcon />
                                                </motion.div>
                                            }
                                            sx={{
                                                mb: 3,
                                                borderRadius: 2.5,
                                                border: `2px solid ${alpha(theme.palette.error.main, 0.3)}`,
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.error.light, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                                                boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`,
                                                '& .MuiAlert-icon': {
                                                    fontSize: 28
                                                }
                                            }}
                                        >
                                            <Typography variant="body2" fontWeight="700">
                                                {twoFactorError}
                                            </Typography>
                                        </Alert>
                                    </motion.div>
                                </motion.div>
                            )}

                            <Box sx={{
                                mb: 4,
                                p: 1,
                                borderRadius: 3,
                                background: alpha(theme.palette.grey[200], 0.5),
                                border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`
                            }}>
                                <Tabs
                                    value={twoFactorTab}
                                    onChange={(e, newValue) => {
                                        setTwoFactorTab(newValue);
                                        setTwoFactorError('');
                                        setTwoFactorCode('');
                                        setRecoveryCode('');
                                    }}
                                    variant="fullWidth"
                                    TabIndicatorProps={{
                                        style: { display: 'none' }
                                    }}
                                    sx={{
                                        minHeight: 'auto',
                                        '& .MuiTab-root': {
                                            borderRadius: 2,
                                            mx: 0.5,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            fontSize: '0.95rem',
                                            minHeight: 48,
                                            color: theme.palette.text.secondary,
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: alpha(theme.palette.primary.main, 0.05),
                                                color: theme.palette.primary.main
                                            }
                                        },
                                        '& .Mui-selected': {
                                            background: '#ffffff',
                                            color: theme.palette.primary.main,
                                            boxShadow: `0 2px 8px ${alpha('#000', 0.08)}`,
                                            '&:hover': {
                                                background: '#ffffff'
                                            }
                                        }
                                    }}
                                >
                                    <Tab
                                        icon={<VpnKey />}
                                        label="Código de Autenticación"
                                        iconPosition="start"
                                    />
                                    <Tab
                                        icon={<Key />}
                                        label="Código de Recuperación"
                                        iconPosition="start"
                                    />
                                </Tabs>
                            </Box>

                            <form onSubmit={submit2FA}>
                                {twoFactorTab === 0 ? (
                                    <Box>
                                        <Box sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
                                            border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                            mb: 2
                                        }}>
                                            <TextField
                                                label="Código de Autenticación"
                                                value={twoFactorCode}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                    setTwoFactorCode(value);
                                                    setTwoFactorError('');
                                                }}
                                                placeholder="000000"
                                                fullWidth
                                                autoFocus
                                                inputProps={{
                                                    maxLength: 6,
                                                    pattern: '[0-9]*',
                                                    inputMode: 'numeric',
                                                    autoComplete: 'one-time-code',
                                                    style: {
                                                        fontSize: '2rem',
                                                        letterSpacing: '0.8rem',
                                                        textAlign: 'center',
                                                        fontWeight: 700,
                                                        color: theme.palette.primary.main
                                                    }
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2.5,
                                                        background: '#ffffff',
                                                        '& fieldset': {
                                                            borderColor: alpha(theme.palette.primary.main, 0.2),
                                                            borderWidth: 2
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: alpha(theme.palette.primary.main, 0.4)
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: theme.palette.primary.main,
                                                            borderWidth: 2
                                                        },
                                                        '&.Mui-focused': {
                                                            boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
                                                        }
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        fontWeight: 600,
                                                        color: theme.palette.text.secondary
                                                    }
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: 1.5,
                                            mb: 2
                                        }}>
                                            {[...Array(6)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{
                                                        scale: i < twoFactorCode.length ? 1.2 : 1,
                                                        opacity: 1
                                                    }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 14,
                                                            height: 14,
                                                            borderRadius: '50%',
                                                            bgcolor: i < twoFactorCode.length
                                                                ? theme.palette.primary.main
                                                                : alpha(theme.palette.primary.main, 0.15),
                                                            boxShadow: i < twoFactorCode.length
                                                                ? `0 0 12px ${alpha(theme.palette.primary.main, 0.5)}`
                                                                : 'none',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    />
                                                </motion.div>
                                            ))}
                                        </Box>
                                        <Typography variant="caption" sx={{
                                            display: 'block',
                                            textAlign: 'center',
                                            color: theme.palette.text.secondary,
                                            fontWeight: 500
                                        }}>
                                            Ingresa el código de 6 dígitos de tu app de autenticación
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Box sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
                                            border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                            mb: 2
                                        }}>
                                            <TextField
                                                label="Código de Recuperación"
                                                value={recoveryCode}
                                                onChange={(e) => {
                                                    setRecoveryCode(e.target.value);
                                                    setTwoFactorError('');
                                                }}
                                                placeholder="xxxx-xxxx-xxxx"
                                                fullWidth
                                                autoFocus
                                                inputProps={{
                                                    style: {
                                                        fontSize: '1.4rem',
                                                        letterSpacing: '0.15rem',
                                                        textAlign: 'center',
                                                        fontFamily: 'monospace',
                                                        fontWeight: 600,
                                                        color: theme.palette.primary.main
                                                    }
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2.5,
                                                        background: '#ffffff',
                                                        '& fieldset': {
                                                            borderColor: alpha(theme.palette.primary.main, 0.2),
                                                            borderWidth: 2
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: alpha(theme.palette.primary.main, 0.4)
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: theme.palette.primary.main,
                                                            borderWidth: 2
                                                        },
                                                        '&.Mui-focused': {
                                                            boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
                                                        }
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        fontWeight: 600,
                                                        color: theme.palette.text.secondary
                                                    }
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="caption" sx={{
                                            display: 'block',
                                            textAlign: 'center',
                                            color: theme.palette.text.secondary,
                                            fontWeight: 500
                                        }}>
                                            Ingresa uno de tus códigos de recuperación
                                        </Typography>
                                    </Box>
                                )}
                            </form>

                            {/* Remember Device Checkbox */}
                            <Box sx={{ mt: 3, px: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={rememberDevice}
                                            onChange={(e) => setRememberDevice(e.target.checked)}
                                            disabled={twoFactorProcessing || rateLimited}
                                            sx={{
                                                color: theme.palette.primary.main,
                                                '&.Mui-checked': {
                                                    color: theme.palette.primary.main,
                                                }
                                            }}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body2" fontWeight="600" sx={{ color: theme.palette.text.primary }}>
                                                🔒 Confiar en este dispositivo
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mt: 0.5 }}>
                                                No volver a pedir 2FA en este dispositivo durante 30 días
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{
                                        mt: 2,
                                        mb: 1,
                                        alignItems: 'flex-start',
                                        '& .MuiCheckbox-root': {
                                            pt: 0
                                        }
                                    }}
                                />
                            </Box>
                        </>
                    )}
                </DialogContent>

                {!twoFactorProcessing && (
                    <DialogActions sx={{
                        px: 4,
                        pb: 4,
                        pt: 3,
                        gap: 2,
                        background: `linear-gradient(180deg, transparent 0%, ${alpha(theme.palette.grey[100], 0.3)} 100%)`
                    }}>
                        <Button
                            onClick={() => {
                                setShow2FAModal(false);
                                setTwoFactorCode('');
                                setRecoveryCode('');
                                setTwoFactorError('');
                                setAttempts(0);
                            }}
                            sx={{
                                borderRadius: 2.5,
                                px: 4,
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '1rem',
                                color: theme.palette.text.secondary,
                                border: `2px solid ${alpha(theme.palette.grey[400], 0.3)}`,
                                '&:hover': {
                                    background: alpha(theme.palette.grey[100], 0.5),
                                    borderColor: alpha(theme.palette.grey[400], 0.5)
                                }
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={submit2FA}
                            variant="contained"
                            disabled={rateLimited || (twoFactorTab === 0 ? twoFactorCode.length !== 6 : !recoveryCode)}
                            startIcon={rateLimited ? <Block /> : <SecurityIcon />}
                            sx={{
                                borderRadius: 2.5,
                                px: 5,
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '1rem',
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                                border: 'none',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                    transition: 'left 0.5s'
                                },
                                '&:hover': {
                                    boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.5)}`,
                                    transform: 'translateY(-2px)',
                                    '&::before': {
                                        left: '100%'
                                    }
                                },
                                '&:disabled': {
                                    background: alpha(theme.palette.grey[400], 0.3),
                                    color: alpha(theme.palette.text.primary, 0.4),
                                    boxShadow: 'none'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Verificar Código
                        </Button>
                    </DialogActions>
                )}
            </Dialog>
        </MainLayout>
    );
};

export default LoginMUI;
