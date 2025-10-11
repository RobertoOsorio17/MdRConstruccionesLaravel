import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Typography,
    Box,
    Alert,
    Divider,
    Grid,
    Chip,
    IconButton,
} from '@mui/material';
import {
    Close as CloseIcon,
    Warning as WarningIcon,
    Schedule as ScheduleIcon,
    Block as BlockIcon,
    Security as SecurityIcon,
    Notes as NotesIcon,
} from '@mui/icons-material';
// Note: DateTimePicker requires additional packages. For now, we'll use a simple TextField for custom dates
import { motion, AnimatePresence } from 'framer-motion';
import { alpha } from '@mui/material/styles';

const BanUserModal = ({ open, onClose, user, onConfirm, loading = false }) => {
    const [formData, setFormData] = useState({
        reason: '',
        duration: 'permanent',
        customExpiration: null,
        ipBan: false,
        adminNotes: '',
    });
    const [errors, setErrors] = useState({});
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Glassmorphism styles with improved contrast
    const glassmorphismCard = {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    };

    // Duration options
    const durationOptions = [
        { value: '1_hour', label: '1 Hora', duration: '1 hora' },
        { value: '1_day', label: '1 Día', duration: '1 día' },
        { value: '1_week', label: '1 Semana', duration: '1 semana' },
        { value: '1_month', label: '1 Mes', duration: '1 mes' },
        { value: '3_months', label: '3 Meses', duration: '3 meses' },
        { value: '6_months', label: '6 Meses', duration: '6 meses' },
        { value: '1_year', label: '1 Año', duration: '1 año' },
        { value: 'permanent', label: 'Permanente', duration: 'permanente' },
        { value: 'custom', label: 'Personalizado', duration: 'personalizado' },
    ];

    // Reset form when modal opens/closes
    useEffect(() => {
        if (open) {
            setFormData({
                reason: '',
                duration: 'permanent',
                customExpiration: null,
                ipBan: false,
                adminNotes: '',
            });
            setErrors({});
            setShowConfirmation(false);

            // Add event listeners for DOM changes after modal opens
            setTimeout(() => {
                const reasonField = document.querySelector('textarea[placeholder*="motivo"]');
                const adminNotesField = document.querySelector('textarea[placeholder*="administradores"]');

                if (reasonField) {
                    const handleReasonChange = (e) => {
                        setFormData(prev => ({ ...prev, reason: e.target.value }));
                    };
                    reasonField.addEventListener('input', handleReasonChange);
                    reasonField.addEventListener('change', handleReasonChange);
                    reasonField.addEventListener('paste', handleReasonChange);
                }

                if (adminNotesField) {
                    const handleNotesChange = (e) => {
                        setFormData(prev => ({ ...prev, adminNotes: e.target.value }));
                    };
                    adminNotesField.addEventListener('input', handleNotesChange);
                    adminNotesField.addEventListener('change', handleNotesChange);
                    adminNotesField.addEventListener('paste', handleNotesChange);
                }
            }, 100);
        }
    }, [open]);

    // Handle form field changes
    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    // Force sync form data from DOM elements (for programmatic testing)
    const syncFormDataFromDOM = () => {
        const reasonField = document.querySelector('textarea[placeholder*="motivo"]');
        const adminNotesField = document.querySelector('textarea[placeholder*="administradores"]');

        if (reasonField && reasonField.value !== formData.reason) {
            setFormData(prev => ({
                ...prev,
                reason: reasonField.value
            }));
        }

        if (adminNotesField && adminNotesField.value !== formData.adminNotes) {
            setFormData(prev => ({
                ...prev,
                adminNotes: adminNotesField.value
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Get the actual value from the DOM element if React state is not updated
        const reasonField = document.querySelector('textarea[placeholder*="motivo"]');
        const actualReason = reasonField ? reasonField.value : formData.reason;

        if (!actualReason.trim()) {
            newErrors.reason = 'El motivo de la suspensión es obligatorio';
        } else if (actualReason.length < 10) {
            newErrors.reason = 'El motivo debe tener al menos 10 caracteres';
        } else if (actualReason.length > 500) {
            newErrors.reason = 'El motivo no puede exceder 500 caracteres';
        }

        if (formData.duration === 'custom' && !formData.customExpiration) {
            newErrors.customExpiration = 'Debe seleccionar una fecha de expiración';
        }

        if (formData.duration === 'custom' && formData.customExpiration && formData.customExpiration <= new Date()) {
            newErrors.customExpiration = 'La fecha de expiración debe ser futura';
        }

        if (formData.adminNotes && formData.adminNotes.length > 1000) {
            newErrors.adminNotes = 'Las notas no pueden exceder 1000 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = () => {
        // Sync form data from DOM before validation
        syncFormDataFromDOM();

        // Use setTimeout to ensure state is updated before validation
        setTimeout(() => {
            if (validateForm()) {
                setShowConfirmation(true);
            }
        }, 100);
    };

    // Handle confirmation
    const handleConfirm = () => {
        // Sync one more time before sending
        syncFormDataFromDOM();

        // Use the synced form data
        const banData = {
            reason: formData.reason.trim(),
            duration: formData.duration,
            expires_at: formData.duration === 'custom' ? formData.customExpiration : null,
            ip_ban: formData.ipBan,
            admin_notes: formData.adminNotes.trim() || null,
        };



        onConfirm(banData);
        setShowConfirmation(false);
    };

    // Get duration display text
    const getDurationText = () => {
        const option = durationOptions.find(opt => opt.value === formData.duration);
        return option ? option.duration : 'permanente';
    };

    if (!user) return null;

    return (
        <AnimatePresence>
                {open && (
                    <Dialog
                        open={open}
                        onClose={onClose}
                        maxWidth="md"
                        fullWidth
                        PaperProps={{
                            sx: {
                                ...glassmorphismCard,
                                minHeight: '600px',
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
                                    <BlockIcon sx={{ color: '#E53E3E', fontSize: 28 }} />
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1A202C' }}>
                                            Suspender Usuario
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
                                {!showConfirmation ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        {/* Warning Alert */}
                                        <Alert 
                                            severity="warning" 
                                            icon={<WarningIcon />}
                                            sx={{ 
                                                backgroundColor: alpha('#ED8936', 0.1),
                                                border: '1px solid rgba(237, 137, 54, 0.2)',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            Esta acción suspenderá el acceso del usuario al sistema. 
                                            El usuario será desconectado inmediatamente y no podrá iniciar sesión hasta que se levante la suspensión.
                                        </Alert>

                                        {/* Ban Reason */}
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: '#2D3748' }}>
                                                <NotesIcon sx={{ fontSize: 20, color: '#4A5568' }} />
                                                Motivo de la Suspensión *
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={4}
                                                value={formData.reason}
                                                onChange={(e) => handleChange('reason', e.target.value)}
                                                placeholder="Describe el motivo de la suspensión (mínimo 10 caracteres)..."
                                                error={!!errors.reason}
                                                helperText={errors.reason || `${formData.reason.length}/500 caracteres`}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '12px',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                        '& .MuiOutlinedInput-input': {
                                                            color: '#2D3748',
                                                        }
                                                    }
                                                }}
                                            />
                                        </Box>

                                        {/* Duration Selection */}
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: '#2D3748' }}>
                                                <ScheduleIcon sx={{ fontSize: 20, color: '#4A5568' }} />
                                                Duración de la Suspensión
                                            </Typography>
                                            <FormControl fullWidth error={!!errors.duration}>
                                                <Select
                                                    value={formData.duration}
                                                    onChange={(e) => handleChange('duration', e.target.value)}
                                                    sx={{
                                                        borderRadius: '12px',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                        '& .MuiSelect-select': {
                                                            color: '#2D3748',
                                                        }
                                                    }}
                                                >
                                                    {durationOptions.map((option) => (
                                                        <MenuItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Box>

                                        {/* Custom Expiration Date */}
                                        {formData.duration === 'custom' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                            >
                                                <TextField
                                                    fullWidth
                                                    type="datetime-local"
                                                    label="Fecha y Hora de Expiración"
                                                    value={formData.customExpiration ? formData.customExpiration.toISOString().slice(0, 16) : ''}
                                                    onChange={(e) => handleChange('customExpiration', e.target.value ? new Date(e.target.value) : null)}
                                                    error={!!errors.customExpiration}
                                                    helperText={errors.customExpiration}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    inputProps={{
                                                        min: new Date().toISOString().slice(0, 16)
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '12px',
                                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                        }
                                                    }}
                                                />
                                            </motion.div>
                                        )}

                                        {/* IP Ban Toggle */}
                                        <Box sx={{ 
                                            p: 2, 
                                            borderRadius: '12px', 
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)'
                                        }}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={formData.ipBan}
                                                        onChange={(e) => handleChange('ipBan', e.target.checked)}
                                                        color="error"
                                                    />
                                                }
                                                label={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <SecurityIcon sx={{ fontSize: 20 }} />
                                                        <Box>
                                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                                Suspensión por IP
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: '#718096' }}>
                                                                También bloquear la dirección IP del usuario
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                        </Box>

                                        {/* Admin Notes */}
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                                Notas Internas (Opcional)
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={3}
                                                value={formData.adminNotes}
                                                onChange={(e) => handleChange('adminNotes', e.target.value)}
                                                placeholder="Notas adicionales para otros administradores..."
                                                error={!!errors.adminNotes}
                                                helperText={errors.adminNotes || `${formData.adminNotes.length}/1000 caracteres`}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '12px',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                ) : (
                                    /* Confirmation Screen */
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200 }}
                                        >
                                            <BlockIcon sx={{ fontSize: 64, color: '#E53E3E', mb: 2 }} />
                                        </motion.div>
                                        
                                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                                            Confirmar Suspensión
                                        </Typography>
                                        
                                        <Typography variant="body1" sx={{ color: '#718096', mb: 3 }}>
                                            ¿Estás seguro de que quieres suspender a <strong>{user.name}</strong>?
                                        </Typography>

                                        <Box sx={{
                                            p: 3,
                                            borderRadius: '12px',
                                            backgroundColor: 'rgba(229, 62, 62, 0.1)',
                                            border: '1px solid rgba(229, 62, 62, 0.2)',
                                            mb: 3
                                        }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                                        Usuario:
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {user.name}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                                        Duración:
                                                    </Typography>
                                                    <Chip
                                                        label={getDurationText()}
                                                        color="error"
                                                        size="small"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="body2" sx={{ color: '#718096' }}>
                                                        Motivo:
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {formData.reason}
                                                    </Typography>
                                                </Grid>
                                                {formData.ipBan && (
                                                    <Grid item xs={12}>
                                                        <Chip 
                                                            label="Incluye suspensión por IP" 
                                                            color="error" 
                                                            size="small"
                                                            icon={<SecurityIcon />}
                                                        />
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </Box>
                                    </Box>
                                )}
                            </DialogContent>

                            {/* Actions */}
                            <DialogActions sx={{ 
                                p: 3, 
                                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                gap: 2
                            }}>
                                {!showConfirmation ? (
                                    <>
                                        <Button
                                            onClick={onClose}
                                            variant="outlined"
                                            sx={{
                                                borderRadius: '12px',
                                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                                color: '#718096',
                                                '&:hover': {
                                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                }
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            variant="contained"
                                            disabled={loading}
                                            sx={{
                                                borderRadius: '12px',
                                                backgroundColor: '#E53E3E',
                                                '&:hover': {
                                                    backgroundColor: '#C53030',
                                                }
                                            }}
                                        >
                                            Continuar
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            onClick={() => setShowConfirmation(false)}
                                            variant="outlined"
                                            sx={{
                                                borderRadius: '12px',
                                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                                color: '#718096',
                                            }}
                                        >
                                            Volver
                                        </Button>
                                        <Button
                                            onClick={handleConfirm}
                                            variant="contained"
                                            disabled={loading}
                                            sx={{
                                                borderRadius: '12px',
                                                backgroundColor: '#E53E3E',
                                                '&:hover': {
                                                    backgroundColor: '#C53030',
                                                }
                                            }}
                                        >
                                            {loading ? 'Suspendiendo...' : 'Confirmar Suspensión'}
                                        </Button>
                                    </>
                                )}
                            </DialogActions>
                        </motion.div>
                    </Dialog>
                )}
            </AnimatePresence>
    );
};

export default BanUserModal;
