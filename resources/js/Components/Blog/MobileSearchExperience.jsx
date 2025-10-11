import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    InputBase,
    IconButton,
    Chip,
    Typography,
    Drawer,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Fab,
    Slide,
    Fade,
    useTheme,
    useMediaQuery,
    Backdrop
} from '@mui/material';
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    FilterList as FilterIcon,
    Mic as MicIcon,
    History as HistoryIcon,
    TrendingUp as TrendingIcon,
    Close as CloseIcon,
    Category as CategoryIcon,
    Tag as TagIcon,
    Person as PersonIcon,
    Sort as SortIcon,
    KeyboardVoiceOutlined as VoiceIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileInteractions, useMobileAnimations, useMobileUI } from '@/Hooks/useMobileInteractions';

// Premium glassmorphism design for mobile search
const SEARCH_THEME = {
    glass: {
        primary: 'rgba(255, 255, 255, 0.95)',
        secondary: 'rgba(255, 255, 255, 0.85)',
        overlay: 'rgba(0, 0, 0, 0.4)',
    },
    blur: {
        strong: 'blur(20px)',
        medium: 'blur(12px)',
    },
    shadows: {
        floating: '0 8px 32px rgba(0, 0, 0, 0.12)',
        bottomSheet: '0 -4px 20px rgba(0, 0, 0, 0.1)',
    }
};

// Voice search component
const VoiceSearch = ({ onResult, isListening, onToggle }) => {
    const { triggerHapticFeedback } = useMobileInteractions();
    
    const handleVoiceSearch = () => {
        triggerHapticFeedback('medium');
        
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Tu navegador no soporta reconocimiento de voz');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => {
            onToggle(true);
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
            onToggle(false);
        };
        
        recognition.onerror = () => {
            onToggle(false);
        };
        
        recognition.onend = () => {
            onToggle(false);
        };
        
        recognition.start();
    };
    
    return (
        <IconButton
            onClick={handleVoiceSearch}
            sx={{
                color: isListening ? 'error.main' : 'text.secondary',
                backgroundColor: isListening ? 'rgba(244, 67, 54, 0.1)' : 'transparent',
                '&:hover': {
                    backgroundColor: isListening ? 'rgba(244, 67, 54, 0.2)' : 'rgba(0, 0, 0, 0.04)',
                }
            }}
        >
            {isListening ? (
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                >
                    <VoiceIcon />
                </motion.div>
            ) : (
                <MicIcon />
            )}
        </IconButton>
    );
};

