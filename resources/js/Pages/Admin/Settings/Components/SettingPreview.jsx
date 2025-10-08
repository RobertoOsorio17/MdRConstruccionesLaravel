import React from 'react';
import {
    alpha,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Divider,
    Chip,
    Stack,
    Paper,
    IconButton,
    useTheme,
} from '@mui/material';
import {
    Close as CloseIcon,
    CheckCircle as CheckIcon,
    ArrowForwardRounded as ArrowForwardIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
const SettingPreview = ({ open, onClose, onConfirm, changes, settings }) => {
    const theme = useTheme();
    const changeEntries = Object.entries(changes || {});

    const getSetting = (key) => settings.find((item) => item.key === key);

    const groupedChanges = changeEntries.reduce((accumulator, [key, newValue]) => {
        const setting = getSetting(key);
        const group = setting?.group || 'general';
        if (!accumulator[group]) {
            accumulator[group] = [];
        }
        accumulator[group].push({ key, newValue, setting });
        return accumulator;
    }, {});

    const groupLabels = {
        general: 'General',
        security: 'Seguridad',
        email: 'Email',
        performance: 'Rendimiento',
        seo: 'SEO',
        social: 'Social',
        backup: 'Respaldo',
        maintenance: 'Mantenimiento',
    };

    const formatValue = (value) => {
        if (value === null || value === undefined) {
            return 'Sin valor';
        }
        if (typeof value === 'boolean') {
            return value ? 'Activo' : 'Inactivo';
        }
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value, null, 2);
            } catch (error) {
                return String(value);
            }
        }
        return String(value);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    boxShadow: `0 24px 64px ${alpha(theme.palette.common.black, 0.2)}`,
                },
            }}
        >
            <DialogTitle
                sx={{
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
            >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                    <Box>
                        <Typography variant="h6" fontWeight={600}>
                            Revisar cambios antes de guardar
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Confirma que los ajustes listados son correctos.
                        </Typography>
                    </Box>
                    <Chip
                        label={`${changeEntries.length} cambio${changeEntries.length === 1 ? '' : 's'}`}
                        color="primary"
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            backdropFilter: 'blur(6px)',
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                        }}
                    />
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <AnimatePresence>
                    {Object.entries(groupedChanges).map(([group, items]) => (
                        <motion.div
                            key={group}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            <Typography variant="subtitle2" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                                {groupLabels[group] || group}
                            </Typography>
                            <Stack spacing={2} sx={{ mb: 3 }}>
                                {items.map(({ key, newValue, setting }) => {
                                    const oldValue = setting?.originalValue;
                                    return (
                                        <Paper
                                            key={key}
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                borderColor: alpha(theme.palette.divider, 0.5),
                                                backgroundColor: alpha(
                                                    theme.palette.background.default,
                                                    0.4,
                                                ),
                                                backdropFilter: 'blur(8px)',
                                            }}
                                        >
                                            <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
                                                {setting?.label || key}
                                            </Typography>
                                            <Stack
                                                direction={{ xs: 'column', sm: 'row' }}
                                                spacing={2}
                                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                                            >
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            textTransform: 'uppercase',
                                                            letterSpacing: 0.5,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        Valor actual
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            mt: 0.5,
                                                            p: 1.5,
                                                            borderRadius: 2,
                                                            backgroundColor: alpha(
                                                                theme.palette.background.default,
                                                                0.6,
                                                            ),
                                                            border: `1px solid ${alpha(
                                                                theme.palette.divider,
                                                                0.3,
                                                            )}`,
                                                            fontFamily:
                                                                '"Fira Code", "Courier New", monospace',
                                                            fontSize: '0.85rem',
                                                            whiteSpace: 'pre-wrap',
                                                            wordBreak: 'break-word',
                                                            backdropFilter: 'blur(6px)',
                                                        }}
                                                    >
                                                        {formatValue(oldValue)}
                                                    </Box>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        display: { xs: 'none', sm: 'flex' },
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'primary.main',
                                                    }}
                                                >
                                                    <ArrowForwardIcon />
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography
                                                        variant="caption"
                                                        color="primary.main"
                                                        sx={{
                                                            textTransform: 'uppercase',
                                                            letterSpacing: 0.5,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        Nuevo valor
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            mt: 0.5,
                                                            p: 1.5,
                                                            borderRadius: 2,
                                                            backgroundColor: alpha(
                                                                theme.palette.primary.main,
                                                                0.08,
                                                            ),
                                                            border: `1px solid ${alpha(
                                                                theme.palette.primary.main,
                                                                0.3,
                                                            )}`,
                                                            fontFamily:
                                                                '"Fira Code", "Courier New", monospace',
                                                            fontSize: '0.85rem',
                                                            whiteSpace: 'pre-wrap',
                                                            wordBreak: 'break-word',
                                                            backdropFilter: 'blur(6px)',
                                                        }}
                                                    >
                                                        {formatValue(newValue)}
                                                    </Box>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    );
                                })}
                            </Stack>
                            <Divider sx={{ mb: 3 }} />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {changeEntries.length === 0 && (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                            No hay modificaciones para confirmar.
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    px: 3,
                    py: 2,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    backgroundColor: alpha(theme.palette.background.default, 0.4),
                }}
            >
                <Button
                    onClick={onClose}
                    startIcon={<CloseIcon />}
                    sx={{
                        borderRadius: 2,
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    startIcon={<CheckIcon />}
                    onClick={onConfirm}
                    disabled={changeEntries.length === 0}
                    sx={{
                        borderRadius: 2,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                >
                    Confirmar y guardar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SettingPreview;
