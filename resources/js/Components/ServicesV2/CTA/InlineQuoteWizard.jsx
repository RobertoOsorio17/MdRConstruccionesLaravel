/**
 * InlineQuoteWizard Component
 * 
 * Wizard multi-paso modal para solicitar cotizaciones sin abandonar la página.
 * Elimina las redirecciones externas a /contacto identificadas en la auditoría.
 * 
 * Props:
 * - open: boolean - Estado del modal
 * - onClose: function - Callback al cerrar
 * - service: object - Datos del servicio actual
 * - preselectedPlan: object - Plan preseleccionado (opcional)
 */

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Box,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stepper,
    Step,
    StepLabel,
    IconButton,
    LinearProgress,
    Alert,
    Stack,
    Fade,
    Zoom,
    InputAdornment
} from '@mui/material';
import {
    Close,
    ArrowForward,
    ArrowBack,
    CheckCircle,
    Person,
    Email,
    Phone,
    Business,
    LocationOn,
    AttachMoney,
    Download
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import designSystem from '@/theme/designSystem';
import { trackWizard, trackFormError } from '@/Utils/trackEvent';
import { formatCurrency } from '@/Utils/formatMetric';

const steps = ['Datos Básicos', 'Tipo de Proyecto', 'Ubicación y Presupuesto'];

// Validation schemas por paso
const validationSchemas = [
    // Paso 1: Datos Básicos
    Yup.object({
        name: Yup.string()
            .min(2, 'El nombre debe tener al menos 2 caracteres')
            .required('El nombre es obligatorio'),
        email: Yup.string()
            .email('Email inválido')
            .required('El email es obligatorio'),
        phone: Yup.string()
            .matches(/^[0-9]{9,15}$/, 'Teléfono inválido (9-15 dígitos)')
            .required('El teléfono es obligatorio')
    }),
    // Paso 2: Tipo de Proyecto
    Yup.object({
        projectType: Yup.string().required('Selecciona un tipo de proyecto'),
        description: Yup.string()
            .min(10, 'Describe tu proyecto con al menos 10 caracteres')
            .max(500, 'Máximo 500 caracteres')
            .required('La descripción es obligatoria')
    }),
    // Paso 3: Ubicación y Presupuesto
    Yup.object({
        location: Yup.string().required('La ubicación es obligatoria'),
        budget: Yup.string().required('Selecciona un rango de presupuesto'),
        timeline: Yup.string().required('Selecciona un plazo estimado')
    })
];

const InlineQuoteWizard = ({ open, onClose, service, preselectedPlan = null }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const formik = useFormik({
        initialValues: {
            // Paso 1
            name: '',
            email: '',
            phone: '',
            // Paso 2
            projectType: preselectedPlan?.name || '',
            description: '',
            // Paso 3
            location: '',
            budget: '',
            timeline: '',
            // Metadata
            service_slug: service?.slug || '',
            source: 'inline_wizard'
        },
        validationSchema: validationSchemas[activeStep],
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: async (values) => {
            if (activeStep === steps.length - 1) {
                await handleFinalSubmit(values);
            } else {
                handleNext();
            }
        }
    });

    const handleNext = () => {
        if (activeStep < steps.length - 1) {
            setActiveStep(prev => prev + 1);
            trackWizard('step', { 
                step: activeStep + 2, 
                service: service?.slug 
            });
        }
    };

    const handleBack = () => {
        if (activeStep > 0) {
            setActiveStep(prev => prev - 1);
        }
    };

    const handleFinalSubmit = async (values) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await axios.post('/api/quote-requests', values);

            if (response.data.success) {
                setSubmitSuccess(true);
                trackWizard('complete', {
                    service: service?.slug,
                    lead_value: values.budget,
                    project_type: values.projectType
                });

                // Auto-cerrar después de 3 segundos
                setTimeout(() => {
                    handleClose();
                }, 3000);
            }
        } catch (error) {
            console.error('Error submitting quote request:', error);
            setSubmitError(
                error.response?.data?.message || 
                'Hubo un error al enviar tu solicitud. Por favor, intenta nuevamente.'
            );
            trackFormError('submission', 'api_error', 'quote_wizard');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            if (activeStep > 0 && !submitSuccess) {
                trackWizard('abandon', { 
                    step: activeStep + 1, 
                    service: service?.slug 
                });
            }
            formik.resetForm();
            setActiveStep(0);
            setSubmitSuccess(false);
            setSubmitError(null);
            onClose();
        }
    };

    const handleOpen = () => {
        trackWizard('start', { service: service?.slug });
    };

    React.useEffect(() => {
        if (open) {
            handleOpen();
        }
    }, [open]);

    const progress = ((activeStep + 1) / steps.length) * 100;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
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
            {/* Header */}
            <DialogTitle
                sx={{
                    background: `linear-gradient(135deg, ${designSystem.colors.primary[600]} 0%, ${designSystem.colors.accent.purple} 100%)`,
                    color: designSystem.colors.text.inverse,
                    position: 'relative',
                    pb: designSystem.spacing[6]
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight={700}>
                        Solicitar Asesoría Personalizada
                    </Typography>
                    <IconButton
                        onClick={handleClose}
                        disabled={isSubmitting}
                        sx={{ color: designSystem.colors.text.inverse }}
                    >
                        <Close />
                    </IconButton>
                </Box>

                {service && (
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                        Servicio: {service.title}
                    </Typography>
                )}

                {/* Progress Bar */}
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': {
                            bgcolor: designSystem.colors.accent.emerald
                        }
                    }}
                />
            </DialogTitle>

            <DialogContent sx={{ p: designSystem.spacing[6] }}>
                {/* Stepper */}
                <Stepper activeStep={activeStep} sx={{ mb: designSystem.spacing[6] }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {/* Error Alert */}
                {submitError && (
                    <Alert severity="error" sx={{ mb: designSystem.spacing[4] }}>
                        {submitError}
                    </Alert>
                )}

                {/* Success State */}
                <AnimatePresence mode="wait">
                    {submitSuccess ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Box sx={{ textAlign: 'center', py: designSystem.spacing[8] }}>
                                <Zoom in={submitSuccess}>
                                    <CheckCircle
                                        sx={{
                                            fontSize: 80,
                                            color: designSystem.colors.success[600],
                                            mb: designSystem.spacing[4]
                                        }}
                                    />
                                </Zoom>
                                <Typography variant="h4" fontWeight={700} gutterBottom>
                                    ¡Solicitud Enviada!
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: designSystem.spacing[4] }}>
                                    Nos pondremos en contacto contigo en menos de 24 horas.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<Download />}
                                    sx={{ mt: designSystem.spacing[2] }}
                                >
                                    Descargar Resumen PDF
                                </Button>
                            </Box>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`step-${activeStep}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <form onSubmit={formik.handleSubmit}>
                                {/* Paso 1: Datos Básicos */}
                                {activeStep === 0 && (
                                    <Stack spacing={designSystem.spacing[4]}>
                                        <TextField
                                            fullWidth
                                            name="name"
                                            label="Nombre Completo"
                                            value={formik.values.name}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.name && Boolean(formik.errors.name)}
                                            helperText={formik.touched.name && formik.errors.name}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Person sx={{ color: designSystem.colors.primary[600] }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            name="email"
                                            type="email"
                                            label="Email"
                                            value={formik.values.email}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.email && Boolean(formik.errors.email)}
                                            helperText={formik.touched.email && formik.errors.email}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Email sx={{ color: designSystem.colors.primary[600] }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            name="phone"
                                            type="tel"
                                            label="Teléfono"
                                            value={formik.values.phone}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.phone && Boolean(formik.errors.phone)}
                                            helperText={formik.touched.phone && formik.errors.phone}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Phone sx={{ color: designSystem.colors.primary[600] }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    </Stack>
                                )}

                                {/* Paso 2: Tipo de Proyecto */}
                                {activeStep === 1 && (
                                    <Stack spacing={designSystem.spacing[4]}>
                                        <FormControl fullWidth>
                                            <InputLabel>Tipo de Proyecto</InputLabel>
                                            <Select
                                                name="projectType"
                                                value={formik.values.projectType}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.projectType && Boolean(formik.errors.projectType)}
                                                label="Tipo de Proyecto"
                                                startAdornment={
                                                    <InputAdornment position="start">
                                                        <Business sx={{ color: designSystem.colors.primary[600] }} />
                                                    </InputAdornment>
                                                }
                                            >
                                                <MenuItem value="Vivienda Nueva">Vivienda Nueva</MenuItem>
                                                <MenuItem value="Remodelación">Remodelación</MenuItem>
                                                <MenuItem value="Ampliación">Ampliación</MenuItem>
                                                <MenuItem value="Corporativo">Corporativo</MenuItem>
                                                <MenuItem value="Comercial">Comercial</MenuItem>
                                                <MenuItem value="Otro">Otro</MenuItem>
                                            </Select>
                                            {formik.touched.projectType && formik.errors.projectType && (
                                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                                    {formik.errors.projectType}
                                                </Typography>
                                            )}
                                        </FormControl>
                                        <TextField
                                            fullWidth
                                            name="description"
                                            label="Describe tu proyecto"
                                            multiline
                                            rows={4}
                                            value={formik.values.description}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.description && Boolean(formik.errors.description)}
                                            helperText={
                                                formik.touched.description && formik.errors.description
                                                    ? formik.errors.description
                                                    : `${formik.values.description.length}/500 caracteres`
                                            }
                                            placeholder="Cuéntanos sobre tu proyecto: objetivos, necesidades específicas, ideas..."
                                        />
                                    </Stack>
                                )}

                                {/* Paso 3: Ubicación y Presupuesto */}
                                {activeStep === 2 && (
                                    <Stack spacing={designSystem.spacing[4]}>
                                        <TextField
                                            fullWidth
                                            name="location"
                                            label="Ubicación del Proyecto"
                                            value={formik.values.location}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.location && Boolean(formik.errors.location)}
                                            helperText={formik.touched.location && formik.errors.location}
                                            placeholder="Ciudad, provincia o dirección aproximada"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LocationOn sx={{ color: designSystem.colors.primary[600] }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                        <FormControl fullWidth>
                                            <InputLabel>Presupuesto Estimado</InputLabel>
                                            <Select
                                                name="budget"
                                                value={formik.values.budget}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.budget && Boolean(formik.errors.budget)}
                                                label="Presupuesto Estimado"
                                                startAdornment={
                                                    <InputAdornment position="start">
                                                        <AttachMoney sx={{ color: designSystem.colors.primary[600] }} />
                                                    </InputAdornment>
                                                }
                                            >
                                                <MenuItem value="< 10.000€">Menos de 10.000€</MenuItem>
                                                <MenuItem value="10.000€ - 25.000€">10.000€ - 25.000€</MenuItem>
                                                <MenuItem value="25.000€ - 50.000€">25.000€ - 50.000€</MenuItem>
                                                <MenuItem value="50.000€ - 100.000€">50.000€ - 100.000€</MenuItem>
                                                <MenuItem value="> 100.000€">Más de 100.000€</MenuItem>
                                                <MenuItem value="No definido">Aún no definido</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <FormControl fullWidth>
                                            <InputLabel>Plazo Estimado</InputLabel>
                                            <Select
                                                name="timeline"
                                                value={formik.values.timeline}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.timeline && Boolean(formik.errors.timeline)}
                                                label="Plazo Estimado"
                                            >
                                                <MenuItem value="Urgente (< 1 mes)">Urgente (menos de 1 mes)</MenuItem>
                                                <MenuItem value="1-3 meses">1-3 meses</MenuItem>
                                                <MenuItem value="3-6 meses">3-6 meses</MenuItem>
                                                <MenuItem value="> 6 meses">Más de 6 meses</MenuItem>
                                                <MenuItem value="Flexible">Flexible</MenuItem>
                                            </Select>
                                        </FormControl>

                                        {/* Privacy Notice */}
                                        <Alert severity="info" sx={{ mt: designSystem.spacing[2] }}>
                                            <Typography variant="caption">
                                                Tus datos están protegidos según GDPR/LOPD. Respondemos en menos de 24h.
                                            </Typography>
                                        </Alert>
                                    </Stack>
                                )}

                                {/* Navigation Buttons */}
                                {!submitSuccess && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: designSystem.spacing[6] }}>
                                        <Button
                                            onClick={handleBack}
                                            disabled={activeStep === 0 || isSubmitting}
                                            startIcon={<ArrowBack />}
                                            sx={{ visibility: activeStep === 0 ? 'hidden' : 'visible' }}
                                        >
                                            Anterior
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={isSubmitting}
                                            endIcon={activeStep === steps.length - 1 ? <CheckCircle /> : <ArrowForward />}
                                            sx={{
                                                background: `linear-gradient(135deg, ${designSystem.colors.primary[600]} 0%, ${designSystem.colors.accent.purple} 100%)`,
                                                px: designSystem.spacing[6],
                                                transition: designSystem.transitions.presets.allNormal,
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: designSystem.shadows.colored.primaryHover
                                                }
                                            }}
                                        >
                                            {isSubmitting
                                                ? 'Enviando...'
                                                : activeStep === steps.length - 1
                                                ? 'Enviar Solicitud'
                                                : 'Siguiente'}
                                        </Button>
                                    </Box>
                                )}
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
};

export default InlineQuoteWizard;

