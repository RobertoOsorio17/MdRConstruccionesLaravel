import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Avatar,
    Divider,
    Stack,
    Alert,
    Collapse,
    IconButton,
    useTheme,
    alpha,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardContent,
    Chip
} from '@mui/material';
import {
    Send as SendIcon,
    Reply as ReplyIcon,
    Person as PersonIcon,
    Close as CloseIcon,
    Comment as CommentIcon,
    Login as LoginIcon,
    PersonAdd as RegisterIcon,
    Verified as VerifiedIcon,
    Star as PremiumIcon,
    Favorite as LikeIcon,
    FavoriteBorder as LikeOutlineIcon,
    Delete as DeleteIcon,
    HourglassTop as PendingIcon,
    Edit as EditIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useAuth, AuthGuard, AuthSwitch } from '@/Components/AuthGuard';
import CommentInteractions from '@/Components/Blog/CommentInteractions';
import CommentEditForm from '@/Components/Blog/CommentEditForm';
import CommentEditIndicator from '@/Components/Blog/CommentEditIndicator';
import CommentEditHistoryModal from '@/Components/Blog/CommentEditHistoryModal';

// Componente para invitar a usuarios no logados a registrarse
const LoginPrompt = ({ onClose }) => {
    const theme = useTheme();

    return (
        <Card 
            elevation={0}
            sx={{ 
                mb: 4,
                border: `2px solid ${theme.palette.primary.main}`,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
            }}
        >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar
                        sx={{
                            width: 60,
                            height: 60,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                        }}
                    >
                        <CommentIcon sx={{ fontSize: 30 }} />
                    </Avatar>
                </Box>
                
                <Typography 
                    variant="h5" 
                    fontWeight="bold" 
                    sx={{ 
                        mb: 2,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    ¡Únete a la conversación!
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                    Crea una cuenta gratuita para comentar, responder y formar parte de nuestra comunidad.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        startIcon={<RegisterIcon />}
                        component={Link}
                        href={route('register')}
                        sx={{
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            px: 3,
                            py: 1,
                            borderRadius: 3,
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: theme.shadows[8]
                            }
                        }}
                    >
                        Crear cuenta gratis
                    </Button>
                    
                    <Button
                        variant="outlined"
                        startIcon={<LoginIcon />}
                        component={Link}
                        href={route('login')}
                        sx={{
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            px: 3,
                            py: 1,
                            borderRadius: 3,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                borderColor: theme.palette.primary.dark
                            }
                        }}
                    >
                        Ya tengo cuenta
                    </Button>
                </Box>
                
                <Divider sx={{ my: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                        O comenta como invitado
                    </Typography>
                </Divider>
                
                <Typography variant="body2" color="text.secondary">
                    También puedes dejar un comentario como invitado (sin necesidad de registro)
                </Typography>
            </CardContent>
        </Card>
    );
};

const CommentItem = ({ comment, onReply, onDelete, onEdit, level = 0 }) => {
    const theme = useTheme();
    const { auth } = usePage().props;
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [currentComment, setCurrentComment] = useState(comment);

    const handleReply = () => {
        setShowReplyForm(true);
    };

    const handleReplySubmit = (replyData) => {
        onReply(comment.id, replyData);
        setShowReplyForm(false);
    };

    const handleEditClick = () => {
        setShowEditForm(true);
    };

    const handleEditSuccess = (updatedComment) => {
        setCurrentComment(updatedComment);
        setShowEditForm(false);
        if (onEdit) {
            onEdit(updatedComment);
        }
    };

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (onDelete) {
            await onDelete(comment.id);
        }
        setDeleteDialogOpen(false);
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
    };

    const handleViewHistory = () => {
        setHistoryModalOpen(true);
    };

    // Verificar si el usuario es administrador
    const isAdmin = auth?.user?.role === 'admin';

    // Verificar si el usuario puede editar este comentario
    const canEdit = auth?.user && auth.user.id === currentComment.user_id;

    return (
        <Box
            id={`comment-${comment.id}`}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
                ml: level * 4,
                mb: 3,
                maxWidth: level > 0 ? 'calc(100% - 32px)' : '100%',
                scrollMarginTop: '100px' // Add scroll margin for better anchor positioning
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    border: comment.is_own_pending
                        ? `1px dashed ${theme.palette.warning.main}`
                        : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 2,
                    backgroundColor: comment.is_own_pending
                        ? alpha(theme.palette.warning.light, 0.2)
                        : level > 0
                            ? alpha(theme.palette.grey[50], 0.5)
                            : 'white',
                    '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    },
                    '&:target': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        border: `2px solid ${theme.palette.primary.main}`,
                        animation: 'highlight 2s ease-in-out'
                    }
                }}
            >
                {/* Header del comentario */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                            sx={{ 
                                width: 40, 
                                height: 40,
                                bgcolor: comment.user ? 'primary.main' : 'grey.400',
                                fontSize: '1rem'
                            }}
                        >
                            {comment.user ? (
                                comment.author_name.charAt(0).toUpperCase()
                            ) : (
                                <PersonIcon />
                            )}
                        </Avatar>
                        <Box>
                            <Typography
                                component={comment.user?.id ? Link : 'span'}
                                href={comment.user?.id ? `/user/${comment.user.id}` : undefined}
                                variant="subtitle2"
                                fontWeight="bold"
                                sx={{
                                    color: comment.user ? 'primary.main' : 'text.primary',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    textDecoration: 'none',
                                    cursor: comment.user?.id ? 'pointer' : 'default',
                                    '&:hover': comment.user?.id ? {
                                        textDecoration: 'underline'
                                    } : {}
                                }}
                            >
                                {comment.author_name}
                                {comment.user?.is_verified && (
                                    <VerifiedIcon
                                        sx={{
                                            color: '#1976d2',
                                            fontSize: '1rem'
                                        }}
                                    />
                                )}
                                {comment.is_guest && (
                                    <Typography
                                        component="span"
                                        variant="caption"
                                        sx={{
                                            px: 1,
                                            py: 0.25,
                                            bgcolor: 'grey.100',
                                            borderRadius: 1,
                                            fontSize: '0.7rem'
                                        }}
                                    >
                                        Invitado
                                    </Typography>
                                )}
                                {comment.is_own_pending && (
                                    <Chip
                                        icon={<PendingIcon sx={{ fontSize: '0.9rem !important' }} />}
                                        label="Pendiente de moderaci�n"
                                        size="small"
                                        color="warning"
                                        variant="outlined"
                                        sx={{
                                            fontSize: '0.7rem',
                                            height: 22
                                        }}
                                    />
                                )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {comment.created_at}
                            </Typography>
                        </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {level < 2 && (
                            <IconButton
                                onClick={handleReply}
                                size="small"
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': { color: 'primary.main' }
                                }}
                            >
                                <ReplyIcon fontSize="small" />
                            </IconButton>
                        )}
                        {canEdit && !showEditForm && (
                            <IconButton
                                onClick={handleEditClick}
                                size="small"
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': { color: 'info.main' }
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        )}
                        {isAdmin && (
                            <IconButton
                                onClick={handleDeleteClick}
                                size="small"
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': { color: 'error.main' }
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                </Box>

                {/* Contenido del comentario o formulario de edición */}
                {showEditForm ? (
                    <Box sx={{ mt: 2 }}>
                        <CommentEditForm
                            comment={currentComment}
                            onCancel={() => setShowEditForm(false)}
                            onSuccess={handleEditSuccess}
                        />
                    </Box>
                ) : (
                    <>
                        <Typography
                            variant="body1"
                            sx={{
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word'
                            }}
                        >
                            {currentComment.body}
                        </Typography>

                        {/* Edit Indicator */}
                        {currentComment.edited_at && (
                            <CommentEditIndicator
                                comment={currentComment}
                                onViewHistory={canEdit || isAdmin ? handleViewHistory : null}
                            />
                        )}
                    </>
                )}

                {comment.is_own_pending && (
                    <Box
                        sx={{
                            mt: 2,
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.warning.main, 0.12)
                        }}
                    >
                        <PendingIcon sx={{ color: theme.palette.warning.dark }} />
                        <Typography variant="body2" color="warning.dark">
                            Tu comentario está a la espera de moderación. Solo tú puedes verlo hasta que sea aprobado.
                        </Typography>
                    </Box>
                )}

                {/* Interacciones con el comentario */}
                <CommentInteractions 
                    comment={comment}
                    onInteractionChange={(data) => {
                        // Actualizar el estado del comentario si es necesario
                        console.log('Interacción actualizada:', data);
                    }}
                />

                {/* Formulario de respuesta */}
                <Collapse in={showReplyForm}>
                    <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <CommentForm
                            parentId={comment.id}
                            onSubmit={handleReplySubmit}
                            onCancel={() => setShowReplyForm(false)}
                            placeholder={`Responder a ${comment.author_name}...`}
                            buttonText="Responder"
                        />
                    </Box>
                </Collapse>
            </Paper>

            {/* Respuestas anidadas */}
            {comment.replies && comment.replies.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            onReply={onReply}
                            onDelete={onDelete}
                            onEdit={onEdit}
                            level={level + 1}
                        />
                    ))}
                </Box>
            )}

            {/* Edit History Modal */}
            <CommentEditHistoryModal
                open={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                commentId={currentComment.id}
            />

            {/* Diálogo de confirmación de eliminación */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Confirmar eliminación
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.
                    </Typography>
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Comentario de: <strong>{comment.author_name}</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            "{comment.body.length > 100 ? comment.body.substring(0, 100) + '...' : comment.body}"
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const CommentForm = ({ 
    parentId = null, 
    onSubmit, 
    onCancel = null, 
    placeholder = "Escribe tu comentario...",
    buttonText = "Enviar comentario"
}) => {
    const theme = useTheme();
    const auth = useAuth();
    const [formData, setFormData] = useState({
        body: '',
        author_name: auth.user?.name || '',
        author_email: auth.user?.email || '',
        parent_id: parentId
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const handleChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await onSubmit(formData);
            
            // Reset form
            setFormData({
                body: '',
                author_name: auth.user?.name || '',
                author_email: auth.user?.email || '',
                parent_id: parentId
            });
            
            if (onCancel) onCancel();
            
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response?.data?.message) {
                setErrors({ general: error.response.data.message });
            } else {
                setErrors({ general: 'Error al enviar el comentario. Inténtalo de nuevo.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            {/* Header diferenciado para usuarios vs invitados */}
            <AuthSwitch
                authenticated={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Avatar 
                            src={auth.userAvatar}
                            sx={{ 
                                width: 40, 
                                height: 40,
                                bgcolor: 'primary.main' 
                            }}
                        >
                            {auth.userInitials}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {auth.user?.name}
                                <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Usuario verificado
                            </Typography>
                        </Box>
                        <Chip 
                            icon={<PremiumIcon />}
                            label="Premium"
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ ml: 'auto' }}
                        />
                    </Box>
                }
                guest={
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                            Comentar como invitado
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Tu comentario será revisado antes de publicarse.
                        </Typography>
                        <Alert 
                            severity="info" 
                            sx={{ 
                                borderRadius: 2,
                                '& .MuiAlert-message': { width: '100%' }
                            }}
                            action={
                                <Button
                                    size="small"
                                    onClick={() => setShowLoginPrompt(true)}
                                    sx={{ color: 'inherit' }}
                                >
                                    Ver ventajas
                                </Button>
                            }
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2">
                                    ¿Sabías que los usuarios registrados tienen más ventajas?
                                </Typography>
                            </Box>
                        </Alert>
                    </Box>
                }
            />

            <Paper
                component="form"
                onSubmit={handleSubmit}
                elevation={0}
                sx={{
                    p: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    borderRadius: 3,
                    backgroundColor: parentId ? alpha(theme.palette.grey[50], 0.3) : 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`
                    }
                }}
            >
                {errors.general && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {errors.general}
                    </Alert>
                )}

                {/* Campos para usuarios no autenticados */}
                <AuthGuard
                    requireGuest
                    fallback={null}
                >
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                        <TextField
                            label="Tu nombre *"
                            value={formData.author_name}
                            onChange={handleChange('author_name')}
                            error={!!errors.author_name}
                            helperText={errors.author_name?.[0]}
                            size="medium"
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />
                        <TextField
                            label="Tu email *"
                            type="email"
                            value={formData.author_email}
                            onChange={handleChange('author_email')}
                            error={!!errors.author_email}
                            helperText={errors.author_email?.[0] || "No será publicado"}
                            size="medium"
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />
                    </Stack>
                </AuthGuard>

                {/* Campo de comentario */}
                <TextField
                    label={placeholder}
                    multiline
                    rows={auth.isAuthenticated ? 3 : 4}
                    value={formData.body}
                    onChange={handleChange('body')}
                    error={!!errors.body}
                    helperText={errors.body?.[0] || `${formData.body.length}/2000 caracteres`}
                    fullWidth
                    sx={{ 
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                        }
                    }}
                />

                {/* Botones */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                    <AuthSwitch
                        authenticated={
                            <Typography variant="caption" color="success.main">
                                ✓ Tu comentario se publicará inmediatamente
                            </Typography>
                        }
                        guest={
                            <Typography variant="caption" color="warning.main">
                                ⏳ Tu comentario aparecerá aquí mientras espera moderación
                            </Typography>
                        }
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {onCancel && (
                            <Button
                                onClick={onCancel}
                                variant="outlined"
                                disabled={loading}
                                sx={{ borderRadius: 2 }}
                            >
                                Cancelar
                            </Button>
                        )}
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                            disabled={loading || !formData.body.trim() || (!auth.isAuthenticated && (!formData.author_name.trim() || !formData.author_email.trim()))}
                            sx={{ 
                                minWidth: 140,
                                borderRadius: 2,
                                background: auth.isAuthenticated 
                                    ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                                    : undefined,
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: theme.shadows[8]
                                }
                            }}
                        >
                            {loading ? 'Enviando...' : buttonText}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Dialog de ventajas para usuarios */}
            <Dialog 
                open={showLoginPrompt} 
                onClose={() => setShowLoginPrompt(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: 'primary.main' }}>
                        Ventajas de tener cuenta
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ py: 2 }}>
                        {[
                            { icon: <VerifiedIcon color="primary" />, title: 'Comentarios instantáneos', description: 'Sin moderación previa' },
                            { icon: <LikeIcon color="error" />, title: 'Like y reacciones', description: 'Interactúa con otros comentarios' },
                            { icon: <PremiumIcon color="warning" />, title: 'Badge de usuario', description: 'Destaca como miembro verificado' },
                            { icon: <PersonIcon color="info" />, title: 'Perfil personalizado', description: 'Avatar y bio personalizados' }
                        ].map((benefit, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                    {benefit.icon}
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="600">
                                        {benefit.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {benefit.description}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button
                        onClick={() => setShowLoginPrompt(false)}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                    >
                        Continuar como invitado
                    </Button>
                    <Button
                        component={Link}
                        href={route('register')}
                        variant="contained"
                        sx={{ 
                            borderRadius: 2,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                        }}
                    >
                        Crear cuenta gratis
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const CommentsSection = ({ postId, postSlug, comments: initialComments = [] }) => {
    const theme = useTheme();
    const auth = useAuth();
    const [comments, setComments] = useState(initialComments);
    const [commentsCount, setCommentsCount] = useState(initialComments.length);
    const [alert, setAlert] = useState(null);
    const commentsRef = useRef(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const pendingComments = React.useMemo(
        () => comments.filter((comment) => comment.is_own_pending),
        [comments]
    );

    const sortedComments = React.useMemo(() => {
        if (!pendingComments.length) {
            return comments;
        }

        const pendingIds = new Set(pendingComments.map((comment) => comment.id));
        const others = comments.filter((comment) => !pendingIds.has(comment.id));

        return [...pendingComments, ...others];
    }, [comments, pendingComments]);

    const showAlert = (message, severity = 'success') => {
        setAlert({ message, severity });
        setTimeout(() => setAlert(null), 5000);
    };

    // Effect to handle anchor navigation to specific comments
    useEffect(() => {
        const handleAnchorNavigation = () => {
            const hash = window.location.hash;
            if (hash && hash.startsWith('#comment-')) {
                const commentId = hash.replace('#comment-', '');

                // Wait for comments to be rendered
                setTimeout(() => {
                    const commentElement = document.getElementById(`comment-${commentId}`);
                    if (commentElement) {
                        commentElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'nearest'
                        });

                        // Add highlight effect
                        commentElement.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
                        commentElement.style.border = '2px solid #2563eb';
                        commentElement.style.borderRadius = '8px';
                        commentElement.style.transition = 'all 0.3s ease';

                        // Remove highlight after 3 seconds
                        setTimeout(() => {
                            commentElement.style.backgroundColor = '';
                            commentElement.style.border = '';
                            commentElement.style.borderRadius = '';
                        }, 3000);
                    }
                }, 1000); // Wait for animations to complete
            }
        };

        // Handle initial load
        handleAnchorNavigation();

        // Handle hash changes (if user navigates with browser back/forward)
        window.addEventListener('hashchange', handleAnchorNavigation);

        return () => {
            window.removeEventListener('hashchange', handleAnchorNavigation);
        };
    }, [comments]); // Re-run when comments change

    const submitComment = async (commentData) => {
        try {
            const response = await axios.post(`/blog/${postSlug}/comments`, commentData);

            showAlert(response.data.message, 'success');

            if (response.data?.comment) {
                setComments((prev) => [response.data.comment, ...prev]);
                setCommentsCount((prev) => prev + 1);
            }

            // Recargar comentarios para mostrar la actualizaci�n y mantener el orden
            await loadComments();

            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const loadComments = async () => {
        try {
            const response = await axios.get(`/blog/${postSlug}/comments`);
            setComments(response.data.comments);
            setCommentsCount(response.data.count);
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    };

    const handleReply = async (parentId, replyData) => {
        return await submitComment({ ...replyData, parent_id: parentId });
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await axios.delete(`/comments/${commentId}`);

            if (response.data.success) {
                showAlert(response.data.message, 'success');
                // Recargar comentarios para mostrar la actualización
                await loadComments();
            } else {
                showAlert(response.data.message || 'Error al eliminar comentario', 'error');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            showAlert('Error al eliminar comentario', 'error');
        }
    };

    // Auto-mostrar LoginPrompt para invitados después de un tiempo
    React.useEffect(() => {
        if (auth.isGuest) {
            const timer = setTimeout(() => {
                setShowLoginPrompt(true);
            }, 30000); // 30 segundos
            return () => clearTimeout(timer);
        }
    }, [auth.isGuest]);

    return (
        <Box id="comments-section" sx={{ mt: 6 }}>
            {/* Header de la sección mejorado */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 4,
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CommentIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Box>
                        <Typography variant="h5" fontWeight="bold">
                            Comentarios
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Comparte tu opinión y forma parte de la conversación
                        </Typography>
                    </Box>
                    {commentsCount > 0 && (
                        <Chip
                            label={commentsCount}
                            size="medium"
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.875rem'
                            }}
                        />
                    )}
                </Box>
                
                <AuthSwitch
                    authenticated={
                        <Chip 
                            icon={<VerifiedIcon />}
                            label="Usuario verificado"
                            color="primary"
                            variant="outlined"
                            size="small"
                        />
                    }
                    guest={
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<RegisterIcon />}
                            component={Link}
                            href={route('register')}
                            sx={{
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                borderRadius: 2
                            }}
                        >
                            Únete gratis
                        </Button>
                    }
                />
            </Box>

            {/* Alert para feedback */}
            <AnimatePresence>
                {alert && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Alert 
                            severity={alert.severity} 
                            sx={{ mb: 3, borderRadius: 2 }}
                            action={
                                <IconButton
                                    aria-label="close"
                                    color="inherit"
                                    size="small"
                                    onClick={() => setAlert(null)}
                                >
                                    <CloseIcon fontSize="inherit" />
                                </IconButton>
                            }
                        >
                            {alert.message}
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Login Prompt para invitados (mostrar solo si no han comentado) */}
            <AuthGuard
                requireGuest
                fallback={null}
            >
                {showLoginPrompt && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <LoginPrompt onClose={() => setShowLoginPrompt(false)} />
                    </motion.div>
                )}
            </AuthGuard>

            {/* Sección de formulario */}
            <Box sx={{ mb: 6 }}>
                <Typography 
                    variant="h6" 
                    gutterBottom 
                    fontWeight="700"
                    sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 3
                    }}
                >
                    <AuthSwitch
                        authenticated="Comparte tu experiencia"
                        guest="Deja tu comentario"
                    />
                    <AuthSwitch
                        authenticated={
                            <Chip 
                                icon={<PremiumIcon />}
                                label="Instantáneo"
                                size="small"
                                color="success"
                                variant="outlined"
                            />
                        }
                        guest={
                            <Chip 
                                label="Moderado"
                                size="small"
                                color="warning"
                                variant="outlined"
                            />
                        }
                    />
                </Typography>
                <CommentForm onSubmit={submitComment} />
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Lista de comentarios */}
            {comments.length > 0 ? (
                <Box>
                    <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
                        {commentsCount} {commentsCount === 1 ? 'comentario' : 'comentarios'}
                    </Typography>
                    
                    {pendingComments.length > 0 && (
                        <Alert
                            severity="info"
                            icon={<PendingIcon />}
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.warning.light, 0.3),
                                border: `1px solid ${alpha(theme.palette.warning.main, 0.4)}`
                            }}
                        >
                            <Typography variant="body2" color="warning.dark">
                                Tu comentario está pendiente de aprobación. Mientras tanto solo tú lo puedes ver en esta lista.
                            </Typography>
                        </Alert>
                    )}

                    <AnimatePresence>
                        {sortedComments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                onReply={handleReply}
                                onDelete={handleDeleteComment}
                            />
                        ))}
                    </AnimatePresence>
                </Box>
            ) : (
                <Box 
                    sx={{ 
                        textAlign: 'center', 
                        py: 6,
                        color: 'text.secondary'
                    }}
                >
                    <CommentIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" gutterBottom>
                        Sé el primero en comentar
                    </Typography>
                    <Typography variant="body2">
                        Comparte tu opinión sobre este artículo
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

// Add CSS animation for comment highlighting
const commentHighlightStyles = (
    <style>
        {`
            @keyframes highlight {
                0% { background-color: rgba(37, 99, 235, 0.2); }
                50% { background-color: rgba(37, 99, 235, 0.1); }
                100% { background-color: transparent; }
            }
        `}
    </style>
);

// Enhanced CommentsSection with highlight animation
const EnhancedCommentsSection = (props) => {
    return (
        <>
            {commentHighlightStyles}
            <CommentsSection {...props} />
        </>
    );
};

export default EnhancedCommentsSection;
