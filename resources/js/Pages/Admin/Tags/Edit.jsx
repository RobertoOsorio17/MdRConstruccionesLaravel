import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Switch,
    FormControlLabel,
    Alert,
    Breadcrumbs,
    IconButton,
    InputAdornment,
    Chip
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    NavigateNext as NavigateNextIcon,
    Home as HomeIcon,
    LocalOffer as TagIcon,
    Palette as PaletteIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const EditTag = ({ tag, errors: serverErrors }) => {
    const { data, setData, put, processing, errors } = useForm({
        name: tag.name || '',
        slug: tag.slug || '',
        description: tag.description || '',
        color: tag.color || '#4caf50',
        is_active: tag.is_active ?? true,
    });

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.tags.update', tag.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            },
        });
    };

    // Auto-generate slug from name
    const handleNameChange = (e) => {
        const name = e.target.value;
        setData('name', name);
        
        if (!data.slug || data.slug === tag.slug) {
            const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setData('slug', slug);
        }
    };

    return (
        <AdminLayout>
            <Head title={`Editar Etiqueta - ${tag.name}`} />

            <Box sx={{ p: 3 }}>
                {/* Breadcrumbs */}
                <Breadcrumbs 
                    separator={<NavigateNextIcon fontSize="small" />}
                    sx={{ mb: 3 }}
                >
                    <Link href={route('admin.dashboard')} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                        <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                        Dashboard
                    </Link>
                    <Link href={route('admin.tags.index')} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                        <TagIcon sx={{ mr: 0.5 }} fontSize="small" />
                        Etiquetas
                    </Link>
                    <Typography color="text.primary">Editar</Typography>
                </Breadcrumbs>

                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            component={Link}
                            href={route('admin.tags.index')}
                            sx={{
                                bgcolor: 'background.paper',
                                boxShadow: 1,
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                Editar Etiqueta
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Modificar información de la etiqueta
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Success Alert */}
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Etiqueta actualizada exitosamente
                        </Alert>
                    </motion.div>
                )}

                {/* Form */}
                <Paper
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    sx={{ p: 4 }}
                >
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            {/* Name */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Nombre de la Etiqueta"
                                    value={data.name}
                                    onChange={handleNameChange}
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <TagIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {/* Slug */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Slug (URL amigable)"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    error={!!errors.slug}
                                    helperText={errors.slug || 'Se genera automáticamente del nombre'}
                                    required
                                />
                            </Grid>

                            {/* Description */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Descripción"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    error={!!errors.description}
                                    helperText={errors.description}
                                    multiline
                                    rows={4}
                                />
                            </Grid>

                            {/* Color */}
                            <Grid item xs={12}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Color de la Etiqueta
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <TextField
                                            type="color"
                                            value={data.color}
                                            onChange={(e) => setData('color', e.target.value)}
                                            sx={{ width: 100 }}
                                        />
                                        <Chip
                                            label={data.name || 'Vista Previa'}
                                            size="small"
                                            sx={{
                                                bgcolor: data.color,
                                                color: '#fff',
                                                fontWeight: 'bold'
                                            }}
                                            icon={<TagIcon sx={{ color: '#fff !important' }} />}
                                        />
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Active Status */}
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1">Etiqueta Activa</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Las etiquetas inactivas no se mostrarán en el sitio público
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </Grid>

                            {/* Actions */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button
                                        component={Link}
                                        href={route('admin.tags.index')}
                                        variant="outlined"
                                        disabled={processing}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        disabled={processing}
                                    >
                                        {processing ? 'Guardando...' : 'Guardar Cambios'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>
        </AdminLayout>
    );
};

export default EditTag;

