import React from 'react';
import { Head } from '@inertiajs/react';
import { 
    Box, 
    Container, 
    Typography, 
    Card, 
    CardContent, 
    Button,
    Alert,
    Chip,
    Divider,
    Stack
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
    Block as BlockIcon,
    Schedule as ScheduleIcon,
    Info as InfoIcon,
    Home as HomeIcon
} from '@mui/icons-material';

export default function Banned({ ban_info = {} }) {
    const {
        is_banned = false,
        status = 'Unknown',
        reason = 'No reason provided',
        banned_at = null,
        expires_at = null,
        banned_by = 'System',
        remaining_time = null,
    } = ban_info;

    const isPermanent = !expires_at;
    const isExpired = expires_at && new Date(expires_at) < new Date();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <Head title="Cuenta Suspendida - MDR Construcciones" />
            
            <Box
                sx={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 2,
                }}
            >
                <Container maxWidth="md">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card
                            sx={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: 4,
                                boxShadow: '0 25px 45px rgba(0, 0, 0, 0.1)',
                                overflow: 'hidden',
                            }}
                        >
                            <CardContent sx={{ p: 6 }}>
                                {/* Header */}
                                <Box textAlign="center" mb={4}>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    >
                                        <BlockIcon 
                                            sx={{ 
                                                fontSize: 80, 
                                                color: '#ff6b6b',
                                                mb: 2,
                                                filter: 'drop-shadow(0 4px 8px rgba(255, 107, 107, 0.3))'
                                            }} 
                                        />
                                    </motion.div>
                                    
                                    <Typography 
                                        variant="h3" 
                                        component="h1" 
                                        gutterBottom
                                        sx={{
                                            color: 'white',
                                            fontWeight: 700,
                                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                            mb: 1
                                        }}
                                    >
                                        Cuenta Suspendida
                                    </Typography>
                                    
                                    <Typography 
                                        variant="h6" 
                                        sx={{
                                            color: 'rgba(255, 255, 255, 0.8)',
                                            fontWeight: 400,
                                        }}
                                    >
                                        Tu cuenta ha sido suspendida temporalmente
                                    </Typography>
                                </Box>

                                <Divider sx={{ mb: 4, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

                                {/* Ban Information */}
                                {is_banned && (
                                    <Stack spacing={3} mb={4}>
                                        {/* Status */}
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                                                Estado de la Suspensión
                                            </Typography>
                                            <Chip
                                                icon={<BlockIcon />}
                                                label={isPermanent ? 'Suspensión Permanente' : 'Suspensión Temporal'}
                                                color={isPermanent ? 'error' : 'warning'}
                                                sx={{
                                                    background: isPermanent 
                                                        ? 'rgba(244, 67, 54, 0.2)' 
                                                        : 'rgba(255, 152, 0, 0.2)',
                                                    backdropFilter: 'blur(10px)',
                                                    border: `1px solid ${isPermanent ? 'rgba(244, 67, 54, 0.3)' : 'rgba(255, 152, 0, 0.3)'}`,
                                                    color: 'white',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </Box>

                                        {/* Reason */}
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                                                Motivo de la Suspensión
                                            </Typography>
                                            <Alert 
                                                severity="error" 
                                                icon={<InfoIcon />}
                                                sx={{
                                                    background: 'rgba(244, 67, 54, 0.1)',
                                                    backdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(244, 67, 54, 0.2)',
                                                    color: 'white',
                                                    '& .MuiAlert-icon': {
                                                        color: '#ff6b6b'
                                                    }
                                                }}
                                            >
                                                {reason}
                                            </Alert>
                                        </Box>

                                        {/* Timing Information */}
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                                                Información Temporal
                                            </Typography>
                                            
                                            <Stack spacing={2}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                                        Suspendido el:
                                                    </Typography>
                                                    <Typography sx={{ color: 'white', fontWeight: 500 }}>
                                                        {formatDate(banned_at)}
                                                    </Typography>
                                                </Box>
                                                
                                                {!isPermanent && (
                                                    <>
                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                                                Expira el:
                                                            </Typography>
                                                            <Typography sx={{ color: 'white', fontWeight: 500 }}>
                                                                {formatDate(expires_at)}
                                                            </Typography>
                                                        </Box>
                                                        
                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                                                Tiempo restante:
                                                            </Typography>
                                                            <Chip
                                                                icon={<ScheduleIcon />}
                                                                label={remaining_time || 'Calculando...'}
                                                                color="info"
                                                                size="small"
                                                                sx={{
                                                                    background: 'rgba(33, 150, 243, 0.2)',
                                                                    backdropFilter: 'blur(10px)',
                                                                    border: '1px solid rgba(33, 150, 243, 0.3)',
                                                                    color: 'white',
                                                                }}
                                                            />
                                                        </Box>
                                                    </>
                                                )}
                                                
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                                        Suspendido por:
                                                    </Typography>
                                                    <Typography sx={{ color: 'white', fontWeight: 500 }}>
                                                        {banned_by}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                )}

                                <Divider sx={{ mb: 4, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

                                {/* Actions */}
                                <Box textAlign="center">
                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            color: 'rgba(255, 255, 255, 0.8)', 
                                            mb: 3,
                                            lineHeight: 1.6
                                        }}
                                    >
                                        Si crees que esta suspensión es un error o deseas apelar esta decisión, 
                                        por favor contacta con nuestro equipo de soporte.
                                    </Typography>
                                    
                                    <Button
                                        variant="contained"
                                        startIcon={<HomeIcon />}
                                        href="/"
                                        sx={{
                                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                                            border: 0,
                                            borderRadius: 3,
                                            boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
                                            color: 'white',
                                            height: 48,
                                            padding: '0 30px',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                                                boxShadow: '0 12px 20px rgba(102, 126, 234, 0.4)',
                                                transform: 'translateY(-2px)',
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        Volver al Inicio
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Container>
            </Box>
        </>
    );
}
