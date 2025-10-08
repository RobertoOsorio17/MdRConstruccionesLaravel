import React, { useState, useEffect } from 'react';
import {
    alpha,
    Box,
    Paper,
    Typography,
    Switch,
    FormControlLabel,
    TextField,
    Button,
    Chip,
    Alert,
    Stack,
    Divider,
    useTheme,
} from '@mui/material';
import {
    Build as BuildIcon,
    Schedule as ScheduleIcon,
    Visibility as VisibilityIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { router } from '@inertiajs/react';

const resolveBoolean = (value) => {
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'number') {
        return value === 1;
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
    }
    return Boolean(value);
};

// Helper function to convert datetime to datetime-local format (YYYY-MM-DDTHH:MM)
const formatDatetimeLocal = (datetime) => {
    if (!datetime) return '';
    try {
        // Handle both "YYYY-MM-DD HH:MM:SS" and ISO formats
        const date = new Date(datetime.replace(' ', 'T'));
        if (isNaN(date.getTime())) return '';

        // Format to YYYY-MM-DDTHH:MM (required by datetime-local input)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
        return '';
    }
};

const MaintenanceModePanel = ({ values, onChange }) => {
    const theme = useTheme();
    const [newIp, setNewIp] = useState('');
    const [scheduleStart, setScheduleStart] = useState('');
    const [scheduleEnd, setScheduleEnd] = useState('');
    const [feedback, setFeedback] = useState(null);

    const maintenanceEnabled = resolveBoolean(values.maintenance_mode);
    const maintenanceMessage = values.maintenance_message || '';
    const allowedIps = Array.isArray(values.maintenance_allowed_ips)
        ? values.maintenance_allowed_ips
        : values.maintenance_allowed_ips
            ? (() => {
                try {
                    return JSON.parse(values.maintenance_allowed_ips);
                } catch (error) {
                    return [];
                }
            })()
            : [];

    // Preload schedule values from settings
    useEffect(() => {
        if (values.maintenance_start_at) {
            setScheduleStart(formatDatetimeLocal(values.maintenance_start_at));
        }
        if (values.maintenance_end_at) {
            setScheduleEnd(formatDatetimeLocal(values.maintenance_end_at));
        }
    }, [values.maintenance_start_at, values.maintenance_end_at]);

    const showFeedback = (message, severity = 'info') => {
        setFeedback({ message, severity });
    };

    const updateSetting = (key, value) => {
        if (onChange) {
            onChange(key, value);
        }
    };

    const refreshSettings = () => {
        router.reload({
            only: ['settings', 'flash'],
            preserveScroll: true,
        });
    };

    const handleToggle = () => {
        const nextEnabled = !maintenanceEnabled;
        updateSetting('maintenance_mode', nextEnabled);
        router.post('/admin/maintenance/toggle', {
            enabled: nextEnabled,
            message: maintenanceMessage || 'Estamos realizando mejoras. Volveremos pronto.',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                showFeedback(
                    nextEnabled ? 'Modo mantenimiento activado.' : 'Modo mantenimiento desactivado.',
                    'success',
                );
                refreshSettings();
            },
            onError: () => {
                updateSetting('maintenance_mode', maintenanceEnabled);
                showFeedback('No fue posible actualizar el modo mantenimiento.', 'error');
            },
        });
    };

    const handleAddIp = () => {
        const trimmed = newIp.trim();
        if (!trimmed) {
            showFeedback('Ingresa una direccion IP valida.', 'warning');
            return;
        }

        const updatedIps = allowedIps.includes(trimmed)
            ? allowedIps
            : [...allowedIps, trimmed];

        updateSetting('maintenance_allowed_ips', updatedIps);

        router.post('/admin/maintenance/ip/add', {
            ip: trimmed,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewIp('');
                showFeedback('IP agregada a la lista permitida.', 'success');
                refreshSettings();
            },
            onError: () => {
                showFeedback('No fue posible agregar la IP.', 'error');
                updateSetting('maintenance_allowed_ips', allowedIps);
            },
        });
    };

    const handleRemoveIp = (ip) => {
        const nextIps = allowedIps.filter((item) => item !== ip);
        updateSetting('maintenance_allowed_ips', nextIps);

        router.delete(`/admin/maintenance/ip/${ip}`, {
            preserveScroll: true,
            onSuccess: () => {
                showFeedback('IP eliminada de la lista.', 'success');
                refreshSettings();
            },
            onError: () => {
                showFeedback('No fue posible eliminar la IP.', 'error');
                updateSetting('maintenance_allowed_ips', allowedIps);
            },
        });
    };

    const handleSchedule = () => {
        if (!scheduleStart || !scheduleEnd) {
            showFeedback('Define fecha de inicio y fin para programar el mantenimiento.', 'warning');
            return;
        }

        const previousMode = maintenanceEnabled;
        const previousStart = values.maintenance_start_at ?? '';
        const previousEnd = values.maintenance_end_at ?? '';

        updateSetting('maintenance_mode', true);
        updateSetting('maintenance_start_at', scheduleStart);
        updateSetting('maintenance_end_at', scheduleEnd);

        router.post('/admin/maintenance/schedule', {
            start_at: scheduleStart,
            end_at: scheduleEnd,
            message: maintenanceMessage || 'Mantenimiento programado',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                showFeedback('Ventana de mantenimiento programada.', 'success');
                setScheduleStart('');
                setScheduleEnd('');
                refreshSettings();
            },
            onError: () => {
                showFeedback('No fue posible programar el mantenimiento.', 'error');
                updateSetting('maintenance_mode', previousMode);
                updateSetting('maintenance_start_at', previousStart);
                updateSetting('maintenance_end_at', previousEnd);
            },
        });
    };

    const handlePreview = () => {
        window.open('/admin/maintenance/preview', '_blank');
    };



    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 0,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    backgroundColor: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(20px)',
                    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
                    overflow: 'hidden',
                    maxWidth: '100%',
                }}
            >
                <Stack spacing={0}>
                    {/* Header Section */}
                    <Box
                        sx={{
                            p: 3,
                            background: `linear-gradient(135deg, ${alpha(
                                maintenanceEnabled ? theme.palette.warning.main : theme.palette.primary.main,
                                0.08
                            )}, ${alpha(
                                maintenanceEnabled ? theme.palette.warning.light : theme.palette.primary.light,
                                0.04
                            )})`,
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        }}
                    >
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: maintenanceEnabled
                                            ? `linear-gradient(135deg, ${alpha(
                                                  theme.palette.warning.main,
                                                  0.2,
                                              )}, ${alpha(theme.palette.warning.light, 0.1)})`
                                            : `linear-gradient(135deg, ${alpha(
                                                  theme.palette.primary.main,
                                                  0.2,
                                              )}, ${alpha(theme.palette.primary.light, 0.1)})`,
                                        border: `1px solid ${alpha(
                                            maintenanceEnabled
                                                ? theme.palette.warning.main
                                                : theme.palette.primary.main,
                                            0.3,
                                        )}`,
                                        color: maintenanceEnabled ? 'warning.main' : 'primary.main',
                                    }}
                                >
                                    <BuildIcon sx={{ fontSize: 24 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                                        Modo mantenimiento
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Controla el acceso al sitio durante tareas de servicio o despliegues.
                                    </Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Chip
                                    label={maintenanceEnabled ? 'Activo' : 'Inactivo'}
                                    size="small"
                                    color={maintenanceEnabled ? 'warning' : 'default'}
                                    variant={maintenanceEnabled ? 'filled' : 'outlined'}
                                    sx={{
                                        borderRadius: 2,
                                        fontWeight: 600,
                                        backdropFilter: 'blur(6px)',
                                    }}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={maintenanceEnabled}
                                            onChange={handleToggle}
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': {
                                                    color: theme.palette.warning.main,
                                                },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                                                    {
                                                        backgroundColor: theme.palette.warning.main,
                                                    },
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography variant="body2" fontWeight={600}>
                                            {maintenanceEnabled ? 'Activado' : 'Desactivado'}
                                        </Typography>
                                    }
                                />
                            </Stack>
                        </Stack>
                    </Box>

                    {/* Alerts Section */}
                    {(maintenanceEnabled || feedback) && (
                        <Box sx={{ p: 3, pt: 2 }}>
                            <Stack spacing={2}>
                                {maintenanceEnabled && (
                                    <Alert
                                        severity="warning"
                                        sx={{
                                            borderRadius: 2,
                                            backdropFilter: 'blur(10px)',
                                            backgroundColor: alpha(theme.palette.warning.main, 0.1),
                                            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                                        }}
                                    >
                                        El sitio se encuentra en mantenimiento. Solo las IPs permitidas verán el contenido habitual.
                                    </Alert>
                                )}

                                {feedback && (
                                    <Alert
                                        severity={feedback.severity || 'info'}
                                        onClose={() => setFeedback(null)}
                                        sx={{
                                            borderRadius: 2,
                                            backdropFilter: 'blur(10px)',
                                            backgroundColor: (theme) =>
                                                alpha(
                                                    theme.palette[feedback.severity || 'info'].main,
                                                    0.1,
                                                ),
                                            border: (theme) =>
                                                `1px solid ${alpha(
                                                    theme.palette[feedback.severity || 'info'].main,
                                                    0.3,
                                                )}`,
                                        }}
                                    >
                                        {feedback.message}
                                    </Alert>
                                )}
                            </Stack>
                        </Box>
                    )}

                    {/* Message Section */}
                    <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Stack spacing={2}>
                            <Typography variant="subtitle2" fontWeight={600}>
                                Mensaje para visitantes
                            </Typography>
                            <TextField
                                multiline
                                minRows={3}
                                fullWidth
                                value={maintenanceMessage}
                                onChange={(event) => onChange('maintenance_message', event.target.value)}
                                placeholder="Estamos realizando mejoras. Volveremos pronto."
                                inputProps={{ maxLength: 1000 }}
                                helperText={`${maintenanceMessage.length}/1000 caracteres`}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: alpha(theme.palette.background.default, 0.6),
                                        backdropFilter: 'blur(6px)',
                                    },
                                }}
                            />
                        </Stack>
                    </Box>

                    {/* Additional Options Section */}
                    <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Stack spacing={2}>
                            <Typography variant="subtitle2" fontWeight={600}>
                                Opciones adicionales
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={resolveBoolean(values.maintenance_show_countdown)}
                                        onChange={(event) => onChange('maintenance_show_countdown', event.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Mostrar cuenta regresiva hasta el fin del mantenimiento"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={resolveBoolean(values.maintenance_allow_admin)}
                                        onChange={(event) => onChange('maintenance_allow_admin', event.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Permitir acceso a administradores durante mantenimiento"
                            />
                            <TextField
                                type="number"
                                label="Retry-After (segundos)"
                                fullWidth
                                value={values.maintenance_retry_after || '3600'}
                                onChange={(event) => onChange('maintenance_retry_after', event.target.value)}
                                helperText="Tiempo en segundos para header Retry-After (SEO). Mínimo: 60, Máximo: 86400"
                                inputProps={{
                                    min: 60,
                                    max: 86400,
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: alpha(theme.palette.background.default, 0.6),
                                        backdropFilter: 'blur(6px)',
                                    },
                                }}
                            />
                        </Stack>
                    </Box>

                    {/* IP Whitelist Section */}
                    <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Stack spacing={2}>
                            <Typography variant="subtitle2" fontWeight={600}>
                                Lista de IPs permitidas
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Estas direcciones continuaran accediendo al sitio aun cuando el modo mantenimiento este activo.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="192.168.1.1"
                                    value={newIp}
                                    onChange={(event) => setNewIp(event.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddIp();
                                        }
                                    }}
                                    sx={{
                                        flex: 1,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: alpha(
                                                theme.palette.background.default,
                                                0.6,
                                            ),
                                            backdropFilter: 'blur(6px)',
                                        },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddIp}
                                    sx={{
                                        borderRadius: 2,
                                        boxShadow: `0 4px 12px ${alpha(
                                            theme.palette.primary.main,
                                            0.3,
                                        )}`,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    Agregar IP
                                </Button>
                            </Stack>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {allowedIps.length > 0 ? (
                                    allowedIps.map((ip) => (
                                        <Chip
                                            key={ip}
                                            label={ip}
                                            onDelete={() => handleRemoveIp(ip)}
                                            deleteIcon={<DeleteIcon />}
                                            color="primary"
                                            variant="outlined"
                                            sx={{
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                backdropFilter: 'blur(6px)',
                                                backgroundColor: alpha(
                                                    theme.palette.primary.main,
                                                    0.08,
                                                ),
                                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                            }}
                                        />
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No hay IPs registradas.
                                    </Typography>
                                )}
                            </Box>
                        </Stack>
                    </Box>

                    {/* Schedule Section */}
                    <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Stack spacing={2}>
                            <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                            >
                                <ScheduleIcon fontSize="small" /> Programar ventana de mantenimiento
                            </Typography>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                <TextField
                                    type="datetime-local"
                                    label="Inicio"
                                    fullWidth
                                    value={scheduleStart}
                                    onChange={(event) => setScheduleStart(event.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: alpha(theme.palette.background.default, 0.6),
                                            backdropFilter: 'blur(6px)',
                                        },
                                    }}
                                />
                                <TextField
                                    type="datetime-local"
                                    label="Fin"
                                    fullWidth
                                    value={scheduleEnd}
                                    onChange={(event) => setScheduleEnd(event.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: alpha(theme.palette.background.default, 0.6),
                                            backdropFilter: 'blur(6px)',
                                        },
                                    }}
                                />
                            </Stack>
                            <Button
                                variant="outlined"
                                startIcon={<ScheduleIcon />}
                                onClick={handleSchedule}
                                sx={{
                                    borderRadius: 2,
                                    alignSelf: 'flex-start',
                                }}
                            >
                                Guardar programacion
                            </Button>
                        </Stack>
                    </Box>

                    {/* Preview Section */}
                    <Box sx={{ p: 3 }}>
                        <Button
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={handlePreview}
                            sx={{
                                borderRadius: 2,
                            }}
                        >
                            Ver vista previa de la pagina
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </motion.div>
    );
};

export default MaintenanceModePanel;



