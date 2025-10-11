import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    CircularProgress,
    Alert,
    Divider,
} from '@mui/material';
import {
    Close as CloseIcon,
    History as HistoryIcon,
    Block as BlockIcon,
    CheckCircle as ActiveIcon,
    Cancel as InactiveIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import axios from 'axios';

const BanHistoryModal = ({ open, onClose, user }) => {
    const [banHistory, setBanHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Glassmorphism styles
    const glassmorphismCard = {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    };

    // Fetch ban history when modal opens
    useEffect(() => {
        if (open && user) {
            fetchBanHistory();
        }
    }, [open, user]);

    const fetchBanHistory = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get(route('admin.users.ban-history', user.id));
            setBanHistory(response.data.bans || []);
        } catch (err) {
            setError('Error al cargar el historial de suspensiones');
            console.error('Error fetching ban history:', err);
        } finally {
            setLoading(false);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get duration text
    const getDurationText = (bannedAt, expiresAt) => {
        if (!expiresAt) return 'Permanente';
        
        const start = new Date(bannedAt);
        const end = new Date(expiresAt);
        const diffMs = end - start;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (diffDays > 0) {
            return `${diffDays} día${diffDays > 1 ? 's' : ''}`;
        } else if (diffHours > 0) {
            return `${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        } else {
            return 'Menos de 1 hora';
        }
    };

    if (!user) return null;

    return (
        <AnimatePresence>
            {open && (
                <Dialog
                    open={open}
                    onClose={onClose}
                    maxWidth="lg"
                    fullWidth
                    PaperProps={{
                        sx: {
                            ...glassmorphismCard,
                            minHeight: '500px',
                            maxHeight: '90vh',
                        }
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Header */}
                        <DialogTitle sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            pb: 2,
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <HistoryIcon sx={{ color: '#3182CE', fontSize: 28 }} />
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#1A202C' }}>
                                        Historial de Suspensiones
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#4A5568', mt: 0.5, fontWeight: 500 }}>
                                        {user.name} ({user.email})
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton onClick={onClose} sx={{ color: '#4A5568' }}>
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>

                        {/* Content */}
                        <DialogContent sx={{ py: 3 }}>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                                    <CircularProgress />
                                </Box>
                            ) : error ? (
                                <Alert severity="error" sx={{ borderRadius: '12px' }}>
                                    {error}
                                </Alert>
                            ) : banHistory.length === 0 ? (
                                <Alert severity="info" sx={{ borderRadius: '12px' }}>
                                    Este usuario no tiene historial de suspensiones.
                                </Alert>
                            ) : (
                                <TableContainer component={Paper} sx={{ 
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    boxShadow: 'none',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: alpha('#3182CE', 0.1) }}>
                                                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Fecha de Suspensión</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Duración</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Expira</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Motivo</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Suspendido Por</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {banHistory.map((ban, index) => (
                                                <TableRow 
                                                    key={ban.id || index}
                                                    sx={{ 
                                                        '&:hover': { backgroundColor: alpha('#3182CE', 0.05) },
                                                        '&:last-child td': { border: 0 }
                                                    }}
                                                >
                                                    <TableCell>
                                                        {ban.is_active ? (
                                                            <Chip 
                                                                icon={<ActiveIcon />}
                                                                label="Activa" 
                                                                color="error" 
                                                                size="small"
                                                                sx={{ fontWeight: 600 }}
                                                            />
                                                        ) : (
                                                            <Chip 
                                                                icon={<InactiveIcon />}
                                                                label="Inactiva" 
                                                                size="small"
                                                                sx={{ fontWeight: 600 }}
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {formatDate(ban.banned_at)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={getDurationText(ban.banned_at, ban.expires_at)}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ color: ban.expires_at ? '#2D3748' : '#718096' }}>
                                                            {ban.expires_at ? formatDate(ban.expires_at) : 'Nunca'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography 
                                                            variant="body2" 
                                                            sx={{ 
                                                                maxWidth: 300,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                            title={ban.reason}
                                                        >
                                                            {ban.reason || 'Sin motivo especificado'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <PersonIcon sx={{ fontSize: 18, color: '#4A5568' }} />
                                                            <Typography variant="body2">
                                                                {ban.banned_by_user?.name || 'Sistema'}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}

                            {/* Summary */}
                            {!loading && !error && banHistory.length > 0 && (
                                <Box sx={{ mt: 3, p: 2, borderRadius: '12px', backgroundColor: alpha('#3182CE', 0.05) }}>
                                    <Typography variant="body2" sx={{ color: '#4A5568' }}>
                                        <strong>Total de suspensiones:</strong> {banHistory.length} | 
                                        <strong> Activas:</strong> {banHistory.filter(b => b.is_active).length} | 
                                        <strong> Inactivas:</strong> {banHistory.filter(b => !b.is_active).length}
                                    </Typography>
                                </Box>
                            )}
                        </DialogContent>

                        {/* Actions */}
                        <DialogActions sx={{ 
                            p: 3, 
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        }}>
                            <Button
                                onClick={onClose}
                                variant="contained"
                                sx={{
                                    borderRadius: '12px',
                                    backgroundColor: '#3182CE',
                                    '&:hover': {
                                        backgroundColor: '#2C5282',
                                    }
                                }}
                            >
                                Cerrar
                            </Button>
                        </DialogActions>
                    </motion.div>
                </Dialog>
            )}
        </AnimatePresence>
    );
};

export default BanHistoryModal;

