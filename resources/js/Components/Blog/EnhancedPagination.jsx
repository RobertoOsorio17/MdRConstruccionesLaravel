import React, { useState } from 'react';
import {
    Box,
    Pagination,
    Typography,
    Stack,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    FirstPage as FirstPageIcon,
    LastPage as LastPageIcon,
    NavigateBefore as PrevIcon,
    NavigateNext as NextIcon,
    KeyboardArrowUp as GoToTopIcon
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

const EnhancedPagination = ({
    currentPage = 1,
    lastPage = 1,
    total = 0,
    perPage = 12,
    from = 0,
    to = 0,
    onPageChange,
    onPerPageChange,
    showPerPageSelector = true,
    showGoToPage = true,
    showResultsInfo = true,
    showScrollToTop = true,
    perPageOptions = [6, 12, 18, 24, 36],
    className = '',
    ...props
}) => {
    const [goToPageValue, setGoToPageValue] = useState('');
    const [showGoToInput, setShowGoToInput] = useState(false);

    // Handle page change
    const handlePageChange = (event, page) => {
        onPageChange?.(page);
        
        // Smooth scroll to top of content
        if (showScrollToTop) {
            const blogContent = document.getElementById('blog-content') || document.querySelector('main');
            if (blogContent) {
                blogContent.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    // Handle per page change
    const handlePerPageChange = (event) => {
        const newPerPage = event.target.value;
        onPerPageChange?.(newPerPage);
    };

    // Handle go to page
    const handleGoToPage = () => {
        const pageNumber = parseInt(goToPageValue);
        if (pageNumber >= 1 && pageNumber <= lastPage) {
            handlePageChange(null, pageNumber);
            setGoToPageValue('');
            setShowGoToInput(false);
        }
    };

    // Handle key press in go to page input
    const handleGoToPageKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleGoToPage();
        } else if (event.key === 'Escape') {
            setGoToPageValue('');
            setShowGoToInput(false);
        }
    };

    // Animation variants
    const containerVariants = {
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

    const chipVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    // Don't render if there's only one page
    if (lastPage <= 1) return null;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={className}
        >
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'stretch', md: 'center' },
                justifyContent: 'space-between',
                gap: 3,
                p: 3,
                background: `linear-gradient(145deg, 
                    rgba(255, 255, 255, 0.95) 0%, 
                    rgba(255, 255, 255, 0.9) 100%
                )`,
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: `1px solid rgba(255, 255, 255, 0.3)`,
                borderRadius: 4,
                boxShadow: THEME.shadows.lg,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `radial-gradient(circle at 20% 80%, ${THEME.primary[50]} 0%, transparent 50%),
                                radial-gradient(circle at 80% 20%, ${THEME.primary[100]} 0%, transparent 50%)`,
                    opacity: 0.5,
                    pointerEvents: 'none'
                }
            }}>
                {/* Results Info */}
                {showResultsInfo && (
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography variant="body2" sx={{ 
                            color: THEME.text.secondary,
                            fontWeight: 500,
                            mb: { xs: 1, md: 0 }
                        }}>
                            Mostrando {from.toLocaleString()} - {to.toLocaleString()} de {total.toLocaleString()} resultados
                        </Typography>
                        
                        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                            <motion.div variants={chipVariants}>
                                <Chip
                                    label={`Página ${currentPage} de ${lastPage}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        fontSize: '0.75rem',
                                        height: 24,
                                        borderColor: THEME.primary[200],
                                        color: THEME.primary[600],
                                        backgroundColor: 'rgba(59, 130, 246, 0.05)'
                                    }}
                                />
                            </motion.div>
                            
                            {showPerPageSelector && (
                                <motion.div variants={chipVariants}>
                                    <Chip
                                        label={`${perPage} por página`}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            fontSize: '0.75rem',
                                            height: 24,
                                            borderColor: THEME.primary[200],
                                            color: THEME.primary[600],
                                            backgroundColor: 'rgba(59, 130, 246, 0.05)'
                                        }}
                                    />
                                </motion.div>
                            )}
                        </Stack>
                    </Box>
                )}

                {/* Main Pagination */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    position: 'relative',
                    zIndex: 1,
                    justifyContent: { xs: 'center', md: 'flex-start' }
                }}>
                    <Pagination
                        count={lastPage}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                        siblingCount={1}
                        boundaryCount={1}
                        sx={{
                            '& .MuiPaginationItem-root': {
                                borderRadius: 3,
                                fontWeight: 600,
                                fontSize: '1rem',
                                minWidth: 44,
                                height: 44,
                                margin: '0 4px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: `1px solid ${THEME.border.light}`,
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                    transform: 'translateY(-2px) scale(1.05)',
                                    boxShadow: `0 4px 15px rgba(59, 130, 246, 0.2)`,
                                    borderColor: THEME.primary[400],
                                    backgroundColor: THEME.primary[50]
                                },
                                '&.Mui-selected': {
                                    backgroundColor: THEME.primary[600],
                                    color: 'white',
                                    border: 'none',
                                    boxShadow: `0 4px 15px rgba(59, 130, 246, 0.4)`,
                                    transform: 'translateY(-1px)',
                                    '&:hover': {
                                        backgroundColor: THEME.primary[700],
                                        transform: 'translateY(-3px) scale(1.05)',
                                        boxShadow: `0 6px 20px rgba(59, 130, 246, 0.5)`
                                    }
                                },
                                '&.MuiPaginationItem-ellipsis': {
                                    border: 'none',
                                    backgroundColor: 'transparent'
                                }
                            }
                        }}
                    />
                </Box>

                {/* Controls */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    position: 'relative',
                    zIndex: 1,
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'center', md: 'flex-end' }
                }}>
                    {/* Per Page Selector */}
                    {showPerPageSelector && (
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Por página</InputLabel>
                            <Select
                                value={perPage}
                                label="Por página"
                                onChange={handlePerPageChange}
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)'
                                    }
                                }}
                            >
                                {perPageOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {/* Go to Page */}
                    {showGoToPage && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AnimatePresence>
                                {showGoToInput ? (
                                    <motion.div
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <TextField
                                            size="small"
                                            type="number"
                                            value={goToPageValue}
                                            onChange={(e) => setGoToPageValue(e.target.value)}
                                            onKeyPress={handleGoToPageKeyPress}
                                            placeholder={`1-${lastPage}`}
                                            inputProps={{ 
                                                min: 1, 
                                                max: lastPage,
                                                style: { textAlign: 'center' }
                                            }}
                                            sx={{
                                                width: 80,
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                    backdropFilter: 'blur(10px)'
                                                }
                                            }}
                                            autoFocus
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Tooltip title="Ir a página específica">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => setShowGoToInput(true)}
                                                sx={{
                                                    minWidth: 'auto',
                                                    px: 2,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                    backdropFilter: 'blur(10px)',
                                                    borderColor: THEME.primary[200],
                                                    color: THEME.primary[600],
                                                    '&:hover': {
                                                        backgroundColor: THEME.primary[50],
                                                        borderColor: THEME.primary[300]
                                                    }
                                                }}
                                            >
                                                Ir a...
                                            </Button>
                                        </Tooltip>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            {showGoToInput && (
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleGoToPage}
                                    disabled={!goToPageValue || parseInt(goToPageValue) < 1 || parseInt(goToPageValue) > lastPage}
                                    sx={{ minWidth: 'auto', px: 2 }}
                                >
                                    Ir
                                </Button>
                            )}
                        </Box>
                    )}

                    {/* Scroll to Top */}
                    {showScrollToTop && (
                        <Tooltip title="Volver arriba">
                            <IconButton
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(10px)',
                                    border: `1px solid ${THEME.primary[200]}`,
                                    color: THEME.primary[600],
                                    '&:hover': {
                                        backgroundColor: THEME.primary[50],
                                        borderColor: THEME.primary[300],
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                <GoToTopIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>
        </motion.div>
    );
};

export default EnhancedPagination;
