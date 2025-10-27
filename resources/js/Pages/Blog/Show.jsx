import { Head, usePage } from '@inertiajs/react';
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';

// Import TinyMCE content styles
import '../../../css/tinymce-content.css';

import {
    Box,
    Container,
    Typography,
    Avatar,
    Chip,
    Breadcrumbs,
    Link,
    Button,
    Divider,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    IconButton,
    Tooltip,
    useTheme,
    alpha,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Fab
} from '@mui/material';
import {
    Home as HomeIcon,
    TrendingUp as TrendingUpIcon,
    Visibility as VisibilityIcon,
    Article as ArticleIcon,
    Schedule as ScheduleIcon,
    Visibility as ViewsIcon,
    Person as PersonIcon,
    Category as CategoryIcon,
    Share as ShareIcon,
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    LinkedIn as LinkedInIcon,
    WhatsApp as WhatsAppIcon,
    FormatListBulleted as TocIcon,
    KeyboardArrowUp as ScrollTopIcon,
    Comment as CommentIcon,
    ThumbUp as LikeIcon,
    Bookmark as BookmarkIcon,
    BookmarkBorder as BookmarkBorderIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Check as CheckIcon,
    Verified as VerifiedIcon,
    PersonAdd as RegisterIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/Layouts/MainLayout';
import AnimatedSection from '@/Components/AnimatedSection';
import CommentsSection from '@/Components/Blog/CommentsSection';
import TagsDisplay from '@/Components/Blog/TagsDisplay';
import SuggestedPosts from '@/Components/Blog/SuggestedPosts';
import LoginModal from '@/Components/Auth/LoginModal';
import NotificationSnackbar from '@/Components/NotificationSnackbar';
import { useAuth, AuthSwitch } from '@/Components/AuthGuard';
import { usePostTracking } from '@/Hooks/usePostTracking';
import InteractionTracker from '@/Components/ML/InteractionTracker';
import RecommendationsWidget from '@/Components/ML/RecommendationsWidget';
import MLInsights from '@/Components/ML/MLInsights';

const DOMPURIFY_CONFIG = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel', 'id'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: true,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus'],
    KEEP_CONTENT: false,
};

