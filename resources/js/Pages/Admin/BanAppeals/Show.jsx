import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    TextField,
    Stack,
    Chip,
    Divider,
    Alert,
    Grid,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    alpha,
    useTheme,
    Stepper,
    Step,
    StepLabel,
    StepConnector,
    stepConnectorClasses,
    styled,
    Fade,
    Grow,
    Zoom,
    Avatar,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    CheckCircle as ApproveIcon,
    CheckCircle,
    Cancel as RejectIcon,
    Info as InfoIcon,
    ArrowBack as BackIcon,
    Gavel as GavelIcon,
    Person as PersonIcon,
    Block as BlockIcon,
    Email as EmailIcon,
    CalendarToday as CalendarIcon,
    AccessTime as TimeIcon,
    Computer as DeviceIcon,
    LocationOn as LocationIcon,
    Description as DescriptionIcon,
    AttachFile as AttachFileIcon,
    HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';
import { motion } from 'framer-motion';

// Custom Stepper Connector
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundImage: `linear-gradient(95deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundImage: `linear-gradient(95deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`,
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        height: 3,
        border: 0,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
        borderRadius: 1,
    },
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    ...(ownerState.active && {
        backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        boxShadow: `0 4px 10px 0 ${alpha(theme.palette.primary.main, 0.5)}`,
    }),
    ...(ownerState.completed && {
        backgroundImage: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
    }),
}));

function ColorlibStepIcon(props) {
    const { active, completed, className } = props;

    const icons = {
        1: <GavelIcon />,
        2: <InfoIcon />,
        3: <CheckCircle />,
    };

    return (
        <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
            {icons[String(props.icon)]}
        </ColorlibStepIconRoot>
    );
}

export default function Show({ appeal, ban, user }) {
    const theme = useTheme();
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);

    const approveForm = useForm({
        decision: 'approve',
        response: '',
    });

    const rejectForm = useForm({
        decision: 'reject',
        response: '',
    });

    const infoForm = useForm({
        decision: 'request_info',
        response: '',
    });

    const handleApprove = () => {
        approveForm.post(route('admin.ban-appeals.approve', appeal.id), {
            preserveScroll: true,
            onSuccess: () => {
                setApproveDialogOpen(false);
                approveForm.reset();
            },
        });
    };

    const handleReject = () => {
        rejectForm.post(route('admin.ban-appeals.reject', appeal.id), {
            preserveScroll: true,
            onSuccess: () => {
                setRejectDialogOpen(false);
                rejectForm.reset();
            },
        });
    };

    const handleRequestInfo = () => {
        infoForm.post(route('admin.ban-appeals.request-info', appeal.id), {
            preserveScroll: true,
            onSuccess: () => {
                setInfoDialogOpen(false);
                infoForm.reset();
            },
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'warning',
            approved: 'success',
            rejected: 'error',
            more_info_requested: 'info',
        };
        return colors[status] || 'default';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <PendingIcon />,
            approved: <ApproveIcon />,
            rejected: <RejectIcon />,
            more_info_requested: <InfoIcon />,
        };
        return icons[status] || <InfoIcon />;
    };

    const canReview = appeal.status === 'pending' || appeal.status === 'more_info_requested';

    return (
        <AdminLayoutNew>
            <Head title={`Apelación de ${user.name}`} />

            <Box sx={{ p: 3 }}>
                {/* Enhanced Header with Animation */}
                <Fade in timeout={800}>
                    <Box sx={{ mb: 4 }}>
                        <Button
                            component={motion.button}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            startIcon={<BackIcon />}
                            onClick={() => router.visit(route('admin.ban-appeals.index'))}
                            variant="outlined"
                            sx={{ mb: 3 }}
                        >
                            Volver a la Lista
                        </Button>

                        {/* Hero Card */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                borderRadius: 3,
                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.dark, 0.03)} 100%)`,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                mb: 3,
                            }}
                        >
                            <Stack spacing={3}>
                                <Stack direction="row" alignItems="flex-start" spacing={3}>
                                    <motion.div
                                        initial={{ scale: 0.8, rotate: -10 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ duration: 0.5, type: "spring" }}
                                    >
                                        <Avatar
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                                            }}
                                        >
                                            <GavelIcon sx={{ fontSize: 48 }} />
                                        </Avatar>
                                    </motion.div>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h3" fontWeight="800" gutterBottom sx={{
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}>
                                            Apelación #{appeal.id}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
                                            <Chip
                                                icon={getStatusIcon(appeal.status)}
                                                label={appeal.status_label}
                                                color={getStatusColor(appeal.status)}
                                                sx={{ fontWeight: 700, fontSize: '0.9rem' }}
                                            />
                                            {ban.is_active && (
                                                <Chip
                                                    icon={<BlockIcon />}
                                                    label="Baneo Activo"
                                                    color="error"
                                                    sx={{ fontWeight: 700 }}
                                                />
                                            )}
                                            <Chip
                                                avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><PersonIcon sx={{ fontSize: 18 }} /></Avatar>}
                                                label={user.name}
                                                variant="outlined"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Stack>
                                        <Stack direction="row" spacing={3} flexWrap="wrap">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Creada: {appeal.created_at}
                                                </Typography>
                                            </Stack>
                                            {appeal.reviewed_at && (
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <TimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        Revisada: {appeal.reviewed_at}
                                                    </Typography>
                                                </Stack>
                                            )}
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Box>
                </Fade>

                {/* Modern Grid Layout with CSS Grid */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            md: 'repeat(12, 1fr)',
                        },
                        gap: 3,
                    }}
                >
                    {/* Left Column - Appeal Details (8 columns on desktop) */}
                    <Box
                        sx={{
                            gridColumn: {
                                xs: 'span 1',
                                md: 'span 8',
                            },
                        }}
                    >
                        <Stack spacing={3}>
                            {/* User Information - Enhanced */}
                            <Grow in timeout={800}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        background: theme.palette.mode === 'dark'
                                            ? alpha(theme.palette.background.paper, 0.6)
                                            : theme.palette.background.paper,
                                        backdropFilter: 'blur(10px)',
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.dark, 0.08)} 100%)`,
                                            }}
                                        >
                                            <PersonIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                                        </Box>
                                        <Typography variant="h5" fontWeight="700">
                                            Información del Usuario
                                        </Typography>
                                    </Stack>
                                    <List disablePadding>
                                        <ListItem
                                            sx={{
                                                px: 2,
                                                py: 1.5,
                                                borderRadius: 2,
                                                mb: 1,
                                                bgcolor: alpha(theme.palette.primary.main, 0.03),
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                <PersonIcon sx={{ color: 'primary.main' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={<Typography variant="caption" color="text.secondary">Nombre</Typography>}
                                                secondary={<Typography variant="body1" fontWeight={600}>{user.name}</Typography>}
                                            />
                                        </ListItem>
                                        <ListItem
                                            sx={{
                                                px: 2,
                                                py: 1.5,
                                                borderRadius: 2,
                                                mb: 1,
                                                bgcolor: alpha(theme.palette.info.main, 0.03),
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                <EmailIcon sx={{ color: 'info.main' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={<Typography variant="caption" color="text.secondary">Email</Typography>}
                                                secondary={<Typography variant="body1" fontWeight={600}>{user.email}</Typography>}
                                            />
                                        </ListItem>
                                        <ListItem
                                            sx={{
                                                px: 2,
                                                py: 1.5,
                                                borderRadius: 2,
                                                mb: 1,
                                                bgcolor: alpha(theme.palette.success.main, 0.03),
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                <CalendarIcon sx={{ color: 'success.main' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={<Typography variant="caption" color="text.secondary">Fecha de Registro</Typography>}
                                                secondary={<Typography variant="body1" fontWeight={600}>{user.created_at}</Typography>}
                                            />
                                        </ListItem>
                                        <ListItem
                                            sx={{
                                                px: 2,
                                                py: 1.5,
                                                borderRadius: 2,
                                                bgcolor: alpha(theme.palette.warning.main, 0.03),
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                <LocationIcon sx={{ color: 'warning.main' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={<Typography variant="caption" color="text.secondary">IP de la Apelación</Typography>}
                                                secondary={<Typography variant="body1" fontWeight={600} sx={{ fontFamily: 'monospace' }}>{appeal.ip_address}</Typography>}
                                            />
                                        </ListItem>
                                    </List>
                                </Paper>
                            </Grow>

                            {/* Ban Information - Enhanced */}
                            <Grow in timeout={1000}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        background: theme.palette.mode === 'dark'
                                            ? alpha(theme.palette.background.paper, 0.6)
                                            : theme.palette.background.paper,
                                        backdropFilter: 'blur(10px)',
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.15)} 0%, ${alpha(theme.palette.error.dark, 0.08)} 100%)`,
                                            }}
                                        >
                                            <BlockIcon sx={{ color: 'error.main', fontSize: 28 }} />
                                        </Box>
                                        <Typography variant="h5" fontWeight="700">
                                            Información del Baneo
                                        </Typography>
                                    </Stack>
                                    <Divider sx={{ mb: 3 }} />
                                    <Stack spacing={3}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                                                Razón del Baneo
                                            </Typography>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    bgcolor: alpha(theme.palette.error.main, 0.03),
                                                    borderColor: alpha(theme.palette.error.main, 0.2),
                                                }}
                                            >
                                                <Typography variant="body1" fontWeight={500}>{ban.reason}</Typography>
                                            </Paper>
                                        </Box>

                                        {/* Grid de información con CSS Grid */}
                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: {
                                                    xs: '1fr',
                                                    sm: 'repeat(2, 1fr)',
                                                },
                                                gap: 2,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    bgcolor: alpha(theme.palette.warning.main, 0.05),
                                                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                                                }}
                                            >
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                    <CalendarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                        Baneado el
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="body1" fontWeight={600}>{ban.banned_at}</Typography>
                                            </Box>

                                            <Box
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    bgcolor: alpha(theme.palette.info.main, 0.05),
                                                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                                }}
                                            >
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                    <TimeIcon sx={{ fontSize: 18, color: 'info.main' }} />
                                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                        Expira el
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="body1" fontWeight={600}>{ban.expires_at}</Typography>
                                            </Box>

                                            <Box
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                                }}
                                            >
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                    <PersonIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                        Baneado por
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="body1" fontWeight={600}>
                                                    {ban.banned_by ? ban.banned_by.name : 'Sistema'}
                                                </Typography>
                                            </Box>

                                            <Box
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    bgcolor: ban.is_active
                                                        ? alpha(theme.palette.error.main, 0.05)
                                                        : alpha(theme.palette.success.main, 0.05),
                                                    border: `1px solid ${ban.is_active
                                                        ? alpha(theme.palette.error.main, 0.2)
                                                        : alpha(theme.palette.success.main, 0.2)}`,
                                                }}
                                            >
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                    <BlockIcon sx={{
                                                        fontSize: 18,
                                                        color: ban.is_active ? 'error.main' : 'success.main'
                                                    }} />
                                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                        Estado
                                                    </Typography>
                                                </Stack>
                                                <Chip
                                                    label={ban.is_active ? 'Activo' : 'Inactivo'}
                                                    color={ban.is_active ? 'error' : 'success'}
                                                    size="small"
                                                    sx={{ fontWeight: 700 }}
                                                />
                                            </Box>
                                        </Box>

                                        {ban.admin_notes && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                                                    Notas del Administrador
                                                </Typography>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 2,
                                                        bgcolor: alpha(theme.palette.background.default, 0.5),
                                                    }}
                                                >
                                                    <Typography variant="body2">{ban.admin_notes}</Typography>
                                                </Paper>
                                            </Box>
                                        )}
                                    </Stack>
                                </Paper>
                            </Grow>

                            {/* Appeal Reason - Enhanced */}
                            <Grow in timeout={1200}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        background: theme.palette.mode === 'dark'
                                            ? alpha(theme.palette.background.paper, 0.6)
                                            : theme.palette.background.paper,
                                        backdropFilter: 'blur(10px)',
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.dark, 0.08)} 100%)`,
                                            }}
                                        >
                                            <DescriptionIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                                        </Box>
                                        <Typography variant="h5" fontWeight="700">
                                            Razón de la Apelación
                                        </Typography>
                                    </Stack>
                                    <Divider sx={{ mb: 3 }} />
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 3,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.primary.main, 0.03),
                                            borderColor: alpha(theme.palette.primary.main, 0.2),
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                                            {appeal.reason}
                                        </Typography>
                                    </Paper>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
                                        <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                            Enviada el {appeal.created_at}
                                        </Typography>
                                    </Stack>
                                </Paper>
                            </Grow>

                            {/* Evidence - Enhanced */}
                            {appeal.evidence_url && (
                                <Grow in timeout={1400}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            background: theme.palette.mode === 'dark'
                                                ? alpha(theme.palette.background.paper, 0.6)
                                                : theme.palette.background.paper,
                                            backdropFilter: 'blur(10px)',
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                            <Box
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.15)} 0%, ${alpha(theme.palette.info.dark, 0.08)} 100%)`,
                                                }}
                                            >
                                                <AttachFileIcon sx={{ color: 'info.main', fontSize: 28 }} />
                                            </Box>
                                            <Typography variant="h5" fontWeight="700">
                                                Evidencia Adjunta
                                            </Typography>
                                        </Stack>
                                        <Divider sx={{ mb: 3 }} />
                                        <Box
                                            component={motion.div}
                                            whileHover={{ scale: 1.02 }}
                                            transition={{ duration: 0.3 }}
                                            sx={{
                                                position: 'relative',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                border: `2px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                                boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.15)}`,
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={appeal.evidence_url}
                                                alt="Evidence"
                                                sx={{
                                                    width: '100%',
                                                    maxHeight: 500,
                                                    objectFit: 'contain',
                                                    display: 'block',
                                                    bgcolor: alpha(theme.palette.background.default, 0.5),
                                                }}
                                            />
                                        </Box>
                                    </Paper>
                                </Grow>
                            )}

                            {/* Admin Response - Enhanced */}
                            {appeal.admin_response && (
                                <Grow in timeout={1600}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            border: `2px solid ${alpha(theme.palette[getStatusColor(appeal.status)].main, 0.3)}`,
                                            background: theme.palette.mode === 'dark'
                                                ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette[getStatusColor(appeal.status)].main, 0.05)} 100%)`
                                                : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette[getStatusColor(appeal.status)].main, 0.03)} 100%)`,
                                            backdropFilter: 'blur(10px)',
                                            boxShadow: `0 8px 32px ${alpha(theme.palette[getStatusColor(appeal.status)].main, 0.2)}`,
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                            <Box
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    background: `linear-gradient(135deg, ${alpha(theme.palette[getStatusColor(appeal.status)].main, 0.15)} 0%, ${alpha(theme.palette[getStatusColor(appeal.status)].dark, 0.08)} 100%)`,
                                                }}
                                            >
                                                {getStatusIcon(appeal.status)}
                                            </Box>
                                            <Typography variant="h5" fontWeight="700">
                                                Respuesta del Administrador
                                            </Typography>
                                        </Stack>
                                        <Divider sx={{ mb: 3 }} />
                                        <Alert
                                            severity={getStatusColor(appeal.status)}
                                            icon={getStatusIcon(appeal.status)}
                                            sx={{
                                                borderRadius: 2,
                                                border: `1px solid ${alpha(theme.palette[getStatusColor(appeal.status)].main, 0.3)}`,
                                                '& .MuiAlert-message': {
                                                    width: '100%',
                                                },
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                                                {appeal.admin_response}
                                            </Typography>
                                        </Alert>
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }} flexWrap="wrap">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                    {appeal.reviewed_by ? appeal.reviewed_by.name : 'Administrador'}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                    {appeal.reviewed_at}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                </Grow>
                            )}
                        </Stack>
                    </Box>

                    {/* Right Column - Actions Sidebar (4 columns on desktop) */}
                    <Box
                        sx={{
                            gridColumn: {
                                xs: 'span 1',
                                md: 'span 4',
                            },
                        }}
                    >
                        <Zoom in timeout={1000}>
                            <Paper
                                component={motion.div}
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.3 }}
                                elevation={0}
                                sx={{
                                    p: 3,
                                    position: { md: 'sticky' },
                                    top: { md: 20 },
                                    borderRadius: 3,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    background: theme.palette.mode === 'dark'
                                        ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`
                                        : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? `0 8px 32px ${alpha('#000', 0.4)}`
                                        : `0 8px 32px ${alpha(theme.palette.primary.main, 0.08)}`,
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.dark, 0.08)} 100%)`,
                                        }}
                                    >
                                        <GavelIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                                    </Box>
                                    <Typography variant="h5" fontWeight="800">
                                        Acciones
                                    </Typography>
                                </Stack>
                                <Divider sx={{ mb: 3 }} />

                                {canReview ? (
                                    <Stack spacing={2}>
                                        <Button
                                            component={motion.button}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            variant="contained"
                                            color="success"
                                            startIcon={<ApproveIcon />}
                                            fullWidth
                                            size="large"
                                            onClick={() => setApproveDialogOpen(true)}
                                            sx={{
                                                py: 2,
                                                fontWeight: 700,
                                                fontSize: '1rem',
                                                textTransform: 'none',
                                                borderRadius: 2,
                                                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                                boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.35)}`,
                                                '&:hover': {
                                                    background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                                                    boxShadow: `0 12px 32px ${alpha(theme.palette.success.main, 0.45)}`,
                                                },
                                            }}
                                        >
                                            Aprobar Apelación
                                        </Button>
                                        <Button
                                            component={motion.button}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            variant="contained"
                                            color="error"
                                            startIcon={<RejectIcon />}
                                            fullWidth
                                            size="large"
                                            onClick={() => setRejectDialogOpen(true)}
                                            sx={{
                                                py: 2,
                                                fontWeight: 700,
                                                fontSize: '1rem',
                                                textTransform: 'none',
                                                borderRadius: 2,
                                                background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                                                boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.35)}`,
                                                '&:hover': {
                                                    background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)`,
                                                    boxShadow: `0 12px 32px ${alpha(theme.palette.error.main, 0.45)}`,
                                                },
                                            }}
                                        >
                                            Rechazar Apelación
                                        </Button>
                                        <Button
                                            component={motion.button}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            variant="outlined"
                                            color="info"
                                            startIcon={<InfoIcon />}
                                            fullWidth
                                            size="large"
                                            onClick={() => setInfoDialogOpen(true)}
                                            sx={{
                                                py: 2,
                                                fontWeight: 700,
                                                fontSize: '1rem',
                                                textTransform: 'none',
                                                borderRadius: 2,
                                                borderWidth: 2,
                                                '&:hover': {
                                                    borderWidth: 2,
                                                    bgcolor: alpha(theme.palette.info.main, 0.08),
                                                    boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.2)}`,
                                                },
                                            }}
                                        >
                                            Solicitar Más Información
                                        </Button>
                                    </Stack>
                                ) : (
                                    <Alert
                                        severity="info"
                                        icon={<InfoIcon />}
                                        sx={{
                                            borderRadius: 2,
                                            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                                            '& .MuiAlert-message': {
                                                fontWeight: 600,
                                            },
                                        }}
                                    >
                                        Esta apelación ya ha sido revisada y no puede ser modificada.
                                    </Alert>
                                )}
                            </Paper>
                        </Zoom>
                    </Box>
                </Box>
            </Box>

            {/* Approve Dialog */}
            <Dialog
                open={approveDialogOpen}
                onClose={() => !approveForm.processing && setApproveDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                    },
                }}
            >
                <DialogTitle>Aprobar Apelación</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Al aprobar esta apelación, el baneo del usuario será levantado inmediatamente.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Respuesta (Opcional)"
                        placeholder="Escribe un mensaje para el usuario..."
                        value={approveForm.data.response}
                        onChange={(e) => approveForm.setData('response', e.target.value)}
                        error={!!approveForm.errors.response}
                        helperText={approveForm.errors.response}
                        disabled={approveForm.processing}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setApproveDialogOpen(false)} disabled={approveForm.processing}>
                        Cancelar
                    </Button>
                    <Button onClick={handleApprove} variant="contained" color="success" disabled={approveForm.processing}>
                        {approveForm.processing ? 'Aprobando...' : 'Aprobar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog
                open={rejectDialogOpen}
                onClose={() => !rejectForm.processing && setRejectDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                    },
                }}
            >
                <DialogTitle>Rechazar Apelación</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Al rechazar esta apelación, el baneo del usuario se mantendrá activo.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Razón del Rechazo"
                        placeholder="Explica por qué se rechaza la apelación..."
                        value={rejectForm.data.response}
                        onChange={(e) => rejectForm.setData('response', e.target.value)}
                        error={!!rejectForm.errors.response}
                        helperText={rejectForm.errors.response || 'Mínimo 20 caracteres'}
                        required
                        disabled={rejectForm.processing}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialogOpen(false)} disabled={rejectForm.processing}>
                        Cancelar
                    </Button>
                    <Button onClick={handleReject} variant="contained" color="error" disabled={rejectForm.processing}>
                        {rejectForm.processing ? 'Rechazando...' : 'Rechazar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Request Info Dialog */}
            <Dialog
                open={infoDialogOpen}
                onClose={() => !infoForm.processing && setInfoDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                    },
                }}
            >
                <DialogTitle>Solicitar Más Información</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Solicita información adicional al usuario antes de tomar una decisión.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Información Requerida"
                        placeholder="Especifica qué información adicional necesitas..."
                        value={infoForm.data.response}
                        onChange={(e) => infoForm.setData('response', e.target.value)}
                        error={!!infoForm.errors.response}
                        helperText={infoForm.errors.response || 'Mínimo 20 caracteres'}
                        required
                        disabled={infoForm.processing}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setInfoDialogOpen(false)} disabled={infoForm.processing}>
                        Cancelar
                    </Button>
                    <Button onClick={handleRequestInfo} variant="contained" color="info" disabled={infoForm.processing}>
                        {infoForm.processing ? 'Enviando...' : 'Solicitar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayoutNew>
    );
}

