import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Chip,
    IconButton,
    Button,
    Collapse,
    Divider,
    Stack,
    Tooltip,
    Badge
} from '@mui/material';
import {
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Bookmark as BookmarkIcon,
    BookmarkBorder as BookmarkBorderIcon,
    Comment as CommentIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Visibility as ViewIcon,
    Share as ShareIcon,
    OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@inertiajs/react';
import VerificationBadge from './VerificationBadge';
import ProfileComments from './ProfileComments';
import DOMPurify from 'dompurify';

const THEME = {
    primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e'
    },
    success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d'
    },
    accent: {
        rose: '#f43f5e',
        amber: '#f59e0b',
        emerald: '#10b981',
        purple: '#8b5cf6'
    },
    secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a'
    },
    text: {
        primary: '#1e293b',
        secondary: '#64748b',
        muted: '#94a3b8'
    },
    border: {
        light: '#e2e8f0',
        medium: '#cbd5e1'
    }
};

const ProfilePostCard = ({
    post,
    currentUser,
    onLike,
    onBookmark,
    onCommentLike,
    onCommentDislike,
    className = '',
    ...props
}) => {
    const [expanded, setExpanded] = useState(false);
    const [commentsExpanded, setCommentsExpanded] = useState(false);
    const [loadingInteraction, setLoadingInteraction] = useState(false);

    const handleToggleExpand = () => {
        setExpanded(!expanded);
    };

    const handleToggleComments = () => {
        setCommentsExpanded(!commentsExpanded);
    };

    const handleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!currentUser || loadingInteraction) return;
        
        setLoadingInteraction(true);
        try {
            await onLike(post);
        } finally {
            setLoadingInteraction(false);
        }
    };

    const handleBookmark = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!currentUser || loadingInteraction) return;
        
        setLoadingInteraction(true);
        try {
            await onBookmark(post);
        } finally {
            setLoadingInteraction(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const truncateContent = (content, maxLength = 300) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={className}
            {...props}
        >
            <Card
                sx={{
                    background: `linear-gradient(135deg, 
                        ${THEME.secondary[50]}95 0%, 
                        ${THEME.primary[50]}90 100%)`,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${THEME.border.light}`,
                    borderRadius: 3,
                    boxShadow: `
                        0 8px 32px ${THEME.secondary[900]}08,
                        0 4px 16px ${THEME.secondary[900]}04,
                        inset 0 1px 0 ${THEME.secondary[50]}80
                    `,
                    overflow: 'visible',
                    position: 'relative',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `
                            0 12px 40px ${THEME.secondary[900]}12,
                            0 8px 24px ${THEME.secondary[900]}08,
                            inset 0 1px 0 ${THEME.secondary[50]}80
                        `,
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar
                            src={post.author?.avatar}
                            alt={post.author?.name}
                            sx={{ 
                                width: 48, 
                                height: 48, 
                                mr: 2,
                                border: `2px solid ${THEME.primary[200]}`,
                                boxShadow: `0 4px 12px ${THEME.primary[500]}20`
                            }}
                        >
                            {post.author?.name?.charAt(0)}
                        </Avatar>
                        
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography 
                                    variant="subtitle2" 
                                    fontWeight="bold"
                                    sx={{ color: THEME.text.primary }}
                                >
                                    {post.author?.name}
                                </Typography>
                                <VerificationBadge 
                                    user={post.author} 
                                    size="small" 
                                    variant="minimal" 
                                    showText={false}
                                />
                            </Box>
                            
                            <Typography 
                                variant="caption" 
                                sx={{ color: THEME.text.muted }}
                            >
                                {formatDate(post.published_at || post.created_at)}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Tooltip title="Ver post completo">
                                <IconButton
                                    component={Link}
                                    href={`/blog/${post.slug}`}
                                    size="small"
                                    sx={{ color: THEME.text.muted }}
                                >
                                    <OpenInNewIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {/* Title */}
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                            color: THEME.text.primary,
                            mb: 1,
                            lineHeight: 1.3,
                            cursor: 'pointer'
                        }}
                        component={Link}
                        href={`/blog/${post.slug}`}
                    >
                        {post.title}
                    </Typography>

                    {/* Categories and Tags */}
                    {(post.categories?.length > 0 || post.tags?.length > 0) && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {post.categories?.map((category) => (
                                <Chip
                                    key={category.id}
                                    label={category.name}
                                    size="small"
                                    sx={{
                                        backgroundColor: category.color || THEME.primary[100],
                                        color: THEME.primary[700],
                                        fontWeight: 500,
                                        fontSize: '0.75rem'
                                    }}
                                />
                            ))}
                            {post.tags?.slice(0, 3).map((tag) => (
                                <Chip
                                    key={tag.id}
                                    label={`#${tag.name}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        borderColor: tag.color || THEME.secondary[300],
                                        color: tag.color || THEME.text.secondary,
                                        fontSize: '0.75rem'
                                    }}
                                />
                            ))}
                        </Box>
                    )}

                    {/* Content Preview */}
                    <Typography
                        variant="body2"
                        sx={{
                            color: THEME.text.secondary,
                            lineHeight: 1.6,
                            mb: 2
                        }}
                    >
                        {post.excerpt || truncateContent(post.content?.replace(/<[^>]*>/g, '') || '', 200)}
                    </Typography>

                    {/* Expandable Content */}
                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Divider sx={{ my: 2 }} />
                                <Box
                                    sx={{
                                        '& img': { maxWidth: '100%', height: 'auto' },
                                        '& p': { mb: 2 },
                                        '& h1, & h2, & h3, & h4, & h5, & h6': { 
                                            color: THEME.text.primary,
                                            mb: 1,
                                            mt: 2
                                        }
                                    }}
                                    dangerouslySetInnerHTML={{ 
                                        __html: DOMPurify.sanitize(post.content || '') 
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Stats and Actions */}
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mt: 2,
                        pt: 2,
                        borderTop: `1px solid ${THEME.border.light}`
                    }}>
                        {/* Stats */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <ViewIcon fontSize="small" sx={{ color: THEME.text.muted }} />
                                <Typography variant="caption" color="text.secondary">
                                    {post.views_count || 0}
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <FavoriteIcon fontSize="small" sx={{ color: THEME.accent.rose }} />
                                <Typography variant="caption" color="text.secondary">
                                    {post.likes_count || 0}
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CommentIcon fontSize="small" sx={{ color: THEME.text.muted }} />
                                <Typography variant="caption" color="text.secondary">
                                    {post.approved_comments_count || 0}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {currentUser && (
                                <>
                                    <Tooltip title={post.user_liked ? "Quitar me gusta" : "Me gusta"}>
                                        <IconButton
                                            onClick={handleLike}
                                            disabled={loadingInteraction}
                                            size="small"
                                            sx={{
                                                color: post.user_liked ? THEME.accent.rose : THEME.text.muted,
                                                '&:hover': {
                                                    color: THEME.accent.rose,
                                                    backgroundColor: `${THEME.accent.rose}15`
                                                }
                                            }}
                                        >
                                            {post.user_liked ? 
                                                <FavoriteIcon fontSize="small" /> : 
                                                <FavoriteBorderIcon fontSize="small" />
                                            }
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title={post.user_bookmarked ? "Quitar de guardados" : "Guardar"}>
                                        <IconButton
                                            onClick={handleBookmark}
                                            disabled={loadingInteraction}
                                            size="small"
                                            sx={{
                                                color: post.user_bookmarked ? THEME.accent.amber : THEME.text.muted,
                                                '&:hover': {
                                                    color: THEME.accent.amber,
                                                    backgroundColor: `${THEME.accent.amber}15`
                                                }
                                            }}
                                        >
                                            {post.user_bookmarked ? 
                                                <BookmarkIcon fontSize="small" /> : 
                                                <BookmarkBorderIcon fontSize="small" />
                                            }
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )}

                            <Button
                                onClick={handleToggleExpand}
                                size="small"
                                endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                sx={{
                                    color: THEME.text.secondary,
                                    '&:hover': {
                                        backgroundColor: `${THEME.primary[500]}10`
                                    }
                                }}
                            >
                                {expanded ? 'Menos' : 'Más'}
                            </Button>

                            {post.comments && post.comments.length > 0 && (
                                <Button
                                    onClick={handleToggleComments}
                                    size="small"
                                    endIcon={
                                        <Badge 
                                            badgeContent={post.approved_comments_count || 0} 
                                            color="primary"
                                            max={99}
                                        >
                                            <CommentIcon fontSize="small" />
                                        </Badge>
                                    }
                                    sx={{
                                        color: THEME.text.secondary,
                                        '&:hover': {
                                            backgroundColor: `${THEME.primary[500]}10`
                                        }
                                    }}
                                >
                                    Comentarios
                                </Button>
                            )}
                        </Box>
                    </Box>

                    {/* Comments Section */}
                    <ProfileComments
                        comments={post.comments}
                        currentUser={currentUser}
                        onCommentLike={onCommentLike}
                        onCommentDislike={onCommentDislike}
                        expanded={commentsExpanded}
                    />
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ProfilePostCard;
