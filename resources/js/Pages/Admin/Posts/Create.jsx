import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Chip,
    Avatar,
    Paper,
    Divider,
    Stack,
    Autocomplete,
    Alert,
    CircularProgress,
    useTheme,
    alpha
} from '@mui/material';
import {
    Save as SaveIcon,
    Preview as PreviewIcon,
    Schedule as ScheduleIcon,
    Upload as UploadIcon,
    Image as ImageIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import AdminLayout from '@/Layouts/AdminLayout';

const PostForm = ({ post, categories, tags, authors, isEdit = false }) => {
    const theme = useTheme();
    const [previewMode, setPreviewMode] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [coverImagePreview, setCoverImagePreview] = useState(post?.cover_image || '');

    const { data, setData, post: submitPost, processing, errors, reset } = useForm({
        title: post?.title || '',
        slug: post?.slug || '',
        excerpt: post?.excerpt || '',
        content: post?.content || '',
        cover_image: post?.cover_image || '',
        status: post?.status || 'draft',
        featured: post?.featured || false,
        published_at: post?.published_at ? dayjs(post.published_at) : null,
        user_id: post?.user_id || authors[0]?.id || '',
        categories: post?.categories || [],
        tags: post?.tags || [],
        seo_title: post?.seo_title || '',
        seo_description: post?.seo_description || '',
    });

    // Generate slug from title
    useEffect(() => {
        if (data.title && !isEdit) {
            const slug = data.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setData('slug', slug);
        }
    }, [data.title]);

    // Update selected arrays when form data changes
    useEffect(() => {
        if (data.categories) {
            setSelectedCategories(
                Array.isArray(data.categories) 
                    ? data.categories.map(cat => typeof cat === 'object' ? cat.id : cat)
                    : []
            );
        }
        if (data.tags) {
            setSelectedTags(
                Array.isArray(data.tags) 
                    ? data.tags.map(tag => typeof tag === 'object' ? tag.id : tag)
                    : []
            );
        }
    }, [data.categories, data.tags]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = {
            ...data,
            categories: selectedCategories,
            tags: selectedTags,
            published_at: data.published_at ? data.published_at.format('YYYY-MM-DD HH:mm:ss') : null,
        };

        if (isEdit) {
            submitPost(route('admin.posts.update', post.id), {
                data: formData,
                onSuccess: () => {
                    // Handle success
                }
            });
        } else {
            submitPost(route('admin.posts.store'), {
                data: formData,
                onSuccess: () => {
                    // Handle success
                }
            });
        }
    };

    const handleSaveAsDraft = () => {
        setData('status', 'draft');
        setTimeout(() => handleSubmit(new Event('submit')), 100);
    };

    const handlePublish = () => {
        setData('status', 'published');
        if (!data.published_at) {
            setData('published_at', dayjs());
        }
        setTimeout(() => handleSubmit(new Event('submit')), 100);
    };

    const handleSchedule = () => {
        setData('status', 'scheduled');
        setTimeout(() => handleSubmit(new Event('submit')), 100);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Here you would typically upload to your storage
            // For now, we'll just create a preview URL
            const imageUrl = URL.createObjectURL(file);
            setCoverImagePreview(imageUrl);
            setData('cover_image', imageUrl);
        }
    };

    const generateSEOFromContent = () => {
        if (!data.seo_title && data.title) {
            setData('seo_title', data.title);
        }
        if (!data.seo_description && data.excerpt) {
            setData('seo_description', data.excerpt);
        }
    };

    return (
        <AdminLayout>
            <Head title={`${isEdit ? 'Editar' : 'Crear'} Post - Admin`} />

            <Container maxWidth="xl" sx={{ py: 4 }}>
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                {isEdit ? 'Editar Post' : 'Crear Nuevo Post'}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                {isEdit ? 'Modifica la información del post' : 'Completa los datos para crear un nuevo post'}
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                onClick={() => window.history.back()}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleSaveAsDraft}
                                disabled={processing}
                                startIcon={processing ? <CircularProgress size={20} /> : <SaveIcon />}
                            >
                                Guardar Borrador
                            </Button>
                            {data.status === 'scheduled' && (
                                <Button
                                    variant="contained"
                                    color="info"
                                    onClick={handleSchedule}
                                    disabled={processing || !data.published_at}
                                    startIcon={<ScheduleIcon />}
                                >
                                    Programar
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                onClick={handlePublish}
                                disabled={processing}
                                startIcon={processing ? <CircularProgress size={20} /> : <SaveIcon />}
                            >
                                Publicar
                            </Button>
                        </Stack>
                    </Box>

                    <Grid container spacing={4}>
                        {/* Main Content */}
                        <Grid size={{ xs: 12, lg: 8 }}>
                            <Stack spacing={4}>
                                {/* Basic Info */}
                                <Card>
                                    <CardContent sx={{ p: 4 }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Información Básica
                                        </Typography>

                                        <Stack spacing={3}>
                                            <TextField
                                                fullWidth
                                                label="Título *"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                error={!!errors.title}
                                                helperText={errors.title}
                                                variant="outlined"
                                            />

                                            <TextField
                                                fullWidth
                                                label="Slug"
                                                value={data.slug}
                                                onChange={(e) => setData('slug', e.target.value)}
                                                error={!!errors.slug}
                                                helperText={errors.slug || 'Se genera automáticamente desde el título'}
                                                variant="outlined"
                                            />

                                            <TextField
                                                fullWidth
                                                label="Extracto *"
                                                value={data.excerpt}
                                                onChange={(e) => setData('excerpt', e.target.value)}
                                                error={!!errors.excerpt}
                                                helperText={errors.excerpt || 'Resumen breve que aparecerá en las listas'}
                                                multiline
                                                rows={3}
                                                variant="outlined"
                                            />
                                        </Stack>
                                    </CardContent>
                                </Card>

                                {/* Content */}
                                <Card>
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                            <Typography variant="h6" fontWeight="bold">
                                                Contenido
                                            </Typography>
                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => setPreviewMode(!previewMode)}
                                                    startIcon={<PreviewIcon />}
                                                >
                                                    {previewMode ? 'Editor' : 'Vista Previa'}
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    href="/admin/media"
                                                    target="_blank"
                                                    startIcon={<ImageIcon />}
                                                >
                                                    Medios
                                                </Button>
                                            </Stack>
                                        </Box>

                                        {previewMode ? (
                                            <Paper
                                                sx={{
                                                    p: 3,
                                                    minHeight: 400,
                                                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                                                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                                                }}
                                            >
                                                <Typography variant="body1" component="div">
                                                    <div dangerouslySetInnerHTML={{ __html: data.content || '<p>Escribe contenido para ver la vista previa...</p>' }} />
                                                </Typography>
                                            </Paper>
                                        ) : (
                                            <TextField
                                                fullWidth
                                                label="Contenido *"
                                                value={data.content}
                                                onChange={(e) => setData('content', e.target.value)}
                                                error={!!errors.content}
                                                helperText={errors.content || 'Puedes usar HTML para formatear el contenido. Usa el botón "Medios" para insertar imágenes.'}
                                                multiline
                                                rows={15}
                                                variant="outlined"
                                                sx={{
                                                    '& .MuiInputBase-root': {
                                                        fontFamily: 'monospace',
                                                        fontSize: '14px'
                                                    }
                                                }}
                                            />
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Cover Image */}
                                <Card>
                                    <CardContent sx={{ p: 4 }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Imagen de Portada
                                        </Typography>

                                        <Stack spacing={3}>
                                            <TextField
                                                fullWidth
                                                label="URL de la Imagen"
                                                value={data.cover_image}
                                                onChange={(e) => {
                                                    setData('cover_image', e.target.value);
                                                    setCoverImagePreview(e.target.value);
                                                }}
                                                error={!!errors.cover_image}
                                                helperText={errors.cover_image}
                                                variant="outlined"
                                            />

                                            <Button
                                                variant="outlined"
                                                component="label"
                                                startIcon={<UploadIcon />}
                                                sx={{ alignSelf: 'flex-start' }}
                                            >
                                                Subir Imagen
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                />
                                            </Button>

                                            {coverImagePreview && (
                                                <Box
                                                    sx={{
                                                        position: 'relative',
                                                        maxWidth: 400,
                                                        borderRadius: 2,
                                                        overflow: 'hidden',
                                                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                                                    }}
                                                >
                                                    <img
                                                        src={coverImagePreview}
                                                        alt="Preview"
                                                        style={{
                                                            width: '100%',
                                                            height: 'auto',
                                                            display: 'block'
                                                        }}
                                                    />
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => {
                                                            setData('cover_image', '');
                                                            setCoverImagePreview('');
                                                        }}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            minWidth: 'auto',
                                                            p: 1
                                                        }}
                                                    >
                                                        <CloseIcon fontSize="small" />
                                                    </Button>
                                                </Box>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>

                                {/* SEO */}
                                <Card>
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                            <Typography variant="h6" fontWeight="bold">
                                                SEO
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={generateSEOFromContent}
                                            >
                                                Auto-generar
                                            </Button>
                                        </Box>

                                        <Stack spacing={3}>
                                            <TextField
                                                fullWidth
                                                label="Título SEO"
                                                value={data.seo_title}
                                                onChange={(e) => setData('seo_title', e.target.value)}
                                                error={!!errors.seo_title}
                                                helperText={errors.seo_title || `${data.seo_title.length}/60 caracteres recomendados`}
                                                variant="outlined"
                                            />

                                            <TextField
                                                fullWidth
                                                label="Descripción SEO"
                                                value={data.seo_description}
                                                onChange={(e) => setData('seo_description', e.target.value)}
                                                error={!!errors.seo_description}
                                                helperText={errors.seo_description || `${data.seo_description.length}/160 caracteres recomendados`}
                                                multiline
                                                rows={3}
                                                variant="outlined"
                                            />
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Stack>
                        </Grid>

                        {/* Sidebar */}
                        <Grid size={{ xs: 12, lg: 4 }}>
                            <Stack spacing={4}>
                                {/* Status */}
                                <Card>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Estado del Post
                                        </Typography>

                                        <Stack spacing={3}>
                                            <FormControl fullWidth>
                                                <InputLabel>Estado</InputLabel>
                                                <Select
                                                    value={data.status}
                                                    label="Estado"
                                                    onChange={(e) => setData('status', e.target.value)}
                                                >
                                                    <MenuItem value="draft">Borrador</MenuItem>
                                                    <MenuItem value="published">Publicado</MenuItem>
                                                    <MenuItem value="scheduled">Programado</MenuItem>
                                                </Select>
                                            </FormControl>

                                            {data.status === 'scheduled' && (
                                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                                    <DateTimePicker
                                                        label="Fecha de Publicación"
                                                        value={data.published_at}
                                                        onChange={(newValue) => setData('published_at', newValue)}
                                                        renderInput={(params) => <TextField {...params} fullWidth />}
                                                    />
                                                </LocalizationProvider>
                                            )}

                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={data.featured}
                                                        onChange={(e) => setData('featured', e.target.checked)}
                                                    />
                                                }
                                                label="Post Destacado"
                                            />
                                        </Stack>
                                    </CardContent>
                                </Card>

                                {/* Author */}
                                <Card>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Autor
                                        </Typography>

                                        <FormControl fullWidth>
                                            <InputLabel>Seleccionar Autor</InputLabel>
                                            <Select
                                                value={data.user_id}
                                                label="Seleccionar Autor"
                                                onChange={(e) => setData('user_id', e.target.value)}
                                            >
                                                {authors.map((author) => (
                                                    <MenuItem key={author.id} value={author.id}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.8rem' }}>
                                                                {author.name.charAt(0)}
                                                            </Avatar>
                                                            {author.name}
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </CardContent>
                                </Card>

                                {/* Categories */}
                                <Card>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Categorías
                                        </Typography>

                                        <Autocomplete
                                            multiple
                                            options={categories}
                                            getOptionLabel={(option) => option.name}
                                            value={categories.filter(cat => selectedCategories.includes(cat.id))}
                                            onChange={(event, newValue) => {
                                                const newIds = newValue.map(cat => cat.id);
                                                setSelectedCategories(newIds);
                                                setData('categories', newIds);
                                            }}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        key={option.id}
                                                        label={option.name}
                                                        size="small"
                                                        sx={{ 
                                                            backgroundColor: option.color,
                                                            color: 'white'
                                                        }}
                                                        {...getTagProps({ index })}
                                                    />
                                                ))
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Seleccionar Categorías"
                                                    placeholder="Buscar categorías..."
                                                />
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Tags */}
                                <Card>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Tags
                                        </Typography>

                                        <Autocomplete
                                            multiple
                                            options={tags}
                                            getOptionLabel={(option) => option.name}
                                            value={tags.filter(tag => selectedTags.includes(tag.id))}
                                            onChange={(event, newValue) => {
                                                const newIds = newValue.map(tag => tag.id);
                                                setSelectedTags(newIds);
                                                setData('tags', newIds);
                                            }}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        key={option.id}
                                                        label={option.name}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ 
                                                            borderColor: option.color,
                                                            color: option.color
                                                        }}
                                                        {...getTagProps({ index })}
                                                    />
                                                ))
                                            }
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Seleccionar Tags"
                                                    placeholder="Buscar tags..."
                                                />
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </Stack>
                        </Grid>
                    </Grid>
                </form>
            </Container>
        </AdminLayout>
    );
};

export default PostForm;