import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    AlertTitle
} from '@mui/material';
import {
    Devices as DevicesIcon,
    TimerOff as TimerOffIcon,
    AdminPanelSettings as AdminIcon,
    Security as SecurityIcon,
    Warning as WarningIcon
} from '@mui/icons-material';

const SessionExpiredModal = ({ open, reason, onClose }) => {
    const messages = {
        'new_device_login': {
            title: 'Sesión Cerrada',
            message: 'Tu sesión fue cerrada porque iniciaste sesión en otro dispositivo o navegador.',
            detail: 'Por seguridad, solo puedes tener una sesión activa a la vez con tu rol actual.',
            icon: <DevicesIcon sx={{ fontSize: 48, color: 'warning.main' }} />,
            severity: 'warning'
        },
        'inactivity': {
            title: 'Sesión Expirada',
            message: 'Tu sesión expiró por inactividad.',
            detail: 'Por seguridad, las sesiones inactivas se cierran automáticamente después de 15 minutos.',
            icon: <TimerOffIcon sx={{ fontSize: 48, color: 'error.main' }} />,
            severity: 'error'
        },
        'forced_by_admin': {
            title: 'Sesión Cerrada por Administrador',
            message: 'Un administrador cerró tu sesión.',
            detail: 'Si crees que esto es un error, contacta con el equipo de soporte.',
            icon: <AdminIcon sx={{ fontSize: 48, color: 'error.main' }} />,
            severity: 'error'
        },
        'security_violation': {
            title: 'Sesión Cerrada por Seguridad',
            message: 'Tu sesión fue cerrada por razones de seguridad.',
            detail: 'Detectamos actividad sospechosa en tu cuenta. Por favor, verifica tu actividad reciente.',
            icon: <SecurityIcon sx={{ fontSize: 48, color: 'error.main' }} />,
            severity: 'error'
        },
        'session_limit_exceeded': {
            title: 'Límite de Sesiones Alcanzado',
            message: 'Se cerró una sesión anterior porque alcanzaste el límite de sesiones simultáneas.',
            detail: 'Tu rol permite un máximo de sesiones activas. La sesión más antigua fue cerrada.',
            icon: <WarningIcon sx={{ fontSize: 48, color: 'warning.main' }} />,
            severity: 'warning'
        }
    };

    const config = messages[reason] || messages['inactivity'];

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: 24
                }
            }}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={2}>
                    {config.icon}
                    <Typography variant="h5" component="div" fontWeight="bold">
                        {config.title}
                    </Typography>
                </Box>
            </DialogTitle>
            
            <DialogContent>
                <Alert severity={config.severity} sx={{ mb: 2 }}>
                    <AlertTitle>{config.message}</AlertTitle>
                    {config.detail}
                </Alert>

                <Typography variant="body2" color="text.secondary">
                    Por favor, inicia sesión nuevamente para continuar.
                </Typography>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button 
                    onClick={onClose} 
                    variant="contained" 
                    color="primary"
                    fullWidth
                    size="large"
                >
                    Entendido
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SessionExpiredModal;

