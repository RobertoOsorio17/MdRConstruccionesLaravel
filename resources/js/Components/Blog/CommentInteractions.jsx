import React, { useState } from 'react';
import {
    Box,
    IconButton,
    Tooltip,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Divider,
    Chip,
    useTheme,
    alpha,
    Stack
} from '@mui/material';
import {
    ThumbUp as LikeIcon,
    ThumbDown as DislikeIcon,
    Flag as ReportIcon,
    Login as LoginIcon,
    PersonAdd as RegisterIcon
} from '@mui/icons-material';
import { useAuth } from '@/Components/AuthGuard';
import { Link } from '@inertiajs/react';
import axios from 'axios';

const CommentInteractions = ({ comment, onInteractionChange }) => {
    const theme = useTheme();
    const { isAuthenticated } = useAuth();
    const [likeCount, setLikeCount] = useState(comment.like_count || 0);
    const [dislikeCount, setDislikeCount] = useState(comment.dislike_count || 0);
    const [userLiked, setUserLiked] = useState(comment.user_liked || false);
    const [userDisliked, setUserDisliked] = useState(comment.user_disliked || false);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [loginDialogOpen, setLoginDialogOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [selectedReportType, setSelectedReportType] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

    // Opciones de reporte predefinidas
    const reportOptions = [
        {
            value: 'spam',
            label: 'Spam o contenido comercial no deseado',
            description: 'Publicidad no solicitada, enlaces sospechosos o contenido repetitivo'
        },
        {
            value: 'harassment',
            label: 'Acoso o intimidación',
            description: 'Ataques personales, amenazas o comportamiento intimidatorio'
        },
        {
            value: 'hate_speech',
            label: 'Discurso de odio',
            description: 'Contenido que promueve odio basado en raza, religión, género, etc.'
        },
        {
            value: 'inappropriate',
            label: 'Contenido inapropiado',
            description: 'Material sexual, violento o no apto para todos los públicos'
        },
        {
            value: 'misinformation',
            label: 'Información falsa o engañosa',
            description: 'Noticias falsas, rumores no verificados o información incorrecta'
        },
        {
            value: 'off_topic',
            label: 'Fuera de tema',
            description: 'Comentario no relacionado con el contenido del artículo'
        },
        {
            value: 'other',
            label: 'Otro motivo',
            description: 'Especifica el motivo en el campo de descripción'
        }
    ];

    const handleLike = async () => {
        if (!isAuthenticated) {
            setLoginDialogOpen(true);
            return;
        }

        try {
            const response = await axios.post(route('comments.like', comment.id));
            
            if (response.data.success) {
                setLikeCount(response.data.likeCount);
                setDislikeCount(response.data.dislikeCount);
                setUserLiked(response.data.liked);
                setUserDisliked(!response.data.liked && userDisliked);
                
                if (onInteractionChange) {
                    onInteractionChange({
                        likeCount: response.data.likeCount,
                        dislikeCount: response.data.dislikeCount,
                        userLiked: response.data.liked,
                        userDisliked: !response.data.liked && userDisliked
                    });
                }
            }
        } catch (error) {
            setNotification({
                open: true,
                message: 'Error al procesar tu acción',
                severity: 'error'
            });
        }
    };

    const handleDislike = async () => {
        if (!isAuthenticated) {
            setLoginDialogOpen(true);
            return;
        }

        try {
            const response = await axios.post(route('comments.dislike', comment.id));
            
            if (response.data.success) {
                setLikeCount(response.data.likeCount);
                setDislikeCount(response.data.dislikeCount);
                setUserDisliked(response.data.disliked);
                setUserLiked(!response.data.disliked && userLiked);
                
                if (onInteractionChange) {
                    onInteractionChange({
                        likeCount: response.data.likeCount,
                        dislikeCount: response.data.dislikeCount,
                        userLiked: !response.data.disliked && userLiked,
                        userDisliked: response.data.disliked
                    });
                }
            }
        } catch (error) {
            setNotification({
                open: true,
                message: 'Error al procesar tu acción',
                severity: 'error'
            });
        }
    };

    const handleReport = async () => {
        if (!selectedReportType) {
            setNotification({
                open: true,
                message: 'Por favor, selecciona un motivo para el reporte',
                severity: 'warning'
            });
            return;
        }

        if (selectedReportType === 'other' && !customReason.trim()) {
            setNotification({
                open: true,
                message: 'Por favor, especifica el motivo del reporte',
                severity: 'warning'
            });
            return;
        }

        try {
            const reportData = {
                reason: selectedReportType === 'other' ? customReason : reportOptions.find(opt => opt.value === selectedReportType)?.label,
                category: selectedReportType,
                description: selectedReportType === 'other' ? customReason : reportOptions.find(opt => opt.value === selectedReportType)?.description
            };

            const response = await axios.post(route('comments.report', comment.id), reportData);
            
            if (response.data.success) {
                setNotification({
                    open: true,
                    message: response.data.message,
                    severity: 'success'
                });
                setReportDialogOpen(false);
                setSelectedReportType('');
                setCustomReason('');
            }
        } catch (error) {
            setNotification({
                open: true,
                message: error.response?.data?.message || 'Error al reportar el comentario',
                severity: 'error'
            });
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            {/* Botón de Me Gusta */}
            <Tooltip title={userLiked ? "Quitar me gusta" : "Me gusta"}>
                <IconButton
                    size="small"
                    color={userLiked ? "primary" : "default"}
                    onClick={handleLike}
                    sx={{
                        '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'primary.main'
                        }
                    }}
                >
                    <LikeIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Typography variant="body2" color="text.secondary">
                {likeCount}
            </Typography>

            {/* Botón de No Me Gusta */}
            <Tooltip title={userDisliked ? "Quitar no me gusta" : "No me gusta"}>
                <IconButton
                    size="small"
                    color={userDisliked ? "error" : "default"}
                    onClick={handleDislike}
                    sx={{
                        ml: 1,
                        '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'error.main'
                        }
                    }}
                >
                    <DislikeIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Typography variant="body2" color="text.secondary">
                {dislikeCount}
            </Typography>

            {/* Botón de Reportar */}
            <Tooltip title="Reportar comentario">
                <IconButton
                    size="small"
                    onClick={() => setReportDialogOpen(true)}
                    sx={{
                        ml: 2,
                        '&:hover': {
                            backgroundColor: 'warning.light',
                            color: 'warning.main'
                        }
                    }}
                >
                    <ReportIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            {/* Diálogo de Login */}
            <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ 
                    textAlign: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    mb: 2
                }}>
                    <LoginIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Función Exclusiva para Usuarios
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
                        ¡Conecta con la comunidad!
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                        Para dar me gusta, no me gusta o reportar comentarios necesitas tener una cuenta. 
                        Únete a nuestra comunidad y participa en las conversaciones.
                    </Typography>
                    
                    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
                        <Chip 
                            icon={<LikeIcon />} 
                            label="Valorar comentarios" 
                            variant="outlined" 
                            color="primary"
                        />
                        <Chip 
                            icon={<ReportIcon />} 
                            label="Reportar contenido" 
                            variant="outlined" 
                            color="secondary"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
                    <Button onClick={() => setLoginDialogOpen(false)} variant="outlined">
                        Cancelar
                    </Button>
                    <Button 
                        component={Link} 
                        href={route('login')} 
                        variant="contained" 
                        startIcon={<LoginIcon />}
                        color="primary"
                    >
                        Iniciar Sesión
                    </Button>
                    <Button 
                        component={Link} 
                        href={route('register')} 
                        variant="outlined" 
                        startIcon={<RegisterIcon />}
                        color="secondary"
                    >
                        Registrarse
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de Reporte Mejorado */}
            <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ 
                    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <ReportIcon sx={{ mr: 1 }} />
                    Reportar Comentario
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                        Ayudanos a mantener una comunidad segura. Selecciona el motivo que mejor describe el problema con este comentario:
                    </Typography>
                    
                    {/* Advertencia para invitados */}
                    {!isAuthenticated && (
                        <Alert 
                            severity="warning" 
                            sx={{ mb: 3, borderRadius: 2 }}
                            icon={<ReportIcon />}
                        >
                            <Typography variant="body2" fontWeight="bold" gutterBottom>
                                Importante: Reportes desde invitados
                            </Typography>
                            <Typography variant="body2">
                                Tu IP será registrada. Los reportes falsos o malintencionados pueden resultar 
                                en el <strong>bloqueo permanente</strong> de tu dirección IP para acceder a esta función.
                            </Typography>
                        </Alert>
                    )}
                    
                    <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                            value={selectedReportType}
                            onChange={(e) => setSelectedReportType(e.target.value)}
                        >
                            {reportOptions.map((option) => (
                                <Box key={option.value} sx={{ mb: 2 }}>
                                    <FormControlLabel
                                        value={option.value}
                                        control={<Radio />}
                                        label={
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {option.label}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {option.description}
                                                </Typography>
                                            </Box>
                                        }
                                        sx={{
                                            alignItems: 'flex-start',
                                            p: 2,
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: 2,
                                            transition: 'all 0.2s',
                                            backgroundColor: selectedReportType === option.value ? 
                                                alpha(theme.palette.primary.main, 0.05) : 'transparent',
                                            borderColor: selectedReportType === option.value ? 
                                                theme.palette.primary.main : theme.palette.divider,
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                                borderColor: theme.palette.primary.light
                                            }
                                        }}
                                    />
                                </Box>
                            ))}
                        </RadioGroup>
                    </FormControl>

                    {selectedReportType === 'other' && (
                        <Box sx={{ mt: 3 }}>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                Describe el motivo del reporte:
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                placeholder="Por favor, proporciona detalles específicos sobre por qué estás reportando este comentario..."
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                sx={{ mt: 1 }}
                            />
                        </Box>
                    )}

                    <Box sx={{ mt: 3, p: 2, backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}>
                        <Typography variant="body2" color="info.main" sx={{ display: 'flex', alignItems: 'center' }}>
                            <ReportIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                            {isAuthenticated 
                                ? 'Tu reporte será revisado por nuestro equipo de moderación. Los reportes falsos pueden resultar en restricciones a tu cuenta.'
                                : 'Tu reporte será revisado por nuestro equipo. Se registrará tu IP y los reportes falsos pueden resultar en el bloqueo permanente de acceso.'
                            }
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button 
                        onClick={() => {
                            setReportDialogOpen(false);
                            setSelectedReportType('');
                            setCustomReason('');
                        }} 
                        variant="outlined"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleReport} 
                        variant="contained" 
                        color="error"
                        disabled={!selectedReportType || (selectedReportType === 'other' && !customReason.trim())}
                        startIcon={<ReportIcon />}
                    >
                        Enviar Reporte
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notificaciones */}
            {notification.open && (
                <Alert 
                    severity={notification.severity} 
                    sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}
                    onClose={() => setNotification({ ...notification, open: false })}
                >
                    {notification.message}
                </Alert>
            )}
        </Box>
    );
};

export default CommentInteractions;