import React, { useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { Box, Container, Typography, Divider } from '@mui/material';
import GuestLayout from '@/Layouts/GuestLayout';
import InteractionTracker from '@/Components/ML/InteractionTracker';
import RecommendationsWidget from '@/Components/ML/RecommendationsWidget';
import MLInsights from '@/Components/ML/MLInsights';
import { sanitizeHtml } from '@/utils/sanitize';

/**
 * Ejemplo de página de blog con integración completa de ML
 * Este componente muestra cómo integrar todos los componentes ML en una página
 */
const ShowWithML = ({ post, auth }) => {
    // Sanitizar el contenido del post para prevenir XSS
    const sanitizedContent = useMemo(
        () => sanitizeHtml(post?.content ?? ''),
        [post?.content]
    );

    return (
        <GuestLayout user={auth.user}>
            <Head title={post.title} />
            
            {/* Tracker automático de interacciones (invisible) */}
            <InteractionTracker post={post} enabled={true} />
            
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Contenido principal del post */}
                <Box sx={{ mb: 6 }}>
                    {/* Imagen de portada */}
                    {post.cover_image && (
                        <Box
                            component="img"
                            src={post.cover_image}
                            alt={post.title}
                            sx={{
                                width: '100%',
                                height: 400,
                                objectFit: 'cover',
                                borderRadius: 3,
                                mb: 3
                            }}
                        />
                    )}
                    
                    {/* Título */}
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 700,
                            mb: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        {post.title}
                    </Typography>
                    
                    {/* Metadata */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, color: 'text.secondary' }}>
                        <Typography variant="body2">
                            Por {post.author?.name || 'Anónimo'}
                        </Typography>
                        <Typography variant="body2">•</Typography>
                        <Typography variant="body2">
                            {new Date(post.published_at).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Typography>
                        <Typography variant="body2">•</Typography>
                        <Typography variant="body2">
                            {post.reading_time || 5} min de lectura
                        </Typography>
                    </Box>
                    
                    {/* Categorías */}
                    {post.categories && post.categories.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                            {post.categories.map(category => (
                                <Box
                                    key={category.id}
                                    sx={{
                                        px: 2,
                                        py: 0.5,
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        borderRadius: 2,
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                    }}
                                >
                                    {category.name}
                                </Box>
                            ))}
                        </Box>
                    )}
                    
                    <Divider sx={{ mb: 3 }} />
                    
                    {/* Contenido del post */}
                    <Box
                        sx={{
                            '& p': { mb: 2, lineHeight: 1.8 },
                            '& h2': { mt: 4, mb: 2, fontWeight: 600 },
                            '& h3': { mt: 3, mb: 2, fontWeight: 600 },
                            '& img': { maxWidth: '100%', borderRadius: 2, my: 2 },
                            '& pre': { 
                                backgroundColor: 'grey.100', 
                                p: 2, 
                                borderRadius: 2,
                                overflow: 'auto'
                            },
                            '& code': {
                                backgroundColor: 'grey.100',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.875rem'
                            }
                        }}
                        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    />
                </Box>
                
                <Divider sx={{ my: 4 }} />
                
                {/* Widget de insights ML del usuario */}
                <MLInsights variant="full" />
                
                <Divider sx={{ my: 4 }} />
                
                {/* Widget de recomendaciones ML */}
                <RecommendationsWidget
                    currentPostId={post.id}
                    limit={6}
                    showAlgorithmSelector={true}
                    showExplanations={true}
                    title="🤖 Artículos Recomendados Para Ti"
                />
                
                {/* Sección de comentarios, compartir, etc. */}
                <Box sx={{ mt: 6 }}>
                    {/* Aquí irían otros componentes como comentarios, compartir en redes sociales, etc. */}
                </Box>
            </Container>
        </GuestLayout>
    );
};

export default ShowWithML;

