import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Box,
    Tabs,
    Tab,
    TextField,
    Switch,
    FormControlLabel,
    Button,
    Alert,
    Divider,
    Stack,
    Chip,
    IconButton,
    Tooltip,
    Grid,
    Paper,
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Business as BusinessIcon,
    Email as EmailIcon,
    Security as SecurityIcon,
    Api as ApiIcon,
    Share as ShareIcon,
    Search as SearchIcon,
    Build as BuildIcon,
    Save as SaveIcon,
    Refresh as RefreshIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const iconMap = {
    settings: SettingsIcon,
    business: BusinessIcon,
    email: EmailIcon,
    security: SecurityIcon,
    api: ApiIcon,
    share: ShareIcon,
    search: SearchIcon,
    build: BuildIcon,
};

const Settings = ({ settings, groups }) => {
    const [currentTab, setCurrentTab] = useState(0);
    const groupKeys = Object.keys(groups);
    const currentGroup = groupKeys[currentTab];
    
    const { data, setData, post, processing, errors, reset } = useForm({
        settings: {}
    });

    // Initialize form data with current settings
    React.useEffect(() => {
        const initialData = {};
        Object.values(settings).flat().forEach(setting => {
            initialData[setting.key] = setting.value;
        });
        setData('settings', initialData);
    }, [settings]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/settings', {
            preserveScroll: true,
            onSuccess: () => {
                // Settings updated successfully
            }
        });
    };

    const handleSettingChange = (key, value) => {
        setData('settings', {
            ...data.settings,
            [key]: value
        });
    };

    const renderSettingField = (setting) => {
        const value = data.settings[setting.key] || setting.value;
        const error = errors[`settings.${setting.key}`] || errors[setting.key];

        switch (setting.type) {
            case 'boolean':
                return (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={Boolean(value)}
                                onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: 'primary.main',
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: 'primary.main',
                                    },
                                }}
                            />
                        }
                        label={setting.label}
                        sx={{ mb: 2 }}
                    />
                );

            case 'text':
                return (
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label={setting.label}
                        value={value || ''}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        error={!!error}
                        helperText={error || setting.description}
                        sx={{ mb: 2 }}
                    />
                );

            case 'email':
                return (
                    <TextField
                        fullWidth
                        type="email"
                        label={setting.label}
                        value={value || ''}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        error={!!error}
                        helperText={error || setting.description}
                        sx={{ mb: 2 }}
                    />
                );

            case 'integer':
            case 'number':
                return (
                    <TextField
                        fullWidth
                        type="number"
                        label={setting.label}
                        value={value || ''}
                        onChange={(e) => handleSettingChange(setting.key, parseInt(e.target.value) || 0)}
                        error={!!error}
                        helperText={error || setting.description}
                        sx={{ mb: 2 }}
                    />
                );

            default:
                return (
                    <TextField
                        fullWidth
                        label={setting.label}
                        value={value || ''}
                        onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                        error={!!error}
                        helperText={error || setting.description}
                        sx={{ mb: 2 }}
                    />
                );
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return (
        <AdminLayout>
            <Head title="Configuración del Sistema" />
            
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants}>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Configuración del Sistema
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Gestiona las configuraciones generales del sitio web y la aplicación
                            </Typography>
                        </Box>
                    </motion.div>

                    {/* Settings Form */}
                    <motion.div variants={itemVariants}>
                        <Card
                            sx={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: 3,
                            }}
                        >
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs
                                    value={currentTab}
                                    onChange={(e, newValue) => setCurrentTab(newValue)}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    sx={{
                                        '& .MuiTab-root': {
                                            minHeight: 72,
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            fontWeight: 500,
                                        },
                                        '& .Mui-selected': {
                                            color: 'primary.main',
                                        },
                                    }}
                                >
                                    {groupKeys.map((groupKey) => {
                                        const group = groups[groupKey];
                                        const IconComponent = iconMap[group.icon] || SettingsIcon;
                                        
                                        return (
                                            <Tab
                                                key={groupKey}
                                                label={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <IconComponent sx={{ fontSize: 20 }} />
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {group.label}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {settings[groupKey]?.length || 0} configuraciones
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                        );
                                    })}
                                </Tabs>
                            </Box>

                            <CardContent sx={{ p: 4 }}>
                                <form onSubmit={handleSubmit}>
                                    {/* Group Header */}
                                    <Box sx={{ mb: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            {React.createElement(iconMap[groups[currentGroup]?.icon] || SettingsIcon, {
                                                sx: { fontSize: 32, color: 'primary.main' }
                                            })}
                                            <Box>
                                                <Typography variant="h5" fontWeight="bold">
                                                    {groups[currentGroup]?.label}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {groups[currentGroup]?.description}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Divider />
                                    </Box>

                                    {/* Settings Fields */}
                                    <Grid container spacing={3}>
                                        {settings[currentGroup]?.map((setting) => (
                                            <Grid item xs={12} md={6} key={setting.key}>
                                                <Paper
                                                    sx={{
                                                        p: 3,
                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                        backdropFilter: 'blur(10px)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: 2,
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                        <Typography variant="h6" fontWeight="bold">
                                                            {setting.label}
                                                        </Typography>
                                                        {setting.is_public && (
                                                            <Chip
                                                                label="Público"
                                                                size="small"
                                                                color="success"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                        {setting.is_encrypted && (
                                                            <Chip
                                                                label="Encriptado"
                                                                size="small"
                                                                color="warning"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Box>
                                                    {renderSettingField(setting)}
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>

                                    {/* No Settings Message */}
                                    {(!settings[currentGroup] || settings[currentGroup].length === 0) && (
                                        <Box sx={{ textAlign: 'center', py: 8 }}>
                                            <InfoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                                No hay configuraciones disponibles
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                                Inicializa las configuraciones por defecto para comenzar
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                startIcon={<SettingsIcon />}
                                                onClick={() => {
                                                    post('/admin/settings/initialize', {
                                                        preserveScroll: true,
                                                        onSuccess: () => window.location.reload()
                                                    });
                                                }}
                                                disabled={processing}
                                                sx={{
                                                    background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
                                                    boxShadow: '0 3px 5px 2px rgba(255, 107, 107, .3)',
                                                }}
                                            >
                                                Inicializar Configuraciones
                                            </Button>
                                        </Box>
                                    )}

                                    {/* Action Buttons */}
                                    {settings[currentGroup] && settings[currentGroup].length > 0 && (
                                        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                            <Button
                                                type="button"
                                                variant="outlined"
                                                startIcon={<RefreshIcon />}
                                                onClick={() => reset()}
                                                disabled={processing}
                                            >
                                                Restablecer
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                startIcon={<SaveIcon />}
                                                disabled={processing}
                                                sx={{
                                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                                }}
                                            >
                                                {processing ? 'Guardando...' : 'Guardar Configuración'}
                                            </Button>
                                        </Box>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </Container>
        </AdminLayout>
    );
};

export default Settings;
