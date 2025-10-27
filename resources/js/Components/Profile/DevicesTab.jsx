import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
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
    Stack,
    Paper,
    Avatar,
    Tooltip,
    Alert,
    CircularProgress,
    Divider,
} from '@mui/material';
import {
    Computer as ComputerIcon,
    PhoneAndroid as PhoneIcon,
    Tablet as TabletIcon,
    Delete as DeleteIcon,
    Shield as ShieldIcon,
    ShieldOutlined as ShieldOutlinedIcon,
    LocationOn as LocationIcon,
    AccessTime as AccessTimeIcon,
    Edit as EditIcon,
    DeleteSweep as DeleteSweepIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Laptop as LaptopIcon,
} from '@mui/icons-material';

export default function DevicesTab({ initialDevices = [], initialStats = {} }) {
    const [devices, setDevices] = useState(initialDevices);
    const [stats, setStats] = useState(initialStats);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
    const [customName, setCustomName] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Load devices on mount
    useEffect(() => {
        loadDevices();
    }, []);

    const loadDevices = async () => {
        try {
            setLoading(true);
            const response = await axios.get(route('devices.index'));
            setDevices(response.data.devices);
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error loading devices:', error);
            setErrorMessage('Error al cargar los dispositivos');
        } finally {
            setLoading(false);
        }
    };

    const getDeviceIcon = (deviceType) => {
        switch (deviceType?.toLowerCase()) {
            case 'mobile':
                return <PhoneIcon sx={{ fontSize: 28 }} />;
            case 'tablet':
                return <TabletIcon sx={{ fontSize: 28 }} />;
            default:
                return <LaptopIcon sx={{ fontSize: 28 }} />;
        }
    };

    const getDeviceColor = (device) => {
        if (device.is_current) return 'primary.main';
        if (device.is_active) return 'success.main';
        return 'grey.400';
    };

    const handleTrustDevice = async (device) => {
        try {
            setProcessing(true);
            const response = await axios.post(route('devices.trust', device.session_id));
            setSuccessMessage(response.data.message);
            await loadDevices();
        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Error al marcar dispositivo como confiable');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteDevice = (device) => {
        setSelectedDevice(device);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedDevice) return;

        try {
            setProcessing(true);
            const response = await axios.delete(route('devices.destroy', selectedDevice.session_id));

            // Check if it was the current session
            if (response.data.is_current_session) {
                // Redirect to login
                window.location.href = response.data.redirect;
            } else {
                setSuccessMessage(response.data.message);
                setDeleteDialogOpen(false);
                setSelectedDevice(null);
                await loadDevices();
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Error al eliminar la sesión');
        } finally {
            setProcessing(false);
        }
    };

    const handleEditDevice = (device) => {
        setSelectedDevice(device);
        setCustomName(device.custom_name || device.display_name || '');
        setEditDialogOpen(true);
    };

    const confirmEdit = async () => {
        if (!selectedDevice) return;

        try {
            setProcessing(true);
            const response = await axios.patch(route('devices.update', selectedDevice.session_id), {
                custom_name: customName
            });
            setSuccessMessage(response.data.message);
            setEditDialogOpen(false);
            setSelectedDevice(null);
            setCustomName('');
            await loadDevices();
        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Error al actualizar el nombre');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteInactive = () => {
        setDeleteAllDialogOpen(true);
    };

    const confirmDeleteInactive = async () => {
        try {
            setProcessing(true);
            const response = await axios.delete(route('devices.destroy-inactive'));
            setSuccessMessage(response.data.message);
            setDeleteAllDialogOpen(false);
            await loadDevices();
        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Error al eliminar sesiones inactivas');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Success/Error Messages */}
            {successMessage && (
                <Alert
                    severity="success"
                    onClose={() => setSuccessMessage('')}
                    sx={{ mb: 3 }}
                    icon={<CheckCircleIcon />}
                >
                    {successMessage}
                </Alert>
            )}
            {errorMessage && (
                <Alert
                    severity="error"
                    onClose={() => setErrorMessage('')}
                    sx={{ mb: 3 }}
                >
                    {errorMessage}
                </Alert>
            )}

            <Typography variant="h5" gutterBottom fontWeight="600">
                Dispositivos y Sesiones
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Gestiona los dispositivos y sesiones activas desde los que has iniciado sesión en tu cuenta
            </Typography>

            <Typography variant="overline" sx={{ color: 'text.secondary', mb: 1 }}>Resumen</Typography>

            {/* Stats Cards */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 3,
                mb: 4
            }}>
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h3" color="primary" fontWeight="700">
                        {stats.total || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Total Dispositivos
                    </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h3" color="success.main" fontWeight="700">
                        {stats.active || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Activos (30 días)
                    </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h3" color="info.main" fontWeight="700">
                        {stats.trusted || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Confiables
                    </Typography>
                </Paper>
            </Box>

            {/* Actions */}
            {devices.length > 0 && (
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteSweepIcon />}
                        onClick={handleDeleteInactive}
                        disabled={processing}
                    >
                        Eliminar Inactivos
                    </Button>
                </Box>
            )}

            {/* Devices List */}
            <Typography variant="overline" sx={{ color: 'text.secondary', mb: 1 }}>Sesiones activas</Typography>

            {devices.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
                    <ComputerIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        No hay dispositivos registrados
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Los dispositivos se registrarán automáticamente cuando inicies sesión
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {devices.map((device) => (
                        <Card
                            key={device.session_id}
                            elevation={device.is_current ? 3 : 0}
                            sx={{
                                border: '2px solid',
                                borderColor: device.is_current ? 'primary.main' : 'divider',
                                position: 'relative',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: 3,
                                    borderColor: device.is_current ? 'primary.dark' : 'primary.light',
                                }
                            }}
                        >
                            {device.is_current && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        px: 2,
                                        py: 0.5,
                                        borderBottomLeftRadius: 8,
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    SESIÓN ACTUAL
                                </Box>
                            )}
                            <CardContent sx={{ pt: device.is_current ? 4 : 2 }}>
                                <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: getDeviceColor(device),
                                            width: 64,
                                            height: 64,
                                            boxShadow: 2,
                                        }}
                                    >
                                        {getDeviceIcon(device.device_type)}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Typography variant="h6" fontWeight="700">
                                                {device.custom_name || device.display_name || `${device.browser} en ${device.platform}`}
                                            </Typography>
                                            {device.is_active && !device.is_current && (
                                                <Chip
                                                    label="Activo"
                                                    size="small"
                                                    color="success"
                                                    variant="outlined"
                                                />
                                            )}
                                            {device.is_trusted && (
                                                <Chip
                                                    icon={<ShieldIcon />}
                                                    label="Confiable"
                                                    size="small"
                                                    color="primary"
                                                />
                                            )}
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                            <strong>{device.browser}</strong> {device.browser_version} • <strong>{device.platform}</strong> {device.platform_version}
                                        </Typography>
                                        <Divider sx={{ my: 1.5 }} />
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <LocationIcon fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>IP:</strong> {device.ip_address}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <AccessTimeIcon fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>Última actividad:</strong> {device.last_used_at}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title="Editar nombre del dispositivo">
                                            <span>
                                                <IconButton
                                                    onClick={() => handleEditDevice(device)}
                                                    size="medium"
                                                    disabled={processing}
                                                    sx={{
                                                        bgcolor: 'action.hover',
                                                        '&:hover': { bgcolor: 'action.selected' }
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title={device.is_trusted ? "Remover de confiables" : "Marcar como confiable (omitir 2FA)"}>
                                            <span>
                                                <IconButton
                                                    onClick={() => handleTrustDevice(device)}
                                                    size="medium"
                                                    color={device.is_trusted ? "primary" : "default"}
                                                    disabled={processing}
                                                    sx={{
                                                        bgcolor: device.is_trusted ? 'primary.light' : 'action.hover',
                                                        '&:hover': { bgcolor: device.is_trusted ? 'primary.main' : 'action.selected' }
                                                    }}
                                                >
                                                    {device.is_trusted ? <ShieldIcon /> : <ShieldOutlinedIcon />}
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title={device.is_current ? "Cerrar sesión actual" : "Eliminar sesión"}>
                                            <span>
                                                <IconButton
                                                    onClick={() => handleDeleteDevice(device)}
                                                    size="medium"
                                                    color="error"
                                                    disabled={processing}
                                                    sx={{
                                                        bgcolor: 'error.light',
                                                        '&:hover': { bgcolor: 'error.main', color: 'white' }
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}

            {/* Dialogs */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => !processing && setDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color={selectedDevice?.is_current ? "error" : "warning"} />
                    {selectedDevice?.is_current ? 'Cerrar Sesión Actual' : 'Eliminar Sesión'}
                </DialogTitle>
                <DialogContent>
                    {selectedDevice?.is_current ? (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight="600" gutterBottom>
                                ⚠️ Estás a punto de eliminar tu sesión actual
                            </Typography>
                            <Typography variant="body2">
                                Si continúas, se cerrará tu sesión inmediatamente y tendrás que volver a iniciar sesión.
                            </Typography>
                        </Alert>
                    ) : (
                        <DialogContentText>
                            ¿Estás seguro de que deseas eliminar esta sesión? El dispositivo será desconectado inmediatamente.
                        </DialogContentText>
                    )}
                    {selectedDevice && (
                        <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: 'action.hover' }}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Dispositivo:</strong> {selectedDevice.display_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>IP:</strong> {selectedDevice.ip_address}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Última actividad:</strong> {selectedDevice.last_used_at}
                            </Typography>
                        </Paper>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={processing}
                        variant="outlined"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        color="error"
                        variant="contained"
                        disabled={processing}
                        startIcon={processing ? <CircularProgress size={20} /> : <DeleteIcon />}
                    >
                        {processing ? 'Eliminando...' : (selectedDevice?.is_current ? 'Sí, cerrar sesión' : 'Eliminar')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteAllDialogOpen}
                onClose={() => !processing && setDeleteAllDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DeleteSweepIcon color="error" />
                    Eliminar Sesiones Inactivas
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Esta acción eliminará todas las sesiones excepto la actual.
                    </Alert>
                    <DialogContentText>
                        ¿Estás seguro de que deseas eliminar todas las sesiones inactivas?
                        Todos los dispositivos excepto el actual serán desconectados.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setDeleteAllDialogOpen(false)}
                        disabled={processing}
                        variant="outlined"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={confirmDeleteInactive}
                        color="error"
                        variant="contained"
                        disabled={processing}
                        startIcon={processing ? <CircularProgress size={20} /> : <DeleteSweepIcon />}
                    >
                        {processing ? 'Eliminando...' : 'Eliminar Todos'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={editDialogOpen}
                onClose={() => !processing && setEditDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EditIcon color="primary" />
                    Editar Nombre del Dispositivo
                </DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Personaliza el nombre de este dispositivo para identificarlo más fácilmente.
                    </Alert>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nombre personalizado"
                        placeholder="Ej: Mi Laptop del Trabajo, iPhone Personal, etc."
                        fullWidth
                        size="small"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        disabled={processing}
                        helperText="Deja vacío para usar el nombre por defecto"
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setEditDialogOpen(false)}
                        disabled={processing}
                        variant="outlined"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={confirmEdit}
                        variant="contained"
                        disabled={processing}
                        startIcon={processing ? <CircularProgress size={20} /> : <EditIcon />}
                    >
                        {processing ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

