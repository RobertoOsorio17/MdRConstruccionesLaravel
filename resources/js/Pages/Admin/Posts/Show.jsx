import React from 'react';
import { Head } from '@inertiajs/react';
import {
    Box,
    Container,
    Typography,
    Button,
    Chip,
    Paper,
    Grid,
    Card,
    CardContent,
    Avatar,
    Divider,
    Stack,
    useTheme,
    alpha
} from '@mui/material';
import {
    Edit as EditIcon,
    Visibility as ViewIcon,
    Star as StarIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    Category as CategoryIcon,
    Tag as TagIcon,
    Visibility as VisibilityIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import AdminLayout from '@/Layouts/AdminLayout';
import DOMPurify from 'dompurify';

const ShowPost = ({ post }) => {
    const theme = useTheme();

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'success';
            case 'draft': return 'warning';
            case 'scheduled': return 'info';
            default: return 'default';
        }
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
        <AdminLayout>
            <Head title={`${post.title} - Admin`} />

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                    <Box sx={{ flex: 1, mr: 4 }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            {post.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Detalles del post
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            startIcon={<ViewIcon />}
                            href={`/blog/${post.slug}`}
                            target="_blank"
                        >
                            Ver Post
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            href={`/admin/posts/${post.id}/edit`}
                        >
                            Editar
                        </Button>
                    </Stack>
                </Box>

                <Grid container spacing={4}>
                    {/* Main Content */}
                    <Grid item xs={12} lg={8}>
                        <Stack spacing={4}>
                            {/* Cover Image */}
                            {post.cover_image && (
                                <Paper sx={{ overflow: 'hidden', borderRadius: 3 }}>
                                    <img
                                        src={post.cover_image}
                                        alt={post.title}
                                        style={{
                                            width: '100%',
                                            height: 300,
                                            objectFit: 'cover'
                                        }}
                                    />
                                </Paper>
                            )}

                            {/* Excerpt */}
                            <Card>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Extracto
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {post.excerpt}
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* Content */}
                            <Card>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Contenido
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />
                                    <Box
                                        sx={{
                                            '& h2': {
                                                fontSize: '1.8rem',
                                                fontWeight: 600,
                                                mt: 4,
                                                mb: 2,
                                                color: theme.palette.primary.main
                                            },
                                            '& h3': {
                                                fontSize: '1.4rem',
                                                fontWeight: 600,
                                                mt: 3,
                                                mb: 2
                                            },
                                            '& h4': {
                                                fontSize: '1.2rem',
                                                fontWeight: 600,
                                                mt: 2,
                                                mb: 1
                                            },
                                            '& p': {
                                                fontSize: '1.1rem',
                                                lineHeight: 1.8,
                                                mb: 3,
                                                color: theme.palette.text.primary
                                            },
                                            '& ul, & ol': {
                                                pl: 4,
                                                mb: 3,
                                                '& li': {
                                                    fontSize: '1.1rem',
                                                    lineHeight: 1.8,
                                                    mb: 1
                                                }
                                            },
                                            '& blockquote': {
                                                borderLeft: `4px solid ${theme.palette.primary.main}`,
                                                pl: 3,
                                                py: 2,
                                                my: 3,
                                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                                fontStyle: 'italic',
                                                fontSize: '1.1rem'
                                            },
                                            '& img': {
                                                maxWidth: '100%',
                                                height: 'auto',
                                                borderRadius: 2,
                                                my: 3
                                            }
                                        }}
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content ?? '') }}
                                    />
                                </CardContent>
                            </Card>

                            {/* SEO Information */}
                            {(post.seo_title || post.seo_description) && (
                                <Card>
                                    <CardContent sx={{ p: 4 }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Información SEO
                                        </Typography>
                                        {post.seo_title && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                                                    Título SEO:
                                                </Typography>
                                                <Typography variant="body1">
                                                    {post.seo_title}
                                                </Typography>
                                            </Box>
                                        )}
                                        {post.seo_description && (
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                                                    Descripción SEO:
                                                </Typography>
                                                <Typography variant="body1">
                                                    {post.seo_description}
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </Stack>
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} lg={4}>
                        <Stack spacing={4}>
                            {/* Status */}
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Estado
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Chip 
                                            label={post.status}
                                            color={getStatusColor(post.status)}
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                        {post.featured && (
                                            <Chip 
                                                label="Destacado"
                                                color="primary"
                                                icon={<StarIcon />}
                                                sx={{ ml: 1 }}
                                            />
                                        )}
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <VisibilityIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {post.views_count} visualizaciones
                                        </Typography>
                                    </Box>

                                    {post.published_at && (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <ScheduleIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Publicado: {formatDate(post.published_at)}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Author */}
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Autor
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                            {post.author.name.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body1" fontWeight="bold">
                                                {post.author.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Autor
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Categories */}
                            {post.categories && post.categories.length > 0 && (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Categorías
                                        </Typography>
                                        
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            {post.categories.map((category) => (
                                                <Chip
                                                    key={category.id}
                                                    label={category.name}
                                                    sx={{
                                                        backgroundColor: category.color,
                                                        color: 'white',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Tags
                                        </Typography>
                                        
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            {post.tags.map((tag) => (
                                                <Chip
                                                    key={tag.id}
                                                    label={tag.name}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        borderColor: tag.color,
                                                        color: tag.color
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Dates */}
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Fechas
                                    </Typography>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                                            Creado:
                                        </Typography>
                                        <Typography variant="body2">
                                            {formatDate(post.created_at)}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                                            Última actualización:
                                        </Typography>
                                        <Typography variant="body2">
                                            {formatDate(post.updated_at)}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </AdminLayout>
    );
};

export default ShowPost;
