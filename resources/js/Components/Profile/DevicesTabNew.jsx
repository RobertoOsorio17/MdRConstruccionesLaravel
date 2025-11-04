import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
    Chip,
    Alert,
    CircularProgress,
    Tooltip,
    Grid,
    Divider,
    Paper,
    Fade,
    Zoom,
    alpha,
    useTheme,
    LinearProgress,
    Badge,
} from '@mui/material';
import {
    Computer as ComputerIcon,
    Smartphone as SmartphoneIcon,
    Tablet as TabletIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Shield as ShieldIcon,
    ShieldOutlined as ShieldOutlinedIcon,
    DeleteSweep as DeleteSweepIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    LocationOn as LocationOnIcon,
    Security as SecurityIcon,
    Devices as DevicesIcon,
    Timer as TimerIcon,
    Laptop as LaptopIcon,
    PhoneAndroid as PhoneIcon,
    AccessTime as AccessTimeIcon,
    Info as InfoIcon,
} from '@mui/icons-material';

export default function DevicesTabNew({ initialDevices = [], initialStats = {} }) {
    const theme = useTheme();
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
        const iconProps = { sx: { fontSize: 40 } };
        switch (deviceType?.toLowerCase()) {
            case 'mobile':
                return <PhoneIcon {...iconProps} />;
            case 'tablet':
                return <TabletIcon {...iconProps} />;
            default:
                return <LaptopIcon {...iconProps} />;
        }
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

    const handleEditDevice = (device) => {
        setSelectedDevice(device);
        setCustomName(device.custom_name || '');
        setEditDialogOpen(true);
    };

    const handleSaveCustomName = async () => {
        try {
            setProcessing(true);
            const response = await axios.put(route('devices.update', selectedDevice.session_id), {
                custom_name: customName
            });
            setSuccessMessage(response.data.message);
            setEditDialogOpen(false);
            await loadDevices();
        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Error al actualizar el nombre');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteDevice = (device) => {
        setSelectedDevice(device);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            setProcessing(true);
            const response = await axios.delete(route('devices.destroy', selectedDevice.session_id));
            
            if (response.data.is_current_session) {
                window.location.href = response.data.redirect;
            } else {
                setSuccessMessage(response.data.message);
                setDeleteDialogOpen(false);
                await loadDevices();
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Error al eliminar la sesión');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteAllInactive = () => {
        setDeleteAllDialogOpen(true);
    };

    const confirmDeleteAll = async () => {
        try {
            setProcessing(true);
            const response = await axios.delete(route('devices.destroy-inactive'));
            setSuccessMessage(response.data.message);
            setDeleteAllDialogOpen(false);
            await loadDevices();
        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Error al eliminar sesiones');
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Desconocido';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'Desconocido';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays}d`;
        return formatDate(dateString);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    return (
        <Box>
            {/* Success/Error Messages */}
            {successMessage && (
                <Fade in>
                    <Alert 
                        severity="success" 
                        onClose={() => setSuccessMessage('')}
                        sx={{ mb: 3 }}
                        icon={<CheckCircleIcon />}
                    >
                        {successMessage}
                    </Alert>
                </Fade>
            )}
            {errorMessage && (
                <Fade in>
                    <Alert 
                        severity="error" 
                        onClose={() => setErrorMessage('')}
                        sx={{ mb: 3 }}
                    >
                        {errorMessage}
                    </Alert>
                </Fade>
            )}

            {/* Session Limit Warning */}
            {stats.exceeds_limit && stats.session_limit && (
                <Zoom in>
                    <Alert 
                        severity="warning" 
                        sx={{ 
                            mb: 3,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                        }} 
                        icon={<WarningIcon />}
                    >
                        <Typography variant="body2" fontWeight="600" gutterBottom>
                            Has excedido el límite de sesiones para tu rol
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Tu rol permite un máximo de <strong>{stats.session_limit}</strong> sesión(es) simultánea(s). 
                            Actualmente tienes <strong>{stats.total}</strong> sesión(es) activa(s). 
                            Las sesiones más antiguas se cerrarán automáticamente en tu próximo inicio de sesión.
                        </Typography>
                    </Alert>
                </Zoom>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                    {
                        title: 'Total Sesiones',
                        value: stats.total || 0,
                        icon: <DevicesIcon sx={{ fontSize: 40 }} />,
                        color: 'primary',
                        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    },
                    {
                        title: 'Sesión Actual',
                        value: stats.current || 0,
                        icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
                        color: 'success',
                        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    },
                    {
                        title: 'Dispositivos Confiables',
                        value: stats.trusted || 0,
                        icon: <ShieldIcon sx={{ fontSize: 40 }} />,
                        color: 'info',
                        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    },
                    {
                        title: 'Límite de Sesiones',
                        value: stats.session_limit || 'N/A',
                        icon: <SecurityIcon sx={{ fontSize: 40 }} />,
                        color: stats.exceeds_limit ? 'warning' : 'secondary',
                        gradient: stats.exceeds_limit
                            ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                            : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    },
                ].map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Zoom in style={{ transitionDelay: `${index * 100}ms` }}>
                            <Card
                                elevation={0}
                                sx={{
                                    background: stat.gradient,
                                    color: 'white',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: `0 12px 24px ${alpha(theme.palette[stat.color].main, 0.4)}`,
                                    },
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        width: '100%',
                                        height: '100%',
                                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)',
                                    }
                                }}
                            >
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                                                {stat.title}
                                            </Typography>
                                            <Typography variant="h3" fontWeight="bold">
                                                {stat.value}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ opacity: 0.3 }}>
                                            {stat.icon}
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Zoom>
                    </Grid>
                ))}
            </Grid>

            {/* Header with Actions */}
            <Box sx={{ mb: 3, mt: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Sesiones Activas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Gestiona tus dispositivos y sesiones activas
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteSweepIcon />}
                    onClick={handleDeleteAllInactive}
                    disabled={processing || devices.length <= 1}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                    }}
                >
                    Cerrar Todas las Sesiones
                </Button>
            </Box>

            {/* Devices Grid */}
            <Grid container spacing={3}>
                {devices.map((device, index) => (
                    <Grid item xs={12} md={6} lg={4} key={device.session_id}>
                        <Zoom in style={{ transitionDelay: `${index * 50}ms` }}>
                            <Card
                                elevation={device.is_current ? 8 : 0}
                                sx={{
                                    height: '100%',
                                    background: device.is_current
                                        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
                                        : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
                                    backdropFilter: 'blur(20px)',
                                    border: `2px solid ${device.is_current ? theme.palette.primary.main : alpha(theme.palette.divider, 0.1)}`,
                                    borderRadius: 3,
                                    position: 'relative',
                                    overflow: 'visible',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: device.is_current
                                            ? `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`
                                            : `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}`,
                                    },
                                }}
                            >
                                {/* Current Session Badge */}
                                {device.is_current && (
                                    <Chip
                                        label="SESIÓN ACTUAL"
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: -12,
                                            right: 16,
                                            bgcolor: theme.palette.primary.main,
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            px: 1,
                                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                                        }}
                                    />
                                )}

                                <CardContent sx={{ p: 3 }}>
                                    {/* Device Header */}
                                    <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                                                color: theme.palette.primary.main,
                                            }}
                                        >
                                            {getDeviceIcon(device.device_type)}
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="h6" fontWeight="bold" noWrap>
                                                {device.custom_name || device.device_name || 'Dispositivo sin nombre'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {device.browser} • {device.platform}
                                            </Typography>
                                            {device.is_trusted && (
                                                <Chip
                                                    icon={<ShieldIcon sx={{ fontSize: 16 }} />}
                                                    label="Confiable"
                                                    size="small"
                                                    color="success"
                                                    sx={{ mt: 1, fontWeight: 600 }}
                                                />
                                            )}
                                        </Box>
                                    </Stack>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Device Details */}
                                    <Stack spacing={1.5}>
                                        {/* IP Address */}
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    IP Actual
                                                </Typography>
                                                <Typography variant="body2" fontWeight="500" noWrap>
                                                    {device.ip_address}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        {/* Initial IP if different */}
                                        {device.initial_ip && device.initial_ip !== device.ip_address && (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <InfoIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="caption" color="warning.main" display="block">
                                                        IP Inicial (Diferente)
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="500" color="warning.main" noWrap>
                                                        {device.initial_ip}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        )}

                                        {/* Last Activity */}
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Última Actividad
                                                </Typography>
                                                <Tooltip title={formatDate(device.last_activity)}>
                                                    <Typography variant="body2" fontWeight="500" noWrap>
                                                        {formatRelativeTime(device.last_activity)}
                                                    </Typography>
                                                </Tooltip>
                                            </Box>
                                        </Stack>

                                        {/* Created At */}
                                        {device.created_at && (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <ScheduleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        Creada
                                                    </Typography>
                                                    <Tooltip title={device.created_at_full}>
                                                        <Typography variant="body2" fontWeight="500" noWrap>
                                                            {device.created_at}
                                                        </Typography>
                                                    </Tooltip>
                                                </Box>
                                            </Stack>
                                        )}
                                    </Stack>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Actions */}
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Tooltip title="Editar nombre del dispositivo">
                                            <IconButton
                                                onClick={() => handleEditDevice(device)}
                                                disabled={processing}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={device.is_trusted ? "Remover de confiables" : "Marcar como confiable (omitir 2FA)"}>
                                            <IconButton
                                                onClick={() => handleTrustDevice(device)}
                                                disabled={processing}
                                                size="small"
                                                sx={{
                                                    bgcolor: device.is_trusted
                                                        ? alpha(theme.palette.success.main, 0.1)
                                                        : alpha(theme.palette.grey[500], 0.1),
                                                    color: device.is_trusted ? 'success.main' : 'text.secondary',
                                                    '&:hover': {
                                                        bgcolor: device.is_trusted
                                                            ? alpha(theme.palette.success.main, 0.2)
                                                            : alpha(theme.palette.grey[500], 0.2),
                                                    },
                                                }}
                                            >
                                                {device.is_trusted ? <ShieldIcon fontSize="small" /> : <ShieldOutlinedIcon fontSize="small" />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={device.is_current ? "Cerrar sesión actual" : "Eliminar sesión"}>
                                            <IconButton
                                                onClick={() => handleDeleteDevice(device)}
                                                disabled={processing}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                                    color: 'error.main',
                                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) },
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Zoom>
                    </Grid>
                ))}
            </Grid>

            {/* Edit Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => !processing && setEditDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                        backdropFilter: 'blur(20px)',
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                                color: theme.palette.primary.main,
                            }}
                        >
                            <EditIcon />
                        </Box>
                        <Typography variant="h6" fontWeight="bold">
                            Editar Nombre del Dispositivo
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nombre personalizado"
                        type="text"
                        fullWidth
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        disabled={processing}
                        placeholder="Ej: Mi Laptop Personal"
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setEditDialogOpen(false)}
                        disabled={processing}
                        sx={{ borderRadius: 2 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSaveCustomName}
                        variant="contained"
                        disabled={processing}
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        {processing ? <CircularProgress size={24} /> : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => !processing && setDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                        backdropFilter: 'blur(20px)',
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.2)} 0%, ${alpha(theme.palette.error.main, 0.1)} 100%)`,
                                color: theme.palette.error.main,
                            }}
                        >
                            <DeleteIcon />
                        </Box>
                        <Typography variant="h6" fontWeight="bold">
                            {selectedDevice?.is_current ? 'Cerrar Sesión Actual' : 'Eliminar Sesión'}
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        {selectedDevice?.is_current
                            ? 'Estás a punto de cerrar tu sesión actual. Serás redirigido a la página de inicio de sesión.'
                            : '¿Estás seguro de que deseas eliminar esta sesión? Esta acción no se puede deshacer.'
                        }
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={processing}
                        sx={{ borderRadius: 2 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        variant="contained"
                        color="error"
                        disabled={processing}
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        {processing ? <CircularProgress size={24} /> : 'Eliminar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete All Dialog */}
            <Dialog
                open={deleteAllDialogOpen}
                onClose={() => !processing && setDeleteAllDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                        backdropFilter: 'blur(20px)',
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.2)} 0%, ${alpha(theme.palette.error.main, 0.1)} 100%)`,
                                color: theme.palette.error.main,
                            }}
                        >
                            <DeleteSweepIcon />
                        </Box>
                        <Typography variant="h6" fontWeight="bold">
                            Cerrar Todas las Sesiones
                        </Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="error" sx={{ mt: 2 }}>
                        ¿Estás seguro de que deseas cerrar todas las sesiones excepto la actual?
                        Esto cerrará la sesión en todos tus otros dispositivos.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setDeleteAllDialogOpen(false)}
                        disabled={processing}
                        sx={{ borderRadius: 2 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={confirmDeleteAll}
                        variant="contained"
                        color="error"
                        disabled={processing}
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        {processing ? <CircularProgress size={24} /> : 'Cerrar Todas'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

