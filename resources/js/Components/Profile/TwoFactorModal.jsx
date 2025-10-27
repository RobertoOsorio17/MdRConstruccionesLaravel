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
    Chip,
    IconButton,
    CircularProgress,
    Stack,
} from '@mui/material';
import {
    Close as CloseIcon,
    ContentCopy as ContentCopyIcon,
    CheckCircle as CheckCircleIcon,
    QrCode2 as QrCodeIcon,
    Key as KeyIcon,
    Security as SecurityIcon,
    Download as DownloadIcon,
    Logout as LogoutIcon,
} from '@mui/icons-material';

const steps = ['Comenzar', 'Escanear QR', 'Guardar Códigos', 'Verificar'];

export default function TwoFactorModal({ open, onClose, twoFactorEnabled, isMandatory = false }) {
    const [activeStep, setActiveStep] = useState(0);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedSecret, setCopiedSecret] = useState(false);
    const [success, setSuccess] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const enable2FA = () => {
        setLoading(true);
        setError('');
        router.post('/user/two-factor-authentication', {}, {
            preserveScroll: true,
            onSuccess: async (page) => {
                try {
                    // Fetch QR code
                    const qrResponse = await fetch('/user/two-factor-authentication/qr-code');
                    const qrData = await qrResponse.json();

                    // Check if 2FA was reset due to corruption
                    if (qrData.reset) {
                        setError(qrData.error || 'Tu configuración de 2FA fue reiniciada. Por favor, intenta nuevamente.');
                        setLoading(false);
                        setActiveStep(0); // Go back to step 0
                        return;
                    }

                    if (qrData.error) {
                        setError(qrData.error);
                        setLoading(false);
                        return;
                    }

                    if (qrData.svg) {
                        setQrCode(qrData.svg);
                    }

                    if (qrData.url) {
                        // Extract secret from URL
                        const urlParams = new URLSearchParams(qrData.url.split('?')[1]);
                        const secretParam = urlParams.get('secret');
                        if (secretParam) {
                            setSecret(secretParam);
                        }
                    }

                    // Fetch recovery codes using the initial endpoint (no password required during setup)
                    const codesResponse = await fetch('/user/two-factor-authentication/initial-recovery-codes');
                    const codesData = await codesResponse.json();

                    if (codesData.reset) {
                        setError(codesData.error || 'Tu configuración de 2FA fue reiniciada. Por favor, intenta nuevamente.');
                        setLoading(false);
                        setActiveStep(0);
                        return;
                    }

                    if (codesData.error) {
                        console.error('Error fetching recovery codes:', codesData.error);
                        // Continue anyway, codes can be viewed later
                    } else if (codesData.recoveryCodes) {
                        setRecoveryCodes(codesData.recoveryCodes);
                    }

                    setLoading(false);
                    setActiveStep(1); // Move to QR code step
                } catch (error) {
                    console.error('Error fetching 2FA data:', error);
                    setError('Error al cargar los datos de 2FA. Por favor, intenta nuevamente.');
                    setLoading(false);
                    setActiveStep(0); // Go back to step 0
                }
            },
            onError: () => {
                setLoading(false);
                setError('Error al activar 2FA');
            }
        });
    };

    const handleNext = () => {
        if (activeStep === 0) {
            // First step: Enable 2FA
            enable2FA();
        } else if (activeStep === 3) {
            // Last step: Verify code
            if (!verificationCode || verificationCode.length !== 6) {
                setError('Por favor ingresa un código de 6 dígitos');
                return;
            }

            setLoading(true);
            router.post('/user/two-factor-authentication/confirm', {
                code: verificationCode
            }, {
                preserveScroll: !isMandatory, // Allow redirect for mandatory setup
                onSuccess: (page) => {
                    setLoading(false);
                    setSuccess(true);

                    if (isMandatory) {
                        // Show success message briefly, then backend will redirect
                        // The redirect happens automatically via Inertia
                        setTimeout(() => {
                            // If redirect hasn't happened, force reload
                            window.location.reload();
                        }, 2000);
                    } else {
                        // For optional setup, close modal and reload
                        setTimeout(() => {
                            handleClose();
                            window.location.reload();
                        }, 1500);
                    }
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
        // Prevent closing if mandatory and not completed
        if (isMandatory && !twoFactorEnabled) {
            setError('Debes completar la configuración de 2FA para continuar. Es obligatorio para administradores.');
            return;
        }

        setActiveStep(0);
        setQrCode('');
        setSecret('');
        setRecoveryCodes([]);
        setVerificationCode('');
        setError('');
        setCopiedCode(false);
        setCopiedSecret(false);
        setSuccess(false);
        onClose();
    };

    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'codes') {
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
            } else {
                setCopiedSecret(true);
                setTimeout(() => setCopiedSecret(false), 2000);
            }
        } catch (err) {
            console.error('Error al copiar:', err);
            // Fallback para navegadores antiguos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                if (type === 'codes') {
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                } else {
                    setCopiedSecret(true);
                    setTimeout(() => setCopiedSecret(false), 2000);
                }
            } catch (err2) {
                console.error('Error en fallback:', err2);
            }
            document.body.removeChild(textArea);
        }
    };

    const handleLogout = () => {
        setLoggingOut(true);
        router.post('/logout', {}, {
            onFinish: () => {
                window.location.href = '/login';
            }
        });
    };

    const downloadRecoveryCodes = () => {
        const date = new Date().toLocaleDateString('es-ES');
        const time = new Date().toLocaleTimeString('es-ES');

        const content = `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        CÓDIGOS DE RECUPERACIÓN 2FA - MDR CONSTRUCCIONES    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

📅 Fecha de generación: ${date}
🕐 Hora: ${time}

⚠️  IMPORTANTE:
   • Guarda estos códigos en un lugar seguro
   • Cada código solo puede usarse una vez
   • Los necesitarás si pierdes acceso a tu dispositivo
   • No compartas estos códigos con nadie

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 TUS CÓDIGOS DE RECUPERACIÓN:

${recoveryCodes.map((code, index) => `   ${(index + 1).toString().padStart(2, '0')}. ${code}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 INSTRUCCIONES DE USO:

   1. Si pierdes acceso a tu aplicación de autenticación
   2. En la pantalla de login, selecciona "Usar código de recuperación"
   3. Ingresa uno de estos códigos
   4. El código se invalidará después de usarlo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔒 MDR Construcciones - Sistema de Seguridad
   © ${new Date().getFullYear()} Todos los derechos reservados
`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `MDR-2FA-Recovery-Codes-${Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <SecurityIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h5" gutterBottom fontWeight="600">
                            Protege tu Cuenta
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                            La autenticación de dos factores añade una capa extra de seguridad a tu cuenta.
                            Necesitarás tu contraseña y un código de tu teléfono para iniciar sesión.
                        </Typography>

                        <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                            <Typography variant="body2" fontWeight="600" gutterBottom>
                                Necesitarás:
                            </Typography>
                            <Typography variant="body2" component="div">
                                • Una aplicación de autenticación (Google Authenticator, Authy, etc.)
                                <br />
                                • Unos minutos para completar la configuración
                                <br />
                                • Un lugar seguro para guardar los códigos de recuperación
                            </Typography>
                        </Alert>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </Box>
                );

            case 1:
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
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    display: 'inline-block',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'white',
                                    '& svg': {
                                        width: '200px !important',
                                        height: '200px !important',
                                        display: 'block',
                                    }
                                }}
                            >
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

            case 2:
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
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 2
                            }}>
                                {recoveryCodes.map((code, index) => (
                                    <Chip
                                        key={index}
                                        label={code}
                                        sx={{
                                            width: '100%',
                                            fontFamily: 'monospace',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                        }}
                                    />
                                ))}
                            </Box>
                            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={copiedCode ? <CheckCircleIcon /> : <ContentCopyIcon />}
                                    onClick={() => copyToClipboard(recoveryCodes.join('\n'), 'codes')}
                                    color={copiedCode ? 'success' : 'primary'}
                                >
                                    {copiedCode ? '✓ Copiado' : 'Copiar Todos'}
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                    onClick={downloadRecoveryCodes}
                                    color="primary"
                                >
                                    Descargar TXT
                                </Button>
                            </Stack>
                        </Paper>
                    </Box>
                );

            case 3:
                return (
                    <Box sx={{ py: 3, textAlign: 'center' }}>
                        {success ? (
                            // Success state
                            <>
                                <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                                <Typography variant="h5" gutterBottom sx={{ color: 'success.main', fontWeight: 600 }}>
                                    ¡2FA Configurado Exitosamente!
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                    Tu cuenta ahora está protegida con autenticación de dos factores
                                </Typography>
                                {isMandatory && (
                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                        <CircularProgress size={16} />
                                        Redirigiendo al panel de administración...
                                    </Typography>
                                )}
                            </>
                        ) : (
                            // Verification form
                            <>
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
                                    disabled={loading}
                                />
                            </>
                        )}
                    </Box>
                );

            default:
                return 'Unknown step';
        }
    };

    return (
        <Dialog
            open={open}
            onClose={isMandatory ? undefined : handleClose} // Disable backdrop click if mandatory
            maxWidth="sm"
            fullWidth
            disableEscapeKeyDown={isMandatory} // Disable ESC key if mandatory
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h6" fontWeight="600">
                            Configurar Autenticación de Dos Factores
                        </Typography>
                        {isMandatory && (
                            <Chip
                                label="OBLIGATORIO"
                                color="error"
                                size="small"
                                sx={{ mt: 0.5 }}
                            />
                        )}
                    </Box>
                    {!isMandatory && (
                        <IconButton onClick={handleClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    )}
                </Box>
            </DialogTitle>

            <DialogContent>
                {isMandatory && (
                    <Alert
                        severity="warning"
                        sx={{ mb: 3 }}
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                startIcon={<LogoutIcon />}
                                onClick={handleLogout}
                                disabled={loggingOut}
                                sx={{
                                    whiteSpace: 'nowrap',
                                    minWidth: 'auto'
                                }}
                            >
                                {loggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
                            </Button>
                        }
                    >
                        <Typography variant="body2" fontWeight="600">
                            La autenticación de dos factores es obligatoria para administradores y editores.
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                            Debes completar esta configuración para poder acceder al sistema.
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, fontSize: '0.875rem', opacity: 0.9 }}>
                            Si no puedes configurarlo ahora, puedes cerrar sesión y volver más tarde.
                        </Typography>
                    </Alert>
                )}

                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {getStepContent(activeStep)}
            </DialogContent>

            {!success && (
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
                        disabled={loading || (activeStep === 1 && !qrCode)}
                    >
                        {loading ? <CircularProgress size={24} /> : activeStep === 0 ? 'Comenzar' : activeStep === steps.length - 1 ? 'Verificar' : 'Siguiente'}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
}

