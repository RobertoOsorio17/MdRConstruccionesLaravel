import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Tooltip,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Paper,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    AccessTime as AccessTimeIcon,
    Computer as ComputerIcon,
} from '@mui/icons-material';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';

export default function ImpersonationSessions({ sessions: initialSessions }) {
    const [sessions, setSessions] = useState(initialSessions);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [loading, setLoading] = useState(false);

    const refreshSessions = async () => {
        setLoading(true);
        try {
            const response = await fetch(route('admin.impersonation.sessions.api'));
            const data = await response.json();
            if (data.success) {
                setSessions(data.sessions);
            }
        } catch (error) {
            console.error('Error refreshing sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTerminateClick = (session) => {
        setSelectedSession(session);
        setDeleteDialogOpen(true);
    };

    const handleTerminateConfirm = async () => {
        if (!selectedSession) return;

        setLoading(true);
        try {
            const response = await fetch(
                route('admin.impersonation.sessions.terminate', selectedSession.id),
                {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Accept': 'application/json',
                    },
                }
            );

            const data = await response.json();

            if (data.success) {
                // Remove session from list
                setSessions(sessions.filter(s => s.id !== selectedSession.id));
                setDeleteDialogOpen(false);
                setSelectedSession(null);
            } else {
                alert(data.message || 'Error al terminar la sesión');
            }
        } catch (error) {
            console.error('Error terminating session:', error);
            alert('Error al terminar la sesión');
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (minutes) => {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <AdminLayoutNew>
            <Head title="Sesiones de Impersonación" />

            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        Sesiones de Impersonación Activas
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={refreshSessions}
                        disabled={loading}
                    >
                        Actualizar
                    </Button>
                </Box>

                {sessions.length === 0 ? (
                    <Alert severity="info">
                        No hay sesiones de impersonación activas en este momento.
                    </Alert>
                ) : (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Total de sesiones activas: <strong>{sessions.length}</strong>
                            </Typography>

                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                                            <TableCell><strong>Administrador</strong></TableCell>
                                            <TableCell><strong>Usuario Impersonado</strong></TableCell>
                                            <TableCell><strong>Inicio</strong></TableCell>
                                            <TableCell><strong>Duración</strong></TableCell>
                                            <TableCell><strong>IP</strong></TableCell>
                                            <TableCell align="center"><strong>Acciones</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sessions.map((session) => (
                                            <TableRow key={session.id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <PersonIcon fontSize="small" color="primary" />
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                {session.impersonator.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {session.impersonator.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <PersonIcon fontSize="small" color="secondary" />
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                {session.target.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {session.target.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <AccessTimeIcon fontSize="small" color="action" />
                                                        <Box>
                                                            <Typography variant="body2">
                                                                {session.started_at_human}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {new Date(session.started_at).toLocaleString('es-ES')}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={formatDuration(session.duration_minutes)}
                                                        size="small"
                                                        color={session.duration_minutes > 25 ? 'warning' : 'default'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <ComputerIcon fontSize="small" color="action" />
                                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                            {session.ip_address}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="Terminar sesión">
                                                        <IconButton
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleTerminateClick(session)}
                                                            disabled={loading}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => !loading && setDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Terminar Sesión de Impersonación</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que deseas terminar esta sesión de impersonación?
                    </DialogContentText>
                    {selectedSession && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Administrador:</strong> {selectedSession.impersonator.name}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Usuario:</strong> {selectedSession.target.name}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Duración:</strong> {formatDuration(selectedSession.duration_minutes)}
                            </Typography>
                        </Box>
                    )}
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        Esta acción cerrará inmediatamente la sesión del administrador y lo devolverá a su cuenta original.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleTerminateConfirm}
                        color="error"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? 'Terminando...' : 'Terminar Sesión'}
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayoutNew>
    );
}

