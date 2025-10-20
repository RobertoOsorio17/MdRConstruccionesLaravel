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
    FavoriteOutlined as LikeIcon,
    Visibility as ViewIcon,
    Favorite as FavoriteIcon,
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
        try {
            await axios.post(`/posts/${post.slug}/like`); // ✅ FIX: Use slug instead of id
            onRemove(post.id);
            setRemoveDialogOpen(false);
        } catch (error) {
            console.error('Error removing like:', error);
        }
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
                        borderRadius: 3,
                        overflow: 'hidden',
                        background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[8]
                        }
                    }}
                >
                    {post.cover_image && (
                        <CardMedia
                            component="img"
                            height="200"
                            image={post.cover_image}
                            alt={post.title}
                            sx={{ objectFit: 'cover' }}
                        />
                    )}
                    
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            {post.categories?.map((category) => (
                                <Chip
                                    key={category.id}
                                    label={category.name}
                                    size="small"
                                    sx={{
                                        mr: 1,
                                        backgroundColor: category.color || theme.palette.primary.main,
                                        color: 'white',
                                        fontWeight: 600
                                    }}
                                />
                            ))}
                        </Box>

                        <Typography 
                            variant="h6" 
                            component="h3" 
                            gutterBottom
                            sx={{ 
                                fontWeight: 700,
                                lineHeight: 1.3,
                                color: theme.palette.text.primary,
                                mb: 2
                            }}
                        >
                            {post.title}
                        </Typography>

                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                                mb: 2,
                                lineHeight: 1.6,
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}
                        >
                            {post.excerpt}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Avatar 
                                src={post.author?.avatar} 
                                sx={{ width: 24, height: 24 }}
                            >
                                <PersonIcon />
                            </Avatar>
                            <Typography variant="caption" color="text.secondary">
                                {post.author?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                •
                            </Typography>
                            <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                                {new Date(post.published_at).toLocaleDateString('es-ES')}
                            </Typography>
                        </Box>
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                        <Button
                            component={Link}
                            href={`/blog/${post.slug}`}
                            variant="outlined"
                            startIcon={<ViewIcon />}
                            size="small"
                            sx={{ borderRadius: 2 }}
                        >
                            Leer
                        </Button>
                        
                        <IconButton
                            onClick={() => setRemoveDialogOpen(true)}
                            color="error"
                            size="small"
                            sx={{ 
                                '&:hover': { 
                                    backgroundColor: alpha(theme.palette.error.main, 0.1) 
                                } 
                            }}
                        >
                            <FavoriteIcon />
                        </IconButton>
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
                    <Typography variant="h6" fontWeight="bold">
                        Quitar de Me Gusta
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Estás seguro de que quieres quitar este post de tu lista de me gusta?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button 
                        onClick={() => setRemoveDialogOpen(false)}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleRemove}
                        variant="contained"
                        color="error"
                        sx={{ borderRadius: 2 }}
                    >
                        Quitar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const LikedPosts = ({ likedPosts, categories, filters }) => {
    const theme = useTheme();
    // const { showNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [posts, setPosts] = useState(likedPosts.data);

    const handleSearch = () => {
        router.get(route('user.liked-posts'), {
            search: searchTerm,
            category: selectedCategory,
            per_page: filters.per_page
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        router.get(route('user.liked-posts'), {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleRemovePost = (postId) => {
        setPosts(posts.filter(post => post.id !== postId));
        console.log('Post eliminado de me gusta');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Posts que Me Gustan" />
            
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper 
                        elevation={0}
                        sx={{ 
                            p: 4,
                            borderRadius: 3,
                            background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        }}
                    >
                        <Box sx={{ mb: 4 }}>
                            <Typography 
                                variant="h4" 
                                component="h1" 
                                gutterBottom
                                sx={{ 
                                    fontWeight: 800,
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1
                                }}
                            >
                                Posts que Me Gustan
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Todos los artículos que has marcado como me gusta
                            </Typography>
                        </Box>

                        {/* Filters */}
                        <Box sx={{ mb: 4 }}>
                            <Grid container spacing={2} alignItems="center">
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
                                                borderRadius: 2,
                                                backgroundColor: alpha(theme.palette.background.paper, 0.8)
                                            } 
                                        }}
                                    />
                                </Grid>
                                
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>Categoría</InputLabel>
                                        <Select
                                            value={selectedCategory}
                                            label="Categoría"
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            sx={{ 
                                                borderRadius: 2,
                                                backgroundColor: alpha(theme.palette.background.paper, 0.8)
                                            }}
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
                                
                                <Grid item xs={12} md={5}>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleSearch}
                                            startIcon={<FilterIcon />}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Filtrar
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={handleClearFilters}
                                            startIcon={<ClearIcon />}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Limpiar
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Posts Grid */}
                        {posts.length > 0 ? (
                            <>
                                <Grid container spacing={3}>
                                    {posts.map((post) => (
                                        <Grid item key={post.id} xs={12} sm={6} md={4}>
                                            <PostCard 
                                                post={post} 
                                                onRemove={handleRemovePost}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* Pagination */}
                                {likedPosts.last_page > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                        <Pagination
                                            count={likedPosts.last_page}
                                            page={likedPosts.current_page}
                                            onChange={(event, page) => {
                                                router.get(route('user.liked-posts'), {
                                                    ...filters,
                                                    page
                                                });
                                            }}
                                            color="primary"
                                            size="large"
                                        />
                                    </Box>
                                )}
                            </>
                        ) : (
                            <Box 
                                sx={{ 
                                    textAlign: 'center', 
                                    py: 8,
                                    color: 'text.secondary'
                                }}
                            >
                                <FavoriteIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                                <Typography variant="h6" gutterBottom>
                                    No tienes posts marcados como me gusta
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3 }}>
                                    Explora nuestro blog y marca los artículos que te gusten
                                </Typography>
                                <Button
                                    component={Link}
                                    href="/blog"
                                    variant="contained"
                                    sx={{ borderRadius: 2 }}
                                >
                                    Explorar Blog
                                </Button>
                            </Box>
                        )}
                    </Paper>
                </motion.div>
            </Container>
        </AuthenticatedLayout>
    );
};

export default LikedPosts;
