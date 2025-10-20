import { useState, useEffect } from 'react';
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
    Divider,
    Chip,
    Alert,
    CircularProgress,
    Tooltip,
    Stack,
    Link as MuiLink,
    useTheme,
    Paper,
    Fade,
    Zoom,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
    ArrowForward as ArrowForwardIcon,
    Google as GoogleIcon,
    Facebook as FacebookIcon,
    GitHub as GitHubIcon,
    Speed as SpeedIcon,
    Security as SecurityIcon,
    CheckCircle as CheckCircleIcon,
    RocketLaunch as RocketIcon,
    HelpOutline as SupportIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Head, Link, useForm } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import ParticleBackground from '@/Components/Auth/ParticleBackground';
import AnimatedGradient from '@/Components/Auth/AnimatedGradient';

export default function LoginNew({ status, canResetPassword }) {
    const theme = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isEmailValid, setIsEmailValid] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Parallax effect
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Email validation
    useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setIsEmailValid(emailRegex.test(data.email));
    }, [data.email]);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Iniciar Sesión" />

            {/* Main Container */}
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    py: 4,
                }}
            >
                {/* Animated Gradient Background */}
                <AnimatedGradient colors={['#667eea', '#764ba2', '#f093fb']} duration={20} />

                {/* Particle Background */}
                <ParticleBackground color="#ffffff" particleCount={60} />

                {/* Animated Background Orbs with Parallax */}
                <Box
                    component={motion.div}
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    style={{
                        x: mousePosition.x,
                        y: mousePosition.y,
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
                        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%)',
                        filter: 'blur(80px)',
                        pointerEvents: 'none',
                        zIndex: 2,
                    }}
                />

                <Box
                    component={motion.div}
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [360, 180, 0],
                    }}
                    style={{
                        x: -mousePosition.x,
                        y: -mousePosition.y,
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
                        background: 'radial-gradient(circle, rgba(118, 75, 162, 0.4) 0%, transparent 70%)',
                        filter: 'blur(80px)',
                        pointerEvents: 'none',
                        zIndex: 2,
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
                            minHeight: { xs: 'auto', md: '600px' },
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
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
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
                                { Icon: SpeedIcon, top: '15%', left: '10%', delay: 0 },
                                { Icon: SecurityIcon, top: '70%', left: '15%', delay: 2 },
                                { Icon: SupportIcon, top: '40%', right: '12%', delay: 4 },
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
                                    Bienvenido de nuevo
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        mb: 4,
                                        fontWeight: 400,
                                    }}
                                >
                                    Construyendo tus sueños, un proyecto a la vez
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
                                    { icon: '🎯', text: 'Acceso a tu panel personalizado' },
                                    { icon: '📊', text: 'Gestiona tus proyectos' },
                                    { icon: '🔔', text: 'Seguimiento en tiempo real' },
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
                                    Iniciar Sesión
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        mb: 3,
                                    }}
                                >
                                    Ingresa tus credenciales para continuar
                                </Typography>

                                <AnimatePresence>
                                    {status && (
                                        <Box
                                            component={motion.div}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Alert
                                                severity="success"
                                                sx={{
                                                    mb: 3,
                                                    borderRadius: 2,
                                                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)'
                                                }}
                                            >
                                                {status}
                                            </Alert>
                                        </Box>
                                    )}
                                </AnimatePresence>

                                <Box component="form" onSubmit={submit}>
                                    {/* Email Field with Enhanced Animation */}
                                    <Box
                                        component={motion.div}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                    >
                                        <TextField
                                            fullWidth
                                            label="Correo Electrónico"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            error={!!errors.email}
                                            helperText={errors.email}
                                            autoComplete="username"
                                            autoFocus
                                            sx={{
                                                mb: 3,
                                                '& .MuiOutlinedInput-root': {
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
                                                    },
                                                    '&.Mui-focused': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 12px 32px rgba(102, 126, 234, 0.25)',
                                                    },
                                                },
                                            }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Box
                                                            component={motion.div}
                                                            whileHover={{ scale: 1.2, rotate: 10 }}
                                                            transition={{ type: 'spring', stiffness: 300 }}
                                                        >
                                                            <EmailIcon color="primary" />
                                                        </Box>
                                                    </InputAdornment>
                                                ),
                                                endAdornment: isEmailValid && (
                                                    <InputAdornment position="end">
                                                        <motion.div
                                                            initial={{ scale: 0, rotate: -180 }}
                                                            animate={{ scale: 1, rotate: 0 }}
                                                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                                        >
                                                            <CheckCircleIcon color="success" />
                                                        </motion.div>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Box>

                                    {/* Password Field with Enhanced Animation */}
                                    <Box
                                        component={motion.div}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                    >
                                        <TextField
                                            fullWidth
                                            label="Contraseña"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            error={!!errors.password}
                                            helperText={errors.password}
                                            autoComplete="current-password"
                                            sx={{
                                                mb: 2,
                                                '& .MuiOutlinedInput-root': {
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 8px 24px rgba(118, 75, 162, 0.15)',
                                                    },
                                                    '&.Mui-focused': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 12px 32px rgba(118, 75, 162, 0.25)',
                                                    },
                                                },
                                            }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Box
                                                            component={motion.div}
                                                            whileHover={{ scale: 1.2, rotate: -10 }}
                                                            transition={{ type: 'spring', stiffness: 300 }}
                                                        >
                                                            <LockIcon color="primary" />
                                                        </Box>
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            edge="end"
                                                            component={motion.button}
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                        >
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Box>

                                    {/* Remember & Forgot Password */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Tooltip title="Mantener la sesión iniciada en este dispositivo" arrow>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={data.remember}
                                                        onChange={(e) => setData('remember', e.target.checked)}
                                                        color="primary"
                                                    />
                                                }
                                                label="Recordarme"
                                            />
                                        </Tooltip>

                                        {canResetPassword && (
                                            <MuiLink
                                                component={Link}
                                                href={route('password.request')}
                                                underline="hover"
                                                sx={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </MuiLink>
                                        )}
                                    </Box>

                                    {/* Submit Button with Advanced Animation */}
                                    <Box
                                        component={motion.div}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.5 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            fullWidth
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={processing}
                                            endIcon={
                                                processing ? (
                                                    <CircularProgress size={20} color="inherit" />
                                                ) : (
                                                    <Box
                                                        component={motion.div}
                                                        animate={{ x: [0, 5, 0] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    >
                                                        <RocketIcon />
                                                    </Box>
                                                )
                                            }
                                            sx={{
                                                py: 1.8,
                                                mb: 3,
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                fontWeight: 700,
                                                fontSize: '1.1rem',
                                                textTransform: 'none',
                                                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
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
                                                    transition: 'left 0.5s',
                                                },
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                                    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.6)',
                                                    transform: 'translateY(-3px)',
                                                    '&::before': {
                                                        left: '100%',
                                                    },
                                                },
                                                '&:disabled': {
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    opacity: 0.7,
                                                },
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            {processing ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                        </Button>
                                    </Box>

                                    {/* Divider */}
                                    <Divider sx={{ my: 3 }}>
                                        <Chip label="o continúa con" size="small" />
                                    </Divider>

                                    {/* Social Login Buttons */}
                                    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<GoogleIcon />}
                                            onClick={() => window.location.href = route('social.redirect', 'google')}
                                            sx={{
                                                py: 1.2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                borderWidth: 2,
                                                '&:hover': {
                                                    borderWidth: 2,
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                },
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            Google
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<FacebookIcon />}
                                            onClick={() => window.location.href = route('social.redirect', 'facebook')}
                                            sx={{
                                                py: 1.2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                borderWidth: 2,
                                                '&:hover': {
                                                    borderWidth: 2,
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                },
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            Facebook
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<GitHubIcon />}
                                            onClick={() => window.location.href = route('social.redirect', 'github')}
                                            sx={{
                                                py: 1.2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                borderWidth: 2,
                                                '&:hover': {
                                                    borderWidth: 2,
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                },
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            GitHub
                                        </Button>
                                    </Stack>

                                    {/* Register Link */}
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            ¿No tienes una cuenta?
                                        </Typography>
                                        <Button
                                            component={Link}
                                            href={route('register')}
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
                                            Crear una cuenta
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


