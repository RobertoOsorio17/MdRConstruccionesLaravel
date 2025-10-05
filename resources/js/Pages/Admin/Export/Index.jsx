import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';
import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Stack,
    Chip,
    alpha,
} from '@mui/material';
import {
    Download as DownloadIcon,
    Article as ArticleIcon,
    Comment as CommentIcon,
    People as PeopleIcon,
    PictureAsPdf as PdfIcon,
    TableChart as ExcelIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function ExportIndex({ stats }) {
    const [postsFilters, setPostsFilters] = useState({
        format: 'xlsx',
        status: '',
        date_from: '',
        date_to: '',
    });

    const [commentsFilters, setCommentsFilters] = useState({
        format: 'xlsx',
        status: '',
        date_from: '',
        date_to: '',
    });

    const [usersFilters, setUsersFilters] = useState({
        format: 'xlsx',
        role: '',
        date_from: '',
        date_to: '',
    });

    const handleExportPosts = (format) => {
        const params = { ...postsFilters, format };
        window.location.href = route('admin.export.posts', params);
    };

    const handleExportComments = (format) => {
        const params = { ...commentsFilters, format };
        window.location.href = route('admin.export.comments', params);
    };

    const handleExportUsers = () => {
        window.location.href = route('admin.export.users', usersFilters);
    };

    const glassStyle = {
        background: alpha('#ffffff', 0.7),
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: `1px solid ${alpha('#ffffff', 0.3)}`,
        boxShadow: `0 8px 32px 0 ${alpha('#000000', 0.1)}`,
    };

    return (
        <AdminLayoutNew>
            <Head title="Exportar Datos" />

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography
                        variant="h3"
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 4,
                        }}
                    >
                        Exportar Datos
                    </Typography>
                </motion.div>

                <Grid container spacing={3}>
                    {/* Posts Export */}
                    <Grid item xs={12} md={4}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <Card elevation={0} sx={glassStyle}>
                                <CardContent>
                                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                        <ArticleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                        <Box>
                                            <Typography variant="h5" fontWeight={600}>
                                                Posts
                                            </Typography>
                                            <Chip label={`${stats.posts} registros`} size="small" color="primary" />
                                        </Box>
                                    </Stack>

                                    <Stack spacing={2}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Estado</InputLabel>
                                            <Select
                                                value={postsFilters.status}
                                                label="Estado"
                                                onChange={(e) => setPostsFilters({ ...postsFilters, status: e.target.value })}
                                            >
                                                <MenuItem value="">Todos</MenuItem>
                                                <MenuItem value="draft">Borrador</MenuItem>
                                                <MenuItem value="published">Publicado</MenuItem>
                                                <MenuItem value="archived">Archivado</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <TextField
                                            label="Desde"
                                            type="date"
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            value={postsFilters.date_from}
                                            onChange={(e) => setPostsFilters({ ...postsFilters, date_from: e.target.value })}
                                        />

                                        <TextField
                                            label="Hasta"
                                            type="date"
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            value={postsFilters.date_to}
                                            onChange={(e) => setPostsFilters({ ...postsFilters, date_to: e.target.value })}
                                        />
                                    </Stack>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<ExcelIcon />}
                                        onClick={() => handleExportPosts('xlsx')}
                                    >
                                        Excel
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<PdfIcon />}
                                        onClick={() => window.location.href = route('admin.export.posts.pdf', postsFilters)}
                                    >
                                        PDF
                                    </Button>
                                </CardActions>
                            </Card>
                        </motion.div>
                    </Grid>

                    {/* Comments Export */}
                    <Grid item xs={12} md={4}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card elevation={0} sx={glassStyle}>
                                <CardContent>
                                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                        <CommentIcon sx={{ fontSize: 40, color: 'success.main' }} />
                                        <Box>
                                            <Typography variant="h5" fontWeight={600}>
                                                Comentarios
                                            </Typography>
                                            <Chip label={`${stats.comments} registros`} size="small" color="success" />
                                        </Box>
                                    </Stack>

                                    <Stack spacing={2}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Estado</InputLabel>
                                            <Select
                                                value={commentsFilters.status}
                                                label="Estado"
                                                onChange={(e) => setCommentsFilters({ ...commentsFilters, status: e.target.value })}
                                            >
                                                <MenuItem value="">Todos</MenuItem>
                                                <MenuItem value="pending">Pendiente</MenuItem>
                                                <MenuItem value="approved">Aprobado</MenuItem>
                                                <MenuItem value="rejected">Rechazado</MenuItem>
                                                <MenuItem value="spam">Spam</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <TextField
                                            label="Desde"
                                            type="date"
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            value={commentsFilters.date_from}
                                            onChange={(e) => setCommentsFilters({ ...commentsFilters, date_from: e.target.value })}
                                        />

                                        <TextField
                                            label="Hasta"
                                            type="date"
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            value={commentsFilters.date_to}
                                            onChange={(e) => setCommentsFilters({ ...commentsFilters, date_to: e.target.value })}
                                        />
                                    </Stack>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="success"
                                        startIcon={<ExcelIcon />}
                                        onClick={() => handleExportComments('xlsx')}
                                    >
                                        Excel
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        color="success"
                                        startIcon={<PdfIcon />}
                                        onClick={() => window.location.href = route('admin.export.comments.pdf', commentsFilters)}
                                    >
                                        PDF
                                    </Button>
                                </CardActions>
                            </Card>
                        </motion.div>
                    </Grid>

                    {/* Users Export */}
                    <Grid item xs={12} md={4}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Card elevation={0} sx={glassStyle}>
                                <CardContent>
                                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                        <PeopleIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                                        <Box>
                                            <Typography variant="h5" fontWeight={600}>
                                                Usuarios
                                            </Typography>
                                            <Chip label={`${stats.users} registros`} size="small" color="warning" />
                                        </Box>
                                    </Stack>

                                    <Stack spacing={2}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Rol</InputLabel>
                                            <Select
                                                value={usersFilters.role}
                                                label="Rol"
                                                onChange={(e) => setUsersFilters({ ...usersFilters, role: e.target.value })}
                                            >
                                                <MenuItem value="">Todos</MenuItem>
                                                <MenuItem value="admin">Admin</MenuItem>
                                                <MenuItem value="editor">Editor</MenuItem>
                                                <MenuItem value="user">Usuario</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <TextField
                                            label="Desde"
                                            type="date"
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            value={usersFilters.date_from}
                                            onChange={(e) => setUsersFilters({ ...usersFilters, date_from: e.target.value })}
                                        />

                                        <TextField
                                            label="Hasta"
                                            type="date"
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            value={usersFilters.date_to}
                                            onChange={(e) => setUsersFilters({ ...usersFilters, date_to: e.target.value })}
                                        />
                                    </Stack>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="warning"
                                        startIcon={<ExcelIcon />}
                                        onClick={handleExportUsers}
                                    >
                                        Excel
                                    </Button>
                                </CardActions>
                            </Card>
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>
        </AdminLayoutNew>
    );
}

