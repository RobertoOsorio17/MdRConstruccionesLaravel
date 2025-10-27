import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Box,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    InputAdornment,
    FormControlLabel,
    Checkbox,
    Snackbar,
    Alert,
    CircularProgress,
    Link
} from '@mui/material';
import { Close, Person, Email, Phone, Message, Business } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import designSystem from '@/theme/designSystem';
import { trackCTAClick } from '@/Utils/analytics';

/**
 * ContactFormModal Component
 * 
 * Modal de formulario de contacto integrado con el backend existente.
 * Reutiliza la ruta `contact.submit` y la lógica del formulario de contacto.
 * 
 * @param {boolean} open - Estado del modal
 * @param {function} onClose - Callback al cerrar
 * @param {object} service - Datos del servicio actual
 * @param {string} prefilledMessage - Mensaje prefill (opcional)
 */
const ContactFormModal = ({ 
    open = false, 
    onClose = () => {}, 
    service = {},
    prefilledMessage = ''
}) => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const phoneRef = useRef(null);
    const messageRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        service: service?.title || '',
        preferred_contact: 'Email',
        contact_time: '',
        sqm: 60,
        quality: 'Estándar',
        files: [],
        message: prefilledMessage || `Estoy interesado en el servicio: ${service?.title || ''}`,
        privacy_accepted: false,
        recaptcha_token: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Track CTA
        trackCTAClick('contact_form_submit', 'Enviar Consulta', service?.slug || '');

        // Submit form
        post(route('contact.submit'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setSnackbarMessage('¡Gracias por tu mensaje! Te contactaremos en las próximas 24 horas.');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                reset();
                setTimeout(() => {
                    onClose();
                }, 2000);
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
                setSnackbarMessage('Ocurrió un error al enviar el formulario. Por favor, revisa los campos.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);

                // Focus first errored field
                const order = ['name', 'email', 'phone', 'message', 'privacy_accepted'];
                for (const key of order) {
                    if (errors[key]) {
                        const map = { 
                            name: nameRef, 
                            email: emailRef, 
                            phone: phoneRef, 
                            message: messageRef 
                        };
                        map[key]?.current?.focus?.();
                        break;
                    }
                }
            },
        });
    };

    const handleClose = () => {
        if (!processing) {
            onClose();
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                aria-labelledby="contact-form-modal-title"
                aria-describedby="contact-form-modal-description"
                PaperProps={{
                    sx: {
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
                        overflow: 'visible'
                    }
                }}
                BackdropProps={{
                    sx: {
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(8px)'
                    }
                }}
            >
                <DialogTitle
                    id="contact-form-modal-title"
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        pb: 2,
                        borderBottom: `1px solid ${designSystem.colors.border.light}`
                    }}
                >
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: designSystem.colors.text.primary }}>
                            Solicitar Asesoría Personalizada
                        </Typography>
                        {service?.title && (
                            <Typography
                                variant="caption"
                                id="contact-form-modal-description"
                                sx={{ color: designSystem.colors.text.secondary }}
                            >
                                Servicio: {service.title}
                            </Typography>
                        )}
                    </Box>
                    <IconButton
                        onClick={handleClose}
                        disabled={processing}
                        aria-label="Cerrar formulario de contacto"
                        sx={{
                            '&:focus-visible': {
                                outline: `2px solid ${designSystem.colors.primary[600]}`,
                                outlineOffset: '2px'
                            }
                        }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ pt: 3 }}>
                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            {/* Name */}
                            <TextField
                                fullWidth
                                label="Nombre Completo"
                                inputRef={nameRef}
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={!!errors.name}
                                helperText={errors.name}
                                required
                                disabled={processing}
                                autoComplete="name"
                                inputProps={{
                                    'aria-label': 'Nombre completo',
                                    'aria-required': 'true'
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person color={errors.name ? 'error' : 'action'} aria-hidden="true" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Email */}
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                inputRef={emailRef}
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={!!errors.email}
                                helperText={errors.email}
                                required
                                disabled={processing}
                                autoComplete="email"
                                inputProps={{
                                    'aria-label': 'Dirección de correo electrónico',
                                    'aria-required': 'true'
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email color={errors.email ? 'error' : 'action'} aria-hidden="true" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Phone */}
                            <TextField
                                fullWidth
                                label="Teléfono"
                                type="tel"
                                inputRef={phoneRef}
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                error={!!errors.phone}
                                helperText={errors.phone}
                                required
                                disabled={processing}
                                autoComplete="tel"
                                inputProps={{
                                    'aria-label': 'Número de teléfono',
                                    'aria-required': 'true'
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Phone color={errors.phone ? 'error' : 'action'} aria-hidden="true" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Message */}
                            <TextField
                                fullWidth
                                label="Mensaje"
                                multiline
                                rows={4}
                                inputRef={messageRef}
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                error={!!errors.message}
                                helperText={errors.message || `${(data.message || '').length}/1000`}
                                required
                                disabled={processing}
                                autoComplete="off"
                                inputProps={{
                                    maxLength: 1000,
                                    'aria-label': 'Mensaje o consulta',
                                    'aria-required': 'true',
                                    'aria-describedby': 'message-helper-text'
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                                            <Message color={errors.message ? 'error' : 'action'} aria-hidden="true" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Privacy Checkbox */}
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={data.privacy_accepted}
                                        onChange={(e) => setData('privacy_accepted', e.target.checked)}
                                        required
                                        disabled={processing}
                                        inputProps={{
                                            'aria-label': 'Acepto la política de privacidad',
                                            'aria-required': 'true'
                                        }}
                                    />
                                }
                                label={
                                    <Typography variant="caption" sx={{ color: designSystem.colors.text.secondary }}>
                                        Acepto la{' '}
                                        <Link href="/privacy-policy" target="_blank" sx={{ color: designSystem.colors.primary[600] }}>
                                            política de privacidad
                                        </Link>
                                    </Typography>
                                }
                            />
                            {errors.privacy_accepted && (
                                <Typography variant="caption" color="error" role="alert">
                                    {errors.privacy_accepted}
                                </Typography>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={processing}
                                aria-label={processing ? 'Enviando formulario' : 'Enviar consulta'}
                                sx={{
                                    py: 1.5,
                                    fontWeight: 700,
                                    background: `linear-gradient(135deg, ${designSystem.colors.primary[500]}, ${designSystem.colors.primary[700]})`,
                                    boxShadow: designSystem.shadows.colored.primary,
                                    '&:hover': {
                                        background: `linear-gradient(135deg, ${designSystem.colors.primary[600]}, ${designSystem.colors.primary[800]})`,
                                        transform: 'translateY(-2px)',
                                        boxShadow: designSystem.shadows.xl
                                    },
                                    '&:focus-visible': {
                                        outline: `3px solid ${designSystem.colors.primary[300]}`,
                                        outlineOffset: '2px'
                                    },
                                    transition: designSystem.transitions.allNormal
                                }}
                            >
                                {processing ? <CircularProgress size={24} color="inherit" /> : 'Enviar Consulta'}
                            </Button>
                        </Stack>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ContactFormModal;

