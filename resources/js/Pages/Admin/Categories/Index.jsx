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
    Category as CategoryIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Index = ({ categories, filters }) => {
    const [search, setSearch] = useState(filters.search || '');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

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

    return (
        <AdminLayoutNew>
            <Head title="Categorías" />

            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CategoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        <Box>
                            <Typography variant="h4" component="h1" gutterBottom>
                                Categorías
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Gestiona las categorías del blog
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        component={Link}
                        href={route('admin.categories.create')}
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{ borderRadius: 2 }}
                    >
                        Nueva Categoría
                    </Button>
                </Box>

                {/* Search */}
                <Paper sx={{ p: 2, mb: 3 }}>
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
                        />
                    </form>
                </Paper>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
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
                </motion.div>
            </Box>
        </AdminLayoutNew>
    );
};

export default Index;

