import React, { useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    FormControlLabel,
    Checkbox,
    LinearProgress,
    Stack,
    Chip,
    IconButton,
    alpha,
    useTheme,
    Card,
    CardContent,
    Fade,
    Zoom,
    CircularProgress,
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    Gavel as GavelIcon,
    Send as SendIcon,
    Image as ImageIcon,
    CheckCircle as CheckCircleIcon,
    AccessTime as AccessTimeIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import ParticleBackground from '@/Components/Auth/ParticleBackground';
import AnimatedGradient from '@/Components/Auth/AnimatedGradient';

export default function Create({ ban, maxFileSize, allowedFileTypes, minReasonLength, maxReasonLength }) {
    const theme = useTheme();
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);
    const reasonRef = useRef(null);

    const { data, setData, post, processing, errors, progress } = useForm({
        reason: '',
        evidence: null,
        terms_accepted: false,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size
        if (file.size > maxFileSize) {
            alert(`El archivo excede el tamaño máximo de ${(maxFileSize / 1024 / 1024).toFixed(0)}MB`);
            return;
        }

        // Validate file type
        if (!allowedFileTypes.includes(file.type)) {
            alert('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)');
            return;
        }

        setData('evidence', file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
            setPreview(event.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveFile = () => {
        setData('evidence', null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Client-side validation
        if (data.reason.length < minReasonLength) {
            reasonRef.current?.focus();
            return;
        }

        if (!data.terms_accepted) {
            alert('Debes aceptar los términos y condiciones');
            return;
        }

        // ✅ SECURITY: Preserve query string parameters from signed URL
        const currentUrl = new URL(window.location.href);
        const queryParams = currentUrl.searchParams.toString();
        const postUrl = route('ban-appeal.store') + (queryParams ? '?' + queryParams : '');

        post(postUrl, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => {
                console.error('Form errors:', errors);
                // Focus first error field
                if (errors.reason) reasonRef.current?.focus();
            },
        });
    };

    const remainingChars = maxReasonLength - data.reason.length;
    const isReasonValid = data.reason.length >= minReasonLength && data.reason.length <= maxReasonLength;

    return (
        <>
            <Head title="Apelar Baneo" />

            {/* Background Effects */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                    overflow: 'hidden',
                }}
            >
                <ParticleBackground />
                <AnimatedGradient />
            </Box>

            {/* Main Content */}
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1,
                    py: 4,
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                        {/* Left Side - Info Panel */}
                        <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 40%' } }}>
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <Box
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        p: 4,
                                    }}
                                >
                                    {/* Logo */}
                                    <Box sx={{ mb: 4 }}>
                                        <ApplicationLogo sx={{ width: 60, height: 60 }} />
                                    </Box>

                                    {/* Title */}
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            fontWeight: 800,
                                            mb: 2,
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}
                                    >
                                        Apelación de Baneo
                                    </Typography>

                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: 'text.secondary',
                                            mb: 4,
                                            fontWeight: 400,
                                        }}
                                    >
                                        Presenta tu caso para revisión
                                    </Typography>

                                    {/* Info Cards */}
                                    <Stack spacing={2}>
                                        <Card
                                            sx={{
                                                background: alpha(theme.palette.primary.main, 0.1),
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                            }}
                                        >
                                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <GavelIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        Revisión Justa
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Tu apelación será revisada por un administrador
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>

                                        <Card
                                            sx={{
                                                background: alpha(theme.palette.success.main, 0.1),
                                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                            }}
                                        >
                                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        Proceso Transparente
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Recibirás una respuesta clara y fundamentada
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>

                                        <Card
                                            sx={{
                                                background: alpha(theme.palette.info.main, 0.1),
                                                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                            }}
                                        >
                                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <AccessTimeIcon sx={{ fontSize: 40, color: 'info.main' }} />
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        Respuesta Rápida
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Procesamos las apelaciones en 24-48 horas
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Stack>
                                </Box>
                            </motion.div>
                        </Box>

                        {/* Right Side - Form */}
                        <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 60%' } }}>
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <Paper
                                    elevation={24}
                                    sx={{
                                        p: 4,
                                        borderRadius: 3,
                                        background: alpha(theme.palette.background.paper, 0.95),
                                        backdropFilter: 'blur(20px)',
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    }}
                                >

                                    {/* Header */}
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                                            Formulario de Apelación
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Completa el formulario para solicitar la revisión de tu baneo
                                        </Typography>
                                    </Box>

                                    {/* Ban Information */}
                                    <Alert
                                        severity="error"
                                        sx={{
                                            mb: 3,
                                            borderRadius: 2,
                                            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                                        }}
                                        icon={<WarningIcon />}
                                    >
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                            Información del Baneo
                                        </Typography>
                                        <Stack spacing={0.5}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <InfoIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="body2">
                                                    <strong>Razón:</strong> {ban.reason}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AccessTimeIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="body2">
                                                    <strong>Fecha:</strong> {ban.banned_at}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AccessTimeIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="body2">
                                                    <strong>Expira:</strong> {ban.expires_at}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PersonIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="body2">
                                                    <strong>Baneado por:</strong> {ban.banned_by}
                                                </Typography>
                                            </Box>
                                            {ban.admin_notes && (
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 1 }}>
                                                    <InfoIcon sx={{ fontSize: 16, mt: 0.3 }} />
                                                    <Typography variant="body2">
                                                        <strong>Notas del administrador:</strong> {ban.admin_notes}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Alert>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit}>
                                        <Stack spacing={3}>
                                            {/* Reason Field */}
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                                    Razón de la Apelación <span style={{ color: theme.palette.error.main }}>*</span>
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={6}
                                                    placeholder="Explica detalladamente por qué consideras que el baneo es injusto o debería ser revisado..."
                                                    value={data.reason}
                                                    onChange={(e) => setData('reason', e.target.value)}
                                                    error={!!errors.reason}
                                                    helperText={
                                                        errors.reason ||
                                                        `${data.reason.length}/${maxReasonLength} caracteres (mínimo ${minReasonLength})`
                                                    }
                                                    required
                                                    disabled={processing}
                                                    inputRef={reasonRef}
                                                    inputProps={{
                                                        maxLength: maxReasonLength,
                                                    }}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            backgroundColor: alpha(theme.palette.background.default, 0.5),
                                                            borderRadius: 2,
                                                            '&:hover': {
                                                                backgroundColor: alpha(theme.palette.background.default, 0.7),
                                                            },
                                                            '&.Mui-focused': {
                                                                backgroundColor: alpha(theme.palette.background.default, 0.8),
                                                            },
                                                        },
                                                    }}
                                                />
                                                {isReasonValid && (
                                                    <Fade in={isReasonValid}>
                                                        <Chip
                                                            icon={<CheckCircleIcon />}
                                                            label="Longitud válida"
                                                            color="success"
                                                            size="small"
                                                            sx={{ mt: 1 }}
                                                        />
                                                    </Fade>
                                                )}
                                            </Box>

                                            {/* Evidence Upload */}
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                                    Evidencia (Opcional)
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                                                    Puedes subir una imagen como evidencia (máx. {(maxFileSize / 1024 / 1024).toFixed(0)}MB)
                                                </Typography>

                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    style={{ display: 'none' }}
                                                    disabled={processing}
                                                />

                                                {!preview ? (
                                                    <Button
                                                        variant="outlined"
                                                        startIcon={<ImageIcon />}
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={processing}
                                                        fullWidth
                                                        sx={{
                                                            py: 2,
                                                            borderRadius: 2,
                                                            borderStyle: 'dashed',
                                                            borderWidth: 2,
                                                            '&:hover': {
                                                                borderStyle: 'dashed',
                                                                borderWidth: 2,
                                                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                                            },
                                                        }}
                                                    >
                                                        Seleccionar Imagen
                                                    </Button>
                                                ) : (
                                                    <Zoom in={!!preview}>
                                                        <Paper
                                                            variant="outlined"
                                                            sx={{
                                                                p: 2,
                                                                position: 'relative',
                                                                borderRadius: 2,
                                                                border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`,
                                                            }}
                                                        >
                                                            <Box
                                                                component="img"
                                                                src={preview}
                                                                alt="Preview"
                                                                sx={{
                                                                    width: '100%',
                                                                    maxHeight: 300,
                                                                    objectFit: 'contain',
                                                                    borderRadius: 1,
                                                                }}
                                                            />
                                                            <IconButton
                                                                onClick={handleRemoveFile}
                                                                disabled={processing}
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 8,
                                                                    right: 8,
                                                                    bgcolor: alpha(theme.palette.background.paper, 0.9),
                                                                    backdropFilter: 'blur(10px)',
                                                                    '&:hover': {
                                                                        bgcolor: theme.palette.error.main,
                                                                        color: 'white',
                                                                        transform: 'scale(1.1)',
                                                                    },
                                                                    transition: 'all 0.2s',
                                                                }}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Paper>
                                                    </Zoom>
                                                )}

                                                {errors.evidence && (
                                                    <Alert severity="error" sx={{ mt: 1, borderRadius: 2 }}>
                                                        {errors.evidence}
                                                    </Alert>
                                                )}
                                            </Box>

                                            {/* Terms Checkbox */}
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                                                    backgroundColor: alpha(theme.palette.background.default, 0.3),
                                                }}
                                            >
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={data.terms_accepted}
                                                            onChange={(e) => setData('terms_accepted', e.target.checked)}
                                                            disabled={processing}
                                                            required
                                                            sx={{
                                                                '&.Mui-checked': {
                                                                    color: theme.palette.success.main,
                                                                },
                                                            }}
                                                        />
                                                    }
                                                    label={
                                                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                                            Acepto que la información proporcionada es verídica y entiendo que el envío de
                                                            información falsa puede resultar en la extensión del baneo.
                                                            <span style={{ color: theme.palette.error.main }}> *</span>
                                                        </Typography>
                                                    }
                                                />
                                            </Box>

                                            {errors.terms_accepted && (
                                                <Alert severity="error" sx={{ borderRadius: 2 }}>
                                                    {errors.terms_accepted}
                                                </Alert>
                                            )}

                                            {/* Progress Bar */}
                                            {progress && (
                                                <Fade in={!!progress}>
                                                    <Box>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={progress.percentage || 0}
                                                            sx={{
                                                                height: 8,
                                                                borderRadius: 4,
                                                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                            }}
                                                        />
                                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                                                            Subiendo evidencia... {progress.percentage || 0}%
                                                        </Typography>
                                                    </Box>
                                                </Fade>
                                            )}

                                            {/* Submit Button */}
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                size="large"
                                                disabled={processing || !isReasonValid || !data.terms_accepted}
                                                fullWidth
                                                startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                                sx={{
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                    fontWeight: 600,
                                                    fontSize: '1rem',
                                                    textTransform: 'none',
                                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                                                    '&:hover': {
                                                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                                        boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.5)}`,
                                                        transform: 'translateY(-2px)',
                                                    },
                                                    '&:disabled': {
                                                        background: alpha(theme.palette.action.disabled, 0.12),
                                                        boxShadow: 'none',
                                                    },
                                                    transition: 'all 0.3s ease',
                                                }}
                                            >
                                                {processing ? 'Enviando Apelación...' : 'Enviar Apelación'}
                                            </Button>
                                        </Stack>
                                    </form>
                                </Paper>
                            </motion.div>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </>
    );
}

