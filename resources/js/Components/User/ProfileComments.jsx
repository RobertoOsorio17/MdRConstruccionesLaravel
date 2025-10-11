import React, { useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    IconButton,
    Collapse,
    Divider,
    Stack,
    Tooltip,
    Button
} from '@mui/material';
import {
    ThumbUp as ThumbUpIcon,
    ThumbUpOutlined as ThumbUpOutlinedIcon,
    ThumbDown as ThumbDownIcon,
    ThumbDownOutlined as ThumbDownOutlinedIcon,
    Reply as ReplyIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import VerificationBadge from './VerificationBadge';

const THEME = {
    primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e'
    },
    success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d'
    },
    error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d'
    },
    secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a'
    },
    text: {
        primary: '#1e293b',
        secondary: '#64748b',
        muted: '#94a3b8'
    },
    border: {
        light: '#e2e8f0',
        medium: '#cbd5e1'
    }
};

const CommentItem = ({ 
    comment, 
    currentUser, 
    onLike, 
    onDislike, 
    level = 0,
    isReply = false 
}) => {
    const [repliesExpanded, setRepliesExpanded] = useState(false);
    const [loadingInteraction, setLoadingInteraction] = useState(false);

    const handleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!currentUser || loadingInteraction) return;
        
        setLoadingInteraction(true);
        try {
            await onLike(comment);
        } finally {
            setLoadingInteraction(false);
        }
    };

    const handleDislike = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!currentUser || loadingInteraction) return;
        
        setLoadingInteraction(true);
        try {
            await onDislike(comment);
        } finally {
            setLoadingInteraction(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: isReply ? 20 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Box
                sx={{
                    ml: level * 3,
                    mb: 2,
                    p: 2,
                    backgroundColor: isReply ? THEME.secondary[50] : 'transparent',
                    borderRadius: 2,
                    border: isReply ? `1px solid ${THEME.border.light}` : 'none',
                    position: 'relative'
                }}
            >
                {/* Comment Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <Avatar
                        src={comment.user?.avatar}
                        alt={comment.user?.name || comment.author_name}
                        sx={{ 
                            width: isReply ? 32 : 40, 
                            height: isReply ? 32 : 40, 
                            mr: 1.5,
                            border: `1px solid ${THEME.border.light}`
                        }}
                    >
                        {(comment.user?.name || comment.author_name)?.charAt(0)}
                    </Avatar>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography 
                                variant={isReply ? "caption" : "body2"}
                                fontWeight="bold"
                                sx={{ color: THEME.text.primary }}
                            >
                                {comment.user?.name || comment.author_name}
                            </Typography>
                            
                            {comment.user && (
                                <VerificationBadge 
                                    user={comment.user} 
                                    size="small" 
                                    variant="minimal" 
                                    showText={false}
                                />
                            )}
                            
                            <Typography 
                                variant="caption" 
                                sx={{ color: THEME.text.muted }}
                            >
                                {formatDate(comment.created_at)}
                            </Typography>
                        </Box>
                        
                        {/* Comment Body */}
                        <Typography
                            variant={isReply ? "caption" : "body2"}
                            sx={{
                                color: THEME.text.secondary,
                                lineHeight: 1.5,
                                mb: 1,
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            {comment.body}
                        </Typography>

                        {/* Comment Actions */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {currentUser && (
                                <>
                                    <Tooltip title={comment.user_liked ? "Quitar me gusta" : "Me gusta"}>
                                        <IconButton
                                            onClick={handleLike}
                                            disabled={loadingInteraction}
                                            size="small"
                                            sx={{
                                                color: comment.user_liked ? THEME.success[600] : THEME.text.muted,
                                                '&:hover': {
                                                    color: THEME.success[600],
                                                    backgroundColor: `${THEME.success[500]}15`
                                                }
                                            }}
                                        >
                                            {comment.user_liked ? 
                                                <ThumbUpIcon fontSize="small" /> : 
                                                <ThumbUpOutlinedIcon fontSize="small" />
                                            }
                                        </IconButton>
                                    </Tooltip>
                                    
                                    <Typography variant="caption" color="text.secondary">
                                        {comment.likes_count || 0}
                                    </Typography>

                                    <Tooltip title={comment.user_disliked ? "Quitar no me gusta" : "No me gusta"}>
                                        <IconButton
                                            onClick={handleDislike}
                                            disabled={loadingInteraction}
                                            size="small"
                                            sx={{
                                                color: comment.user_disliked ? THEME.error[600] : THEME.text.muted,
                                                '&:hover': {
                                                    color: THEME.error[600],
                                                    backgroundColor: `${THEME.error[500]}15`
                                                }
                                            }}
                                        >
                                            {comment.user_disliked ? 
                                                <ThumbDownIcon fontSize="small" /> : 
                                                <ThumbDownOutlinedIcon fontSize="small" />
                                            }
                                        </IconButton>
                                    </Tooltip>
                                    
                                    <Typography variant="caption" color="text.secondary">
                                        {comment.dislikes_count || 0}
                                    </Typography>
                                </>
                            )}

                            {!currentUser && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <ThumbUpOutlinedIcon fontSize="small" sx={{ color: THEME.text.muted }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {comment.likes_count || 0}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <ThumbDownOutlinedIcon fontSize="small" sx={{ color: THEME.text.muted }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {comment.dislikes_count || 0}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Button
                            onClick={() => setRepliesExpanded(!repliesExpanded)}
                            size="small"
                            startIcon={repliesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            sx={{
                                color: THEME.text.secondary,
                                fontSize: '0.75rem',
                                '&:hover': {
                                    backgroundColor: `${THEME.primary[500]}10`
                                }
                            }}
                        >
                            {repliesExpanded ? 'Ocultar' : 'Ver'} {comment.replies.length} respuesta{comment.replies.length !== 1 ? 's' : ''}
                        </Button>

                        <AnimatePresence>
                            {repliesExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Box sx={{ mt: 2 }}>
                                        {comment.replies.map((reply) => (
                                            <CommentItem
                                                key={reply.id}
                                                comment={reply}
                                                currentUser={currentUser}
                                                onLike={onLike}
                                                onDislike={onDislike}
                                                level={level + 1}
                                                isReply={true}
                                            />
                                        ))}
                                    </Box>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>
                )}
            </Box>
        </motion.div>
    );
};

const ProfileComments = ({ 
    comments, 
    currentUser, 
    onCommentLike, 
    onCommentDislike,
    expanded = false 
}) => {
    if (!comments || comments.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                    No hay comentarios aún
                </Typography>
            </Box>
        );
    }

    return (
        <AnimatePresence>
            {expanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ mt: 2 }}>
                        <Typography 
                            variant="subtitle2" 
                            fontWeight="bold" 
                            sx={{ mb: 2, color: THEME.text.primary }}
                        >
                            Comentarios ({comments.length})
                        </Typography>
                        
                        <Stack spacing={1}>
                            {comments.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    currentUser={currentUser}
                                    onLike={onCommentLike}
                                    onDislike={onCommentDislike}
                                />
                            ))}
                        </Stack>
                    </Box>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProfileComments;