// Floating search bar component
const FloatingSearchBar = ({ 
    value, 
    onChange, 
    onFocus, 
    onClear, 
    onFilterToggle, 
    isVoiceListening, 
    onVoiceToggle,
    onVoiceResult,
    placeholder = "Buscar artículos..."
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { spacing } = useMobileUI();
    const { variants } = useMobileAnimations();
    
    return (
        <motion.div
            variants={variants.card}
            initial="initial"
            animate="animate"
            style={{
                position: 'sticky',
                top: spacing.safe.top || 16,
                zIndex: 1000,
                margin: `0 ${spacing.container}px`,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 6,
                    backgroundColor: SEARCH_THEME.glass.primary,
                    backdropFilter: SEARCH_THEME.blur.strong,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: SEARCH_THEME.shadows.floating,
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <SearchIcon />
                    </IconButton>
                    
                    <InputBase
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={onFocus}
                        placeholder={placeholder}
                        sx={{
                            flex: 1,
                            px: 1,
                            fontSize: isMobile ? '16px' : '14px', // Prevent zoom on iOS
                            '& input': {
                                '&::placeholder': {
                                    color: 'text.secondary',
                                    opacity: 0.7,
                                }
                            }
                        }}
                        inputProps={{
                            'aria-label': 'Buscar artículos',
                            autoComplete: 'off',
                            autoCorrect: 'off',
                            autoCapitalize: 'off',
                            spellCheck: 'false',
                        }}
                    />
                    
                    {value && (
                        <IconButton size="small" onClick={onClear} sx={{ color: 'text.secondary' }}>
                            <ClearIcon />
                        </IconButton>
                    )}
                    
                    <VoiceSearch
                        onResult={onVoiceResult}
                        isListening={isVoiceListening}
                        onToggle={onVoiceToggle}
                    />
                    
                    <IconButton 
                        size="small" 
                        onClick={onFilterToggle}
                        sx={{ 
                            color: 'primary.main',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            '&:hover': {
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            }
                        }}
                    >
                        <FilterIcon />
                    </IconButton>
                </Box>
            </Paper>
        </motion.div>
    );
};

// Bottom sheet filters component
const FilterBottomSheet = ({ 
    open, 
    onClose, 
    filters, 
    categories, 
    tags, 
    onFiltersChange,
    onClearFilters 
}) => {
    const theme = useTheme();
    const { variants } = useMobileAnimations();
    const { spacing } = useMobileUI();
    
    const sortOptions = [
        { value: 'published_at', label: 'Más recientes', icon: <TrendingIcon /> },
        { value: 'views_count', label: 'Más vistos', icon: <TrendingIcon /> },
        { value: 'likes_count', label: 'Más gustados', icon: <TrendingIcon /> },
        { value: 'title', label: 'Alfabético', icon: <SortIcon /> },
    ];
    
    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: '24px 24px 0 0',
                    backgroundColor: SEARCH_THEME.glass.primary,
                    backdropFilter: SEARCH_THEME.blur.strong,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: SEARCH_THEME.shadows.bottomSheet,
                    maxHeight: '80vh',
                    paddingBottom: spacing.safe.bottom || 0,
                }
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: SEARCH_THEME.glass.overlay,
                    backdropFilter: 'blur(4px)',
                }
            }}
        >
            <motion.div
                variants={variants.slideUp}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                {/* Handle */}
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1, pb: 2 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 4,
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: 2,
                        }}
                    />
                </Box>
                
                {/* Header */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    px: 3,
                    pb: 2
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Filtros de búsqueda
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
                
                <Box sx={{ px: 3, pb: 3, maxHeight: '60vh', overflow: 'auto' }}>
                    {/* Categories */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIcon fontSize="small" />
                            Categorías
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {categories.map((category) => (
                                <Chip
                                    key={category.id}
                                    label={category.name}
                                    variant={filters.category === category.slug ? 'filled' : 'outlined'}
                                    onClick={() => onFiltersChange({
                                        ...filters,
                                        category: filters.category === category.slug ? '' : category.slug
                                    })}
                                    sx={{
                                        backgroundColor: filters.category === category.slug 
                                            ? 'primary.main' 
                                            : 'transparent',
                                        color: filters.category === category.slug 
                                            ? 'white' 
                                            : 'text.primary',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        backdropFilter: 'blur(8px)',
                                        '&:hover': {
                                            backgroundColor: filters.category === category.slug 
                                                ? 'primary.dark' 
                                                : 'rgba(59, 130, 246, 0.1)',
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                    
                    <Divider sx={{ my: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                    
                    {/* Sort Options */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SortIcon fontSize="small" />
                            Ordenar por
                        </Typography>
                        <List dense>
                            {sortOptions.map((option) => (
                                <ListItem
                                    key={option.value}
                                    button
                                    onClick={() => onFiltersChange({
                                        ...filters,
                                        sortBy: option.value
                                    })}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 1,
                                        backgroundColor: filters.sortBy === option.value 
                                            ? 'rgba(59, 130, 246, 0.1)' 
                                            : 'transparent',
                                        '&:hover': {
                                            backgroundColor: 'rgba(59, 130, 246, 0.05)',
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        {option.icon}
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={option.label}
                                        primaryTypographyProps={{
                                            fontWeight: filters.sortBy === option.value ? 600 : 400
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                    
                    <Divider sx={{ my: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                    
                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={onClearFilters}
                            sx={{
                                flex: 1,
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                color: 'text.primary',
                                '&:hover': {
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                }
                            }}
                        >
                            Limpiar filtros
                        </Button>
                        <Button
                            variant="contained"
                            onClick={onClose}
                            sx={{
                                flex: 1,
                                backgroundColor: 'primary.main',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                }
                            }}
                        >
                            Aplicar filtros
                        </Button>
                    </Box>
                </Box>
            </motion.div>
        </Drawer>
    );
};

// Main mobile search experience component
const MobileSearchExperience = ({
    searchValue = '',
    onSearchChange,
    filters = {},
    categories = [],
    tags = [],
    onFiltersChange,
    onClearFilters,
    searchHistory = [],
    popularSearches = [],
    onSearchSubmit
}) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isVoiceListening, setIsVoiceListening] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const { triggerHapticFeedback } = useMobileInteractions();
    
    const handleSearchChange = useCallback((value) => {
        onSearchChange(value);
    }, [onSearchChange]);
    
    const handleClearSearch = useCallback(() => {
        triggerHapticFeedback('light');
        onSearchChange('');
    }, [onSearchChange, triggerHapticFeedback]);
    
    const handleFilterToggle = useCallback(() => {
        triggerHapticFeedback('medium');
        setIsFilterOpen(!isFilterOpen);
    }, [isFilterOpen, triggerHapticFeedback]);
    
    const handleVoiceResult = useCallback((transcript) => {
        triggerHapticFeedback('success');
        onSearchChange(transcript);
        if (onSearchSubmit) {
            onSearchSubmit(transcript);
        }
    }, [onSearchChange, onSearchSubmit, triggerHapticFeedback]);
    
    return (
        <>
            <FloatingSearchBar
                value={searchValue}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                onClear={handleClearSearch}
                onFilterToggle={handleFilterToggle}
                isVoiceListening={isVoiceListening}
                onVoiceToggle={setIsVoiceListening}
                onVoiceResult={handleVoiceResult}
            />
            
            <FilterBottomSheet
                open={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                categories={categories}
                tags={tags}
                onFiltersChange={onFiltersChange}
                onClearFilters={onClearFilters}
            />
        </>
    );
};

export default MobileSearchExperience;
