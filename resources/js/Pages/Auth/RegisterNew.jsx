import { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    InputAdornment,
    IconButton,
    Checkbox,
    FormControlLabel,
    LinearProgress,
    Link as MuiLink,
    useTheme
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    ArrowForward as ArrowForwardIcon,
    CheckCircle as CheckCircleIcon,
    Speed as SpeedIcon,
    Security as SecurityIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Head, Link, useForm } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function RegisterNew() {
    const theme = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

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

    // Password strength calculator
    const getPasswordStrength = (password) => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
        if (password.match(/\d/)) strength += 25;
        if (password.match(/[^a-zA-Z\d]/)) strength += 25;
        return strength;
    };

    const passwordStrength = getPasswordStrength(data.password);

    // Validation helpers
    const isEmailValid = data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    const isNameValid = data.name && data.name.length >= 3;
    const passwordsMatch = data.password && data.password_confirmation && data.password === data.password_confirmation;

    return (
        <>
            <Head title="Registro" />

            {/* Main Container */}
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                        : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    py: 4,
                }}
            >
                {/* Animated Background Orbs */}
                <Box
                    component={motion.div}
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    sx={{
                        position: 'absolute',
                        top: '-10%',
                        right: '-5%',
                        width: '40%',
                        height: '40%',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(240, 147, 251, 0.3) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        pointerEvents: 'none',
                    }}
                />

                <Box
                    component={motion.div}
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [360, 180, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    sx={{
                        position: 'absolute',
                        bottom: '-10%',
                        left: '-5%',
                        width: '35%',
                        height: '35%',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(79, 172, 254, 0.3) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        pointerEvents: 'none',
                    }}
                />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            borderRadius: 4,
                            overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            minHeight: { xs: 'auto', md: '700px' },
                        }}
                    >
                        {/* Left Side - Branding */}
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            sx={{
                                flex: 1,
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
                                p: { xs: 4, md: 6 },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Dots Pattern Background */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                                    backgroundSize: '30px 30px',
                                    pointerEvents: 'none',
                                    opacity: 0.3,
                                }}
                            />

                            {/* Floating Icons */}
                            {[
                                { Icon: SpeedIcon, top: '15%', left: '8%', delay: 0 },
                                { Icon: SecurityIcon, top: '65%', left: '12%', delay: 2 },
                                { Icon: CheckCircleIcon, top: '35%', right: '10%', delay: 4 },
                            ].map((item, index) => (
                                <Box
                                    key={index}
                                    component={motion.div}
                                    animate={{
                                        y: [0, -20, 0],
                                        rotate: [0, 10, -10, 0],
                                    }}
                                    transition={{
                                        duration: 6,
                                        repeat: Infinity,
                                        delay: item.delay,
                                        ease: "easeInOut"
                                    }}
                                    sx={{
                                        position: 'absolute',
                                        top: item.top,
                                        left: item.left,
                                        right: item.right,
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        pointerEvents: 'none',
                                        opacity: 0.6,
                                    }}
                                >
                                    <item.Icon sx={{ fontSize: 30 }} />
                                </Box>
                            ))}

                            {/* Logo */}
                            <Box
                                component={motion.div}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                sx={{ mb: 4, position: 'relative', zIndex: 1 }}
                            >
                                <Link href="/">
                                    <ApplicationLogo className="h-16 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
                                </Link>
                            </Box>

                            {/* Title */}
                            <Box
                                component={motion.div}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                sx={{ position: 'relative', zIndex: 1 }}
                            >
                                <Typography
                                    variant="h3"
                                    sx={{
                                        color: 'white',
                                        fontWeight: 700,
                                        mb: 2,
                                        fontSize: { xs: '2rem', md: '2.5rem' },
                                    }}
                                >
                                    Únete a nosotros
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        mb: 4,
                                        fontWeight: 400,
                                    }}
                                >
                                    Comienza tu viaje con MDR Construcciones
                                </Typography>
                            </Box>

                            {/* Benefits */}
                            <Box
                                component={motion.div}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.6 }}
                                sx={{ position: 'relative', zIndex: 1 }}
                            >
                                {[
                                    { icon: '✨', text: 'Crea tu cuenta en segundos' },
                                    { icon: '🔒', text: 'Tus datos están seguros' },
                                    { icon: '🚀', text: 'Acceso inmediato a todas las funciones' },
                                ].map((benefit, index) => (
                                    <Box
                                        key={index}
                                        component={motion.div}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 2,
                                            color: 'white',
                                        }}
                                    >
                                        <Typography sx={{ fontSize: '1.5rem', mr: 2 }}>
                                            {benefit.icon}
                                        </Typography>
                                        <Typography sx={{ fontSize: '1rem' }}>
                                            {benefit.text}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        {/* Right Side - Form */}
                        <Box
                            component={motion.div}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            sx={{
                                flex: 1,
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(20px)',
                                p: { xs: 4, md: 6 },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                maxHeight: { xs: 'none', md: '700px' },
                                overflowY: 'auto',
                            }}
                        >
                            <Box>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        mb: 1,
                                        color: theme.palette.text.primary,
                                    }}
                                >
                                    Crear Cuenta
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        mb: 3,
                                    }}
                                >
                                    Completa el formulario para registrarte
                                </Typography>

                                <Box component="form" onSubmit={submit}>
                                    {/* Name Field */}
                                    <TextField
                                        fullWidth
                                        label="Nombre Completo"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        error={!!errors.name}
                                        helperText={errors.name}
                                        autoComplete="name"
                                        autoFocus
                                        required
                                        sx={{ mb: 3 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <PersonIcon />
                                                </InputAdornment>
                                            ),
                                            endAdornment: isNameValid && (
                                                <InputAdornment position="end">
                                                    <CheckCircleIcon color="success" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    {/* Email Field */}
                                    <TextField
                                        fullWidth
                                        label="Correo Electrónico"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        autoComplete="username"
                                        required
                                        sx={{ mb: 3 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon />
                                                </InputAdornment>
                                            ),
                                            endAdornment: isEmailValid && (
                                                <InputAdornment position="end">
                                                    <CheckCircleIcon color="success" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    {/* Password Field */}
                                    <TextField
                                        fullWidth
                                        label="Contraseña"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        error={!!errors.password}
                                        helperText={errors.password}
                                        autoComplete="new-password"
                                        required
                                        sx={{ mb: 2 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon />
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
                                    />

                                    {/* Password Strength Indicator */}
                                    {data.password && (
                                        <Box sx={{ mb: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Seguridad de la contraseña
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: passwordStrength < 50 ? 'error.main' :
                                                               passwordStrength < 75 ? 'warning.main' :
                                                               'success.main',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {passwordStrength < 50 ? 'Débil' :
                                                     passwordStrength < 75 ? 'Media' :
                                                     'Fuerte'}
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={passwordStrength}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: passwordStrength < 50 ? 'error.main' :
                                                                passwordStrength < 75 ? 'warning.main' :
                                                                'success.main',
                                                        borderRadius: 3,
                                                    }
                                                }}
                                            />
                                        </Box>
                                    )}

                                    {/* Password Confirmation Field */}
                                    <TextField
                                        fullWidth
                                        label="Confirmar Contraseña"
                                        type={showPasswordConfirmation ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        error={!!errors.password_confirmation}
                                        helperText={errors.password_confirmation}
                                        autoComplete="new-password"
                                        required
                                        sx={{ mb: 3 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <>
                                                    {passwordsMatch && (
                                                        <InputAdornment position="end">
                                                            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                                                        </InputAdornment>
                                                    )}
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                            edge="end"
                                                        >
                                                            {showPasswordConfirmation ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                </>
                                            ),
                                        }}
                                    />

                                    {/* Terms and Conditions */}
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={data.terms}
                                                onChange={(e) => setData('terms', e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Typography variant="body2">
                                                Acepto los{' '}
                                                <MuiLink href="/terminos" target="_blank" underline="hover">
                                                    términos y condiciones
                                                </MuiLink>
                                                {' '}y la{' '}
                                                <MuiLink href="/privacidad" target="_blank" underline="hover">
                                                    política de privacidad
                                                </MuiLink>
                                            </Typography>
                                        }
                                        sx={{ mb: 3 }}
                                    />

                                    {/* Submit Button */}
                                    <Button
                                        fullWidth
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={processing || !data.terms}
                                        endIcon={<ArrowForwardIcon />}
                                        sx={{
                                            py: 1.5,
                                            mb: 3,
                                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                            fontWeight: 600,
                                            fontSize: '1.1rem',
                                            textTransform: 'none',
                                            boxShadow: '0 4px 15px rgba(240, 147, 251, 0.4)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                                                boxShadow: '0 6px 20px rgba(240, 147, 251, 0.6)',
                                                transform: 'translateY(-2px)',
                                            },
                                            '&:disabled': {
                                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                opacity: 0.7,
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        {processing ? 'Creando cuenta...' : 'Crear Cuenta'}
                                    </Button>

                                    {/* Login Link */}
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            ¿Ya tienes una cuenta?
                                        </Typography>
                                        <Button
                                            component={Link}
                                            href={route('login')}
                                            variant="outlined"
                                            fullWidth
                                            sx={{
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                borderWidth: 2,
                                                '&:hover': {
                                                    borderWidth: 2,
                                                    transform: 'translateY(-2px)',
                                                },
                                            }}
                                        >
                                            Iniciar Sesión
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </>
    );
}



