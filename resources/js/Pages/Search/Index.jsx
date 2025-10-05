import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
    Container,
    Box,
    TextField,
    Typography,
    Tabs,
    Tab,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Chip,
    InputAdornment,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    Stack,
    Divider,
    Paper,
    alpha,
} from '@mui/material';
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    Article as ArticleIcon,
    Build as BuildIcon,
    Construction as ConstructionIcon,
    TrendingUp as TrendingIcon,
    History as HistoryIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchIndex({ 
    results, 
    query, 
    type, 
    category, 
    sort, 
    total, 
    suggestions, 
    categories, 
    recentSearches 
}) {
    const [searchQuery, setSearchQuery] = useState(query || '');
    const [activeTab, setActiveTab] = useState(type || 'all');
    const [selectedCategory, setSelectedCategory] = useState(category || '');
    const [selectedSort, setSelectedSort] = useState(sort || 'relevance');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Handle search submission
    const handleSearch = (newQuery = searchQuery) => {
        if (newQuery.trim().length < 2) return;

        router.get(route('search.index'), {
            q: newQuery,
            type: activeTab,
            category: selectedCategory,
            sort: selectedSort,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        if (searchQuery.trim().length >= 2) {
            router.get(route('search.index'), {
                q: searchQuery,
                type: newValue,
                category: selectedCategory,
                sort: selectedSort,
            }, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    // Handle category change
    const handleCategoryChange = (event) => {
        const newCategory = event.target.value;
        setSelectedCategory(newCategory);
        if (searchQuery.trim().length >= 2) {
            router.get(route('search.index'), {
                q: searchQuery,
                type: activeTab,
                category: newCategory,
                sort: selectedSort,
            }, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    // Handle sort change
    const handleSortChange = (event) => {
        const newSort = event.target.value;
        setSelectedSort(newSort);
        if (searchQuery.trim().length >= 2) {
            router.get(route('search.index'), {
                q: searchQuery,
                type: activeTab,
                category: selectedCategory,
                sort: newSort,
            }, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    // Glassmorphism styles
    const glassStyle = {
        background: alpha('#ffffff', 0.7),
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: `1px solid ${alpha('#ffffff', 0.3)}`,
        boxShadow: `0 8px 32px 0 ${alpha('#000000', 0.1)}`,
    };

    return (
        <MainLayout>
            <Head title={`Búsqueda: ${query || 'Buscar'}`} />

            <Box
                sx={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    pt: 12,
                    pb: 8,
                }}
            >
                <Container maxWidth="lg">
                    {/* Search Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                ...glassStyle,
                                p: 4,
                                mb: 4,
                            }}
                        >
                            <Typography
                                variant="h3"
                                gutterBottom
                                sx={{
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 3,
                                }}
                            >
                                Búsqueda Global
                            </Typography>

                            {/* Search Input */}
                            <Autocomplete
                                freeSolo
                                options={suggestions || []}
                                value={searchQuery}
                                onInputChange={(event, newValue) => {
                                    setSearchQuery(newValue);
                                    setShowSuggestions(true);
                                }}
                                onChange={(event, newValue) => {
                                    if (newValue) {
                                        handleSearch(newValue);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        placeholder="Buscar posts, servicios, proyectos..."
                                        variant="outlined"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearch();
                                                setShowSuggestions(false);
                                            }
                                        }}
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon color="primary" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <>
                                                    {searchQuery && (
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={() => {
                                                                    setSearchQuery('');
                                                                    setShowSuggestions(false);
                                                                }}
                                                                edge="end"
                                                            >
                                                                <ClearIcon />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                            sx: {
                                                background: alpha('#ffffff', 0.9),
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                )}
                            />

                            {/* Recent Searches */}
                            {recentSearches && recentSearches.length > 0 && !searchQuery && (
                                <Box sx={{ mt: 2 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                        <HistoryIcon fontSize="small" color="action" />
                                        <Typography variant="caption" color="text.secondary">
                                            Búsquedas recientes:
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        {recentSearches.slice(0, 5).map((recentQuery, index) => (
                                            <Chip
                                                key={index}
                                                label={recentQuery}
                                                size="small"
                                                onClick={() => {
                                                    setSearchQuery(recentQuery);
                                                    handleSearch(recentQuery);
                                                }}
                                                sx={{ mb: 1 }}
                                            />
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </Paper>
                    </motion.div>

                    {/* Filters and Tabs */}
                    {query && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    ...glassStyle,
                                    mb: 4,
                                }}
                            >
                                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                                    <Tabs
                                        value={activeTab}
                                        onChange={handleTabChange}
                                        variant="scrollable"
                                        scrollButtons="auto"
                                    >
                                        <Tab
                                            label={`Todos (${total})`}
                                            value="all"
                                            icon={<SearchIcon />}
                                            iconPosition="start"
                                        />
                                        <Tab
                                            label={`Posts (${results.posts?.length || 0})`}
                                            value="posts"
                                            icon={<ArticleIcon />}
                                            iconPosition="start"
                                        />
                                        <Tab
                                            label={`Servicios (${results.services?.length || 0})`}
                                            value="services"
                                            icon={<BuildIcon />}
                                            iconPosition="start"
                                        />
                                        <Tab
                                            label={`Proyectos (${results.projects?.length || 0})`}
                                            value="projects"
                                            icon={<ConstructionIcon />}
                                            iconPosition="start"
                                        />
                                    </Tabs>
                                </Box>

                                {/* Filters */}
                                <Box sx={{ p: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Categoría</InputLabel>
                                                <Select
                                                    value={selectedCategory}
                                                    onChange={handleCategoryChange}
                                                    label="Categoría"
                                                    sx={{ background: alpha('#ffffff', 0.9) }}
                                                >
                                                    <MenuItem value="">Todas las categorías</MenuItem>
                                                    {categories?.map((cat) => (
                                                        <MenuItem key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Ordenar por</InputLabel>
                                                <Select
                                                    value={selectedSort}
                                                    onChange={handleSortChange}
                                                    label="Ordenar por"
                                                    sx={{ background: alpha('#ffffff', 0.9) }}
                                                >
                                                    <MenuItem value="relevance">Relevancia</MenuItem>
                                                    <MenuItem value="date">Fecha</MenuItem>
                                                    <MenuItem value="views">Vistas</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Paper>
                        </motion.div>
                    )}

                    {/* Results */}
                    {query && total > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Grid container spacing={3}>
                                <AnimatePresence>
                                    {/* Posts Results */}
                                    {(activeTab === 'all' || activeTab === 'posts') &&
                                        results.posts?.map((post, index) => (
                                            <Grid item xs={12} key={`post-${post.id}`}>
                                                <SearchResultCard
                                                    item={post}
                                                    index={index}
                                                    icon={<ArticleIcon />}
                                                />
                                            </Grid>
                                        ))}

                                    {/* Services Results */}
                                    {(activeTab === 'all' || activeTab === 'services') &&
                                        results.services?.map((service, index) => (
                                            <Grid item xs={12} key={`service-${service.id}`}>
                                                <SearchResultCard
                                                    item={service}
                                                    index={index}
                                                    icon={<BuildIcon />}
                                                />
                                            </Grid>
                                        ))}

                                    {/* Projects Results */}
                                    {(activeTab === 'all' || activeTab === 'projects') &&
                                        results.projects?.map((project, index) => (
                                            <Grid item xs={12} key={`project-${project.id}`}>
                                                <SearchResultCard
                                                    item={project}
                                                    index={index}
                                                    icon={<ConstructionIcon />}
                                                />
                                            </Grid>
                                        ))}
                                </AnimatePresence>
                            </Grid>
                        </motion.div>
                    )}

                    {/* No Results */}
                    {query && total === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    ...glassStyle,
                                    p: 6,
                                    textAlign: 'center',
                                }}
                            >
                                <SearchIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h5" gutterBottom>
                                    No se encontraron resultados
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Intenta con otros términos de búsqueda
                                </Typography>
                            </Paper>
                        </motion.div>
                    )}
                </Container>
            </Box>
        </MainLayout>
    );
}

// Search Result Card Component
function SearchResultCard({ item, index, icon }) {
    const glassStyle = {
        background: alpha('#ffffff', 0.7),
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: `1px solid ${alpha('#ffffff', 0.3)}`,
        boxShadow: `0 8px 32px 0 ${alpha('#000000', 0.1)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 40px 0 ${alpha('#000000', 0.15)}`,
        },
    };

    const getRoute = () => {
        switch (item.type) {
            case 'post':
                return route('blog.show', item.slug);
            case 'service':
                return route('services.show', item.slug);
            case 'project':
                return route('projects.show', item.slug);
            default:
                return '#';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Card
                elevation={0}
                component="a"
                href={getRoute()}
                sx={{
                    ...glassStyle,
                    textDecoration: 'none',
                    display: 'block',
                }}
            >
                <CardContent>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                        {/* Icon */}
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                background: alpha('#667eea', 0.1),
                                color: '#667eea',
                            }}
                        >
                            {icon}
                        </Box>

                        {/* Content */}
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                {item.title}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                                dangerouslySetInnerHTML={{ __html: item.highlight }}
                            />

                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                <Chip
                                    label={item.type === 'post' ? 'Blog' : item.type === 'service' ? 'Servicio' : 'Proyecto'}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                                {item.category && (
                                    <Chip
                                        label={item.category.name}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                                {item.published_at && (
                                    <Chip
                                        label={item.published_at}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                                {item.views_count > 0 && (
                                    <Chip
                                        icon={<TrendingIcon />}
                                        label={`${item.views_count} vistas`}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </Stack>
                        </Box>

                        {/* Image */}
                        {(item.cover_image || item.image) && (
                            <CardMedia
                                component="img"
                                sx={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: 2,
                                    objectFit: 'cover',
                                }}
                                image={item.cover_image || item.image}
                                alt={item.title}
                            />
                        )}
                    </Stack>
                </CardContent>
            </Card>
        </motion.div>
    );
}

