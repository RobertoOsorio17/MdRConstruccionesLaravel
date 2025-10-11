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
    Paper,
    Snackbar,
    Alert
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
    Category as CategoryIcon,
    TrendingUp as TrendingUpIcon,
    Article as ArticleIcon,
    Schedule as ScheduledIcon,
    Comment as CommentIcon,
    Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';

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
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar(prev => ({
            ...prev,
            open: false,
        }));
    };

    // Glassmorphism styles
    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    };

    const glassStatCard = {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        },
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    };

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
            await fetch(`/admin/posts/${post.slug}/toggle-featured`, {
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
            const response = await fetch(`/admin/posts/${post.slug}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(data?.message || 'No se pudo actualizar el estado del post.');
            }

            const successMessage = newStatus === 'published'
                ? 'Post publicado correctamente.'
                : newStatus === 'draft'
                    ? 'El post se movio a borradores.'
                    : 'Estado del post actualizado.';

            showSnackbar(successMessage, 'success');
            router.reload({ only: ['posts'] });
        } catch (error) {
            console.error('Error changing status:', error);
            showSnackbar(error.message || 'Ocurrio un error al cambiar el estado.', 'error');
        } finally {
            handleMenuClose();
        }
    };


    const handleDuplicate = () => {
        if (selectedPost) {
            router.post(`/admin/posts/${selectedPost.slug}/duplicate`);
        }
        handleMenuClose();
    };

    const handleDeleteConfirm = () => {
        if (postToDelete) {
            router.delete(`/admin/posts/${postToDelete.slug}`);
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
        <AdminLayoutNew title="GestiÃ³n de Posts">
            <Head title="GestiÃ³n de Posts - Admin" />

            <Box
                component={motion.div}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                GestiÃ³n de Posts
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Administra todos los artÃ­culos del blog
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            href="/admin/posts/create"
                            size="large"
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '12px',
                                px: 3,
                                py: 1.5,
                                fontWeight: 600,
                                textTransform: 'none',
                                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                                },
                            }}
                        >
                            Nuevo Post
                        </Button>
                    </Box>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            component={motion.div}
                            variants={itemVariants}
                            sx={{
                                ...glassStatCard,
                                p: 3,
                                textAlign: 'center',
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2,
                                color: '#667eea'
                            }}>
                                <ArticleIcon sx={{ fontSize: 40 }} />
                            </Box>
                            <Typography variant="h3" fontWeight="bold" sx={{ color: '#2D3748', mb: 1 }}>
                                {stats.total}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#718096', fontWeight: 500 }}>
                                Total Posts
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            component={motion.div}
                            variants={itemVariants}
                            sx={{
                                ...glassStatCard,
                                p: 3,
                                textAlign: 'center',
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2,
                                color: '#48BB78'
                            }}>
                                <TrendingUpIcon sx={{ fontSize: 40 }} />
                            </Box>
                            <Typography variant="h3" fontWeight="bold" sx={{ color: '#2D3748', mb: 1 }}>
                                {stats.published}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#718096', fontWeight: 500 }}>
                                Publicados
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            component={motion.div}
                            variants={itemVariants}
                            sx={{
                                ...glassStatCard,
                                p: 3,
                                textAlign: 'center',
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2,
                                color: '#F6AD55'
                            }}>
                                <EditIcon sx={{ fontSize: 40 }} />
                            </Box>
                            <Typography variant="h3" fontWeight="bold" sx={{ color: '#2D3748', mb: 1 }}>
                                {stats.draft}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#718096', fontWeight: 500 }}>
                                Borradores
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            component={motion.div}
                            variants={itemVariants}
                            sx={{
                                ...glassStatCard,
                                p: 3,
                                textAlign: 'center',
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2,
                                color: '#4299E1'
                            }}>
                                <ScheduledIcon sx={{ fontSize: 40 }} />
                            </Box>
                            <Typography variant="h3" fontWeight="bold" sx={{ color: '#2D3748', mb: 1 }}>
                                {stats.scheduled}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#718096', fontWeight: 500 }}>
                                Programados
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Engagement Stats - Segunda Fila */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            component={motion.div}
                            variants={itemVariants}
                            sx={{
                                ...glassStatCard,
                                p: 2.5,
                                textAlign: 'center',
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 1.5,
                                color: '#E53E3E'
                            }}>
                                <FavoriteIcon sx={{ fontSize: 32 }} />
                            </Box>
                            <Typography variant="h4" fontWeight="bold" sx={{ color: '#2D3748', mb: 0.5 }}>
                                {posts?.data?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#718096', fontWeight: 500 }}>
                                Total Likes
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            component={motion.div}
                            variants={itemVariants}
                            sx={{
                                ...glassStatCard,
                                p: 2.5,
                                textAlign: 'center',
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 1.5,
                                color: '#38B2AC'
                            }}>
                                <CommentIcon sx={{ fontSize: 32 }} />
                            </Box>
                            <Typography variant="h4" fontWeight="bold" sx={{ color: '#2D3748', mb: 0.5 }}>
                                {posts?.data?.reduce((sum, post) => sum + (post.comments_count || 0), 0) || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#718096', fontWeight: 500 }}>
                                Total Comentarios
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            component={motion.div}
                            variants={itemVariants}
                            sx={{
                                ...glassStatCard,
                                p: 2.5,
                                textAlign: 'center',
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 1.5,
                                color: '#D69E2E'
                            }}>
                                <StarIcon sx={{ fontSize: 32 }} />
                            </Box>
                            <Typography variant="h4" fontWeight="bold" sx={{ color: '#2D3748', mb: 0.5 }}>
                                {posts?.data?.filter(post => post.is_featured).length || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#718096', fontWeight: 500 }}>
                                Posts Destacados
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper
                            component={motion.div}
                            variants={itemVariants}
                            sx={{
                                ...glassStatCard,
                                p: 2.5,
                                textAlign: 'center',
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 1.5,
                                color: '#805AD5'
                            }}>
                                <VisibilityIcon sx={{ fontSize: 32 }} />
                            </Box>
                            <Typography variant="h4" fontWeight="bold" sx={{ color: '#2D3748', mb: 0.5 }}>
                                {posts?.data?.reduce((sum, post) => sum + (post.views_count || 0), 0) || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#718096', fontWeight: 500 }}>
                                Total Vistas
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Paper
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                        ...glassStyle,
                        p: 3,
                        mb: 4
                    }}
                >
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={4}>
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
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '12px',
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#667eea',
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    value={selectedStatus}
                                    label="Estado"
                                    onChange={(e) => {
                                        setSelectedStatus(e.target.value);
                                        handleFilter('status', e.target.value);
                                    }}
                                    sx={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '12px',
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#667eea',
                                        },
                                    }}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="published">Publicado</MenuItem>
                                    <MenuItem value="draft">Borrador</MenuItem>
                                    <MenuItem value="scheduled">Programado</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>CategorÃ­a</InputLabel>
                                <Select
                                    value={selectedCategory}
                                    label="CategorÃ­a"
                                    onChange={(e) => {
                                        setSelectedCategory(e.target.value);
                                        handleFilter('category', e.target.value);
                                    }}
                                    sx={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '12px',
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#667eea',
                                        },
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
                        <Grid item xs={12} md={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleSearch}
                                sx={{
                                    py: 1.8,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                                    '&:hover': {
                                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                    },
                                }}
                            >
                                Filtrar
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Posts Grid */}
                <Grid container spacing={3}>
                    {posts.data.map((post) => (
                        <Grid item xs={12} md={6} lg={4} key={post.id}>
                            <Card
                                component={motion.div}
                                variants={itemVariants}
                                whileHover={{ y: -4 }}
                                sx={{
                                    ...glassStyle,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        boxShadow: '0 12px 40px rgba(31, 38, 135, 0.5)',
                                        background: 'rgba(255, 255, 255, 0.3)',
                                    },
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
                                        bgcolor: alpha('#ffffff', 0.9),
                                        '&:hover': { bgcolor: '#ffffff' }
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
                                        href={`/admin/posts/${post.slug}/edit`}
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
                    <Box
                        component={motion.div}
                        variants={itemVariants}
                        sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}
                    >
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
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    fontWeight: 600,
                                    '&:hover': {
                                        background: 'rgba(255, 255, 255, 0.3)',
                                    },
                                    '&.Mui-selected': {
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: '#fff',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        },
                                    },
                                },
                            }}
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
                    <MenuItem onClick={() => window.location.href = `/admin/posts/${selectedPost?.slug}/edit`}>
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
                    PaperProps={{
                        sx: {
                            ...glassStyle,
                            borderRadius: '16px',
                        }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
                        Confirmar EliminaciÃ³n
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            Â¿EstÃ¡s seguro de que quieres eliminar el post "{postToDelete?.title}"?
                            Esta acciÃ³n no se puede deshacer.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button
                            onClick={() => setDeleteDialogOpen(false)}
                            sx={{
                                borderRadius: '12px',
                                px: 3,
                                fontWeight: 600,
                                textTransform: 'none',
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            color="error"
                            variant="contained"
                            sx={{
                                borderRadius: '12px',
                                px: 3,
                                fontWeight: 600,
                                textTransform: 'none',
                                boxShadow: '0 4px 16px rgba(229, 62, 62, 0.3)',
                                '&:hover': {
                                    boxShadow: '0 6px 20px rgba(229, 62, 62, 0.4)',
                                },
                            }}
                        >
                            Eliminar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </AdminLayoutNew>
    );
};

export default PostsIndex;






