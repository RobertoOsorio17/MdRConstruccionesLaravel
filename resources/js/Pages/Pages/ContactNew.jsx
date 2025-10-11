import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
    Snackbar,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    alpha,
    useTheme,
    useMediaQuery,
    Stack,
    Chip,
    Breadcrumbs,
    CircularProgress,
    InputAdornment,
    Link as MuiLink,
    Radio,
    RadioGroup,
    FormLabel,
    FormHelperText,
    Stepper,
    Step,
    StepLabel,
    Alert,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
} from '@mui/material';
import {
    Phone,
    Email,
    LocationOn,
    WhatsApp,
    Send,
    Schedule,
    CheckCircle,
    AccessTime,
    Person,
    Message,
    Business,
    NavigateNext,
    AttachFile,
    Delete,
    Verified,
    Shield,
    TrendingUp,
    Euro,
    ArrowBack,
    ArrowForward,
    RestartAlt,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import PrivacyPolicyModal from '@/Components/PrivacyPolicyModal';
import CountUp from 'react-countup';

/**
 * Contact Form Component with Multi-Step Stepper
 */
function ContactFormContent({ contactInfo, services, seo, flash }) {
    const theme = useTheme();
    const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { executeRecaptcha } = useGoogleReCaptcha();

    // Stepper state
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Datos de Contacto', 'Servicio y Mensaje', 'Adjuntos y Envío', 'Confirmación'];

    // Local state
    const [submitted, setSubmitted] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [uploadedFiles, setUploadedFiles] = useState([]);

    // Form handling with Inertia.js
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        preferred_contact: 'Email',
        contact_time: '',
        service: '',
        message: '',
        attachments: [],
        privacy_accepted: false,
        recaptcha_token: '',
    });

    // Refs for validation
    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const messageRef = useRef(null);

    // Check availability based on working hours
    useEffect(() => {
        const checkAvailability = () => {
            const now = new Date();
            const day = now.getDay();
            const hour = now.getHours();

            if (day >= 1 && day <= 5) {
                setIsAvailable(hour >= 8 && hour < 18);
            } else if (day === 6) {
                setIsAvailable(hour >= 9 && hour < 14);
            } else {
                setIsAvailable(false);
            }
        };

        checkAvailability();
        const interval = setInterval(checkAvailability, 60000);
        return () => clearInterval(interval);
    }, []);

    // Restore draft from localStorage
    useEffect(() => {
        try {
            const draft = localStorage.getItem('contact_form_draft');
            if (draft) {
                const parsed = JSON.parse(draft);
                Object.entries(parsed).forEach(([k, v]) => {
                    if (k in data && k !== 'attachments') setData(k, v);
                });
                setSnackbarMessage('Borrador restaurado automáticamente');
                setSnackbarSeverity('info');
                setSnackbarOpen(true);
            }
        } catch {}
    }, []);

    // Save draft to localStorage
    useEffect(() => {
        const draft = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            preferred_contact: data.preferred_contact,
            contact_time: data.contact_time,
            service: data.service,
            message: data.message,
            privacy_accepted: data.privacy_accepted,
        };
        try { localStorage.setItem('contact_form_draft', JSON.stringify(draft)); } catch {}
    }, [data.name, data.email, data.phone, data.preferred_contact, data.contact_time, data.service, data.message, data.privacy_accepted]);

    // Clear draft
    const clearDraft = () => {
        try { localStorage.removeItem('contact_form_draft'); } catch {}
        reset();
        setUploadedFiles([]);
        setActiveStep(0);
        setSnackbarMessage('Formulario reiniciado');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
    };

    // Handle file upload with enhanced validation
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = [];
        const errors = [];

        // Límite total de archivos
        if (uploadedFiles.length + files.length > 5) {
            setSnackbarMessage('Máximo 5 archivos permitidos');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        files.forEach(file => {
            // Validar extensión del archivo
            const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
            const fileExtension = file.name.split('.').pop().toLowerCase();

            if (!allowedExtensions.includes(fileExtension)) {
                errors.push(`${file.name}: Extensión no permitida. Solo PDF, JPG, JPEG, PNG`);
                return;
            }

            // Validar tipo MIME
            const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                errors.push(`${file.name}: Tipo de archivo no permitido`);
                return;
            }

            // Validar tamaño (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                errors.push(`${file.name}: Supera los 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
                return;
            }

            // Validar tamaño mínimo (evitar archivos vacíos)
            if (file.size < 100) {
                errors.push(`${file.name}: Archivo demasiado pequeño o vacío`);
                return;
            }

            // Validar nombre de archivo (evitar caracteres peligrosos)
            if (!/^[a-zA-Z0-9._\-\s]+$/.test(file.name)) {
                errors.push(`${file.name}: Nombre de archivo contiene caracteres no permitidos`);
                return;
            }

            validFiles.push(file);
        });

        // Mostrar errores si los hay
        if (errors.length > 0) {
            setSnackbarMessage(errors.join('\n'));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }

        // Añadir archivos válidos
        if (validFiles.length > 0) {
            const newFiles = [...uploadedFiles, ...validFiles];
            setUploadedFiles(newFiles);
            setData('attachments', newFiles);

            if (validFiles.length > 0) {
                setSnackbarMessage(`${validFiles.length} archivo(s) añadido(s) correctamente`);
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
            }
        }
    };

    // Remove file
    const removeFile = (index) => {
        const newFiles = uploadedFiles.filter((_, i) => i !== index);
        setUploadedFiles(newFiles);
        setData('attachments', newFiles);
    };

    // Validation for each step
    const validateStep = (step) => {
        switch (step) {
            case 0:
                // Validar nombre y email
                if (!data.name || !data.email) return false;
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return false;

                // Si eligió Teléfono o WhatsApp, el teléfono es obligatorio
                if ((data.preferred_contact === 'Teléfono' || data.preferred_contact === 'WhatsApp') && !data.phone) {
                    return false;
                }

                // Validar formato de teléfono si está presente
                if (data.phone && !/^[\d\s\+\-\(\)]+$/.test(data.phone)) {
                    return false;
                }

                return true;
            case 1:
                return data.message && data.message.length >= 10;
            case 2:
                return data.privacy_accepted;
            default:
                return true;
        }
    };

    // Handle next step
    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep((prev) => prev + 1);
        } else {
            // Mensajes específicos según el paso
            let errorMessage = 'Por favor completa todos los campos requeridos';

            if (activeStep === 0) {
                if (!data.name) {
                    errorMessage = 'El nombre es obligatorio';
                } else if (!data.email) {
                    errorMessage = 'El email es obligatorio';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                    errorMessage = 'El email no es válido';
                } else if ((data.preferred_contact === 'Teléfono' || data.preferred_contact === 'WhatsApp') && !data.phone) {
                    errorMessage = `El teléfono es obligatorio si eliges contacto por ${data.preferred_contact}`;
                } else if (data.phone && !/^[\d\s\+\-\(\)]+$/.test(data.phone)) {
                    errorMessage = 'El formato del teléfono no es válido';
                }
            } else if (activeStep === 1) {
                if (!data.message) {
                    errorMessage = 'El mensaje es obligatorio';
                } else if (data.message.length < 10) {
                    errorMessage = 'El mensaje debe tener al menos 10 caracteres';
                }
            } else if (activeStep === 2) {
                errorMessage = 'Debes aceptar la política de privacidad';
            }

            setSnackbarMessage(errorMessage);
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
        }
    };

    // Handle back step
    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!executeRecaptcha) {
            alert('Error: reCAPTCHA no está disponible. Por favor, recarga la página.');
            return;
        }

        try {
            const token = await executeRecaptcha('contact_form');
            setData('recaptcha_token', token);

            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (key === 'attachments') {
                    uploadedFiles.forEach(file => {
                        formData.append('attachments[]', file);
                    });
                } else {
                    formData.append(key, data[key]);
                }
            });
            formData.append('recaptcha_token', token);

            post(route('contact.submit'), {
                data: formData,
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    setSubmitted(true);
                    setSubmissionSuccess(true);
                    setActiveStep(3); // Move to success step
                    setSnackbarMessage('¡Gracias por tu mensaje! Te contactaremos en las próximas 24 horas.');
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
                    try { localStorage.removeItem('contact_form_draft'); } catch {}
                },
                onError: (errors) => {
                    console.error('Form submission errors:', errors);
                    setSnackbarMessage('Ocurrió un error. Por favor, revisa los campos.');
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                },
            });
        } catch (error) {
            console.error('reCAPTCHA error:', error);
            alert('Error al verificar la seguridad. Por favor, recarga la página.');
        }
    };

    // Premium Glassmorphism style
    const glassStyle = {
        background: alpha('#ffffff', 0.75),
        backdropFilter: 'blur(30px)',
        borderRadius: '16px',
        border: `1px solid ${alpha('#ffffff', 0.3)}`,
        boxShadow: `
            0 8px 32px 0 ${alpha('#000000', 0.1)},
            inset 0 1px 0 0 ${alpha('#ffffff', 0.8)}
        `,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    // Services list
    const servicesList = [
        'Reformas Integrales',
        'Construcción Nueva',
        'Rehabilitación',
        'Diseño de Interiores',
        'Proyectos Comerciales',
        'Otro',
    ];

    // Contact methods
    const contactMethods = [
        {
            icon: <Phone sx={{ fontSize: 40 }} />,
            title: 'Teléfono',
            value: contactInfo?.phone || '+34 123 456 789',
            color: theme.palette.primary.main,
            action: `tel:${contactInfo?.phone || '+34123456789'}`,
        },
        {
            icon: <Email sx={{ fontSize: 40 }} />,
            title: 'Email',
            value: contactInfo?.email || 'info@mdrconstrucciones.com',
            color: theme.palette.secondary.main,
            action: `mailto:${contactInfo?.email || 'info@mdrconstrucciones.com'}`,
        },
        {
            icon: <WhatsApp sx={{ fontSize: 40 }} />,
            title: 'WhatsApp',
            value: contactInfo?.whatsapp || '+34 123 456 789',
            color: '#25D366',
            action: `https://wa.me/${(contactInfo?.whatsapp || '34123456789').replace(/[^0-9]/g, '')}`,
        },
        {
            icon: <LocationOn sx={{ fontSize: 40 }} />,
            title: 'Dirección',
            value: contactInfo?.address || 'Calle Principal 123, Madrid',
            color: theme.palette.error.main,
            action: `https://maps.google.com/?q=${encodeURIComponent(contactInfo?.address || 'Calle Principal 123, Madrid')}`,
        },
    ];

    // Metrics data
    const metrics = [
        { value: 500, label: 'Proyectos Completados', suffix: '+' },
        { value: 8, label: 'Años de Experiencia', suffix: '+' },
        { value: 98, label: 'Satisfacción Cliente', suffix: '%' },
        { value: 24, label: 'Respuesta en Horas', suffix: 'h' },
    ];

    // Render step content
    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Stack spacing={3}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Nombre Completo"
                                    inputRef={nameRef}
                                    autoComplete="name"
                                    placeholder="Ej. Juan Pérez"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    error={!!errors.name}
                                    helperText={errors.name || 'Requerido'}
                                    required
                                    variant="outlined"
                                    disabled={processing}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Person color={errors.name ? 'error' : 'action'} />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    inputRef={emailRef}
                                    autoComplete="email"
                                    placeholder="ejemplo@correo.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    error={!!errors.email}
                                    helperText={errors.email || 'Requerido'}
                                    required
                                    variant="outlined"
                                    disabled={processing}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Email color={errors.email ? 'error' : 'action'} />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <FormControl component="fieldset" disabled={processing}>
                            <FormLabel component="legend">Preferencia de Contacto</FormLabel>
                            <RadioGroup
                                row
                                value={data.preferred_contact}
                                onChange={(e) => setData('preferred_contact', e.target.value)}
                            >
                                {['Email', 'Teléfono', 'WhatsApp'].map((opt) => (
                                    <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
                                ))}
                            </RadioGroup>
                            <FormHelperText>
                                {(data.preferred_contact === 'Teléfono' || data.preferred_contact === 'WhatsApp')
                                    ? '⚠️ El teléfono es obligatorio para esta opción'
                                    : 'Elige cómo prefieres que te contactemos'}
                            </FormHelperText>
                        </FormControl>

                        <TextField
                            fullWidth
                            label={
                                (data.preferred_contact === 'Teléfono' || data.preferred_contact === 'WhatsApp')
                                    ? 'Teléfono *'
                                    : 'Teléfono (Opcional)'
                            }
                            type="tel"
                            autoComplete="tel"
                            placeholder="+34 612 345 678"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            error={!!errors.phone || ((data.preferred_contact === 'Teléfono' || data.preferred_contact === 'WhatsApp') && !data.phone)}
                            helperText={
                                errors.phone ||
                                ((data.preferred_contact === 'Teléfono' || data.preferred_contact === 'WhatsApp') && !data.phone
                                    ? 'Requerido para contacto por ' + data.preferred_contact
                                    : 'Formato: +34 612 345 678')
                            }
                            required={(data.preferred_contact === 'Teléfono' || data.preferred_contact === 'WhatsApp')}
                            variant="outlined"
                            disabled={processing}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Phone color={errors.phone ? 'error' : 'action'} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <FormControl fullWidth size="small" disabled={processing}>
                            <InputLabel id="time-slot-label">Franja de contacto preferida</InputLabel>
                            <Select
                                labelId="time-slot-label"
                                value={data.contact_time}
                                label="Franja de contacto preferida"
                                onChange={(e) => setData('contact_time', e.target.value)}
                            >
                                {['Mañana (9-12)', 'Tarde (12-18)', 'Cualquier momento'].map((t) => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                );

            case 1:
                return (
                    <Stack spacing={3}>
                        <FormControl fullWidth disabled={processing} error={!!errors.service}>
                            <InputLabel id="service-select-label">Servicio de Interés</InputLabel>
                            <Select
                                labelId="service-select-label"
                                value={data.service}
                                onChange={(e) => setData('service', e.target.value)}
                                label="Servicio de Interés"
                                startAdornment={
                                    <InputAdornment position="start">
                                        <Business color="action" />
                                    </InputAdornment>
                                }
                            >
                                <MenuItem value="">
                                    <em>Selecciona un servicio</em>
                                </MenuItem>
                                {servicesList.map((service) => (
                                    <MenuItem key={service} value={service}>
                                        {service}
                                    </MenuItem>
                                ))}
                            </Select>
                            {!!errors.service && (
                                <FormHelperText>{errors.service}</FormHelperText>
                            )}
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Mensaje"
                            multiline
                            rows={8}
                            inputRef={messageRef}
                            placeholder="Cuéntanos sobre tu proyecto: qué necesitas, tiempos estimados, presupuesto aproximado..."
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            error={!!errors.message}
                            helperText={errors.message || `${(data.message || '').length}/2000 caracteres. Mínimo 10 caracteres.`}
                            required
                            variant="outlined"
                            disabled={processing}
                            inputProps={{ maxLength: 2000 }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                                            <Message color={errors.message ? 'error' : 'action'} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Stack>
                );

            case 2:
                return (
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                                Archivos Adjuntos (Opcional)
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Puedes adjuntar imágenes o PDFs de tu proyecto (máx. 5MB por archivo)
                            </Typography>

                            <Button
                                variant="outlined"
                                component="label"
                                disabled={processing}
                                startIcon={<AttachFile />}
                                sx={{ mb: 2 }}
                            >
                                Seleccionar Archivos
                                <input
                                    type="file"
                                    hidden
                                    multiple
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={handleFileUpload}
                                />
                            </Button>

                            {uploadedFiles.length > 0 && (
                                <List sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                                    {uploadedFiles.map((file, index) => (
                                        <ListItem
                                            key={index}
                                            secondaryAction={
                                                <IconButton edge="end" onClick={() => removeFile(index)}>
                                                    <Delete />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemIcon>
                                                <AttachFile />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={file.name}
                                                secondary={`${(file.size / 1024).toFixed(2)} KB`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>

                        <Divider />

                        <Box>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={data.privacy_accepted}
                                        onChange={(e) => setData('privacy_accepted', e.target.checked)}
                                        color="primary"
                                        disabled={processing}
                                    />
                                }
                                label={
                                    <Typography variant="body2">
                                        Acepto la{' '}
                                        <MuiLink
                                            component="button"
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPrivacyModalOpen(true);
                                            }}
                                            sx={{ color: 'primary.main', textDecoration: 'underline' }}
                                        >
                                            política de privacidad
                                        </MuiLink>
                                        {' '}*
                                    </Typography>
                                }
                            />
                            {errors.privacy_accepted && (
                                <FormHelperText error>
                                    {errors.privacy_accepted}
                                </FormHelperText>
                            )}
                        </Box>

                        <Alert severity="info" icon={<Shield />}>
                            <Typography variant="body2">
                                <strong>Tu privacidad es importante.</strong> Los datos del formulario se guardan localmente como borrador y se eliminan automáticamente al enviar.
                            </Typography>
                        </Alert>
                    </Stack>
                );

            case 3:
                // Success Step
                return (
                    <Stack spacing={4} alignItems="center" sx={{ py: 4 }}>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                            <Box
                                sx={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: '50%',
                                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: `0 12px 40px 0 ${alpha(theme.palette.success.main, 0.4)}`,
                                }}
                            >
                                <CheckCircle sx={{ fontSize: 70, color: 'white' }} />
                            </Box>
                        </motion.div>

                        <Stack spacing={2} alignItems="center" textAlign="center">
                            <Typography variant="h3" fontWeight="bold" color="success.main">
                                ¡Mensaje Enviado!
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600 }}>
                                Gracias por contactarnos. Hemos recibido tu mensaje correctamente.
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                                Nuestro equipo revisará tu solicitud y te contactaremos en las próximas <strong>24 horas</strong> a través de tu método de contacto preferido.
                            </Typography>
                        </Stack>

                        <Box
                            sx={{
                                ...glassStyle,
                                p: 3,
                                width: '100%',
                                maxWidth: 500,
                            }}
                        >
                            <Stack spacing={2}>
                                <Typography variant="subtitle1" fontWeight="600" color="primary">
                                    Resumen de tu Solicitud:
                                </Typography>
                                <Divider />
                                <Stack spacing={1.5}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Nombre:</Typography>
                                        <Typography variant="body2" fontWeight="500">{data.name}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Email:</Typography>
                                        <Typography variant="body2" fontWeight="500">{data.email}</Typography>
                                    </Box>
                                    {data.phone && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">Teléfono:</Typography>
                                            <Typography variant="body2" fontWeight="500">{data.phone}</Typography>
                                        </Box>
                                    )}
                                    {data.preferred_contact && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">Contacto Preferido:</Typography>
                                            <Typography variant="body2" fontWeight="500">{data.preferred_contact}</Typography>
                                        </Box>
                                    )}
                                    {data.service && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">Servicio:</Typography>
                                            <Typography variant="body2" fontWeight="500">{data.service}</Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </Stack>
                        </Box>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => {
                                    reset();
                                    setUploadedFiles([]);
                                    setActiveStep(0);
                                    setSubmissionSuccess(false);
                                    setSubmitted(false);
                                }}
                                sx={{
                                    py: 1.5,
                                    px: 4,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                }}
                            >
                                Enviar Otro Mensaje
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                component={Link}
                                href={route('home')}
                                sx={{ py: 1.5, px: 4 }}
                            >
                                Volver al Inicio
                            </Button>
                        </Stack>

                        <Alert severity="info" sx={{ maxWidth: 600 }}>
                            <Typography variant="body2">
                                <strong>¿Necesitas ayuda urgente?</strong> Llámanos directamente al{' '}
                                <strong>{contactInfo?.phone || '+34 123 456 789'}</strong> o escríbenos por WhatsApp.
                            </Typography>
                        </Alert>
                    </Stack>
                );

            default:
                return null;
        }
    };

    return (
        <MainLayout>
            <Head title={seo?.title || 'Contacto - MDR Construcciones'}>
                <meta name="description" content={seo?.description || 'Contacta con MDR Construcciones para tu proyecto de reforma o construcción.'} />
            </Head>

            {/* Hero Section */}
            <Box
                component={motion.div}
                initial={reduceMotion ? undefined : { opacity: 0, y: 30 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={reduceMotion ? undefined : { duration: 0.6 }}
                sx={{
                    position: 'relative',
                    minHeight: { xs: '300px', md: '400px' },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'url(/images/hero-contact.svg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.2,
                    },
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3, color: 'white' }}>
                        <Link href={route('home')} style={{ color: 'white', textDecoration: 'none' }}>
                            Inicio
                        </Link>
                        <Typography color="white">Contacto</Typography>
                    </Breadcrumbs>

                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '2.5rem', md: '3.5rem' },
                            fontWeight: 800,
                            mb: 2,
                            background: `linear-gradient(135deg, #ffffff 0%, ${alpha('#ffffff', 0.8)} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Hablemos de tu Proyecto
                    </Typography>

                    <Typography variant="h5" sx={{ fontSize: { xs: '1.1rem', md: '1.3rem' }, fontWeight: 300, mb: 3, maxWidth: '800px' }}>
                        Estamos listos para convertir tus ideas en realidad. Contáctanos y recibe un presupuesto personalizado.
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Chip
                            icon={isAvailable ? <CheckCircle /> : <Schedule />}
                            label={isAvailable ? 'Disponibles Ahora' : 'Fuera de Horario'}
                            sx={{
                                background: isAvailable ? alpha('#4caf50', 0.9) : alpha('#ffffff', 0.15),
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '1rem',
                                py: 2.5,
                                px: 2,
                            }}
                        />
                        <Chip
                            icon={<AccessTime />}
                            label="Respondemos en < 24h"
                            sx={{
                                background: alpha('#2196f3', 0.9),
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '1rem',
                                py: 2.5,
                                px: 2,
                            }}
                        />
                    </Stack>
                </Container>
            </Box>

            {/* Metrics Band */}
            <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), py: 4 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={3}>
                        {metrics.map((metric, index) => (
                            <Grid item xs={6} md={3} key={index}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h3" fontWeight={700} color="primary.main">
                                        <CountUp end={metric.value} duration={2.5} />
                                        {metric.suffix}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {metric.label}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
                <Grid container spacing={4}>
                    {/* Contact Form with Stepper */}
                    <Grid item xs={12} lg={8}>
                        <Card sx={{ ...glassStyle, p: { xs: 2, md: 4 } }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                                    <Typography variant="h4" fontWeight="bold" color="primary">
                                        Formulario de Contacto
                                    </Typography>
                                    <Button
                                        size="small"
                                        startIcon={<RestartAlt />}
                                        onClick={clearDraft}
                                        disabled={processing}
                                    >
                                        Reiniciar
                                    </Button>
                                </Stack>

                                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                                    {steps.map((label) => (
                                        <Step key={label}>
                                            <StepLabel>{label}</StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>

                                <form onSubmit={handleSubmit}>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeStep}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {renderStepContent(activeStep)}
                                        </motion.div>
                                    </AnimatePresence>

                                    {/* Hide navigation buttons on success step */}
                                    {activeStep !== 3 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                                            <Button
                                                disabled={activeStep === 0 || processing}
                                                onClick={handleBack}
                                                startIcon={<ArrowBack />}
                                            >
                                                Atrás
                                            </Button>

                                            {activeStep === 2 ? (
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    size="large"
                                                    disabled={processing || !validateStep(activeStep)}
                                                    endIcon={processing ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                                    sx={{
                                                        py: 1.5,
                                                        px: 4,
                                                        fontSize: '1.1rem',
                                                        fontWeight: 600,
                                                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                                        boxShadow: `0 8px 24px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                                                    }}
                                                >
                                                    Enviar Mensaje
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    onClick={handleNext}
                                                    disabled={!validateStep(activeStep) || processing}
                                                    endIcon={<ArrowForward />}
                                                >
                                                    Siguiente
                                                </Button>
                                            )}
                                        </Box>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Contact Info Sidebar */}
                    <Grid item xs={12} lg={4}>
                        <Stack spacing={3}>
                            {/* Contact Methods */}
                            {contactMethods.map((method, index) => (
                                <Card
                                    key={index}
                                    component={motion.div}
                                    whileHover={{ scale: 1.02 }}
                                    sx={{
                                        ...glassStyle,
                                        p: 2,
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => window.open(method.action, '_blank')}
                                >
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ color: method.color }}>
                                            {method.icon}
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                {method.title}
                                            </Typography>
                                            <Typography variant="body1" fontWeight={600}>
                                                {method.value}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Card>
                            ))}

                            {/* Why Choose Us */}
                            <Card sx={{ ...glassStyle, p: 3 }}>
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    ¿Por qué elegirnos?
                                </Typography>
                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Verified color="primary" />
                                        <Typography variant="body2">+8 Años de Experiencia</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Shield color="success" />
                                        <Typography variant="body2">Garantía Total</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <TrendingUp color="warning" />
                                        <Typography variant="body2">Calidad Premium</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Euro color="info" />
                                        <Typography variant="body2">Precio Justo</Typography>
                                    </Stack>
                                </Stack>
                            </Card>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>

            {/* Privacy Modal */}
            <PrivacyPolicyModal
                open={privacyModalOpen}
                onClose={() => setPrivacyModalOpen(false)}
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </MainLayout>
    );
}

/**
 * Main Contact Page Component with reCAPTCHA Provider
 */
export default function Contact(props) {
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    if (!recaptchaSiteKey) {
        console.error('reCAPTCHA site key is not configured');
        return (
            <MainLayout>
                <Container maxWidth="md" sx={{ py: 8 }}>
                    <Alert severity="error">
                        Error de configuración: reCAPTCHA no está disponible. Por favor, contacta al administrador.
                    </Alert>
                </Container>
            </MainLayout>
        );
    }

    return (
        <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
            <ContactFormContent {...props} />
        </GoogleReCaptchaProvider>
    );
}

