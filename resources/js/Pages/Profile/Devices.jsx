import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    TextField,
    Alert,
    Tooltip,
    Divider,
    Stack,
    Paper,
} from '@mui/material';
import {
    Devices as DevicesIcon,
    Computer as ComputerIcon,
    PhoneAndroid as PhoneIcon,
    Tablet as TabletIcon,
    Delete as DeleteIcon,
    Shield as ShieldIcon,
    ShieldOutlined as ShieldOutlinedIcon,
    LocationOn as LocationIcon,
    AccessTime as AccessTimeIcon,
    Security as SecurityIcon,
    DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Devices({ auth, devices, stats }) {
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
    const [customName, setCustomName] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const getDeviceIcon = (deviceType) => {
        switch (deviceType?.toLowerCase()) {
            case 'mobile':
                return <PhoneIcon />;
            case 'tablet':
                return <TabletIcon />;
            case 'desktop':
            default:
                return <ComputerIcon />;
        }
    };

    const handleTrustDevice = (deviceId, isTrusted) => {
        setProcessing(true);
        router.post(
            route('devices.trust', deviceId),
            { is_trusted: !isTrusted },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            }
        );
    };

    const handleDeleteDevice = () => {
        if (!selectedDevice) return;
        
        setProcessing(true);
        router.delete(route('devices.destroy', selectedDevice.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setSelectedDevice(null);
            },
            onFinish: () => setProcessing(false),
        });
    };

    const handleDeleteInactive = () => {
        setProcessing(true);
        router.delete(route('devices.destroy-inactive'), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteAllDialogOpen(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    const handleUpdateName = () => {
        if (!selectedDevice) return;
        
        setProcessing(true);
        router.patch(
            route('devices.update', selectedDevice.id),
            { custom_name: customName },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditDialogOpen(false);
                    setSelectedDevice(null);
                    setCustomName('');
                },
                onFinish: () => setProcessing(false),
            }
        );
    };

    const openEditDialog = (device) => {
        setSelectedDevice(device);
        setCustomName(device.custom_name || '');
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (device) => {
        setSelectedDevice(device);
        setDeleteDialogOpen(true);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mis Dispositivos" />

            <Box sx={{ py: 4 }}>
                <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
                    {/* Header */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                            <DevicesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Mis Dispositivos
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Gestiona los dispositivos desde los que has iniciado sesión
                        </Typography>
                    </Box>

                    {/* Stats Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: 'primary.light',
                                            color: 'primary.main',
                                        }}
                                    >
                                        <DevicesIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                            {stats.total}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Dispositivos
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: 'success.light',
                                            color: 'success.main',
                                        }}
                                    >
                                        <AccessTimeIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                            {stats.active}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Activos (30 días)
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: 'info.light',
                                            color: 'info.main',
                                        }}
                                    >
                                        <ShieldIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                            {stats.trusted}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Confiables
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Actions */}
                    {stats.inactive > 0 && (
                        <Alert
                            severity="info"
                            sx={{ mb: 3 }}
                            action={
                                <Button
                                    color="inherit"
                                    size="small"
                                    startIcon={<DeleteSweepIcon />}
                                    onClick={() => setDeleteAllDialogOpen(true)}
                                >
                                    Eliminar Inactivos
                                </Button>
                            }
                        >
                            Tienes {stats.inactive} dispositivo(s) inactivo(s) (más de 30 días sin uso)
                        </Alert>
                    )}

                    {/* Devices List */}
                    <Grid container spacing={3}>
                        {devices.length === 0 ? (
                            <Grid item xs={12}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 6,
                                        textAlign: 'center',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                    }}
                                >
                                    <SecurityIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" gutterBottom>
                                        No hay dispositivos registrados
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Los dispositivos se registrarán automáticamente cuando inicies sesión
                                    </Typography>
                                </Paper>
                            </Grid>
                        ) : (
                            devices.map((device) => (
                                <Grid item xs={12} key={device.id}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            border: '1px solid',
                                            borderColor: device.is_active ? 'success.light' : 'divider',
                                            borderRadius: 2,
                                            transition: 'all 0.3s',
                                            '&:hover': {
                                                boxShadow: 2,
                                                borderColor: 'primary.main',
                                            },
                                        }}
                                    >
                                        <CardContent>
                                            <Grid container spacing={2} alignItems="center">
                                                {/* Device Icon */}
                                                <Grid item>
                                                    <Box
                                                        sx={{
                                                            p: 2,
                                                            borderRadius: 2,
                                                            bgcolor: device.is_active ? 'success.light' : 'grey.200',
                                                            color: device.is_active ? 'success.main' : 'text.secondary',
                                                        }}
                                                    >
                                                        {getDeviceIcon(device.device_type)}
                                                    </Box>
                                                </Grid>

                                                {/* Device Info */}
                                                <Grid item xs>
                                                    <Stack spacing={1}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                                {device.display_name}
                                                            </Typography>
                                                            {device.is_trusted && (
                                                                <Chip
                                                                    icon={<ShieldIcon />}
                                                                    label="Confiable"
                                                                    size="small"
                                                                    color="success"
                                                                />
                                                            )}
                                                            {device.is_active && (
                                                                <Chip
                                                                    label="Activo"
                                                                    size="small"
                                                                    color="success"
                                                                    variant="outlined"
                                                                />
                                                            )}
                                                        </Box>

                                                        <Typography variant="body2" color="text.secondary">
                                                            {device.browser} en {device.platform}
                                                        </Typography>

                                                        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                                            <Tooltip title="Dirección IP">
                                                                <Chip
                                                                    icon={<LocationIcon />}
                                                                    label={device.ip_address}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            </Tooltip>
                                                            <Tooltip title="Último uso">
                                                                <Chip
                                                                    icon={<AccessTimeIcon />}
                                                                    label={formatDistanceToNow(new Date(device.last_used_at), {
                                                                        addSuffix: true,
                                                                        locale: es,
                                                                    })}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            </Tooltip>
                                                        </Stack>
                                                    </Stack>
                                                </Grid>

                                                {/* Actions */}
                                                <Grid item>
                                                    <Stack direction="row" spacing={1}>
                                                        <Tooltip title="Editar nombre">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => openEditDialog(device)}
                                                                disabled={processing}
                                                            >
                                                                <DevicesIcon />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip title={device.is_trusted ? 'Marcar como no confiable' : 'Marcar como confiable'}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleTrustDevice(device.id, device.is_trusted)}
                                                                disabled={processing}
                                                                color={device.is_trusted ? 'success' : 'default'}
                                                            >
                                                                {device.is_trusted ? <ShieldIcon /> : <ShieldOutlinedIcon />}
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip title="Eliminar dispositivo">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => openDeleteDialog(device)}
                                                                disabled={processing}
                                                                color="error"
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        )}
                    </Grid>
                </Box>
            </Box>

            {/* Edit Device Name Dialog */}
            <Dialog open={editDialogOpen} onClose={() => !processing && setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Editar Nombre del Dispositivo</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nombre personalizado"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        disabled={processing}
                        placeholder="Ej: Mi MacBook Pro, iPhone de trabajo"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button onClick={handleUpdateName} variant="contained" disabled={processing}>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Device Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => !processing && setDeleteDialogOpen(false)}>
                <DialogTitle>Eliminar Dispositivo</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que deseas eliminar este dispositivo? Tendrás que volver a iniciar sesión desde este dispositivo.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button onClick={handleDeleteDevice} color="error" variant="contained" disabled={processing}>
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Inactive Devices Dialog */}
            <Dialog open={deleteAllDialogOpen} onClose={() => !processing && setDeleteAllDialogOpen(false)}>
                <DialogTitle>Eliminar Dispositivos Inactivos</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que deseas eliminar todos los dispositivos inactivos (más de 30 días sin uso)?
                        Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteAllDialogOpen(false)} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button onClick={handleDeleteInactive} color="error" variant="contained" disabled={processing}>
                        Eliminar Todos
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}

