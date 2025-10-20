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
    alpha,
    FormHelperText,
    LinearProgress,
    Grid,
    Stack,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    PersonAdd as RegisterIcon,
    Google as GoogleIcon,
    Facebook as FacebookIcon,
    GitHub as GitHubIcon,
    Construction as ConstructionIcon,
    Check as CheckIcon,
    Security as SecurityIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';

const RegisterMUI = () => {
    const theme = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[a-z]/.test(password)) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        return strength;
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setData('password', password);
        setPasswordStrength(calculatePasswordStrength(password));
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength < 25) return 'error';
        if (passwordStrength < 50) return 'warning';
        if (passwordStrength < 75) return 'info';
        return 'success';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength < 25) return 'Muy débil';
        if (passwordStrength < 50) return 'Débil';
        if (passwordStrength < 75) return 'Buena';
        return 'Muy segura';
    };

    const handleSocialLogin = (provider) => {
        window.location.href = route('social.redirect', { provider });
    };

    return (
        <MainLayout>
            <Head title="Registro - MDR Construcciones" />
            
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
                                                Crea tu cuenta
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" color="text.secondary">
                                            Únete a MDR Construcciones para gestionar proyectos, guardar favoritos y recibir novedades.
                                        </Typography>
                                        <Divider />
                                        <List>
                                            <ListItem disableGutters>
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <CheckIcon color="success" />
                                                </ListItemIcon>
                                                <ListItemText primaryTypographyProps={{ fontWeight: 600 }}
                                                    primary="Registro sencillo" secondary="Solo nombre y credenciales necesarios" />
                                            </ListItem>
                                            <ListItem disableGutters>
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <SecurityIcon color="primary" />
                                                </ListItemIcon>
                                                <ListItemText primaryTypographyProps={{ fontWeight: 600 }}
                                                    primary="Seguridad avanzada" secondary="Requisitos de contraseña y verificación de email" />
                                            </ListItem>
                                            <ListItem disableGutters>
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <GoogleIcon color="action" />
                                                </ListItemIcon>
                                                <ListItemText primaryTypographyProps={{ fontWeight: 600 }}
                                                    primary="Regístrate con OAuth" secondary="Google, Facebook o GitHub" />
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
                                    Únete a nosotros
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Crea tu cuenta en MDR Construcciones
                                </Typography>
                            </Box>

                            {/* Social Register */}
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
                                        O regístrate con email
                                    </Typography>
                                </Divider>
                            </Box>

                            {/* Register Form */}
                            <form onSubmit={submit}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <TextField
                                        fullWidth
                                        label="Nombre completo"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        error={!!errors.name}
                                        helperText={errors.name}
                                        autoComplete="name"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon color="action" />
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
                                        onChange={handlePasswordChange}
                                        error={!!errors.password}
                                        helperText={errors.password}
                                        autoComplete="new-password"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon color="action" />
                                                </InputAdornment>
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
                                        sx={{
                                            mb: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                                '&:hover fieldset': {
                                                    borderColor: theme.palette.primary.main,
                                                },
                                            }
                                        }}
                                    />
                                    
                                    {/* Password Strength Indicator */}
                                    {data.password && (
                                        <Box sx={{ mb: 2 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={passwordStrength}
                                                color={getPasswordStrengthColor()}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 4,
                                                    backgroundColor: alpha(theme.palette.grey[300], 0.3)
                                                }}
                                            />
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: theme.palette[getPasswordStrengthColor()].main,
                                                    fontWeight: 500,
                                                    mt: 0.5,
                                                    display: 'block'
                                                }}
                                            >
                                                Seguridad: {getPasswordStrengthText()}
                                            </Typography>
                                        </Box>
                                    )}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <TextField
                                        fullWidth
                                        type={showPasswordConfirmation ? 'text' : 'password'}
                                        label="Confirmar contraseña"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        error={!!errors.password_confirmation}
                                        helperText={errors.password_confirmation}
                                        autoComplete="new-password"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon color="action" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                        edge="end"
                                                    >
                                                        {showPasswordConfirmation ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
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

                                {/* Terms and Conditions */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={data.terms}
                                                onChange={(e) => setData('terms', e.target.checked)}
                                                sx={{
                                                    '&.Mui-checked': {
                                                        color: theme.palette.primary.main,
                                                    }
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography variant="body2">
                                                Acepto los{' '}
                                                <Link
                                                    href="/aviso-legal"
                                                    style={{ color: theme.palette.primary.main, textDecoration: 'none' }}
                                                >
                                                    términos y condiciones
                                                </Link>
                                                {' '}y la{' '}
                                                <Link
                                                    href="/politica-privacidad"
                                                    style={{ color: theme.palette.primary.main, textDecoration: 'none' }}
                                                >
                                                    política de privacidad
                                                </Link>
                                            </Typography>
                                        }
                                        sx={{ mb: 3, alignItems: 'flex-start' }}
                                    />
                                    {errors.terms && (
                                        <FormHelperText error sx={{ mt: -2, mb: 2 }}>
                                            {errors.terms}
                                        </FormHelperText>
                                    )}
                                </motion.div>

                                {/* Submit Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={processing || !data.terms}
                                        startIcon={<RegisterIcon />}
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
                                        {processing ? 'Creando cuenta...' : 'Crear Cuenta'}
                                    </Button>
                                </motion.div>
                            </form>

                            {/* Login Link */}
                            <Box sx={{ textAlign: 'center', mt: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                    ¿Ya tienes una cuenta?{' '}
                                    <Link
                                        href={route('login')}
                                        style={{
                                            color: theme.palette.primary.main,
                                            textDecoration: 'none',
                                            fontWeight: 600
                                        }}
                                    >
                                        Inicia sesión aquí
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
        </MainLayout>
    );
};

export default RegisterMUI;
