import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Box,
    Container,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    FormControl,
    InputLabel,
    Select,
    Tooltip,
    useTheme,
    alpha,
    Pagination,
    Stack,
    Paper
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    MoreVert as MoreIcon,
    ContentCopy as CopyIcon,
    Schedule as ScheduleIcon,
    Visibility as VisibilityIcon,
    Person as PersonIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/Layouts/AdminLayout';

const PostsIndex = ({ posts, categories, tags, filters, stats }) => {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [selectedPosts, setSelectedPosts] = useState([]);
    const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
    const [bulkAction, setBulkAction] = useState('');

    const handleSearch = () => {
        router.get('/admin/posts', {
            search: searchTerm,
            status: selectedStatus,
            category: selectedCategory,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilter = (key, value) => {
        router.get('/admin/posts', {
            ...filters,
            [key]: value,
            page: 1
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleMenuOpen = (event, post) => {
        setAnchorEl(event.currentTarget);
        setSelectedPost(post);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedPost(null);
    };

    const handleToggleFeatured = async (post) => {
        try {
            await fetch(`/admin/posts/${post.id}/toggle-featured`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });
            router.reload({ only: ['posts'] });
        } catch (error) {
            console.error('Error toggling featured status:', error);
        }
    };

    const handleStatusChange = async (post, newStatus) => {
        try {
            await fetch(`/admin/posts/${post.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            router.reload({ only: ['posts'] });
        } catch (error) {
            console.error('Error changing status:', error);
        }
        handleMenuClose();
    };

    const handleDuplicate = () => {
        if (selectedPost) {
            router.post(`/admin/posts/${selectedPost.id}/duplicate`);
        }
        handleMenuClose();
    };

    const handleDeleteConfirm = () => {
        if (postToDelete) {
            router.delete(`/admin/posts/${postToDelete.id}`);
        }
        setDeleteDialogOpen(false);
        setPostToDelete(null);
    };

    const handlePostSelect = (postId) => {
        setSelectedPosts(prev => {
            if (prev.includes(postId)) {
                return prev.filter(id => id !== postId);
            } else {
                return [...prev, postId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedPosts.length === posts.data.length) {
            setSelectedPosts([]);
        } else {
            setSelectedPosts(posts.data.map(post => post.id));
        }
    };

    const handleBulkAction = async () => {
        if (!bulkAction || selectedPosts.length === 0) return;

        try {
            await fetch('/admin/posts/bulk-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    action: bulkAction,
                    posts: selectedPosts
                }),
            });

            router.reload({ only: ['posts', 'stats'] });
            setSelectedPosts([]);
            setBulkActionDialogOpen(false);
            setBulkAction('');
        } catch (error) {
            console.error('Error in bulk action:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'success';
            case 'draft': return 'warning';
            case 'scheduled': return 'info';
            default: return 'default';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const truncateText = (text, maxLength = 100) => {
        return text && text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <AdminLayout>
            <Head title="Gestión de Posts - Admin" />

            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Gestión de Posts
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Administra todos los artículos del blog
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        href="/admin/posts/create"
                        size="large"
                        sx={{ borderRadius: 3 }}
                    >
                        Nuevo Post
                    </Button>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper 
                            sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
                                color: 'white'
                            }}
                        >
                            <Typography variant="h3" fontWeight="bold">
                                {stats.total}
                            </Typography>
                            <Typography variant="body1">
                                Total Posts
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper 
                            sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${alpha(theme.palette.success.main, 0.8)} 100%)`,
                                color: 'white'
                            }}
                        >
                            <Typography variant="h3" fontWeight="bold">
                                {stats.published}
                            </Typography>
                            <Typography variant="body1">
                                Publicados
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper 
                            sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${alpha(theme.palette.warning.main, 0.8)} 100%)`,
                                color: 'white'
                            }}
                        >
                            <Typography variant="h3" fontWeight="bold">
                                {stats.draft}
                            </Typography>
                            <Typography variant="body1">
                                Borradores
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper 
                            sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${alpha(theme.palette.info.main, 0.8)} 100%)`,
                                color: 'white'
                            }}
                        >
                            <Typography variant="h3" fontWeight="bold">
                                {stats.scheduled}
                            </Typography>
                            <Typography variant="body1">
                                Programados
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                placeholder="Buscar posts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    value={selectedStatus}
                                    label="Estado"
                                    onChange={(e) => {
                                        setSelectedStatus(e.target.value);
                                        handleFilter('status', e.target.value);
                                    }}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="published">Publicado</MenuItem>
                                    <MenuItem value="draft">Borrador</MenuItem>
                                    <MenuItem value="scheduled">Programado</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth>
                                <InputLabel>Categoría</InputLabel>
                                <Select
                                    value={selectedCategory}
                                    label="Categoría"
                                    onChange={(e) => {
                                        setSelectedCategory(e.target.value);
                                        handleFilter('category', e.target.value);
                                    }}
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    {categories.map((category) => (
                                        <MenuItem key={category.id} value={category.id}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleSearch}
                                sx={{ py: 1.8 }}
                            >
                                Filtrar
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Posts Grid */}
                <Grid container spacing={3}>
                    {posts.data.map((post) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={post.id}>
                            <Card
                                component={motion.div}
                                whileHover={{ y: -4 }}
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    borderRadius: 3,
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Featured Badge */}
                                {post.featured && (
                                    <Chip
                                        label="Destacado"
                                        color="primary"
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            left: 12,
                                            zIndex: 2,
                                            fontWeight: 'bold'
                                        }}
                                    />
                                )}

                                {/* Actions Menu */}
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        zIndex: 2,
                                        bgcolor: alpha('white', 0.9),
                                        '&:hover': { bgcolor: 'white' }
                                    }}
                                    onClick={(e) => handleMenuOpen(e, post)}
                                >
                                    <MoreIcon />
                                </IconButton>

                                {/* Cover Image */}
                                {post.cover_image && (
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={post.cover_image}
                                        alt={post.title}
                                    />
                                )}

                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                    {/* Status and Date */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Chip 
                                            label={post.status}
                                            color={getStatusColor(post.status)}
                                            size="small"
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(post.created_at)}
                                        </Typography>
                                    </Box>

                                    {/* Title */}
                                    <Typography 
                                        variant="h6" 
                                        gutterBottom
                                        sx={{ 
                                            fontWeight: 600,
                                            lineHeight: 1.3,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {post.title}
                                    </Typography>

                                    {/* Excerpt */}
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{ 
                                            mb: 2,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {truncateText(post.excerpt, 150)}
                                    </Typography>

                                    {/* Meta Info */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {post.author.name}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <VisibilityIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {post.views_count}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Categories */}
                                    {post.categories && post.categories.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            {post.categories.slice(0, 2).map((category) => (
                                                <Chip
                                                    key={category.id}
                                                    label={category.name}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ 
                                                        mr: 1,
                                                        borderColor: category.color,
                                                        color: category.color
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </CardContent>

                                <CardActions sx={{ p: 3, pt: 0 }}>
                                    <Button
                                        size="small"
                                        href={`/admin/posts/${post.id}/edit`}
                                        startIcon={<EditIcon />}
                                        variant="outlined"
                                        sx={{ mr: 1 }}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        size="small"
                                        href={`/blog/${post.slug}`}
                                        target="_blank"
                                        startIcon={<ViewIcon />}
                                        variant="text"
                                    >
                                        Ver
                                    </Button>
                                    <Box sx={{ ml: 'auto' }}>
                                        <Tooltip title={post.featured ? 'Quitar de destacados' : 'Marcar como destacado'}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleToggleFeatured(post)}
                                                color={post.featured ? 'primary' : 'default'}
                                            >
                                                {post.featured ? <StarIcon /> : <StarBorderIcon />}
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Pagination */}
                {posts.last_page > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                        <Pagination
                            count={posts.last_page}
                            page={posts.current_page}
                            onChange={(event, page) => {
                                router.get('/admin/posts', {
                                    ...filters,
                                    page
                                }, {
                                    preserveState: true,
                                    preserveScroll: true,
                                });
                            }}
                            color="primary"
                            size="large"
                        />
                    </Box>
                )}

                {/* Actions Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => window.open(`/blog/${selectedPost?.slug}`, '_blank')}>
                        <ViewIcon sx={{ mr: 1 }} />
                        Ver Post
                    </MenuItem>
                    <MenuItem onClick={() => window.location.href = `/admin/posts/${selectedPost?.id}/edit`}>
                        <EditIcon sx={{ mr: 1 }} />
                        Editar
                    </MenuItem>
                    <MenuItem onClick={handleDuplicate}>
                        <CopyIcon sx={{ mr: 1 }} />
                        Duplicar
                    </MenuItem>
                    {selectedPost?.status === 'published' && (
                        <MenuItem onClick={() => handleStatusChange(selectedPost, 'draft')}>
                            <ScheduleIcon sx={{ mr: 1 }} />
                            Mover a Borrador
                        </MenuItem>
                    )}
                    {selectedPost?.status === 'draft' && (
                        <MenuItem onClick={() => handleStatusChange(selectedPost, 'published')}>
                            <ScheduleIcon sx={{ mr: 1 }} />
                            Publicar
                        </MenuItem>
                    )}
                    <MenuItem 
                        onClick={() => {
                            setPostToDelete(selectedPost);
                            setDeleteDialogOpen(true);
                            handleMenuClose();
                        }}
                        sx={{ color: 'error.main' }}
                    >
                        <DeleteIcon sx={{ mr: 1 }} />
                        Eliminar
                    </MenuItem>
                </Menu>

                {/* Delete Confirmation Dialog */}
                <Dialog 
                    open={deleteDialogOpen} 
                    onClose={() => setDeleteDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        Confirmar Eliminación
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            ¿Estás seguro de que quieres eliminar el post "{postToDelete?.title}"? 
                            Esta acción no se puede deshacer.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleDeleteConfirm} 
                            color="error" 
                            variant="contained"
                        >
                            Eliminar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </AdminLayout>
    );
};

export default PostsIndex;