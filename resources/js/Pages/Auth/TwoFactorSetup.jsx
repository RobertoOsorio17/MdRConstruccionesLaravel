import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    StepContent,
} from '@mui/material';
import { Security, QrCode2, Key, CheckCircle } from '@mui/icons-material';
import QRCodeDisplay from '@/Components/Auth/QRCodeDisplay';
import RecoveryCodesDisplay from '@/Components/Auth/RecoveryCodesDisplay';
import axios from 'axios';

export default function TwoFactorSetup({ auth, twoFactorEnabled, twoFactorConfirmed }) {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [recoveryCodes, setRecoveryCodes] = useState(null);
    const [confirmCode, setConfirmCode] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (twoFactorEnabled && !twoFactorConfirmed) {
            setActiveStep(1);
            fetchQRCode();
        } else if (twoFactorConfirmed) {
            setActiveStep(3);
        }
    }, [twoFactorEnabled, twoFactorConfirmed]);

    const fetchQRCode = async () => {
        try {
            const response = await axios.get(route('two-factor.qr-code'));
            setQrCode(response.data);
        } catch (err) {
            setError('Failed to load QR code');
        }
    };

    const fetchRecoveryCodes = async () => {
        try {
            const response = await axios.get(route('two-factor.recovery-codes'));
            setRecoveryCodes(response.data.recoveryCodes);
        } catch (err) {
            setError('Failed to load recovery codes');
        }
    };

    const handleEnable = async () => {
        setLoading(true);
        setError('');
        
        try {
            await router.post(route('two-factor.enable'), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    setActiveStep(1);
                    fetchQRCode();
                },
                onError: () => {
                    setError('Failed to enable two-factor authentication');
                },
                onFinish: () => setLoading(false),
            });
        } catch (err) {
            setError('An error occurred');
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        setError('');
        
        try {
            await router.post(route('two-factor.confirm'), { code: confirmCode }, {
                preserveScroll: true,
                onSuccess: () => {
                    setActiveStep(2);
                    fetchRecoveryCodes();
                },
                onError: (errors) => {
                    setError(errors.code || 'Invalid code');
                },
                onFinish: () => setLoading(false),
            });
        } catch (err) {
            setError('An error occurred');
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        if (!confirm('Are you sure you want to disable two-factor authentication?')) {
            return;
        }

        setLoading(true);
        
        try {
            await router.delete(route('two-factor.disable'), {
                preserveScroll: true,
                onSuccess: () => {
                    setActiveStep(0);
                    setQrCode(null);
                    setRecoveryCodes(null);
                    setConfirmCode('');
                },
                onFinish: () => setLoading(false),
            });
        } catch (err) {
            setError('Failed to disable two-factor authentication');
            setLoading(false);
        }
    };

    const handleRegenerateRecoveryCodes = async () => {
        setLoading(true);
        
        try {
            await router.post(route('two-factor.recovery-codes.regenerate'), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    fetchRecoveryCodes();
                },
                onFinish: () => setLoading(false),
            });
        } catch (err) {
            setError('Failed to regenerate recovery codes');
            setLoading(false);
        }
    };

    const steps = [
        {
            label: 'Enable Two-Factor Authentication',
            description: 'Add an extra layer of security to your account',
            icon: <Security />,
        },
        {
            label: 'Scan QR Code',
            description: 'Use your authenticator app to scan the QR code',
            icon: <QrCode2 />,
        },
        {
            label: 'Save Recovery Codes',
            description: 'Store these codes in a safe place',
            icon: <Key />,
        },
        {
            label: 'Setup Complete',
            description: 'Your account is now protected with 2FA',
            icon: <CheckCircle />,
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Two-Factor Authentication" />

            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Security sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                        <Typography variant="h4" component="h1">
                            Two-Factor Authentication
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    <Stepper activeStep={activeStep} orientation="vertical">
                        {steps.map((step, index) => (
                            <Step key={step.label}>
                                <StepLabel icon={step.icon}>
                                    {step.label}
                                </StepLabel>
                                <StepContent>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {step.description}
                                    </Typography>

                                    {index === 0 && (
                                        <Button
                                            variant="contained"
                                            onClick={handleEnable}
                                            disabled={loading}
                                            startIcon={loading && <CircularProgress size={20} />}
                                        >
                                            Enable Two-Factor Authentication
                                        </Button>
                                    )}

                                    {index === 1 && qrCode && (
                                        <QRCodeDisplay
                                            qrCode={qrCode}
                                            confirmCode={confirmCode}
                                            setConfirmCode={setConfirmCode}
                                            onConfirm={handleConfirm}
                                            loading={loading}
                                        />
                                    )}

                                    {index === 2 && recoveryCodes && (
                                        <RecoveryCodesDisplay
                                            recoveryCodes={recoveryCodes}
                                            onRegenerate={handleRegenerateRecoveryCodes}
                                            onComplete={() => setActiveStep(3)}
                                            loading={loading}
                                        />
                                    )}

                                    {index === 3 && (
                                        <Box>
                                            <Alert severity="success" sx={{ mb: 2 }}>
                                                Two-factor authentication is now enabled on your account!
                                            </Alert>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={handleDisable}
                                                disabled={loading}
                                            >
                                                Disable Two-Factor Authentication
                                            </Button>
                                        </Box>
                                    )}
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>
                </Paper>
            </Container>
        </AuthenticatedLayout>
    );
}

