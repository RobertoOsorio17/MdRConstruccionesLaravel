import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stepper,
    Step,
    StepLabel,
    Box,
    Typography,
    TextField,
    Alert,
    Paper,
    Grid,
    Chip,
    IconButton,
    CircularProgress,
} from '@mui/material';
import {
    Close as CloseIcon,
    ContentCopy as ContentCopyIcon,
    CheckCircle as CheckCircleIcon,
    QrCode2 as QrCodeIcon,
    Key as KeyIcon,
    Security as SecurityIcon,
} from '@mui/icons-material';

const steps = ['Escanear QR', 'Guardar Códigos', 'Verificar'];

export default function TwoFactorModal({ open, onClose, twoFactorEnabled }) {
    const [activeStep, setActiveStep] = useState(0);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedSecret, setCopiedSecret] = useState(false);

    useEffect(() => {
        if (open && !twoFactorEnabled) {
            // Enable 2FA and get QR code
            setLoading(true);
            router.post('/user/two-factor-authentication', {}, {
                preserveScroll: true,
                onSuccess: (page) => {
                    // Fetch QR code and secret
                    fetch('/user/two-factor-qr-code')
                        .then(res => res.text())
                        .then(svg => {
                            setQrCode(svg);
                            setLoading(false);
                        });
                    
                    fetch('/user/two-factor-secret-key')
                        .then(res => res.json())
                        .then(data => {
                            setSecret(data.secretKey);
                        });
                    
                    fetch('/user/two-factor-recovery-codes')
                        .then(res => res.json())
                        .then(codes => {
                            setRecoveryCodes(codes);
                        });
                },
                onError: () => {
                    setLoading(false);
                    setError('Error al activar 2FA');
                }
            });
        }
    }, [open, twoFactorEnabled]);

    const handleNext = () => {
        if (activeStep === 2) {
            // Verify code
            if (!verificationCode || verificationCode.length !== 6) {
                setError('Por favor ingresa un código de 6 dígitos');
                return;
            }

            setLoading(true);
            router.post('/user/confirmed-two-factor-authentication', {
                code: verificationCode
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setLoading(false);
                    handleClose();
                },
                onError: (errors) => {
                    setLoading(false);
                    setError(errors.code || 'Código inválido');
                }
            });
        } else {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            setError('');
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
        setError('');
    };

    const handleClose = () => {
        setActiveStep(0);
        setQrCode('');
        setSecret('');
        setRecoveryCodes([]);
        setVerificationCode('');
        setError('');
        setCopiedCode(false);
        setCopiedSecret(false);
        onClose();
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        if (type === 'codes') {
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        } else {
            setCopiedSecret(true);
            setTimeout(() => setCopiedSecret(false), 2000);
        }
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <QrCodeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Escanea el Código QR
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Usa una aplicación de autenticación como Google Authenticator o Authy
                        </Typography>
                        
                        {loading ? (
                            <CircularProgress />
                        ) : qrCode ? (
                            <Paper elevation={0} sx={{ p: 3, display: 'inline-block', border: '1px solid', borderColor: 'divider' }}>
                                <div dangerouslySetInnerHTML={{ __html: qrCode }} />
                            </Paper>
                        ) : null}

                        {secret && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    O ingresa este código manualmente:
                                </Typography>
                                <Paper elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, border: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="body1" fontFamily="monospace" fontWeight="600">
                                        {secret}
                                    </Typography>
                                    <IconButton size="small" onClick={() => copyToClipboard(secret, 'secret')}>
                                        {copiedSecret ? <CheckCircleIcon color="success" /> : <ContentCopyIcon />}
                                    </IconButton>
                                </Paper>
                            </Box>
                        )}
                    </Box>
                );

            case 1:
                return (
                    <Box sx={{ py: 3 }}>
                        <KeyIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2, display: 'block', mx: 'auto' }} />
                        <Typography variant="h6" gutterBottom textAlign="center">
                            Guarda tus Códigos de Recuperación
                        </Typography>
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            Guarda estos códigos en un lugar seguro. Los necesitarás si pierdes acceso a tu dispositivo de autenticación.
                        </Alert>
                        
                        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                            <Grid container spacing={2}>
                                {recoveryCodes.map((code, index) => (
                                    <Grid item xs={6} key={index}>
                                        <Chip 
                                            label={code} 
                                            sx={{ width: '100%', fontFamily: 'monospace', fontSize: '0.9rem' }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={copiedCode ? <CheckCircleIcon /> : <ContentCopyIcon />}
                                onClick={() => copyToClipboard(recoveryCodes.join('\n'), 'codes')}
                                sx={{ mt: 2 }}
                            >
                                {copiedCode ? 'Copiado' : 'Copiar Todos'}
                            </Button>
                        </Paper>
                    </Box>
                );

            case 2:
                return (
                    <Box sx={{ py: 3, textAlign: 'center' }}>
                        <SecurityIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Verifica tu Configuración
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Ingresa el código de 6 dígitos de tu aplicación de autenticación
                        </Typography>
                        
                        <TextField
                            fullWidth
                            label="Código de Verificación"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            inputProps={{ 
                                maxLength: 6,
                                style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', fontFamily: 'monospace' }
                            }}
                            error={!!error}
                            helperText={error}
                        />
                    </Box>
                );

            default:
                return 'Unknown step';
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="600">
                        Configurar Autenticación de Dos Factores
                    </Typography>
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            
            <DialogContent>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {getStepContent(activeStep)}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    disabled={activeStep === 0 || loading}
                    onClick={handleBack}
                >
                    Atrás
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={loading || (activeStep === 0 && !qrCode)}
                >
                    {loading ? <CircularProgress size={24} /> : activeStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

