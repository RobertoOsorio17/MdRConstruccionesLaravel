import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Avatar,
    Divider,
    CircularProgress,
    Alert,
    Paper,
    Chip,
    Stack,
    alpha,
    IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';

/**
 * CommentEditHistoryModal Component
 * Displays the complete edit history of a comment in a premium glassmorphism modal
 * 
 * @param {boolean} open - Whether the modal is open
 * @param {Function} onClose - Callback when modal is closed
 * @param {number} commentId - The ID of the comment to fetch history for
 */
export default function CommentEditHistoryModal({ open, onClose, commentId }) {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (open && commentId) {
            fetchEditHistory();
        }
    }, [open, commentId]);

    const fetchEditHistory = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(route('comments.edit-history', commentId));
            
            if (response.data.success) {
                setHistory(response.data.history);
            }
        } catch (err) {
            console.error('Error fetching edit history:', err);
            setError(err.response?.data?.message || 'Error al cargar el historial de ediciones');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
                    backdropFilter: 'blur(20px)',
                    boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.3)}`,
                },
            }}
        >
            {/* Header */}
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    pb: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                >
                    <HistoryIcon sx={{ color: 'white' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="600">
                        Historial de Ediciones
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {history.length} {history.length === 1 ? 'edición' : 'ediciones'} registradas
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {/* Content */}
            <DialogContent sx={{ p: 3 }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!loading && !error && history.length === 0 && (
                    <Alert severity="info">
                        No hay historial de ediciones disponible para este comentario.
                    </Alert>
                )}

                {!loading && !error && history.length > 0 && (
                    <Stack spacing={3}>
                        {history.map((edit, index) => (
                            <Paper
                                key={edit.id}
                                elevation={0}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '4px',
                                        height: '100%',
                                        background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    },
                                }}
                            >
                                {/* Edit Header */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar
                                        src={edit.editor.avatar}
                                        alt={edit.editor.name}
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                        }}
                                    >
                                        <PersonIcon />
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight="600">
                                            {edit.editor.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {edit.edited_at_human}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Chip
                                        label={`Edición #${history.length - index}`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Box>

                                {/* Edit Reason */}
                                {edit.edit_reason && (
                                    <Alert
                                        severity="info"
                                        icon={<EditIcon fontSize="small" />}
                                        sx={{
                                            mb: 2,
                                            backgroundColor: alpha(theme.palette.info.main, 0.05),
                                            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                                        }}
                                    >
                                        <Typography variant="caption" fontWeight="600" display="block">
                                            Motivo:
                                        </Typography>
                                        <Typography variant="body2">
                                            {edit.edit_reason}
                                        </Typography>
                                    </Alert>
                                )}

                                {/* Content Changes */}
                                <Box>
                                    <Typography variant="caption" fontWeight="600" color="error.main" display="block" gutterBottom>
                                        Contenido anterior:
                                    </Typography>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1.5,
                                            mb: 2,
                                            backgroundColor: alpha(theme.palette.error.main, 0.05),
                                            border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            {edit.original_content}
                                        </Typography>
                                    </Paper>

                                    <Typography variant="caption" fontWeight="600" color="success.main" display="block" gutterBottom>
                                        Contenido nuevo:
                                    </Typography>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1.5,
                                            backgroundColor: alpha(theme.palette.success.main, 0.05),
                                            border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Typography variant="body2">
                                            {edit.new_content}
                                        </Typography>
                                    </Paper>
                                </Box>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </DialogContent>

            {/* Actions */}
            <DialogActions
                sx={{
                    p: 3,
                    pt: 2,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
            >
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                    }}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
}

