import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Stack,
    Card,
    CardContent,
    Chip,
    IconButton,
    Divider
} from '@mui/material';
import {
    Search as SearchIcon,
    TrendingUp as TrendingIcon,
    Category as CategoryIcon,
    Person as AuthorIcon
} from '@mui/icons-material';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

const THEME = {
    primary: {
        200: '#bfdbfe',
        500: '#3b82f6',
        600: '#2563eb',
    },
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        muted: '#94a3b8',
    }
};

const EnhancedSearch = ({ 
    searchQuery, 
    setSearchQuery, 
    handleSearch, 
    popularPosts, 
    categories, 
    recentPosts 
}) => {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <Stack spacing={3}>
            {/* Enhanced Search */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        background: `linear-gradient(145deg, 
                            rgba(255, 255, 255, 0.95) 0%, 
                            rgba(255, 255, 255, 0.9) 100%
                        )`,
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        border: `1px solid rgba(255, 255, 255, 0.3)`,
                        borderRadius: 4,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            color: THEME.text.primary,
                            mb: 3,
                            textAlign: 'center'
                        }}
                    >
                        ¿Buscas algo específico?
                    </Typography>

                    <Box
                        component="form"
                        onSubmit={handleSearch}
                        sx={{
                            display: 'flex',
                            gap: 1,
                            p: 1,
                            background: 'rgba(255, 255, 255, 0.7)',
                            borderRadius: 2,
                            border: `1px solid ${THEME.primary[200]}`
                        }}
                    >
                        <Box
                            sx={{
                                flex: 1,
                                '& input': {
                                    border: 'none',
                                    outline: 'none',
                                    background: 'transparent',
                                    padding: '12px 16px',
                                    fontSize: '1rem',
                                    width: '100%',
                                    '&::placeholder': {
                                        color: THEME.text.muted
                                    }
                                }
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Buscar en el blog..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </Box>
                        <IconButton
                            type="submit"
                            sx={{
                                background: THEME.primary[500],
                                color: 'white',
                                '&:hover': {
                                    background: THEME.primary[600]
                                }
                            }}
                        >
                            <SearchIcon />
                        </IconButton>
                    </Box>
                </Paper>
            </motion.div>

            {/* Popular Posts */}
            {popularPosts.length > 0 && (
                <motion.div 
                    variants={itemVariants} 
                    initial="hidden" 
                    animate="visible"
                    transition={{ delay: 0.2 }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            background: `linear-gradient(145deg, 
                                rgba(255, 255, 255, 0.95) 0%, 
                                rgba(255, 255, 255, 0.9) 100%
                            )`,
                            backdropFilter: 'blur(20px) saturate(180%)',
                            border: `1px solid rgba(255, 255, 255, 0.3)`,
                            borderRadius: 4,
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <TrendingIcon sx={{ color: THEME.primary[500] }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: THEME.text.primary }}>
                                Posts Populares
                            </Typography>
                        </Stack>
                        
                        <Stack spacing={2}>
                            {popularPosts.slice(0, 3).map((post, index) => (
                                <Card
                                    key={post.id}
                                    component={Link}
                                    href={`/blog/${post.slug}`}
                                    sx={{
                                        textDecoration: 'none',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateX(8px)',
                                            boxShadow: 2
                                        }
                                    }}
                                >
                                    <CardContent sx={{ py: 2 }}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                fontWeight: 600,
                                                color: THEME.text.primary,
                                                mb: 0.5
                                            }}
                                        >
                                            {post.title}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{ color: THEME.text.muted }}
                                        >
                                            {post.excerpt?.substring(0, 80)}...
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    </Paper>
                </motion.div>
            )}

            {/* Categories */}
            {categories.length > 0 && (
                <motion.div 
                    variants={itemVariants} 
                    initial="hidden" 
                    animate="visible"
                    transition={{ delay: 0.4 }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            background: `linear-gradient(145deg, 
                                rgba(255, 255, 255, 0.95) 0%, 
                                rgba(255, 255, 255, 0.9) 100%
                            )`,
                            backdropFilter: 'blur(20px) saturate(180%)',
                            border: `1px solid rgba(255, 255, 255, 0.3)`,
                            borderRadius: 4,
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                            <CategoryIcon sx={{ color: THEME.primary[500] }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: THEME.text.primary }}>
                                Categorías
                            </Typography>
                        </Stack>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {categories.slice(0, 6).map((category) => (
                                <Chip
                                    key={category.id}
                                    label={category.name}
                                    component={Link}
                                    href={`/blog?category=${category.slug}`}
                                    clickable
                                    variant="outlined"
                                    sx={{
                                        borderColor: THEME.primary[200],
                                        color: THEME.text.secondary,
                                        '&:hover': {
                                            borderColor: THEME.primary[500],
                                            color: THEME.primary[600],
                                            backgroundColor: THEME.primary[50]
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                    </Paper>
                </motion.div>
            )}
        </Stack>
    );
};

export default EnhancedSearch;
