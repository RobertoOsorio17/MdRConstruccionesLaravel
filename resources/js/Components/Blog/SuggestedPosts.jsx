import React from 'react';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Stack,
    Avatar,
    Chip,
    IconButton,
    Tooltip,
    Divider,
    useTheme,
    alpha
} from '@mui/material';
import {
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Comment as CommentIcon,
    Bookmark as BookmarkIcon,
    BookmarkBorder as BookmarkBorderIcon,
    AccessTime as AccessTimeIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { router } from '@inertiajs/react';
import TagsDisplay from './TagsDisplay';

const SuggestedPosts = ({ 
    posts = [], 
    title = "Posts Sugeridos",
    showTitle = true,
    layout = 'grid', // 'grid' | 'list' | 'carousel'
    maxPosts = 4
}) => {
    const theme = useTheme();

    if (!posts || posts.length === 0) {
        return null;
    }

    const displayPosts = posts.slice(0, maxPosts);

    const handlePostClick = (slug) => {
        router.get(route('blog.show', slug));
    };

    const PostCard = ({ post, index }) => {
        const isPopular = post.likes_count > 10 || post.comments_count > 5;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                    duration: 0.4, 
                    delay: index * 0.1,
                    ease: "easeOut"
                }}
                whileHover={{ 
                    y: -4,
                    transition: { duration: 0.2 }
                }}
            >
                <Card
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: layout === 'list' ? 'row' : 'column',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                            boxShadow: theme.shadows[8],
                            '& .post-image': {
                                transform: 'scale(1.05)',
                            },
                            '& .post-content': {
                                '& .post-title': {
                                    color: theme.palette.primary.main,
                                }
                            }
                        },
                        transition: 'all 0.3s ease-in-out',
                    }}
                    onClick={() => handlePostClick(post.slug)}
                >
                    {/* Popular Badge */}
                    {isPopular && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                zIndex: 2,
                            }}
                        >
                            <Tooltip title="Post Popular">
                                <Chip
                                    icon={<TrendingUpIcon sx={{ fontSize: '14px !important' }} />}
                                    label="Popular"
                                    size="small"
                                    color="error"
                                    sx={{
                                        fontSize: '0.65rem',
                                        height: 20,
                                        fontWeight: 600,
                                        boxShadow: theme.shadows[2],
                                    }}
                                />
                            </Tooltip>
                        </Box>
                    )}

                    {/* Image */}
                    <CardMedia
                        component="img"
                        image={post.cover_image || '/images/blog/default.jpg'}
                        alt={post.title}
                        loading="lazy"
                        className="post-image"
                        sx={{
                            height: layout === 'list' ? 140 : 200,
                            width: layout === 'list' ? 200 : '100%',
                            flexShrink: 0,
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease-in-out',
                        }}
                    />

                    {/* Content */}
                    <CardContent
                        className="post-content"
                        sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            p: 2,
                        }}
                    >
                        {/* Author & Date */}
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar
                                src={post.author?.avatar}
                                alt={post.author?.name}
                                sx={{ width: 24, height: 24 }}
                            >
                                {post.author?.name?.charAt(0)}
                            </Avatar>
                            <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ fontSize: '0.75rem' }}
                            >
                                {post.author?.name}
                            </Typography>
                            <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ fontSize: '0.75rem' }}
                            >
                                • {post.published_at}
                            </Typography>
                        </Stack>

                        {/* Title */}
                        <Typography
                            variant="h6"
                            className="post-title"
                            sx={{
                                fontSize: '1rem',
                                fontWeight: 600,
                                lineHeight: 1.3,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                transition: 'color 0.2s ease-in-out',
                            }}
                        >
                            {post.title}
                        </Typography>

                        {/* Excerpt */}
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontSize: '0.875rem',
                                lineHeight: 1.4,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                flex: 1,
                            }}
                        >
                            {post.excerpt}
                        </Typography>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <TagsDisplay
                                tags={post.tags}
                                size="small"
                                variant="outlined"
                                maxTags={3}
                                clickable={false}
                                spacing={0.5}
                            />
                        )}

                        <Divider sx={{ my: 1 }} />

                        {/* Stats & Actions */}
                        <Stack 
                            direction="row" 
                            alignItems="center" 
                            justifyContent="space-between"
                        >
                            <Stack direction="row" alignItems="center" spacing={2}>
                                {/* Reading Time */}
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                        {post.reading_time}
                                    </Typography>
                                </Stack>

                                {/* Comments Count */}
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <CommentIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                        {post.comments_count || 0}
                                    </Typography>
                                </Stack>

                                {/* Likes Count */}
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <FavoriteIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                        {post.likes_count || 0}
                                    </Typography>
                                </Stack>
                            </Stack>

                            {/* Categories */}
                            {post.categories && post.categories.length > 0 && (
                                <Chip
                                    label={post.categories[0].name}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        fontSize: '0.625rem',
                                        height: 18,
                                        borderColor: post.categories[0].color || theme.palette.primary.main,
                                        color: post.categories[0].color || theme.palette.primary.main,
                                    }}
                                />
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    return (
        <Box>
            {showTitle && (
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Typography
                        variant="h4"
                        component="h2"
                        sx={{
                            fontWeight: 700,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1,
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Descubre más contenido que podría interesarte
                    </Typography>
                </Box>
            )}

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: layout === 'list' ? '1fr' : 'repeat(2, 1fr)',
                        md: layout === 'list' ? '1fr' : `repeat(${Math.min(maxPosts, 3)}, 1fr)`,
                        lg: layout === 'list' ? '1fr' : `repeat(${Math.min(maxPosts, 4)}, 1fr)`,
                    },
                    gap: 3,
                }}
            >
                {displayPosts.map((post, index) => (
                    <PostCard key={post.id} post={post} index={index} />
                ))}
            </Box>
        </Box>
    );
};

export default SuggestedPosts;