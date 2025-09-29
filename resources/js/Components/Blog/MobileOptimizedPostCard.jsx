import React, { memo, useState, useRef, useEffect } from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    Chip,
    Avatar,
    IconButton,
    Skeleton,
    useTheme,
    useMediaQuery,
    Fade,
    Zoom
} from '@mui/material';
import {
    Schedule as ScheduleIcon,
    Visibility as ViewsIcon,
    FavoriteOutlined as LikeIcon,
    BookmarkBorderOutlined as BookmarkIcon,
    Share as ShareIcon,
    TouchApp as TouchIcon
} from '@mui/icons-material';
import { Link } from '@inertiajs/react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ProgressiveImage } from '@/Components/Blog/MobileLazyLoading';

// Premium glassmorphism design system optimized for mobile
const MOBILE_THEME = {
    glass: {
        primary: 'rgba(255, 255, 255, 0.25)',
        secondary: 'rgba(255, 255, 255, 0.15)',
        hover: 'rgba(255, 255, 255, 0.35)',
    },
    blur: {
        sm: 'blur(8px)',
        md: 'blur(12px)',
        lg: 'blur(16px)',
    },
    shadows: {
        card: '0 8px 32px rgba(0, 0, 0, 0.1)',
        cardHover: '0 12px 40px rgba(0, 0, 0, 0.15)',
        touch: '0 4px 20px rgba(59, 130, 246, 0.3)',
    },
    spacing: {
        touch: 44, // Minimum touch target size
        cardPadding: { xs: 16, sm: 20, md: 24 },
        cardGap: { xs: 12, sm: 16, md: 20 },
    },
    typography: {
        mobile: {
            title: { fontSize: '1.1rem', lineHeight: 1.3, fontWeight: 600 },
            excerpt: { fontSize: '0.875rem', lineHeight: 1.5 },
            meta: { fontSize: '0.75rem', lineHeight: 1.4 },
        }
    }
};

// Mobile-optimized image component with progressive loading
const MobileOptimizedImage = memo(({ post, getPostImage }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const src = getPostImage(post);

    const fallbackElement = (
        <Box
            sx={{
                height: isMobile ? 180 : 200,
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px 12px 0 0',
            }}
        >
            <TouchIcon sx={{ fontSize: 48, color: 'rgba(59, 130, 246, 0.3)' }} />
        </Box>
    );

    return (
        <ProgressiveImage
            src={src}
            alt={post.title}
            placeholder={fallbackElement}
            style={{
                height: isMobile ? 180 : 200,
                borderRadius: '12px 12px 0 0',
                overflow: 'hidden',
            }}
        />
    );
});

// Touch-optimized action buttons
const TouchActionButton = memo(({ icon, count, color = 'inherit', onClick }) => {
    const [pressed, setPressed] = useState(false);
    
    return (
        <motion.div
            whileTap={{ scale: 0.95 }}
            onTapStart={() => setPressed(true)}
            onTap={() => setPressed(false)}
            onTapCancel={() => setPressed(false)}
        >
            <IconButton
                size="small"
                onClick={onClick}
                sx={{
                    minWidth: MOBILE_THEME.spacing.touch,
                    minHeight: MOBILE_THEME.spacing.touch,
                    color: color,
                    backgroundColor: pressed ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-1px)',
                        boxShadow: MOBILE_THEME.shadows.touch,
                    }
                }}
            >
                {icon}
                {count > 0 && (
                    <Typography
                        variant="caption"
                        sx={{
                            ml: 0.5,
                            fontSize: '0.7rem',
                            fontWeight: 500,
                        }}
                    >
                        {count > 999 ? `${Math.floor(count / 1000)}k` : count}
                    </Typography>
                )}
            </IconButton>
        </motion.div>
    );
});

