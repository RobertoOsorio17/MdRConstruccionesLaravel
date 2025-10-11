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
    useTheme
} from '@mui/material';
import {
    Email as EmailIcon,
    ArrowBack as ArrowBackIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';

export default function ForgotPassword({ status }) {
    const theme = useTheme();
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(route('password.email'), {
            onSuccess: () => {
                setIsSubmitted(true);
            }
        });
    };

    if (isSubmitted || status) {
        return (
            <MainLayout>
                <Head title="Enlace de Recuperación Enviado" />
                
                <Container maxWidth="sm" sx={{ py: 8 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card elevation={4}>
                            <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                >
                                    <CheckCircleIcon 
                                        sx={{ 
                                            fontSize: 80, 
                                            color: 'success.main',
                                            mb: 2
                                        }} 
                                    />
                                </motion.div>
                                
                                <Typography variant="h4" gutterBottom fontWeight="bold">
                                    ¡Enlace Enviado!
                                </Typography>
                                
                                <Typography variant="body1" color="text.secondary" paragraph>
                                    Hemos enviado un enlace de recuperación de contraseña a tu email. 
                                    Revisa tu bandeja de entrada y sigue las instrucciones.
                                </Typography>
                                
                                <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                                    <Typography variant="body2">
                                        <strong>No encuentras el email?</strong><br />
                                        • Revisa tu carpeta de spam<br />
                                        • El enlace caduca en 60 minutos<br />
                                        • Puedes solicitar otro enlace si es necesario
                                    </Typography>
                                </Alert>
                                
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                    <Button
                                        component={Link}
                                        href="/login"
                                        startIcon={<ArrowBackIcon />}
                                        variant="outlined"
                                    >
                                        Volver al Login
                                    </Button>
                                    
                                    <Button
                                        onClick={() => {
                                            setIsSubmitted(false);
                                        }}
                                        variant="contained"
                                        color="primary"
                                    >
                                        Enviar Otro Enlace
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Container>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Head title="Recuperar Contraseña" />
            
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
                                    <EmailIcon 
                                        sx={{ 
                                            fontSize: 60, 
                                            color: 'primary.main',
                                            mb: 2
                                        }} 
                                    />
                                </motion.div>
                                
                                <Typography variant="h4" gutterBottom fontWeight="bold">
                                    Recuperar Contraseña
                                </Typography>
                                
                                <Typography variant="body1" color="text.secondary">
                                    Introduce tu email y te enviaremos un enlace para restablecer tu contraseña
                                </Typography>
                            </Box>

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    type="email"
                                    label="Email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    required
                                    autoFocus
                                    sx={{ mb: 3 }}
                                    InputProps={{
                                        startAdornment: (
                                            <EmailIcon sx={{ color: 'text.secondary', mr: 1 }} />
                                        ),
                                    }}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={processing}
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
                                            Enviando...
                                        </>
                                    ) : (
                                        'Enviar Enlace de Recuperación'
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