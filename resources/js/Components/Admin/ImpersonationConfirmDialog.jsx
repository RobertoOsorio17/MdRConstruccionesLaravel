import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    Checkbox,
    FormControlLabel,
    Divider,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Snackbar,
} from '@mui/material';
import {
    Warning as WarningIcon,
    Timer as TimerIcon,
    Security as SecurityIcon,
    Visibility as VisibilityIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Error as ErrorIcon,
} from '@mui/icons-material';
import { router } from '@inertiajs/react';

/**
 * ImpersonationConfirmDialog
 * 
 * Diálogo de confirmación para iniciar una sesión de impersonación.
 * Muestra advertencias de seguridad y requiere confirmación explícita del administrador.
 */
const ImpersonationConfirmDialog = ({ open, onClose, user }) => {
    const [acknowledged, setAcknowledged] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);

    const handleConfirm = () => {
        if (!acknowledged) {
            return;
        }

        setLoading(true);
        router.post(route('admin.users.impersonate', user.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setLoading(false);
                onClose();
            },
            onError: (errors) => {
                setLoading(false);
                // Inertia error bag: extract first error message
                const message = typeof errors === 'object'
                    ? Object.values(errors).flat()[0]
                    : (errors.message || 'No tienes permiso para impersonar a este usuario.');
                setErrorMessage(message);
                setShowError(true);
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    const handleClose = () => {
        if (!loading) {
            setAcknowledged(false);
            setErrorMessage('');
            setShowError(false);
            onClose();
        }
    };

    const handleCloseError = () => {
        setShowError(false);
    };

    if (!user) return null;

    return (
        <>
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <VisibilityIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Confirmar Impersonación
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Acción de seguridad crítica
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                {/* User Info */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                        Usuario a impersonar:
                    </Typography>
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'action.hover',
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {user.name}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {user.email}
                            </Typography>
                        </Box>
                        {user.roles && user.roles.length > 0 && (
                            <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {user.roles.map((role, index) => {
                                    // Handle both string and object formats
                                    const roleName = typeof role === 'string' ? role : (role.display_name || role.name);
                                    const roleKey = typeof role === 'string' ? `${role}-${index}` : role.id;

                                    return (
                                        <Chip
                                            key={roleKey}
                                            label={roleName}
                                            size="small"
                                            sx={{
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                fontWeight: 500,
                                                fontSize: '0.75rem',
                                            }}
                                        />
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Security Warnings */}
                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Advertencias de Seguridad
                    </Typography>
                    <Typography variant="caption">
                        Esta acción te permitirá ver y usar la aplicación como si fueras este usuario.
                    </Typography>
                </Alert>

                <List dense sx={{ mb: 2 }}>
                    <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <TimerIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Duración: 30 minutos"
                            secondary="La sesión expirará automáticamente"
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <SecurityIcon sx={{ fontSize: 20, color: 'error.main' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Todas las acciones serán auditadas"
                            secondary="Se registrará en el log de auditoría del sistema"
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <WarningIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Responsabilidad total"
                            secondary="Eres responsable de todas las acciones realizadas"
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                        />
                    </ListItem>
                </List>

                {/* Acknowledgment Checkbox */}
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'action.hover',
                        border: '2px solid',
                        borderColor: acknowledged ? 'primary.main' : 'divider',
                        transition: 'all 0.3s ease',
                    }}
                >
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={acknowledged}
                                onChange={(e) => setAcknowledged(e.target.checked)}
                                disabled={loading}
                            />
                        }
                        label={
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Entiendo que esta acción será auditada y asumo la responsabilidad
                                de todas las acciones realizadas durante la impersonación
                            </Typography>
                        }
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleConfirm}
                    disabled={!acknowledged || loading}
                    variant="contained"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        background: acknowledged
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : undefined,
                        '&:hover': {
                            background: acknowledged
                                ? 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)'
                                : undefined,
                        },
                    }}
                >
                    {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                </Button>
            </DialogActions>
        </Dialog>

        {/* Error Snackbar */}
        <Snackbar
            open={showError}
            autoHideDuration={6000}
            onClose={handleCloseError}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert
                onClose={handleCloseError}
                severity="error"
                variant="filled"
                icon={<ErrorIcon />}
                sx={{
                    width: '100%',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
            >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {errorMessage}
                </Typography>
            </Alert>
        </Snackbar>
    </>
    );
};

export default ImpersonationConfirmDialog;

