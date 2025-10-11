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
    IconButton,
    Alert,
    Chip
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Add as AddIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

const ServiceForm = ({ service = null }) => {
    const isEditing = !!service;
    
    const { data, setData, post, put, processing, errors } = useForm({
        title: service?.title || '',
        excerpt: service?.excerpt || '',
        body: service?.body || '',
        icon: service?.icon || '',
        faq: service?.faq || [],
        sort_order: service?.sort_order || 0,
        is_active: service?.is_active ?? true,
        featured: service?.featured ?? false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(`/admin/services/${service.id}`);
        } else {
            post('/admin/services');
        }
    };

    const addFaqItem = () => {
        setData('faq', [...data.faq, { question: '', answer: '' }]);
    };

    const removeFaqItem = (index) => {
        const newFaq = data.faq.filter((_, i) => i !== index);
        setData('faq', newFaq);
    };

    const updateFaqItem = (index, field, value) => {
        const newFaq = [...data.faq];
        newFaq[index] = { ...newFaq[index], [field]: value };
        setData('faq', newFaq);
    };

    return (
        <AdminLayout title={isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}>
            <Head title={isEditing ? 'Editar Servicio' : 'Nuevo Servicio'} />
            
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton component={Link} href="/admin/services">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" fontWeight="bold">
                    {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
                </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Información Básica
                            </Typography>
                            
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Título del Servicio"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        error={!!errors.title}
                                        helperText={errors.title}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Descripción Corta"
                                        value={data.excerpt}
                                        onChange={(e) => setData('excerpt', e.target.value)}
                                        error={!!errors.excerpt}
                                        helperText={errors.excerpt}
                                        multiline
                                        rows={2}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Icono"
                                        value={data.icon}
                                        onChange={(e) => setData('icon', e.target.value)}
                                        helperText="Nombre del icono de Material-UI"
                                    />
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Orden"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Contenido Detallado"
                                        value={data.body}
                                        onChange={(e) => setData('body', e.target.value)}
                                        multiline
                                        rows={6}
                                        required
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* FAQ Section */}
                        <Paper sx={{ p: 4, borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Preguntas Frecuentes
                                </Typography>
                                <Button onClick={addFaqItem} startIcon={<AddIcon />} variant="outlined" size="small">
                                    Añadir FAQ
                                </Button>
                            </Box>
                            
                            {data.faq.map((faqItem, index) => (
                                <Box key={index} sx={{ mb: 3, p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Chip label={`FAQ ${index + 1}`} size="small" />
                                        <IconButton onClick={() => removeFaqItem(index)} color="error" size="small">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                    
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Pregunta"
                                                value={faqItem.question}
                                                onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Respuesta"
                                                value={faqItem.answer}
                                                onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                                                multiline
                                                rows={3}
                                                required
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}
                        </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 4, borderRadius: 3 }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Configuración
                            </Typography>
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                }
                                label="Servicio Activo"
                                sx={{ mb: 2 }}
                            />
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={data.featured}
                                        onChange={(e) => setData('featured', e.target.checked)}
                                    />
                                }
                                label="Mostrar en Home"
                                sx={{ mb: 3 }}
                            />
                            
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<SaveIcon />}
                                disabled={processing}
                                fullWidth
                                size="large"
                            >
                                {processing ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </form>
        </AdminLayout>
    );
};

export default ServiceForm;