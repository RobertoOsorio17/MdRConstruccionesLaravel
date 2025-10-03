import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    Tabs,
    Tab,
    CircularProgress,
} from '@mui/material';
import { Security, Key, VpnKey } from '@mui/icons-material';

export default function TwoFactorChallenge() {
    const [tabValue, setTabValue] = useState(0);
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        recovery_code: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (tabValue === 0) {
            post(route('two-factor.login'), {
                preserveScroll: true,
            });
        } else {
            post(route('two-factor.login'), {
                preserveScroll: true,
            });
        }
    };

    return (
        <GuestLayout>
            <Head title="Two-Factor Authentication" />

            <Container maxWidth="sm" sx={{ py: 8 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                        <Security sx={{ fontSize: 50, color: 'primary.main', mr: 2 }} />
                        <Typography variant="h4" component="h1">
                            Two-Factor Authentication
                        </Typography>
                    </Box>

                    <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
                        Please confirm access to your account by entering the authentication code provided by your
                        authenticator application.
                    </Typography>

                    <Tabs
                        value={tabValue}
                        onChange={(e, newValue) => setTabValue(newValue)}
                        variant="fullWidth"
                        sx={{ mb: 3 }}
                    >
                        <Tab icon={<VpnKey />} label="Authentication Code" />
                        <Tab icon={<Key />} label="Recovery Code" />
                    </Tabs>

                    <form onSubmit={handleSubmit}>
                        {tabValue === 0 ? (
                            <Box>
                                <TextField
                                    label="Authentication Code"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    fullWidth
                                    autoFocus
                                    error={!!errors.code}
                                    helperText={errors.code || 'Enter the 6-digit code from your authenticator app'}
                                    inputProps={{
                                        maxLength: 6,
                                        pattern: '[0-9]*',
                                        inputMode: 'numeric',
                                    }}
                                    sx={{ mb: 3 }}
                                />
                            </Box>
                        ) : (
                            <Box>
                                <TextField
                                    label="Recovery Code"
                                    value={data.recovery_code}
                                    onChange={(e) => setData('recovery_code', e.target.value)}
                                    placeholder="XXXXX-XXXXX"
                                    fullWidth
                                    autoFocus
                                    error={!!errors.recovery_code}
                                    helperText={
                                        errors.recovery_code ||
                                        'Enter one of your recovery codes to access your account'
                                    }
                                    sx={{ mb: 3 }}
                                />
                            </Box>
                        )}

                        {(errors.code || errors.recovery_code) && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                The provided code was invalid. Please try again.
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={
                                processing ||
                                (tabValue === 0 && data.code.length !== 6) ||
                                (tabValue === 1 && !data.recovery_code)
                            }
                            startIcon={processing && <CircularProgress size={20} />}
                        >
                            {processing ? 'Verifying...' : 'Verify'}
                        </Button>
                    </form>

                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Lost your device?{' '}
                            <Button
                                size="small"
                                onClick={() => setTabValue(1)}
                                sx={{ textTransform: 'none' }}
                            >
                                Use a recovery code
                            </Button>
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </GuestLayout>
    );
}

