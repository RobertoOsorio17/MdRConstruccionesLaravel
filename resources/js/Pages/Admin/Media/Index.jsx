import React, { useState, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Box,
    Container,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    FormControl,
    InputLabel,
    Select,
    Checkbox,
    Fab,
    Paper,
    Stack,
    useTheme,
    alpha,
    Pagination,
    LinearProgress,
    Alert
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Search as SearchIcon,
    Delete as DeleteIcon,
    MoreVert as MoreIcon,
    Image as ImageIcon,
    VideoFile as VideoIcon,
    Description as DocumentIcon,
    InsertDriveFile as FileIcon,
    Add as AddIcon,
    SelectAll as SelectAllIcon,
    Clear as ClearIcon,
    GetApp as DownloadIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import AdminLayout from '@/Layouts/AdminLayout';

const MediaIndex = ({ files, pagination, filters, stats }) => {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleSearch = () => {
        router.get('/admin/media', {
            search: searchTerm,
            type: selectedType,
            page: 1
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilter = (key, value) => {
        router.get('/admin/media', {
            ...filters,
            [key]: value,
            page: 1
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFileSelect = (file) => {
        setSelectedFiles(prev => {
            const isSelected = prev.some(f => f.path === file.path);
            if (isSelected) {
                return prev.filter(f => f.path !== file.path);
            } else {
                return [...prev, file];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedFiles.length === files.length) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles([...files]);
        }
    };

    const handleMenuOpen = (event, file) => {
        setAnchorEl(event.currentTarget);
        setSelectedFile(file);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedFile(null);
    };

    const handleDelete = async (filesToDelete = null) => {
        const files = filesToDelete || [selectedFile];
        
        try {
            if (files.length === 1) {
                await fetch('/admin/media/delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({ path: files[0].path }),
                });
            } else {
                await fetch('/admin/media/bulk-delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({ files: files.map(f => f.path) }),
                });
            }
            
            router.reload({ only: ['files', 'stats'] });
            setSelectedFiles([]);
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error('Error deleting files:', error);
        }
        handleMenuClose();
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        setUploading(true);
        setUploadProgress(0);

        for (let i = 0; i < acceptedFiles.length; i++) {
            const file = acceptedFiles[i];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'uploads');

            try {
                await fetch('/admin/media/upload', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: formData,
                });
                
                setUploadProgress(((i + 1) / acceptedFiles.length) * 100);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }

        setUploading(false);
        setUploadProgress(0);
        setUploadDialogOpen(false);
        router.reload({ only: ['files', 'stats'] });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.svg', '.webp'],
            'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/*': ['.txt']
        },
        maxSize: 10485760, // 10MB
        multiple: true
    });

    const getFileIcon = (type) => {
        switch (type) {
            case 'image': return <ImageIcon />;
            case 'video': return <VideoIcon />;
            case 'document': return <DocumentIcon />;
            default: return <FileIcon />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'image': return 'success';
            case 'video': return 'info';
            case 'document': return 'warning';
            default: return 'default';
        }
    };

    return (
        <AdminLayout>
            <Head title="Gestión de Medios - Admin" />

            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Gestión de Medios
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Administra archivos, imágenes y documentos
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        {selectedFiles.length > 0 && (
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                Eliminar ({selectedFiles.length})
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            startIcon={<UploadIcon />}
                            onClick={() => setUploadDialogOpen(true)}
                            size="large"
                            sx={{ borderRadius: 3 }}
                        >
                            Subir Archivos
                        </Button>
                    </Stack>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper 
                            sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
                                color: 'white'
                            }}
                        >
                            <Typography variant="h3" fontWeight="bold">
                                {stats.total_files}
                            </Typography>
                            <Typography variant="body1">
                                Total Archivos
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper 
                            sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${alpha(theme.palette.success.main, 0.8)} 100%)`,
                                color: 'white'
                            }}
                        >
                            <Typography variant="h3" fontWeight="bold">
                                {stats.images}
                            </Typography>
                            <Typography variant="body1">
                                Imágenes
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper 
                            sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${alpha(theme.palette.info.main, 0.8)} 100%)`,
                                color: 'white'
                            }}
                        >
                            <Typography variant="h3" fontWeight="bold">
                                {stats.documents}
                            </Typography>
                            <Typography variant="body1">
                                Documentos
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper 
                            sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${alpha(theme.palette.warning.main, 0.8)} 100%)`,
                                color: 'white'
                            }}
                        >
                            <Typography variant="body1" fontWeight="bold">
                                {stats.total_size}
                            </Typography>
                            <Typography variant="body2">
                                Espacio Usado
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                placeholder="Buscar archivos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Tipo</InputLabel>
                                <Select
                                    value={selectedType}
                                    label="Tipo"
                                    onChange={(e) => {
                                        setSelectedType(e.target.value);
                                        handleFilter('type', e.target.value);
                                    }}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="image">Imágenes</MenuItem>
                                    <MenuItem value="video">Videos</MenuItem>
                                    <MenuItem value="document">Documentos</MenuItem>
                                    <MenuItem value="other">Otros</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button
                                variant="outlined"
                                startIcon={selectedFiles.length === files.length ? <ClearIcon /> : <SelectAllIcon />}
                                onClick={handleSelectAll}
                                fullWidth
                            >
                                {selectedFiles.length === files.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                variant="contained"
                                onClick={handleSearch}
                                fullWidth
                            >
                                Buscar
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Files Grid */}
                <Grid container spacing={3}>
                    <AnimatePresence>
                        {files.map((file, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={file.path}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card 
                                        sx={{ 
                                            height: '100%',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            border: selectedFiles.some(f => f.path === file.path) ? 
                                                `2px solid ${theme.palette.primary.main}` : 
                                                `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: theme.shadows[8],
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                        onClick={() => handleFileSelect(file)}
                                    >
                                        <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
                                            <Checkbox
                                                checked={selectedFiles.some(f => f.path === file.path)}
                                                onChange={() => handleFileSelect(file)}
                                                onClick={(e) => e.stopPropagation()}
                                                sx={{
                                                    color: 'white',
                                                    backgroundColor: alpha(theme.palette.common.black, 0.5),
                                                    borderRadius: 1,
                                                    '&.Mui-checked': {
                                                        color: theme.palette.primary.main,
                                                        backgroundColor: 'white',
                                                    }
                                                }}
                                            />
                                        </Box>
                                        
                                        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMenuOpen(e, file);
                                                }}
                                                sx={{
                                                    color: 'white',
                                                    backgroundColor: alpha(theme.palette.common.black, 0.5),
                                                    '&:hover': {
                                                        backgroundColor: alpha(theme.palette.common.black, 0.7),
                                                    }
                                                }}
                                            >
                                                <MoreIcon />
                                            </IconButton>
                                        </Box>

                                        {file.type === 'image' ? (
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={file.url}
                                                alt={file.name}
                                                sx={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    height: 200,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                    color: theme.palette.primary.main
                                                }}
                                            >
                                                <Box sx={{ fontSize: 64 }}>
                                                    {getFileIcon(file.type)}
                                                </Box>
                                            </Box>
                                        )}

                                        <CardContent>
                                            <Typography variant="subtitle2" noWrap gutterBottom>
                                                {file.name}
                                            </Typography>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Chip
                                                    label={file.type}
                                                    size="small"
                                                    color={getTypeColor(file.type)}
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    {file.formatted_size}
                                                </Typography>
                                            </Stack>
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                {file.formatted_date}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </AnimatePresence>
                </Grid>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={pagination.last_page}
                            page={pagination.current_page}
                            onChange={(event, page) => {
                                router.get('/admin/media', {
                                    ...filters,
                                    page
                                }, {
                                    preserveState: true,
                                    preserveScroll: true,
                                });
                            }}
                            color="primary"
                            size="large"
                        />
                    </Box>
                )}

                {/* Upload Dialog */}
                <Dialog
                    open={uploadDialogOpen}
                    onClose={() => setUploadDialogOpen(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>Subir Archivos</DialogTitle>
                    <DialogContent>
                        <Box
                            {...getRootProps()}
                            sx={{
                                border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
                                borderRadius: 2,
                                p: 4,
                                textAlign: 'center',
                                cursor: 'pointer',
                                backgroundColor: isDragActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                }
                            }}
                        >
                            <input {...getInputProps()} />
                            <UploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí o haz clic para seleccionar'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Máximo 10MB por archivo. Formatos soportados: imágenes, videos, documentos
                            </Typography>
                        </Box>
                        
                        {uploading && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="body2" gutterBottom>
                                    Subiendo archivos... {Math.round(uploadProgress)}%
                                </Typography>
                                <LinearProgress variant="determinate" value={uploadProgress} />
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setUploadDialogOpen(false)}>
                            Cancelar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                >
                    <DialogTitle>Confirmar Eliminación</DialogTitle>
                    <DialogContent>
                        <Typography>
                            ¿Estás seguro de que quieres eliminar {selectedFiles.length} archivo(s)? 
                            Esta acción no se puede deshacer.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button 
                            onClick={() => handleDelete(selectedFiles)} 
                            color="error" 
                            variant="contained"
                        >
                            Eliminar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Context Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => window.open(selectedFile?.url, '_blank')}>
                        <DownloadIcon sx={{ mr: 1 }} />
                        Ver/Descargar
                    </MenuItem>
                    <MenuItem onClick={() => navigator.clipboard.writeText(selectedFile?.url)}>
                        <DownloadIcon sx={{ mr: 1 }} />
                        Copiar URL
                    </MenuItem>
                    <MenuItem onClick={() => handleDelete()} sx={{ color: 'error.main' }}>
                        <DeleteIcon sx={{ mr: 1 }} />
                        Eliminar
                    </MenuItem>
                </Menu>
            </Container>
        </AdminLayout>
    );
};

export default MediaIndex;
