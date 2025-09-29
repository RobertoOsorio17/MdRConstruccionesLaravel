import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import CommentDeleteButton from '../Admin/CommentDeleteButton';

/**
 * Test component for comment deletion functionality
 * This component helps verify that admin comment deletion works correctly
 */
const CommentDeleteTest = ({ user }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mock comment data for testing
    const mockComments = [
        {
            id: 1,
            content: "Este es un comentario de prueba para verificar la funcionalidad de eliminación.",
            author_name: "Usuario Test",
            user: { name: "Usuario Test" },
            created_at: new Date().toISOString(),
            post: { title: "Post de Prueba", slug: "post-de-prueba" }
        },
        {
            id: 2,
            content: "Otro comentario de prueba con contenido más largo para verificar que el diálogo de confirmación muestra correctamente el contenido truncado cuando es necesario.",
            author_name: "Otro Usuario",
            user: { name: "Otro Usuario" },
            created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            post: { title: "Otro Post", slug: "otro-post" }
        }
    ];

    useEffect(() => {
        // Simulate loading
        setTimeout(() => {
            setComments(mockComments);
            setLoading(false);
        }, 1000);
    }, []);

    const handleCommentDeleted = (commentId) => {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        
        // Show success message
        if (window.showNotification) {
            window.showNotification(`Comentario ${commentId} eliminado exitosamente`, 'success');
        }
    };

    const isAdmin = user?.roles?.some(role => role.name === 'admin');

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Test de Eliminación de Comentarios
            </Typography>

            {!isAdmin && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                        <strong>No eres administrador.</strong> Los botones de eliminación no serán visibles.
                        Solo los usuarios con rol de administrador pueden eliminar comentarios.
                    </Typography>
                </Alert>
            )}

            {isAdmin && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                        <strong>Eres administrador.</strong> Puedes ver y usar los botones de eliminación.
                        Los comentarios eliminados desaparecerán de esta lista.
                    </Typography>
                </Alert>
            )}

            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Esta página muestra comentarios de prueba para verificar la funcionalidad de eliminación.
                {isAdmin ? ' Como administrador, puedes eliminar cualquier comentario.' : ' Solo los administradores pueden eliminar comentarios.'}
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {comments.length === 0 ? (
                <Alert severity="success" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                        ¡Excelente! Todos los comentarios de prueba han sido eliminados.
                        La funcionalidad de eliminación está funcionando correctamente.
                    </Typography>
                </Alert>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {comments.map((comment, index) => (
                        <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: 3
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                {comment.user?.name || comment.author_name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                {new Date(comment.created_at).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </Typography>
                                            <Typography variant="body1" sx={{ mb: 2 }}>
                                                {comment.content}
                                            </Typography>
                                            {comment.post && (
                                                <Typography variant="caption" color="text.secondary">
                                                    En: {comment.post.title}
                                                </Typography>
                                            )}
                                        </Box>
                                        
                                        <Box sx={{ ml: 2 }}>
                                            <CommentDeleteButton
                                                comment={comment}
                                                user={user}
                                                onDeleted={handleCommentDeleted}
                                                size="small"
                                                variant="icon"
                                            />
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 3 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mt: 4, p: 3, backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Información de Prueba
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Usuario actual:</strong> {user?.name || 'No autenticado'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Roles:</strong> {user?.roles?.map(role => role.name).join(', ') || 'Ninguno'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Es administrador:</strong> {isAdmin ? 'Sí' : 'No'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    <strong>Comentarios restantes:</strong> {comments.length}
                </Typography>
            </Box>
        </Box>
    );
};

export default CommentDeleteTest;
