import React from 'react';
import { Head } from '@inertiajs/react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Alert,
    Chip,
    Stack,
    Divider,
    alpha,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    HourglassEmpty as HourglassIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Status({ appeal, ban }) {
    const getStatusConfig = () => {
        switch (appeal.status) {
            case 'approved':
                return {
                    icon: <CheckCircleIcon sx={{ fontSize: 64 }} />,
                    color: 'success',
                    title: '¡Apelación Aprobada!',
                    message: 'Tu apelación ha sido aprobada. Tu cuenta ha sido desbaneada.',
                };
            case 'rejected':
                return {
                    icon: <CancelIcon sx={{ fontSize: 64 }} />,
                    color: 'error',
                    title: 'Apelación Rechazada',
                    message: 'Tu apelación ha sido revisada y rechazada. El baneo se mantiene activo.',
                };
            case 'more_info_requested':
                return {
                    icon: <InfoIcon sx={{ fontSize: 64 }} />,
                    color: 'warning',
                    title: 'Información Adicional Requerida',
                    message: 'El administrador ha solicitado más información sobre tu apelación.',
                };
            default:
                return {
                    icon: <HourglassIcon sx={{ fontSize: 64 }} />,
                    color: 'info',
                    title: 'Apelación en Revisión',
                    message: 'Tu apelación está siendo revisada por nuestro equipo. Recibirás una notificación por email cuando sea procesada.',
                };
        }
    };

    const statusConfig = getStatusConfig();

    return (
        <GuestLayout>
            <Head title="Estado de Apelación" />

            <Container maxWidth="md" sx={{ py: 8 }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        borderRadius: 2,
                        background: (theme) => alpha(theme.palette.background.paper, 0.95),
                    }}
                >
                    {/* Status Header */}
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Box sx={{ color: `${statusConfig.color}.main`, mb: 2 }}>
                            {statusConfig.icon}
                        </Box>
                        <Typography variant="h4" gutterBottom fontWeight="bold">
                            {statusConfig.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {statusConfig.message}
                        </Typography>
                        <Chip
                            label={appeal.status_label}
                            color={statusConfig.color}
                            sx={{ mt: 2 }}
                        />
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Appeal Details */}
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Razón de la Apelación
                            </Typography>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                                }}
                            >
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {appeal.reason}
                                </Typography>
                            </Paper>
                        </Box>

                        {appeal.evidence_url && (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Evidencia Adjunta
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Box
                                        component="img"
                                        src={appeal.evidence_url}
                                        alt="Evidence"
                                        sx={{
                                            width: '100%',
                                            maxHeight: 400,
                                            objectFit: 'contain',
                                            borderRadius: 1,
                                        }}
                                    />
                                </Paper>
                            </Box>
                        )}

                        {appeal.admin_response && (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Respuesta del Administrador
                                </Typography>
                                <Alert severity={statusConfig.color} icon={<InfoIcon />}>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {appeal.admin_response}
                                    </Typography>
                                </Alert>
                            </Box>
                        )}

                        <Divider />

                        {/* Timeline */}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Cronología
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Apelación enviada</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {appeal.created_at}
                                    </Typography>
                                </Box>
                                {appeal.reviewed_at && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Revisada por {appeal.reviewed_by_name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {appeal.reviewed_at}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Box>

                        <Divider />

                        {/* Ban Information */}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Información del Baneo
                            </Typography>
                            <Stack spacing={1}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Razón del baneo</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {ban.reason}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Fecha del baneo</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {ban.banned_at}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Expira</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {ban.expires_at}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Estado del baneo</Typography>
                                    <Chip
                                        label={ban.is_active ? 'Activo' : 'Inactivo'}
                                        color={ban.is_active ? 'error' : 'success'}
                                        size="small"
                                    />
                                </Box>
                            </Stack>
                        </Box>

                        {/* Additional Info */}
                        {appeal.status === 'pending' && (
                            <Alert severity="info" icon={<InfoIcon />}>
                                <Typography variant="body2">
                                    <strong>Nota:</strong> El tiempo de revisión puede variar. Recibirás una notificación
                                    por email cuando tu apelación sea procesada. Por favor, revisa tu bandeja de entrada
                                    y carpeta de spam.
                                </Typography>
                            </Alert>
                        )}

                        {appeal.status === 'approved' && (
                            <Alert severity="success" icon={<CheckCircleIcon />}>
                                <Typography variant="body2">
                                    <strong>¡Bienvenido de vuelta!</strong> Tu cuenta ha sido desbaneada. Puedes acceder
                                    nuevamente a todas las funcionalidades del sitio. Por favor, asegúrate de seguir
                                    nuestras normas de comunidad.
                                </Typography>
                            </Alert>
                        )}

                        {appeal.status === 'rejected' && (
                            <Alert severity="warning" icon={<InfoIcon />}>
                                <Typography variant="body2">
                                    <strong>Importante:</strong> Esta decisión es final. Si crees que hay un error,
                                    puedes contactar al soporte técnico directamente.
                                </Typography>
                            </Alert>
                        )}
                    </Stack>
                </Paper>
            </Container>
        </GuestLayout>
    );
}

