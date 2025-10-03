import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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
    alpha
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
    Construction as ConstructionIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const LoginMUI = ({ status, canResetPassword }) => {
    const theme = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const handleClickShowPassword = () => setShowPassword(!showPassword);

    const handleSocialLogin = (provider) => {
        window.location.href = route('social.redirect', { provider });
    };

    return (
        <>
            <Head title="Iniciar Sesión - MDR Construcciones" />
            
            <Box
                sx={{
                    minHeight: '100vh',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    py: 4
                }}
            >
                <Container maxWidth="sm">
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
                </Container>
            </Box>
        </>
    );
};

export default LoginMUI;