import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Alert,
    Grid,
    Paper,
    Chip,
    Autocomplete,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormLabel,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stepper,
    Step,
    StepLabel,
    Switch,
    Tooltip,
    IconButton,
    Collapse,
    Stack,
    CircularProgress,
    InputAdornment,
} from '@mui/material';
import {
    Send as SendIcon,
    Preview as PreviewIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    CheckCircle as SuccessIcon,
    Settings as SystemIcon,
    Schedule as ScheduleIcon,
    Repeat as RepeatIcon,
    NavigateNext as NextIcon,
    NavigateBefore as BackIcon,
    HelpOutline as HelpIcon,
    People as PeopleIcon,
    Link as LinkIcon,
    Label as LabelIcon,
    History as HistoryIcon,
} from '@mui/icons-material';

export default function Send({ auth, users, userCounts, errors: serverErrors }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        message: '',
        type: 'info',
        priority: 'medium',
        action_url: '',
        action_text: '',
        recipient_type: 'all',
        role: 'user',
        user_ids: [],
        send_type: 'immediate',
        scheduled_at: '',
        is_recurring: false,
        recurrence_pattern: 'daily',
    });

    const [showPreview, setShowPreview] = useState(false);

    const stepDescriptions = {
        'Contenido': 'Define título, mensaje, tipo y prioridad.',
        'Destinatarios': 'Selecciona todos, por rol o usuarios específicos.',
        'Programación': 'Elige envío inmediato o programa fecha/hora y recurrencia.',
        'Revisión': 'Confirma el resumen y envía.',
    };

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = ['Contenido', 'Destinatarios', 'Programación', 'Revisión'];

    // Type icons mapping
    const typeIcons = {
        info: <InfoIcon />,
        warning: <WarningIcon />,
        error: <ErrorIcon />,
        success: <SuccessIcon />,
        system: <SystemIcon />,
    };

    // Type colors mapping
    const typeColors = {
        info: 'info',
        warning: 'warning',
        error: 'error',
        success: 'success',
        system: 'default',
    };

    // Priority colors mapping
    const priorityColors = {
        low: 'default',
        medium: 'primary',
        high: 'warning',
        urgent: 'error',
    };

    // Calculate recipient count
    const getRecipientCount = () => {
        switch (data.recipient_type) {
            case 'all':
                return userCounts.total;
            case 'role':
                return userCounts[data.role] || 0;
            case 'individual':
                return data.user_ids.length;
            default:
                return 0;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Prevent form submission - we handle it manually with the send button
        return false;
    };

    const handleSendClick = () => {
        // Show confirmation dialog for bulk sends
        if (getRecipientCount() > 10) {
            setShowConfirmDialog(true);
        } else {
            sendNotification();
        }
    };

    const sendNotification = () => {
        setShowConfirmDialog(false);
        post(route('admin.user-notifications.store'));
    };

    const handleNext = () => {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const canProceedToNextStep = () => {
        switch (currentStep) {
            case 0: // Contenido
                return data.title && data.message && data.type && data.priority;
            case 1: // Destinatarios
                if (data.recipient_type === 'role') {
                    return data.role;
                }
                if (data.recipient_type === 'individual') {
                    return data.user_ids.length > 0;
                }
                return true;
            case 2: // Programación
                if (data.send_type === 'scheduled') {
                    return data.scheduled_at;
                }
                return true;
            default:
                return true;
        }
    };

    return (
        <AdminLayoutNew auth={auth}>
            <Head title="Enviar Notificaciones" />

            <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: 'auto' }}>
                {/* Header */}
                <Box sx={{
                    mb: 4,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2
                }}>
                    <Box>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                            Enviar Notificaciones a Usuarios
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Envía notificaciones personalizadas a usuarios individuales, por rol o a todos los usuarios
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<HistoryIcon />}
                        onClick={() => router.visit(route('admin.user-notifications.history'))}
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        Ver Historial
                    </Button>
                </Box>

                {/* Server Errors */}
                {Object.keys(serverErrors || {}).length > 0 && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Por favor corrige los siguientes errores:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {Object.values(serverErrors).map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </Alert>
                )}

                {/* Stepper */}
                <Card
                    elevation={0}
                    sx={{
                        mb: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        overflow: 'hidden'
                    }}
                >
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Stepper
                            activeStep={currentStep}
                            alternativeLabel
                            sx={{
                                '& .MuiStepLabel-label': {
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                }
                            }}
                        >
                            {steps.map((label) => (
                                <Step key={label}>
                                    <Tooltip title={stepDescriptions[label]} arrow>
                                        <StepLabel>{label}</StepLabel>
                                    </Tooltip>
                                </Step>
                            ))}
                        </Stepper>
                    </CardContent>
                </Card>

                <Grid container spacing={{ xs: 2, md: 3 }}>
                    {/* Form */}
                    <Grid item xs={12} lg={8}>
                        <Card
                            elevation={0}
                            sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                                <form onSubmit={handleSubmit}>
                                    {/* STEP 0: Contenido */}
                                    {currentStep === 0 && (
                                        <Box
                                            sx={{
                                                animation: 'fadeIn 0.3s ease-in',
                                                '@keyframes fadeIn': {
                                                    from: { opacity: 0, transform: 'translateY(10px)' },
                                                    to: { opacity: 1, transform: 'translateY(0)' }
                                                }
                                            }}
                                        >
                                            <Box sx={{
                                                mb: 4,
                                                p: 2,
                                                borderRadius: 2,
                                                bgcolor: 'primary.50',
                                                border: '1px solid',
                                                borderColor: 'primary.200'
                                            }}>
                                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                                                    <InfoIcon color="primary" />
                                                    Contenido de la Notificación
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Define el mensaje que recibirán los usuarios
                                                </Typography>
                                            </Box>

                                            {/* Title */}
                                            <TextField
                                                fullWidth
                                                label="Título de la Notificación"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                error={!!errors.title}
                                                helperText={errors.title || `${data.title.length}/200 caracteres`}
                                                required
                                                sx={{
                                                    mb: 3,
                                                    '& .MuiOutlinedInput-root': {
                                                        '&:hover fieldset': {
                                                            borderColor: 'primary.main',
                                                        },
                                                    }
                                                }}
                                                inputProps={{ maxLength: 200 }}
                                            />

                                            {/* Message */}
                                            <TextField
                                                fullWidth
                                                label="Mensaje"
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                error={!!errors.message}
                                                helperText={errors.message || `${data.message.length}/1000 caracteres`}
                                                required
                                                multiline
                                                rows={6}
                                                sx={{
                                                    mb: 3,
                                                    '& .MuiOutlinedInput-root': {
                                                        '&:hover fieldset': {
                                                            borderColor: 'primary.main',
                                                        },
                                                    }
                                                }}
                                                inputProps={{ maxLength: 1000 }}
                                            />

                                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                                {/* Type */}
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth error={!!errors.type}>
                                                        <InputLabel>Tipo</InputLabel>
                                                        <Select
                                                            value={data.type}
                                                            onChange={(e) => setData('type', e.target.value)}
                                                            label="Tipo"
                                                        >
                                                            <MenuItem value="info">
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <InfoIcon fontSize="small" color="info" />
                                                                    Información
                                                                </Box>
                                                            </MenuItem>
                                                            <MenuItem value="success">
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <SuccessIcon fontSize="small" color="success" />
                                                                    Éxito
                                                                </Box>
                                                            </MenuItem>
                                                            <MenuItem value="warning">
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <WarningIcon fontSize="small" color="warning" />
                                                                    Advertencia
                                                                </Box>
                                                            </MenuItem>
                                                            <MenuItem value="error">
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <ErrorIcon fontSize="small" color="error" />
                                                                    Error
                                                                </Box>
                                                            </MenuItem>
                                                            <MenuItem value="system">
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <SystemIcon fontSize="small" />
                                                                    Sistema
                                                                </Box>
                                                            </MenuItem>
                                                        </Select>
                                                        {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                                                    </FormControl>
                                                </Grid>

                                                {/* Priority */}
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth error={!!errors.priority}>
                                                        <InputLabel>Prioridad</InputLabel>
                                                        <Select
                                                            value={data.priority}
                                                            onChange={(e) => setData('priority', e.target.value)}
                                                            label="Prioridad"
                                                        >
                                                            <MenuItem value="low">🟢 Baja</MenuItem>
                                                            <MenuItem value="medium">🔵 Media</MenuItem>
                                                            <MenuItem value="high">🟡 Alta</MenuItem>
                                                            <MenuItem value="urgent">🔴 Urgente</MenuItem>
                                                        </Select>
                                                        {errors.priority && <FormHelperText>{errors.priority}</FormHelperText>}
                                                    </FormControl>
                                                </Grid>
                                            </Grid>

                                            <Divider sx={{ my: 3 }} />

                                            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                                                Acción Opcional
                                            </Typography>

                                            {/* Action URL (Optional) */}
                                            <TextField
                                                fullWidth
                                                label="URL de Acción (Opcional)"
                                                value={data.action_url}
                                                onChange={(e) => setData('action_url', e.target.value)}
                                                error={!!errors.action_url}
                                                helperText={errors.action_url || 'URL a la que se redirigirá al hacer clic'}
                                                sx={{ mb: 2 }}
                                                inputProps={{ maxLength: 500 }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <LinkIcon fontSize="small" />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />

                                            {/* Action Text (Optional) */}
                                            <TextField
                                                fullWidth
                                                label="Texto del Botón de Acción (Opcional)"
                                                value={data.action_text}
                                                onChange={(e) => setData('action_text', e.target.value)}
                                                error={!!errors.action_text}
                                                helperText={errors.action_text || 'Ej: "Ver más", "Ir al perfil"'}
                                                sx={{ mb: 3 }}
                                                inputProps={{ maxLength: 100 }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <LabelIcon fontSize="small" />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Box>
                                    )}

                                    {/* STEP 1: Destinatarios */}
                                    {currentStep === 1 && (
                                        <Box
                                            sx={{
                                                animation: 'fadeIn 0.3s ease-in',
                                                '@keyframes fadeIn': {
                                                    from: { opacity: 0, transform: 'translateY(10px)' },
                                                    to: { opacity: 1, transform: 'translateY(0)' }
                                                }
                                            }}
                                        >
                                            <Box sx={{
                                                mb: 4,
                                                p: 2,
                                                borderRadius: 2,
                                                bgcolor: 'success.50',
                                                border: '1px solid',
                                                borderColor: 'success.200'
                                            }}>
                                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                                                    <PeopleIcon color="success" />
                                                    Seleccionar Destinatarios
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Elige quién recibirá esta notificación
                                                </Typography>
                                            </Box>

                                            <FormControl component="fieldset" error={!!errors.recipient_type} sx={{ mb: 3, width: '100%' }}>
                                                <FormLabel component="legend" sx={{ fontWeight: 600, mb: 2 }}>Tipo de Destinatario</FormLabel>
                                                <RadioGroup
                                                    value={data.recipient_type}
                                                    onChange={(e) => setData('recipient_type', e.target.value)}
                                                >
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            mb: 1.5,
                                                            border: '2px solid',
                                                            borderColor: data.recipient_type === 'all' ? 'primary.main' : 'divider',
                                                            borderRadius: 2,
                                                            transition: 'all 0.2s',
                                                            '&:hover': {
                                                                borderColor: 'primary.light',
                                                                bgcolor: 'action.hover'
                                                            }
                                                        }}
                                                    >
                                                        <FormControlLabel
                                                            value="all"
                                                            control={<Radio />}
                                                            label={
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Typography fontWeight={500}>🌐 Todos los usuarios</Typography>
                                                                    <Chip label={userCounts.total} size="small" color="primary" />
                                                                </Box>
                                                            }
                                                            sx={{ width: '100%', m: 0 }}
                                                        />
                                                    </Paper>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            mb: 1.5,
                                                            border: '2px solid',
                                                            borderColor: data.recipient_type === 'role' ? 'primary.main' : 'divider',
                                                            borderRadius: 2,
                                                            transition: 'all 0.2s',
                                                            '&:hover': {
                                                                borderColor: 'primary.light',
                                                                bgcolor: 'action.hover'
                                                            }
                                                        }}
                                                    >
                                                        <FormControlLabel
                                                            value="role"
                                                            control={<Radio />}
                                                            label={<Typography fontWeight={500}>👥 Por rol específico</Typography>}
                                                            sx={{ width: '100%', m: 0 }}
                                                        />
                                                    </Paper>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            mb: 1.5,
                                                            border: '2px solid',
                                                            borderColor: data.recipient_type === 'individual' ? 'primary.main' : 'divider',
                                                            borderRadius: 2,
                                                            transition: 'all 0.2s',
                                                            '&:hover': {
                                                                borderColor: 'primary.light',
                                                                bgcolor: 'action.hover'
                                                            }
                                                        }}
                                                    >
                                                        <FormControlLabel
                                                            value="individual"
                                                            control={<Radio />}
                                                            label={<Typography fontWeight={500}>👤 Usuarios individuales</Typography>}
                                                            sx={{ width: '100%', m: 0 }}
                                                        />
                                                    </Paper>
                                                </RadioGroup>
                                                {errors.recipient_type && <FormHelperText>{errors.recipient_type}</FormHelperText>}
                                            </FormControl>

                                            {/* Role Selection */}
                                            <Collapse in={data.recipient_type === 'role'}>
                                                {data.recipient_type === 'role' && (
                                                    <FormControl fullWidth error={!!errors.role} sx={{ mb: 3 }}>
                                                        <InputLabel>Rol</InputLabel>
                                                        <Select
                                                            value={data.role}
                                                            onChange={(e) => setData('role', e.target.value)}
                                                            label="Rol"
                                                        >
                                                            <MenuItem value="admin">
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                                    <span>👑 Administradores</span>
                                                                    <Chip label={userCounts.admin} size="small" color="error" />
                                                                </Box>
                                                            </MenuItem>
                                                            <MenuItem value="editor">
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                                    <span>✏️ Editores</span>
                                                                    <Chip label={userCounts.editor} size="small" color="warning" />
                                                                </Box>
                                                            </MenuItem>
                                                            <MenuItem value="user">
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                                    <span>👤 Usuarios</span>
                                                                    <Chip label={userCounts.user} size="small" color="primary" />
                                                                </Box>
                                                            </MenuItem>
                                                        </Select>
                                                        {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                                                    </FormControl>
                                                )}
                                            </Collapse>

                                            {/* Individual User Selection */}
                                            <Collapse in={data.recipient_type === 'individual'}>
                                                {data.recipient_type === 'individual' && (
                                                    <Autocomplete
                                                        multiple
                                                        options={users}
                                                        getOptionLabel={(option) => `${option.name} (${option.email})`}
                                                        value={users.filter(u => data.user_ids.includes(u.id))}
                                                        onChange={(e, newValue) => setData('user_ids', newValue.map(u => u.id))}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Seleccionar Usuarios"
                                                                error={!!errors.user_ids}
                                                                helperText={errors.user_ids || `${data.user_ids.length} usuario(s) seleccionado(s)`}
                                                            />
                                                        )}
                                                        sx={{ mb: 3 }}
                                                    />
                                                )}
                                            </Collapse>

                                            <Alert
                                                severity="info"
                                                sx={{
                                                    mt: 2,
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor: 'info.light'
                                                }}
                                            >
                                                <Typography variant="body2" fontWeight={500}>
                                                    <strong>📊 Total de destinatarios:</strong> {getRecipientCount()} usuario(s)
                                                </Typography>
                                            </Alert>
                                        </Box>
                                    )}

                                    {/* STEP 2: Programación */}
                                    {currentStep === 2 && (
                                        <Box
                                            sx={{
                                                animation: 'fadeIn 0.3s ease-in',
                                                '@keyframes fadeIn': {
                                                    from: { opacity: 0, transform: 'translateY(10px)' },
                                                    to: { opacity: 1, transform: 'translateY(0)' }
                                                }
                                            }}
                                        >
                                            <Box sx={{
                                                mb: 4,
                                                p: 2,
                                                borderRadius: 2,
                                                bgcolor: 'warning.50',
                                                border: '1px solid',
                                                borderColor: 'warning.200'
                                            }}>
                                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                                                    <ScheduleIcon color="warning" />
                                                    Programación de Envío
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Decide cuándo se enviará la notificación
                                                </Typography>
                                            </Box>

                                            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
                                                <FormLabel component="legend" sx={{ fontWeight: 600, mb: 2 }}>Tipo de Envío</FormLabel>
                                                <RadioGroup
                                                    value={data.send_type}
                                                    onChange={(e) => setData('send_type', e.target.value)}
                                                >
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            mb: 1.5,
                                                            border: '2px solid',
                                                            borderColor: data.send_type === 'immediate' ? 'primary.main' : 'divider',
                                                            borderRadius: 2,
                                                            transition: 'all 0.2s',
                                                            '&:hover': {
                                                                borderColor: 'primary.light',
                                                                bgcolor: 'action.hover'
                                                            }
                                                        }}
                                                    >
                                                        <FormControlLabel
                                                            value="immediate"
                                                            control={<Radio />}
                                                            label={
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <SendIcon fontSize="small" color="primary" />
                                                                    <Typography fontWeight={500}>⚡ Enviar inmediatamente</Typography>
                                                                </Box>
                                                            }
                                                            sx={{ width: '100%', m: 0 }}
                                                        />
                                                    </Paper>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            mb: 1.5,
                                                            border: '2px solid',
                                                            borderColor: data.send_type === 'scheduled' ? 'primary.main' : 'divider',
                                                            borderRadius: 2,
                                                            transition: 'all 0.2s',
                                                            '&:hover': {
                                                                borderColor: 'primary.light',
                                                                bgcolor: 'action.hover'
                                                            }
                                                        }}
                                                    >
                                                        <FormControlLabel
                                                            value="scheduled"
                                                            control={<Radio />}
                                                            label={
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <ScheduleIcon fontSize="small" color="info" />
                                                                    <Typography fontWeight={500}>📅 Programar envío</Typography>
                                                                </Box>
                                                            }
                                                            sx={{ width: '100%', m: 0 }}
                                                        />
                                                    </Paper>
                                                </RadioGroup>
                                            </FormControl>

                                            {/* Scheduled Date/Time */}
                                            <Collapse in={data.send_type === 'scheduled'}>
                                                {data.send_type === 'scheduled' && (
                                                    <Box>
                                                        <TextField
                                                            fullWidth
                                                            label="Fecha y Hora de Envío"
                                                            type="datetime-local"
                                                            value={data.scheduled_at}
                                                            onChange={(e) => setData('scheduled_at', e.target.value)}
                                                            error={!!errors.scheduled_at}
                                                            helperText={errors.scheduled_at || 'Selecciona cuándo se enviará la notificación'}
                                                            InputLabelProps={{ shrink: true }}
                                                            inputProps={{ min: new Date().toISOString().slice(0,16) }}
                                                            sx={{ mb: 3 }}
                                                        />

                                                        <Divider sx={{ my: 3 }}>
                                                            <Chip label="Opciones Avanzadas" size="small" />
                                                        </Divider>

                                                        {/* Recurring Option */}
                                                        <Paper
                                                            elevation={0}
                                                            sx={{
                                                                p: 2,
                                                                mb: 2,
                                                                border: '1px solid',
                                                                borderColor: data.is_recurring ? 'info.main' : 'divider',
                                                                borderRadius: 2,
                                                                bgcolor: data.is_recurring ? 'info.50' : 'transparent',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <FormControlLabel
                                                                control={
                                                                    <Switch
                                                                        checked={data.is_recurring}
                                                                        onChange={(e) => setData('is_recurring', e.target.checked)}
                                                                        color="info"
                                                                    />
                                                                }
                                                                label={
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <RepeatIcon fontSize="small" color={data.is_recurring ? 'info' : 'action'} />
                                                                        <Typography fontWeight={500}>🔄 Notificación recurrente</Typography>
                                                                        <Tooltip title="La notificación se enviará automáticamente según el patrón seleccionado" arrow>
                                                                            <IconButton size="small">
                                                                                <HelpIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                            </Box>
                                                        }
                                                        sx={{ mb: 2 }}
                                                    />

                                                    {/* Recurrence Pattern */}
                                                    <Collapse in={data.is_recurring}>
                                                        {data.is_recurring && (
                                                            <Box sx={{ mt: 2 }}>
                                                                <FormControl fullWidth error={!!errors.recurrence_pattern} sx={{ mb: 2 }}>
                                                                    <InputLabel>Patrón de Recurrencia</InputLabel>
                                                                    <Select
                                                                        value={data.recurrence_pattern}
                                                                        onChange={(e) => setData('recurrence_pattern', e.target.value)}
                                                                        label="Patrón de Recurrencia"
                                                                    >
                                                                        <MenuItem value="daily">📅 Diario</MenuItem>
                                                                        <MenuItem value="weekly">📆 Semanal</MenuItem>
                                                                        <MenuItem value="monthly">🗓️ Mensual</MenuItem>
                                                                    </Select>
                                                                    {errors.recurrence_pattern && <FormHelperText>{errors.recurrence_pattern}</FormHelperText>}
                                                                </FormControl>

                                                                <Alert
                                                                    severity="warning"
                                                                    sx={{
                                                                        borderRadius: 2,
                                                                        border: '1px solid',
                                                                        borderColor: 'warning.light'
                                                                    }}
                                                                >
                                                                    <Typography variant="body2">
                                                                        <strong>⚠️ Nota:</strong> Las notificaciones recurrentes se crearán automáticamente según el patrón seleccionado.
                                                                    </Typography>
                                                                </Alert>
                                                            </Box>
                                                        )}
                                                    </Collapse>
                                                </Paper>
                                                </Box>
                                            )}
                                            </Collapse>
                                        </Box>
                                    )}

                                    {/* STEP 3: Revisión */}
                                    {currentStep === 3 && (
                                        <Box
                                            sx={{
                                                animation: 'fadeIn 0.3s ease-in',
                                                '@keyframes fadeIn': {
                                                    from: { opacity: 0, transform: 'translateY(10px)' },
                                                    to: { opacity: 1, transform: 'translateY(0)' }
                                                }
                                            }}
                                        >
                                            <Box sx={{
                                                mb: 4,
                                                p: 2,
                                                borderRadius: 2,
                                                bgcolor: 'info.50',
                                                border: '1px solid',
                                                borderColor: 'info.200'
                                            }}>
                                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                                                    <PreviewIcon color="info" />
                                                    Revisión Final
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Verifica que todo esté correcto antes de enviar
                                                </Typography>
                                            </Box>

                                            <Stack spacing={3}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 3,
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        borderRadius: 2,
                                                        bgcolor: 'background.paper'
                                                    }}
                                                >
                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                                        📝 Contenido
                                                    </Typography>
                                                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
                                                        {data.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                        {data.message}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                                        <Chip label={data.type} color={typeColors[data.type]} size="small" />
                                                        <Chip label={data.priority} color={priorityColors[data.priority]} size="small" />
                                                    </Box>
                                                </Paper>

                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 3,
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        borderRadius: 2,
                                                        bgcolor: 'background.paper'
                                                    }}
                                                >
                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                                        👥 Destinatarios
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {data.recipient_type === 'all' && `🌐 Todos los usuarios (${userCounts.total})`}
                                                        {data.recipient_type === 'role' && `👥 Rol: ${data.role} (${userCounts[data.role]} usuarios)`}
                                                        {data.recipient_type === 'individual' && `👤 ${data.user_ids.length} usuario(s) seleccionado(s)`}
                                                    </Typography>
                                                </Paper>

                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 3,
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        borderRadius: 2,
                                                        bgcolor: 'background.paper'
                                                    }}
                                                >
                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                                        ⏰ Programación
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight={500}>
                                                        {data.send_type === 'immediate' ? '⚡ Envío inmediato' : `📅 Programado para: ${data.scheduled_at}`}
                                                    </Typography>
                                                    {data.is_recurring && (
                                                        <Chip label={`🔄 Recurrente: ${data.recurrence_pattern}`} color="info" size="small" sx={{ mt: 1.5 }} />
                                                    )}
                                                </Paper>

                                                {(data.action_url || data.action_text) && (
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 3,
                                                            border: '1px solid',
                                                            borderColor: 'divider',
                                                            borderRadius: 2,
                                                            bgcolor: 'background.paper'
                                                        }}
                                                    >
                                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                                            🔗 Acción
                                                        </Typography>
                                                        {data.action_text && (
                                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                                <strong>Texto:</strong> {data.action_text}
                                                            </Typography>
                                                        )}
                                                        {data.action_url && (
                                                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                                                <strong>URL:</strong> {data.action_url}
                                                            </Typography>
                                                        )}
                                                    </Paper>
                                                )}
                                            </Stack>
                                        </Box>
                                    )}

                                    {/* Navigation Buttons */}
                                    <Box sx={{
                                        display: 'flex',
                                        gap: 2,
                                        justifyContent: 'space-between',
                                        mt: 5,
                                        pt: 3,
                                        borderTop: '2px solid',
                                        borderColor: 'divider'
                                    }}>
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            startIcon={<BackIcon />}
                                            onClick={handleBack}
                                            disabled={currentStep === 0}
                                            size="large"
                                            sx={{
                                                minWidth: 120,
                                                '&:hover': {
                                                    transform: 'translateX(-4px)',
                                                    transition: 'transform 0.2s'
                                                }
                                            }}
                                        >
                                            Anterior
                                        </Button>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Button
                                                type="button"
                                                variant="outlined"
                                                startIcon={<PreviewIcon />}
                                                onClick={() => setShowPreview(true)}
                                                size="large"
                                                sx={{ minWidth: 140 }}
                                            >
                                                Vista Previa
                                            </Button>
                                            {currentStep < steps.length - 1 ? (
                                                <Button
                                                    type="button"
                                                    variant="contained"
                                                    endIcon={<NextIcon />}
                                                    onClick={handleNext}
                                                    disabled={!canProceedToNextStep()}
                                                    size="large"
                                                    sx={{
                                                        minWidth: 140,
                                                        '&:hover': {
                                                            transform: 'translateX(4px)',
                                                            transition: 'transform 0.2s'
                                                        }
                                                    }}
                                                >
                                                    Siguiente
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="contained"
                                                    onClick={handleSendClick}
                                                    startIcon={processing ? <CircularProgress color="inherit" size={18} /> : <SendIcon />}
                                                    disabled={processing}
                                                    color="success"
                                                    size="large"
                                                    sx={{
                                                        minWidth: 200,
                                                        fontWeight: 600,
                                                        boxShadow: 3,
                                                        '&:hover': {
                                                            boxShadow: 6,
                                                            transform: 'translateY(-2px)',
                                                            transition: 'all 0.2s'
                                                        }
                                                    }}
                                                >
                                                    {processing ? 'Enviando...' : `✉️ Enviar a ${getRecipientCount()} usuario(s)`}
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </form>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Sidebar - Statistics */}
                    <Grid item xs={12} lg={4}>
                        <Box sx={{ position: { lg: 'sticky' }, top: 80, height: 'fit-content' }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    mb: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white'
                                }}
                            >
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'white' }}>
                                    📊 Resumen Actual
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                    <Chip
                                        icon={typeIcons[data.type]}
                                        label={data.type}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            '& .MuiChip-icon': { color: 'white' }
                                        }}
                                    />
                                    <Chip
                                        label={`Prioridad: ${data.priority}`}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'white'
                                        }}
                                    />
                                    <Chip
                                        label={`👥 ${getRecipientCount()}`}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.3)',
                                            color: 'white',
                                            fontWeight: 600
                                        }}
                                    />
                                </Box>
                                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
                                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                                    Programación
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {data.send_type === 'immediate' ? '⚡ Envío inmediato' : `📅 ${data.scheduled_at || '(sin fecha)'}`}
                                </Typography>
                                {data.is_recurring && (
                                    <Chip
                                        label={`🔄 ${data.recurrence_pattern}`}
                                        size="small"
                                        sx={{
                                            mt: 1.5,
                                            bgcolor: 'rgba(255,255,255,0.25)',
                                            color: 'white',
                                            fontWeight: 500
                                        }}
                                    />
                                )}
                            </Paper>

                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                mb: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2
                            }}
                        >
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                📈 Estadísticas de Usuarios
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: 'action.hover'
                                }}>
                                    <Typography variant="body2" fontWeight={500}>Total:</Typography>
                                    <Chip label={userCounts.total} size="small" color="default" />
                                </Box>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: 'error.50'
                                }}>
                                    <Typography variant="body2" fontWeight={500}>Administradores:</Typography>
                                    <Chip label={userCounts.admin} size="small" color="error" />
                                </Box>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: 'warning.50'
                                }}>
                                    <Typography variant="body2" fontWeight={500}>Editores:</Typography>
                                    <Chip label={userCounts.editor} size="small" color="warning" />
                                </Box>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: 'primary.50'
                                }}>
                                    <Typography variant="body2" fontWeight={500}>Usuarios:</Typography>
                                    <Chip label={userCounts.user} size="small" color="primary" />
                                </Box>
                            </Box>
                        </Paper>

                        <Alert
                            severity="info"
                            sx={{
                                borderRadius: 2,
                                '& .MuiAlert-message': { width: '100%' }
                            }}
                        >
                            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                                💡 Consejos
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.875rem' }}>
                                <li>Usa títulos claros y concisos</li>
                                <li>El mensaje debe ser breve y directo</li>
                                <li>Selecciona la prioridad adecuada</li>
                                <li>Los envíos masivos se procesan en segundo plano</li>
                            </ul>
                        </Alert>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Preview Dialog */}
            <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Vista Previa de la Notificación</DialogTitle>
                <DialogContent>
                    <Alert
                        severity={typeColors[data.type]}
                        icon={typeIcons[data.type]}
                        sx={{ mb: 2 }}
                    >
                        <Typography variant="subtitle1" fontWeight="bold">
                            {data.title || '(Sin título)'}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {data.message || '(Sin mensaje)'}
                        </Typography>
                        {data.action_url && data.action_text && (
                            <Button
                                size="small"
                                variant="outlined"
                                sx={{ mt: 2 }}
                            >
                                {data.action_text}
                            </Button>
                        )}
                    </Alert>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                            label={`Prioridad: ${data.priority}`}
                            color={priorityColors[data.priority]}
                            size="small"
                        />
                        <Chip
                            label={`Tipo: ${data.type}`}
                            color={typeColors[data.type]}
                            size="small"
                        />
                        <Chip
                            label={`Destinatarios: ${getRecipientCount()}`}
                            size="small"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowPreview(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
                <DialogTitle>Confirmar Envío Masivo</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Estás a punto de enviar esta notificación a <strong>{getRecipientCount()} usuarios</strong>.
                    </Alert>
                    <Typography variant="body2" gutterBottom>
                        <strong>Título:</strong> {data.title}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        <strong>Mensaje:</strong> {data.message}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        <strong>Tipo:</strong> {data.type}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        <strong>Prioridad:</strong> {data.priority}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Esta acción no se puede deshacer. ¿Deseas continuar?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowConfirmDialog(false)}>Cancelar</Button>
                    <Button
                        onClick={sendNotification}
                        variant="contained"
                        color="primary"
                        disabled={processing}
                    >
                        Confirmar y Enviar
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayoutNew>
    );
}

