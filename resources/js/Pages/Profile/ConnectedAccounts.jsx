import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Alert,
    Stack,
    Paper,
    Chip,
    Divider,
} from '@mui/material';
import {
    Google as GoogleIcon,
    Facebook as FacebookIcon,
    GitHub as GitHubIcon,
    Link as LinkIcon,
    LinkOff as LinkOffIcon,
    Security as SecurityIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ConnectedAccounts({ auth, connectedAccounts, hasPassword }) {
    const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [processing, setProcessing] = useState(false);

    const providers = [
        {
            name: 'google',
            label: 'Google',
            icon: <GoogleIcon />,
            color: '#DB4437',
            description: 'Inicia sesión con tu cuenta de Google',
        },
        {
            name: 'facebook',
            label: 'Facebook',
            icon: <FacebookIcon />,
            color: '#1877F2',
            description: 'Inicia sesión con tu cuenta de Facebook',
        },
        {
            name: 'github',
            label: 'GitHub',
            icon: <GitHubIcon />,
            color: '#333',
            description: 'Inicia sesión con tu cuenta de GitHub',
        },
    ];

    const isConnected = (providerName) => {
        return connectedAccounts?.some(account => account.provider === providerName);
    };

    const getAccountInfo = (providerName) => {
        return connectedAccounts?.find(account => account.provider === providerName);
    };

    const handleConnect = (providerName) => {
        setProcessing(true);
        window.location.href = route('social.redirect', providerName);
    };

    const handleUnlink = () => {
        if (!selectedProvider) return;

        setProcessing(true);
        router.delete(route('social.unlink', selectedProvider), {
            preserveScroll: true,
            onSuccess: () => {
                setUnlinkDialogOpen(false);
                setSelectedProvider(null);
            },
            onFinish: () => setProcessing(false),
        });
    };

    const openUnlinkDialog = (providerName) => {
        setSelectedProvider(providerName);
        setUnlinkDialogOpen(true);
    };

    const canUnlink = () => {
        // Solo puede desvincular si tiene contraseña o tiene más de una cuenta conectada
        return hasPassword || connectedAccounts?.length > 1;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Cuentas Conectadas" />

            <Box sx={{ py: 4 }}>
                <Box sx={{ maxWidth: 900, mx: 'auto', px: 3 }}>
                    {/* Header */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                            <LinkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Cuentas Conectadas
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Gestiona las cuentas de redes sociales vinculadas a tu perfil
                        </Typography>
                    </Box>

                    {/* Security Warning */}
                    {!hasPassword && connectedAccounts?.length === 1 && (
                        <Alert severity="warning" sx={{ mb: 3 }} icon={<WarningIcon />}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                Configura una contraseña para mayor seguridad
                            </Typography>
                            <Typography variant="body2">
                                Actualmente solo tienes una cuenta OAuth conectada y no has configurado una contraseña.
                                Te recomendamos establecer una contraseña o conectar otra cuenta OAuth como respaldo.
                            </Typography>
                        </Alert>
                    )}

                    {/* Info Alert */}
                    <Alert severity="info" sx={{ mb: 3 }} icon={<SecurityIcon />}>
                        <Typography variant="body2">
                            Conectar cuentas de redes sociales te permite iniciar sesión más rápidamente.
                            Puedes desvincular cuentas en cualquier momento.
                        </Typography>
                    </Alert>

                    {/* Connected Accounts Stats */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 4,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                        }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={4}>
                                <Stack alignItems="center" spacing={1}>
                                    <Typography variant="h3" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                        {connectedAccounts?.length || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Cuentas Conectadas
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Stack alignItems="center" spacing={1}>
                                    <Typography variant="h3" sx={{ fontWeight: 600, color: 'success.main' }}>
                                        {providers.length - (connectedAccounts?.length || 0)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Disponibles
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Stack alignItems="center" spacing={1}>
                                    <CheckCircleIcon sx={{ fontSize: 48, color: hasPassword ? 'success.main' : 'grey.400' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {hasPassword ? 'Contraseña Configurada' : 'Sin Contraseña'}
                                    </Typography>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Providers List */}
                    <Grid container spacing={3}>
                        {providers.map((provider) => {
                            const connected = isConnected(provider.name);
                            const accountInfo = getAccountInfo(provider.name);

                            return (
                                <Grid item xs={12} key={provider.name}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            border: '2px solid',
                                            borderColor: connected ? 'success.light' : 'divider',
                                            borderRadius: 2,
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                boxShadow: 2,
                                                borderColor: connected ? 'success.main' : 'primary.main',
                                            },
                                        }}
                                    >
                                        <CardContent>
                                            <Grid container spacing={2} alignItems="center">
                                                {/* Provider Icon */}
                                                <Grid item>
                                                    <Box
                                                        sx={{
                                                            p: 2,
                                                            borderRadius: 2,
                                                            bgcolor: connected ? 'success.light' : 'grey.100',
                                                            color: connected ? provider.color : 'text.secondary',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        {React.cloneElement(provider.icon, { sx: { fontSize: 32 } })}
                                                    </Box>
                                                </Grid>

                                                {/* Provider Info */}
                                                <Grid item xs>
                                                    <Stack spacing={1}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                                {provider.label}
                                                            </Typography>
                                                            {connected && (
                                                                <Chip
                                                                    icon={<CheckCircleIcon />}
                                                                    label="Conectada"
                                                                    size="small"
                                                                    color="success"
                                                                />
                                                            )}
                                                        </Box>

                                                        <Typography variant="body2" color="text.secondary">
                                                            {provider.description}
                                                        </Typography>

                                                        {connected && accountInfo && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                Conectada el {format(new Date(accountInfo.created_at), 'PPP', { locale: es })}
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                </Grid>

                                                {/* Action Button */}
                                                <Grid item>
                                                    {connected ? (
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            startIcon={<LinkOffIcon />}
                                                            onClick={() => openUnlinkDialog(provider.name)}
                                                            disabled={processing || !canUnlink()}
                                                        >
                                                            Desvincular
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="contained"
                                                            startIcon={<LinkIcon />}
                                                            onClick={() => handleConnect(provider.name)}
                                                            disabled={processing}
                                                            sx={{
                                                                bgcolor: provider.color,
                                                                '&:hover': {
                                                                    bgcolor: provider.color,
                                                                    opacity: 0.9,
                                                                },
                                                            }}
                                                        >
                                                            Conectar
                                                        </Button>
                                                    )}
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Help Text */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mt: 4,
                            bgcolor: 'grey.50',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                            ℹ️ Información Importante
                        </Typography>
                        <Stack spacing={1} sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                • Puedes conectar múltiples cuentas de redes sociales para mayor flexibilidad
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                • Para desvincular una cuenta, debes tener al menos una contraseña configurada o otra cuenta conectada
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                • Las cuentas conectadas solo se usan para autenticación, no publicamos nada en tus redes sociales
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                • Si tienes problemas para conectar una cuenta, verifica que hayas autorizado la aplicación
                            </Typography>
                        </Stack>
                    </Paper>
                </Box>
            </Box>

            {/* Unlink Confirmation Dialog */}
            <Dialog open={unlinkDialogOpen} onClose={() => !processing && setUnlinkDialogOpen(false)}>
                <DialogTitle>Desvincular Cuenta</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que deseas desvincular esta cuenta? Ya no podrás iniciar sesión usando este proveedor.
                    </DialogContentText>
                    {!hasPassword && connectedAccounts?.length === 1 && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            No puedes desvincular esta cuenta porque es tu único método de inicio de sesión.
                            Configura una contraseña primero.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUnlinkDialogOpen(false)} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleUnlink}
                        color="error"
                        variant="contained"
                        disabled={processing || !canUnlink()}
                    >
                        Desvincular
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}

