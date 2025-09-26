import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
    Chip, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent,
    DialogActions, Tooltip, Avatar, useTheme, alpha, Stack, Card, CardContent, Grid, Pagination, Tabs, Tab,
    Checkbox, FormControlLabel, Fab, Snackbar, Alert
} from '@mui/material';
import {
    Search as SearchIcon, FilterList as FilterIcon, Delete as DeleteIcon, Check as ApproveIcon, Block as RejectIcon,
    Comment as CommentIcon, ThumbUp as LikeIcon, ThumbDown as DislikeIcon, Flag as ReportIcon, Person as PersonIcon,
    Article as ArticleIcon, Clear as ClearIcon, Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const CommentsIndex = ({ comments, posts, stats, filters }) => {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [postFilter, setPostFilter] = useState(filters?.post_id || '');
    const [deleteDialog, setDeleteDialog] = useState({ open: false, comment: null });
    const [currentTab, setCurrentTab] = useState(0);
    const [selectedComments, setSelectedComments] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const commentsData = comments?.data || [];
    const pendingComments = commentsData.filter(c => c.status === 'pending');
    const approvedComments = commentsData.filter(c => c.status === 'approved');
    const rejectedComments = commentsData.filter(c => c.status === 'rejected');
    const allComments = commentsData;

    const getCurrentComments = () => {
        switch (currentTab) {
            case 0: return allComments;
            case 1: return pendingComments;
            case 2: return approvedComments;
            case 3: return rejectedComments;
            default: return allComments;
        }
    };

    const currentComments = getCurrentComments();

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'pending': return 'warning';
            case 'rejected': return 'error';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'approved': return 'Aprobado';
            case 'pending': return 'Pendiente';
            case 'rejected': return 'Rechazado';
            default: return status;
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSearch = () => {
        setLoading(true);
        try {
            const params = { 
                search: searchTerm, 
                post_id: postFilter,
                tab: currentTab 
            };
            
            // Usar fetch API como fallback si Ziggy falla
            const url = new URL(window.location.href);
            url.search = '';
            Object.keys(params).forEach(key => {
                if (params[key]) url.searchParams.set(key, params[key]);
            });
            window.location.href = url.toString();
        } catch (error) {
            console.error('Error en búsqueda:', error);
            showSnackbar('Error al realizar búsqueda', 'error');
        }
        setLoading(false);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setPostFilter('');
        setCurrentTab(0);
        window.location.href = window.location.pathname;
    };

    const handleStatusChange = async (comment, newStatus) => {
        setLoading(true);
        try {
            const response = await fetch(`/admin/comments/${comment.id}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (response.ok) {
                const statusText = newStatus === 'approved' ? 'aprobado' : 'rechazado';
                showSnackbar(`Comentario ${statusText} exitosamente`);
                setTimeout(() => window.location.reload(), 1000);
            } else {
                throw new Error('Error en servidor');
            }
        } catch (error) {
            console.error('Error al actualizar comentario:', error);
            showSnackbar('Error al actualizar comentario', 'error');
        }
        setLoading(false);
    };

    const handleDelete = async (comment) => {
        setLoading(true);
        try {
            const response = await fetch(`/admin/comments/${comment.id}`, {
                method: 'DELETE',
                headers: { 
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' 
                }
            });
            
            if (response.ok) {
                showSnackbar('Comentario eliminado exitosamente');
                setDeleteDialog({ open: false, comment: null });
                setTimeout(() => window.location.reload(), 1000);
            } else {
                throw new Error('Error en servidor');
            }
        } catch (error) {
            console.error('Error al eliminar comentario:', error);
            showSnackbar('Error al eliminar comentario', 'error');
        }
        setLoading(false);
    };

    const handleSelectComment = (commentId) => {
        const newSelected = new Set(selectedComments);
        if (newSelected.has(commentId)) {
            newSelected.delete(commentId);
        } else {
            newSelected.add(commentId);
        }
        setSelectedComments(newSelected);
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedComments(new Set());
        } else {
            setSelectedComments(new Set(currentComments.map(c => c.id)));
        }
        setSelectAll(!selectAll);
    };

    useEffect(() => {
        setSelectAll(selectedComments.size === currentComments.length && currentComments.length > 0);
    }, [selectedComments, currentComments]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Fecha inválida';
            return date.toLocaleDateString('es-ES', {
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Fecha inválida';
        }
    };

    const truncateText = (text, maxLength = 100) => {
        if (!text) return 'Sin contenido';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // LÓGICA CORREGIDA: acciones apropiadas según estado del comentario
    const renderActionButtons = (comment) => {
        if (comment.status === 'pending') {
            // Comentarios pendientes: pueden ser aprobados O rechazados
            return (
                <>
                    <Tooltip title="Aprobar">
                        <IconButton 
                            size="small" 
                            color="success" 
                            onClick={() => handleStatusChange(comment, 'approved')} 
                            disabled={loading}
                        >
                            <ApproveIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Rechazar">
                        <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleStatusChange(comment, 'rejected')} 
                            disabled={loading}
                        >
                            <RejectIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </>
            );
        } else if (comment.status === 'approved') {
            // Comentarios aprobados: SOLO pueden ser rechazados (NO aprobar)
            return (
                <Tooltip title="Rechazar">
                    <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleStatusChange(comment, 'rejected')} 
                        disabled={loading}
                    >
                        <RejectIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            );
        } else if (comment.status === 'rejected') {
            // Comentarios rechazados: SOLO pueden ser aprobados (NO rechazar)
            return (
                <Tooltip title="Aprobar">
                    <IconButton 
                        size="small" 
                        color="success" 
                        onClick={() => handleStatusChange(comment, 'approved')} 
                        disabled={loading}
                    >
                        <ApproveIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            );
        }
        return null;
    };

    const handleBulkAction = async (action) => {
        if (selectedComments.size === 0) {
            showSnackbar('Selecciona al menos un comentario', 'warning');
            return;
        }

        setLoading(true);
        try {
            for (const commentId of selectedComments) {
                const comment = currentComments.find(c => c.id === commentId);
                if (comment) {
                    if (action === 'delete') {
                        await handleDelete(comment);
                    } else {
                        await handleStatusChange(comment, action);
                    }
                }
            }
            setSelectedComments(new Set());
            showSnackbar('Acciones aplicadas exitosamente');
        } catch (error) {
            showSnackbar('Error al aplicar acciones masivas', 'error');
        }
        setLoading(false);
    };

    return (
        <AdminLayout title="Gestión de Comentarios">
            <Head title="Comentarios - Admin" />
            <Box sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Gestión de Comentarios
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Administra todos los comentarios del blog y su estado de moderación
                    </Typography>

                    {/* Estadísticas - MUI Grid v2 CORREGIDO */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Card component={motion.div} whileHover={{ y: -4 }} sx={{ height: '100%' }}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <CommentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                                        {allComments.length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Comentarios
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Card component={motion.div} whileHover={{ y: -4 }} sx={{ height: '100%' }}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <ApproveIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                                    <Typography variant="h4" fontWeight="bold" color="success.main">
                                        {approvedComments.length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Aprobados
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Card component={motion.div} whileHover={{ y: -4 }} sx={{ height: '100%' }}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <RefreshIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                                        {pendingComments.length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Pendientes
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Card component={motion.div} whileHover={{ y: -4 }} sx={{ height: '100%' }}>
                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                    <RejectIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                                    <Typography variant="h4" fontWeight="bold" color="error.main">
                                        {rejectedComments.length}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Rechazados
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Pestañas */}
                <Paper sx={{ mb: 3 }}>
                    <Tabs 
                        value={currentTab} 
                        onChange={(e, newValue) => setCurrentTab(newValue)} 
                        variant="fullWidth"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab 
                            label={`Todos (${allComments.length})`} 
                            icon={<CommentIcon />} 
                            iconPosition="start" 
                        />
                        <Tab 
                            label={`Pendientes (${pendingComments.length})`} 
                            icon={<RefreshIcon />} 
                            iconPosition="start" 
                        />
                        <Tab 
                            label={`Aprobados (${approvedComments.length})`} 
                            icon={<ApproveIcon />} 
                            iconPosition="start" 
                        />
                        <Tab 
                            label={`Rechazados (${rejectedComments.length})`} 
                            icon={<RejectIcon />} 
                            iconPosition="start" 
                        />
                    </Tabs>
                </Paper>

                {/* Acciones Masivas */}
                {selectedComments.size > 0 && (
                    <Paper sx={{ p: 2, mb: 3, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="body1" fontWeight="medium">
                                {selectedComments.size} comentario(s) seleccionado(s)
                            </Typography>
                            <Button 
                                size="small" 
                                color="success" 
                                onClick={() => handleBulkAction('approved')}
                                disabled={loading}
                            >
                                Aprobar Seleccionados
                            </Button>
                            <Button 
                                size="small" 
                                color="error" 
                                onClick={() => handleBulkAction('rejected')}
                                disabled={loading}
                            >
                                Rechazar Seleccionados
                            </Button>
                            <Button 
                                size="small" 
                                color="error" 
                                variant="outlined"
                                onClick={() => handleBulkAction('delete')}
                                disabled={loading}
                            >
                                Eliminar Seleccionados
                            </Button>
                        </Stack>
                    </Paper>
                )}

                {/* Filtros */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                        <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
                        Filtros de Búsqueda
                    </Typography>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                        <TextField 
                            fullWidth 
                            placeholder="Buscar por comentario, usuario, email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()} 
                        />
                        <FormControl fullWidth>
                            <InputLabel>Filtrar por Post</InputLabel>
                            <Select 
                                value={postFilter} 
                                label="Filtrar por Post" 
                                onChange={(e) => setPostFilter(e.target.value)}
                            >
                                <MenuItem value=""><em>Todos los posts</em></MenuItem>
                                {posts && posts.map((post) => (
                                    <MenuItem key={post.id} value={post.id}>
                                        {truncateText(post.title, 50)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                        <Button 
                            variant="outlined" 
                            startIcon={<ClearIcon />}
                            onClick={handleClearFilters} 
                            disabled={loading}
                        >
                            Limpiar Filtros
                        </Button>
                        <Button 
                            variant="contained" 
                            startIcon={<FilterIcon />} 
                            onClick={handleSearch} 
                            disabled={loading}
                        >
                            Aplicar Filtros
                        </Button>
                    </Stack>
                </Paper>

                {/* Tabla */}
                <Paper>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                                    <TableCell>
                                        <FormControlLabel
                                            control={
                                                <Checkbox 
                                                    checked={selectAll} 
                                                    onChange={handleSelectAll}
                                                    indeterminate={selectedComments.size > 0 && selectedComments.size < currentComments.length} 
                                                />
                                            }
                                            label="Seleccionar" 
                                        />
                                    </TableCell>
                                    <TableCell><strong>Usuario</strong></TableCell>
                                    <TableCell><strong>Comentario</strong></TableCell>
                                    <TableCell><strong>Post</strong></TableCell>
                                    <TableCell><strong>Estado</strong></TableCell>
                                    <TableCell><strong>Fecha</strong></TableCell>
                                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <AnimatePresence>
                                    {currentComments.map((comment) => (
                                        <TableRow 
                                            key={comment.id} 
                                            component={motion.tr}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            sx={{
                                                '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.05) },
                                                backgroundColor: selectedComments.has(comment.id) ? 
                                                    alpha(theme.palette.primary.main, 0.08) : 'transparent'
                                            }}
                                        >
                                            <TableCell>
                                                <Checkbox 
                                                    checked={selectedComments.has(comment.id)}
                                                    onChange={() => handleSelectComment(comment.id)} 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ width: 32, height: 32 }}>
                                                        {comment.user?.name?.charAt(0) || '?'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {comment.user?.name || 'Usuario eliminado'}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {comment.user?.email || 'Sin email'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {truncateText(comment.body, 80)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {truncateText(comment.post?.title || 'Post eliminado', 30)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={getStatusLabel(comment.status)} 
                                                    color={getStatusColor(comment.status)} 
                                                    size="small" 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatDate(comment.created_at)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                    {renderActionButtons(comment)}
                                                    <Tooltip title="Eliminar">
                                                        <IconButton 
                                                            size="small" 
                                                            color="error"
                                                            onClick={() => setDeleteDialog({ open: true, comment })}
                                                            disabled={loading}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Sin comentarios */}
                    {currentComments.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <CommentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">
                                No hay comentarios en esta categoría
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Los comentarios aparecerán aquí cuando estén disponibles
                            </Typography>
                        </Box>
                    )}

                    {/* Paginación CORREGIDA */}
                    {comments?.last_page > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <Pagination 
                                count={comments.last_page} 
                                page={comments.current_page || 1}
                                onChange={(event, page) => {
                                    const url = new URL(window.location.href);
                                    url.searchParams.set('page', page);
                                    if (searchTerm) url.searchParams.set('search', searchTerm);
                                    if (postFilter) url.searchParams.set('post_id', postFilter);
                                    if (currentTab) url.searchParams.set('tab', currentTab);
                                    window.location.href = url.toString();
                                }} 
                                color="primary" 
                                size="large"
                                showFirstButton 
                                showLastButton
                            />
                        </Box>
                    )}
                </Paper>

                {/* Diálogo de confirmación para eliminar */}
                <Dialog 
                    open={deleteDialog.open} 
                    onClose={() => setDeleteDialog({ open: false, comment: null })}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DeleteIcon color="error" />
                        ¿Eliminar comentario?
                    </DialogTitle>
                    <DialogContent>
                        <Typography gutterBottom>
                            ¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer.
                        </Typography>
                        {deleteDialog.comment && (
                            <Box sx={{ mt: 2, p: 2, backgroundColor: alpha(theme.palette.error.main, 0.1), borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Usuario:</strong> {deleteDialog.comment.user?.name || 'Usuario eliminado'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    <strong>Comentario:</strong> {truncateText(deleteDialog.comment.body, 100)}
                                </Typography>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button 
                            onClick={() => setDeleteDialog({ open: false, comment: null })}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={() => handleDelete(deleteDialog.comment)} 
                            color="error" 
                            variant="contained"
                            disabled={loading}
                            startIcon={<DeleteIcon />}
                        >
                            {loading ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar para notificaciones */}
                <Snackbar 
                    open={snackbar.open} 
                    autoHideDuration={6000} 
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert 
                        onClose={() => setSnackbar({ ...snackbar, open: false })} 
                        severity={snackbar.severity}
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </AdminLayout>
    );
};

export default CommentsIndex;