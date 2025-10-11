import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Chip,
    Stack,
    Divider,
    Collapse,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Clear as ClearIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

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

const SearchFilters = ({
    filters = {},
    categories = [],
    authors = [],
    onFiltersChange,
    onClearFilters,
    className,
    ...props
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);

    // ✅ FIX: Sync local state when external filters change
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    // Handle filter change
    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        if (!value) {
            delete newFilters[key];
        }
        setLocalFilters(newFilters);
        onFiltersChange?.(newFilters);
    };

    // Clear all filters
    const handleClearAll = () => {
        setLocalFilters({});
        onClearFilters?.();
    };

    // ✅ FIX: Get active filters count - exclude empty strings and null values
    const activeFiltersCount = Object.keys(localFilters).filter(key => {
        const value = localFilters[key];
        return value !== null && value !== undefined && value !== '';
    }).length;

    // Get filter chips
    const getFilterChips = () => {
        const chips = [];

        if (localFilters.category) {
            const category = categories.find(cat => cat.slug === localFilters.category);
            chips.push({
                key: 'category',
                label: `Categoría: ${category?.name || localFilters.category}`,
                icon: <CategoryIcon fontSize="small" />
            });
        }

        if (localFilters.author) {
            const author = authors.find(auth => auth.id === parseInt(localFilters.author));
            chips.push({
                key: 'author',
                label: `Autor: ${author?.name || 'Desconocido'}`,
                icon: <PersonIcon fontSize="small" />
            });
        }

        if (localFilters.date_from || localFilters.date_to) {
            let dateLabel = 'Fecha: ';
            if (localFilters.date_from && localFilters.date_to) {
                dateLabel += `${localFilters.date_from} - ${localFilters.date_to}`;
            } else if (localFilters.date_from) {
                dateLabel += `desde ${localFilters.date_from}`;
            } else {
                dateLabel += `hasta ${localFilters.date_to}`;
            }
            chips.push({
                key: 'date',
                label: dateLabel,
                icon: <CalendarIcon fontSize="small" />
            });
        }

        return chips;
    };

    const filterChips = getFilterChips();

    return (
        <Box className={className} {...props}>
            {/* Filter Toggle Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    onClick={() => setIsExpanded(!isExpanded)}
                    sx={{
                        borderColor: THEME.border.main,
                        color: THEME.text.secondary,
                        '&:hover': {
                            borderColor: THEME.primary[300],
                            backgroundColor: THEME.primary[50]
                        }
                    }}
                >
                    Filtros
                    {activeFiltersCount > 0 && (
                        <Chip
                            label={activeFiltersCount}
                            size="small"
                            color="primary"
                            sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                        />
                    )}
                </Button>

                {activeFiltersCount > 0 && (
                    <Tooltip title="Limpiar todos los filtros">
                        <IconButton
                            size="small"
                            onClick={handleClearAll}
                            sx={{
                                color: THEME.text.muted,
                                '&:hover': {
                                    color: THEME.text.secondary,
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        >
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {/* Active Filter Chips */}
            <AnimatePresence>
                {filterChips.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                            {filterChips.map((chip) => (
                                <Chip
                                    key={chip.key}
                                    icon={chip.icon}
                                    label={chip.label}
                                    onDelete={() => {
                                        if (chip.key === 'date') {
                                            handleFilterChange('date_from', '');
                                            handleFilterChange('date_to', '');
                                        } else {
                                            handleFilterChange(chip.key, '');
                                        }
                                    }}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        borderColor: THEME.primary[200],
                                        color: THEME.primary[700],
                                        backgroundColor: THEME.primary[50],
                                        '& .MuiChip-deleteIcon': {
                                            color: THEME.primary[500],
                                            '&:hover': {
                                                color: THEME.primary[700]
                                            }
                                        }
                                    }}
                                />
                            ))}
                        </Stack>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filter Panel */}
            <Collapse in={isExpanded}>
                <Paper
                    component={motion.div}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    sx={{
                        p: 3,
                        background: `linear-gradient(145deg, 
                            rgba(255, 255, 255, 0.95) 0%, 
                            rgba(255, 255, 255, 0.9) 100%
                        )`,
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        border: `1px solid rgba(255, 255, 255, 0.3)`,
                        boxShadow: THEME.shadows.lg,
                        borderRadius: 2
                    }}
                >
                    <Typography variant="h6" sx={{ 
                        mb: 3, 
                        color: THEME.text.primary,
                        fontWeight: 600
                    }}>
                        Filtros de búsqueda
                    </Typography>

                    <Stack spacing={3}>
                        {/* Category Filter */}
                        <FormControl fullWidth size="small">
                            <InputLabel>Categoría</InputLabel>
                            <Select
                                value={localFilters.category || ''}
                                label="Categoría"
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                        }
                                    }
                                }}
                            >
                                <MenuItem value="">
                                    <em>Todas las categorías</em>
                                </MenuItem>
                                {categories.map((category) => (
                                    <MenuItem key={category.id} value={category.slug}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Author Filter */}
                        <FormControl fullWidth size="small">
                            <InputLabel>Autor</InputLabel>
                            <Select
                                value={localFilters.author || ''}
                                label="Autor"
                                onChange={(e) => handleFilterChange('author', e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                        }
                                    }
                                }}
                            >
                                <MenuItem value="">
                                    <em>Todos los autores</em>
                                </MenuItem>
                                {authors.map((author) => (
                                    <MenuItem key={author.id} value={author.id}>
                                        {author.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Divider />

                        {/* Date Range Filters */}
                        <Typography variant="subtitle2" sx={{ 
                            color: THEME.text.secondary,
                            fontWeight: 600
                        }}>
                            Rango de fechas
                        </Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                label="Fecha desde"
                                type="date"
                                size="small"
                                value={localFilters.date_from || ''}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    flex: 1,
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                        }
                                    }
                                }}
                            />
                            <TextField
                                label="Fecha hasta"
                                type="date"
                                size="small"
                                value={localFilters.date_to || ''}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    flex: 1,
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                        }
                                    }
                                }}
                            />
                        </Stack>

                        {/* Sort Options */}
                        <Divider />
                        
                        <FormControl fullWidth size="small">
                            <InputLabel>Ordenar por</InputLabel>
                            <Select
                                value={localFilters.sort || 'relevance'}
                                label="Ordenar por"
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                        }
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
                    </Stack>
                </Paper>
            </Collapse>
        </Box>
    );
};

export default SearchFilters;
