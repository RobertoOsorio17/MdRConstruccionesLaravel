import React, { useState, useEffect, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.locale('es');
import AdminLayout from '@/Layouts/AdminLayout';
import TinyMCEProfessional from '@/Components/Admin/TinyMCEProfessional';
import ContentScheduler from '@/Components/Admin/ContentScheduler';
import SEOOptimizer from '@/Components/Admin/SEOOptimizer';

const PostForm = ({ post, categories, tags, authors, revisions = [], isEdit = false }) => {
    const theme = useTheme();
    const [previewMode, setPreviewMode] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [coverImagePreview, setCoverImagePreview] = useState(post?.cover_image || '');
    const [mediaFiles, setMediaFiles] = useState([]);
    const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
    const [selectedRevision, setSelectedRevision] = useState(null);
    const [restoringRevisionId, setRestoringRevisionId] = useState(null);

    const { data, setData, post: submitPost, put: updatePost, processing, errors, reset } = useForm({
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

    const revisionList = Array.isArray(revisions) ? revisions : [];
    const categoryMap = useMemo(() => Object.fromEntries((categories || []).map((category) => [category.id, category.name])), [categories]);
    const tagMap = useMemo(() => Object.fromEntries((tags || []).map((tag) => [tag.id, tag.name])), [tags]);

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

    // Cargar archivos de medios
    useEffect(() => {
        const fetchMediaFiles = async () => {
            try {
                const response = await fetch('/admin/media');
                const data = await response.json();
                if (data.files) {
                    setMediaFiles(data.files);
                }
            } catch (error) {
                console.error('Error loading media files:', error);
            }
        };

        fetchMediaFiles();
    }, []);

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

    const handleSubmit = (e, overrideStatus = null, overridePublishedAt = null) => {
        e.preventDefault();

        const formData = {
            ...data,
            // Override status if provided (for draft/publish/schedule buttons)
            status: overrideStatus || data.status,
            categories: selectedCategories,
            tags: selectedTags,
            published_at: overridePublishedAt
                ? overridePublishedAt.format('YYYY-MM-DD HH:mm:ss')
                : (data.published_at ? data.published_at.format('YYYY-MM-DD HH:mm:ss') : null),
        };

        console.log('📤 Submitting post with status:', formData.status, 'overrideStatus:', overrideStatus);

        if (isEdit) {
            // ✅ FIXED: Use router.put with formData directly
            router.put(route('admin.posts.update', post.slug), formData, {
                onSuccess: () => {
                    router.visit(route('admin.posts.index'), {
                        onSuccess: () => {
                            // Success notification will be shown via flash message
                        }
                    });
                }
            });
        } else {
            // For Inertia's post method
            router.post(route('admin.posts.store'), formData, {
                onSuccess: () => {
                    router.visit(route('admin.posts.index'), {
                        onSuccess: () => {
                            // Success notification will be shown via flash message
                        }
                    });
                }
            });
        }
    };

    const handleSaveAsDraft = (e) => {
        e.preventDefault();
        handleSubmit(e, 'draft');
    };

    const handlePublish = (e) => {
        e.preventDefault();
        const publishedAt = data.published_at || dayjs();
        handleSubmit(e, 'published', publishedAt);
    };

    const handleSchedule = (e) => {
        e.preventDefault();
        handleSubmit(e, 'scheduled');
    };

    const handleViewRevision = (revision) => {
        setSelectedRevision(revision);
        setRevisionDialogOpen(true);
    };

    const handleCloseRevisionDialog = () => {
        setRevisionDialogOpen(false);
        setSelectedRevision(null);
    };

    const handleRestoreRevision = (revisionId) => {
        if (!isEdit || !post?.slug) return;

        const confirmation = window.confirm('�?�Est�?�s seguro de que deseas restaurar esta revisi�?�n? Se sobrescribir�?�n los cambios actuales.');
        if (!confirmation) return;

        setRestoringRevisionId(revisionId);

        router.post(`/admin/posts/${post.slug}/revisions/${revisionId}/restore`, {}, {
            preserveScroll: true,
            onFinish: () => setRestoringRevisionId(null),
            onSuccess: () => {
                setRevisionDialogOpen(false);
                setSelectedRevision(null);
            },
        });
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
                            <Typography component="div" variant="body1" color="text.secondary">
                                {isEdit ? 'Modifica la informaciÃ³n del post' : 'Completa los datos para crear un nuevo post'}
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

                    <Grid container spacing={3}>
                        {/* Main Content - Editor Focus */}
                        <Grid item xs={12} lg={9}>
                            <Stack spacing={3}>
                                {/* Basic Info */}
                                <Card>
                                    <CardContent sx={{ p: 4 }}>
                                        <Typography component="div" variant="h6" fontWeight="bold" gutterBottom>
                                            InformaciÃ³n BÃ¡sica
                                        </Typography>

                                        <Stack spacing={3}>
                                            <TextField
                                                fullWidth
                                                label="TÃ­tulo *"
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
                                                helperText={errors.slug || 'Se genera automÃ¡ticamente desde el tÃ­tulo'}
                                                variant="outlined"
                                            />

                                            <TextField
                                                fullWidth
                                                label="Extracto *"
                                                value={data.excerpt}
                                                onChange={(e) => setData('excerpt', e.target.value)}
                                                error={!!errors.excerpt}
                                                helperText={errors.excerpt || 'Resumen breve que aparecerÃ¡ en las listas'}
                                                multiline
                                                rows={3}
                                                variant="outlined"
                                            />
                                        </Stack>
                                    </CardContent>
                                </Card>

                                {/* Content - Editor Principal */}
                                <Card
                                    elevation={0}
                                    sx={{
                                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                                        backdropFilter: 'blur(20px)',
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        borderRadius: 4,
                                        overflow: 'visible',
                                        position: 'relative',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '4px',
                                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                            borderRadius: '16px 16px 0 0',
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                            <Box>
                                                <Typography variant="h5" fontWeight="bold" sx={{
                                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                                    backgroundClip: 'text',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    mb: 0.5
                                                }}>
                                                    Editor de Contenido
                                                </Typography>
                                                <Typography component="div" variant="body2" color="text.secondary">
                                                    Crea contenido profesional con nuestro editor avanzado
                                                </Typography>
                                            </Box>
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
                                                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                                                    borderRadius: 2,
                                                    '& img': {
                                                        maxWidth: '100%',
                                                        height: 'auto',
                                                        borderRadius: 1
                                                    },
                                                    '& blockquote': {
                                                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                                                        pl: 2,
                                                        ml: 0,
                                                        fontStyle: 'italic',
                                                        color: theme.palette.text.secondary
                                                    }
                                                }}
                                            >
                                                <Typography component="div" variant="body1">
                                                    <div dangerouslySetInnerHTML={{ __html: data.content || '<p>Escribe contenido para ver la vista previa...</p>' }} />
                                                </Typography>
                                            </Paper>
                                        ) : (
                                            <TinyMCEProfessional
                                                value={data.content}
                                                onChange={(value) => setData('content', value)}
                                                placeholder="Escribe el contenido de tu post aquÃ­... Usa la barra de herramientas profesional para formatear texto, insertar imÃ¡genes, videos, tablas y mÃ¡s."
                                                height={700}
                                                error={errors.content}
                                                helperText={errors.content || 'Editor TinyMCE profesional con todas las funciones premium: formato avanzado, tablas mejoradas, inserciÃ³n de medios, plantillas, auto-guardado y mÃ¡s. Arrastra y suelta imÃ¡genes para subirlas automÃ¡ticamente.'}
                                                autoSave={true}
                                                showWordCount={true}
                                                allowFullscreen={true}
                                                onSave={async (content) => {
                                                    // Auto-save functionality
                                                    if (isEdit && post?.slug) {
                                                        try {
                                                            await fetch(route('admin.posts.update', post.slug), {
                                                                method: 'PUT',
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                                                                },
                                                                body: JSON.stringify({
                                                                    ...data,
                                                                    content,
                                                                    status: 'draft'
                                                                })
                                                            });
                                                        } catch (error) {
                                                            console.error('Auto-save failed:', error);
                                                        }
                                                    }
                                                }}
                                            />
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Cover Image */}
                                <Card>
                                    <CardContent sx={{ p: 4 }}>
                                        <Typography component="div" variant="h6" fontWeight="bold" gutterBottom>
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
                                            <Typography component="div" variant="h6" fontWeight="bold">
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
                                                label="TÃ­tulo SEO"
                                                value={data.seo_title}
                                                onChange={(e) => setData('seo_title', e.target.value)}
                                                error={!!errors.seo_title}
                                                helperText={errors.seo_title || `${data.seo_title.length}/60 caracteres recomendados`}
                                                variant="outlined"
                                            />

                                            <TextField
                                                fullWidth
                                                label="DescripciÃ³n SEO"
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
                        <Grid item xs={12} lg={3}>
                            <Stack spacing={3}>
                                {/* Content Scheduler */}
                                <ContentScheduler
                                    publishedAt={data.published_at}
                                    onPublishedAtChange={(value) => setData('published_at', value)}
                                    status={data.status}
                                    onStatusChange={(value) => setData('status', value)}
                                    featured={data.featured}
                                    onFeaturedChange={(value) => setData('featured', value)}
                                />

                                {/* Author */}
                                <Card>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography component="div" variant="h6" fontWeight="bold" gutterBottom>
                                            Autor
                                        </Typography>

                                        <FormControl fullWidth>
                                            <InputLabel>seleccionar Autor</InputLabel>
                                            <Select
                                                value={data.user_id}
                                                label="seleccionar Autor"
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

                                {isEdit && (
                                    <Card>
                                        <CardContent sx={{ p: 3 }}>
                                            <Typography component="div" variant="h6" fontWeight="bold" gutterBottom>
                                                Historial de ediciones
                                            </Typography>

                                            {revisionList.length === 0 ? (
                                                <Typography component="div" variant="body2" color="text.secondary">
                                                    A�?�n no hay revisiones guardadas.
                                                </Typography>
                                            ) : (
                                                <Stack spacing={2} sx={{ mt: 2 }}>
                                                    {revisionList.map((revision) => (
                                                        <Paper
                                                            key={revision.id}
                                                            variant="outlined"
                                                            sx={{ p: 2 }}
                                                        >
                                                            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                                                <Box>
                                                                    <Typography component="div" variant="subtitle2">
                                                                        {revision.summary || 'Revisi�?�n guardada'}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {(revision.author || 'Sistema')} �?� {dayjs(revision.created_at).fromNow()}
                                                                    </Typography>
                                                                </Box>
                                                                <Stack direction="row" spacing={1}>
                                                                    <Button size="small" variant="text" onClick={() => handleViewRevision(revision)}>
                                                                        Ver
                                                                    </Button>
                                                                    <Button
                                                                        size="small"
                                                                        variant="outlined"
                                                                        color="warning"
                                                                        onClick={() => handleRestoreRevision(revision.id)}
                                                                        disabled={restoringRevisionId === revision.id}
                                                                        startIcon={restoringRevisionId === revision.id ? <CircularProgress size={16} /> : null}
                                                                    >
                                                                        {restoringRevisionId === revision.id ? 'Restaurando...' : 'Restaurar'}
                                                                    </Button>
                                                                </Stack>
                                                            </Stack>
                                                        </Paper>
                                                    ))}
                                                </Stack>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Categories */}
                                <Card>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography component="div" variant="h6" fontWeight="bold" gutterBottom>
                                            CategorÃ­as
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
                                                    label="seleccionar CategorÃ­as"
                                                    placeholder="Buscar categorÃ­as..."
                                                />
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Tags */}
                                <Card>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography component="div" variant="h6" fontWeight="bold" gutterBottom>
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
                                                    label="seleccionar Tags"
                                                    placeholder="Buscar tags..."
                                                />
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                {/* SEO Optimizer */}
                                <SEOOptimizer
                                    title={data.title}
                                    excerpt={data.excerpt}
                                    content={data.content}
                                    seoTitle={data.seo_title}
                                    onSeoTitleChange={(value) => setData('seo_title', value)}
                                    seoDescription={data.seo_description}
                                    onSeoDescriptionChange={(value) => setData('seo_description', value)}
                                    slug={data.slug}
                                />
                            </Stack>
                        </Grid>
                    </Grid>
                </form>
            </Container>
            <Dialog
                open={revisionDialogOpen}
                onClose={handleCloseRevisionDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Detalles de la revisi�?�n</DialogTitle>
                <DialogContent dividers>
                    {selectedRevision ? (
                        <Stack spacing={3}>
                            <Box>
                                <Typography component="div" variant="subtitle2">T�?�tulo</Typography>
                                <Typography component="div" variant="body1">{selectedRevision.data?.title || 'Sin t�?�tulo'}</Typography>
                            </Box>
                            <Box>
                                <Typography component="div" variant="subtitle2">Estado</Typography>
                                <Typography component="div" variant="body2" color="text.secondary">
                                    {selectedRevision.data?.status || 'desconocido'}
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={2}>
                                <Box>
                                    <Typography component="div" variant="subtitle2">Publicado el</Typography>
                                    <Typography component="div" variant="body2" color="text.secondary">
                                        {selectedRevision.data?.published_at ? dayjs(selectedRevision.data.published_at).format('DD/MM/YYYY HH:mm') : '�?�'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography component="div" variant="subtitle2">Autor</Typography>
                                    <Typography component="div" variant="body2" color="text.secondary">
                                        {selectedRevision.author || 'Sistema'}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Box>
                                <Typography component="div" variant="subtitle2">Categor�?�as</Typography>
                                {selectedRevision.data?.categories?.length ? (
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        {selectedRevision.data.categories.map((categoryId) => (
                                            <Chip key={categoryId} label={categoryMap[categoryId] || `ID ${categoryId}`} size="small" sx={{ mr: 1, mb: 1 }} />
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography component="div" variant="body2" color="text.secondary">Sin categor�?�as</Typography>
                                )}
                            </Box>
                            <Box>
                                <Typography component="div" variant="subtitle2">Etiquetas</Typography>
                                {selectedRevision.data?.tags?.length ? (
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        {selectedRevision.data.tags.map((tagId) => (
                                            <Chip key={tagId} label={tagMap[tagId] || `ID ${tagId}`} size="small" sx={{ mr: 1, mb: 1 }} />
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography component="div" variant="body2" color="text.secondary">Sin etiquetas</Typography>
                                )}
                            </Box>
                            <Box>
                                <Typography component="div" variant="subtitle2">Contenido</Typography>
                                <Paper variant="outlined" sx={{ p: 2, maxHeight: 320, overflowY: 'auto' }}>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: selectedRevision.data?.content || '<p>Sin contenido disponible.</p>'
                                        }}
                                    />
                                </Paper>
                            </Box>
                        </Stack>
                    ) : (
                        <Typography component="div" variant="body2" color="text.secondary">
                            selecciona una revisi�?�n para ver los detalles.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRevisionDialog}>Cerrar</Button>
                    {selectedRevision && (
                        <Button
                            color="warning"
                            variant="contained"
                            onClick={() => handleRestoreRevision(selectedRevision.id)}
                            disabled={restoringRevisionId === selectedRevision.id}
                            startIcon={restoringRevisionId === selectedRevision.id ? <CircularProgress size={16} color="inherit" /> : null}
                        >
                            {restoringRevisionId === selectedRevision.id ? 'Restaurando...' : 'Restaurar esta revisi�?�n'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

        </AdminLayout>
    );
};

export default PostForm;







