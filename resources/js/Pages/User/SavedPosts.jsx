import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    CardActions,
    CardMedia,
    Grid,
    Pagination,
    InputAdornment,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Chip,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Avatar,
    useTheme,
    alpha
} from '@mui/material';
import {
    Search as SearchIcon,
    BookmarkRemove as BookmarkRemoveIcon,
    Visibility as ViewIcon,
    Bookmark as BookmarkIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { useNotification } from '@/Context/NotificationContext';

const PostCard = ({ post, onRemove }) => {
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
    const theme = useTheme();

    const handleRemove = async () => {
        await onRemove(post.id);
        setRemoveDialogOpen(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <Card 
                    sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        '&:hover': { 
                            boxShadow: 4,
                            transform: 'translateY(-4px)',
                            transition: 'all 0.3s ease'
                        } 
                    }}
                >
                    {post.featured_image && (
                        <CardMedia
                            component="img"
                            height="200"
                            image={post.featured_image}
                            alt={post.title}
                            sx={{
                                objectFit: 'cover'
                            }}
                        />
                    )}
                    
                    <CardContent sx={{ flex: 1 }}>
                        <Box mb={2}>
                            {post.category && (
                                <Chip
                                    label={post.category.name}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                />
                            )}
                        </Box>

                        <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: 1.4,
                                height: '2.8em'
                            }}
                        >
                            {post.title}
                        </Typography>

                        {post.excerpt && (
                            <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    mb: 2
                                }}
                            >
                                {post.excerpt}
                            </Typography>
                        )}

                        <Box display="flex" alignItems="center" mb={2}>
                            <Avatar 
                                src={post.author.avatar_url}
                                alt={post.author.name}
                                sx={{ width: 32, height: 32, mr: 1 }}
                            >
                                <PersonIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" fontWeight="medium">
                                    {post.author.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
                                    <CalendarIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                    {formatDate(post.created_at)}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                        <Button
                            component={Link}
                            href={`/blog/${post.slug}`}
                            size="small"
                            startIcon={<ViewIcon />}
                            variant="contained"
                        >
                            Leer Post
                        </Button>
                        <Button
                            size="small"
                            color="error"
                            startIcon={<BookmarkRemoveIcon />}
                            onClick={() => setRemoveDialogOpen(true)}
                        >
                            Quitar
                        </Button>
                    </CardActions>
                </Card>
            </motion.div>

            <Dialog
                open={removeDialogOpen}
                onClose={() => setRemoveDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    ¿Quitar de guardados?
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        El post "{post.title}" será eliminado de tu lista de posts guardados.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRemoveDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleRemove} color="error" variant="contained">
                        Quitar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const FilterBar = ({ filters, categories, onFiltersChange }) => {
    const [localSearch, setLocalSearch] = useState(filters.search || '');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onFiltersChange({ ...filters, search: localSearch });
    };

    const handleClearSearch = () => {
        setLocalSearch('');
        onFiltersChange({ ...filters, search: '' });
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
                <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                    Filtros
                </Typography>
            </Box>

            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                    <form onSubmit={handleSearchSubmit}>
                        <TextField
                            fullWidth
                            placeholder="Buscar posts guardados..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: localSearch && (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleClearSearch} size="small">
                                            <ClearIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </form>
                </Grid>
                <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Categoría</InputLabel>
                        <Select
                            value={filters.category || ''}
                            label="Categoría"
                            onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
                        >
                            <MenuItem value="">Todas las categorías</MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.slug}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                        <InputLabel>Por página</InputLabel>
                        <Select
                            value={filters.per_page || 12}
                            label="Por página"
                            onChange={(e) => onFiltersChange({ ...filters, per_page: e.target.value })}
                        >
                            <MenuItem value={6}>6</MenuItem>
                            <MenuItem value={12}>12</MenuItem>
                            <MenuItem value={24}>24</MenuItem>
                            <MenuItem value={48}>48</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleSearchSubmit}
                    >
                        Buscar
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default function SavedPosts({ savedPosts, categories, filters }) {
    // const { showNotification } = useNotification();

    const handleFiltersChange = (newFilters) => {
        const params = { ...newFilters };
        
        // Remove empty values
        Object.keys(params).forEach(key => 
            (params[key] === '' || params[key] === null || params[key] === undefined) && delete params[key]
        );

        router.get('/my/saved-posts', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleRemovePost = async (postId) => {
        try {
            const response = await fetch(`/my/saved-posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // showNotification(data.message, 'success');
                router.reload({ only: ['savedPosts'] });
            } else {
                // showNotification(data.message || 'Error al quitar post', 'error');
            }
        } catch (error) {
            // showNotification('Error al quitar post', 'error');
        }
    };

    const handlePageChange = (event, page) => {
        handleFiltersChange({ ...filters, page });
    };

    return (
        <AuthenticatedLayout
            header={
                <Box display="flex" alignItems="center">
                    <BookmarkIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1">
                        Posts Guardados
                    </Typography>
                </Box>
            }
        >
            <Head title="Posts Guardados" />

            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header Stats */}
                <Box mb={4}>
                    <Typography variant="body1" color="text.secondary">
                        Total de posts guardados: <strong>{savedPosts.total}</strong>
                    </Typography>
                </Box>

                {/* Filters */}
                <FilterBar 
                    filters={filters}
                    categories={categories}
                    onFiltersChange={handleFiltersChange}
                />

                {/* Posts Grid */}
                <Box mb={4}>
                    {savedPosts.data.length === 0 ? (
                        <Alert severity="info" sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                No se encontraron posts guardados
                            </Typography>
                            <Typography>
                                {filters.search || filters.category 
                                    ? 'Intenta con otros criterios de búsqueda' 
                                    : 'Aún no has guardado ningún post'
                                }
                            </Typography>
                            {!filters.search && !filters.category && (
                                <Button
                                    component={Link}
                                    href="/blog"
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                >
                                    Explorar Blog
                                </Button>
                            )}
                        </Alert>
                    ) : (
                        <Grid container spacing={3}>
                            {savedPosts.data.map((post) => (
                                <Grid item xs={12} sm={6} md={4} key={post.id}>
                                    <PostCard
                                        post={post}
                                        onRemove={handleRemovePost}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>

                {/* Pagination */}
                {savedPosts.last_page > 1 && (
                    <Box display="flex" justifyContent="center">
                        <Pagination
                            count={savedPosts.last_page}
                            page={savedPosts.current_page}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                        />
                    </Box>
                )}
            </Container>
        </AuthenticatedLayout>
    );
}