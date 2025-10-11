import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    TextField,
    Box,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Chip,
    CircularProgress,
    InputAdornment,
    alpha,
    Divider,
    IconButton
} from '@mui/material';
import {
    Search as SearchIcon,
    Article as ArticleIcon,
    BusinessCenter as ServiceIcon,
    Work as ProjectIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const GlobalSearch = ({ open, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const glassStyle = {
        background: alpha('#ffffff', 0.95),
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: `1px solid ${alpha('#ffffff', 0.3)}`,
        boxShadow: `0 8px 32px 0 ${alpha('#000000', 0.1)}`,
    };

    useEffect(() => {
        if (query.length >= 2) {
            setLoading(true);

            // Debounce search
            const timeout = setTimeout(() => {
                performSearch();
            }, 300);

            return () => clearTimeout(timeout);
        } else {
            setResults([]);
            setLoading(false);
        }
    }, [query]);

    const performSearch = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/search', {
                params: {
                    q: query,
                    per_page: 10 // Limit results for quick search
                }
            });

            console.log('Search response:', response.data);

            // Handle response format from SearchController
            const data = response.data;

            if (!data.success) {
                console.error('Search failed:', data.message);
                setResults([]);
                setLoading(false);
                return;
            }

            // Transform data to expected format
            const transformedResults = [];

            // The SearchController returns paginated data in data.data.data
            const posts = data.data?.data || data.data || [];

            console.log('Posts found:', posts);

            if (Array.isArray(posts)) {
                posts.forEach(post => {
                    transformedResults.push({
                        id: `post-${post.id}`,
                        type: 'post',
                        title: post.highlighted_title || post.title,
                        excerpt: post.highlighted_excerpt || post.excerpt || post.content?.substring(0, 150) || '',
                        url: `/blog/${post.slug}`
                    });
                });
            }

            console.log('Transformed results:', transformedResults);
            setResults(transformedResults);
        } catch (error) {
            console.error('Search error:', error);

            // Show user-friendly error message
            if (error.response) {
                // Server responded with error
                console.error('Server error:', error.response.data);
            } else if (error.request) {
                // Request made but no response
                console.error('No response from server');
            } else {
                // Error setting up request
                console.error('Request setup error:', error.message);
            }

            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleResultClick = (result) => {
        router.visit(result.url);
        onClose();
        setQuery('');
        setResults([]);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'post':
                return <ArticleIcon color="primary" />;
            case 'service':
                return <ServiceIcon color="success" />;
            case 'project':
                return <ProjectIcon color="warning" />;
            default:
                return <SearchIcon />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'post':
                return 'Blog';
            case 'service':
                return 'Servicio';
            case 'project':
                return 'Proyecto';
            default:
                return type;
        }
    };

    const handleClose = () => {
        setQuery('');
        setResults([]);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    ...glassStyle,
                    maxHeight: '80vh',
                }
            }}
        >
            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>
                            Búsqueda Global
                        </Typography>
                        <IconButton onClick={handleClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    
                    <TextField
                        fullWidth
                        autoFocus
                        placeholder="Buscar servicios, proyectos, artículos..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: loading && (
                                <InputAdornment position="end">
                                    <CircularProgress size={20} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                backgroundColor: alpha('#ffffff', 0.8),
                            }
                        }}
                    />
                </Box>

                <Divider />

                <Box sx={{ maxHeight: '50vh', overflow: 'auto', p: 2 }}>
                    {query.length < 2 && (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="body1" color="text.secondary">
                                Escribe al menos 2 caracteres para buscar
                            </Typography>
                        </Box>
                    )}

                    {query.length >= 2 && results.length === 0 && !loading && (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Typography variant="body1" color="text.secondary">
                                No se encontraron resultados para "{query}"
                            </Typography>
                        </Box>
                    )}

                    <AnimatePresence>
                        {results.length > 0 && (
                            <List sx={{ p: 0 }}>
                                {results.map((result, index) => (
                                    <motion.div
                                        key={result.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <ListItem disablePadding sx={{ mb: 1 }}>
                                            <ListItemButton
                                                onClick={() => handleResultClick(result)}
                                                sx={{
                                                    borderRadius: 2,
                                                    p: 2,
                                                    backgroundColor: alpha('#ffffff', 0.5),
                                                    border: `1px solid ${alpha('#000000', 0.05)}`,
                                                    '&:hover': {
                                                        backgroundColor: alpha('#3b82f6', 0.1),
                                                        borderColor: alpha('#3b82f6', 0.3),
                                                    }
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 48 }}>
                                                    {getIcon(result.type)}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography
                                                                variant="body1"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    '& mark.search-highlight': {
                                                                        backgroundColor: '#fef08a',
                                                                        color: '#854d0e',
                                                                        padding: '2px 4px',
                                                                        borderRadius: '2px',
                                                                        fontWeight: 700,
                                                                    }
                                                                }}
                                                                dangerouslySetInnerHTML={{ __html: result.title }}
                                                            />
                                                            <Chip
                                                                label={getTypeLabel(result.type)}
                                                                size="small"
                                                                sx={{
                                                                    height: 20,
                                                                    fontSize: '0.7rem',
                                                                }}
                                                            />
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                mt: 0.5,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                '& mark.search-highlight': {
                                                                    backgroundColor: '#fef08a',
                                                                    color: '#854d0e',
                                                                    padding: '2px 4px',
                                                                    borderRadius: '2px',
                                                                    fontWeight: 700,
                                                                }
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: result.excerpt }}
                                                        />
                                                    }
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    </motion.div>
                                ))}
                            </List>
                        )}
                    </AnimatePresence>
                </Box>

                {results.length > 0 && (
                    <>
                        <Divider />
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                            </Typography>
                        </Box>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default GlobalSearch;

