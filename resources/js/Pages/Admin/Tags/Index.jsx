import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
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
    Tooltip,
    Grid,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    alpha,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Search as SearchIcon,
    LocalOffer as TagIcon,
    TrendingUp as TrendingUpIcon,
    Article as ArticleIcon,
    Star as StarIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const TagsIndex = ({ tags, stats, filters }) => {
    const [search, setSearch] = useState(filters?.search || '');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, tag: null });

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
        router.get(route('admin.tags.index'), { search }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (slug) => {
        router.delete(route('admin.tags.destroy', slug), {
            onSuccess: () => setDeleteDialog({ open: false, tag: null }),
        });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const tagsData = tags?.data || tags || [];
    const paginatedTags = tagsData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <AdminLayoutNew title="Gestión de Tags">
            <Head title="Tags - Admin" />

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
                                Gestión de Tags
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Administra las etiquetas del blog
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            href={route('admin.tags.create')}
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
                            Nuevo Tag
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
                                    <TagIcon sx={{ fontSize: 40 }} />
                                </Box>
                                <Typography variant="h3" fontWeight="bold" sx={{ color: '#2D3748', mb: 1 }}>
                                    {stats?.total || tagsData.length}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#718096', fontWeight: 500 }}>
                                    Total Tags
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
                                    <ArticleIcon sx={{ fontSize: 40 }} />
                                </Box>
                                <Typography variant="h3" fontWeight="bold" sx={{ color: '#2D3748', mb: 1 }}>
                                    {stats?.with_posts || 0}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#718096', fontWeight: 500 }}>
                                    Con Posts
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
                                    <TrendingUpIcon sx={{ fontSize: 40 }} />
                                </Box>
                                <Typography variant="h3" fontWeight="bold" sx={{ color: '#2D3748', mb: 1 }}>
                                    {stats?.without_posts || 0}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#718096', fontWeight: 500 }}>
                                    Sin Posts
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
                                    <StarIcon sx={{ fontSize: 40 }} />
                                </Box>
                                <Typography variant="h3" fontWeight="bold" sx={{ color: '#2D3748', mb: 1 }}>
                                    {tagsData.length > 0 ? Math.round(tagsData.reduce((sum, tag) => sum + (tag.posts_count || 0), 0) / tagsData.length) : 0}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#718096', fontWeight: 500 }}>
                                    Posts Promedio
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Search */}
                <Paper component={motion.div} variants={itemVariants} sx={{ ...glassStyle, p: 3, mb: 3 }}>
                    <form onSubmit={handleSearch}>
                        <TextField
                            fullWidth
                            placeholder="Buscar tags..."
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
                <Paper component={motion.div} variants={itemVariants} sx={glassStyle}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ 
                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                                }}>
                                    <TableCell sx={{ fontWeight: 700, color: '#2D3748' }}>Tag</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#2D3748' }}>Slug</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#2D3748' }}>Posts</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#2D3748' }} align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedTags.map((tag) => (
                                    <TableRow 
                                        key={tag.id}
                                        component={motion.tr}
                                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                        sx={{ 
                                            transition: 'background-color 0.2s',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            },
                                        }}
                                    >
                                        <TableCell>
                                            <Chip 
                                                label={tag.name} 
                                                size="small"
                                                sx={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    color: '#fff',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{tag.slug}</TableCell>
                                        <TableCell>{tag.posts_count || 0}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    size="small"
                                                    href={route('admin.tags.edit', tag.slug)}
                                                    sx={{ color: '#667eea' }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setDeleteDialog({ open: true, tag })}
                                                    sx={{ color: '#E53E3E' }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={tagsData.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por página:"
                    />
                </Paper>

                {/* Delete Dialog */}
                <Dialog
                    open={deleteDialog.open}
                    onClose={() => setDeleteDialog({ open: false, tag: null })}
                    PaperProps={{
                        sx: {
                            ...glassStyle,
                            borderRadius: '16px',
                        }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
                        Confirmar Eliminación
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            ¿Estás seguro de que quieres eliminar el tag "{deleteDialog.tag?.name}"?
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button
                            onClick={() => setDeleteDialog({ open: false, tag: null })}
                            sx={{
                                borderRadius: '12px',
                                px: 3,
                                fontWeight: 600,
                                textTransform: 'none',
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => handleDelete(deleteDialog.tag?.slug)}
                            color="error"
                            variant="contained"
                            sx={{
                                borderRadius: '12px',
                                px: 3,
                                fontWeight: 600,
                                textTransform: 'none',
                                boxShadow: '0 4px 16px rgba(229, 62, 62, 0.3)',
                                '&:hover': {
                                    boxShadow: '0 6px 20px rgba(229, 62, 62, 0.4)',
                                },
                            }}
                        >
                            Eliminar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </AdminLayoutNew>
    );
};

export default TagsIndex;

