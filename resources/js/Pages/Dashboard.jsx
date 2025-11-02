import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Snackbar, Alert, Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';

export default function Dashboard() {
    // ✅ State for 2FA recovery codes warning
    const [showRecoveryWarning, setShowRecoveryWarning] = useState(false);
    const [remainingRecoveryCodes, setRemainingRecoveryCodes] = useState(0);

    // ✅ Check for 2FA recovery codes warning from sessionStorage
    useEffect(() => {
        const warningData = sessionStorage.getItem('2fa_low_recovery_codes_warning');
        if (warningData) {
            const remaining = parseInt(warningData, 10);
            setRemainingRecoveryCodes(remaining);
            setShowRecoveryWarning(true);
            // Clear from sessionStorage after reading
            sessionStorage.removeItem('2fa_low_recovery_codes_warning');
        }
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            You're logged in!
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ 2FA Recovery Codes Warning Snackbar */}
            <Snackbar
                open={showRecoveryWarning}
                autoHideDuration={10000}
                onClose={() => setShowRecoveryWarning(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setShowRecoveryWarning(false)}
                    severity="warning"
                    variant="filled"
                    sx={{
                        width: '100%',
                        fontSize: '1rem',
                        '& .MuiAlert-message': {
                            width: '100%'
                        }
                    }}
                >
                    <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            ⚠️ ADVERTENCIA DE SEGURIDAD
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Solo te quedan <strong>{remainingRecoveryCodes}</strong> código(s) de recuperación de 2FA.
                        </Typography>
                        <Typography variant="body2">
                            Te recomendamos regenerar tus códigos de recuperación inmediatamente desde tu{' '}
                            <Box
                                component="span"
                                sx={{
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                                onClick={() => {
                                    setShowRecoveryWarning(false);
                                    router.visit('/profile/settings?tab=security');
                                }}
                            >
                                perfil en la sección de Seguridad
                            </Box>
                            .
                        </Typography>
                    </Box>
                </Alert>
            </Snackbar>
        </AuthenticatedLayout>
    );
}
