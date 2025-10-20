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
    History as HistoryIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    ThumbUp as ThumbUpIcon,
    ThumbUpOutlined as ThumbUpOutlinedIcon,
    ThumbDown as ThumbDownIcon,
    ThumbDownOutlined as ThumbDownOutlinedIcon
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

// Helper function to render comment body with clickable @mentions
const renderCommentBody = (body, allComments) => {
    // Extract all users from comments to create a username -> user_id map
    const usernameMap = {};
    const extractUsers = (commentsList) => {
        commentsList.forEach(comment => {
            if (comment.author?.username && comment.user?.id) {
                usernameMap[comment.author.username.toLowerCase()] = comment.user.id;
            }
            if (comment.replies && comment.replies.length > 0) {
                extractUsers(comment.replies);
            }
        });
    };
    extractUsers(allComments);

    // Split text by @mentions
    const mentionRegex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(body)) !== null) {
        // Add text before mention
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: body.substring(lastIndex, match.index)
            });
        }

        // Add mention
        const username = match[1];
        const userId = usernameMap[username.toLowerCase()];
        parts.push({
            type: 'mention',
            content: `@${username}`,
            username: username,
            userId: userId
        });

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < body.length) {
        parts.push({
            type: 'text',
            content: body.substring(lastIndex)
        });
    }

    return parts;
};

