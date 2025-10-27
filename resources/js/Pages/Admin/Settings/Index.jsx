import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Alert,
    Box,
    Container,
    Drawer,
    Snackbar,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
    SearchOffRounded as SearchOffIcon,
    TuneRounded as TuneIcon,
} from '@mui/icons-material';
import SettingsHero from './Components/SettingsHero';
import SettingsSidebar from './Components/SettingsSidebar';
import SettingField from './Components/SettingField';
import SettingPreview from './Components/SettingPreview';
import MaintenanceModePanel from './Components/MaintenanceModePanel';
import SettingHistoryDrawer from './Components/SettingHistoryDrawer';
import SettingsSkeleton from './Components/SettingsSkeleton';
import { SettingsProvider, useSettings } from './Components/SettingsContext';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';

const MotionPaper = motion(Box);

const SettingsScreen = () => {
    const theme = useTheme();
    const mdUp = useMediaQuery(theme.breakpoints.up('md'));
    const { props } = usePage();
    const { flash } = props;

    const {
        state,
        groupData,
        dirtyPayload,
        maintenanceValues,
        dirtyCount,
        hasUnsavedChanges,
        setActiveGroup,
        setSearch,
        setSidebarOpen,
        setPreviewOpen,
        setMaintenanceOpen,
        setSaving,
        setSaveStatus,
        setErrors,
        updateValue,
        resetAll,
        resetGroup,
        resetSetting,
        commitChanges,
    } = useSettings();

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info',
    });

    const [historyState, setHistoryState] = useState({
        open: false,
        loading: false,
        entries: [],
        setting: null,
    });
    const [importing, setImporting] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const fileInputRef = useRef(null);

    // Initial loading - no artificial delay
    useEffect(() => {
        setIsInitialLoading(false);
    }, []);

    const totalSettings = useMemo(
        () =>
            groupData.sidebarGroups.reduce(
                (accumulator, group) =>
                    accumulator + (group.totalSettings ?? 0),
                0,
            ),
        [groupData.sidebarGroups],
    );

    const flatSettings = useMemo(
        () =>
            groupData.sidebarGroups.flatMap((group) => group.settings ?? []),
        [groupData.sidebarGroups],
    );

    const activeGroupData = useMemo(() => {
        if (groupData.searchActive) {
            return null;
        }

        return (
            groupData.contentGroups.find(
                (group) => group.key === state.activeGroup,
            ) ?? groupData.contentGroups[0]
        );
    }, [groupData.contentGroups, groupData.searchActive, state.activeGroup]);

    const visibleGroups = useMemo(() => {
        if (groupData.searchActive) {
            return groupData.contentGroups;
        }

        return activeGroupData ? [activeGroupData] : [];
    }, [groupData.contentGroups, groupData.searchActive, activeGroupData]);

    const showEmptyState = visibleGroups.length === 0;

    useEffect(() => {
        if (flash?.success) {
            setSnackbar({
                open: true,
                message: flash.success,
                severity: 'success',
            });
        } else if (flash?.error) {
            setSnackbar({
                open: true,
                message: flash.error,
                severity: 'error',
            });
        }
    }, [flash]);

    const handleExport = useCallback(() => {
        window.location.href = '/admin/settings/export';
    }, []);

    const handleImportPrompt = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleImportChange = useCallback(
        (event) => {
            const file = event.target.files?.[0];

            if (!file) {
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            setImporting(true);

            router.post('/admin/settings/import', formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setSnackbar({
                        open: true,
                        message: 'Archivo importado correctamente.',
                        severity: 'success',
                    });
                    setErrors({});
                    router.reload({
                        only: ['settings', 'flash'],
                        preserveScroll: true,
                    });
                },
                onError: (errors) => {
                    setErrors(errors);
                    setSnackbar({
                        open: true,
                        message:
                            errors?.file ||
                            'No fue posible importar el archivo. Verifica el formato.',
                        severity: 'error',
                    });
                },
                onFinish: () => {
                    setImporting(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                },
            });
        },
        [router, setErrors],
    );

    const loadHistory = useCallback(
        async (setting) => {
            if (!setting?.key) {
                return;
            }

            setHistoryState({
                open: true,
                loading: true,
                entries: [],
                setting,
            });

            try {
                const response = await fetch(
                    `/admin/settings/history/${setting.key}`,
                    {
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        credentials: 'same-origin',
                    },
                );

                if (!response.ok) {
                    throw new Error('Request failed');
                }

                const data = await response.json();

                setHistoryState({
                    open: true,
                    loading: false,
                    entries: data.history ?? [],
                    setting: {
                        ...setting,
                        ...(data.setting ?? {}),
                    },
                });
            } catch (error) {
                setHistoryState((current) => ({
                    ...current,
                    loading: false,
                }));

                setSnackbar({
                    open: true,
                    message: 'No se pudo cargar el historial.',
                    severity: 'error',
                });
            }
        },
        [setSnackbar],
    );

    const handleHistoryClose = useCallback(() => {
        setHistoryState((current) => ({
            ...current,
            open: false,
        }));
    }, []);

    const handleHistoryRevert = useCallback(
        (entry) => {
            if (!historyState.setting) {
                return;
            }

            setSaving(true);
            setSaveStatus('saving');
            setHistoryState((current) => ({
                ...current,
                loading: true,
            }));

            router.post(
                `/admin/settings/revert/${historyState.setting.key}`,
                { history_id: entry.id },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                    setSnackbar({
                        open: true,
                        message: 'Configuración revertida correctamente.',
                        severity: 'success',
                    });
                        setSaveStatus('success');
                        router.reload({
                            only: ['settings', 'flash'],
                            preserveScroll: true,
                            onSuccess: () => {
                                loadHistory(historyState.setting);
                            },
                        });
                    },
                    onError: (errors) => {
                        setErrors(errors);
                        setSaveStatus('error');
                        setSnackbar({
                            open: true,
                            message:
                                errors?.error ||
                                'No se pudo revertir la configuración.',
                            severity: 'error',
                        });
                        setHistoryState((current) => ({
                            ...current,
                            loading: false,
                        }));
                    },
                    onFinish: () => {
                        setSaving(false);
                    },
                },
            );
        },
        [
            historyState.setting,
            loadHistory,
            setErrors,
            setSaveStatus,
            setSaving,
            setSnackbar,
        ],
    );

    const handleSave = useCallback(() => {
        if (!hasUnsavedChanges) {
            return;
        }

        setSaving(true);
        setSaveStatus('saving');

        router.post(
            '/admin/settings',
            {
                settings: dirtyPayload,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    commitChanges();
                    setSnackbar({
                        open: true,
                        message: 'Configuraciones actualizadas correctamente.',
                        severity: 'success',
                    });
                    setPreviewOpen(false);
                    setSaveStatus('success');
                    setErrors({});
                },
                onError: (errors) => {
                    setErrors(errors);
                    setSaveStatus('error');
                    setSnackbar({
                        open: true,
                        message: 'Revisa los campos resaltados antes de guardar.',
                        severity: 'error',
                    });
                },
                onFinish: () => {
                    setSaving(false);
                },
            },
        );
    }, [
        commitChanges,
        dirtyPayload,
        hasUnsavedChanges,
        setErrors,
        setPreviewOpen,
        setSaveStatus,
        setSaving,
    ]);

    const handleResetSetting = useCallback(
        (setting) => {
            if (!setting?.key) {
                return;
            }

            resetSetting(setting.key);
        },
        [resetSetting],
    );

    const handleResetAll = useCallback(() => {
        if (!confirm('¿Estás seguro de que deseas restablecer TODAS las configuraciones a sus valores por defecto? Esta acción no se puede deshacer.')) {
            return;
        }

        setSaving(true);
        setSaveStatus('saving');

        router.post(
            '/admin/settings/reset-all',
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Reset local state
                    resetAll();
                    setSnackbar({
                        open: true,
                        message: 'Todas las configuraciones han sido restablecidas a sus valores por defecto.',
                        severity: 'success',
                    });
                    setSaveStatus('success');
                },
                onError: (errors) => {
                    setErrors(errors);
                    setSaveStatus('error');
                    setSnackbar({
                        open: true,
                        message: 'Error al restablecer las configuraciones.',
                        severity: 'error',
                    });
                },
                onFinish: () => {
                    setSaving(false);
                },
            },
        );
    }, [resetAll, setErrors, setSaveStatus, setSaving, setSnackbar]);

    // Show skeleton loader during initial load
    if (isInitialLoading) {
        return <SettingsSkeleton />;
    }

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
            <input
                type="file"
                hidden
                accept="application/json"
                ref={fileInputRef}
                onChange={handleImportChange}
            />
            <Stack spacing={{ xs: 3, md: 4 }}>
                <SettingsHero
                    dirtyCount={dirtyCount}
                    totalSettings={totalSettings}
                    hasUnsavedChanges={hasUnsavedChanges}
                    maintenanceEnabled={Boolean(state.values.maintenance_mode)}
                    saveStatus={state.saveStatus}
                    lastSavedAt={state.lastSavedAt}
                    isSaving={state.isSaving}
                    importInProgress={importing}
                    onSave={handleSave}
                    onPreview={() => setPreviewOpen(true)}
                    onResetAll={handleResetAll}
                    onOpenMaintenance={() => setMaintenanceOpen(true)}
                    onToggleSidebar={() => setSidebarOpen(true)}
                    onExport={handleExport}
                    onImport={handleImportPrompt}
                />

                <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'minmax(260px,3.2fr) minmax(0,9.8fr)' } }}>
                    <Box sx={{ position: { md: 'sticky' }, top: { md: 24 }, alignSelf: 'start' }}>
                        {mdUp ? (
                            <SettingsSidebar
                                groups={groupData.sidebarGroups}
                                activeGroup={state.activeGroup}
                                searchTerm={state.search}
                                onSelectGroup={setActiveGroup}
                                onSearchChange={setSearch}
                                onResetGroup={resetGroup}
                            />
                        ) : (
                            <Drawer
                                anchor="left"
                                open={state.sidebarOpen}
                                onClose={() => setSidebarOpen(false)}
                                ModalProps={{ keepMounted: true }}
                            >
                                <Box
                                    sx={{
                                        width: 320,
                                        p: 2,
                                        background: alpha(
                                            theme.palette.background.default,
                                            0.96,
                                        ),
                                        minHeight: '100%',
                                    }}
                                >
                                    <SettingsSidebar
                                        groups={groupData.sidebarGroups}
                                        activeGroup={state.activeGroup}
                                        searchTerm={state.search}
                                        onSelectGroup={setActiveGroup}
                                        onSearchChange={setSearch}
                                        onResetGroup={resetGroup}
                                    />
                                </Box>
                            </Drawer>
                        )}
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                        {showEmptyState ? (
                            <MotionPaper
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                sx={{
                                    p: { xs: 4, md: 6 },
                                    borderRadius: 3,
                                    border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
                                    backgroundColor: alpha(theme.palette.background.paper, 0.6),
                                    textAlign: 'center',
                                    backdropFilter: 'blur(8px)',
                                }}
                            >
                                <Stack spacing={3} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: `linear-gradient(135deg, ${alpha(
                                                theme.palette.primary.main,
                                                0.1,
                                            )}, ${alpha(theme.palette.primary.light, 0.05)})`,
                                            border: `2px dashed ${alpha(
                                                theme.palette.primary.main,
                                                0.3,
                                            )}`,
                                        }}
                                    >
                                        <SearchOffIcon
                                            sx={{
                                                fontSize: 64,
                                                color: alpha(theme.palette.primary.main, 0.6),
                                            }}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" gutterBottom fontWeight={600}>
                                            No encontramos coincidencias
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ maxWidth: 400, mx: 'auto' }}
                                        >
                                            Ajusta el término de búsqueda o selecciona otro
                                            grupo para continuar editando las configuraciones.
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            px: 2,
                                            py: 1,
                                            borderRadius: 2,
                                            backgroundColor: alpha(
                                                theme.palette.info.main,
                                                0.08,
                                            ),
                                            border: `1px solid ${alpha(
                                                theme.palette.info.main,
                                                0.2,
                                            )}`,
                                        }}
                                    >
                                        <TuneIcon
                                            fontSize="small"
                                            sx={{ color: 'info.main' }}
                                        />
                                        <Typography variant="caption" color="info.main">
                                            Usa el buscador o navega por las categorías
                                        </Typography>
                                    </Box>
                                </Stack>
                            </MotionPaper>
                        ) : (
                            <Stack spacing={3}>
                                {visibleGroups.map((group) => (
                                    <MotionPaper
                                        key={group.key}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                        sx={{
                                            p: { xs: 2.5, md: 3 },
                                            borderRadius: 3,
                                            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                                            backgroundColor: alpha(theme.palette.background.paper, 0.6),
                                            backdropFilter: 'blur(10px)',
                                            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
                                        }}
                                    >
                                        <Stack spacing={2}>
                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                                                spacing={1.5}
                                            >
                                                <Box>
                                                    <Typography variant="h6" fontWeight={700}>
                                                        {group.label}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ maxWidth: 520 }}
                                                    >
                                                        {group.description}
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {group.visibleSettings.length} ajustes
                                                </Typography>
                                            </Stack>

                                            <Stack spacing={2.5}>
                                                {group.visibleSettings.map((setting) => (
                                                    <SettingField
                                                        key={setting.key}
                                                        setting={setting}
                                                        value={setting.value}
                                                        onChange={updateValue}
                                                        error={setting.error}
                                                        disabled={state.isSaving}
                                                        onOpenHistory={loadHistory}
                                                        onReset={handleResetSetting}
                                                    />
                                                ))}
                                            </Stack>
                                        </Stack>
                                    </MotionPaper>
                                ))}
                            </Stack>
                        )}
                    </Box>
                </Box>
            </Stack>

            <Drawer
                anchor="right"
                open={state.maintenanceOpen}
                onClose={() => setMaintenanceOpen(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', md: 420 },
                        p: 3,
                        backgroundColor: alpha(
                            theme.palette.background.default,
                            0.97,
                        ),
                        backdropFilter: 'blur(14px)',
                    },
                }}
            >
                <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700}>
                        Modo mantenimiento
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Ajusta la disponibilidad del sitio, programa ventanas de
                        mantenimiento y gestiona la lista de IPs permitidas.
                    </Typography>
                    <MaintenanceModePanel
                        values={maintenanceValues}
                        onChange={updateValue}
                    />
                </Stack>
            </Drawer>

            <SettingPreview
                open={state.previewOpen}
                onClose={() => setPreviewOpen(false)}
                onConfirm={handleSave}
                changes={dirtyPayload}
                settings={flatSettings}
            />

            <SettingHistoryDrawer
                open={historyState.open}
                onClose={handleHistoryClose}
                loading={historyState.loading}
                entries={historyState.entries}
                setting={historyState.setting}
                onRevert={handleHistoryRevert}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() =>
                        setSnackbar((current) => ({ ...current, open: false }))
                    }
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

const SettingsPage = () => {
    const { props } = usePage();
    const { settings, groups } = props;

    return (
        <AdminLayoutNew>
            <Head title="Panel de Configuración" />
            <SettingsProvider settings={settings} groups={groups}>
                <SettingsScreen />
            </SettingsProvider>
        </AdminLayoutNew>
    );
};

export default SettingsPage;
