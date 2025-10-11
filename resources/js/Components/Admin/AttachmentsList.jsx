import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Tooltip,
    Chip,
    CircularProgress,
    Alert,
    Collapse,
    alpha,
} from '@mui/material';
import {
    Download as DownloadIcon,
    PictureAsPdf as PdfIcon,
    Image as ImageIcon,
    Description as DocIcon,
    TableChart as ExcelIcon,
    InsertDriveFile as FileIcon,
    AttachFile as AttachFileIcon,
} from '@mui/icons-material';

const AttachmentsList = ({ contactRequestId, attachments = [] }) => {
    const [downloading, setDownloading] = useState({});
    const [error, setError] = useState(null);

    const glassmorphismStyles = {
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        borderRadius: '16px',
    };

    const getFileIcon = (extension) => {
        const ext = extension?.toLowerCase();
        
        switch (ext) {
            case 'pdf':
                return <PdfIcon sx={{ fontSize: 40, color: '#E53E3E' }} />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <ImageIcon sx={{ fontSize: 40, color: '#48BB78' }} />;
            case 'doc':
            case 'docx':
                return <DocIcon sx={{ fontSize: 40, color: '#4299E1' }} />;
            case 'xls':
            case 'xlsx':
                return <ExcelIcon sx={{ fontSize: 40, color: '#48BB78' }} />;
            default:
                return <FileIcon sx={{ fontSize: 40, color: '#718096' }} />;
        }
    };

    const getFileTypeLabel = (extension) => {
        const ext = extension?.toLowerCase();
        
        switch (ext) {
            case 'pdf':
                return 'PDF';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return 'Imagen';
            case 'doc':
            case 'docx':
                return 'Word';
            case 'xls':
            case 'xlsx':
                return 'Excel';
            default:
                return 'Archivo';
        }
    };

    const handleDownload = async (attachmentId, filename) => {
        setDownloading(prev => ({ ...prev, [attachmentId]: true }));
        setError(null);

        try {
            // Create download URL
            const url = route('admin.contact-requests.attachments.download', {
                contactRequest: contactRequestId,
                attachment: attachmentId,
            });

            // Fetch the file
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Error al descargar el archivo';

                if (response.status === 429) {
                    errorMessage = 'Demasiadas descargas. Por favor espera un momento.';
                } else if (response.status === 403) {
                    errorMessage = 'No tienes permiso para descargar este archivo.';
                } else if (response.status === 404) {
                    errorMessage = 'El archivo no fue encontrado.';
                } else if (response.status === 500) {
                    errorMessage = 'Error al descifrar el archivo. Contacta al administrador.';
                }

                throw new Error(errorMessage);
            }

            // Get the blob
            const blob = await response.blob();

            // Create download link
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            // Reload page to update download counter
            setTimeout(() => {
                router.reload({ only: ['attachments'] });
            }, 500);

        } catch (error) {
            console.error('Error downloading file:', error);
            setError(error.message || 'Error al descargar el archivo. Por favor intenta de nuevo.');
        } finally {
            setDownloading(prev => ({ ...prev, [attachmentId]: false }));
        }
    };

    // Empty state when no attachments
    if (!attachments || attachments.length === 0) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 8,
                    px: 3,
                }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Box
                        sx={{
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 3,
                        }}
                    >
                        <AttachFileIcon sx={{ fontSize: 60, color: '#667eea', opacity: 0.6 }} />
                    </Box>
                </motion.div>

                <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ color: '#2D3748', mb: 1, textAlign: 'center' }}
                >
                    Sin Archivos Adjuntos
                </Typography>

                <Typography
                    variant="body2"
                    sx={{ color: '#718096', textAlign: 'center', maxWidth: 400 }}
                >
                    Esta solicitud no incluye archivos adjuntos. Los archivos que se suban en el futuro aparecerán aquí.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: '#2D3748' }}>
                Archivos Adjuntos ({attachments.length})
            </Typography>

            {/* Error Alert */}
            <Collapse in={!!error}>
                <Alert
                    severity="error"
                    onClose={() => setError(null)}
                    sx={{ mb: 2 }}
                >
                    {error}
                </Alert>
            </Collapse>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {attachments.map((attachment, index) => (
                    <motion.div
                        key={attachment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Paper
                            sx={{
                                ...glassmorphismStyles,
                                p: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                transition: 'all 0.3s ease',
                                flexDirection: { xs: 'column', sm: 'row' },
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.45)',
                                },
                            }}
                        >
                            {/* File Icon */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: { xs: 50, sm: 60 },
                                    height: { xs: 50, sm: 60 },
                                    borderRadius: '12px',
                                    background: alpha('#667eea', 0.1),
                                    flexShrink: 0,
                                }}
                            >
                                {getFileIcon(attachment.extension)}
                            </Box>

                            {/* File Info */}
                            <Box sx={{ flex: 1, minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>
                                <Typography
                                    variant="body1"
                                    fontWeight={600}
                                    sx={{
                                        color: '#2D3748',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {attachment.original_filename}
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={getFileTypeLabel(attachment.extension)}
                                        size="small"
                                        sx={{
                                            backgroundColor: alpha('#667eea', 0.1),
                                            color: '#667eea',
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                        }}
                                    />
                                    <Chip
                                        label={attachment.formatted_size}
                                        size="small"
                                        sx={{
                                            backgroundColor: alpha('#48BB78', 0.1),
                                            color: '#48BB78',
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                        }}
                                    />
                                    {attachment.downloaded_count > 0 && (
                                        <Chip
                                            label={`${attachment.downloaded_count} descarga${attachment.downloaded_count > 1 ? 's' : ''}`}
                                            size="small"
                                            sx={{
                                                backgroundColor: alpha('#F6AD55', 0.1),
                                                color: '#F6AD55',
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                            }}
                                        />
                                    )}
                                </Box>

                                <Typography variant="caption" sx={{ color: '#718096', mt: 0.5, display: 'block' }}>
                                    Subido el {new Date(attachment.created_at).toLocaleString('es-ES', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Typography>
                            </Box>

                            {/* Download Button */}
                            <Tooltip title="Descargar archivo">
                                <IconButton
                                    onClick={() => handleDownload(attachment.id, attachment.original_filename)}
                                    disabled={downloading[attachment.id]}
                                    sx={{
                                        backgroundColor: '#667eea',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#5568d3',
                                        },
                                        '&:disabled': {
                                            backgroundColor: alpha('#667eea', 0.5),
                                        },
                                    }}
                                >
                                    {downloading[attachment.id] ? (
                                        <CircularProgress size={24} sx={{ color: 'white' }} />
                                    ) : (
                                        <DownloadIcon />
                                    )}
                                </IconButton>
                            </Tooltip>
                        </Paper>
                    </motion.div>
                ))}
            </Box>
        </Box>
    );
};

export default AttachmentsList;