const CommentItem = ({ comment, onReply, onDelete, onEdit, onMention, level = 0, parentCommentId = null, allComments = [] }) => {
    const theme = useTheme();
    const { auth } = usePage().props;
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [currentComment, setCurrentComment] = useState(comment);
    const [showAllReplies, setShowAllReplies] = useState(false);

    // Like/Dislike state
    const [likesCount, setLikesCount] = useState(comment.likes_count || 0);
    const [dislikesCount, setDislikesCount] = useState(comment.dislikes_count || 0);
    const [userHasLiked, setUserHasLiked] = useState(comment.user_has_liked || false);
    const [userHasDisliked, setUserHasDisliked] = useState(comment.user_has_disliked || false);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    React.useEffect(() => {
        setCurrentComment(comment);
        setLikesCount(comment.likes_count || 0);
        setDislikesCount(comment.dislikes_count || 0);
        setUserHasLiked(comment.user_has_liked || false);
        setUserHasDisliked(comment.user_has_disliked || false);
    }, [comment]);

    const handleReply = () => {
        // Siempre mostrar el formulario de respuesta debajo del comentario
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

    const handleLike = async () => {
        if (!auth?.user) {
            // Show auth modal if not authenticated
            setShowAuthModal(true);
            return;
        }

        if (isLikeLoading) return;

        setIsLikeLoading(true);
        try {
            const response = await axios.post(`/comments/${comment.id}/like`);
            if (response.data.success) {
                setLikesCount(response.data.likeCount);
                setDislikesCount(response.data.dislikeCount);
                setUserHasLiked(response.data.liked);
                setUserHasDisliked(false);
            }
        } catch (error) {
            console.error('Error liking comment:', error);
            if (error.response?.status === 403) {
                alert('No puedes dar like a este comentario. Puede que esté eliminado o no tengas permisos.');
            }
        } finally {
            setIsLikeLoading(false);
        }
    };

    const handleDislike = async () => {
        if (!auth?.user) {
            // Show auth modal if not authenticated
            setShowAuthModal(true);
            return;
        }

        if (isLikeLoading) return;

        setIsLikeLoading(true);
        try {
            const response = await axios.post(`/comments/${comment.id}/dislike`);
            if (response.data.success) {
                setLikesCount(response.data.likeCount);
                setDislikesCount(response.data.dislikeCount);
                setUserHasLiked(false);
                setUserHasDisliked(response.data.disliked);
            }
        } catch (error) {
            console.error('Error disliking comment:', error);
            if (error.response?.status === 403) {
                alert('No puedes dar dislike a este comentario. Puede que esté eliminado o no tengas permisos.');
            }
        } finally {
            setIsLikeLoading(false);
        }
    };

    // Verificar si el usuario es administrador
    const isAdmin = auth?.user?.role === 'admin';

    // Verificar si el usuario puede editar este comentario
    // ✅ FIX: Soportar tanto user_id como user.id (backend puede devolver cualquiera)
    const commentUserId = currentComment.user_id || currentComment.user?.id;
    const canEdit = auth?.user && auth.user.id === commentUserId;

    // Verificar si es el propio comentario del usuario (no puede dar like/dislike a sus propios comentarios)
    const isOwnComment = auth?.user && commentUserId && auth.user.id === commentUserId;

    return (
        <Box
            id={`comment-${comment.id}`}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
                position: 'relative',
                // Reddit-style: No left margin, use padding for nested comments
                pl: level > 0 ? 3 : 0,
                mb: level === 0 ? 3 : 2,
                scrollMarginTop: '100px',
                // Reddit-style vertical line for nested comments
                '&::before': level > 0 ? {
                    content: '""',
                    position: 'absolute',
                    left: '12px',
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    background: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.1)',
                    transition: 'background 0.2s ease'
                } : {},
                // Highlight line on hover
                '&:hover::before': level > 0 ? {
                    background: theme.palette.mode === 'dark'
                        ? alpha(theme.palette.primary.main, 0.3)
                        : alpha(theme.palette.primary.main, 0.2)
                } : {}
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    border: comment.is_own_pending
                        ? `1px dashed ${theme.palette.warning.main}`
                        : 'none',
                    borderRadius: 2,
                    background: comment.is_own_pending
                        ? alpha(theme.palette.warning.light, 0.1)
                        : 'transparent',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        background: theme.palette.mode === 'dark'
                            ? alpha(theme.palette.primary.main, 0.05)
                            : alpha(theme.palette.primary.main, 0.03)
                    },
                    '&:target': {
                        background: alpha(theme.palette.primary.main, 0.1),
                        border: `1px solid ${theme.palette.primary.main}`,
                        animation: 'highlight 2s ease-in-out'
                    }
                }}
            >
                {/* Header del comentario - Reddit style */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                    <Avatar
                        sx={{
                            width: 28,
                            height: 28,
                            bgcolor: comment.user ? 'primary.main' : 'grey.400',
                            fontSize: '0.75rem',
                            flexShrink: 0
                        }}
                    >
                        {comment.user ? (
                            comment.author_name.charAt(0).toUpperCase()
                        ) : (
                            <PersonIcon fontSize="small" />
                        )}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                            <Typography
                                component={comment.user?.id ? Link : 'span'}
                                href={comment.user?.id ? `/user/${comment.user.id}` : undefined}
                                variant="body2"
                                fontWeight="600"
                                sx={{
                                    color: comment.user ? 'primary.main' : 'text.primary',
                                    textDecoration: 'none',
                                    cursor: comment.user?.id ? 'pointer' : 'default',
                                    fontSize: '0.875rem',
                                    '&:hover': comment.user?.id ? {
                                        textDecoration: 'underline'
                                    } : {}
                                }}
                            >
                                {comment.author_name}
                            </Typography>

                            {comment.user?.is_verified && (
                                <VerifiedIcon
                                    sx={{
                                        color: '#1976d2',
                                        fontSize: '0.875rem'
                                    }}
                                />
                            )}

                            {comment.is_guest && (
                                <Chip
                                    label="Invitado"
                                    size="small"
                                    sx={{
                                        height: 16,
                                        fontSize: '0.625rem',
                                        bgcolor: alpha(theme.palette.grey[500], 0.15),
                                        color: 'text.secondary'
                                    }}
                                />
                            )}

                            {comment.is_own_pending && (
                                <Chip
                                    icon={<PendingIcon sx={{ fontSize: '0.65rem !important' }} />}
                                    label="Pendiente"
                                    size="small"
                                    color="warning"
                                    sx={{
                                        height: 16,
                                        fontSize: '0.625rem'
                                    }}
                                />
                            )}

                            <Typography
                                component="span"
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: '0.7rem' }}
                            >
                                • {comment.created_at}
                            </Typography>
                        </Box>

                        {/* Contenido del comentario o formulario de edición */}
                        {showEditForm ? (
                            <Box sx={{ mt: 1 }}>
                                <CommentEditForm
                                    comment={currentComment}
                                    onCancel={() => setShowEditForm(false)}
                                    onSuccess={handleEditSuccess}
                                />
                            </Box>
                        ) : comment.is_deleted ? (
                            <Box
                                sx={{
                                    mt: 1,
                                    p: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    borderRadius: 1,
                                    backgroundColor: alpha(theme.palette.grey[500], 0.08),
                                    border: `1px dashed ${alpha(theme.palette.grey[500], 0.3)}`
                                }}
                            >
                                <DeleteIcon sx={{ color: theme.palette.grey[500], fontSize: '1rem' }} />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: theme.palette.grey[600],
                                        fontStyle: 'italic',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {`${comment.author_name} dejó un comentario que ha sido eliminado.`}
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <Typography
                                    variant="body2"
                                    component="div"
                                    sx={{
                                        lineHeight: 1.5,
                                        whiteSpace: 'pre-wrap',
                                        wordWrap: 'break-word',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {renderCommentBody(currentComment.body, allComments).map((part, index) => {
                                        if (part.type === 'mention' && part.userId) {
                                            return (
                                                <Link
                                                    key={index}
                                                    href={`/user/${part.userId}`}
                                                    style={{
                                                        color: theme.palette.primary.main,
                                                        fontWeight: 600,
                                                        textDecoration: 'underline',
                                                        textDecorationColor: alpha(theme.palette.primary.main, 0.4),
                                                        textDecorationThickness: '1px',
                                                        textUnderlineOffset: '2px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        padding: '0 2px',
                                                        borderRadius: '2px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.textDecorationColor = theme.palette.primary.main;
                                                        e.target.style.backgroundColor = alpha(theme.palette.primary.main, 0.08);
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.textDecorationColor = alpha(theme.palette.primary.main, 0.4);
                                                        e.target.style.backgroundColor = 'transparent';
                                                    }}
                                                >
                                                    {part.content}
                                                </Link>
                                            );
                                        } else if (part.type === 'mention') {
                                            // Mention without user ID (user not found)
                                            return (
                                                <span
                                                    key={index}
                                                    style={{
                                                        color: theme.palette.text.secondary,
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    {part.content}
                                                </span>
                                            );
                                        } else {
                                            return <span key={index}>{part.content}</span>;
                                        }
                                    })}
                                </Typography>

                                {/* Edit Indicator */}
                                {currentComment.edited_at && (
                                    <CommentEditIndicator
                                        comment={currentComment}
                                        onViewHistory={canEdit || isAdmin ? handleViewHistory : null}
                                    />
                                )}

                                {/* Reddit-style action buttons */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                    {/* Like/Dislike buttons - Mostrar siempre excepto en comentarios eliminados */}
                                    {!currentComment.is_deleted && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <IconButton
                                                onClick={handleLike}
                                                size="small"
                                                disabled={isLikeLoading}
                                                sx={{
                                                    color: userHasLiked ? 'primary.main' : 'text.secondary',
                                                    padding: '4px',
                                                    '&:hover': {
                                                        color: 'primary.main',
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.08)
                                                    }
                                                }}
                                            >
                                                {userHasLiked ? (
                                                    <ThumbUpIcon sx={{ fontSize: '0.875rem' }} />
                                                ) : (
                                                    <ThumbUpOutlinedIcon sx={{ fontSize: '0.875rem' }} />
                                                )}
                                            </IconButton>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: userHasLiked ? 'primary.main' : 'text.secondary',
                                                    minWidth: '16px',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {likesCount > 0 ? likesCount : ''}
                                            </Typography>

                                            <IconButton
                                                onClick={handleDislike}
                                                size="small"
                                                disabled={isLikeLoading}
                                                sx={{
                                                    color: userHasDisliked ? 'error.main' : 'text.secondary',
                                                    padding: '4px',
                                                    ml: 0.5,
                                                    '&:hover': {
                                                        color: 'error.main',
                                                        backgroundColor: alpha(theme.palette.error.main, 0.08)
                                                    }
                                                }}
                                            >
                                                {userHasDisliked ? (
                                                    <ThumbDownIcon sx={{ fontSize: '0.875rem' }} />
                                                ) : (
                                                    <ThumbDownOutlinedIcon sx={{ fontSize: '0.875rem' }} />
                                                )}
                                            </IconButton>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    color: userHasDisliked ? 'error.main' : 'text.secondary',
                                                    minWidth: '16px',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {dislikesCount > 0 ? dislikesCount : ''}
                                            </Typography>
                                        </Box>
                                    )}

                                    <Button
                                        onClick={handleReply}
                                        size="small"
                                        startIcon={<ReplyIcon sx={{ fontSize: '0.875rem' }} />}
                                        sx={{
                                            textTransform: 'none',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: 'text.secondary',
                                            minWidth: 'auto',
                                            px: 1,
                                            py: 0.25,
                                            '&:hover': {
                                                color: 'primary.main',
                                                backgroundColor: alpha(theme.palette.primary.main, 0.08)
                                            }
                                        }}
                                    >
                                        Responder
                                    </Button>

                                    {canEdit && !showEditForm && (
                                        <Button
                                            onClick={handleEditClick}
                                            size="small"
                                            startIcon={<EditIcon sx={{ fontSize: '0.875rem' }} />}
                                            sx={{
                                                textTransform: 'none',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                color: 'text.secondary',
                                                minWidth: 'auto',
                                                px: 1,
                                                py: 0.25,
                                                '&:hover': {
                                                    color: 'info.main',
                                                    backgroundColor: alpha(theme.palette.info.main, 0.08)
                                                }
                                            }}
                                        >
                                            Editar
                                        </Button>
                                    )}

                                    {(canEdit || isAdmin) && (
                                        <Button
                                            onClick={handleDeleteClick}
                                            size="small"
                                            startIcon={<DeleteIcon sx={{ fontSize: '0.875rem' }} />}
                                            sx={{
                                                textTransform: 'none',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                color: 'text.secondary',
                                                minWidth: 'auto',
                                                px: 1,
                                                py: 0.25,
                                                '&:hover': {
                                                    color: 'error.main',
                                                    backgroundColor: alpha(theme.palette.error.main, 0.08)
                                                }
                                            }}
                                        >
                                            Eliminar
                                        </Button>
                                    )}
                                </Box>
                            </>
                        )}
                    </Box>
                </Box>

                {comment.is_own_pending && (
                    <Box
                        sx={{
                            mt: 1.5,
                            p: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            borderRadius: 1,
                            backgroundColor: alpha(theme.palette.warning.main, 0.1)
                        }}
                    >
                        <PendingIcon sx={{ color: theme.palette.warning.dark, fontSize: '1rem' }} />
                        <Typography variant="caption" color="warning.dark">
                            Tu comentario está a la espera de moderación. Solo tú puedes verlo hasta que sea aprobado.
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* Respuestas anidadas */}
            {comment.replies && comment.replies.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    {/* Botón para mostrar/ocultar respuestas - Estilo YouTube */}
                    <Box sx={{ mb: showAllReplies ? 2 : 0 }}>
                        <Button
                            component={motion.button}
                            onClick={() => setShowAllReplies(!showAllReplies)}
                            startIcon={
                                <motion.div
                                    animate={{ rotate: showAllReplies ? 180 : 0 }}
                                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                    style={{ display: 'flex', alignItems: 'center' }}
                                >
                                    <ExpandMoreIcon />
                                </motion.div>
                            }
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                color: theme.palette.primary.main,
                                px: 1.5,
                                py: 0.75,
                                minWidth: 'auto',
                                borderRadius: '20px',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    background: alpha(theme.palette.primary.main, 0.08),
                                }
                            }}
                        >
                            <motion.span
                                key={showAllReplies ? 'hide' : 'show'}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {showAllReplies ? (
                                    `Ocultar respuestas`
                                ) : (
                                    `${comment.replies.length} ${comment.replies.length === 1 ? 'respuesta' : 'respuestas'}`
                                )}
                            </motion.span>
                        </Button>
                    </Box>

                    {/* Mostrar todas las respuestas cuando showAllReplies es true */}
                    <AnimatePresence mode="wait">
                        {showAllReplies && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{
                                    opacity: 1,
                                    height: 'auto',
                                    transition: {
                                        height: {
                                            duration: 0.4,
                                            ease: [0.4, 0, 0.2, 1]
                                        },
                                        opacity: {
                                            duration: 0.3,
                                            delay: 0.1
                                        }
                                    }
                                }}
                                exit={{
                                    opacity: 0,
                                    height: 0,
                                    transition: {
                                        height: {
                                            duration: 0.3,
                                            ease: [0.4, 0, 0.2, 1],
                                            delay: 0.1
                                        },
                                        opacity: {
                                            duration: 0.2
                                        }
                                    }
                                }}
                                style={{ overflow: 'hidden' }}
                            >
                                {comment.replies.map((reply, index) => (
                                    <motion.div
                                        key={reply.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                            transition: {
                                                duration: 0.3,
                                                delay: index * 0.05,
                                                ease: [0.4, 0, 0.2, 1]
                                            }
                                        }}
                                    >
                                        <CommentItem
                                            comment={reply}
                                            onReply={onReply}
                                            onDelete={onDelete}
                                            onEdit={onEdit}
                                            onMention={onMention}
                                            level={level + 1}
                                            parentCommentId={level === 0 ? comment.id : parentCommentId}
                                            allComments={allComments}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Box>
            )}

            {/* Formulario de respuesta - Después de todas las respuestas */}
            <Collapse in={showReplyForm}>
                <Box sx={{ mt: 2, pl: level > 0 ? 0 : 3 }}>
                    <CommentForm
                        parentId={level === 0 ? comment.id : parentCommentId}
                        onSubmit={handleReplySubmit}
                        onCancel={() => setShowReplyForm(false)}
                        placeholder={`Responder a ${comment.author_name}...`}
                        buttonText="Responder"
                    />
                </Box>
            </Collapse>

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

            {/* Modal de autenticación para likes/dislikes */}
            <Dialog
                open={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
                    }
                }}
            >
                <DialogContent sx={{ p: 4, textAlign: 'center' }}>
                    <IconButton
                        onClick={() => setShowAuthModal(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'text.secondary'
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Avatar
                            sx={{
                                width: 60,
                                height: 60,
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                            }}
                        >
                            <ThumbUpIcon sx={{ fontSize: 30 }} />
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
                        ¡Únete para interactuar!
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                        Crea una cuenta gratuita para dar like, dislike y participar en la comunidad.
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
                </DialogContent>
            </Dialog>
        </Box>
    );
};

