import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { router } from '@inertiajs/react';

const TagsDisplay = ({ 
    tags = [], 
    size = 'small', 
    variant = 'filled',
    showLabel = false,
    maxTags = null,
    clickable = true,
    spacing = 0.5
}) => {
    if (!tags || tags.length === 0) {
        return null;
    }

    const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
    const remainingCount = maxTags && tags.length > maxTags ? tags.length - maxTags : 0;

    const handleTagClick = (tag) => {
        if (!clickable) return;
        
        router.get(route('blog.index', { tag: tag.slug }), {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const getTagColor = (tag) => {
        if (tag.color) {
            return tag.color;
        }
        
        // Colores predeterminados basados en el hash del nombre
        const colors = ['primary', 'secondary', 'info', 'success', 'warning'];
        const hash = tag.name.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {showLabel && (
                <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
                        fontWeight: 500,
                        minWidth: 'fit-content'
                    }}
                >
                    Etiquetas:
                </Typography>
            )}
            
            <Stack 
                direction="row" 
                spacing={spacing} 
                flexWrap="wrap" 
                useFlexGap
                sx={{ gap: spacing }}
            >
                {displayTags.map((tag, index) => (
                    <motion.div
                        key={tag.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                            duration: 0.2, 
                            delay: index * 0.05,
                            ease: "easeOut"
                        }}
                        whileHover={clickable ? { 
                            scale: 1.05,
                            transition: { duration: 0.1 }
                        } : {}}
                        whileTap={clickable ? { scale: 0.98 } : {}}
                    >
                        <Chip
                            label={tag.name}
                            size={size}
                            variant={variant}
                            color={getTagColor(tag)}
                            onClick={() => handleTagClick(tag)}
                            clickable={clickable}
                            sx={{
                                cursor: clickable ? 'pointer' : 'default',
                                fontSize: size === 'small' ? '0.6875rem' : '0.75rem',
                                fontWeight: 500,
                                height: size === 'small' ? 20 : 24,
                                '& .MuiChip-label': {
                                    px: size === 'small' ? 0.75 : 1,
                                },
                                '&:hover': clickable ? {
                                    boxShadow: (theme) => theme.shadows[2],
                                    transform: 'translateY(-1px)',
                                } : {},
                                transition: 'all 0.2s ease-in-out',
                            }}
                        />
                    </motion.div>
                ))}
                
                {remainingCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                            duration: 0.2, 
                            delay: displayTags.length * 0.05,
                            ease: "easeOut"
                        }}
                    >
                        <Chip
                            label={`+${remainingCount}`}
                            size={size}
                            variant="outlined"
                            color="default"
                            sx={{
                                fontSize: size === 'small' ? '0.6875rem' : '0.75rem',
                                fontWeight: 500,
                                height: size === 'small' ? 20 : 24,
                                '& .MuiChip-label': {
                                    px: size === 'small' ? 0.75 : 1,
                                },
                                opacity: 0.7,
                            }}
                        />
                    </motion.div>
                )}
            </Stack>
        </Box>
    );
};

export default TagsDisplay;