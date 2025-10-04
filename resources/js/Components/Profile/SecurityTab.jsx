import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import {
    Box,
    Grid,
    TextField,
    Button,
    Typography,
    Alert,
    Paper,
    Divider,
    CircularProgress,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Lock as LockIcon,
    Security as SecurityIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    Shield as ShieldIcon,
    Key as KeyIcon
} from '@mui/icons-material';
import TwoFactorModal from './TwoFactorModal';

const SecurityTab = ({ user, twoFactorEnabled, recoveryCodes: initialRecoveryCodes }) => {
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
    const [disableModalOpen, setDisableModalOpen] = useState(false);
    const [disablePassword, setDisablePassword] = useState('');
    const [disableError, setDisableError] = useState('');
    const [verifyPasswordModalOpen, setVerifyPasswordModalOpen] = useState(false);
    const [verifyPassword, setVerifyPassword] = useState('');
    const [verifyPasswordError, setVerifyPasswordError] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState(null);
    const [loadingRecoveryCodes, setLoadingRecoveryCodes] = useState(false);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setSuccessMessage('');

        router.put('/password', passwordData, {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMessage('Contraseña actualizada correctamente');
                setPasswordData({
                    current_password: '',
                    password: '',
                    password_confirmation: ''
                });
                setTimeout(() => setSuccessMessage(''), 3000);
            },
            onError: (errors) => {
                setErrors(errors);
            },
            onFinish: () => setLoading(false)
        });
    };

    const handleEnable2FA = () => {
        setTwoFactorModalOpen(true);
    };

    const handleDisable2FA = () => {
        setDisableModalOpen(true);
        setDisablePassword('');
        setDisableError('');
    };

    const confirmDisable2FA = () => {
        if (!disablePassword) {
            setDisableError('Por favor ingresa tu contraseña');
            return;
        }

        setLoading(true);
        router.delete(route('two-factor.disable'), {
            data: { password: disablePassword },
            preserveScroll: true,
            onSuccess: () => {
                setDisableModalOpen(false);
                setDisablePassword('');
                setSuccessMessage('Autenticación de dos factores desactivada');
                setTimeout(() => setSuccessMessage(''), 3000);
                setLoading(false);
            },
            onError: (errors) => {
                setDisableError(errors.password || 'Contraseña incorrecta');
                setLoading(false);
            }
        });
    };

    const handleShowRecoveryCodes = () => {
        // Open password verification modal first
        setVerifyPasswordModalOpen(true);
        setVerifyPassword('');
        setVerifyPasswordError('');
    };

    const confirmShowRecoveryCodes = async () => {
        if (!verifyPassword) {
            setVerifyPasswordError('Por favor ingresa tu contraseña');
            return;
        }

        setLoadingRecoveryCodes(true);
        setVerifyPasswordError('');

        try {
            const response = await axios.post(route('two-factor.recovery-codes'), {
                password: verifyPassword
            });

            setRecoveryCodes(response.data.recoveryCodes);
            setVerifyPasswordModalOpen(false);
            setShowRecoveryCodes(true);
            setVerifyPassword('');
        } catch (error) {
            if (error.response?.status === 422) {
                setVerifyPasswordError(error.response.data.error || 'Contraseña incorrecta');
            } else {
                setVerifyPasswordError('Error al obtener los códigos de recuperación');
            }
        } finally {
            setLoadingRecoveryCodes(false);
        }
    };

    const passwordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: 'default' };
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        if (strength <= 2) return { strength, label: 'Débil', color: 'error' };
        if (strength <= 3) return { strength, label: 'Media', color: 'warning' };
        return { strength, label: 'Fuerte', color: 'success' };
    };

    const strength = passwordStrength(passwordData.password);

    return (
        <Box>
            <Typography variant="h5" gutterBottom fontWeight="600">
                Seguridad
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Gestiona tu contraseña y configuración de seguridad
            </Typography>

            {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
                    {successMessage}
                </Alert>
            )}

            {/* Change Password Section */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <LockIcon color="primary" />
                    <Box>
                        <Typography variant="h6" fontWeight="600">
                            Cambiar Contraseña
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Asegúrate de usar una contraseña segura y única
                        </Typography>
                    </Box>
                </Box>

                <form onSubmit={handlePasswordSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Contraseña Actual"
                                name="current_password"
                                type="password"
                                value={passwordData.current_password}
                                onChange={handlePasswordChange}
                                error={!!errors.current_password}
                                helperText={errors.current_password}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nueva Contraseña"
                                name="password"
                                type="password"
                                value={passwordData.password}
                                onChange={handlePasswordChange}
                                error={!!errors.password}
                                helperText={errors.password || 'Mínimo 8 caracteres'}
                                required
                            />
                            {passwordData.password && (
                                <Box sx={{ mt: 1 }}>
                                    <Chip
                                        label={`Seguridad: ${strength.label}`}
                                        color={strength.color}
                                        size="small"
                                    />
                                </Box>
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Confirmar Nueva Contraseña"
                                name="password_confirmation"
                                type="password"
                                value={passwordData.password_confirmation}
                                onChange={handlePasswordChange}
                                error={!!errors.password_confirmation}
                                helperText={errors.password_confirmation}
                                required
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                            disabled={loading}
                        >
                            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </Button>
                    </Box>
                </form>
            </Paper>

            {/* Two-Factor Authentication Section */}
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <ShieldIcon color="primary" />
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" fontWeight="600">
                                Autenticación de Dos Factores (2FA)
                            </Typography>
                            <Chip
                                label={twoFactorEnabled ? 'Activado' : 'Desactivado'}
                                color={twoFactorEnabled ? 'success' : 'default'}
                                size="small"
                                icon={twoFactorEnabled ? <CheckIcon /> : <CloseIcon />}
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Añade una capa extra de seguridad a tu cuenta
                        </Typography>
                    </Box>
                </Box>

                <List dense>
                    <ListItem>
                        <ListItemIcon>
                            <CheckIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Protección adicional contra accesos no autorizados"
                            primaryTypographyProps={{ variant: 'body2' }}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <CheckIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Códigos de verificación generados por tu dispositivo"
                            primaryTypographyProps={{ variant: 'body2' }}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <CheckIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Códigos de recuperación en caso de emergencia"
                            primaryTypographyProps={{ variant: 'body2' }}
                        />
                    </ListItem>
                </List>

                <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {!twoFactorEnabled ? (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SecurityIcon />}
                            onClick={handleEnable2FA}
                        >
                            Activar 2FA
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<CloseIcon />}
                                onClick={handleDisable2FA}
                            >
                                Desactivar 2FA
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<KeyIcon />}
                                onClick={handleShowRecoveryCodes}
                            >
                                Ver Códigos de Recuperación
                            </Button>
                        </>
                    )}
                </Box>
            </Paper>

            {/* Password Verification Modal for Recovery Codes */}
            <Dialog open={verifyPasswordModalOpen} onClose={() => setVerifyPasswordModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LockIcon color="primary" />
                        Verificar Contraseña
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Por seguridad, necesitamos verificar tu contraseña antes de mostrar los códigos de recuperación.
                    </Alert>
                    <TextField
                        fullWidth
                        type="password"
                        label="Contraseña"
                        value={verifyPassword}
                        onChange={(e) => {
                            setVerifyPassword(e.target.value);
                            setVerifyPasswordError('');
                        }}
                        error={!!verifyPasswordError}
                        helperText={verifyPasswordError}
                        autoFocus
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                confirmShowRecoveryCodes();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setVerifyPasswordModalOpen(false)} disabled={loadingRecoveryCodes}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={confirmShowRecoveryCodes}
                        variant="contained"
                        disabled={loadingRecoveryCodes}
                        startIcon={loadingRecoveryCodes ? <CircularProgress size={20} /> : <KeyIcon />}
                    >
                        {loadingRecoveryCodes ? 'Verificando...' : 'Ver Códigos'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Recovery Codes Dialog */}
            <Dialog open={showRecoveryCodes} onClose={() => setShowRecoveryCodes(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <KeyIcon />
                        Códigos de Recuperación
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Guarda estos códigos en un lugar seguro. Cada código solo puede usarse una vez.
                    </Alert>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.100', fontFamily: 'monospace' }}>
                        {recoveryCodes && recoveryCodes.length > 0 ? (
                            recoveryCodes.map((code, index) => (
                                <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                                    {code}
                                </Typography>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                No hay códigos de recuperación disponibles
                            </Typography>
                        )}
                    </Paper>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setShowRecoveryCodes(false);
                        setRecoveryCodes(null); // Clear codes when closing
                    }}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Two-Factor Modal */}
            <TwoFactorModal
                open={twoFactorModalOpen}
                onClose={() => setTwoFactorModalOpen(false)}
                twoFactorEnabled={twoFactorEnabled}
            />

            {/* Disable 2FA Modal */}
            <Dialog open={disableModalOpen} onClose={() => setDisableModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CloseIcon color="error" />
                        Desactivar Autenticación de Dos Factores
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Desactivar 2FA reducirá la seguridad de tu cuenta. Por favor confirma tu contraseña para continuar.
                    </Alert>
                    <TextField
                        fullWidth
                        type="password"
                        label="Contraseña"
                        value={disablePassword}
                        onChange={(e) => {
                            setDisablePassword(e.target.value);
                            setDisableError('');
                        }}
                        error={!!disableError}
                        helperText={disableError}
                        autoFocus
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                confirmDisable2FA();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDisableModalOpen(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={confirmDisable2FA}
                        color="error"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? 'Desactivando...' : 'Desactivar 2FA'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SecurityTab;

