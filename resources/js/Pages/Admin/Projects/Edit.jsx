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
    MenuItem,
    Breadcrumbs,
    IconButton,
    InputAdornment,
    Alert
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    NavigateNext as NavigateNextIcon,
    Home as HomeIcon,
    Work as ProjectIcon,
    LocationOn as LocationIcon,
    Euro as EuroIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const EditProject = ({ project }) => {
    const { data, setData, put, processing, errors } = useForm({
        title: project.title || '',
        slug: project.slug || '',
        summary: project.summary || '',
        description: project.description || '',
        client: project.client || '',
        location: project.location || '',
        budget_estimate: project.budget_estimate || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        status: project.status || 'planning',
        featured: project.featured || false,
        is_active: project.is_active ?? true,
    });

    const [showSuccess, setShowSuccess] = useState(false);

    const statusOptions = [
        { value: 'planning', label: 'Planificación' },
        { value: 'in_progress', label: 'En Progreso' },
        { value: 'completed', label: 'Completado' },
        { value: 'on_hold', label: 'En Espera' },
        { value: 'cancelled', label: 'Cancelado' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.projects.update', project.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            },
        });
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setData('title', title);
        
        if (!data.slug || data.slug === project.slug) {
            const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setData('slug', slug);
        }
    };

    return (
        <AdminLayout>
            <Head title={`Editar Proyecto - ${project.title}`} />

            <Box sx={{ p: 3 }}>
                <Breadcrumbs 
                    separator={<NavigateNextIcon fontSize="small" />}
                    sx={{ mb: 3 }}
                >
                    <Link href={route('admin.dashboard')} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                        <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                        Dashboard
                    </Link>
                    <Link href={route('admin.projects.index')} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                        <ProjectIcon sx={{ mr: 0.5 }} fontSize="small" />
                        Proyectos
                    </Link>
                    <Typography color="text.primary">Editar</Typography>
                </Breadcrumbs>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            component={Link}
                            href={route('admin.projects.index')}
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
                                Editar Proyecto
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Modificar información del proyecto
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Proyecto actualizado exitosamente
                        </Alert>
                    </motion.div>
                )}

                <Paper
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    sx={{ p: 4 }}
                >
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth
                                    label="Título del Proyecto"
                                    value={data.title}
                                    onChange={handleTitleChange}
                                    error={!!errors.title}
                                    helperText={errors.title}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <ProjectIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Estado"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    error={!!errors.status}
                                    helperText={errors.status}
                                    required
                                >
                                    {statusOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Slug (URL amigable)"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    error={!!errors.slug}
                                    helperText={errors.slug}
                                    required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Resumen"
                                    value={data.summary}
                                    onChange={(e) => setData('summary', e.target.value)}
                                    error={!!errors.summary}
                                    helperText={errors.summary}
                                    multiline
                                    rows={2}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Descripción Completa"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    error={!!errors.description}
                                    helperText={errors.description}
                                    multiline
                                    rows={6}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Cliente"
                                    value={data.client}
                                    onChange={(e) => setData('client', e.target.value)}
                                    error={!!errors.client}
                                    helperText={errors.client}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Ubicación"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    error={!!errors.location}
                                    helperText={errors.location}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Presupuesto Estimado"
                                    value={data.budget_estimate}
                                    onChange={(e) => setData('budget_estimate', e.target.value)}
                                    error={!!errors.budget_estimate}
                                    helperText={errors.budget_estimate}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EuroIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                    inputProps={{ min: 0, step: 0.01 }}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Fecha de Inicio"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    error={!!errors.start_date}
                                    helperText={errors.start_date}
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CalendarIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Fecha de Finalización"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    error={!!errors.end_date}
                                    helperText={errors.end_date}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 4 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={data.featured}
                                                onChange={(e) => setData('featured', e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="Proyecto Destacado"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="Proyecto Activo"
                                    />
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button
                                        component={Link}
                                        href={route('admin.projects.index')}
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

export default EditProject;

