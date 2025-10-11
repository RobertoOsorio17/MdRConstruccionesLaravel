import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Avatar,
    Stack,
    IconButton,
    Tooltip,
    Badge
} from '@mui/material';
import {
    AccessTime as TimeIcon,
    Visibility as ViewIcon,
    BookmarkBorder as BookmarkIcon,
    Share as ShareIcon,
    TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { router } from '@inertiajs/react';
import SafeHighlightedText from './SafeHighlightedText'; // ✅ SECURITY FIX: Safe highlighting component

// Premium design system
const THEME = {
    primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
    },
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8',
    },
    border: {
        light: '#f1f5f9',
        main: '#e2e8f0',
    },
    surface: {
        primary: '#ffffff',
        secondary: '#f8fafc',
    },
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    }
};

const SearchResultCard = ({ 
    result, 
    index = 0, 
    onResultClick,
    showActions = true,
    variant = 'default' // 'default', 'compact', 'featured'
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const handleCardClick = () => {
        if (onResultClick) {
            onResultClick(result);
        } else {
            router.get(`/blog/${result.slug}`);
        }
    };

    const handleBookmark = (e) => {
        e.stopPropagation();
        setIsBookmarked(!isBookmarked);
        // Add bookmark logic here
    };

    const handleShare = (e) => {
        e.stopPropagation();
        // Add share logic here
        if (navigator.share) {
            navigator.share({
                title: result.title,
                text: result.excerpt,
                url: `/blog/${result.slug}`
            });
        }
    };

    const cardVariants = {
        hidden: { 
            opacity: 0, 
            y: 30,
            scale: 0.95
        },
        visible: { 
            opacity: 1, 
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1]
            }
        },
        hover: {
            y: -8,
            scale: 1.02,
            transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    const contentVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: {
                delay: 0.2 + (index * 0.1),
                duration: 0.4
            }
        }
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <Card
                onClick={handleCardClick}
                sx={{
                    cursor: 'pointer',
                    background: `linear-gradient(145deg, 
                        rgba(255, 255, 255, 0.95) 0%, 
                        rgba(255, 255, 255, 0.9) 100%
                    )`,
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: `1px solid rgba(255, 255, 255, 0.3)`,
                    boxShadow: isHovered ? THEME.shadows.xl : THEME.shadows.md,
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, 
                            rgba(59, 130, 246, 0.05) 0%, 
                            rgba(147, 51, 234, 0.05) 100%
                        )`,
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: 'none'
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 4,
                        height: '100%',
                        background: `linear-gradient(180deg, ${THEME.primary[500]} 0%, ${THEME.primary[300]} 100%)`,
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.3s ease'
                    }
                }}
            >
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                    <motion.div variants={contentVariants}>
                        {/* Header with actions */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            {/* ✅ SECURITY FIX: Use SafeHighlightedText instead of dangerouslySetInnerHTML */}
                            <Typography
                                variant="h6"
                                component="h3"
                                sx={{
                                    fontWeight: 700,
                                    color: THEME.text.primary,
                                    lineHeight: 1.3,
                                    flex: 1,
                                    mr: 2
                                }}
                            >
                                <SafeHighlightedText
                                    text={result.title}
                                    highlightedText={result.highlighted_title}
                                />
                            </Typography>

                            {/* Action buttons */}
                            <AnimatePresence>
                                {showActions && isHovered && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Stack direction="row" spacing={0.5}>
                                            <Tooltip title="Guardar artículo">
                                                <IconButton
                                                    size="small"
                                                    onClick={handleBookmark}
                                                    sx={{
                                                        color: isBookmarked ? THEME.primary[600] : THEME.text.muted,
                                                        '&:hover': {
                                                            backgroundColor: THEME.primary[50],
                                                            color: THEME.primary[600]
                                                        }
                                                    }}
                                                >
                                                    <BookmarkIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Compartir">
                                                <IconButton
                                                    size="small"
                                                    onClick={handleShare}
                                                    sx={{
                                                        color: THEME.text.muted,
                                                        '&:hover': {
                                                            backgroundColor: THEME.primary[50],
                                                            color: THEME.primary[600]
                                                        }
                                                    }}
                                                >
                                                    <ShareIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Box>

                        {/* Meta information */}
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            {result.author && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Avatar
                                        src={result.author.avatar}
                                        sx={{ 
                                            width: 24, 
                                            height: 24,
                                            border: `2px solid ${THEME.primary[100]}`
                                        }}
                                    >
                                        {result.author.name?.[0]}
                                    </Avatar>
                                    <Typography variant="caption" sx={{ 
                                        color: THEME.text.secondary,
                                        fontWeight: 500
                                    }}>
                                        {result.author.name}
                                    </Typography>
                                </Stack>
                            )}

                            {result.published_at && (
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <TimeIcon sx={{ fontSize: 14, color: THEME.text.muted }} />
                                    <Typography variant="caption" sx={{ color: THEME.text.muted }}>
                                        {new Date(result.published_at).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </Typography>
                                </Stack>
                            )}

                            {result.reading_time && (
                                <Typography variant="caption" sx={{ 
                                    color: THEME.text.muted,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                }}>
                                    📖 {result.reading_time} min
                                </Typography>
                            )}
                        </Stack>

                        {/* Content excerpt */}
                        <Typography
                            variant="body2"
                            sx={{
                                color: THEME.text.secondary,
                                lineHeight: 1.6,
                                mb: 2,
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                '& mark.search-highlight': {
                                    backgroundColor: THEME.primary[100],
                                    color: THEME.primary[800],
                                    padding: '1px 3px',
                                    borderRadius: 0.5,
                                    fontWeight: 500
                                }
                            }}
                            dangerouslySetInnerHTML={{ 
                                __html: result.highlighted_excerpt || result.excerpt 
                            }}
                        />

                        {/* Categories */}
                        {result.categories && result.categories.length > 0 && (
                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                {result.categories.slice(0, 3).map((category, idx) => (
                                    <motion.div
                                        key={category.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 + (idx * 0.1) }}
                                    >
                                        <Chip
                                            label={category.name}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                borderColor: THEME.primary[200],
                                                color: THEME.primary[700],
                                                backgroundColor: isHovered ? THEME.primary[50] : 'transparent',
                                                fontSize: '0.75rem',
                                                height: 24,
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: THEME.primary[100],
                                                    borderColor: THEME.primary[300]
                                                }
                                            }}
                                        />
                                    </motion.div>
                                ))}
                                {result.categories.length > 3 && (
                                    <Chip
                                        label={`+${result.categories.length - 3}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            borderColor: THEME.border.main,
                                            color: THEME.text.muted,
                                            fontSize: '0.75rem',
                                            height: 24
                                        }}
                                    />
                                )}
                            </Stack>
                        )}

                        {/* Trending indicator for popular results */}
                        <AnimatePresence>
                            {result.is_trending && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    style={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16
                                    }}
                                >
                                    <Badge
                                        badgeContent={<TrendingIcon sx={{ fontSize: 12 }} />}
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                backgroundColor: THEME.primary[500],
                                                color: 'white',
                                                borderRadius: '50%',
                                                width: 20,
                                                height: 20,
                                                minWidth: 20
                                            }
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default SearchResultCard;
