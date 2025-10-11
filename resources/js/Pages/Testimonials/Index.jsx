import React, { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Rating,
    Chip,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    alpha,
    useTheme,
    Pagination,
} from '@mui/material';
import {
    LocationOn,
    AttachMoney,
    Schedule,
    Star,
    Add,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function TestimonialsIndex({ testimonials, projectTypes, filters }) {
    const theme = useTheme();
    const [selectedType, setSelectedType] = useState(filters.project_type || '');
    const [selectedRating, setSelectedRating] = useState(filters.rating || '');
    const [sortBy, setSortBy] = useState(filters.sort || 'featured');

    // Glassmorphism style
    const glassStyle = {
        background: alpha('#ffffff', 0.7),
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: `1px solid ${alpha('#ffffff', 0.3)}`,
        boxShadow: `0 8px 32px 0 ${alpha('#000000', 0.1)}`,
    };

    const handleFilterChange = () => {
        const params = new URLSearchParams();
        if (selectedType) params.append('project_type', selectedType);
        if (selectedRating) params.append('rating', selectedRating);
        if (sortBy) params.append('sort', sortBy);
        
        window.location.href = route('testimonials.index', Object.fromEntries(params));
    };

    return (
        <MainLayout>
            <Head title="Client Testimonials" />

            {/* Hero Section */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: 'white',
                    py: 8,
                    mb: 6,
                }}
            >
                <Container maxWidth="lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Typography variant="h2" fontWeight="bold" gutterBottom align="center">
                            Client Testimonials
                        </Typography>
                        <Typography variant="h5" align="center" sx={{ mb: 4, opacity: 0.9 }}>
                            Real stories from satisfied clients
                        </Typography>
                        <Box display="flex" justifyContent="center">
                            <Button
                                component={Link}
                                href={route('testimonials.create')}
                                variant="contained"
                                size="large"
                                startIcon={<Add />}
                                sx={{
                                    bgcolor: 'white',
                                    color: theme.palette.primary.main,
                                    '&:hover': {
                                        bgcolor: alpha('#ffffff', 0.9),
                                    },
                                }}
                            >
                                Share Your Experience
                            </Button>
                        </Box>
                    </motion.div>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mb: 8 }}>
                {/* Filters */}
                <Card sx={{ ...glassStyle, mb: 4, p: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Project Type</InputLabel>
                                <Select
                                    value={selectedType}
                                    label="Project Type"
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    <MenuItem value="">All Types</MenuItem>
                                    {projectTypes.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Minimum Rating</InputLabel>
                                <Select
                                    value={selectedRating}
                                    label="Minimum Rating"
                                    onChange={(e) => setSelectedRating(e.target.value)}
                                >
                                    <MenuItem value="">All Ratings</MenuItem>
                                    <MenuItem value="5">5 Stars</MenuItem>
                                    <MenuItem value="4">4+ Stars</MenuItem>
                                    <MenuItem value="3">3+ Stars</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Sort By</InputLabel>
                                <Select
                                    value={sortBy}
                                    label="Sort By"
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <MenuItem value="featured">Featured</MenuItem>
                                    <MenuItem value="recent">Most Recent</MenuItem>
                                    <MenuItem value="rating">Highest Rated</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleFilterChange}
                                sx={{ height: 56 }}
                            >
                                Apply Filters
                            </Button>
                        </Grid>
                    </Grid>
                </Card>

                {/* Testimonials Grid */}
                <Grid container spacing={3}>
                    {testimonials.data.map((testimonial, index) => (
                        <Grid item xs={12} md={6} key={testimonial.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <Card
                                    sx={{
                                        ...glassStyle,
                                        height: '100%',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: `0 12px 40px 0 ${alpha('#000000', 0.15)}`,
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        {/* Header */}
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <Avatar
                                                src={testimonial.client_photo ? `/storage/${testimonial.client_photo}` : null}
                                                sx={{
                                                    width: 60,
                                                    height: 60,
                                                    mr: 2,
                                                    bgcolor: theme.palette.primary.main,
                                                }}
                                            >
                                                {testimonial.client_initials}
                                            </Avatar>
                                            <Box flex={1}>
                                                <Typography variant="h6" fontWeight="bold">
                                                    {testimonial.client_name}
                                                </Typography>
                                                {testimonial.client_position && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        {testimonial.client_position}
                                                        {testimonial.client_company && ` at ${testimonial.client_company}`}
                                                    </Typography>
                                                )}
                                                <Rating value={testimonial.rating} readOnly size="small" sx={{ mt: 0.5 }} />
                                            </Box>
                                            {testimonial.featured && (
                                                <Chip
                                                    icon={<Star />}
                                                    label="Featured"
                                                    color="warning"
                                                    size="small"
                                                />
                                            )}
                                        </Box>

                                        {/* Content */}
                                        <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', mb: 2 }}>
                                            "{testimonial.content}"
                                        </Typography>

                                        {/* Project Details */}
                                        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                            {testimonial.project_type && (
                                                <Chip
                                                    label={testimonial.project_type}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            )}
                                            {testimonial.location && (
                                                <Chip
                                                    icon={<LocationOn />}
                                                    label={testimonial.location}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                            {testimonial.project_duration && (
                                                <Chip
                                                    icon={<Schedule />}
                                                    label={`${testimonial.project_duration} weeks`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                            {testimonial.project_budget && (
                                                <Chip
                                                    icon={<AttachMoney />}
                                                    label={`€${testimonial.project_budget.toLocaleString()}`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Box>

                                        {/* View Details Button */}
                                        <Button
                                            component={Link}
                                            href={route('testimonials.show', testimonial.id)}
                                            variant="text"
                                            fullWidth
                                        >
                                            View Full Story
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>

                {/* Pagination */}
                {testimonials.last_page > 1 && (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <Pagination
                            count={testimonials.last_page}
                            page={testimonials.current_page}
                            onChange={(e, page) => {
                                const params = new URLSearchParams(window.location.search);
                                params.set('page', page);
                                window.location.href = `${route('testimonials.index')}?${params.toString()}`;
                            }}
                            color="primary"
                            size="large"
                        />
                    </Box>
                )}
            </Container>
        </MainLayout>
    );
}

