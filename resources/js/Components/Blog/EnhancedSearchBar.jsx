import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Paper,
    InputBase,
    IconButton,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Divider,
    CircularProgress,
    Fade,
    Popper,
    ClickAwayListener,
    Tooltip,
    Badge
} from '@mui/material';
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    History as HistoryIcon,
    TrendingUp as TrendingIcon,
    FilterList as FilterIcon,
    Keyboard as KeyboardIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import SafeHighlightedText from './SafeHighlightedText'; // ✅ SECURITY FIX: Safe highlighting component
import { useSearch } from '@/Hooks/useSearch';

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

const EnhancedSearchBar = ({ 
    placeholder = "Buscar artículos, categorías...",
    showFilters = true,
    showHistory = true,
    showPopular = true,
    onResultSelect,
    className,
    ...props 
}) => {
    const {
        query,
        suggestions,
        popularSearches,
        searchHistory,
        isSuggestionsLoading,
        updateQuery,
        quickSearch,
        navigateToResults,
        clearSearchHistory
    } = useSearch();

    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [quickResults, setQuickResults] = useState([]);
    const [showQuickResults, setShowQuickResults] = useState(false);

    const inputRef = useRef(null);
    const popperRef = useRef(null);
    const anchorRef = useRef(null);
    // ✅ FIX: Add concurrency guard for quick search
    const quickSearchAbortController = useRef(null);

    // Keyboard shortcut (Ctrl+K / Cmd+K)
    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                inputRef.current?.focus();
                setIsOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Handle input focus
    const handleFocus = () => {
        setIsFocused(true);
        setIsOpen(true);
    };

    // Handle input blur
    const handleBlur = () => {
        setIsFocused(false);
        // Delay closing to allow for clicks on suggestions
        setTimeout(() => {
            if (!popperRef.current?.contains(document.activeElement)) {
                setIsOpen(false);
                setSelectedIndex(-1);
            }
        }, 150);
    };

    // Handle input change
    const handleInputChange = async (event) => {
        const value = event.target.value;
        updateQuery(value);
        setSelectedIndex(-1);

        // ✅ FIX: Cancel previous quick search request
        if (quickSearchAbortController.current) {
            quickSearchAbortController.current.abort();
        }

        // Show quick results for queries >= 2 characters
        if (value.length >= 2) {
            setShowQuickResults(true);

            // ✅ FIX: Create new abort controller for this request
            quickSearchAbortController.current = new AbortController();

            try {
                const results = await quickSearch(value);
                // Only update if this request wasn't aborted
                if (!quickSearchAbortController.current.signal.aborted) {
                    setQuickResults(results);
                }
            } catch (error) {
                // Ignore abort errors
                if (error.name !== 'AbortError') {
                    console.error('Quick search error:', error);
                    setQuickResults([]);
                }
            }
        } else {
            setShowQuickResults(false);
            setQuickResults([]);
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (event) => {
        if (!isOpen) return;

        const totalItems = getTotalSuggestionItems();

        // ✅ FIX: Prevent division by zero when no items available
        if (totalItems === 0) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setSelectedIndex(prev => (prev + 1) % totalItems);
                break;
            case 'ArrowUp':
                event.preventDefault();
                setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
                break;
            case 'Enter':
                event.preventDefault();
                handleEnterKey();
                break;
            case 'Escape':
                event.preventDefault();
                setIsOpen(false);
                setSelectedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    // Get total number of suggestion items
    const getTotalSuggestionItems = () => {
        let total = 0;
        if (showQuickResults && quickResults.length > 0) total += quickResults.length;
        if (suggestions.length > 0) total += suggestions.length;
        if (showHistory && searchHistory.length > 0) total += searchHistory.length;
        if (showPopular && popularSearches.length > 0) total += popularSearches.length;
        return total;
    };

    // Handle enter key press
    const handleEnterKey = () => {
        if (selectedIndex >= 0) {
            const selectedItem = getSelectedItem();
            if (selectedItem) {
                if (selectedItem.type === 'result') {
                    // ✅ FIX: Add fallback navigation if onResultSelect fails
                    try {
                        onResultSelect?.(selectedItem.data);
                    } catch (error) {
                        console.error('Result selection error:', error);
                        // Fallback: navigate to search results
                        if (query.trim()) {
                            navigateToResults(query);
                        }
                    }
                } else {
                    updateQuery(selectedItem.text);
                    // ✅ FIX: Add try/catch for navigation
                    try {
                        navigateToResults(selectedItem.text);
                    } catch (error) {
                        console.error('Navigation error:', error);
                        // Fallback: use window.location
                        window.location.href = `/search?q=${encodeURIComponent(selectedItem.text)}`;
                    }
                }
            }
        } else if (query.trim()) {
            // ✅ FIX: Add try/catch for navigation
            try {
                navigateToResults();
            } catch (error) {
                console.error('Navigation error:', error);
                // Fallback: use window.location
                window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }
        }
        setIsOpen(false);
    };

    // Get selected item based on index
    const getSelectedItem = () => {
        let currentIndex = 0;
        
        // Quick results
        if (showQuickResults && quickResults.length > 0) {
            if (selectedIndex < currentIndex + quickResults.length) {
                return { type: 'result', data: quickResults[selectedIndex - currentIndex] };
            }
            currentIndex += quickResults.length;
        }

        // Suggestions
        if (suggestions.length > 0) {
            if (selectedIndex < currentIndex + suggestions.length) {
                return { type: 'suggestion', text: suggestions[selectedIndex - currentIndex] };
            }
            currentIndex += suggestions.length;
        }

        // History
        if (showHistory && searchHistory.length > 0) {
            if (selectedIndex < currentIndex + searchHistory.length) {
                return { type: 'history', text: searchHistory[selectedIndex - currentIndex] };
            }
            currentIndex += searchHistory.length;
        }

        // Popular
        if (showPopular && popularSearches.length > 0) {
            if (selectedIndex < currentIndex + popularSearches.length) {
                return { type: 'popular', text: popularSearches[selectedIndex - currentIndex].term };
            }
        }

        return null;
    };

    // Handle suggestion click
    const handleSuggestionClick = (text, type = 'suggestion') => {
        if (type === 'result') {
            onResultSelect?.(text);
        } else {
            updateQuery(text);
            navigateToResults(text);
        }
        setIsOpen(false);
    };

    // Clear search
    const handleClear = () => {
        updateQuery('');
        setQuickResults([]);
        setShowQuickResults(false);
        inputRef.current?.focus();
    };

    return (
        <ClickAwayListener onClickAway={() => setIsOpen(false)}>
            <Box className={className} {...props}>
                {/* Search Input */}
                <Paper
                    ref={anchorRef}
                    component={motion.div}
                    animate={{
                        scale: isFocused ? 1.02 : 1,
                        boxShadow: isFocused ? THEME.shadows.lg : THEME.shadows.md,
                    }}
                    transition={{ duration: 0.2 }}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        background: `linear-gradient(145deg, 
                            rgba(255, 255, 255, 0.95) 0%, 
                            rgba(255, 255, 255, 0.85) 100%
                        )`,
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        border: `2px solid ${isFocused ? THEME.primary[400] : 'rgba(255, 255, 255, 0.3)'}`,
                        borderRadius: 3,
                        px: 2,
                        py: 1,
                        minHeight: 56,
                        position: 'relative',
                        overflow: 'hidden',
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
                            opacity: isFocused ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                            pointerEvents: 'none'
                        }
                    }}
                >
                    <SearchIcon sx={{ 
                        color: isFocused ? THEME.primary[500] : THEME.text.muted,
                        mr: 1,
                        transition: 'color 0.2s ease'
                    }} />
                    
                    <InputBase
                        ref={inputRef}
                        placeholder={placeholder}
                        value={query}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        sx={{
                            flex: 1,
                            '& .MuiInputBase-input': {
                                fontSize: '1rem',
                                fontWeight: 500,
                                color: THEME.text.primary,
                                '&::placeholder': {
                                    color: THEME.text.muted,
                                    opacity: 1
                                }
                            }
                        }}
                    />

                    {/* Loading indicator */}
                    {isSuggestionsLoading && (
                        <CircularProgress size={20} sx={{ mr: 1, color: THEME.primary[500] }} />
                    )}

                    {/* Clear button */}
                    {query && (
                        <Tooltip title="Limpiar búsqueda">
                            <IconButton
                                size="small"
                                onClick={handleClear}
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

                    {/* Keyboard shortcut hint */}
                    {!isFocused && !query && (
                        <Chip
                            icon={<KeyboardIcon />}
                            label="Ctrl+K"
                            size="small"
                            variant="outlined"
                            sx={{
                                ml: 1,
                                height: 24,
                                fontSize: '0.75rem',
                                borderColor: THEME.border.light,
                                color: THEME.text.muted,
                                '& .MuiChip-icon': {
                                    fontSize: '0.875rem'
                                }
                            }}
                        />
                    )}
                </Paper>

                {/* Search Suggestions Dropdown */}
                <Popper
                    ref={popperRef}
                    open={isOpen}
                    anchorEl={anchorRef.current}
                    placement="bottom-start"
                    style={{ zIndex: 1300, width: anchorRef.current?.offsetWidth }}
                    transition
                >
                    {({ TransitionProps }) => (
                        <Fade {...TransitionProps} timeout={200}>
                            <Paper
                                component={motion.div}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                sx={{
                                    mt: 1,
                                    maxHeight: 400,
                                    overflow: 'auto',
                                    background: `linear-gradient(145deg, 
                                        rgba(255, 255, 255, 0.95) 0%, 
                                        rgba(255, 255, 255, 0.9) 100%
                                    )`,
                                    backdropFilter: 'blur(20px) saturate(180%)',
                                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                                    border: `1px solid rgba(255, 255, 255, 0.3)`,
                                    boxShadow: THEME.shadows.xl,
                                    borderRadius: 2
                                }}
                            >
                                <SearchSuggestionsList
                                    quickResults={showQuickResults ? quickResults : []}
                                    suggestions={suggestions}
                                    searchHistory={showHistory ? searchHistory : []}
                                    popularSearches={showPopular ? popularSearches : []}
                                    selectedIndex={selectedIndex}
                                    onSuggestionClick={handleSuggestionClick}
                                    onClearHistory={clearSearchHistory}
                                />
                            </Paper>
                        </Fade>
                    )}
                </Popper>
            </Box>
        </ClickAwayListener>
    );
};

// Search Suggestions List Component
const SearchSuggestionsList = ({
    quickResults,
    suggestions,
    searchHistory,
    popularSearches,
    selectedIndex,
    onSuggestionClick,
    onClearHistory
}) => {
    let currentIndex = 0;

    return (
        <List sx={{ py: 1 }}>
            {/* Quick Results */}
            {quickResults.length > 0 && (
                <>
                    <ListItem sx={{ py: 0.5, px: 2 }}>
                        <Typography variant="caption" sx={{
                            color: THEME.text.muted,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}>
                            Resultados
                        </Typography>
                    </ListItem>
                    {quickResults.map((result, index) => {
                        const itemIndex = currentIndex + index;
                        return (
                            <motion.div
                                key={`result-${result.id}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <ListItem
                                    button
                                    selected={selectedIndex === itemIndex}
                                    onClick={() => onSuggestionClick(result, 'result')}
                                    sx={{
                                        py: 1,
                                        px: 2,
                                        borderRadius: 1,
                                        mx: 1,
                                        mb: 0.5,
                                        backgroundColor: selectedIndex === itemIndex ?
                                            `${THEME.primary[50]} !important` : 'transparent',
                                        '&:hover': {
                                            backgroundColor: THEME.primary[25]
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <SearchIcon sx={{
                                            fontSize: '1rem',
                                            color: selectedIndex === itemIndex ?
                                                THEME.primary[600] : THEME.text.muted
                                        }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            /* ✅ SECURITY FIX: Use SafeHighlightedText instead of dangerouslySetInnerHTML */
                                            <SafeHighlightedText
                                                text={result.title}
                                                highlightedText={result.highlighted_title}
                                                sx={{
                                                    fontWeight: 500,
                                                    color: selectedIndex === itemIndex ?
                                                        THEME.primary[700] : THEME.text.primary
                                                }}
                                            />
                                        }
                                        secondary={
                                            result.excerpt && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: THEME.text.muted,
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 1,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {result.excerpt}
                                                </Typography>
                                            )
                                        }
                                    />
                                </ListItem>
                            </motion.div>
                        );
                    })}
                    <Divider sx={{ my: 1 }} />
                </>
            )}

            {/* Update current index */}
            {(() => { currentIndex += quickResults.length; return null; })()}

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <>
                    <ListItem sx={{ py: 0.5, px: 2 }}>
                        <Typography variant="caption" sx={{
                            color: THEME.text.muted,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}>
                            Sugerencias
                        </Typography>
                    </ListItem>
                    {suggestions.map((suggestion, index) => {
                        const itemIndex = currentIndex + index;
                        return (
                            <motion.div
                                key={`suggestion-${suggestion}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <ListItem
                                    button
                                    selected={selectedIndex === itemIndex}
                                    onClick={() => onSuggestionClick(suggestion)}
                                    sx={{
                                        py: 0.75,
                                        px: 2,
                                        borderRadius: 1,
                                        mx: 1,
                                        mb: 0.5,
                                        backgroundColor: selectedIndex === itemIndex ?
                                            `${THEME.primary[50]} !important` : 'transparent',
                                        '&:hover': {
                                            backgroundColor: THEME.primary[25]
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <SearchIcon sx={{
                                            fontSize: '1rem',
                                            color: selectedIndex === itemIndex ?
                                                THEME.primary[600] : THEME.text.muted
                                        }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: selectedIndex === itemIndex ?
                                                        THEME.primary[700] : THEME.text.primary
                                                }}
                                            >
                                                {suggestion}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            </motion.div>
                        );
                    })}
                    <Divider sx={{ my: 1 }} />
                </>
            )}

            {/* Update current index */}
            {(() => { currentIndex += suggestions.length; return null; })()}

            {/* Search History */}
            {searchHistory.length > 0 && (
                <>
                    <ListItem sx={{ py: 0.5, px: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{
                            color: THEME.text.muted,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}>
                            Búsquedas recientes
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={onClearHistory}
                            sx={{
                                color: THEME.text.muted,
                                '&:hover': { color: THEME.text.secondary }
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </ListItem>
                    {searchHistory.slice(0, 5).map((historyItem, index) => {
                        const itemIndex = currentIndex + index;
                        return (
                            <ListItem
                                key={`history-${historyItem}`}
                                button
                                selected={selectedIndex === itemIndex}
                                onClick={() => onSuggestionClick(historyItem)}
                                sx={{
                                    py: 0.75,
                                    px: 2,
                                    borderRadius: 1,
                                    mx: 1,
                                    mb: 0.5,
                                    backgroundColor: selectedIndex === itemIndex ?
                                        `${THEME.primary[50]} !important` : 'transparent',
                                    '&:hover': {
                                        backgroundColor: THEME.primary[25]
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <HistoryIcon sx={{
                                        fontSize: '1rem',
                                        color: selectedIndex === itemIndex ?
                                            THEME.primary[600] : THEME.text.muted
                                    }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: selectedIndex === itemIndex ?
                                                    THEME.primary[700] : THEME.text.secondary
                                            }}
                                        >
                                            {historyItem}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        );
                    })}
                    <Divider sx={{ my: 1 }} />
                </>
            )}

            {/* Update current index */}
            {(() => { currentIndex += searchHistory.length; return null; })()}

            {/* Popular Searches */}
            {popularSearches.length > 0 && (
                <>
                    <ListItem sx={{ py: 0.5, px: 2 }}>
                        <Typography variant="caption" sx={{
                            color: THEME.text.muted,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}>
                            Búsquedas populares
                        </Typography>
                    </ListItem>
                    {popularSearches.slice(0, 5).map((popularItem, index) => {
                        const itemIndex = currentIndex + index;
                        return (
                            <ListItem
                                key={`popular-${popularItem.term}`}
                                button
                                selected={selectedIndex === itemIndex}
                                onClick={() => onSuggestionClick(popularItem.term)}
                                sx={{
                                    py: 0.75,
                                    px: 2,
                                    borderRadius: 1,
                                    mx: 1,
                                    mb: 0.5,
                                    backgroundColor: selectedIndex === itemIndex ?
                                        `${THEME.primary[50]} !important` : 'transparent',
                                    '&:hover': {
                                        backgroundColor: THEME.primary[25]
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <TrendingIcon sx={{
                                        fontSize: '1rem',
                                        color: selectedIndex === itemIndex ?
                                            THEME.primary[600] : THEME.text.muted
                                    }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: selectedIndex === itemIndex ?
                                                    THEME.primary[700] : THEME.text.secondary
                                            }}
                                        >
                                            {popularItem.term}
                                        </Typography>
                                    }
                                    secondary={
                                        <Badge
                                            badgeContent={popularItem.count}
                                            color="primary"
                                            sx={{
                                                '& .MuiBadge-badge': {
                                                    fontSize: '0.625rem',
                                                    height: 16,
                                                    minWidth: 16
                                                }
                                            }}
                                        />
                                    }
                                />
                            </ListItem>
                        );
                    })}
                </>
            )}
        </List>
    );
};

export default EnhancedSearchBar;
