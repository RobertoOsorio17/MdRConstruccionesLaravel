import React, { useState, useEffect } from 'react';
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
    IconButton,
    LinearProgress,
    useTheme,
} from '@mui/material';
import {
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Email as EmailIcon,
    Security as SecurityIcon,
} from '@mui/icons-material';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleBackground from '@/Components/Auth/ParticleBackground';
import AnimatedGradient from '@/Components/Auth/AnimatedGradient';

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
        <Box
            component={motion.div}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            sx={{ mt: 1 }}
        >
            <LinearProgress
                variant="determinate"
                value={(strength / 5) * 100}
                color={getColor()}
                sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                }}
            />
            <Typography
                variant="caption"
                color={`${getColor()}.main`}
                sx={{ mt: 0.5, display: 'block', fontWeight: 600 }}
            >
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
        <Box
            component={motion.div}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            sx={{ mt: 2 }}
        >
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                La contraseña debe cumplir:
            </Typography>
            {requirements.map((req, index) => {
                const isValid = req.test(password);
                return (
                    <Box
                        key={index}
                        component={motion.div}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        display="flex"
                        alignItems="center"
                        sx={{ mb: 0.5 }}
                    >
                        <Box
                            component={motion.div}
                            animate={{
                                scale: isValid ? [1, 1.2, 1] : 1,
                                rotate: isValid ? [0, 10, -10, 0] : 0,
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            {isValid ? (
                                <CheckIcon sx={{ fontSize: 18, color: 'success.main', mr: 1 }} />
                            ) : (
                                <CancelIcon sx={{ fontSize: 18, color: 'error.main', mr: 1 }} />
                            )}
                        </Box>
                        <Typography
                            variant="caption"
                            color={isValid ? 'success.main' : 'text.secondary'}
                            sx={{ fontWeight: isValid ? 600 : 400 }}
                        >
                            {req.label}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
};

export default function ResetPasswordNew({ token, email }) {
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
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
            <Head title="Restablecer Contraseña" />
            
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
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        sx={{
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: 4,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            p: { xs: 4, md: 6 },
                        }}
                    >
                        {/* Icon */}
                        <Box
                            component={motion.div}
                            variants={itemVariants}
                            sx={{ textAlign: 'center', mb: 3 }}
                        >
                            <Box
                                component={motion.div}
                                animate={{
                                    scale: [1, 1.05, 1],
                                    rotate: [0, -5, 5, 0],
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
                                <SecurityIcon sx={{ fontSize: 48, color: 'white' }} />
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
                                Nueva Contraseña
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Ingresa tu nueva contraseña para la cuenta
                            </Typography>
                            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, mt: 1 }}>
                                {email}
                            </Typography>
                        </Box>

                        {/* Error Alert */}
                        <AnimatePresence>
                            {Object.keys(errors).length > 0 && (
                                <Box
                                    component={motion.div}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    variants={itemVariants}
                                >
                                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                        <Typography variant="body2">
                                            Por favor corrige los errores antes de continuar
                                        </Typography>
                                    </Alert>
                                </Box>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <Box component="form" onSubmit={handleSubmit}>
                            {/* Email (readonly) */}
                            <Box component={motion.div} variants={itemVariants}>
                                <TextField
                                    fullWidth
                                    type="email"
                                    label="Email"
                                    value={data.email}
                                    disabled
                                    sx={{
                                        mb: 3,
                                        '& .Mui-disabled': {
                                            WebkitTextFillColor: theme.palette.text.primary,
                                        },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            {/* New Password */}
                            <Box component={motion.div} variants={itemVariants}>
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
                                    sx={{
                                        mb: 1,
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

                                <AnimatePresence>
                                    {data.password && (
                                        <>
                                            <PasswordStrengthIndicator password={data.password} />
                                            <PasswordRequirements password={data.password} />
                                        </>
                                    )}
                                </AnimatePresence>
                            </Box>

                            {/* Confirm Password */}
                            <Box component={motion.div} variants={itemVariants}>
                                <TextField
                                    fullWidth
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    label="Confirmar Contraseña"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    error={!!errors.password_confirmation}
                                    helperText={errors.password_confirmation}
                                    required
                                    sx={{
                                        mt: 3,
                                        mb: 3,
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
                                                    whileHover={{ scale: 1.2, rotate: 10 }}
                                                    transition={{ type: 'spring', stiffness: 300 }}
                                                >
                                                    <LockIcon color="primary" />
                                                </Box>
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                    edge="end"
                                                    component={motion.button}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    {showPasswordConfirmation ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                                <AnimatePresence>
                                                    {data.password_confirmation && (
                                                        <motion.div
                                                            initial={{ scale: 0, rotate: -180 }}
                                                            animate={{ scale: 1, rotate: 0 }}
                                                            exit={{ scale: 0, rotate: 180 }}
                                                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                                            style={{ marginLeft: 8 }}
                                                        >
                                                            {passwordsMatch ? (
                                                                <CheckIcon sx={{ color: 'success.main' }} />
                                                            ) : (
                                                                <CancelIcon sx={{ color: 'error.main' }} />
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>

                            {/* Submit Button */}
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
                                        disabled={processing || !isPasswordValid() || !passwordsMatch}
                                        endIcon={
                                            processing ? (
                                                <CircularProgress size={20} color="inherit" />
                                            ) : (
                                                <Box
                                                    component={motion.div}
                                                    animate={{ x: [0, 5, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                >
                                                    <SecurityIcon />
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
                                            '&:disabled': {
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                opacity: 0.5,
                                            },
                                        }}
                                    >
                                        {processing ? 'Cambiando Contraseña...' : 'Cambiar Contraseña'}
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
                </Container>
            </Box>
        </>
    );
}