const BlogShow = ({ post, suggestedPosts, seo }) => {
    const theme = useTheme();
    const { auth } = usePage().props; // ✅ FIX: Usar auth de Inertia en lugar de useAuth()
    const { startTracking, endTracking, getRecommendations } = usePostTracking();
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const [tableOfContents, setTableOfContents] = useState([]);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [personalizedSuggestions, setPersonalizedSuggestions] = useState([]);
    const [loadingPersonalized, setLoadingPersonalized] = useState(false);
    const [showMobileTOC, setShowMobileTOC] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    const sanitizedContent = useMemo(
        () => DOMPurify.sanitize(post?.content ?? '', DOMPURIFY_CONFIG),
        [post?.content]
    );

    // Extract table of contents from content
    useEffect(() => {
        const content = document.querySelector('.blog-content');
        if (content) {
            const headings = content.querySelectorAll('h2, h3, h4');
            const toc = Array.from(headings).map((heading, index) => {
                const id = `heading-${index}`;
                heading.id = id;
                return {
                    id,
                    text: heading.textContent,
                    level: parseInt(heading.tagName.charAt(1))
                };
            });
            setTableOfContents(toc);
        }
    }, [post.content]);

    // Cargar estado inicial de interacciones del usuario
    useEffect(() => {
        const loadUserInteractions = async () => {
            if (auth.user) {
                try {
                    const response = await axios.get(`/posts/${post.slug}/interaction-status`);
                    if (response.data) {
                        setIsLiked(response.data.isLiked);
                        setIsBookmarked(response.data.isBookmarked);
                        setLikesCount(response.data.likesCount);
                    }
                } catch (error) {
                    console.error('Error al cargar interacciones:', error);
                }
            } else {
                // Para usuarios no autenticados, solo cargar contadores públicos
                setLikesCount(post.likes_count || 0);
            }
        };

        loadUserInteractions();
    }, [auth.user, post.slug]);

    // Iniciar seguimiento del post para invitados
    useEffect(() => {
        if (!auth.user) {
            console.log('🟦 useEffect: Iniciando tracking para post', post.id);

            // Iniciar seguimiento del nuevo post
            startTracking(post.id, {
                title: post.title,
                slug: post.slug,
                categories: post.categories,
                tags: post.tags,
                excerpt: post.excerpt,
                cover_image: post.cover_image
            });

            // Cleanup al desmontar el componente O al cambiar de post
            return () => {
                console.log('🟦 useEffect cleanup: Finalizando tracking para post', post.id);
                endTracking(post.id, {
                    title: post.title,
                    slug: post.slug,
                    categories: post.categories,
                    tags: post.tags,
                    excerpt: post.excerpt,
                    cover_image: post.cover_image
                });
            };
        }
    }, [auth.user, post.id, post.title, post.slug]); // Quitamos startTracking y endTracking de las dependencias

    // Cargar recomendaciones personalizadas para invitados
    useEffect(() => {
        const loadPersonalizedSuggestions = async () => {
            if (!auth.user) {
                setLoadingPersonalized(true);
                try {
                    // Obtener recomendaciones del hook
                    const localRecommendations = getRecommendations(post.id, suggestedPosts, 6);

                    if (localRecommendations.length > 0) {
                        setPersonalizedSuggestions(localRecommendations);
                    } else {
                        // Fallback a las sugerencias estándar si no hay historial local
                        setPersonalizedSuggestions(suggestedPosts.slice(0, 6));
                    }
                } catch (error) {
                    console.error('Error loading personalized suggestions:', error);
                    setPersonalizedSuggestions(suggestedPosts.slice(0, 6));;
                } finally {
                    setLoadingPersonalized(false);
                }
            } else {
                // Para usuarios autenticados, usar las sugerencias estándar
                setPersonalizedSuggestions(suggestedPosts.slice(0, 6));
            }
        };

        loadPersonalizedSuggestions();
    }, [auth.user, post.id, suggestedPosts]); // Quitamos getRecommendations de las dependencias

    // Finalizar tracking al salir de la página
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (!auth.user) {
                endTracking(post.id, {
                    title: post.title,
                    slug: post.slug,
                    categories: post.categories,
                    tags: post.tags,
                    excerpt: post.excerpt,
                    cover_image: post.cover_image
                });
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (!auth.user) {
                endTracking(post.id, {
                    title: post.title,
                    slug: post.slug,
                    categories: post.categories,
                    tags: post.tags,
                    excerpt: post.excerpt,
                    cover_image: post.cover_image
                });
            }
        };
    }, [auth.user, post.id]); // Quitamos endTracking de las dependencias

    // Handle scroll events y reading progress
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 500);

            // Calculate reading progress
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;
            const trackLength = documentHeight - windowHeight;
            const progress = Math.min((scrollTop / trackLength) * 100, 100);
            setReadingProgress(progress);

            // Update active section
            const headings = document.querySelectorAll('[id^="heading-"]');
            let current = '';

            headings.forEach(heading => {
                const rect = heading.getBoundingClientRect();
                if (rect.top <= 100) {
                    current = heading.id;
                }
            });

            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial call
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // Offset para el navbar sticky
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Highlight temporal del heading
            element.style.transition = 'all 0.3s ease';
            element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            element.style.padding = '8px';
            element.style.borderRadius = '8px';
            element.style.marginLeft = '-8px';
            element.style.marginRight = '-8px';

            setTimeout(() => {
                element.style.backgroundColor = 'transparent';
                element.style.padding = '0';
                element.style.marginLeft = '0';
                element.style.marginRight = '0';
            }, 2000);
        }
    };

    const sharePost = (platform) => {
        const url = window.location.href;
        const title = post.title;

        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`
        };

        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        setShowShareMenu(false);
    };

    const scrollToComments = () => {
        const commentsSection = document.getElementById('comments-section');
        if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Función para mostrar notificaciones
    const showNotification = (message, severity = 'info') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    // Funciones para usuarios autenticados
    const handleLike = async () => {
        if (!auth.user) {
            setShowLoginModal(true);
            return;
        }

        try {
            const response = await axios.post(`/posts/${post.slug}/like`);

            if (response.data.success) {
                setIsLiked(response.data.isLiked);
                setLikesCount(response.data.likesCount);

                showNotification(
                    response.data.message,
                    response.data.isLiked ? 'success' : 'info'
                );
            }
        } catch (error) {
            console.error('Error al dar like:', error);
            showNotification(
                'Ocurrió un error al procesar tu acción. Inténtalo de nuevo.',
                'error'
            );
        }
    };

    const handleBookmark = async () => {
        if (!auth.user) {
            setShowLoginModal(true);
            return;
        }

        try {
            const response = await axios.post(`/posts/${post.slug}/bookmark`);

            if (response.data.success) {
                setIsBookmarked(response.data.isBookmarked);

                showNotification(
                    response.data.message,
                    response.data.isBookmarked ? 'success' : 'info'
                );
            }
        } catch (error) {
            console.error('Error al guardar post:', error);
            showNotification(
                'Ocurrió un error al guardar el post. Inténtalo de nuevo.',
                'error'
            );
        }
    };

    const handleFollowAuthor = async () => {
        if (!auth.user) {
            setShowLoginModal(true);
            return;
        }

        if (!post.author?.id) {
            showNotification('No se encontró información del autor', 'error');
            return;
        }

        try {
            const response = await axios.post(`/users/${post.author.id}/follow`);

            if (response.data.success) {
                showNotification(
                    response.data.message,
                    response.data.isFollowing ? 'success' : 'info'
                );

                // Podrías actualizar un estado para mostrar "Siguiendo" vs "Seguir"
                // setIsFollowingAuthor(response.data.isFollowing);
            }
        } catch (error) {
            console.error('Error al seguir autor:', error);

            const errorMessage = error.response?.data?.error ||
                'Ocurrió un error al seguir al autor. Inténtalo de nuevo.';

            showNotification(errorMessage, 'error');
        }
    };

    return (
        <MainLayout>
            <Head
                title={seo?.title || post.title}
                description={seo?.description || post.excerpt}
            >
                <meta property="og:title" content={seo?.title || post.title} />
                <meta property="og:description" content={seo?.description || post.excerpt} />
                <meta property="og:image" content={seo?.image || post.cover_image} />
                <meta property="og:type" content="article" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="article:published_time" content={post.published_at} />
                <meta name="article:author" content={post.author?.name} />
            </Head>

            {/* Reading Progress Indicator */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    zIndex: 9999,
                    background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    backdropFilter: 'blur(10px)'
                }}
            >
                <Box
                    sx={{
                        height: '100%',
                        width: `${readingProgress}%`,
                        background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(99, 102, 241, 0.4)',
                        transition: 'width 0.1s ease-out',
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: '40px',
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4))',
                            filter: 'blur(8px)'
                        }
                    }}
                />
            </Box>

            {/* ML Interaction Tracker - Invisible component */}
            <InteractionTracker post={post} enabled={true} />

            {/* Hero Section con tipografía optimizada */}
            <Box
                sx={{
                    position: 'relative',
                    height: { xs: '70vh', md: '80vh' },
                    display: 'flex',
                    alignItems: 'center',
                    backgroundImage: `url(${post.cover_image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
                        zIndex: 1
                    }
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Box
                            sx={{
                                display: 'inline-flex',
                                mb: 3,
                                px: 3,
                                py: 1.5,
                                borderRadius: 3,
                                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.12) 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)'
                                }
                            }}
                        >
                            <Breadcrumbs
                                aria-label="breadcrumb"
                                sx={{
                                    color: 'white',
                                    '& .MuiBreadcrumbs-separator': {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        mx: 1
                                    }
                                }}
                            >
                                <Link
                                    color="inherit"
                                    href="/"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            textDecoration: 'none',
                                            transform: 'scale(1.05)',
                                            textShadow: '0 0 8px rgba(255, 255, 255, 0.8)'
                                        }
                                    }}
                                >
                                    <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
                                    Inicio
                                </Link>
                                <Link
                                    color="inherit"
                                    href="/blog"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            textDecoration: 'none',
                                            transform: 'scale(1.05)',
                                            textShadow: '0 0 8px rgba(255, 255, 255, 0.8)'
                                        }
                                    }}
                                >
                                    <ArticleIcon sx={{ mr: 0.5, fontSize: 18 }} />
                                    Blog
                                </Link>
                                <Typography
                                    color="white"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontWeight: 600,
                                        maxWidth: { xs: '150px', sm: '300px', md: '400px' },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {post.title}
                                </Typography>
                            </Breadcrumbs>
                        </Box>

                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: { xs: '3rem', md: '4.5rem', xl: '5.5rem' },
                                fontWeight: 900,
                                lineHeight: { xs: 1.1, md: 1.2 },
                                color: 'white',
                                mb: 3,
                                textShadow: '2px 2px 8px rgba(0,0,0,0.8)'
                            }}
                        >
                            {post.title}
                        </Typography>

                        {post.excerpt && (
                            <Typography
                                variant="h5"
                                sx={{
                                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                                    color: alpha(theme.palette.common.white, 0.9),
                                    maxWidth: 800,
                                    mb: 4,
                                    textShadow: '1px 1px 4px rgba(0,0,0,0.6)'
                                }}
                            >
                                {post.excerpt}
                            </Typography>
                        )}

                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 2,
                                p: 2.5,
                                borderRadius: 3,
                                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.12) 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)'
                                }
                            }}
                        >
                            <Avatar
                                src={post.author?.avatar}
                                sx={{
                                    width: 56,
                                    height: 56,
                                    border: '3px solid rgba(255, 255, 255, 0.3)',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                    transition: 'transform 0.3s ease',
                                    '&:hover': {
                                        transform: 'scale(1.1)'
                                    }
                                }}
                            />
                            <Box>
                                <Typography
                                    component={post.author?.id ? Link : 'span'}
                                    href={post.author?.id ? `/user/${post.author.id}` : undefined}
                                    variant="h6"
                                    sx={{
                                        color: 'white',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        textDecoration: 'none',
                                        cursor: post.author?.id ? 'pointer' : 'default',
                                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                                        transition: 'all 0.2s ease',
                                        '&:hover': post.author?.id ? {
                                            textShadow: '0 0 12px rgba(255, 255, 255, 0.8)',
                                            transform: 'scale(1.02)'
                                        } : {}
                                    }}
                                >
                                    {post.author?.name}
                                    {post.author?.is_verified && (
                                        <VerifiedIcon
                                            sx={{
                                                color: '#60a5fa',
                                                fontSize: '1.3rem',
                                                filter: 'drop-shadow(0 0 4px rgba(96, 165, 250, 0.6))'
                                            }}
                                        />
                                    )}
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: { xs: 1.5, sm: 2 },
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        mt: 0.5
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 2,
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(8px)',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                background: 'rgba(255, 255, 255, 0.15)',
                                                transform: 'scale(1.05)'
                                            }
                                        }}
                                    >
                                        <ScheduleIcon sx={{ fontSize: 18, filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))' }} />
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {formatDate(post.published_at)}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 2,
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(8px)',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                background: 'rgba(255, 255, 255, 0.15)',
                                                transform: 'scale(1.05)'
                                            }
                                        }}
                                    >
                                        <ViewsIcon sx={{ fontSize: 18, filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))' }} />
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {post.views_count || 0} vistas
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 2,
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(8px)',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                background: 'rgba(255, 255, 255, 0.15)',
                                                transform: 'scale(1.05)'
                                            }
                                        }}
                                    >
                                        <CommentIcon sx={{ fontSize: 18, filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))' }} />
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {post.comments_count || 0} comentarios
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </motion.div>
                </Container>
            </Box>

            {/* Contenido principal */}
            <Container
                maxWidth="xl"
                sx={{
                    py: { xs: 4, sm: 6, md: 8, lg: 10 },
                    px: { xs: 2, sm: 3, md: 4 }
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 2, sm: 3, md: 4, lg: 5 }
                    }}
                >
                    {/* Sidebar - Tabla de contenidos y Recomendaciones */}
                    <Box sx={{
                        width: { xs: '100%', sm: '33.33%', md: '33.33%', lg: '25%' },
                        order: { xs: 2, sm: 2 },
                        flexShrink: 0
                    }}>
                        <Box
                            sx={{
                                position: { xs: 'static', lg: 'sticky' },
                                top: { lg: 100 },
                                height: 'fit-content',
                                maxHeight: { lg: 'calc(100vh - 120px)' },
                                overflowY: { lg: 'auto' },
                                width: '100%',
                                maxWidth: '100%',
                                mt: { xs: 3, sm: 0 },
                                '&::-webkit-scrollbar': {
                                    width: '4px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: 'rgba(0,0,0,0.1)',
                                    borderRadius: '2px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: 'rgba(37, 99, 235, 0.3)',
                                    borderRadius: '2px',
                                    '&:hover': {
                                        background: 'rgba(37, 99, 235, 0.5)',
                                    }
                                }
                            }}
                        >
                            {/* Tabla de contenidos */}
                            {tableOfContents.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            display: { xs: 'block', sm: 'block' },
                                            p: { xs: 2.5, md: 3 },
                                            mb: { xs: 2.5, md: 3 },
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
                                                ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                                                : '0 8px 32px rgba(59, 130, 246, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            width: '100%',
                                            maxWidth: '100%',
                                            boxSizing: 'border-box',
                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '4px',
                                                height: '100%',
                                                background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.8), rgba(99, 102, 241, 0.8))',
                                                borderRadius: '4px 0 0 4px',
                                                boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)'
                                            },
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background: theme.palette.mode === 'dark'
                                                    ? 'linear-gradient(145deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.05) 50%, rgba(99, 102, 241, 0.05) 100%)'
                                                    : 'linear-gradient(145deg, rgba(59, 130, 246, 0.03) 0%, rgba(147, 197, 253, 0.03) 50%, rgba(99, 102, 241, 0.03) 100%)',
                                                pointerEvents: 'none',
                                                borderRadius: { xs: 3, md: 4 }
                                            },
                                            '&:hover': {
                                                transform: 'translateY(-4px) scale(1.01)',
                                                boxShadow: theme.palette.mode === 'dark'
                                                    ? '0 16px 48px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                                                    : '0 16px 48px rgba(59, 130, 246, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.3)',
                                                '&::before': {
                                                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)'
                                                }
                                            }
                                        }}
                                    >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 2,
                                            color: theme.palette.primary.main,
                                            fontWeight: 700
                                        }}
                                    >
                                        <TocIcon sx={{ mr: 1 }} />
                                        Tabla de contenidos
                                    </Typography>
                                    <List dense sx={{ position: 'relative', zIndex: 1 }}>
                                        {tableOfContents.map((item, index) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                            >
                                                <ListItem disablePadding>
                                                    <ListItemButton
                                                        onClick={() => scrollToSection(item.id)}
                                                        sx={{
                                                            pl: (item.level - 1) * 2,
                                                            borderRadius: 2,
                                                            mb: 0.5,
                                                            position: 'relative',
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            background: activeSection === item.id
                                                                ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.06) 100%)'
                                                                : 'transparent',
                                                            '&::before': {
                                                                content: '""',
                                                                position: 'absolute',
                                                                left: 0,
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                width: '3px',
                                                                height: activeSection === item.id ? '70%' : '0%',
                                                                background: 'linear-gradient(180deg, rgba(59, 130, 246, 1), rgba(99, 102, 241, 1))',
                                                                borderRadius: '0 2px 2px 0',
                                                                transition: 'height 0.3s ease',
                                                                boxShadow: activeSection === item.id ? '0 0 8px rgba(59, 130, 246, 0.5)' : 'none'
                                                            },
                                                            '&:hover': {
                                                                background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%)',
                                                                transform: 'translateX(4px)',
                                                                '&::before': {
                                                                    height: '50%'
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={item.text}
                                                            primaryTypographyProps={{
                                                                fontSize: '0.9rem',
                                                                fontWeight: activeSection === item.id ? 650 : 450,
                                                                color: activeSection === item.id
                                                                    ? theme.palette.primary.main
                                                                    : theme.palette.text.secondary,
                                                                transition: 'all 0.3s ease',
                                                                letterSpacing: activeSection === item.id ? '0.01em' : '0'
                                                            }}
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                            </motion.div>
                                        ))}
                                    </List>
                                </Paper>
                                </motion.div>
                            )}

                            {/* ML Recommendations Widget in Sidebar */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <RecommendationsWidget
                                    currentPostId={post.id}
                                    limit={5}
                                    showAlgorithmSelector={false}
                                    showExplanations={false}
                                    title="🤖 Recomendado para ti"
                                    compact={true}
                                />
                            </motion.div>

                            {/* Posts sugeridos inteligentes - Fallback */}
                            {false && (personalizedSuggestions.length > 0 || suggestedPosts.length > 0) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                >
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: { xs: 2.5, md: 3 },
                                            borderRadius: { xs: 2, md: 3 },
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(15px)',
                                            border: '1px solid rgba(5, 150, 105, 0.1)',
                                            boxShadow: '0 8px 32px rgba(5, 150, 105, 0.08)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            width: '100%',
                                            maxWidth: '100%',
                                            boxSizing: 'border-box',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 12px 40px rgba(5, 150, 105, 0.12)',
                                            },
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '4px',
                                                height: '100%',
                                                background: 'linear-gradient(180deg, #059669, #10b981)',
                                            }
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                mb: 3,
                                                color: theme.palette.primary.main,
                                                fontWeight: 700,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            <ArticleIcon />
                                            {!auth.user && personalizedSuggestions.length > 0
                                                ? 'Recomendado para ti'
                                                : 'Artículos relacionados'
                                            }
                                            {!auth.user && (
                                                <Tooltip title="Basado en tu historial de navegación">
                                                    <TrendingUpIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                                                </Tooltip>
                                            )}
                                        </Typography>

                                        {loadingPersonalized ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Personalizando recomendaciones...
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                                {(personalizedSuggestions.length > 0 ? personalizedSuggestions : suggestedPosts)
                                                    .slice(0, 5).map((suggestedPost, index) => {
                                                    // Determinar si es muy relevante basado en puntuación o interacciones
                                                    const isHighlyRelevant = suggestedPost.relevance_score > 5 ||
                                                        suggestedPost.recommendation_score > 5 ||
                                                        suggestedPost.views_count > 100 ||
                                                        suggestedPost.likes_count > 10;

                                                    const isPersonalized = !auth.user && personalizedSuggestions.length > 0;
                                                    const isRead = suggestedPost.isRead || suggestedPost.is_read;
                                                    const hasReadPenalty = suggestedPost.readPenalty < 1 || suggestedPost.read_penalty < 1;

                                                    return (
                                                        <motion.div
                                                            key={suggestedPost.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                            whileHover={{
                                                                x: 4,
                                                                transition: { duration: 0.2 }
                                                            }}
                                                        >
                                                            <Card
                                                                component={Link}
                                                                href={`/blog/${suggestedPost.slug}`}
                                                                sx={{
                                                                    display: 'flex',
                                                                    textDecoration: 'none',
                                                                    borderRadius: 3,
                                                                    overflow: 'hidden',
                                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                                                    position: 'relative',
                                                                    opacity: isRead ? 0.8 : 1, // Hacer posts leídos menos prominentes
                                                                    '&:hover': {
                                                                        boxShadow: theme.shadows[4],
                                                                        borderColor: theme.palette.primary.main,
                                                                        opacity: 1, // Restaurar opacidad al hover
                                                                        '& .suggested-image': {
                                                                            transform: 'scale(1.05)'
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                {/* Indicador de relevancia */}
                                                                {(isHighlyRelevant || isPersonalized || isRead) && (
                                                                    <Box
                                                                        sx={{
                                                                            position: 'absolute',
                                                                            top: 8,
                                                                            left: 8,
                                                                            zIndex: 2,
                                                                            backgroundColor: isRead
                                                                                ? theme.palette.grey[500]
                                                                                : isPersonalized
                                                                                    ? theme.palette.secondary.main
                                                                                    : theme.palette.primary.main,
                                                                            color: 'white',
                                                                            borderRadius: '4px',
                                                                            px: 0.5,
                                                                            py: 0.25,
                                                                            fontSize: '0.6rem',
                                                                            fontWeight: 600,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 0.25
                                                                        }}
                                                                    >
                                                                        {isRead ? (
                                                                            <>
                                                                                <CheckIcon sx={{ fontSize: 10 }} />
                                                                                Leído
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <TrendingUpIcon sx={{ fontSize: 10 }} />
                                                                                {isPersonalized ? 'Para ti' : 'Popular'}
                                                                            </>
                                                                        )}
                                                                    </Box>
                                                                )}

                                                                <CardMedia
                                                                    component="img"
                                                                    sx={{
                                                                        width: 110,
                                                                        height: 90,
                                                                        objectFit: 'cover',
                                                                        transition: 'transform 0.3s ease'
                                                                    }}
                                                                    className="suggested-image"
                                                                    image={suggestedPost.cover_image || '/images/blog/default.jpg'}
                                                                    alt={suggestedPost.title}
                                                                />
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                                    <CardContent sx={{ p: 1.5, pb: 1, flex: 1 }}>
                                                                        <Typography
                                                                            variant="h6"
                                                                            sx={{
                                                                                fontSize: '0.9rem',
                                                                                fontWeight: 600,
                                                                                lineHeight: 1.3,
                                                                                color: theme.palette.text.primary,
                                                                                display: '-webkit-box',
                                                                                WebkitLineClamp: 2,
                                                                                WebkitBoxOrient: 'vertical',
                                                                                overflow: 'hidden',
                                                                                mb: 0.5
                                                                            }}
                                                                        >
                                                                            {suggestedPost.title}
                                                                        </Typography>

                                                                        {/* Mostrar etiquetas comunes */}
                                                                        {suggestedPost.tags && suggestedPost.tags.length > 0 && (
                                                                            <Box sx={{ mb: 1 }}>
                                                                                <TagsDisplay
                                                                                    tags={suggestedPost.tags.slice(0, 2)}
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    clickable={false}
                                                                                    spacing={0.5}
                                                                                />
                                                                            </Box>
                                                                        )}

                                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                                                                            <Typography
                                                                                variant="caption"
                                                                                sx={{
                                                                                    color: theme.palette.text.disabled,
                                                                                    fontSize: '0.7rem'
                                                                                }}
                                                                            >
                                                                                {suggestedPost.reading_time}
                                                                            </Typography>

                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                                                                    <FavoriteIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                                                                                    <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                                                                                        {suggestedPost.likes_count || 0}
                                                                                    </Typography>
                                                                                </Box>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                                                                    <VisibilityIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                                                                                    <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                                                                                        {suggestedPost.views_count || 0}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>
                                                                        </Box>
                                                                    </CardContent>
                                                                </Box>
                                                            </Card>
                                                        </motion.div>
                                                    );
                                                })}
                                            </Box>
                                        )}

                                        {/* Botón para ver más posts */}
                                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                                            <Button
                                                component={Link}
                                                href="/blog"
                                                variant="outlined"
                                                size="small"
                                                sx={{
                                                    borderRadius: 3,
                                                    textTransform: 'none',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                Ver más artículos
                                            </Button>
                                        </Box>
                                    </Paper>
                                </motion.div>
                            )}
                        </Box>
                    </Box>

                    {/* Contenido del artículo */}
                    <Box sx={{
                        width: { xs: '100%', sm: '66.67%', md: '66.67%', lg: '75%' },
                        order: { xs: 1, sm: 1 },
                        flexGrow: 1
                    }}>
                        <AnimatedSection>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 2.5, sm: 3, md: 4, lg: 5 },
                                    borderRadius: { xs: 3, md: 4 },
                                    background: theme.palette.mode === 'dark'
                                        ? 'linear-gradient(145deg, rgba(30, 30, 30, 0.98) 0%, rgba(18, 18, 18, 0.95) 100%)'
                                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                                        : '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                                    border: theme.palette.mode === 'dark'
                                        ? '1px solid rgba(255, 255, 255, 0.1)'
                                        : '1px solid rgba(255, 255, 255, 0.3)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    mb: { xs: 2, md: 3 },
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        boxShadow: theme.palette.mode === 'dark'
                                            ? '0 12px 48px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                                            : '0 12px 48px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.3)',
                                        transform: 'translateY(-2px)'
                                    },
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: 'linear-gradient(90deg, rgba(59, 130, 246, 1) 0%, rgba(99, 102, 241, 1) 50%, rgba(139, 92, 246, 1) 100%)',
                                        borderRadius: '4px 4px 0 0',
                                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
                                    },
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: theme.palette.mode === 'dark'
                                            ? 'linear-gradient(145deg, rgba(59, 130, 246, 0.04) 0%, rgba(147, 197, 253, 0.04) 50%, rgba(99, 102, 241, 0.04) 100%)'
                                            : 'linear-gradient(145deg, rgba(59, 130, 246, 0.02) 0%, rgba(147, 197, 253, 0.02) 50%, rgba(99, 102, 241, 0.02) 100%)',
                                        pointerEvents: 'none',
                                        borderRadius: { xs: 3, md: 4 }
                                    }
                                }}
                            >
                                {/* Categorías y etiquetas */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {/* Categorías */}
                                        {post.categories && post.categories.length > 0 && (
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                {post.categories.map((category, index) => (
                                                    <motion.div
                                                        key={category.id}
                                                        initial={{ opacity: 0, scale: 0.8, y: -10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        transition={{ delay: index * 0.1, duration: 0.3 }}
                                                        whileHover={{ scale: 1.05, y: -2 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <Chip
                                                            label={category.name}
                                                            variant="filled"
                                                            size="small"
                                                            icon={<CategoryIcon />}
                                                            sx={{
                                                                borderRadius: 2,
                                                                backgroundColor: category.color || theme.palette.primary.main,
                                                                color: 'white',
                                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                                                transition: 'all 0.3s ease',
                                                                '&:hover': {
                                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                                                                    filter: 'brightness(1.1)'
                                                                }
                                                            }}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </Box>
                                        )}

                                        {/* Etiquetas */}
                                        {post.tags && post.tags.length > 0 && (
                                            <TagsDisplay
                                                tags={post.tags}
                                                size="small"
                                                variant="outlined"
                                                showLabel={true}
                                                maxTags={8}
                                                clickable={true}
                                                spacing={0.5}
                                            />
                                        )}
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        {/* Botón de Like */}
                                        <AuthSwitch
                                            authenticated={
                                                <Tooltip title={isLiked ? "Ya no me gusta" : "Me gusta"}>
                                                    <IconButton
                                                        onClick={handleLike}
                                                        sx={{
                                                            color: isLiked ? theme.palette.error.main : theme.palette.action.active,
                                                            '&:hover': {
                                                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                                                                transform: 'scale(1.1)'
                                                            },
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                                    </IconButton>
                                                </Tooltip>
                                            }
                                            guest={
                                                <Tooltip title="Inicia sesión para dar me gusta">
                                                    <IconButton
                                                        onClick={() => setShowLoginModal(true)}
                                                        sx={{
                                                            color: theme.palette.action.active,
                                                            '&:hover': {
                                                                backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                                            }
                                                        }}
                                                    >
                                                        <FavoriteBorderIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            }
                                        />

                                        {likesCount > 0 && (
                                            <Typography variant="body2" color="text.secondary">
                                                {likesCount}
                                            </Typography>
                                        )}

                                        {/* Botón de Bookmark */}
                                        <AuthSwitch
                                            authenticated={
                                                <Tooltip title={isBookmarked ? "Quitar de guardados" : "Guardar artículo"}>
                                                    <IconButton
                                                        onClick={handleBookmark}
                                                        sx={{
                                                            color: isBookmarked ? theme.palette.warning.main : theme.palette.action.active,
                                                            '&:hover': {
                                                                backgroundColor: alpha(theme.palette.warning.main, 0.1),
                                                                transform: 'scale(1.1)'
                                                            },
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                                                    </IconButton>
                                                </Tooltip>
                                            }
                                            guest={
                                                <Tooltip title="Inicia sesión para guardar artículos">
                                                    <IconButton
                                                        onClick={() => setShowLoginModal(true)}
                                                        sx={{
                                                            color: theme.palette.action.active,
                                                            '&:hover': {
                                                                backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                                            }
                                                        }}
                                                    >
                                                        <BookmarkBorderIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            }
                                        />

                                        {/* Botón de Compartir */}
                                        <Tooltip title="Compartir artículo">
                                            <IconButton
                                                onClick={() => setShowShareMenu(!showShareMenu)}
                                                sx={{
                                                    color: theme.palette.primary.main,
                                                    '&:hover': {
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                        transform: 'scale(1.1)'
                                                    },
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <ShareIcon />
                                            </IconButton>
                                        </Tooltip>

                                        {/* Botón CTA Premium */}
                                        <AuthSwitch
                                            authenticated={
                                                <Button
                                                    variant="contained"
                                                    startIcon={<PersonIcon />}
                                                    onClick={handleFollowAuthor}
                                                    sx={{
                                                        borderRadius: 3,
                                                        background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                                                        '&:hover': {
                                                            transform: 'scale(1.05)',
                                                            boxShadow: theme.shadows[8]
                                                        },
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                    }}
                                                >
                                                    Seguir autor
                                                </Button>
                                            }
                                            guest={
                                                <Button
                                                    variant="contained"
                                                    startIcon={<RegisterIcon />}
                                                    onClick={() => setShowLoginModal(true)}
                                                    sx={{
                                                        borderRadius: 3,
                                                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                                        '&:hover': {
                                                            transform: 'scale(1.05)',
                                                            boxShadow: theme.shadows[8]
                                                        },
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                    }}
                                                >
                                                    Únete gratis
                                                </Button>
                                            }
                                        />
                                    </Box>
                                </Box>

                                {/* Menú de compartir */}
                                <AnimatePresence>
                                    {showShareMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Paper
                                                elevation={8}
                                                sx={{
                                                    p: 2,
                                                    mb: 3,
                                                    borderRadius: 3,
                                                    display: 'flex',
                                                    gap: 1,
                                                    justifyContent: 'center',
                                                    backgroundColor: theme.palette.grey[50]
                                                }}
                                            >
                                                <Tooltip title="Compartir en Facebook">
                                                    <IconButton
                                                        onClick={() => sharePost('facebook')}
                                                        sx={{ color: '#1877f2' }}
                                                    >
                                                        <FacebookIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Compartir en Twitter">
                                                    <IconButton
                                                        onClick={() => sharePost('twitter')}
                                                        sx={{ color: '#1da1f2' }}
                                                    >
                                                        <TwitterIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Compartir en LinkedIn">
                                                    <IconButton
                                                        onClick={() => sharePost('linkedin')}
                                                        sx={{ color: '#0077b5' }}
                                                    >
                                                        <LinkedInIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Compartir por WhatsApp">
                                                    <IconButton
                                                        onClick={() => sharePost('whatsapp')}
                                                        sx={{ color: '#25d366' }}
                                                    >
                                                        <WhatsAppIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Paper>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Divider sx={{ mb: 4 }} />

                                {/* Contenido del artículo */}
                                <Box
                                    className="blog-content tinymce-content"
                                    data-theme={theme.palette.mode}
                                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                                />
                            </Paper>
                        </AnimatedSection>

                        {/* Sección de comentarios */}
                        <Box id="comments-section" sx={{ mt: 6 }}>
                            <CommentsSection
                                postId={post.id}
                                postSlug={post.slug}
                                comments={post.comments || []}
                            />
                        </Box>

                        {/* ML Insights Widget */}
                        {false && (
                            <AnimatedSection>
                                <Box sx={{ mt: 6 }}>
                                    <MLInsights variant="full" />
                                </Box>
                            </AnimatedSection>
                        )}
                    </Box>
                </Box>
            </Container>

            {/* Botón scroll to top mejorado */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{
                            position: 'fixed',
                            bottom: 32,
                            right: 32,
                            zIndex: 1100
                        }}
                    >
                        <Fab
                            color="primary"
                            onClick={scrollToTop}
                            aria-label="Volver arriba"
                            sx={{
                                width: 56,
                                height: 56,
                                background: 'linear-gradient(45deg, #2563eb, #3b82f6)',
                                boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                '&:hover': {
                                    transform: 'scale(1.1) translateY(-2px)',
                                    boxShadow: '0 12px 40px rgba(37, 99, 235, 0.4)',
                                    background: 'linear-gradient(45deg, #1d4ed8, #2563eb)',
                                },
                                '&:active': {
                                    transform: 'scale(0.95)',
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <ScrollTopIcon sx={{ fontSize: 24 }} />
                        </Fab>
                    </motion.div>
                )}
            </AnimatePresence>





            {/* Modal de Login */}
            <LoginModal
                open={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                initialTab={0}
            />

            {/* Notificaciones */}
            <NotificationSnackbar
                open={notification.open}
                message={notification.message}
                severity={notification.severity}
                onClose={closeNotification}
            />
        </MainLayout>
    );
};

export default BlogShow;