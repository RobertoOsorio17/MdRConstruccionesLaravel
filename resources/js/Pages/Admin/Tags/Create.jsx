import React from 'react';
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
    LocalOffer as TagIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const CreateTag = () => {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        color: '#4caf50',
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.tags.store'), {
            preserveScroll: true,
        });
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setData('name', name);
        
        if (!data.slug) {
            const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setData('slug', slug);
        }
    };

    return (
        <AdminLayout>
            <Head title="Crear Etiqueta" />

            <Box sx={{ p: 3 }}>
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
                    <Typography color="text.primary">Crear Nueva</Typography>
                </Breadcrumbs>

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
                                Crear Nueva Etiqueta
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Agregar una nueva etiqueta al sistema
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Paper
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    sx={{ p: 4 }}
                >
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
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
                                        {processing ? 'Creando...' : 'Crear Etiqueta'}
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

export default CreateTag;

