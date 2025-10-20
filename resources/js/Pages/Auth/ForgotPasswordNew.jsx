import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Alert,
    Link as MuiLink,
    CircularProgress,
    InputAdornment,
    useTheme,
    Paper,
} from '@mui/material';
import {
    Email as EmailIcon,
    ArrowBack as ArrowBackIcon,
    CheckCircle as CheckCircleIcon,
    Send as SendIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleBackground from '@/Components/Auth/ParticleBackground';
import AnimatedGradient from '@/Components/Auth/AnimatedGradient';

export default function ForgotPasswordNew({ status }) {
    const theme = useTheme();
    const [step, setStep] = useState('form'); // 'form' or 'success'
    const [isEmailValid, setIsEmailValid] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(route('password.email'), {
            onSuccess: () => {
                setStep('success');
            }
        });
    };

    // Email validation
    React.useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setIsEmailValid(emailRegex.test(data.email));
    }, [data.email]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        },
        exit: { 
            opacity: 0,
            x: -100,
            transition: { duration: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <>
            <Head title="Recuperar Contraseña" />
            
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
                <ParticleBackground color="#ffffff" particleCount={50} />

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

                {/* Content Container */}
                <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 10 }}>
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        sx={{
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 4,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            overflow: 'hidden',
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {step === 'form' ? (
                                <motion.div
                                    key="form"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <Box sx={{ p: { xs: 4, md: 6 } }}>
                                        {/* Icon */}
                                        <Box
                                            component={motion.div}
                                            variants={itemVariants}
                                            sx={{ textAlign: 'center', mb: 3 }}
                                        >
                                            <Box
                                                component={motion.div}
                                                animate={{
                                                    scale: [1, 1.1, 1],
                                                    rotate: [0, 5, -5, 0],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                                sx={{
                                                    display: 'inline-flex',
                                                    p: 3,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                                                }}
                                            >
                                                <EmailIcon sx={{ fontSize: 48, color: 'white' }} />
                                            </Box>
                                        </Box>

                                        {/* Title */}
                                        <Box component={motion.div} variants={itemVariants} sx={{ textAlign: 'center', mb: 4 }}>
                                            <Typography
                                                variant="h4"
                                                sx={{
                                                    fontWeight: 700,
                                                    mb: 1,
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                }}
                                            >
                                                Recuperar Contraseña
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary">
                                                Introduce tu email y te enviaremos un enlace para restablecer tu contraseña
                                            </Typography>
                                        </Box>

                                        {/* Form */}
                                        <Box component="form" onSubmit={handleSubmit}>
                                            <Box component={motion.div} variants={itemVariants}>
                                                <TextField
                                                    fullWidth
                                                    type="email"
                                                    label="Correo Electrónico"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    error={!!errors.email}
                                                    helperText={errors.email}
                                                    required
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

                                            <Box component={motion.div} variants={itemVariants}>
                                                <Box
                                                    component={motion.div}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <Button
                                                        fullWidth
                                                        type="submit"
                                                        variant="contained"
                                                        size="large"
                                                        disabled={processing || !isEmailValid}
                                                        endIcon={
                                                            processing ? (
                                                                <CircularProgress size={20} color="inherit" />
                                                            ) : (
                                                                <Box
                                                                    component={motion.div}
                                                                    animate={{ x: [0, 5, 0] }}
                                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                                >
                                                                    <SendIcon />
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
                                                                '&::before': {
                                                                    left: '100%',
                                                                },
                                                            },
                                                        }}
                                                    >
                                                        Enviar Enlace de Recuperación
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Footer */}
                                        <Box component={motion.div} variants={itemVariants} sx={{ textAlign: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                ¿Recordaste tu contraseña?{' '}
                                                <MuiLink
                                                    component={Link}
                                                    href={route('login')}
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
                                    </Box>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="success"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <Box sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
                                        {/* Success Icon with Confetti Effect */}
                                        <Box
                                            component={motion.div}
                                            variants={itemVariants}
                                            sx={{ mb: 3 }}
                                        >
                                            <Box
                                                component={motion.div}
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 200,
                                                    damping: 15,
                                                    delay: 0.2
                                                }}
                                                sx={{
                                                    display: 'inline-flex',
                                                    p: 3,
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                                                    boxShadow: '0 10px 30px rgba(76, 175, 80, 0.4)',
                                                }}
                                            >
                                                <CheckCircleIcon sx={{ fontSize: 64, color: 'white' }} />
                                            </Box>

                                            {/* Confetti particles */}
                                            {[...Array(8)].map((_, i) => (
                                                <Box
                                                    key={i}
                                                    component={motion.div}
                                                    initial={{
                                                        scale: 0,
                                                        x: 0,
                                                        y: 0,
                                                        opacity: 1
                                                    }}
                                                    animate={{
                                                        scale: [0, 1, 0],
                                                        x: Math.cos((i * Math.PI * 2) / 8) * 100,
                                                        y: Math.sin((i * Math.PI * 2) / 8) * 100,
                                                        opacity: [1, 1, 0],
                                                    }}
                                                    transition={{
                                                        duration: 1.5,
                                                        delay: 0.3,
                                                        ease: "easeOut"
                                                    }}
                                                    sx={{
                                                        position: 'absolute',
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: '50%',
                                                        background: ['#667eea', '#764ba2', '#f093fb', '#4caf50'][i % 4],
                                                        top: '50%',
                                                        left: '50%',
                                                        pointerEvents: 'none',
                                                    }}
                                                />
                                            ))}
                                        </Box>

                                        {/* Title */}
                                        <Box component={motion.div} variants={itemVariants}>
                                            <Typography
                                                variant="h4"
                                                sx={{
                                                    fontWeight: 700,
                                                    mb: 2,
                                                    background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                }}
                                            >
                                                ¡Enlace Enviado!
                                            </Typography>
                                        </Box>

                                        {/* Description */}
                                        <Box component={motion.div} variants={itemVariants}>
                                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                                Hemos enviado un enlace de recuperación de contraseña a:
                                            </Typography>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: 'primary.main',
                                                    mb: 3,
                                                }}
                                            >
                                                {data.email}
                                            </Typography>
                                        </Box>

                                        {/* Info Alert */}
                                        <Box component={motion.div} variants={itemVariants}>
                                            <Alert
                                                severity="info"
                                                sx={{
                                                    mb: 3,
                                                    textAlign: 'left',
                                                    borderRadius: 2,
                                                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                                    ¿No encuentras el email?
                                                </Typography>
                                                <Typography variant="body2" component="div">
                                                    • Revisa tu carpeta de spam o correo no deseado<br />
                                                    • El enlace caduca en 60 minutos<br />
                                                    • Puedes solicitar otro enlace si es necesario
                                                </Typography>
                                            </Alert>
                                        </Box>

                                        {/* Action Buttons */}
                                        <Box
                                            component={motion.div}
                                            variants={itemVariants}
                                            sx={{
                                                display: 'flex',
                                                gap: 2,
                                                flexDirection: { xs: 'column', sm: 'row' },
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Box
                                                component={motion.div}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    component={Link}
                                                    href={route('login')}
                                                    startIcon={<ArrowBackIcon />}
                                                    variant="outlined"
                                                    size="large"
                                                    sx={{
                                                        px: 4,
                                                        py: 1.5,
                                                        fontWeight: 600,
                                                        textTransform: 'none',
                                                        borderWidth: 2,
                                                        '&:hover': {
                                                            borderWidth: 2,
                                                        },
                                                    }}
                                                >
                                                    Volver al Login
                                                </Button>
                                            </Box>

                                            <Box
                                                component={motion.div}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    onClick={() => {
                                                        setStep('form');
                                                        setData('email', '');
                                                    }}
                                                    startIcon={<RefreshIcon />}
                                                    variant="contained"
                                                    size="large"
                                                    sx={{
                                                        px: 4,
                                                        py: 1.5,
                                                        fontWeight: 600,
                                                        textTransform: 'none',
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                                            boxShadow: '0 6px 16px rgba(102, 126, 234, 0.6)',
                                                        },
                                                    }}
                                                >
                                                    Enviar Otro Enlace
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Box>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>
                </Container>
            </Box>
        </>
    );
}

