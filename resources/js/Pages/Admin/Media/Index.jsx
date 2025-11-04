import React, { useState, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Grid,
    Card,
    CardMedia,
    CardContent,
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
    Stack,
    Pagination,
    LinearProgress,
    Alert,
    Tooltip,
    Snackbar,
    Divider,
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
    SelectAll as SelectAllIcon,
    Clear as ClearIcon,
    GetApp as DownloadIcon,
    ContentCopy as CopyIcon,
    PhotoLibrary as PhotoLibraryIcon,
    Folder as FolderIcon,
    AccessTime,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';

const MediaIndex = () => {
    const { files, pagination, filters, stats } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    // Glassmorphism styles
    const glassmorphismCard = {
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    };

    const statsCardStyle = {
        ...glassmorphismCard,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 16px 48px 0 rgba(31, 38, 135, 0.6)',
        },
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
        },
        '&:hover::before': {
            opacity: 1,
        },
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    const handleSnackbarClose = (_, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar(prev => ({
            ...prev,
            open: false,
        }));
    };

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
        const filesToRemove = filesToDelete || [selectedFile];

        try {
            if (filesToRemove.length === 1) {
                const response = await fetch('/admin/media/delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({ path: filesToRemove[0].path }),
                });
                const data = await response.json();
                if (data.success) {
                    showSnackbar('Archivo eliminado correctamente', 'success');
                } else {
                    showSnackbar(data.message || 'Error al eliminar archivo', 'error');
                }
            } else {
                const response = await fetch('/admin/media/bulk-delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({ files: filesToRemove.map(f => f.path) }),
                });
                const data = await response.json();
                if (data.success) {
                    showSnackbar(`${data.deleted_count} archivo(s) eliminado(s) correctamente`, 'success');
                } else {
                    showSnackbar(data.message || 'Error al eliminar archivos', 'error');
                }
            }

            router.reload({ only: ['files', 'stats'] });
            setSelectedFiles([]);
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error('Error deleting files:', error);
            showSnackbar('Error al eliminar archivos', 'error');
        }
        handleMenuClose();
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) {
            showSnackbar('No se seleccionaron archivos válidos', 'warning');
            return;
        }

        // Validar tamaño de archivos (20MB máximo)
        const maxSize = 20 * 1024 * 1024; // 20MB en bytes
        const oversizedFiles = acceptedFiles.filter(file => file.size > maxSize);

        if (oversizedFiles.length > 0) {
            const fileNames = oversizedFiles.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`).join(', ');
            showSnackbar(`Archivos demasiado grandes (máx 20MB): ${fileNames}`, 'error');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        let successCount = 0;
        let errorCount = 0;
        let errors = [];

        for (let i = 0; i < acceptedFiles.length; i++) {
            const file = acceptedFiles[i];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'uploads');

            try {
                const response = await fetch('/admin/media/upload', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: formData,
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    successCount++;
                } else {
                    errorCount++;
                    // Log detailed error for debugging
                    console.error('Upload error for', file.name, ':', data);
                    const errorMsg = data.message || data.errors?.file?.[0] || 'Error desconocido';
                    errors.push(`${file.name}: ${errorMsg}`);
                }

                setUploadProgress(((i + 1) / acceptedFiles.length) * 100);
            } catch (error) {
                console.error('Error uploading file:', error);
                errorCount++;
                errors.push(`${file.name}: Error de red`);
            }
        }

        setUploading(false);
        setUploadProgress(0);
        setUploadDialogOpen(false);

        // Show results
        if (successCount > 0) {
            showSnackbar(`${successCount} archivo(s) subido(s) exitosamente`, 'success');
            router.reload({ only: ['files', 'stats'] });
        }

        if (errorCount > 0) {
            showSnackbar(`${errorCount} archivo(s) fallaron. ${errors[0] || ''}`, 'error');
        }
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
        <AdminLayoutNew
            title="Gestión de Medios"
            subtitle="Administra archivos, imágenes y videos para tus publicaciones"
            icon={<PhotoLibraryIcon sx={{ fontSize: 40 }} />}
        >
            <Head title="Gestión de Medios - Admin" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <motion.div variants={itemVariants}>
                            <Card sx={statsCardStyle}>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography variant="h3" fontWeight="bold" color="primary">
                                                {stats.total_files}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Archivos
                                            </Typography>
                                        </Box>
                                        <FolderIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <motion.div variants={itemVariants}>
                            <Card sx={statsCardStyle}>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography variant="h3" fontWeight="bold" color="success.main">
                                                {stats.images}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Imágenes
                                            </Typography>
                                        </Box>
                                        <ImageIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <motion.div variants={itemVariants}>
                            <Card sx={statsCardStyle}>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography variant="h3" fontWeight="bold" color="info.main">
                                                {stats.videos}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Videos
                                            </Typography>
                                        </Box>
                                        <VideoIcon sx={{ fontSize: 48, color: 'info.main', opacity: 0.3 }} />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <motion.div variants={itemVariants}>
                            <Card sx={statsCardStyle}>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography variant="h4" fontWeight="bold" color="warning.main">
                                                {stats.total_size}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Espacio Usado
                                            </Typography>
                                        </Box>
                                        <DocumentIcon sx={{ fontSize: 48, color: 'warning.main', opacity: 0.3 }} />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                </Grid>

                {/* Filters and Actions */}
                <Card sx={{ ...glassmorphismCard, mb: 4 }}>
                    <CardContent>
                        <Grid container spacing={3} alignItems="center">
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Buscar archivos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                    size="small"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Tipo de Archivo</InputLabel>
                                    <Select
                                        value={selectedType}
                                        label="Tipo de Archivo"
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
                            <Grid size={{ xs: 12, md: 5 }}>
                                <Stack direction="row" spacing={2} justifyContent="flex-end">
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
                                        variant="outlined"
                                        startIcon={selectedFiles.length === files.length ? <ClearIcon /> : <SelectAllIcon />}
                                        onClick={handleSelectAll}
                                    >
                                        {selectedFiles.length === files.length ? 'Deseleccionar' : 'Seleccionar Todo'}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<UploadIcon />}
                                        onClick={() => setUploadDialogOpen(true)}
                                    >
                                        Subir Archivos
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Files Grid */}
                <Grid container spacing={3}>
                    {files.map((file, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={file.path}>
                            <motion.div
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card
                                    sx={{
                                        ...glassmorphismCard,
                                        height: '100%',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        border: selectedFiles.some(f => f.path === file.path) ?
                                            '3px solid' :
                                            '1px solid rgba(255, 255, 255, 0.18)',
                                        borderColor: selectedFiles.some(f => f.path === file.path) ?
                                            'primary.main' :
                                            'rgba(255, 255, 255, 0.18)',
                                        overflow: 'hidden',
                                        '&:hover': {
                                            transform: 'translateY(-8px) scale(1.02)',
                                            boxShadow: '0 16px 48px 0 rgba(31, 38, 135, 0.6)',
                                            borderColor: 'primary.light',
                                        },
                                        '&:hover .file-overlay': {
                                            opacity: 1,
                                        },
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&::after': selectedFiles.some(f => f.path === file.path) ? {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, transparent 100%)',
                                            pointerEvents: 'none',
                                        } : {},
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
                                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                borderRadius: 1,
                                                '&.Mui-checked': {
                                                    color: 'primary.main',
                                                    backgroundColor: 'white',
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                                        <Tooltip title="Opciones">
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMenuOpen(e, file);
                                                }}
                                                sx={{
                                                    color: 'white',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                                    }
                                                }}
                                            >
                                                <MoreIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>

                                    {file.type === 'image' ? (
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={file.url}
                                            alt={file.name}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                    ) : file.type === 'video' ? (
                                        <Box
                                            sx={{
                                                height: 200,
                                                position: 'relative',
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                            }}
                                        >
                                            <video
                                                src={file.url}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    color: 'white',
                                                    fontSize: 48,
                                                    opacity: 0.7
                                                }}
                                            >
                                                <VideoIcon sx={{ fontSize: 64 }} />
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                height: 200,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0.05))',
                                                color: 'primary.main'
                                            }}
                                        >
                                            <Box sx={{ fontSize: 64 }}>
                                                {getFileIcon(file.type)}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Hover Overlay */}
                                    <Box
                                        className="file-overlay"
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: 200,
                                            background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease',
                                            pointerEvents: 'none',
                                            zIndex: 0,
                                        }}
                                    />

                                    <CardContent sx={{
                                        position: 'relative',
                                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                                        backdropFilter: 'blur(10px)',
                                    }}>
                                        <Tooltip title={file.name} placement="top">
                                            <Typography
                                                variant="subtitle2"
                                                noWrap
                                                gutterBottom
                                                sx={{
                                                    fontWeight: 600,
                                                    color: 'text.primary',
                                                }}
                                            >
                                                {file.name}
                                            </Typography>
                                        </Tooltip>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                            <Chip
                                                label={file.type.toUpperCase()}
                                                size="small"
                                                color={getTypeColor(file.type)}
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem',
                                                }}
                                            />
                                            <Chip
                                                label={file.formatted_size}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    fontSize: '0.7rem',
                                                    borderColor: 'rgba(0, 0, 0, 0.2)',
                                                }}
                                            />
                                        </Stack>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            display="flex"
                                            alignItems="center"
                                            gap={0.5}
                                            sx={{
                                                fontSize: '0.7rem',
                                            }}
                                        >
                                            <AccessTime sx={{ fontSize: 14 }} />
                                            {file.formatted_date}
                                        </Typography>
                                    </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                </Grid>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={pagination.last_page}
                            page={pagination.current_page}
                            onChange={(_, page) => {
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
                    onClose={() => !uploading && setUploadDialogOpen(false)}
                    maxWidth="md"
                    fullWidth
                    slotProps={{
                        paper: {
                            sx: {
                                ...glassmorphismCard,
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
                            }
                        }
                    }}
                >
                    <DialogTitle sx={{
                        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                        pb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <UploadIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                Subir Archivos
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Arrastra y suelta o haz clic para seleccionar
                            </Typography>
                        </Box>
                    </DialogTitle>
                    <DialogContent sx={{ mt: 3 }}>
                        <Box
                            {...getRootProps()}
                            sx={{
                                border: isDragActive ? '3px dashed' : '2px dashed',
                                borderColor: isDragActive ? 'primary.main' : 'rgba(0, 0, 0, 0.12)',
                                borderRadius: 3,
                                p: 6,
                                textAlign: 'center',
                                cursor: uploading ? 'not-allowed' : 'pointer',
                                background: isDragActive
                                    ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.15), rgba(25, 118, 210, 0.05))'
                                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(240, 240, 240, 0.3))',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.08), rgba(25, 118, 210, 0.02))',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: isDragActive
                                        ? 'radial-gradient(circle at center, rgba(25, 118, 210, 0.1) 0%, transparent 70%)'
                                        : 'none',
                                    pointerEvents: 'none',
                                }
                            }}
                        >
                            <input {...getInputProps()} disabled={uploading} />

                            <motion.div
                                animate={{
                                    scale: isDragActive ? 1.1 : 1,
                                    rotate: isDragActive ? 5 : 0,
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                <UploadIcon sx={{
                                    fontSize: 80,
                                    color: isDragActive ? 'primary.main' : 'text.secondary',
                                    mb: 2,
                                    filter: isDragActive ? 'drop-shadow(0 4px 8px rgba(25, 118, 210, 0.3))' : 'none',
                                    transition: 'all 0.3s ease',
                                }} />
                            </motion.div>

                            <Typography variant="h5" fontWeight="600" gutterBottom sx={{
                                color: isDragActive ? 'primary.main' : 'text.primary',
                                transition: 'color 0.3s ease',
                            }}>
                                {isDragActive ? '¡Suelta los archivos aquí!' : 'Arrastra archivos aquí'}
                            </Typography>

                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                o haz clic para seleccionar desde tu dispositivo
                            </Typography>

                            <Box sx={{
                                display: 'flex',
                                gap: 2,
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                mb: 2
                            }}>
                                <Chip
                                    icon={<ImageIcon />}
                                    label="Imágenes"
                                    size="small"
                                    variant="outlined"
                                    sx={{ borderColor: 'primary.main', color: 'primary.main' }}
                                />
                                <Chip
                                    icon={<VideoIcon />}
                                    label="Videos"
                                    size="small"
                                    variant="outlined"
                                    sx={{ borderColor: 'info.main', color: 'info.main' }}
                                />
                                <Chip
                                    icon={<DocumentIcon />}
                                    label="Documentos"
                                    size="small"
                                    variant="outlined"
                                    sx={{ borderColor: 'success.main', color: 'success.main' }}
                                />
                            </Box>

                            <Typography variant="caption" color="text.secondary" sx={{
                                display: 'block',
                                mt: 2,
                                p: 1.5,
                                borderRadius: 1,
                                background: 'rgba(0, 0, 0, 0.03)',
                            }}>
                                📁 Máximo 10MB por archivo<br />
                                ✅ Formatos: JPEG, PNG, GIF, WebP, MP4, WebM, PDF
                            </Typography>
                        </Box>

                        {uploading && (
                            <Box sx={{ mt: 4 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                                    <Typography variant="body2" fontWeight="600" color="primary">
                                        Subiendo archivos...
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold" color="primary">
                                        {Math.round(uploadProgress)}%
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={uploadProgress}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 4,
                                            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                                        }
                                    }}
                                />
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                        <Button
                            onClick={() => setUploadDialogOpen(false)}
                            disabled={uploading}
                            variant="outlined"
                        >
                            {uploading ? 'Subiendo...' : 'Cancelar'}
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

                {/* File Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem
                        onClick={() => {
                            navigator.clipboard.writeText(selectedFile?.url || '');
                            showSnackbar('URL copiada al portapapeles', 'success');
                            handleMenuClose();
                        }}
                    >
                        <CopyIcon sx={{ mr: 1 }} fontSize="small" />
                        Copiar URL
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            window.open(selectedFile?.url, '_blank');
                            handleMenuClose();
                        }}
                    >
                        <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
                        Descargar
                    </MenuItem>
                    <Divider />
                    <MenuItem
                        onClick={() => {
                            setDeleteDialogOpen(true);
                            handleMenuClose();
                        }}
                        sx={{ color: 'error.main' }}
                    >
                        <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                        Eliminar
                    </MenuItem>
                </Menu>

                {/* Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleSnackbarClose}
                        severity={snackbar.severity}
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </motion.div>
        </AdminLayoutNew>
    );
};

export default MediaIndex;
