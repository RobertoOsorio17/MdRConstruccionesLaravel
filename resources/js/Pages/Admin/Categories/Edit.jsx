import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';
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
    Category as CategoryIcon,
    Palette as PaletteIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const EditCategory = ({ category, errors: serverErrors }) => {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        color: category.color || '#1976d2',
        is_active: category.is_active ?? true,
        sort_order: category.sort_order || 0,
    });

    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.categories.update', category.slug), {
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
        
        if (!data.slug || data.slug === category.slug) {
            const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setData('slug', slug);
        }
    };

    return (
        <AdminLayoutNew>
            <Head title={`Editar Categoría - ${category.name}`} />

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
                    <Link href={route('admin.categories.index')} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                        <CategoryIcon sx={{ mr: 0.5 }} fontSize="small" />
                        Categorías
                    </Link>
                    <Typography color="text.primary">Editar</Typography>
                </Breadcrumbs>

                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            component={Link}
                            href={route('admin.categories.index')}
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
                                Editar Categoría
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Modificar información de la categoría
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
                            Categoría actualizada exitosamente
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
                                    label="Nombre de la Categoría"
                                    value={data.name}
                                    onChange={handleNameChange}
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CategoryIcon />
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
                            <Grid item xs={12} md={6}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Color de la Categoría
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
                                            sx={{
                                                bgcolor: data.color,
                                                color: '#fff',
                                                fontWeight: 'bold'
                                            }}
                                            icon={<PaletteIcon sx={{ color: '#fff !important' }} />}
                                        />
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Order */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Orden"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    error={!!errors.sort_order}
                                    helperText={errors.sort_order || 'Orden de visualización (menor número = mayor prioridad)'}
                                    inputProps={{ min: 0 }}
                                />
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
                                            <Typography variant="body1">Categoría Activa</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Las categorías inactivas no se mostrarán en el sitio público
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
                                        href={route('admin.categories.index')}
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
        </AdminLayoutNew>
    );
};

export default EditCategory;

