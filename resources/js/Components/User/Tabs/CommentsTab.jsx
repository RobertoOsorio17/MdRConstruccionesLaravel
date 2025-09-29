import React, { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    IconButton,
    Box,
    Avatar,
    TextField,
    InputAdornment,
    Divider,
    Pagination,
    CircularProgress
} from '@mui/material';
import {
    ThumbUpOutlined,
    ThumbUpAlt,
    ThumbDownOutlined,
    ThumbDownAlt,
    SearchOutlined,
    CommentOutlined,
    LaunchOutlined,
    VerifiedOutlined
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const THEME = {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#f59e0b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: 'rgba(255, 255, 255, 0.05)',
    surface: 'rgba(255, 255, 255, 0.1)',
    glass: 'rgba(255, 255, 255, 0.15)',
    text: {
        primary: '#1e293b',
        secondary: '#64748b',
        light: '#94a3b8'
    }
};

const CommentsTab = ({
    comments = [],
    currentUser,
    onLikeComment,
    onDislikeComment,
    profileUserId,
    isOwnProfile = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [paginatedComments, setPaginatedComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1
    });


    // Fetch paginated comments from API
    const fetchComments = async (page = 1, search = '') => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page,
                per_page: pagination.per_page,
                search: search
            });

            const endpoint = isOwnProfile
                ? `/api/user/comments?${params}`
                : `/api/user/${profileUserId}/comments?${params}`;

            const response = await fetch(endpoint);
            const data = await response.json();

            if (data.success) {
                setPaginatedComments(data.comments.data);
                setPagination({
                    current_page: data.comments.current_page,
                    per_page: data.comments.per_page,
                    total: data.comments.total,
                    last_page: data.comments.last_page,
                });
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            // Fallback to client-side filtering if API fails
            const filtered = comments.filter(comment => {
                if (!comment) return false;
                const commentText = comment.content || comment.body;
                if (!commentText) return false;
                const contentMatch = commentText.toLowerCase().includes(search.toLowerCase());
                const titleMatch = comment.post?.title?.toLowerCase().includes(search.toLowerCase()) || false;
                return contentMatch || titleMatch;
            });
            setPaginatedComments(filtered.slice((page - 1) * pagination.per_page, page * pagination.per_page));
        } finally {
            setLoading(false);
        }
    };

    // Initialize with comments prop if no API available
    useEffect(() => {
        if (comments.length > 0) {
            // Use client-side pagination as fallback
            const startIndex = (pagination.current_page - 1) * pagination.per_page;
            const endIndex = startIndex + pagination.per_page;
            const filtered = comments.filter(comment => {
                if (!comment) return false;
                const commentText = comment.content || comment.body;
                if (!commentText) return false;
                const contentMatch = commentText.toLowerCase().includes(searchTerm.toLowerCase());
                const titleMatch = comment.post?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
                return contentMatch || titleMatch;
            });
            setPaginatedComments(filtered.slice(startIndex, endIndex));
            setPagination(prev => ({
                ...prev,
                total: filtered.length,
                last_page: Math.ceil(filtered.length / prev.per_page)
            }));
        } else {
            // Try to fetch from API
            fetchComments(1, searchTerm);
        }
    }, [comments, searchTerm, pagination.current_page]);

    const handlePageChange = (event, newPage) => {
        setPagination(prev => ({ ...prev, current_page: newPage }));
        fetchComments(newPage, searchTerm);
    };

    const handleSearchChange = (e) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        setPagination(prev => ({ ...prev, current_page: 1 }));
        fetchComments(1, newSearchTerm);
    };

    const handleLikeComment = async (comment) => {
        if (onLikeComment) {
            await onLikeComment(comment.id);
        }
    };

    const handleDislikeComment = async (comment) => {
        if (onDislikeComment) {
            await onDislikeComment(comment.id);
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Search Bar */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Buscar comentarios..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchOutlined sx={{ color: THEME.text.secondary }} />
                            </InputAdornment>
                        ),
                        sx: {
                            backgroundColor: THEME.glass,
                            backdropFilter: 'blur(10px)',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                border: `2px solid ${THEME.primary}`,
                            }
                        }
                    }}
                />
            </Box>

            {/* Loading State */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: THEME.primary }} />
                </Box>
            )}

            {/* Comments Grid - Professional Layout */}
            {!loading && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <AnimatePresence>
                        {paginatedComments.map((comment, index) => (
                        <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ y: -2 }}
                        >
                            <Card
                                sx={{
                                    backgroundColor: THEME.glass,
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        backgroundColor: THEME.surface,
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                                        transform: 'translateY(-2px)',
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    {/* Header Section */}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                                        <Avatar
                                            src={comment.user?.avatar}
                                            sx={{
                                                width: 52,
                                                height: 52,
                                                backgroundColor: THEME.primary,
                                                fontSize: '1.2rem',
                                                fontWeight: 700,
                                                border: '3px solid rgba(255, 255, 255, 0.2)',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                            }}
                                        >
                                            {comment.user?.name?.charAt(0) || comment.author_name?.charAt(0) || 'U'}
                                        </Avatar>

                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            {/* User Info Row */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight={700}
                                                    color={THEME.text.primary}
                                                    sx={{ fontSize: '1rem' }}
                                                >
                                                    {comment.user?.name || comment.author_name || 'Usuario'}
                                                </Typography>
                                                {comment.user?.is_verified && (
                                                    <VerifiedOutlined sx={{ fontSize: 18, color: THEME.success }} />
                                                )}
                                                <Box sx={{
                                                    width: 4,
                                                    height: 4,
                                                    borderRadius: '50%',
                                                    backgroundColor: THEME.text.light
                                                }} />
                                                <Typography variant="body2" color={THEME.text.light}>
                                                    {format(new Date(comment.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                                                </Typography>
                                            </Box>

                                            {/* Post Context */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                <Typography variant="body2" color={THEME.text.secondary}>
                                                    Comentario en:
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color={THEME.primary}
                                                    sx={{
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        textDecoration: 'none',
                                                        '&:hover': {
                                                            textDecoration: 'underline',
                                                            color: THEME.secondary
                                                        },
                                                        maxWidth: '300px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                    onClick={() => {
                                                        if (comment.post?.slug) {
                                                            window.open(`/blog/${comment.post.slug}#comment-${comment.id}`, '_blank');
                                                        }
                                                    }}
                                                >
                                                    {comment.post?.title || 'Post no disponible'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Comment Content */}
                                    <Box sx={{ mb: 3 }}>
                                        <Typography
                                            variant="body1"
                                            color={THEME.text.primary}
                                            sx={{
                                                lineHeight: 1.6,
                                                fontSize: '0.95rem',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 4,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {comment.body || comment.content || 'Contenido no disponible'}
                                        </Typography>
                                    </Box>

                                    {/* Footer with Stats and Actions */}
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        pt: 2,
                                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Typography variant="body2" color={THEME.text.light}>
                                                    👍
                                                </Typography>
                                                <Typography variant="body2" color={THEME.text.light} fontWeight={500}>
                                                    {comment.likes_count || 0}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Typography variant="body2" color={THEME.text.light}>
                                                    👎
                                                </Typography>
                                                <Typography variant="body2" color={THEME.text.light} fontWeight={500}>
                                                    {comment.dislikes_count || 0}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Typography variant="body2" color={THEME.text.light}>
                                                    💬
                                                </Typography>
                                                <Typography variant="body2" color={THEME.text.light} fontWeight={500}>
                                                    {comment.replies_count || 0}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<LaunchOutlined />}
                                            onClick={() => {
                                                if (comment.post?.slug) {
                                                    const url = `/blog/${comment.post.slug}#comment-${comment.id}`;
                                                    // Open in new tab and use a more reliable method for scrolling
                                                    const newWindow = window.open(url, '_blank');

                                                    if (newWindow) {
                                                        // Use a more reliable approach with postMessage
                                                        const checkAndScroll = () => {
                                                            try {
                                                                if (newWindow.document.readyState === 'complete') {
                                                                    const commentElement = newWindow.document.getElementById(`comment-${comment.id}`);
                                                                    if (commentElement) {
                                                                        // Add a small delay to ensure the page is fully rendered
                                                                        setTimeout(() => {
                                                                            commentElement.scrollIntoView({
                                                                                behavior: 'smooth',
                                                                                block: 'center',
                                                                                inline: 'nearest'
                                                                            });
                                                                            // Add highlight effect
                                                                            commentElement.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
                                                                            commentElement.style.border = '2px solid #2563eb';
                                                                            commentElement.style.borderRadius = '8px';
                                                                            setTimeout(() => {
                                                                                commentElement.style.backgroundColor = '';
                                                                                commentElement.style.border = '';
                                                                                commentElement.style.borderRadius = '';
                                                                            }, 3000);
                                                                        }, 500);
                                                                    }
                                                                } else {
                                                                    // Retry if page is not ready
                                                                    setTimeout(checkAndScroll, 100);
                                                                }
                                                            } catch (error) {
                                                                // Cross-origin restrictions, fallback to simple navigation
                                                                console.log('Cross-origin restriction, using fallback navigation');
                                                            }
                                                        };

                                                        // Start checking after a short delay
                                                        setTimeout(checkAndScroll, 200);
                                                    }
                                                }
                                            }}
                                            sx={{
                                                fontSize: '0.8rem',
                                                py: 0.75,
                                                px: 2,
                                                backgroundColor: THEME.primary,
                                                color: 'white',
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                                                '&:hover': {
                                                    backgroundColor: THEME.secondary,
                                                    boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)',
                                                    transform: 'translateY(-1px)',
                                                }
                                            }}
                                        >
                                            Ver en post
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </Box>
            )}

            {/* Pagination */}
            {!loading && paginatedComments.length > 0 && pagination.last_page > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={pagination.last_page}
                        page={pagination.current_page}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                backgroundColor: THEME.glass,
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: THEME.text.primary,
                                '&:hover': {
                                    backgroundColor: THEME.surface,
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                },
                                '&.Mui-selected': {
                                    backgroundColor: THEME.primary,
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: THEME.secondary,
                                    }
                                }
                            }
                        }}
                    />
                </Box>
            )}

            {/* Enhanced Empty State */}
            {!loading && paginatedComments.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card
                        sx={{
                            textAlign: 'center',
                            py: 8,
                            px: 4,
                            backgroundColor: THEME.glass,
                            backdropFilter: 'blur(10px)',
                            borderRadius: 4,
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <motion.div
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <CommentOutlined
                                sx={{
                                    fontSize: 64,
                                    color: THEME.text.light,
                                    mb: 3,
                                    opacity: 0.7
                                }}
                            />
                        </motion.div>
                        <Typography
                            variant="h5"
                            color={THEME.text.primary}
                            gutterBottom
                            fontWeight={600}
                        >
                            {searchTerm ? 'No se encontraron comentarios' : 'No has hecho comentarios aún'}
                        </Typography>
                        <Typography
                            variant="body1"
                            color={THEME.text.secondary}
                            sx={{ maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}
                        >
                            {searchTerm
                                ? 'Intenta con otros términos de búsqueda o revisa la ortografía'
                                : 'Tus comentarios aparecerán aquí cuando participes en las discusiones del blog'
                            }
                        </Typography>
                        {!searchTerm && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                            >
                                <Button
                                    variant="contained"
                                    sx={{
                                        mt: 3,
                                        backgroundColor: THEME.primary,
                                        color: 'white',
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 3,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                                        '&:hover': {
                                            backgroundColor: THEME.secondary,
                                            boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)',
                                        }
                                    }}
                                    onClick={() => window.open('/blog', '_blank')}
                                >
                                    Explorar el blog
                                </Button>
                            </motion.div>
                        )}
                    </Card>
                </motion.div>
            )}
        </Box>
    );
};

export default CommentsTab;
