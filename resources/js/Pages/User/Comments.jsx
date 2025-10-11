import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    CardActions,
    Grid,
    Pagination,
    InputAdornment,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Chip,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Avatar,
    Divider
} from '@mui/material';
import {
    Search as SearchIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Comment as CommentIcon,
    Article as ArticleIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useNotification } from '@/Context/NotificationContext';

const CommentCard = ({ comment, onDelete }) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDelete = async () => {
        await onDelete(comment.id);
        setDeleteDialogOpen(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <Card sx={{ mb: 2, '&:hover': { boxShadow: 3 } }}>
                    <CardContent>
                        <Box display="flex" alignItems="flex-start" mb={2}>
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                                <ArticleIcon />
                            </Avatar>
                            <Box flex={1}>
                                <Link 
                                    href={`/blog/${comment.post.slug}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <Typography 
                                        variant="h6" 
                                        color="primary"
                                        sx={{ 
                                            '&:hover': { textDecoration: 'underline' },
                                            mb: 1
                                        }}
                                    >
                                        {comment.post.title}
                                    </Typography>
                                </Link>
                                <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    display="block"
                                    mb={1}
                                >
                                    Comentado el {formatDate(comment.created_at)}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Typography 
                            variant="body1" 
                            sx={{
                                backgroundColor: 'grey.50',
                                p: 2,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'grey.200',
                                fontStyle: 'italic'
                            }}
                        >
                            "{comment.content}"
                        </Typography>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                        <Box>
                            <Chip 
                                label={`${comment.content.length} caracteres`}
                                size="small"
                                variant="outlined"
                            />
                        </Box>
                        <Box>
                            <Button
                                component={Link}
                                href={`/blog/${comment.post.slug}#comment-${comment.id}`}
                                size="small"
                                startIcon={<ViewIcon />}
                                sx={{ mr: 1 }}
                            >
                                Ver en Post
                            </Button>
                            <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                Eliminar
                            </Button>
                        </Box>
                    </CardActions>
                </Card>
            </motion.div>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    ¿Eliminar comentario?
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Esta acción no se puede deshacer. El comentario será eliminado permanentemente.
                    </Typography>
                    <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                        <Typography variant="body2" color="text.secondary">
                            "{comment.content.substring(0, 150)}{comment.content.length > 150 ? '...' : ''}"
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const FilterBar = ({ filters, onFiltersChange }) => {
    const [localSearch, setLocalSearch] = useState(filters.search || '');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onFiltersChange({ ...filters, search: localSearch });
    };

    const handleClearSearch = () => {
        setLocalSearch('');
        onFiltersChange({ ...filters, search: '' });
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
                <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                    Filtros
                </Typography>
            </Box>

            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                    <form onSubmit={handleSearchSubmit}>
                        <TextField
                            fullWidth
                            placeholder="Buscar en mis comentarios..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: localSearch && (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleClearSearch} size="small">
                                            <ClearIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </form>
                </Grid>
                <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Posts por página</InputLabel>
                        <Select
                            value={filters.per_page || 10}
                            label="Posts por página"
                            onChange={(e) => onFiltersChange({ ...filters, per_page: e.target.value })}
                        >
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={25}>25</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleSearchSubmit}
                    >
                        Buscar
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default function Comments({ comments, filters }) {
    const { showNotification } = useNotification();

    const handleFiltersChange = (newFilters) => {
        const params = { ...newFilters };
        
        // Remove empty values
        Object.keys(params).forEach(key => 
            (params[key] === '' || params[key] === null || params[key] === undefined) && delete params[key]
        );

        router.get('/my/comments', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await fetch(`/my/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification(data.message, 'success');
                router.reload({ only: ['comments'] });
            } else {
                showNotification(data.message || 'Error al eliminar comentario', 'error');
            }
        } catch (error) {
            showNotification('Error al eliminar comentario', 'error');
        }
    };

    const handlePageChange = (event, page) => {
        handleFiltersChange({ ...filters, page });
    };

    return (
        <AuthenticatedLayout
            header={
                <Box display="flex" alignItems="center">
                    <CommentIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1">
                        Mis Comentarios
                    </Typography>
                </Box>
            }
        >
            <Head title="Mis Comentarios" />

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header Stats */}
                <Box mb={4}>
                    <Typography variant="body1" color="text.secondary">
                        Total de comentarios: <strong>{comments.total}</strong>
                    </Typography>
                </Box>

                {/* Filters */}
                <FilterBar 
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                />

                {/* Comments List */}
                <Box mb={4}>
                    {comments.data.length === 0 ? (
                        <Alert severity="info" sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                No se encontraron comentarios
                            </Typography>
                            <Typography>
                                {filters.search 
                                    ? 'Intenta con otros términos de búsqueda' 
                                    : 'Aún no has realizado ningún comentario'
                                }
                            </Typography>
                            {!filters.search && (
                                <Button
                                    component={Link}
                                    href="/blog"
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                >
                                    Explorar Blog
                                </Button>
                            )}
                        </Alert>
                    ) : (
                        comments.data.map((comment) => (
                            <CommentCard
                                key={comment.id}
                                comment={comment}
                                onDelete={handleDeleteComment}
                            />
                        ))
                    )}
                </Box>

                {/* Pagination */}
                {comments.last_page > 1 && (
                    <Box display="flex" justifyContent="center">
                        <Pagination
                            count={comments.last_page}
                            page={comments.current_page}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                        />
                    </Box>
                )}
            </Container>
        </AuthenticatedLayout>
    );
}