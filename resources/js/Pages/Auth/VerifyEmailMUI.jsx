import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Alert,
    useTheme,
    alpha,
    CircularProgress
} from '@mui/material';
import {
    Email as EmailIcon,
    Send as SendIcon,
    CheckCircle as CheckIcon,
    Construction as ConstructionIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const VerifyEmailMUI = ({ status }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);
        post(route('verification.send'), {
            onFinish: () => setLoading(false),
        });
    };

    return (
        <>
            <Head title="Verificar Email - MDR Construcciones" />
            
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
                                border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                                textAlign: 'center'
                            }}
                        >
                            {/* Header */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            >
                                <Box
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: '50%',
                                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 3,
                                        position: 'relative',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: '50%',
                                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                            filter: 'blur(20px)',
                                            opacity: 0.3,
                                            zIndex: -1
                                        }
                                    }}
                                >
                                    <EmailIcon sx={{ fontSize: 60, color: 'white' }} />
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
                                    mb: 2
                                }}
                            >
                                Verifica tu email
                            </Typography>
                            
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                                ¡Ya casi estás listo! Hemos enviado un enlace de verificación a tu correo electrónico. 
                                Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
                            </Typography>

                            {/* Status Alert */}
                            {status === 'verification-link-sent' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Alert 
                                        severity="success" 
                                        icon={<CheckIcon />}
                                        sx={{ 
                                            mb: 4, 
                                            borderRadius: 3,
                                            '& .MuiAlert-icon': {
                                                color: theme.palette.success.main
                                            }
                                        }}
                                    >
                                        ¡Perfecto! Se ha enviado un nuevo enlace de verificación a tu correo electrónico.
                                    </Alert>
                                </motion.div>
                            )}

                            {/* Verification Instructions */}
                            <Box
                                sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                    mb: 4
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.info.main, fontWeight: 600 }}>
                                    ¿No has recibido el email?
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    • Revisa tu carpeta de spam o correo no deseado<br />
                                    • Asegúrate de que la dirección de email sea correcta<br />
                                    • El enlace puede tardar unos minutos en llegar
                                </Typography>
                            </Box>

                            {/* Resend Button */}
                            <form onSubmit={submit}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={processing || loading}
                                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                        sx={{
                                            py: 1.5,
                                            px: 4,
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
                                            transition: 'all 0.3s ease',
                                            mb: 4
                                        }}
                                    >
                                        {loading ? 'Enviando...' : 'Reenviar email de verificación'}
                                    </Button>
                                </motion.div>
                            </form>

                            {/* Action Buttons */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    component={Link}
                                    href={route('profile.edit')}
                                    sx={{
                                        borderRadius: 3,
                                        borderColor: alpha(theme.palette.primary.main, 0.3),
                                        color: theme.palette.primary.main,
                                        '&:hover': {
                                            borderColor: theme.palette.primary.main,
                                            backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                        }
                                    }}
                                >
                                    Editar perfil
                                </Button>
                                
                                <form method="POST" action={route('logout')}>
                                    <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')} />
                                    <Button
                                        type="submit"
                                        variant="text"
                                        sx={{
                                            color: theme.palette.text.secondary,
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                                                color: theme.palette.error.main
                                            }
                                        }}
                                    >
                                        Cerrar sesión
                                    </Button>
                                </form>
                            </Box>

                            {/* Back to Home */}
                            <Box sx={{ textAlign: 'center', mt: 4 }}>
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

export default VerifyEmailMUI;