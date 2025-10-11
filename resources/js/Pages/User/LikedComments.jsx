import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Avatar,
    Chip,
    TextField,
    InputAdornment,
    Pagination,
    Grid,
    Button,
    Divider,
    IconButton,
    Tooltip,
    Paper,
    Stack,
    useTheme
} from '@mui/material';
import {
    Search as SearchIcon,
    Favorite as FavoriteIcon,
    Comment as CommentIcon,
    Article as ArticleIcon,
    Reply as ReplyIcon,
    ArrowBack as ArrowBackIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const THEME = {
    primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1'
    },
    secondary: {
        50: '#f8fafc',
        600: '#475569',
        700: '#334155'
    },
    accent: {
        rose: '#f43f5e',
        purple: '#8b5cf6'
    }
};

export default function LikedComments({ likedComments, filters }) {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('user.liked-comments'), {
            search: searchTerm,
            per_page: filters.per_page
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handlePageChange = (event, page) => {
        router.get(route('user.liked-comments'), {
            ...filters,
            page: page
        }, {
            preserveState: true,
            replace: true
        });
    };

    const formatDate = (dateString) => {
        try {
            return formatDistanceToNow(new Date(dateString), {
                addSuffix: true,
                locale: es
            });
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    const truncateText = (text, maxLength = 150) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Comentarios que me Gustan" />
            
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <IconButton
                            component={Link}
                            href="/user/dashboard"
                            sx={{ mr: 2 }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <FavoriteIcon sx={{ color: THEME.accent.rose, mr: 2, fontSize: 32 }} />
                        <Typography variant="h4" fontWeight="bold" color={THEME.secondary[700]}>
                            Comentarios que me Gustan
                        </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                        Todos los comentarios que has marcado como útiles o interesantes
                    </Typography>
                </Box>

                {/* Search and Filters */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 4,
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 3
                    }}
                >
                    <form onSubmit={handleSearch}>
                        <TextField
                            fullWidth
                            placeholder="Buscar en tus comentarios favoritos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="small"
                                            sx={{
                                                borderRadius: 2,
                                                background: `linear-gradient(45deg, ${THEME.primary[500]}, ${THEME.primary[600]})`,
                                            }}
                                        >
                                            Buscar
                                        </Button>
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }
                            }}
                        />
                    </form>
                </Paper>

                {/* Results Count */}
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" color={THEME.secondary[600]}>
                        {likedComments.total} comentario{likedComments.total !== 1 ? 's' : ''} encontrado{likedComments.total !== 1 ? 's' : ''}
                    </Typography>
                    <Chip
                        icon={<CommentIcon />}
                        label={`${likedComments.data.length} en esta página`}
                        variant="outlined"
                        sx={{ borderColor: THEME.primary[500], color: THEME.primary[600] }}
                    />
                </Box>

                {/* Comments Grid */}
                {likedComments.data.length > 0 ? (
                    <Grid container spacing={3}>
                        {likedComments.data.map((comment) => (
                            <Grid item xs={12} key={comment.id}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: 3,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                                            border: `1px solid ${THEME.primary[200]}`
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        {/* Comment Header */}
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                            <Avatar
                                                src={comment.user?.avatar}
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    mr: 2,
                                                    background: `linear-gradient(45deg, ${THEME.primary[500]}, ${THEME.accent.purple})`
                                                }}
                                            >
                                                {comment.user?.name?.charAt(0) || comment.author_name?.charAt(0) || 'U'}
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="subtitle1" fontWeight="bold" color={THEME.secondary[700]}>
                                                    {comment.user?.name || comment.author_name || 'Usuario Anónimo'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatDate(comment.created_at)}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                icon={<FavoriteIcon />}
                                                label="Me gusta"
                                                size="small"
                                                sx={{
                                                    background: `linear-gradient(45deg, ${THEME.accent.rose}, ${THEME.accent.purple})`,
                                                    color: 'white',
                                                    '& .MuiChip-icon': { color: 'white' }
                                                }}
                                            />
                                        </Box>

                                        {/* Comment Content */}
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                mb: 2,
                                                lineHeight: 1.6,
                                                color: THEME.secondary[700]
                                            }}
                                        >
                                            {truncateText(comment.body)}
                                        </Typography>

                                        {/* Parent Comment (if reply) */}
                                        {comment.parent && (
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    mb: 2,
                                                    backgroundColor: 'rgba(0,0,0,0.02)',
                                                    borderLeft: `3px solid ${THEME.primary[500]}`,
                                                    borderRadius: 1
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <ReplyIcon sx={{ fontSize: 16, mr: 1, color: THEME.primary[500] }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        Respuesta a {comment.parent.user?.name || 'Usuario'}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {truncateText(comment.parent.body, 100)}
                                                </Typography>
                                            </Box>
                                        )}

                                        <Divider sx={{ my: 2 }} />

                                        {/* Post Info */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <ArticleIcon sx={{ fontSize: 20, mr: 1, color: THEME.primary[500] }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    En: 
                                                </Typography>
                                                <Link
                                                    href={`/blog/${comment.post.slug}`}
                                                    style={{ textDecoration: 'none', marginLeft: 4 }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: THEME.primary[600],
                                                            fontWeight: 500,
                                                            '&:hover': { textDecoration: 'underline' }
                                                        }}
                                                    >
                                                        {truncateText(comment.post.title, 50)}
                                                    </Typography>
                                                </Link>
                                            </Box>
                                            <Button
                                                component={Link}
                                                href={`/blog/${comment.post.slug}#comment-${comment.id}`}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    borderRadius: 2,
                                                    borderColor: THEME.primary[500],
                                                    color: THEME.primary[600],
                                                    '&:hover': {
                                                        backgroundColor: THEME.primary[50],
                                                        borderColor: THEME.primary[600]
                                                    }
                                                }}
                                            >
                                                Ver Comentario
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 6,
                            textAlign: 'center',
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: 3
                        }}
                    >
                        <CommentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No tienes comentarios favoritos aún
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Explora nuestros artículos y marca como útiles los comentarios que te interesen
                        </Typography>
                        <Button
                            component={Link}
                            href="/blog"
                            variant="contained"
                            startIcon={<ArticleIcon />}
                            sx={{
                                borderRadius: 3,
                                px: 4,
                                py: 1.5,
                                background: `linear-gradient(45deg, ${THEME.primary[500]}, ${THEME.primary[600]})`,
                            }}
                        >
                            Explorar Blog
                        </Button>
                    </Paper>
                )}

                {/* Pagination */}
                {likedComments.last_page > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={likedComments.last_page}
                            page={likedComments.current_page}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    borderRadius: 2,
                                    '&.Mui-selected': {
                                        background: `linear-gradient(45deg, ${THEME.primary[500]}, ${THEME.primary[600]})`,
                                    }
                                }
                            }}
                        />
                    </Box>
                )}
            </Container>
        </AuthenticatedLayout>
    );
}
