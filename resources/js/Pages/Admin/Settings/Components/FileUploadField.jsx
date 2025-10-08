import React, { useState, useCallback } from 'react';
import {
    Box,
    Button,
    Typography,
    IconButton,
    LinearProgress,
    Alert,
    Stack,
    alpha,
    Paper,
} from '@mui/material';
import {
    CloudUpload,
    Delete,
    Image as ImageIcon,
    CheckCircle as CheckCircleIcon,
    Visibility as VisibilityIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
// Normalize file path for preview
const normalizeFilePath = (path) => {
    if (!path) return null;

    // If already absolute URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // If starts with /storage, return as is
    if (path.startsWith('/storage/')) {
        return path;
    }

    // If starts with storage/, add leading slash
    if (path.startsWith('storage/')) {
        return `/${path}`;
    }

    // Otherwise, assume it needs /storage prefix
    return `/storage/${path.replace(/^\/+/, '')}`;
};

const FileUploadField = ({ settingKey, currentValue, accept = 'image/*', maxSize = 2048, onUploadSuccess, onChange }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState(normalizeFilePath(currentValue) || null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const sizeLimitBytes = maxSize * 1024;

    const displayLimit = maxSize >= 1024
        ? `${(maxSize / 1024).toFixed(maxSize % 1024 === 0 ? 0 : 1)}MB`
        : `${maxSize}KB`;

    const validateFile = (file) => {
        if (file.size > sizeLimitBytes) {
            return `El archivo no debe superar ${displayLimit}`;
        }

        const acceptedTypes = accept.split(',').map((type) => type.trim());
        const isAccepted = acceptedTypes.some((type) => {
            if (type === 'image/*') {
                return file.type.startsWith('image/');
            }
            return file.type === type;
        });

        if (!isAccepted) {
            return 'Tipo de archivo no permitido';
        }

        return null;
    };
    const handleFile = useCallback((file) => {
        setError(null);
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreview(event.target?.result || null);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(file.name);
        }

        setUploading(true);
        setProgress(0);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('key', settingKey);

        router.post('/admin/settings/upload', formData, {
            forceFormData: true,
            preserveScroll: true,
            onProgress: (event) => {
                if (event?.percentage !== undefined) {
                    setProgress(event.percentage);
                }
            },
            onSuccess: (page) => {
                setUploading(false);
                setProgress(100);
                setTimeout(() => setProgress(0), 400);

                // Extract the uploaded file path from response
                const uploadedPath = page.props?.flash?.uploadedPath || page.props?.uploadedPath;

                if (uploadedPath) {
                    const normalizedPath = normalizeFilePath(uploadedPath);
                    setPreview(normalizedPath);

                    if (onUploadSuccess) {
                        onUploadSuccess(uploadedPath);
                    }
                    if (onChange) {
                        onChange(uploadedPath);
                    }
                }

                router.reload({ only: ['settings', 'flash'], preserveScroll: true });
            },
            onError: (errors) => {
                setUploading(false);
                setProgress(0);
                setError(errors.file || 'Error al subir el archivo');
            },
        });
    }, [accept, onUploadSuccess, settingKey, sizeLimitBytes]);

    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((event) => {
        event.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((event) => {
        event.preventDefault();
        setIsDragging(false);
        const [file] = event.dataTransfer.files;
        if (file) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFile(file);
        }
        event.target.value = '';
    };

    const handleRemove = () => {
        setPreview(null);
        setError(null);

        // Notify parent to clear the value
        if (onChange) {
            onChange(null);
        }
    };

    const renderPreviewContent = () => {
        if (typeof preview === 'string' && preview.startsWith('data:image')) {
            return (
                <Box
                    component="img"
                    src={preview}
                    alt="Preview"
                    sx={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                    }}
                />
            );
        }

        if (typeof preview === 'string' && (preview.startsWith('/storage') || preview.startsWith('http'))) {
            return (
                <Box
                    component="img"
                    src={preview}
                    alt="Current file"
                    sx={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                    }}
                />
            );
        }

        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
                }}
            >
                <Stack spacing={1} alignItems="center">
                    <ImageIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                    <Typography variant="body2" color="text.secondary">
                        {preview}
                    </Typography>
                </Stack>
            </Box>
        );
    };

    const inputId = `file-input-${settingKey}`;
    return (
        <Stack spacing={2}>
            <input
                id={inputId}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            {preview ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Stack spacing={2} alignItems="flex-start">
                        <Paper
                            elevation={0}
                            sx={{
                                position: 'relative',
                                width: '100%',
                                maxWidth: 400,
                                borderRadius: 3,
                                overflow: 'hidden',
                                border: '1px solid',
                                borderColor: (theme) => alpha(theme.palette.divider, 0.2),
                                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.6),
                                backdropFilter: 'blur(10px)',
                                boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    boxShadow: (theme) => `0 12px 40px ${alpha(theme.palette.common.black, 0.12)}`,
                                    transform: 'translateY(-2px)',
                                },
                            }}
                        >
                            {renderPreviewContent()}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.3) 100%)',
                                    opacity: 0,
                                    transition: 'opacity 0.3s',
                                    pointerEvents: 'none',
                                    '&:hover': {
                                        opacity: 1,
                                    },
                                }}
                            />
                            <IconButton
                                size="small"
                                onClick={handleRemove}
                                sx={{
                                    position: 'absolute',
                                    top: 12,
                                    right: 12,
                                    backgroundColor: (theme) => alpha(theme.palette.error.main, 0.9),
                                    backdropFilter: 'blur(10px)',
                                    color: 'white',
                                    boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.error.main, 0.4)}`,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        backgroundColor: (theme) => theme.palette.error.dark,
                                        transform: 'scale(1.1)',
                                        boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette.error.main, 0.6)}`,
                                    },
                                }}
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 12,
                                    right: 12,
                                    backgroundColor: (theme) => alpha(theme.palette.success.main, 0.9),
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 2,
                                    px: 1.5,
                                    py: 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                }}
                            >
                                <CheckCircleIcon sx={{ fontSize: 16, color: 'white' }} />
                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                                    Cargado
                                </Typography>
                            </Box>
                        </Paper>

                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="outlined"
                                startIcon={<CloudUpload />}
                                onClick={() => document.getElementById(inputId)?.click()}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    backdropFilter: 'blur(10px)',
                                    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.6),
                                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                        borderColor: (theme) => theme.palette.primary.main,
                                        transform: 'translateY(-2px)',
                                    boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                                },
                            }}
                        >
                            Cargar nuevo archivo
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => window.open(preview, '_blank')}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                backdropFilter: 'blur(10px)',
                                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.6),
                                borderColor: (theme) => alpha(theme.palette.info.main, 0.3),
                                color: 'info.main',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    backgroundColor: (theme) => alpha(theme.palette.info.main, 0.1),
                                    borderColor: (theme) => theme.palette.info.main,
                                    transform: 'translateY(-2px)',
                                    boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.info.main, 0.2)}`,
                                },
                            }}
                        >
                            Visualizar
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            component="a"
                            href={preview}
                            download
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                backdropFilter: 'blur(10px)',
                                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.6),
                                borderColor: (theme) => alpha(theme.palette.success.main, 0.3),
                                color: 'success.main',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    backgroundColor: (theme) => alpha(theme.palette.success.main, 0.1),
                                    borderColor: (theme) => theme.palette.success.main,
                                    transform: 'translateY(-2px)',
                                    boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.success.main, 0.2)}`,
                                },
                            }}
                        >
                            Descargar
                        </Button>
                        </Stack>
                    </Stack>
                </motion.div>
            ) : (
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.2 }}
                >
                    <Paper
                        elevation={0}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById(inputId)?.click()}
                        sx={{
                            border: '2px dashed',
                            borderColor: isDragging
                                ? (theme) => theme.palette.primary.main
                                : (theme) => alpha(theme.palette.divider, 0.3),
                            borderRadius: 3,
                            p: { xs: 3, md: 4 },
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: isDragging
                                ? (theme) => alpha(theme.palette.primary.main, 0.08)
                                : (theme) => alpha(theme.palette.background.paper, 0.5),
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                                borderColor: (theme) => alpha(theme.palette.primary.main, 0.5),
                                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
                                boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
                            },
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: (theme) =>
                                    `radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                                opacity: isDragging ? 1 : 0,
                                transition: 'opacity 0.3s',
                            },
                        }}
                    >
                        <Stack spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                            <motion.div
                                animate={{
                                    y: isDragging ? [0, -10, 0] : 0,
                                }}
                                transition={{
                                    duration: 0.6,
                                    repeat: isDragging ? Infinity : 0,
                                    ease: 'easeInOut',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                        border: '2px solid',
                                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                                    }}
                                >
                                    <CloudUpload sx={{ fontSize: 32, color: 'primary.main' }} />
                                </Box>
                            </motion.div>
                            <Box>
                                <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                                    {isDragging ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic para seleccionar'}
                                </Typography>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={1}
                                    divider={
                                        <Box
                                            sx={{
                                                width: 4,
                                                height: 4,
                                                borderRadius: '50%',
                                                bgcolor: 'text.secondary',
                                                opacity: 0.5,
                                                display: { xs: 'none', sm: 'block' },
                                            }}
                                        />
                                    }
                                    justifyContent="center"
                                >
                                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                        Aceptado: {accept}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                        Máx: {displayLimit}
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>
                    </Paper>
                </motion.div>
            )}

            {uploading && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
                            border: '1px solid',
                            borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                        }}
                    >
                        <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" fontWeight={600} color="primary">
                                    Subiendo archivo...
                                </Typography>
                                <Typography variant="caption" fontWeight={700} color="primary">
                                    {Math.round(progress)}%
                                </Typography>
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                    borderRadius: 1,
                                    height: 6,
                                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 1,
                                        background: (theme) =>
                                            `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                                    },
                                }}
                            />
                        </Stack>
                    </Paper>
                </motion.div>
            )}

            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Alert
                        severity="error"
                        onClose={() => setError(null)}
                        sx={{
                            borderRadius: 2,
                            backdropFilter: 'blur(10px)',
                            backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                            border: '1px solid',
                            borderColor: (theme) => alpha(theme.palette.error.main, 0.3),
                            '& .MuiAlert-icon': {
                                color: 'error.main',
                            },
                        }}
                    >
                        {error}
                    </Alert>
                </motion.div>
            )}
        </Stack>
    );
};

export default FileUploadField;









