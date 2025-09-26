import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    CardActions,
    Grid,
    Pagination,
    InputAdornment,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Chip,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Avatar,
    useTheme,
    alpha,
    Divider
} from '@mui/material';
import {
    Search as SearchIcon,
    PersonRemove as PersonRemoveIcon,
    Visibility as ViewIcon,
    People as PeopleIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
    LocationOn as LocationIcon,
    Work as WorkIcon,
    Article as ArticleIcon,
    Group as GroupIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useNotification } from '@/Context/NotificationContext';

const UserCard = ({ user, onUnfollow }) => {
    const [unfollowDialogOpen, setUnfollowDialogOpen] = useState(false);
    const theme = useTheme();

    const handleUnfollow = async () => {
        await onUnfollow(user.id);
        setUnfollowDialogOpen(false);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <Card 
                    sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        '&:hover': { 
                            boxShadow: 4,
                            transform: 'translateY(-4px)',
                            transition: 'all 0.3s ease'
                        } 
                    }}
                >
                    <CardContent sx={{ flex: 1, textAlign: 'center' }}>
                        <Box mb={2}>
                            <Avatar 
                                src={user.avatar_url}
                                alt={user.name}
                                sx={{ 
                                    width: 80, 
                                    height: 80, 
                                    mx: 'auto',
                                    mb: 2,
                                    border: `3px solid ${theme.palette.primary.main}`,
                                    fontSize: '2rem'
                                }}
                            >
                                {user.name.charAt(0)}
                            </Avatar>
                        </Box>

                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            {user.name}
                        </Typography>

                        {user.profession && (
                            <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                                <WorkIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                    {user.profession}
                                </Typography>
                            </Box>
                        )}

                        {user.bio && (
                            <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    mb: 2,
                                    minHeight: '3.6em'
                                }}
                            >
                                {user.bio}
                            </Typography>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2} justifyContent="center">
                            <Grid item xs={6}>
                                <Box textAlign="center">
                                    <Typography variant="h6" color="primary" fontWeight="bold">
                                        {user.posts_count || 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Posts
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box textAlign="center">
                                    <Typography variant="h6" color="primary" fontWeight="bold">
                                        {user.followers_count || 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Seguidores
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                        <Button
                            component={Link}
                            href={`/user/${user.id}`}
                            size="small"
                            startIcon={<ViewIcon />}
                            variant="contained"
                        >
                            Ver Perfil
                        </Button>
                        <Button
                            size="small"
                            color="error"
                            startIcon={<PersonRemoveIcon />}
                            onClick={() => setUnfollowDialogOpen(true)}
                        >
                            Dejar de Seguir
                        </Button>
                    </CardActions>
                </Card>
            </motion.div>

            <Dialog
                open={unfollowDialogOpen}
                onClose={() => setUnfollowDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    ¿Dejar de seguir a {user.name}?
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" alignItems="center" mb={2}>
                        <Avatar 
                            src={user.avatar_url}
                            alt={user.name}
                            sx={{ mr: 2 }}
                        >
                            {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {user.name}
                            </Typography>
                            {user.profession && (
                                <Typography variant="body2" color="text.secondary">
                                    {user.profession}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <Typography>
                        Ya no recibirás notificaciones de los nuevos posts de este autor.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUnfollowDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleUnfollow} color="error" variant="contained">
                        Dejar de Seguir
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const FilterBar = ({ filters, onFiltersChange }) => {
    const [localSearch, setLocalSearch] = useState(filters.search || '');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onFiltersChange({ ...filters, search: localSearch });
    };

    const handleClearSearch = () => {
        setLocalSearch('');
        onFiltersChange({ ...filters, search: '' });
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
                <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                    Filtros
                </Typography>
            </Box>

            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                    <form onSubmit={handleSearchSubmit}>
                        <TextField
                            fullWidth
                            placeholder="Buscar usuarios que sigues..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: localSearch && (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleClearSearch} size="small">
                                            <ClearIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </form>
                </Grid>
                <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Por página</InputLabel>
                        <Select
                            value={filters.per_page || 12}
                            label="Por página"
                            onChange={(e) => onFiltersChange({ ...filters, per_page: e.target.value })}
                        >
                            <MenuItem value={6}>6</MenuItem>
                            <MenuItem value={12}>12</MenuItem>
                            <MenuItem value={24}>24</MenuItem>
                            <MenuItem value={48}>48</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleSearchSubmit}
                    >
                        Buscar
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
};

const StatsSection = ({ following }) => {
    const theme = useTheme();
    
    const totalPosts = following.data.reduce((sum, user) => sum + (user.posts_count || 0), 0);
    const avgFollowers = following.data.length > 0 
        ? Math.round(following.data.reduce((sum, user) => sum + (user.followers_count || 0), 0) / following.data.length)
        : 0;

    return (
        <Paper sx={{ p: 3, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
                Resumen de Seguimiento
            </Typography>
            
            <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                        <Typography variant="h4" color="primary" fontWeight="bold">
                            {following.total}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Usuarios que sigues
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                        <Typography variant="h4" color="secondary" fontWeight="bold">
                            {totalPosts}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Posts totales
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                        <Typography variant="h4" color="success.main" fontWeight="bold">
                            {avgFollowers}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Promedio de seguidores
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default function Following({ following, filters }) {
    const { showNotification } = useNotification();

    const handleFiltersChange = (newFilters) => {
        const params = { ...newFilters };
        
        // Remove empty values
        Object.keys(params).forEach(key => 
            (params[key] === '' || params[key] === null || params[key] === undefined) && delete params[key]
        );

        router.get('/my/following', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleUnfollowUser = async (userId) => {
        try {
            const response = await fetch(`/my/following/${userId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification(data.message, 'success');
                router.reload({ only: ['following'] });
            } else {
                showNotification(data.message || 'Error al dejar de seguir', 'error');
            }
        } catch (error) {
            showNotification('Error al dejar de seguir', 'error');
        }
    };

    const handlePageChange = (event, page) => {
        handleFiltersChange({ ...filters, page });
    };

    return (
        <AuthenticatedLayout
            header={
                <Box display="flex" alignItems="center">
                    <PeopleIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1">
                        Usuarios que Sigo
                    </Typography>
                </Box>
            }
        >
            <Head title="Usuarios que Sigo" />

            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Stats Section */}
                <StatsSection following={following} />

                {/* Filters */}
                <FilterBar 
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                />

                {/* Users Grid */}
                <Box mb={4}>
                    {following.data.length === 0 ? (
                        <Alert severity="info" sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                No se encontraron usuarios
                            </Typography>
                            <Typography>
                                {filters.search 
                                    ? 'Intenta con otros términos de búsqueda' 
                                    : 'Aún no sigues a ningún usuario'
                                }
                            </Typography>
                            {!filters.search && (
                                <Button
                                    component={Link}
                                    href="/blog"
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                >
                                    Explorar Autores
                                </Button>
                            )}
                        </Alert>
                    ) : (
                        <Grid container spacing={3}>
                            {following.data.map((user) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
                                    <UserCard
                                        user={user}
                                        onUnfollow={handleUnfollowUser}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>

                {/* Pagination */}
                {following.last_page > 1 && (
                    <Box display="flex" justifyContent="center">
                        <Pagination
                            count={following.last_page}
                            page={following.current_page}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                        />
                    </Box>
                )}
            </Container>
        </AuthenticatedLayout>
    );
}