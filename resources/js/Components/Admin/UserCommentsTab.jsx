import React, { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Checkbox,
    IconButton,
    Menu,
    MenuList,
    MenuItem as MenuItemComponent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Tooltip,
    Grid,
    Paper,
    Divider,
    CircularProgress,
    Snackbar,
    Skeleton,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    MoreVert as MoreVertIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Warning as SpamIcon,
    Comment as CommentIcon,
    TrendingUp as TrendingUpIcon,
    Schedule as PendingIcon,
    Block as BlockIcon,
    GetApp as ExportIcon,
} from '@mui/icons-material';

const UserCommentsTab = ({ user, commentStats }) => {
    // State management
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
    });
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        date_from: '',
        date_to: '',
        sort: 'created_at',
        direction: 'desc',
    });
    const [selectedComments, setSelectedComments] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedComment, setSelectedComment] = useState(null);
    const [bulkActionDialog, setBulkActionDialog] = useState(false);
    const [bulkAction, setBulkAction] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // Show notification
    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };

    // Close notification
    const closeNotification = () => {
        setNotification({ ...notification, open: false });
    };

    // Glassmorphism styles
    const glassmorphismCard = {
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    // Debounced search
    const debouncedSearch = useMemo(() => {
        const timeoutId = setTimeout(() => {
            fetchComments();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [filters.search]);

    useEffect(() => {
        return debouncedSearch;
    }, [debouncedSearch]);

    useEffect(() => {
        fetchComments();
    }, [
        pagination.current_page,
        pagination.per_page,
        filters.status,
        filters.date_from,
        filters.date_to,
        filters.sort,
        filters.direction,
    ]);

    // Fetch comments from API
    const fetchComments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.current_page,
                per_page: pagination.per_page,
                ...filters,
            });

            const response = await fetch(route('admin.users.comments', user.id) + '?' + params);
            const data = await response.json();

            if (data.success) {
                setComments(data.comments.data);
                setPagination({
                    current_page: data.comments.current_page,
                    per_page: data.comments.per_page,
                    total: data.comments.total,
                    last_page: data.comments.last_page,
                });
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    // Handle pagination
    const handlePageChange = (event, newPage) => {
        setPagination(prev => ({ ...prev, current_page: newPage + 1 }));
    };

    const handleRowsPerPageChange = (event) => {
        setPagination(prev => ({
            ...prev,
            per_page: parseInt(event.target.value, 10),
            current_page: 1
        }));
    };

    // Handle comment selection
    const handleSelectComment = (commentId) => {
        setSelectedComments(prev => 
            prev.includes(commentId)
                ? prev.filter(id => id !== commentId)
                : [...prev, commentId]
        );
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedComments(comments.map(comment => comment.id));
        } else {
            setSelectedComments([]);
        }
    };

    // Handle individual comment actions
    const handleCommentAction = async (commentId, action) => {
        setActionLoading(true);
        try {
            switch (action) {
                case 'approve':
                case 'reject':
                case 'spam':
                    const status = action === 'spam' ? 'spam' : action === 'approve' ? 'approved' : 'rejected';
                    router.patch(route('admin.users.comments.status', [user.id, commentId]),
                        { status },
                        {
                            onSuccess: (page) => {
                                fetchComments(); // Refresh the list
                                setAnchorEl(null);
                                const actionText = action === 'approve' ? 'aprobado' : action === 'reject' ? 'rechazado' : 'marcado como spam';
                                showNotification(`Comentario ${actionText} exitosamente`, 'success');
                            },
                            onError: (errors) => {
                                console.error('Error updating comment status:', errors);
                                showNotification('Error al actualizar el estado del comentario', 'error');
                            },
                            onFinish: () => {
                                setActionLoading(false);
                            }
                        }
                    );
                    return; // Exit early since router handles async
                case 'delete':
                    router.delete(route('admin.users.comments.delete', [user.id, commentId]), {
                        onSuccess: (page) => {
                            fetchComments(); // Refresh the list
                            setAnchorEl(null);
                            // Check for success message from backend
                            if (page.props.flash?.success) {
                                showNotification(page.props.flash.success, 'success');
                            } else {
                                showNotification('Comentario eliminado exitosamente', 'success');
                            }
                        },
                        onError: (errors) => {
                            console.error('Error deleting comment:', errors);
                            // Show error message
                            if (errors.error) {
                                showNotification(errors.error, 'error');
                            } else {
                                showNotification('Error al eliminar el comentario', 'error');
                            }
                        },
                        onFinish: () => {
                            setActionLoading(false);
                        }
                    });
                    return; // Exit early since router handles async
            }
        } catch (error) {
            console.error('Error performing comment action:', error);
            setActionLoading(false);
        }
    };

    // Handle bulk actions
    const handleBulkAction = async () => {
        if (!bulkAction || selectedComments.length === 0) return;

        setActionLoading(true);
        try {
            router.post(route('admin.users.comments.bulk', user.id), {
                action: bulkAction,
                comment_ids: selectedComments,
            }, {
                onSuccess: (page) => {
                    fetchComments(); // Refresh the list
                    setSelectedComments([]);
                    setBulkActionDialog(false);
                    setBulkAction('');
                    showNotification(`Acción masiva ejecutada exitosamente`, 'success');
                },
                onError: (errors) => {
                    console.error('Error performing bulk action:', errors);
                    showNotification('Error al ejecutar la acción masiva', 'error');
                },
                onFinish: () => {
                    setActionLoading(false);
                }
            });
        } catch (error) {
            console.error('Error performing bulk action:', error);
            setActionLoading(false);
        }
    };

    // Get status color and icon
    const getStatusConfig = (status) => {
        const configs = {
            approved: { color: 'success', icon: <ApproveIcon />, label: 'Aprobado' },
            pending: { color: 'warning', icon: <PendingIcon />, label: 'Pendiente' },
            rejected: { color: 'error', icon: <RejectIcon />, label: 'Rechazado' },
            spam: { color: 'error', icon: <SpamIcon />, label: 'Spam' },
        };
        return configs[status] || configs.pending;
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Truncate text
    const truncateText = (text, maxLength = 100) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Statistics Cards */}
            <motion.div variants={itemVariants}>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card sx={glassmorphismCard}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <CommentIcon sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 600, color: '#2D3748' }}>
                                    {commentStats.total}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#718096' }}>
                                    Total
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card sx={glassmorphismCard}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <ApproveIcon sx={{ fontSize: 40, color: '#48bb78', mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 600, color: '#2D3748' }}>
                                    {commentStats.approved}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#718096' }}>
                                    Aprobados
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card sx={glassmorphismCard}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <PendingIcon sx={{ fontSize: 40, color: '#ed8936', mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 600, color: '#2D3748' }}>
                                    {commentStats.pending}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#718096' }}>
                                    Pendientes
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card sx={glassmorphismCard}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <RejectIcon sx={{ fontSize: 40, color: '#f56565', mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 600, color: '#2D3748' }}>
                                    {commentStats.rejected}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#718096' }}>
                                    Rechazados
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card sx={glassmorphismCard}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <SpamIcon sx={{ fontSize: 40, color: '#e53e3e', mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 600, color: '#2D3748' }}>
                                    {commentStats.spam}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#718096' }}>
                                    Spam
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </motion.div>

            {/* Filters and Actions */}
            <motion.div variants={itemVariants}>
                <Card sx={{ ...glassmorphismCard, mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    placeholder="Buscar comentarios..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ color: '#718096', mr: 1 }} />,
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        sx={{ borderRadius: '12px' }}
                                    >
                                        <MenuItem value="">Todos</MenuItem>
                                        <MenuItem value="approved">Aprobados</MenuItem>
                                        <MenuItem value="pending">Pendientes</MenuItem>
                                        <MenuItem value="rejected">Rechazados</MenuItem>
                                        <MenuItem value="spam">Spam</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    {selectedComments.length > 0 && (
                                        <Button
                                            variant="outlined"
                                            onClick={() => setBulkActionDialog(true)}
                                            sx={{ borderRadius: '8px' }}
                                        >
                                            Acciones en lote ({selectedComments.length})
                                        </Button>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Comments Table */}
            <motion.div variants={itemVariants}>
                <Card sx={glassmorphismCard}>
                    <CardContent sx={{ p: 0 }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={selectedComments.length > 0 && selectedComments.length < comments.length}
                                                checked={comments.length > 0 && selectedComments.length === comments.length}
                                                onChange={handleSelectAll}
                                            />
                                        </TableCell>
                                        <TableCell>Comentario</TableCell>
                                        <TableCell>Post</TableCell>
                                        <TableCell>Estado</TableCell>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        // Loading skeletons
                                        Array.from({ length: 5 }).map((_, index) => (
                                            <TableRow key={index}>
                                                <TableCell><Skeleton width={24} height={24} /></TableCell>
                                                <TableCell><Skeleton width="80%" height={20} /></TableCell>
                                                <TableCell><Skeleton width="60%" height={20} /></TableCell>
                                                <TableCell><Skeleton width={80} height={32} /></TableCell>
                                                <TableCell><Skeleton width="50%" height={20} /></TableCell>
                                                <TableCell><Skeleton width={40} height={40} /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : comments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8 }}>
                                                <CommentIcon sx={{ fontSize: 64, color: '#CBD5E0', mb: 2 }} />
                                                <Typography variant="h6" sx={{ color: '#718096', mb: 1 }}>
                                                    No hay comentarios
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
                                                    Este usuario no ha realizado comentarios aún.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        comments.map((comment) => {
                                            const statusConfig = getStatusConfig(comment.status);
                                            return (
                                                <TableRow key={comment.id} hover>
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            checked={selectedComments.includes(comment.id)}
                                                            onChange={() => handleSelectComment(comment.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ maxWidth: 300 }}>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {truncateText(comment.body, 100)}
                                                            </Typography>
                                                            {comment.reports_count > 0 && (
                                                                <Chip
                                                                    size="small"
                                                                    label={`${comment.reports_count} reportes`}
                                                                    color="warning"
                                                                    sx={{ mt: 1 }}
                                                                />
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        {comment.post ? (
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                    {truncateText(comment.post.title, 50)}
                                                                </Typography>
                                                                <Button
                                                                    size="small"
                                                                    startIcon={<ViewIcon />}
                                                                    onClick={() => window.open(`/blog/${comment.post.slug}`, '_blank')}
                                                                    sx={{ mt: 0.5, textTransform: 'none' }}
                                                                >
                                                                    Ver post
                                                                </Button>
                                                            </Box>
                                                        ) : (
                                                            <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
                                                                Post eliminado
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={statusConfig.icon}
                                                            label={statusConfig.label}
                                                            color={statusConfig.color}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {formatDate(comment.created_at)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            onClick={(e) => {
                                                                setAnchorEl(e.currentTarget);
                                                                setSelectedComment(comment);
                                                            }}
                                                            disabled={actionLoading}
                                                        >
                                                            {actionLoading ? <CircularProgress size={20} /> : <MoreVertIcon />}
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        {!loading && comments.length > 0 && (
                            <TablePagination
                                component="div"
                                count={pagination.total}
                                page={pagination.current_page - 1}
                                onPageChange={handlePageChange}
                                rowsPerPage={pagination.per_page}
                                onRowsPerPageChange={handleRowsPerPageChange}
                                rowsPerPageOptions={[5, 10, 15, 25]}
                                labelRowsPerPage="Filas por página:"
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                                }
                            />
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                {/* Show approve/reject/spam actions only for pending comments */}
                {selectedComment?.status === 'pending' && (
                    <>
                        <MenuItemComponent onClick={() => handleCommentAction(selectedComment?.id, 'approve')}>
                            <ApproveIcon sx={{ mr: 1, color: '#48bb78' }} />
                            Aprobar
                        </MenuItemComponent>
                        <MenuItemComponent onClick={() => handleCommentAction(selectedComment?.id, 'reject')}>
                            <RejectIcon sx={{ mr: 1, color: '#f56565' }} />
                            Rechazar
                        </MenuItemComponent>
                        <MenuItemComponent onClick={() => handleCommentAction(selectedComment?.id, 'spam')}>
                            <SpamIcon sx={{ mr: 1, color: '#e53e3e' }} />
                            Marcar como Spam
                        </MenuItemComponent>
                        <Divider />
                    </>
                )}

                {/* Show approve action for rejected/spam comments */}
                {(selectedComment?.status === 'rejected' || selectedComment?.status === 'spam') && (
                    <>
                        <MenuItemComponent onClick={() => handleCommentAction(selectedComment?.id, 'approve')}>
                            <ApproveIcon sx={{ mr: 1, color: '#48bb78' }} />
                            Aprobar
                        </MenuItemComponent>
                        <Divider />
                    </>
                )}

                {/* Delete action is always available */}
                <MenuItemComponent
                    onClick={() => handleCommentAction(selectedComment?.id, 'delete')}
                    sx={{ color: '#e53e3e' }}
                >
                    <DeleteIcon sx={{ mr: 1 }} />
                    Eliminar Comentario
                </MenuItemComponent>
            </Menu>

            {/* Bulk Action Dialog */}
            <Dialog open={bulkActionDialog} onClose={() => setBulkActionDialog(false)}>
                <DialogTitle>Acciones en Lote</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        ¿Qué acción deseas realizar en los {selectedComments.length} comentarios seleccionados?
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Acción</InputLabel>
                        <Select
                            value={bulkAction}
                            onChange={(e) => setBulkAction(e.target.value)}
                        >
                            {/* Show approve/reject/spam actions only if there are pending comments selected */}
                            {selectedComments.some(id => {
                                const comment = comments.find(c => c.id === id);
                                return comment?.status === 'pending';
                            }) && (
                                <>
                                    <MenuItem value="approve">Aprobar</MenuItem>
                                    <MenuItem value="reject">Rechazar</MenuItem>
                                    <MenuItem value="mark_spam">Marcar como Spam</MenuItem>
                                </>
                            )}

                            {/* Show approve action if there are rejected/spam comments selected */}
                            {selectedComments.some(id => {
                                const comment = comments.find(c => c.id === id);
                                return comment?.status === 'rejected' || comment?.status === 'spam';
                            }) && (
                                <MenuItem value="approve">Aprobar</MenuItem>
                            )}

                            {/* Delete action is always available */}
                            <MenuItem value="delete">Eliminar</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBulkActionDialog(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleBulkAction}
                        variant="contained"
                        disabled={!bulkAction || actionLoading}
                    >
                        {actionLoading ? <CircularProgress size={20} /> : 'Ejecutar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={closeNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={closeNotification}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </motion.div>
    );
};

export default UserCommentsTab;
