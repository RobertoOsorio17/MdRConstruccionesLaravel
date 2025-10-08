import React, { useState } from 'react';
import {
    alpha,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import {
    CloseRounded as CloseIcon,
    RestoreRounded as RestoreIcon,
    HistoryRounded as HistoryIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionListItem = motion(ListItem);

const formatValue = (value) => {
    if (value === null || value === undefined || value === '') {
        return 'Sin valor';
    }

    if (typeof value === 'boolean') {
        return value ? 'Verdadero' : 'Falso';
    }

    if (typeof value === 'object') {
        try {
            return JSON.stringify(value, null, 2);
        } catch (error) {
            return 'Dato estructurado';
        }
    }

    return String(value);
};

const SettingHistoryDrawer = ({
    open,
    onClose,
    loading,
    entries,
    setting,
    onRevert,
}) => {
    const theme = useTheme();
    const [confirmDialog, setConfirmDialog] = useState({ open: false, entry: null });

    const handleRevertClick = (entry) => {
        setConfirmDialog({ open: true, entry });
    };

    const handleConfirmRevert = () => {
        if (confirmDialog.entry) {
            onRevert(confirmDialog.entry);
        }
        setConfirmDialog({ open: false, entry: null });
    };

    const handleCancelRevert = () => {
        setConfirmDialog({ open: false, entry: null });
    };

    return (
        <>
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', md: 420 },
                    backgroundColor: alpha(theme.palette.background.default, 0.98),
                    backdropFilter: 'blur(18px)',
                    p: 3,
                    borderLeft: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                },
            }}
        >
            <Stack spacing={2} height="100%">
                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Stack spacing={0.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <HistoryIcon color="primary" />
                            <Typography variant="h6" fontWeight={700}>
                                Historial de cambios
                            </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                            {setting
                                ? `Configuración: ${setting.label ?? setting.key}`
                                : 'Selecciona una configuración para ver el historial.'}
                        </Typography>
                    </Stack>

                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Stack>

                <Divider />

                {loading ? (
                    <Stack spacing={1.5}>
                        {[...new Array(4)].map((_, index) => (
                            <Box
                                key={index}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: `1px solid ${alpha(
                                        theme.palette.divider,
                                        0.6,
                                    )}`,
                                    backgroundColor: alpha(
                                        theme.palette.background.paper,
                                        0.6,
                                    ),
                                    minHeight: 92,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '45%',
                                        height: 10,
                                        borderRadius: 999,
                                        backgroundColor: alpha(
                                            theme.palette.text.primary,
                                            0.1,
                                        ),
                                    }}
                                />
                                <Box
                                    sx={{
                                        mt: 1.5,
                                        width: '100%',
                                        height: 48,
                                        borderRadius: 1.5,
                                        backgroundColor: alpha(
                                            theme.palette.text.primary,
                                            0.08,
                                        ),
                                    }}
                                />
                            </Box>
                        ))}
                    </Stack>
                ) : entries.length === 0 ? (
                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            px: 3,
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Aún no hay registros para esta configuración.
                        </Typography>
                    </Box>
                ) : (
                    <List
                        disablePadding
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            pr: 0.5,
                            '&::-webkit-scrollbar': { width: 6 },
                            '&::-webkit-scrollbar-thumb': {
                                borderRadius: 3,
                                background: alpha(
                                    theme.palette.text.secondary,
                                    0.25,
                                ),
                            },
                        }}
                    >
                        {entries.map((entry, index) => (
                            <MotionListItem
                                key={entry.id}
                                alignItems="flex-start"
                                disablePadding
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.22, delay: index * 0.05 }}
                                sx={{ mb: 2 }}
                            >
                                <Box
                                    sx={{
                                        width: '100%',
                                        p: 2,
                                        borderRadius: 2,
                                        border: `1px solid ${alpha(
                                            theme.palette.divider,
                                            0.5,
                                        )}`,
                                        backgroundColor: alpha(
                                            theme.palette.background.paper,
                                            0.8,
                                        ),
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        justifyContent="space-between"
                                        sx={{ mb: 1 }}
                                    >
                                        <Stack spacing={0.5}>
                                            <Typography variant="subtitle2" fontWeight={700}>
                                                {entry.changed_by}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {entry.changed_at}
                                            </Typography>
                                        </Stack>

                                        <Stack direction="row" spacing={0.75}>
                                            <Chip
                                                size="small"
                                                label={entry.ip_address || 'sin IP'}
                                                variant="outlined"
                                                sx={{ borderRadius: 2 }}
                                            />
                                            <Tooltip title="Revertir a este valor">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRevertClick(entry)}
                                                        sx={{
                                                            borderRadius: 2,
                                                            backgroundColor: alpha(
                                                                theme.palette.primary.main,
                                                                0.12,
                                                            ),
                                                            '&:hover': {
                                                                backgroundColor: alpha(
                                                                    theme.palette.primary.main,
                                                                    0.22,
                                                                ),
                                                            },
                                                        }}
                                                    >
                                                        <RestoreIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Stack>
                                    </Stack>

                                    {entry.reason && (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ display: 'block', mb: 1.5 }}
                                        >
                                            Motivo: {entry.reason}
                                        </Typography>
                                    )}

                                    <ListItemText
                                        primary={
                                            <Stack spacing={1.5}>
                                                <Box>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ textTransform: 'uppercase' }}
                                                    >
                                                        Valor anterior
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            mt: 0.75,
                                                            p: 1.25,
                                                            borderRadius: 1.5,
                                                            backgroundColor: alpha(
                                                                theme.palette.error.main,
                                                                0.08,
                                                            ),
                                                            fontFamily:
                                                                '"Fira Code", "Courier New", monospace',
                                                            fontSize: '0.8rem',
                                                            whiteSpace: 'pre-wrap',
                                                        }}
                                                    >
                                                        {formatValue(entry.old_value)}
                                                    </Box>
                                                </Box>
                                                <Box>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ textTransform: 'uppercase' }}
                                                    >
                                                        Nuevo valor
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            mt: 0.75,
                                                            p: 1.25,
                                                            borderRadius: 1.5,
                                                            backgroundColor: alpha(
                                                                theme.palette.success.main,
                                                                0.08,
                                                            ),
                                                            fontFamily:
                                                                '"Fira Code", "Courier New", monospace',
                                                            fontSize: '0.8rem',
                                                            whiteSpace: 'pre-wrap',
                                                        }}
                                                    >
                                                        {formatValue(entry.new_value)}
                                                    </Box>
                                                </Box>
                                            </Stack>
                                        }
                                    />
                                </Box>
                            </MotionListItem>
                        ))}
                    </List>
                )}

                <Divider />

                <Button
                    variant="outlined"
                    onClick={onClose}
                    startIcon={<CloseIcon />}
                >
                    Cerrar
                </Button>
            </Stack>
        </Drawer>

        {/* Confirmation Dialog */}
        <Dialog
            open={confirmDialog.open}
            onClose={handleCancelRevert}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.background.paper, 0.98),
                    backdropFilter: 'blur(18px)',
                },
            }}
        >
            <DialogTitle sx={{ fontWeight: 700 }}>
                Confirmar reversión
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    ¿Estás seguro de que deseas revertir <strong>{setting?.label || 'esta configuración'}</strong> a su valor anterior?
                    <br /><br />
                    Esta acción cambiará el valor actual y se registrará en el historial.
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, pt: 0 }}>
                <Button
                    onClick={handleCancelRevert}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleConfirmRevert}
                    variant="contained"
                    color="primary"
                    startIcon={<RestoreIcon />}
                    sx={{
                        borderRadius: 2,
                        boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                >
                    Revertir
                </Button>
            </DialogActions>
        </Dialog>
        </>
    );
};

export default SettingHistoryDrawer;