const CommentForm = ({
    parentId = null,
    onSubmit,
    onCancel = null,
    placeholder = "Escribe tu comentario...",
    buttonText = "Enviar comentario",
    initialMention = '',
    availableUsers = []
}) => {
    const theme = useTheme();
    const auth = useAuth();
    const [formData, setFormData] = useState({
        body: initialMention,
        author_name: auth.user?.name || '',
        author_email: auth.user?.email || '',
        parent_id: parentId
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [mentionSuggestions, setMentionSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const textFieldRef = useRef(null);

    // Update body when initialMention changes
    useEffect(() => {
        if (initialMention) {
            setFormData(prev => ({
                ...prev,
                body: initialMention + ' '
            }));
            // Focus the text field
            setTimeout(() => {
                if (textFieldRef.current) {
                    const input = textFieldRef.current.querySelector('textarea');
                    if (input) {
                        input.focus();
                        input.setSelectionRange(initialMention.length + 1, initialMention.length + 1);
                    }
                }
            }, 100);
        }
    }, [initialMention]);

    const handleChange = (field) => (event) => {
        const value = event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }

        // Handle @ mentions
        if (field === 'body') {
            const cursorPos = event.target.selectionStart;
            setCursorPosition(cursorPos);

            // Find @ symbol before cursor
            const textBeforeCursor = value.substring(0, cursorPos);
            const lastAtIndex = textBeforeCursor.lastIndexOf('@');

            if (lastAtIndex !== -1) {
                const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);

                // Check if there's a space after @
                if (!textAfterAt.includes(' ') && textAfterAt.length >= 0) {
                    setMentionQuery(textAfterAt);

                    // Filter users
                    const filtered = availableUsers.filter(user =>
                        user.toLowerCase().includes(textAfterAt.toLowerCase())
                    );

                    setMentionSuggestions(filtered);
                    setShowSuggestions(filtered.length > 0);
                } else {
                    setShowSuggestions(false);
                }
            } else {
                setShowSuggestions(false);
            }
        }
    };

    const handleMentionSelect = (username) => {
        const textBeforeCursor = formData.body.substring(0, cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        const textAfterCursor = formData.body.substring(cursorPosition);

        const newBody = formData.body.substring(0, lastAtIndex) + `@${username} ` + textAfterCursor;

        setFormData(prev => ({
            ...prev,
            body: newBody
        }));

        setShowSuggestions(false);
        setMentionQuery('');

        // Focus back on textarea
        setTimeout(() => {
            if (textFieldRef.current) {
                const input = textFieldRef.current.querySelector('textarea');
                if (input) {
                    input.focus();
                    const newCursorPos = lastAtIndex + username.length + 2;
                    input.setSelectionRange(newCursorPos, newCursorPos);
                }
            }
        }, 0);
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
                    border: theme.palette.mode === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: 3,
                    background: theme.palette.mode === 'dark'
                        ? parentId
                            ? 'linear-gradient(145deg, rgba(40, 40, 40, 0.7) 0%, rgba(25, 25, 25, 0.5) 100%)'
                            : 'linear-gradient(145deg, rgba(45, 45, 45, 0.85) 0%, rgba(30, 30, 30, 0.7) 100%)'
                        : parentId
                            ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%)'
                            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.7) 100%)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: theme.palette.mode === 'dark'
                        ? '0 4px 16px rgba(0, 0, 0, 0.4)'
                        : '0 4px 16px rgba(0, 0, 0, 0.06)',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(145deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%)'
                            : 'linear-gradient(145deg, rgba(59, 130, 246, 0.03) 0%, rgba(147, 197, 253, 0.03) 100%)',
                        borderRadius: 3,
                        pointerEvents: 'none'
                    },
                    '&:hover': {
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 8px 24px rgba(59, 130, 246, 0.25)'
                            : '0 8px 24px rgba(59, 130, 246, 0.12)',
                        transform: 'translateY(-2px)',
                        border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.4 : 0.2)}`
                    },
                    '&:focus-within': {
                        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)}`,
                        border: `1px solid ${theme.palette.primary.main}`
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

                {/* Campo de comentario con autocompletado de menciones */}
                <Box sx={{ position: 'relative', mb: 3 }}>
                    <TextField
                        ref={textFieldRef}
                        label={placeholder}
                        multiline
                        rows={auth.isAuthenticated ? 3 : 4}
                        value={formData.body}
                        onChange={handleChange('body')}
                        error={!!errors.body}
                        helperText={errors.body?.[0] || `${formData.body.length}/2000 caracteres. Usa @ para mencionar usuarios`}
                        fullWidth
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                            }
                        }}
                    />

                    {/* Dropdown de sugerencias de menciones */}
                    <AnimatePresence>
                        {showSuggestions && mentionSuggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Paper
                                    elevation={8}
                                    sx={{
                                        position: 'absolute',
                                        bottom: '100%',
                                        left: 0,
                                        right: 0,
                                        mb: 1,
                                        maxHeight: 200,
                                        overflowY: 'auto',
                                        zIndex: 1000,
                                        borderRadius: 2,
                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                                        background: theme.palette.mode === 'dark'
                                            ? 'rgba(30, 30, 30, 0.95)'
                                            : 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    <Box sx={{ p: 1 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                px: 2,
                                                py: 1,
                                                display: 'block',
                                                color: 'text.secondary',
                                                fontWeight: 600
                                            }}
                                        >
                                            Mencionar usuario:
                                        </Typography>
                                        {mentionSuggestions.map((username, index) => (
                                            <Box
                                                key={index}
                                                onClick={() => handleMentionSelect(username)}
                                                sx={{
                                                    px: 2,
                                                    py: 1.5,
                                                    cursor: 'pointer',
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                        transform: 'translateX(4px)'
                                                    }
                                                }}
                                            >
                                                <PersonIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    @{username}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Paper>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Box>

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
    const [mentionUsername, setMentionUsername] = useState('');
    const [replyToCommentId, setReplyToCommentId] = useState(null);
    const commentFormRef = useRef(null);

    // Extract unique usernames from all comments for mention suggestions
    const availableUsers = React.useMemo(() => {
        const users = new Set();
        const extractUsers = (commentsList) => {
            commentsList.forEach(comment => {
                if (comment.author?.username) {
                    users.add(comment.author.username);
                } else if (comment.author_name) {
                    // For guest comments, create a username from their name
                    const username = comment.author_name.replace(/\s+/g, '');
                    users.add(username);
                }
                if (comment.replies && comment.replies.length > 0) {
                    extractUsers(comment.replies);
                }
            });
        };
        extractUsers(comments);
        return Array.from(users);
    }, [comments]);

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
            // Si hay un replyToCommentId, agregarlo al commentData
            const dataToSend = replyToCommentId
                ? { ...commentData, parent_id: replyToCommentId }
                : commentData;

            const response = await axios.post(`/blog/${postSlug}/comments`, dataToSend);

            showAlert(response.data.message, 'success');

            if (response.data?.comment) {
                // ✅ FIX: Normalizar comentario para asegurar que tenga user_id
                const normalizedComment = {
                    ...response.data.comment,
                    // Si el backend devuelve user.id pero no user_id, agregarlo
                    user_id: response.data.comment.user_id || response.data.comment.user?.id || auth?.user?.id
                };

                setComments((prev) => [normalizedComment, ...prev]);
                setCommentsCount((prev) => prev + 1);
            }

            // Limpiar el estado de respuesta
            setReplyToCommentId(null);
            setMentionUsername('');

            // Recargar comentarios para mantener sincronía con el servidor
            // (esto sobrescribirá el comentario normalizado con la versión del servidor)
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
            // ✅ FIX: Use correct route based on user role
            // Admins use /comments/{id} route, regular users use /my/comments/{id}
            const isAdmin = auth?.user?.role === 'admin';
            const deleteUrl = isAdmin ? `/comments/${commentId}` : `/my/comments/${commentId}`;

            const response = await axios.delete(deleteUrl);

            if (response.data.success) {
                showAlert(response.data.message, 'success');
                // Recargar comentarios para mostrar la actualización
                await loadComments();
            } else {
                showAlert(response.data.message || 'Error al eliminar comentario', 'error');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            const message = error?.response?.data?.message || 'Error al eliminar comentario';
            showAlert(message, 'error');
        }
    };

    const handleMention = (username, parentCommentId = null) => {
        setMentionUsername(`@${username}`);
        setReplyToCommentId(parentCommentId);
        // Scroll to comment form
        setTimeout(() => {
            if (commentFormRef.current) {
                commentFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
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
        <Box
            id="comments-section"
            sx={{
                mt: 6,
                p: { xs: 3, md: 4 },
                borderRadius: { xs: 3, md: 4 },
                background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(145deg, rgba(30, 30, 30, 0.95) 0%, rgba(18, 18, 18, 0.85) 100%)'
                    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: theme.palette.mode === 'dark'
                    ? '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(145deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 197, 253, 0.08) 50%, rgba(99, 102, 241, 0.08) 100%)'
                        : 'linear-gradient(145deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.05) 50%, rgba(99, 102, 241, 0.05) 100%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }
            }}
        >
            {/* Header de la sección mejorado */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 4,
                p: 3,
                borderRadius: 3,
                background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(40, 40, 40, 0.6) 0%, rgba(25, 25, 25, 0.4) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.3 : 0.15)}`,
                boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 16px rgba(59, 130, 246, 0.15)'
                    : '0 4px 16px rgba(59, 130, 246, 0.08)',
                position: 'relative',
                zIndex: 1
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
            <Box ref={commentFormRef} sx={{ mb: 6 }}>
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
                <CommentForm
                    onSubmit={submitComment}
                    initialMention={mentionUsername}
                    availableUsers={availableUsers}
                />
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
                                onMention={handleMention}
                                allComments={comments}
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
