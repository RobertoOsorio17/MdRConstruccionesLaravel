import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    Button,
    Typography,
    TextField,
    InputAdornment,
    Tooltip
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Search as SearchIcon,
    Category as CategoryIcon,
    CheckCircle as ActiveIcon,
    Cancel as InactiveIcon,
    TrendingUp as TrendingIcon,
    Article as ArticleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Grid, Card, CardContent } from '@mui/material';

const Index = ({ categories, filters, stats }) => {
    const [search, setSearch] = useState(filters.search || '');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Glassmorphism styles
    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    };

    const glassStatCard = {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
        },
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.categories.index'), { search }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (slug) => {
        if (confirm('¿Estás seguro de eliminar esta categoría?')) {
            router.delete(route('admin.categories.destroy', slug));
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedCategories = categories.data.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const categoriesData = categories?.data || [];
    const mostUsedCategory = categoriesData.reduce((max, cat) =>
        (cat.posts_count || 0) > (max.posts_count || 0) ? cat : max
    , categoriesData[0] || {});

    return (
        <AdminLayoutNew title="Gestión de Categorías">
            <Head title="Categorías" />

            <Box
                component={motion.div}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Gestión de Categorías
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Administra las categorías del blog
                            </Typography>
                        </Box>
                        <Button
                            component={Link}
                            href={route('admin.categories.create')}
                            variant="contained"
                            startIcon={<AddIcon />}
                            size="large"
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '12px',
                                px: 3,
                                py: 1.5,
                                fontWeight: 600,
                                textTransform: 'none',
                                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                                },
                            }}
                        >
                            Nueva Categoría
                        </Button>
                    </Box>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card component={motion.div} variants={itemVariants} sx={glassStatCard}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2,
                                    color: '#667eea'
                                }}>
                                    <CategoryIcon sx={{ fontSize: 40 }} />
                                </Box>
                                <Typography variant="h3" fontWeight="bold" sx={{ color: '#2D3748', mb: 1 }}>
                                    {stats?.total || categoriesData.length}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#718096', fontWeight: 500 }}>
                                    Total Categorías
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card component={motion.div} variants={itemVariants} sx={glassStatCard}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2,
                                    color: '#48BB78'
                                }}>
                                    <ActiveIcon sx={{ fontSize: 40 }} />
                                </Box>
                                <Typography variant="h3" fontWeight="bold" sx={{ color: '#2D3748', mb: 1 }}>
                                    {stats?.active || categoriesData.filter(c => c.is_active).length}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#718096', fontWeight: 500 }}>
                                    Activas
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card component={motion.div} variants={itemVariants} sx={glassStatCard}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2,
                                    color: '#F6AD55'
                                }}>
                                    <InactiveIcon sx={{ fontSize: 40 }} />
                                </Box>
                                <Typography variant="h3" fontWeight="bold" sx={{ color: '#2D3748', mb: 1 }}>
                                    {stats?.inactive || categoriesData.filter(c => !c.is_active).length}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#718096', fontWeight: 500 }}>
                                    Inactivas
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card component={motion.div} variants={itemVariants} sx={glassStatCard}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2,
                                    color: '#9F7AEA'
                                }}>
                                    <TrendingIcon sx={{ fontSize: 40 }} />
                                </Box>
                                <Typography variant="h3" fontWeight="bold" sx={{ color: '#2D3748', mb: 1 }}>
                                    {mostUsedCategory?.posts_count || 0}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#718096', fontWeight: 500 }}>
                                    Más Usada
                                </Typography>
                                {mostUsedCategory?.name && (
                                    <Typography variant="caption" sx={{ color: '#A0AEC0', mt: 0.5, display: 'block' }}>
                                        {mostUsedCategory.name}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Search */}
                <Paper
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                        ...glassStyle,
                        p: 3,
                        mb: 3
                    }}
                >
                    <form onSubmit={handleSearch}>
                        <TextField
                            fullWidth
                            placeholder="Buscar categorías..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '12px',
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#667eea',
                                    },
                                },
                            }}
                        />
                    </form>
                </Paper>

                {/* Table */}
                <Paper
                    component={motion.div}
                    variants={itemVariants}
                    sx={glassStyle}
                >
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{
                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                                }}>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Slug</TableCell>
                                    <TableCell>Color</TableCell>
                                    <TableCell>Posts</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedCategories.map((category) => (
                                    <TableRow key={category.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CategoryIcon sx={{ color: category.color }} />
                                                {category.name}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <code>{category.slug}</code>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={category.color}
                                                size="small"
                                                sx={{
                                                    bgcolor: category.color,
                                                    color: '#fff',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {category.posts_count || 0}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={category.is_active ? 'Activa' : 'Inactiva'}
                                                color={category.is_active ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    component={Link}
                                                    href={route('admin.categories.edit', category.slug)}
                                                    size="small"
                                                    color="primary"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton
                                                    onClick={() => handleDelete(category.slug)}
                                                    size="small"
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {paginatedCategories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No se encontraron categorías
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination
                            component="div"
                            count={categories.data.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Filas por página:"
                        />
                    </TableContainer>
                </Paper>
            </Box>
        </AdminLayoutNew>
    );
};

export default Index;

