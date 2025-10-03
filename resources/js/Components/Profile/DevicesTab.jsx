import React, { useState } from 'react';
import { router } from '@inertiajs/react';
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
} from '@mui/icons-material';

export default function DevicesTab({ devices = [], stats = {} }) {
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
            default:
                return <ComputerIcon />;
        }
    };

    const handleTrustDevice = (device) => {
        router.post(`/devices/${device.id}/trust`, {}, {
            preserveScroll: true,
        });
    };

    const handleDeleteDevice = (device) => {
        setSelectedDevice(device);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedDevice) return;
        
        setProcessing(true);
        router.delete(`/devices/${selectedDevice.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setDeleteDialogOpen(false);
                setSelectedDevice(null);
            }
        });
    };

    const handleEditDevice = (device) => {
        setSelectedDevice(device);
        setCustomName(device.custom_name || '');
        setEditDialogOpen(true);
    };

    const confirmEdit = () => {
        if (!selectedDevice) return;
        
        setProcessing(true);
        router.patch(`/devices/${selectedDevice.id}`, {
            custom_name: customName
        }, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setEditDialogOpen(false);
                setSelectedDevice(null);
                setCustomName('');
            }
        });
    };

    const handleDeleteInactive = () => {
        setDeleteAllDialogOpen(true);
    };

    const confirmDeleteInactive = () => {
        setProcessing(true);
        router.delete('/devices', {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setDeleteAllDialogOpen(false);
            }
        });
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom fontWeight="600">
                Dispositivos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Gestiona los dispositivos desde los que has iniciado sesión
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                        <Typography variant="h3" color="primary" fontWeight="700">
                            {stats.total || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total Dispositivos
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                        <Typography variant="h3" color="success.main" fontWeight="700">
                            {stats.active || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Activos (30 días)
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                        <Typography variant="h3" color="info.main" fontWeight="700">
                            {stats.trusted || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Confiables
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

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
            {devices.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
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
                        <Card key={device.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                            <CardContent>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item>
                                        <Avatar sx={{ bgcolor: device.is_active ? 'success.main' : 'grey.400', width: 56, height: 56 }}>
                                            {getDeviceIcon(device.device_type)}
                                        </Avatar>
                                    </Grid>
                                    <Grid item xs>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <Typography variant="h6" fontWeight="600">
                                                {device.custom_name || device.display_name || `${device.browser} en ${device.platform}`}
                                            </Typography>
                                            {device.is_active && (
                                                <Chip label="Activo" size="small" color="success" />
                                            )}
                                            {device.is_trusted && (
                                                <Chip icon={<ShieldIcon />} label="Confiable" size="small" color="primary" />
                                            )}
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {device.browser} {device.browser_version} • {device.platform} {device.platform_version}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <LocationIcon fontSize="small" color="action" />
                                                <Typography variant="caption" color="text.secondary">
                                                    {device.city || device.country || device.ip_address}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <AccessTimeIcon fontSize="small" color="action" />
                                                <Typography variant="caption" color="text.secondary">
                                                    {device.last_used_at}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item>
                                        <Stack direction="row" spacing={1}>
                                            <Tooltip title="Editar nombre">
                                                <IconButton onClick={() => handleEditDevice(device)} size="small">
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={device.is_trusted ? "Marcar como no confiable" : "Marcar como confiable"}>
                                                <IconButton onClick={() => handleTrustDevice(device)} size="small" color={device.is_trusted ? "primary" : "default"}>
                                                    {device.is_trusted ? <ShieldIcon /> : <ShieldOutlinedIcon />}
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar dispositivo">
                                                <IconButton onClick={() => handleDeleteDevice(device)} size="small" color="error">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}

            {/* Dialogs */}
            <Dialog open={deleteDialogOpen} onClose={() => !processing && setDeleteDialogOpen(false)}>
                <DialogTitle>Eliminar Dispositivo</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que deseas eliminar este dispositivo?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={processing}>Cancelar</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" disabled={processing}>Eliminar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteAllDialogOpen} onClose={() => !processing && setDeleteAllDialogOpen(false)}>
                <DialogTitle>Eliminar Dispositivos Inactivos</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que deseas eliminar todos los dispositivos inactivos?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteAllDialogOpen(false)} disabled={processing}>Cancelar</Button>
                    <Button onClick={confirmDeleteInactive} color="error" variant="contained" disabled={processing}>Eliminar Todos</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={editDialogOpen} onClose={() => !processing && setEditDialogOpen(false)}>
                <DialogTitle>Editar Nombre del Dispositivo</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nombre personalizado"
                        fullWidth
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        disabled={processing}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)} disabled={processing}>Cancelar</Button>
                    <Button onClick={confirmEdit} variant="contained" disabled={processing}>Guardar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

