import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Stack,
    Pagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Button,
    Alert,
    Grid
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Sort as SortIcon,
    TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import SearchResultCard from './SearchResultCard';
import { SearchResultsGridSkeleton, SearchStatsSkeleton } from './SearchSkeletons';

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
    }
};

const SearchResults = ({
    results = [],
    totalResults = 0,
    currentPage = 1,
    lastPage = 1,
    perPage = 12,
    query = '',
    filters = {},
    isLoading = false,
    error = null,
    onPageChange,
    onSortChange,
    onResultClick,
    showStats = true,
    showPagination = true,
    showSorting = true
}) => {
    const [sortBy, setSortBy] = useState(filters.sort || 'relevance');
    const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'

    // Handle sort change
    const handleSortChange = (newSort) => {
        setSortBy(newSort);
        onSortChange?.(newSort);
    };

    // Handle page change
    const handlePageChange = (event, page) => {
        onPageChange?.(page);
        // Smooth scroll to top of results
        document.getElementById('search-results')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <Box id="search-results">
                {showStats && <SearchStatsSkeleton />}
                <SearchResultsGridSkeleton count={perPage} />
            </Box>
        );
    }

    // Error state
    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Alert 
                    severity="error" 
                    sx={{ 
                        mb: 3,
                        background: `linear-gradient(145deg, 
                            rgba(239, 68, 68, 0.1) 0%, 
                            rgba(239, 68, 68, 0.05) 100%
                        )`,
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 2
                    }}
                >
                    {error}
                </Alert>
            </motion.div>
        );
    }

    // No results state
    if (!isLoading && results.length === 0 && query) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                <Box sx={{ 
                    textAlign: 'center', 
                    py: { xs: 6, md: 8 },
                    px: 2,
                    background: `linear-gradient(145deg, 
                        rgba(255, 255, 255, 0.95) 0%, 
                        rgba(255, 255, 255, 0.9) 100%
                    )`,
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: `1px solid rgba(255, 255, 255, 0.3)`,
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `radial-gradient(circle at center, ${THEME.primary[50]} 0%, transparent 70%)`,
                        opacity: 0.5,
                        pointerEvents: 'none'
                    }
                }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                        <SearchIcon sx={{ 
                            fontSize: 64, 
                            color: THEME.text.muted, 
                            mb: 2,
                            opacity: 0.5
                        }} />
                    </motion.div>
                    
                    <Typography variant="h6" sx={{ 
                        color: THEME.text.secondary, 
                        mb: 2,
                        fontWeight: 600,
                        position: 'relative',
                        zIndex: 1
                    }}>
                        No se encontraron resultados para "{query}"
                    </Typography>
                    
                    <Typography variant="body2" sx={{ 
                        color: THEME.text.muted,
                        position: 'relative',
                        zIndex: 1,
                        maxWidth: 400,
                        mx: 'auto',
                        lineHeight: 1.6,
                        mb: 3
                    }}>
                        Intenta con otros términos de búsqueda, revisa la ortografía o explora nuestras categorías.
                    </Typography>

                    {/* ✅ FIX: Use correct payload structure for suggestions */}
                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                // Navigate to search with query instead of calling onResultClick
                                window.location.href = '/search?q=construcción';
                            }}
                            sx={{
                                borderColor: THEME.primary[200],
                                color: THEME.primary[600],
                                '&:hover': {
                                    backgroundColor: THEME.primary[50],
                                    borderColor: THEME.primary[300]
                                }
                            }}
                        >
                            Construcción
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                window.location.href = '/search?q=reformas';
                            }}
                            sx={{
                                borderColor: THEME.primary[200],
                                color: THEME.primary[600],
                                '&:hover': {
                                    backgroundColor: THEME.primary[50],
                                    borderColor: THEME.primary[300]
                                }
                            }}
                        >
                            Reformas
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                window.location.href = '/search?q=materiales';
                            }}
                            sx={{
                                borderColor: THEME.primary[200],
                                color: THEME.primary[600],
                                '&:hover': {
                                    backgroundColor: THEME.primary[50],
                                    borderColor: THEME.primary[300]
                                }
                            }}
                        >
                            Materiales
                        </Button>
                    </Stack>
                </Box>
            </motion.div>
        );
    }

    return (
        <Box id="search-results">
            {/* Search Stats */}
            {showStats && results.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        justifyContent="space-between" 
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={2}
                        sx={{ mb: 3 }}
                    >
                        <Box>
                            <Typography variant="h6" sx={{ 
                                color: THEME.text.primary,
                                fontWeight: 600,
                                mb: 0.5
                            }}>
                                {totalResults.toLocaleString()} resultado{totalResults !== 1 ? 's' : ''} 
                                {query && (
                                    <span style={{ color: THEME.text.secondary, fontWeight: 400 }}>
                                        {' '}para "{query}"
                                    </span>
                                )}
                            </Typography>
                            
                            {Object.keys(filters).length > 0 && (
                                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                    {Object.entries(filters).map(([key, value]) => {
                                        if (!value || key === 'sort') return null;
                                        return (
                                            <Chip
                                                key={key}
                                                label={`${key}: ${value}`}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    height: 20,
                                                    borderColor: THEME.primary[200],
                                                    color: THEME.primary[600]
                                                }}
                                            />
                                        );
                                    })}
                                </Stack>
                            )}
                        </Box>

                        {/* Sort Controls */}
                        {showSorting && (
                            <FormControl size="small" sx={{ minWidth: 160 }}>
                                <InputLabel>Ordenar por</InputLabel>
                                <Select
                                    value={sortBy}
                                    label="Ordenar por"
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    startAdornment={<SortIcon sx={{ mr: 1, fontSize: 18 }} />}
                                    sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                        }
                                    }}
                                >
                                    <MenuItem value="relevance">Relevancia</MenuItem>
                                    <MenuItem value="date_desc">Más recientes</MenuItem>
                                    <MenuItem value="date_asc">Más antiguos</MenuItem>
                                    <MenuItem value="title_asc">Título A-Z</MenuItem>
                                    <MenuItem value="title_desc">Título Z-A</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    </Stack>
                </motion.div>
            )}

            {/* Results Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Grid container spacing={3}>
                    <AnimatePresence mode="wait">
                        {results.map((result, index) => (
                            <Grid key={`${result.id}-${currentPage}`} size={{ xs: 12 }}>
                                <motion.div
                                    variants={itemVariants}
                                    layout
                                    layoutId={`result-${result.id}`}
                                >
                                    <SearchResultCard
                                        result={result}
                                        index={index}
                                        onResultClick={onResultClick}
                                    />
                                </motion.div>
                            </Grid>
                        ))}
                    </AnimatePresence>
                </Grid>
            </motion.div>

            {/* Pagination */}
            {showPagination && lastPage > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                >
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mt: 4,
                        pt: 3,
                        borderTop: `1px solid ${THEME.border.light}`
                    }}>
                        <Pagination
                            count={lastPage}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                            showFirstButton
                            showLastButton
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    borderRadius: 2,
                                    fontWeight: 500,
                                    '&:hover': {
                                        backgroundColor: THEME.primary[50]
                                    }
                                },
                                '& .Mui-selected': {
                                    backgroundColor: `${THEME.primary[500]} !important`,
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: `${THEME.primary[600]} !important`
                                    }
                                }
                            }}
                        />
                    </Box>
                </motion.div>
            )}
        </Box>
    );
};

export default SearchResults;
