import React, { useState } from 'react';
import {
    alpha,
    Box,
    Button,
    Chip,
    IconButton,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    Menu as MenuIcon,
    SaveRounded as SaveIcon,
    VisibilityRounded as VisibilityIcon,
    RestoreRounded as RestoreIcon,
    BuildRounded as BuildIcon,
    CloudUploadRounded as UploadIcon,
    DownloadRounded as DownloadIcon,
    MoreVertRounded as MoreVertIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Box);

const statusColor = (theme, saveStatus) => {
    switch (saveStatus) {
        case 'success':
            return theme.palette.success.main;
        case 'error':
            return theme.palette.error.main;
        case 'saving':
            return theme.palette.info.main;
        default:
            return theme.palette.text.secondary;
    }
};

const formatTimestamp = (isoString) => {
    if (!isoString) {
        return 'Nunca';
    }

    try {
        const formatter = new Intl.DateTimeFormat('es-ES', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });

        return formatter.format(new Date(isoString));
    } catch (error) {
        return 'Reciente';
    }
};

const noop = () => {};

const SettingsHero = ({
    dirtyCount,
    totalSettings,
    hasUnsavedChanges,
    maintenanceEnabled,
    saveStatus,
    lastSavedAt,
    isSaving,
    importInProgress = false,
    onSave,
    onPreview,
    onResetAll,
    onOpenMaintenance,
    onToggleSidebar = noop,
    onExport = noop,
    onImport = noop,
}) => {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('md'));
    const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);
    const moreMenuOpen = Boolean(moreMenuAnchor);

    const handleMoreMenuOpen = (event) => {
        setMoreMenuAnchor(event.currentTarget);
    };

    const handleMoreMenuClose = () => {
        setMoreMenuAnchor(null);
    };

    const handleMenuAction = (action) => {
        handleMoreMenuClose();
        action();
    };

    return (
        <MotionPaper
            component="section"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            sx={{
                position: 'relative',
                p: { xs: 2.5, md: 3 },
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.background.paper, 0.85),
                border: `1px solid ${alpha(theme.palette.divider, 0.16)}`,
                boxShadow: `0 12px 28px ${alpha(theme.palette.common.black, 0.1)}`,
                backdropFilter: 'blur(8px)',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    background: `radial-gradient(circle at top right, ${alpha(
                        theme.palette.primary.light,
                        0.12,
                    )}, transparent 55%)`,
                }}
            />

            <Stack spacing={{ xs: 3, md: 4 }} position="relative">
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                    <Stack spacing={1}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            {isSmall && (
                                <IconButton
                                    onClick={onToggleSidebar}
                                    color="inherit"
                                    sx={{
                                        backgroundColor: alpha(theme.palette.text.primary, 0.06),
                                        '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.1) },
                                    }}
                                >
                                    <MenuIcon />
                                </IconButton>
                            )}
                            <Typography
                                variant="h4"
                                fontWeight={700}
                                sx={{ color: 'text.primary' }}
                            >
                                Panel de Configuración
                            </Typography>
                        </Stack>
                        <Typography
                            variant="body1"
                            sx={{
                                maxWidth: 520,
                                color: 'text.secondary',
                            }}
                        >
                            Gestiona de forma elegante cada parámetro del sistema.
                            Organiza, revisa y publica cambios con una experiencia
                            premium y control total.
                        </Typography>
                    </Stack>

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                    >
                        <Button
                            onClick={onSave}
                            variant="contained"
                            startIcon={<SaveIcon />}
                            disabled={!hasUnsavedChanges || isSaving}
                            sx={{
                                minWidth: 160,
                            }}
                        >
                            {isSaving ? 'Guardando...' : 'Guardar cambios'}
                        </Button>

                        <Tooltip title="Más opciones" arrow>
                            <IconButton
                                onClick={handleMoreMenuOpen}
                                aria-label="Más opciones"
                                sx={{
                                    backgroundColor: alpha(theme.palette.text.primary, 0.06),
                                    color: 'text.primary',
                                    '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.1) },
                                }}
                            >
                                <MoreVertIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>

                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                >
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        sx={{ flexWrap: 'wrap', gap: 1.5 }}
                    >
                        <Chip
                            label={`Pendientes: ${dirtyCount}`}
                            color={dirtyCount > 0 ? 'warning' : 'default'}
                            variant="filled"
                            sx={{
                                borderRadius: 2,
                                fontWeight: 600,
                                backgroundColor: alpha(theme.palette.warning.main, 0.12),
                                border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                                color: theme.palette.warning.main,
                            }}
                        />
                        <Chip
                            label={`Totales: ${totalSettings}`}
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                borderColor: alpha(theme.palette.divider, 0.3),
                                color: 'text.secondary',
                                fontWeight: 600,
                            }}
                        />
                        <Chip
                            label={
                                maintenanceEnabled
                                    ? 'Mantenimiento activo'
                                    : 'Mantenimiento inactivo'
                            }
                            icon={<BuildIcon sx={{ color: 'inherit' }} />}
                            onClick={onOpenMaintenance}
                            sx={{
                                borderRadius: 2,
                                fontWeight: 600,
                                cursor: 'pointer',
                                color: maintenanceEnabled ? theme.palette.error.main : theme.palette.success.main,
                                backgroundColor: alpha(maintenanceEnabled ? theme.palette.error.main : theme.palette.success.main, 0.12),
                                border: `1px solid ${alpha(maintenanceEnabled ? theme.palette.error.main : theme.palette.success.main, 0.3)}`,
                                '&:hover': {
                                    backgroundColor: alpha(maintenanceEnabled ? theme.palette.error.main : theme.palette.success.main, 0.18),
                                },
                            }}
                        />
                    </Stack>

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        sx={{ flexWrap: 'wrap', gap: 2 }}
                    >
                        <Box>
                            <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary' }}
                            >
                                Último guardado
                            </Typography>
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ color: 'text.primary' }}
                            >
                                {formatTimestamp(lastSavedAt)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary' }}
                            >
                                Estado
                            </Typography>
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ color: statusColor(theme, saveStatus) }}
                            >
                                {saveStatus === 'success'
                                    ? 'Cambios sincronizados'
                                    : saveStatus === 'error'
                                    ? 'Error al guardar'
                                    : saveStatus === 'saving'
                                    ? 'Guardando...'
                                    : hasUnsavedChanges
                                    ? 'Cambios sin guardar'
                                    : 'Sin novedades'}
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>

                {/* Menu desplegable para acciones secundarias */}
                <Menu
                    anchorEl={moreMenuAnchor}
                    open={moreMenuOpen}
                    onClose={handleMoreMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    PaperProps={{
                        sx: {
                            mt: 1,
                            borderRadius: 2,
                            minWidth: 220,
                            backgroundColor: alpha(theme.palette.background.paper, 0.95),
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
                        },
                    }}
                >
                    <MenuItem
                        onClick={() => handleMenuAction(onOpenMaintenance)}
                        sx={{
                            borderRadius: 1.5,
                            mx: 1,
                            my: 0.5,
                        }}
                    >
                        <ListItemIcon>
                            <BuildIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Modo Mantenimiento</ListItemText>
                    </MenuItem>
                    <MenuItem
                        onClick={() => handleMenuAction(onResetAll)}
                        disabled={isSaving || importInProgress}
                        sx={{
                            borderRadius: 1.5,
                            mx: 1,
                            my: 0.5,
                        }}
                    >
                        <ListItemIcon>
                            <RestoreIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Restablecer Todo</ListItemText>
                    </MenuItem>
                    <Divider sx={{ my: 1 }} />
                    <MenuItem
                        onClick={() => handleMenuAction(onPreview)}
                        disabled={!hasUnsavedChanges || isSaving || importInProgress}
                        sx={{
                            borderRadius: 1.5,
                            mx: 1,
                            my: 0.5,
                        }}
                    >
                        <ListItemIcon>
                            <VisibilityIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Vista Previa de Cambios</ListItemText>
                    </MenuItem>
                    <Divider sx={{ my: 1 }} />
                    <MenuItem
                        onClick={() => handleMenuAction(onImport)}
                        disabled={isSaving || importInProgress}
                        sx={{
                            borderRadius: 1.5,
                            mx: 1,
                            my: 0.5,
                        }}
                    >
                        <ListItemIcon>
                            <UploadIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>
                            {importInProgress ? 'Importando...' : 'Importar Configuración'}
                        </ListItemText>
                    </MenuItem>
                    <MenuItem
                        onClick={() => handleMenuAction(onExport)}
                        sx={{
                            borderRadius: 1.5,
                            mx: 1,
                            my: 0.5,
                        }}
                    >
                        <ListItemIcon>
                            <DownloadIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Exportar Configuración</ListItemText>
                    </MenuItem>
                </Menu>
            </Stack>
        </MotionPaper>
    );
};

export default SettingsHero;
