import React from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Stack,
    Divider
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    Image as ImageIcon,
    VideoLibrary as VideoIcon
} from '@mui/icons-material';

/**
 * ServiceV2Fields Component
 * 
 * Campos adicionales para ServicesV2 (metrics, benefits, process_steps, etc.)
 * Se integra en el formulario de edición de servicios del admin panel.
 * 
 * @param {object} data - Datos del formulario
 * @param {function} setData - Función para actualizar datos
 * @param {object} errors - Errores de validación
 */
const ServiceV2Fields = ({ data, setData, errors }) => {
    
    // Helper para actualizar arrays JSON
    const updateArrayField = (field, index, key, value) => {
        const newArray = [...(data[field] || [])];
        newArray[index] = { ...newArray[index], [key]: value };
        setData(field, newArray);
    };

    const addArrayItem = (field, template) => {
        setData(field, [...(data[field] || []), template]);
    };

    const removeArrayItem = (field, index) => {
        const newArray = (data[field] || []).filter((_, i) => i !== index);
        setData(field, newArray);
    };

    return (
        <Box>
            {/* Media Section */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" fontWeight="bold">
                        📸 Media y Recursos
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Imagen Destacada (URL)"
                                value={data.featured_image || ''}
                                onChange={(e) => setData('featured_image', e.target.value)}
                                error={!!errors.featured_image}
                                helperText={errors.featured_image || "URL de la imagen principal del hero"}
                                InputProps={{
                                    startAdornment: <ImageIcon sx={{ mr: 1, color: 'action.active' }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Video URL (opcional)"
                                value={data.video_url || ''}
                                onChange={(e) => setData('video_url', e.target.value)}
                                error={!!errors.video_url}
                                helperText={errors.video_url || "URL del video para el hero (MP4)"}
                                InputProps={{
                                    startAdornment: <VideoIcon sx={{ mr: 1, color: 'action.active' }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Texto CTA Primario"
                                value={data.cta_primary_text || ''}
                                onChange={(e) => setData('cta_primary_text', e.target.value)}
                                placeholder="Solicitar Asesoría Gratuita"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Texto CTA Secundario"
                                value={data.cta_secondary_text || ''}
                                onChange={(e) => setData('cta_secondary_text', e.target.value)}
                                placeholder="Descargar Catálogo"
                            />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Metrics Section */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" fontWeight="bold">
                        📊 Métricas de Confianza
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack spacing={2}>
                        <Button
                            onClick={() => addArrayItem('metrics', { icon: '🏆', value: '500+', label: 'Proyectos Completados' })}
                            startIcon={<AddIcon />}
                            variant="outlined"
                            size="small"
                        >
                            Agregar Métrica
                        </Button>
                        {(data.metrics || []).map((metric, index) => (
                            <Paper key={index} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={2}>
                                        <TextField
                                            fullWidth
                                            label="Icono"
                                            value={metric.icon || ''}
                                            onChange={(e) => updateArrayField('metrics', index, 'icon', e.target.value)}
                                            placeholder="🏆"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Valor"
                                            value={metric.value || ''}
                                            onChange={(e) => updateArrayField('metrics', index, 'value', e.target.value)}
                                            placeholder="500+"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Etiqueta"
                                            value={metric.label || ''}
                                            onChange={(e) => updateArrayField('metrics', index, 'label', e.target.value)}
                                            placeholder="Proyectos Completados"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={1}>
                                        <IconButton onClick={() => removeArrayItem('metrics', index)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}
                    </Stack>
                </AccordionDetails>
            </Accordion>

            {/* Benefits Section */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" fontWeight="bold">
                        ✨ Beneficios del Servicio
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack spacing={2}>
                        <Button
                            onClick={() => addArrayItem('benefits', { icon: '⚡', title: 'Entrega Rápida', description: 'Cumplimos plazos...', metric: '95% a tiempo' })}
                            startIcon={<AddIcon />}
                            variant="outlined"
                            size="small"
                        >
                            Agregar Beneficio
                        </Button>
                        {(data.benefits || []).map((benefit, index) => (
                            <Paper key={index} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={2}>
                                        <TextField
                                            fullWidth
                                            label="Icono"
                                            value={benefit.icon || ''}
                                            onChange={(e) => updateArrayField('benefits', index, 'icon', e.target.value)}
                                            placeholder="⚡"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="Título"
                                            value={benefit.title || ''}
                                            onChange={(e) => updateArrayField('benefits', index, 'title', e.target.value)}
                                            placeholder="Entrega Rápida"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Métrica"
                                            value={benefit.metric || ''}
                                            onChange={(e) => updateArrayField('benefits', index, 'metric', e.target.value)}
                                            placeholder="95% a tiempo"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <IconButton onClick={() => removeArrayItem('benefits', index)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Descripción"
                                            value={benefit.description || ''}
                                            onChange={(e) => updateArrayField('benefits', index, 'description', e.target.value)}
                                            multiline
                                            rows={2}
                                            placeholder="Cumplimos plazos sin comprometer calidad..."
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}
                    </Stack>
                </AccordionDetails>
            </Accordion>

            {/* Process Steps Section */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" fontWeight="bold">
                        🔄 Pasos del Proceso
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack spacing={2}>
                        <Button
                            onClick={() => addArrayItem('process_steps', { 
                                id: (data.process_steps || []).length + 1,
                                title: 'Consulta Inicial', 
                                description: 'Reunión para entender necesidades...', 
                                icon: '📋',
                                duration: '1-2 días',
                                deliverables: ['Presupuesto preliminar']
                            })}
                            startIcon={<AddIcon />}
                            variant="outlined"
                            size="small"
                        >
                            Agregar Paso
                        </Button>
                        {(data.process_steps || []).map((step, index) => (
                            <Paper key={index} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={2}>
                                        <TextField
                                            fullWidth
                                            label="Icono"
                                            value={step.icon || ''}
                                            onChange={(e) => updateArrayField('process_steps', index, 'icon', e.target.value)}
                                            placeholder="📋"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={5}>
                                        <TextField
                                            fullWidth
                                            label="Título"
                                            value={step.title || ''}
                                            onChange={(e) => updateArrayField('process_steps', index, 'title', e.target.value)}
                                            placeholder="Consulta Inicial"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Duración"
                                            value={step.duration || ''}
                                            onChange={(e) => updateArrayField('process_steps', index, 'duration', e.target.value)}
                                            placeholder="1-2 días"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={1}>
                                        <IconButton onClick={() => removeArrayItem('process_steps', index)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Descripción"
                                            value={step.description || ''}
                                            onChange={(e) => updateArrayField('process_steps', index, 'description', e.target.value)}
                                            multiline
                                            rows={2}
                                            placeholder="Reunión para entender necesidades..."
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Entregables (separados por coma)"
                                            value={(step.deliverables || []).join(', ')}
                                            onChange={(e) => updateArrayField('process_steps', index, 'deliverables', e.target.value.split(',').map(s => s.trim()))}
                                            placeholder="Presupuesto preliminar, Plan de trabajo"
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}
                    </Stack>
                </AccordionDetails>
            </Accordion>

            {/* Guarantees Section */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" fontWeight="bold">
                        ✅ Garantías
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack spacing={2}>
                        <Button
                            onClick={() => addArrayItem('guarantees', { 
                                id: (data.guarantees || []).length + 1,
                                title: 'Garantía de Calidad', 
                                description: 'Respaldo de hasta 10 años...', 
                                icon: 'Verified',
                                badge: '10 años'
                            })}
                            startIcon={<AddIcon />}
                            variant="outlined"
                            size="small"
                        >
                            Agregar Garantía
                        </Button>
                        {(data.guarantees || []).map((guarantee, index) => (
                            <Paper key={index} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Icono MUI"
                                            value={guarantee.icon || ''}
                                            onChange={(e) => updateArrayField('guarantees', index, 'icon', e.target.value)}
                                            placeholder="Verified"
                                            helperText="Verified, Security, ThumbUp..."
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="Título"
                                            value={guarantee.title || ''}
                                            onChange={(e) => updateArrayField('guarantees', index, 'title', e.target.value)}
                                            placeholder="Garantía de Calidad"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <TextField
                                            fullWidth
                                            label="Badge"
                                            value={guarantee.badge || ''}
                                            onChange={(e) => updateArrayField('guarantees', index, 'badge', e.target.value)}
                                            placeholder="10 años"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={1}>
                                        <IconButton onClick={() => removeArrayItem('guarantees', index)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Descripción"
                                            value={guarantee.description || ''}
                                            onChange={(e) => updateArrayField('guarantees', index, 'description', e.target.value)}
                                            multiline
                                            rows={2}
                                            placeholder="Respaldo de hasta 10 años..."
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}
                    </Stack>
                </AccordionDetails>
            </Accordion>

            {/* Certifications Section */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" fontWeight="bold">
                        🏅 Certificaciones
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack spacing={2}>
                        <Button
                            onClick={() => addArrayItem('certifications', { name: 'ISO 9001:2015', description: 'Gestión de Calidad Certificada' })}
                            startIcon={<AddIcon />}
                            variant="outlined"
                            size="small"
                        >
                            Agregar Certificación
                        </Button>
                        {(data.certifications || []).map((cert, index) => (
                            <Paper key={index} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="Nombre"
                                            value={cert.name || ''}
                                            onChange={(e) => updateArrayField('certifications', index, 'name', e.target.value)}
                                            placeholder="ISO 9001:2015"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={7}>
                                        <TextField
                                            fullWidth
                                            label="Descripción"
                                            value={cert.description || ''}
                                            onChange={(e) => updateArrayField('certifications', index, 'description', e.target.value)}
                                            placeholder="Gestión de Calidad Certificada"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={1}>
                                        <IconButton onClick={() => removeArrayItem('certifications', index)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}
                    </Stack>
                </AccordionDetails>
            </Accordion>

            {/* Gallery Section */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" fontWeight="bold">
                        🖼️ Galería de Proyectos
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack spacing={2}>
                        <Button
                            onClick={() => addArrayItem('gallery', { 
                                id: (data.gallery || []).length + 1,
                                url: '', 
                                thumbnail: '',
                                title: 'Proyecto', 
                                category: 'Viviendas',
                                description: ''
                            })}
                            startIcon={<AddIcon />}
                            variant="outlined"
                            size="small"
                        >
                            Agregar Imagen
                        </Button>
                        {(data.gallery || []).map((image, index) => (
                            <Paper key={index} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={5}>
                                        <TextField
                                            fullWidth
                                            label="URL Imagen"
                                            value={image.url || ''}
                                            onChange={(e) => updateArrayField('gallery', index, 'url', e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="Título"
                                            value={image.title || ''}
                                            onChange={(e) => updateArrayField('gallery', index, 'title', e.target.value)}
                                            placeholder="Villa Mediterránea"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <TextField
                                            fullWidth
                                            label="Categoría"
                                            value={image.category || ''}
                                            onChange={(e) => updateArrayField('gallery', index, 'category', e.target.value)}
                                            placeholder="Viviendas"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={1}>
                                        <IconButton onClick={() => removeArrayItem('gallery', index)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}
                    </Stack>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default ServiceV2Fields;