// Main mobile-optimized PostCard component
const MobileOptimizedPostCard = memo(({ post, getPostImage, onSwipeAction }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const cardRef = useRef(null);
    const x = useMotionValue(0);
    const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);
    const scale = useTransform(x, [-100, 0, 100], [0.95, 1, 0.95]);
    
    const firstCategory = (post.categories || [])[0];
    
    // Handle swipe gestures
    const handleDragEnd = (event, info) => {
        const threshold = 50;
        
        if (info.offset.x > threshold) {
            // Swipe right - like action
            onSwipeAction?.('like', post);
        } else if (info.offset.x < -threshold) {
            // Swipe left - bookmark action
            onSwipeAction?.('bookmark', post);
        }
        
        // Reset position
        x.set(0);
    };

    // Touch feedback
    const [touchFeedback, setTouchFeedback] = useState(false);
    
    const handleTouchStart = () => {
        setTouchFeedback(true);
        // Haptic feedback simulation
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    };
    
    const handleTouchEnd = () => {
        setTimeout(() => setTouchFeedback(false), 150);
    };

    return (
        <motion.div
            ref={cardRef}
            style={{ x, opacity, scale }}
            drag={isMobile ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            layout
        >
            <Card
                elevation={0}
                component={Link}
                href={`/blog/${post.slug}`}
                sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    height: '100%',
                    cursor: 'pointer',
                    border: `1px solid rgba(255, 255, 255, 0.2)`,
                    backgroundColor: touchFeedback ? MOBILE_THEME.glass.hover : MOBILE_THEME.glass.primary,
                    boxShadow: touchFeedback ? MOBILE_THEME.shadows.touch : MOBILE_THEME.shadows.card,
                    backdropFilter: MOBILE_THEME.blur.md,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    color: 'inherit',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                        opacity: touchFeedback ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: 'none',
                        borderRadius: 3,
                        zIndex: 1
                    },
                    '&:hover': {
                        transform: isMobile ? 'none' : 'translateY(-4px)',
                        boxShadow: MOBILE_THEME.shadows.cardHover,
                        '&::before': {
                            opacity: 1,
                        }
                    }
                }}
            >
                {/* Image Section */}
                <Box sx={{ position: 'relative' }}>
                    <MobileOptimizedImage post={post} getPostImage={getPostImage} />
                    
                    {/* Category Chip */}
                    {firstCategory && (
                        <Chip
                            size="small"
                            label={firstCategory.name}
                            sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                backgroundColor: MOBILE_THEME.glass.secondary,
                                color: 'white',
                                backdropFilter: MOBILE_THEME.blur.sm,
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                fontWeight: 600,
                                fontSize: MOBILE_THEME.typography.mobile.meta.fontSize,
                                zIndex: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: MOBILE_THEME.glass.hover,
                                    transform: 'translateY(-1px)'
                                }
                            }}
                        />
                    )}
                    
                    {/* Featured Badge */}
                    {post.featured && (
                        <Chip
                            size="small"
                            label="Destacado"
                            sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                backgroundColor: 'rgba(245, 165, 36, 0.9)',
                                color: 'white',
                                backdropFilter: MOBILE_THEME.blur.sm,
                                fontWeight: 600,
                                fontSize: MOBILE_THEME.typography.mobile.meta.fontSize,
                                zIndex: 2,
                            }}
                        />
                    )}
                </Box>

                {/* Content Section */}
                <CardContent
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        p: MOBILE_THEME.spacing.cardPadding,
                        '&:last-child': { pb: MOBILE_THEME.spacing.cardPadding }
                    }}
                >
                    {/* Title */}
                    <Typography
                        variant="h6"
                        sx={{
                            ...MOBILE_THEME.typography.mobile.title,
                            mb: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            color: 'text.primary',
                        }}
                    >
                        {post.title}
                    </Typography>

                    {/* Excerpt */}
                    <Typography
                        variant="body2"
                        sx={{
                            ...MOBILE_THEME.typography.mobile.excerpt,
                            color: 'text.secondary',
                            mb: 2,
                            flexGrow: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: isMobile ? 2 : 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {post.excerpt}
                    </Typography>

                    {/* Author and Meta Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                                src={post.author?.avatar}
                                sx={{
                                    width: 24,
                                    height: 24,
                                    fontSize: '0.75rem',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                }}
                            >
                                {post.author?.name?.charAt(0)}
                            </Avatar>
                            <Typography
                                component={post.author?.id ? Link : 'span'}
                                href={post.author?.id ? `/user/${post.author.id}` : undefined}
                                variant="caption"
                                sx={{
                                    ...MOBILE_THEME.typography.mobile.meta,
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                    textDecoration: 'none',
                                    cursor: post.author?.id ? 'pointer' : 'default',
                                    '&:hover': post.author?.id ? {
                                        color: 'primary.main',
                                        textDecoration: 'underline'
                                    } : {}
                                }}
                            >
                                {post.author?.name}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScheduleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography
                                variant="caption"
                                sx={{
                                    ...MOBILE_THEME.typography.mobile.meta,
                                    color: 'text.secondary',
                                }}
                            >
                                {post.reading_time || '5 min'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TouchActionButton
                                icon={<ViewsIcon sx={{ fontSize: 16 }} />}
                                count={post.views_count || 0}
                                color="text.secondary"
                            />
                            <TouchActionButton
                                icon={<LikeIcon sx={{ fontSize: 16 }} />}
                                count={post.likes_count || 0}
                                color="error.main"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onSwipeAction?.('like', post);
                                }}
                            />
                            <TouchActionButton
                                icon={<BookmarkIcon sx={{ fontSize: 16 }} />}
                                count={post.bookmarks_count || 0}
                                color="primary.main"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onSwipeAction?.('bookmark', post);
                                }}
                            />
                        </Box>
                        
                        <TouchActionButton
                            icon={<ShareIcon sx={{ fontSize: 16 }} />}
                            color="text.secondary"
                            onClick={(e) => {
                                e.preventDefault();
                                onSwipeAction?.('share', post);
                            }}
                        />
                    </Box>
                </CardContent>
            </Card>
        </motion.div>
    );
});

MobileOptimizedPostCard.displayName = 'MobileOptimizedPostCard';

export default MobileOptimizedPostCard;
