import React, { useState } from 'react';
import {

    Card,
    CardContent,
    CardActions,
    CardMedia,
    Typography,
    Button,
    IconButton,
    Chip,
    Box,
    Avatar,
    TextField,
    InputAdornment,
    Divider,
    ToggleButton,
    ToggleButtonGroup,
    useTheme
} from '@mui/material';
import {
    FavoriteOutlined,
    FavoriteBorderOutlined,
    BookmarkBorderOutlined,
    BookmarkOutlined,
    ShareOutlined,
    SearchOutlined,
    VisibilityOutlined,
    CommentOutlined,
    AccessTimeOutlined,
    ArticleOutlined as ArticleOutlinedIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import designSystem from '@/theme/designSystem';

const THEME = {
    primary: designSystem.colors.primary[600],
    secondary: designSystem.colors.secondary[500],
    accent: designSystem.colors.accent.amber[500],
    success: designSystem.colors.success[600],
    error: designSystem.colors.error[500],
    surface: designSystem.colors.surface.primary,
    background: designSystem.colors.surface.secondary,
    text: {
        primary: designSystem.colors.text.primary,
        secondary: designSystem.colors.text.secondary,
        light: designSystem.colors.text.muted
    }
};

const PostsTab = ({ posts = [], currentUser, onLike, onBookmark, onShare }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const GLASS = isDark ? designSystem.glassmorphism.dark : designSystem.glassmorphism.light;
    const BORDER_SOFT = isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.2)';
    const HOVER_BG = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState(null); // null = todas
    const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'views' | 'likes'

    const categories = React.useMemo(() => {
        const map = new Map();
        (posts || []).forEach(p => {
            (p.categories || []).forEach(c => {
                if (c && !map.has(c.id)) map.set(c.id, c);
            });
        });
        return Array.from(map.values());
    }, [posts]);

    const filteredPosts = React.useMemo(() => {
        let arr = posts || [];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            arr = arr.filter(post =>
                post.title.toLowerCase().includes(term) ||
                post.excerpt?.toLowerCase().includes(term)
            );
        }
        if (activeCategory) {
            arr = arr.filter(p => (p.categories || []).some(c => c.id === activeCategory));
        }
        const sorted = [...arr];
        if (sortBy === 'views') {
            sorted.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
        } else if (sortBy === 'likes') {
            sorted.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        } else {
            sorted.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
        }
        return sorted;
    }, [posts, searchTerm, activeCategory, sortBy]);

    const handleLike = async (post) => {
        if (onLike) {
            await onLike(post.id);
        }
    };

    const handleBookmark = async (post) => {
        if (onBookmark) {
            await onBookmark(post.id);
        }
    };

    const handleShare = (post) => {
        if (onShare) {
            onShare(post);
        }
    };
    return (
        <Box sx={{ width: '100%' }}>
            {/* Search Bar */}
            <Box sx={{ mb: 4 }}>
                <TextField
                    fullWidth
                    placeholder="Buscar posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchOutlined sx={{ color: theme.palette.text.secondary }} />
                            </InputAdornment>
                        ),
                        sx: {
                            ...GLASS,
                            borderRadius: 3,
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: BORDER_SOFT,
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.35)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: THEME.primary,
                                borderWidth: 2,
                            }
                        }
                    }}
                />
            </Box>

            {/* Filters & Sort Bar */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    mb: 3,
                    flexWrap: 'wrap'
                }}
            >
                {/* Categories (horizontal scroll) */}
                <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, flex: 1, pr: 1 }}>
                    <Chip
                        label="Todos"
                        onClick={() => setActiveCategory(null)}
                        color={activeCategory === null ? 'primary' : 'default'}
                        variant={activeCategory === null ? 'filled' : 'outlined'}
                        sx={{
                            borderRadius: '999px',
                            backdropFilter: 'blur(8px)',
                            borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)'
                        }}
                    />
                    {categories.map((cat) => (
                        <Chip
                            key={cat.id}
                            label={cat.name}
                            onClick={() => setActiveCategory(cat.id)}
                            color={activeCategory === cat.id ? 'primary' : 'default'}
                            variant={activeCategory === cat.id ? 'filled' : 'outlined'}
                            sx={{
                                borderRadius: '999px',
                                backdropFilter: 'blur(8px)',
                                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)'
                            }}
                        />
                    ))}
                </Box>

                {/* Sort control */}
                <ToggleButtonGroup
                    color="primary"
                    value={sortBy}
                    exclusive
                    onChange={(e, val) => val && setSortBy(val)}
                    size="small"
                    sx={{
                        ...GLASS,
                        borderRadius: 2,
                        border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.25)',
                        '& .MuiToggleButtonGroup-grouped': {
                            border: 0,
                            mx: 0.25,
                            borderRadius: 1,
                        }
                    }}
                >
                    <ToggleButton value="recent">Recientes</ToggleButton>
                    <ToggleButton value="views">Más vistos</ToggleButton>
                    <ToggleButton value="likes">Más valorados</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Posts Grid - 3 columns on desktop */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 3,
                    alignItems: 'stretch'
                }}
            >
                <AnimatePresence>
                    {filteredPosts.map((post, index) => (
                        <Box key={post.id} sx={{ height: '100%' }}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                style={{ height: '100%' }}
                            >
                                <Card
                                    sx={{
                                        height: 580,
                                        minHeight: 580,
                                        maxHeight: 580,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: 4,
                                        overflow: 'hidden',
                                        position: 'relative',
                                        '&::before': { content: '""', position: 'absolute', top: 0, left: '-150%', width: '50%', height: '100%', background: 'linear-gradient(120deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.20) 50%, rgba(255,255,255,0.05) 100%)', transform: 'skewX(-20deg)', transition: 'left 0.6s ease', pointerEvents: 'none' },
                                        '&:hover::before': { left: '150%' },
                                        ...GLASS,
                                        border: BORDER_SOFT,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-6px)',
                                            boxShadow: designSystem.shadows.colored.primaryHover,
                                            borderColor: THEME.primary,
                                        }
                                    }}
                                >
                                    {/* Featured Image or Placeholder - ALWAYS 220px */}
                                    <Box sx={{ position: 'relative', overflow: 'hidden', height: 220, flexShrink: 0 }}>
                                        {post.featured_image ? (
                                            <CardMedia
                                                component="img"
                                                height="220"
                                                image={post.featured_image}
                                                alt={post.title}
                                                sx={{
                                                    objectFit: 'cover',
                                                    width: '100%',
                                                    height: '100%',
                                                    transition: 'transform 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'scale(1.05)',
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    background: `linear-gradient(135deg, ${THEME.primary}20 0%, ${THEME.accent}20 100%)`,
                                                    display: 'flex',
                                                    alignItems: 'center',


                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <ArticleOutlinedIcon sx={{ fontSize: 64, color: theme.palette.text.secondary }} />
                                            </Box>
                                        )}
                                        {/* Gradient Overlay with Categories */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                                                p: 2,
                                                display: 'flex',
                                                gap: 1,
                                                flexWrap: 'wrap',
                                                minHeight: 56
                                            }}
                                        >
                                            {post.categories?.slice(0, 2).map((category) => (
                                                <Chip
                                                    key={category.id}
                                                    label={category.name}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: category.color || THEME.primary,
                                                        color: 'white',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        height: 24,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>

                                    <CardContent sx={{
                                        flexGrow: 1,
                                        p: 3,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minHeight: 0, // âœ… Allow flex children to shrink properly
                                        overflow: 'hidden' // âœ… Prevent content overflow
                                    }}>
                                        {/* Author & Date - FIXED HEIGHT */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5, minHeight: 36, flexShrink: 0 }}>
                                            <Avatar
                                                src={post.author?.avatar}
                                                sx={{ width: 36, height: 36 }}
                                            >
                                                {post.author?.name?.charAt(0)}
                                            </Avatar>
                                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: theme.palette.text.primary,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {post.author?.name}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <AccessTimeOutlined sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                                                    <Typography variant="caption" color={theme.palette.text.secondary}>
                                                        {format(new Date(post.published_at), 'dd MMM yyyy', { locale: es })}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Title - FIXED HEIGHT (2 lines) */}
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: '1.25rem',
                                                color: theme.palette.text.primary,
                                                mb: 1.5, // âœ… Reduced margin
                                                lineHeight: 1.4,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                height: '2.8em', // âœ… Fixed height (1.4 * 2 = 2.8em)
                                                flexShrink: 0
                                            }}
                                        >
                                            {post.title}
                                        </Typography>

                                        {/* Excerpt - FIXED HEIGHT (3 lines) */}
                                        <Typography
                                            variant="body2"
                                            color={theme.palette.text.secondary}
                                            sx={{
                                                mb: 1.5, // âœ… Reduced margin
                                                lineHeight: 1.6,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                height: '4.8em', // âœ… Fixed height (1.6 * 3 = 4.8em)
                                                flexShrink: 0
                                            }}
                                        >
                                            {post.excerpt || post.content?.substring(0, 120) + '...'}
                                        </Typography>

                                        <Divider sx={{ my: 1.5, flexShrink: 0 }} />

                                        {/* Stats - FIXED HEIGHT */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, minHeight: 24, flexShrink: 0 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <VisibilityOutlined sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                                                <Typography variant="body2" fontWeight={600} color={theme.palette.text.secondary}>
                                                    {post.views_count || 0}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <FavoriteOutlined sx={{ fontSize: 18, color: THEME.error }} />
                                                <Typography variant="body2" fontWeight={600} color={theme.palette.text.secondary}>
                                                    {post.likes_count || 0}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <CommentOutlined sx={{ fontSize: 18, color: THEME.primary }} />
                                                <Typography variant="body2" fontWeight={600} color={theme.palette.text.secondary}>
                                                    {post.approved_comments_count || 0}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>

                                    <CardActions sx={{
                                        p: 2,
                                        pt: 0,
                                        gap: 1,
                                        justifyContent: 'space-between',
                                        flexShrink: 0,
                                        minHeight: 56 // âœ… Fixed minimum height for actions
                                    }}>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleLike(post)}
                                                sx={{
                                                    color: post.user_liked ? THEME.error : theme.palette.text.secondary,
                                                    bgcolor: post.user_liked ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                                    '&:hover': {
                                                        bgcolor: post.user_liked ? 'rgba(239, 68, 68, 0.2)' : HOVER_BG,
                                                        transform: 'scale(1.1)',
                                                    },
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {post.user_liked ? <FavoriteOutlined /> : <FavoriteBorderOutlined />}
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleBookmark(post)}
                                                sx={{
                                                    color: post.user_bookmarked ? THEME.accent : theme.palette.text.secondary,
                                                    bgcolor: post.user_bookmarked ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                                                    '&:hover': {
                                                        bgcolor: post.user_bookmarked ? 'rgba(245, 158, 11, 0.2)' : HOVER_BG,
                                                        transform: 'scale(1.1)',
                                                    },
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {post.user_bookmarked ? <BookmarkOutlined /> : <BookmarkBorderOutlined />}
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleShare(post)}
                                                sx={{
                                                    color: theme.palette.text.secondary,
                                                    '&:hover': {
                                                        bgcolor: HOVER_BG,
                                                        transform: 'scale(1.1)',
                                                    },
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <ShareOutlined />
                                            </IconButton>
                                        </Box>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            href={`/blog/${post.slug}`}
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                px: 2.5,
                                                background: designSystem.gradients.primaryLight,
                                                boxShadow: `0 4px 12px ${designSystem.colors.primary[600]}40`,
                                                '&:hover': {
                                                    background: `linear-gradient(135deg, ${designSystem.colors.primary[700]} 0%, ${designSystem.colors.primary[600]} 100%)`,
                                                    boxShadow: `0 6px 16px ${designSystem.colors.primary[600]}50`,
                                                    transform: 'translateY(-2px)',
                                                },
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            Leer más
                                        </Button>
                                    </CardActions>
                                </Card>
                            </motion.div>
                        </Box>
                    ))}
                </AnimatePresence>
            </Box>

            {/* Empty State */}
            {filteredPosts.length === 0 && (
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 12,
                        ...GLASS,
                        borderRadius: 4,
                        border: BORDER_SOFT
                    }}
                >
                    <ArticleOutlinedIcon sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
                    <Typography variant="h5" color={theme.palette.text.secondary} gutterBottom fontWeight={600}>
                        {searchTerm ? 'No se encontraron posts' : 'No hay posts publicados'}
                    </Typography>
                    <Typography variant="body1" color={theme.palette.text.secondary}>
                        {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los posts aparecerán aquí cuando sean publicados'}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default PostsTab;

