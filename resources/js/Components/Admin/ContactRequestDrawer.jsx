import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Stack,
    Chip,
    Tabs,
    Tab,
    Button,
    Tooltip,
    useTheme,
    useMediaQuery,
    alpha,
    TextField,
    CircularProgress,
} from '@mui/material';
import DeleteContactRequestModal from './DeleteContactRequestModal';
import {
    Close as CloseIcon,
    Visibility as VisibilityIcon,
    Reply as ReplyIcon,
    Archive as ArchiveIcon,
    Delete as DeleteIcon,
    CheckCircle as CheckCircleIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Business as BusinessIcon,
    Message as MessageIcon,
    CalendarToday as CalendarIcon,
    AccessTime as AccessTimeIcon,
    WhatsApp as WhatsAppIcon,
    ContentCopy as CopyIcon,
    Inbox as InboxIcon,
    RemoveRedEye as EyeIcon,
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    Edit as EditIcon,
    ArchiveOutlined as ArchiveOutlinedIcon,
    DeleteOutline as DeleteOutlineIcon,
} from '@mui/icons-material';
import AttachmentsList from './AttachmentsList';

// Premium Tab Panel Component with Enhanced Animations
function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`contact-tabpanel-${index}`}
            aria-labelledby={`contact-tab-${index}`}
            {...other}
        >
            {value === index && (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1],
                        }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}

export default function ContactRequestDrawer({ request, attachments: initialAttachments = [], open, onClose }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

    const [activeTab, setActiveTab] = useState(0);
    const [requestData, setRequestData] = useState(request);
    const [attachments, setAttachments] = useState(initialAttachments);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Glassmorphism styles
    const glassmorphismStyles = {
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        borderRadius: '16px',
    };

    // Update data when props change
    useEffect(() => {
        if (open && request) {
            setRequestData(request);
            setAttachments(initialAttachments);
            setActiveTab(0); // Reset to first tab
            setDeleteDialogOpen(false);
        }
    }, [open, request, initialAttachments]);

    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            new: '#E53E3E',
            read: '#F6AD55',
            responded: '#48BB78',
            archived: '#A0AEC0',
        };
        return colors[status] || '#A0AEC0';
    };

    // Get status label
    const getStatusLabel = (status) => {
        const labels = {
            new: 'Nuevo',
            read: 'Leído',
            responded: 'Respondido',
            archived: 'Archivado',
        };
        return labels[status] || status;
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Handle mark as read
    const handleMarkAsRead = () => {
        router.post(
            route('admin.contact-requests.mark-read', requestId),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    setRequestData(page.props.request);
                },
            }
        );
    };

    // Handle archive
    const handleArchive = () => {
        if (confirm('¿Estás seguro de archivar esta solicitud?')) {
            router.post(
                route('admin.contact-requests.archive', requestId),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        onClose();
                    },
                }
            );
        }
    };

    // Handle delete
    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    if (!open) return null;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{
                zIndex: 1400, // Por encima del AppBar (1200) y del menú (1300)
                '& .MuiDrawer-paper': {
                    width: {
                        xs: '100%',
                        md: '85%',
                        lg: '65%',
                    },
                    maxWidth: { lg: '1000px' },
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    boxShadow: '-8px 0 40px rgba(0, 0, 0, 0.12)',
                    zIndex: 1400,
                },
                '& .MuiBackdrop-root': {
                    zIndex: 1399,
                },
            }}
        >
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
                {requestData ? (
                    <>
                        {/* Premium Header with Gradient Background */}
                        <Box
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                                position: 'sticky',
                                top: 0,
                                zIndex: 1100,
                            }}
                        >
                            {/* Top Bar with Close Button */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    px: 3,
                                    py: 2,
                                }}
                            >
                                {/* Left: Title and ID */}
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '12px',
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            backdropFilter: 'blur(10px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                        }}
                                    >
                                        <MessageIcon sx={{ color: '#fff', fontSize: 24 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" fontWeight={700} sx={{ color: '#fff', lineHeight: 1.2 }}>
                                            Solicitud de Contacto
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mt: 0.5 }}>
                                            ID: #{requestData.id} • {requestData.name}
                                        </Typography>
                                    </Box>
                                </Stack>

                                {/* Right: Close Button */}
                                <Tooltip title="Cerrar">
                                    <IconButton
                                        onClick={onClose}
                                        sx={{
                                            color: '#fff',
                                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                                transform: 'rotate(90deg)',
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {/* Status and Actions Bar */}
                            <Box
                                sx={{
                                    px: 3,
                                    pb: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 2,
                                }}
                            >
                                {/* Left: Status Badge */}
                                <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                                    <Chip
                                        label={getStatusLabel(requestData.status)}
                                        sx={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            color: getStatusColor(requestData.status),
                                            fontWeight: 700,
                                            fontSize: '0.875rem',
                                            height: 32,
                                            px: 1,
                                            border: `2px solid ${getStatusColor(requestData.status)}`,
                                            boxShadow: `0 4px 12px ${alpha(getStatusColor(requestData.status), 0.3)}`,
                                            animation: requestData.status === 'new' ? 'pulse 2s infinite' : 'none',
                                            '@keyframes pulse': {
                                                '0%, 100%': { transform: 'scale(1)' },
                                                '50%': { transform: 'scale(1.05)' },
                                            },
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.95)', fontWeight: 500 }}>
                                        Recibido {new Date(requestData.created_at).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </Typography>
                                </Stack>

                                {/* Right: Action Buttons */}
                                <Stack direction="row" spacing={1}>
                                    {requestData.status === 'new' && (
                                        <Tooltip title="Marcar como leído">
                                            <IconButton
                                                onClick={handleMarkAsRead}
                                                sx={{
                                                    color: '#fff',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                                    backdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(72, 187, 120, 0.9)',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 4px 12px rgba(72, 187, 120, 0.4)',
                                                    },
                                                    transition: 'all 0.3s ease',
                                                }}
                                            >
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}

                                    <Tooltip title="Responder">
                                        <IconButton
                                            sx={{
                                                color: '#fff',
                                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(66, 153, 225, 0.9)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(66, 153, 225, 0.4)',
                                                },
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <ReplyIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Archivar">
                                        <IconButton
                                            onClick={handleArchive}
                                            sx={{
                                                color: '#fff',
                                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(246, 173, 85, 0.9)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(246, 173, 85, 0.4)',
                                                },
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <ArchiveIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title="Eliminar">
                                        <IconButton
                                            onClick={handleDeleteClick}
                                            sx={{
                                                color: '#fff',
                                                backgroundColor: 'rgba(229, 62, 62, 0.2)',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(229, 62, 62, 0.3)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(229, 62, 62, 0.9)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(229, 62, 62, 0.4)',
                                                },
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Box>
                        </Box>

                        {/* Premium Tabs Navigation */}
                        <Box
                            sx={{
                                mx: 3,
                                mt: 3,
                                mb: 2,
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                borderRadius: '16px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.8)',
                                overflow: 'hidden',
                            }}
                        >
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                variant={isMobile ? 'scrollable' : 'fullWidth'}
                                scrollButtons={isMobile ? 'auto' : false}
                                sx={{
                                    minHeight: 64,
                                    '& .MuiTabs-flexContainer': {
                                        height: '100%',
                                    },
                                    '& .MuiTab-root': {
                                        color: '#718096',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        minHeight: 64,
                                        py: 2.5,
                                        px: 3,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        '&:hover': {
                                            color: '#667eea',
                                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                            transform: 'translateY(-2px)',
                                        },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '3px',
                                            background: 'transparent',
                                            transition: 'all 0.3s ease',
                                        },
                                    },
                                    '& .Mui-selected': {
                                        color: '#667eea !important',
                                        fontWeight: 700,
                                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                        '&::before': {
                                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                        },
                                    },
                                    '& .MuiTabs-indicator': {
                                        display: 'none',
                                    },
                                }}
                            >
                                <Tab
                                    icon={<PersonIcon sx={{ fontSize: 20, mb: 0.5 }} />}
                                    iconPosition="start"
                                    label="Información"
                                />
                                <Tab
                                    icon={<AttachFileIcon sx={{ fontSize: 20, mb: 0.5 }} />}
                                    iconPosition="start"
                                    label={`Archivos${attachments.length > 0 ? ` (${attachments.length})` : ''}`}
                                />
                                <Tab
                                    icon={<EditIcon sx={{ fontSize: 20, mb: 0.5 }} />}
                                    iconPosition="start"
                                    label="Notas Internas"
                                />
                                <Tab
                                    icon={<AccessTimeIcon sx={{ fontSize: 20, mb: 0.5 }} />}
                                    iconPosition="start"
                                    label="Historial"
                                />
                            </Tabs>
                        </Box>

                        {/* Tab Panels with Premium Styling */}
                        <Box
                            sx={{
                                flex: 1,
                                overflow: 'auto',
                                px: 3,
                                pb: 3,
                                '&::-webkit-scrollbar': {
                                    width: '8px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: 'rgba(0, 0, 0, 0.05)',
                                    borderRadius: '4px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '4px',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                    },
                                },
                            }}
                        >
                            {/* Tab 0: Contact Information */}
                            <TabPanel value={activeTab} index={0}>
                                <ContactInformationTab requestData={requestData} glassmorphismStyles={glassmorphismStyles} />
                            </TabPanel>

                            {/* Tab 1: Attachments (always visible) */}
                            <TabPanel value={activeTab} index={1}>
                                <AttachmentsList
                                    contactRequestId={requestData.id}
                                    attachments={attachments}
                                />
                            </TabPanel>

                            {/* Tab 2: Internal Notes */}
                            <TabPanel value={activeTab} index={2}>
                                <InternalNotesTab requestData={requestData} glassmorphismStyles={glassmorphismStyles} />
                            </TabPanel>

                            {/* Tab 3: Activity History */}
                            <TabPanel value={activeTab} index={3}>
                                <ActivityHistoryTab requestData={requestData} glassmorphismStyles={glassmorphismStyles} />
                            </TabPanel>
                        </Box>
                    </>
                ) : null}
            </motion.div>

            {/* Delete Confirmation Modal */}
            <DeleteContactRequestModal
                open={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    onClose(); // Close drawer after successful deletion
                }}
                request={requestData}
            />
        </Drawer>
    );
}

// Contact Information Tab Component
function ContactInformationTab({ requestData, glassmorphismStyles }) {
    const [copySuccess, setCopySuccess] = useState('');

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(requestData.email);
        setCopySuccess('Email copiado!');
        setTimeout(() => setCopySuccess(''), 2000);
    };

    const handleCallPhone = () => {
        window.location.href = `tel:${requestData.phone}`;
    };

    const handleWhatsApp = () => {
        const phone = requestData.phone.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}`, '_blank');
    };

    const getServiceColor = (service) => {
        const colors = {
            'Construcción de Viviendas': '#667eea',
            'Reformas Integrales': '#48BB78',
            'Rehabilitación de Edificios': '#F6AD55',
            'Proyectos Comerciales': '#4299E1',
        };
        return colors[service] || '#718096';
    };

    const premiumCardStyle = {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
        },
    };

    return (
        <Stack spacing={2.5}>
            {/* Name Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Box sx={premiumCardStyle}>
                    <Stack direction="row" spacing={2.5} alignItems="center" sx={{ p: 3 }}>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            }}
                        >
                            <PersonIcon sx={{ color: '#fff', fontSize: 28 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#718096', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Nombre Completo
                            </Typography>
                            <Typography variant="h6" fontWeight={700} sx={{ color: '#2D3748', mt: 0.5 }}>
                                {requestData.name}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            </motion.div>

            {/* Email Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Box sx={premiumCardStyle}>
                    <Stack direction="row" spacing={2.5} alignItems="center" justifyContent="space-between" sx={{ p: 3 }}>
                        <Stack direction="row" spacing={2.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #4299E1 0%, #3182CE 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(66, 153, 225, 0.3)',
                                }}
                            >
                                <EmailIcon sx={{ color: '#fff', fontSize: 28 }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="caption" sx={{ color: '#718096', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Email
                                </Typography>
                                <Typography
                                    variant="body1"
                                    fontWeight={600}
                                    sx={{
                                        color: '#2D3748',
                                        mt: 0.5,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {requestData.email}
                                </Typography>
                            </Box>
                        </Stack>
                        <Tooltip title={copySuccess || 'Copiar email'}>
                            <IconButton
                                onClick={handleCopyEmail}
                                sx={{
                                    backgroundColor: alpha('#667eea', 0.1),
                                    color: '#667eea',
                                    '&:hover': {
                                        backgroundColor: '#667eea',
                                        color: '#fff',
                                        transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <CopyIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>
            </motion.div>

            {/* Phone Card */}
            {requestData.phone && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Box sx={premiumCardStyle}>
                        <Stack direction="row" spacing={2.5} alignItems="center" justifyContent="space-between" sx={{ p: 3 }}>
                            <Stack direction="row" spacing={2.5} alignItems="center" sx={{ flex: 1 }}>
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: '14px',
                                        background: 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)',
                                    }}
                                >
                                    <PhoneIcon sx={{ color: '#fff', fontSize: 28 }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#718096', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Teléfono
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600} sx={{ color: '#2D3748', mt: 0.5 }}>
                                        {requestData.phone}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                                <Tooltip title="Llamar">
                                    <IconButton
                                        onClick={handleCallPhone}
                                        sx={{
                                            backgroundColor: alpha('#48BB78', 0.1),
                                            color: '#48BB78',
                                            '&:hover': {
                                                backgroundColor: '#48BB78',
                                                color: '#fff',
                                                transform: 'scale(1.1)',
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        <PhoneIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="WhatsApp">
                                    <IconButton
                                        onClick={handleWhatsApp}
                                        sx={{
                                            backgroundColor: alpha('#25D366', 0.1),
                                            color: '#25D366',
                                            '&:hover': {
                                                backgroundColor: '#25D366',
                                                color: '#fff',
                                                transform: 'scale(1.1)',
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        <WhatsAppIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Stack>
                    </Box>
                </motion.div>
            )}

            {/* Service Card */}
            {requestData.service && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Box sx={premiumCardStyle}>
                        <Stack direction="row" spacing={2.5} alignItems="center" sx={{ p: 3 }}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #F6AD55 0%, #ED8936 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(246, 173, 85, 0.3)',
                                }}
                            >
                                <BusinessIcon sx={{ color: '#fff', fontSize: 28 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" sx={{ color: '#718096', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Servicio Solicitado
                                </Typography>
                                <Chip
                                    label={requestData.service}
                                    sx={{
                                        mt: 1,
                                        backgroundColor: alpha(getServiceColor(requestData.service), 0.15),
                                        color: getServiceColor(requestData.service),
                                        fontWeight: 700,
                                        fontSize: '0.875rem',
                                        height: 32,
                                        border: `2px solid ${alpha(getServiceColor(requestData.service), 0.3)}`,
                                    }}
                                />
                            </Box>
                        </Stack>
                    </Box>
                </motion.div>
            )}

            {/* Preferred Contact Method Card */}
            {requestData.preferred_contact && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Box sx={premiumCardStyle}>
                        <Stack direction="row" spacing={2.5} alignItems="center" sx={{ p: 3 }}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '14px',
                                    background: requestData.preferred_contact === 'WhatsApp'
                                        ? 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)'
                                        : requestData.preferred_contact === 'Teléfono'
                                        ? 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)'
                                        : 'linear-gradient(135deg, #4299E1 0%, #3182CE 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(66, 153, 225, 0.3)',
                                }}
                            >
                                {requestData.preferred_contact === 'WhatsApp' ? (
                                    <WhatsAppIcon sx={{ color: '#fff', fontSize: 28 }} />
                                ) : requestData.preferred_contact === 'Teléfono' ? (
                                    <PhoneIcon sx={{ color: '#fff', fontSize: 28 }} />
                                ) : (
                                    <EmailIcon sx={{ color: '#fff', fontSize: 28 }} />
                                )}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" sx={{ color: '#718096', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Método de Contacto Preferido
                                </Typography>
                                <Typography variant="body1" fontWeight={600} sx={{ color: '#2D3748', mt: 0.5 }}>
                                    {requestData.preferred_contact}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                </motion.div>
            )}

            {/* Contact Time Card */}
            {requestData.contact_time && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Box sx={premiumCardStyle}>
                        <Stack direction="row" spacing={2.5} alignItems="center" sx={{ p: 3 }}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                }}
                            >
                                <AccessTimeIcon sx={{ color: '#fff', fontSize: 28 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" sx={{ color: '#718096', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Horario de Contacto Preferido
                                </Typography>
                                <Typography variant="body1" fontWeight={600} sx={{ color: '#2D3748', mt: 0.5 }}>
                                    {requestData.contact_time}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                </motion.div>
            )}

            {/* Message Card - Full Width */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <Box
                    sx={{
                        ...premiumCardStyle,
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                        border: '2px solid rgba(102, 126, 234, 0.2)',
                    }}
                >
                    <Box sx={{ p: 3 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                }}
                            >
                                <MessageIcon sx={{ color: '#fff', fontSize: 20 }} />
                            </Box>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#2D3748' }}>
                                Mensaje del Cliente
                            </Typography>
                        </Stack>
                        <Typography
                            variant="body1"
                            sx={{
                                color: '#4A5568',
                                lineHeight: 1.8,
                                whiteSpace: 'pre-wrap',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                p: 2.5,
                                borderRadius: '12px',
                                border: '1px solid rgba(102, 126, 234, 0.1)',
                            }}
                        >
                            {requestData.message}
                        </Typography>
                    </Box>
                </Box>
            </motion.div>

            {/* Date Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                <Box sx={premiumCardStyle}>
                    <Stack direction="row" spacing={2.5} alignItems="center" sx={{ p: 3 }}>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #718096 0%, #4A5568 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(113, 128, 150, 0.3)',
                            }}
                        >
                            <CalendarIcon sx={{ color: '#fff', fontSize: 28 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#718096', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Fecha de Envío
                            </Typography>
                            <Typography variant="body1" fontWeight={600} sx={{ color: '#2D3748', mt: 0.5 }}>
                                {new Date(requestData.created_at).toLocaleString('es-ES', {
                                    day: '2-digit',
                                    month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Typography>
                    </Box>
                </Stack>
            </Box>
        </motion.div>
        </Stack>
    );
}

// Internal Notes Tab Component
function InternalNotesTab({ requestData, glassmorphismStyles }) {
    const [notes, setNotes] = useState(requestData.admin_notes || '');
    const [notesStatus, setNotesStatus] = useState('saved'); // 'editing' | 'saving' | 'saved' | 'error'
    const [lastSaved, setLastSaved] = useState(null);

    // Debounce for autosave (2 seconds after stop typing)
    useEffect(() => {
        if (notes !== requestData.admin_notes) {
            setNotesStatus('editing');
            const timer = setTimeout(() => {
                handleSaveNotes();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [notes]);

    // Autosave every 30 seconds if editing
    useEffect(() => {
        const interval = setInterval(() => {
            if (notesStatus === 'editing') {
                handleSaveNotes();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [notesStatus, notes]);

    const handleSaveNotes = () => {
        if (notes === requestData.admin_notes) {
            setNotesStatus('saved');
            return;
        }

        setNotesStatus('saving');
        router.post(
            route('admin.contact-requests.add-notes', requestData.id),
            { notes },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setNotesStatus('saved');
                    setLastSaved(new Date());
                },
                onError: () => {
                    setNotesStatus('error');
                },
            }
        );
    };

    const getStatusIcon = () => {
        switch (notesStatus) {
            case 'editing':
                return <Typography variant="caption" sx={{ color: '#718096' }}>Editando...</Typography>;
            case 'saving':
                return (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={12} sx={{ color: '#667eea' }} />
                        <Typography variant="caption" sx={{ color: '#667eea' }}>Guardando...</Typography>
                    </Stack>
                );
            case 'saved':
                return (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <CheckCircleIcon sx={{ fontSize: 14, color: '#48BB78' }} />
                        <Typography variant="caption" sx={{ color: '#48BB78' }}>Guardado</Typography>
                    </Stack>
                );
            case 'error':
                return <Typography variant="caption" sx={{ color: '#E53E3E' }}>Error al guardar ✗</Typography>;
            default:
                return null;
        }
    };

    const premiumCardStyle = {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    return (
        <Stack spacing={3}>
            {/* Premium Editor Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Box sx={premiumCardStyle}>
                    <Box sx={{ p: 3 }}>
                        {/* Header with Icon */}
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                }}
                            >
                                <EditIcon sx={{ color: '#fff', fontSize: 24 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ color: '#2D3748' }}>
                                    Notas Administrativas
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#718096' }}>
                                    Información privada visible solo para administradores
                                </Typography>
                            </Box>
                            {getStatusIcon()}
                        </Stack>

                        {/* Premium Text Editor */}
                        <TextField
                            fullWidth
                            multiline
                            rows={10}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Escribe notas internas sobre esta solicitud...&#10;&#10;• Estado de seguimiento&#10;• Observaciones importantes&#10;• Próximos pasos&#10;• Información adicional"
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(248, 249, 250, 0.8)',
                                    borderRadius: '12px',
                                    fontSize: '0.95rem',
                                    lineHeight: 1.8,
                                    transition: 'all 0.3s ease',
                                    '& fieldset': {
                                        borderColor: 'rgba(102, 126, 234, 0.2)',
                                        borderWidth: '2px',
                                    },
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        '& fieldset': {
                                            borderColor: 'rgba(102, 126, 234, 0.4)',
                                        },
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: '#fff',
                                        boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)',
                                        '& fieldset': {
                                            borderColor: '#667eea',
                                        },
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    color: '#2D3748',
                                    '&::placeholder': {
                                        color: '#A0AEC0',
                                        opacity: 1,
                                    },
                                },
                            }}
                        />

                        {/* Metadata Footer */}
                        {lastSaved && (
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{
                                    mt: 2,
                                    pt: 2,
                                    borderTop: '1px solid rgba(102, 126, 234, 0.1)',
                                }}
                            >
                                <AccessTimeIcon sx={{ fontSize: 16, color: '#718096' }} />
                                <Typography variant="caption" sx={{ color: '#718096', fontWeight: 500 }}>
                                    Última edición: {new Date(lastSaved).toLocaleString('es-ES', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                </Box>
            </motion.div>

            {/* Premium Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Box
                    sx={{
                        ...premiumCardStyle,
                        background: 'linear-gradient(135deg, rgba(66, 153, 225, 0.05) 0%, rgba(102, 126, 234, 0.05) 100%)',
                        border: '2px solid rgba(66, 153, 225, 0.2)',
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ p: 2.5 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #4299E1 0%, #667eea 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 4px 12px rgba(66, 153, 225, 0.3)',
                            }}
                        >
                            <Typography sx={{ fontSize: '20px' }}>💡</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#2D3748', mb: 0.5 }}>
                                Guardado Automático Activado
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#4A5568', lineHeight: 1.6 }}>
                                Las notas se guardan automáticamente cada 30 segundos o 2 segundos después de dejar de escribir. No es necesario hacer clic en ningún botón.
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            </motion.div>
        </Stack>
    );
}

// Activity History Tab Component
function ActivityHistoryTab({ requestData, glassmorphismStyles }) {
    // Mock activity data - in real app, this would come from backend
    const activities = [
        {
            id: 1,
            type: 'created',
            icon: InboxIcon,
            color: '#4299E1',
            title: 'Solicitud recibida',
            description: `Nueva solicitud de contacto de ${requestData.name}`,
            user: null,
            timestamp: requestData.created_at,
        },
        ...(requestData.status !== 'new' ? [{
            id: 2,
            type: 'read',
            icon: EyeIcon,
            color: '#718096',
            title: 'Marcada como leída',
            description: 'La solicitud fue marcada como leída',
            user: requestData.responded_by?.name || 'Admin',
            timestamp: requestData.updated_at,
        }] : []),
        ...(requestData.status === 'responded' ? [{
            id: 3,
            type: 'responded',
            icon: SendIcon,
            color: '#48BB78',
            title: 'Respuesta enviada',
            description: 'Se envió una respuesta al cliente',
            user: requestData.responded_by?.name || 'Admin',
            timestamp: requestData.updated_at,
        }] : []),
        ...(requestData.status === 'archived' ? [{
            id: 4,
            type: 'archived',
            icon: ArchiveOutlinedIcon,
            color: '#F6AD55',
            title: 'Solicitud archivada',
            description: 'La solicitud fue archivada',
            user: 'Admin',
            timestamp: requestData.updated_at,
        }] : []),
    ];

    const premiumCardStyle = {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    return (
        <Box sx={{ position: 'relative' }}>
            {/* Timeline Line */}
            <Box
                sx={{
                    position: 'absolute',
                    left: '28px',
                    top: '60px',
                    bottom: '60px',
                    width: '3px',
                    background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '2px',
                    opacity: 0.3,
                }}
            />

            <Stack spacing={3}>
                {activities.map((activity, index) => (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Box sx={premiumCardStyle}>
                            <Stack direction="row" spacing={2.5} sx={{ p: 3 }}>
                                {/* Premium Icon */}
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: '14px',
                                        background: `linear-gradient(135deg, ${activity.color} 0%, ${alpha(activity.color, 0.7)} 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        boxShadow: `0 4px 12px ${alpha(activity.color, 0.3)}`,
                                        position: 'relative',
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            inset: -2,
                                            borderRadius: '16px',
                                            padding: '2px',
                                            background: `linear-gradient(135deg, ${activity.color}, transparent)`,
                                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                            WebkitMaskComposite: 'xor',
                                            maskComposite: 'exclude',
                                            opacity: 0.5,
                                        },
                                    }}
                                >
                                    <activity.icon sx={{ color: '#fff', fontSize: 28 }} />
                                </Box>

                                {/* Content */}
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ color: '#2D3748', mb: 0.5 }}>
                                        {activity.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#4A5568', mb: 1.5, lineHeight: 1.6 }}>
                                        {activity.description}
                                    </Typography>

                                    <Stack direction="row" spacing={2} flexWrap="wrap">
                                        {activity.user && (
                                            <Chip
                                                label={`Por: ${activity.user}`}
                                                size="small"
                                                sx={{
                                                    backgroundColor: alpha(activity.color, 0.1),
                                                    color: activity.color,
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    border: `1px solid ${alpha(activity.color, 0.2)}`,
                                                }}
                                            />
                                        )}
                                        <Chip
                                            icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                                            label={new Date(activity.timestamp).toLocaleString('es-ES', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                            size="small"
                                            sx={{
                                                backgroundColor: alpha('#718096', 0.1),
                                                color: '#718096',
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                                border: '1px solid rgba(113, 128, 150, 0.2)',
                                            }}
                                        />
                                    </Stack>
                                </Box>
                            </Stack>
                        </Box>
                    </motion.div>
                ))}

                {/* Empty State */}
                {activities.length === 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Box
                            sx={{
                                ...premiumCardStyle,
                                background: 'linear-gradient(135deg, rgba(113, 128, 150, 0.05) 0%, rgba(160, 174, 192, 0.05) 100%)',
                                border: '2px dashed rgba(113, 128, 150, 0.2)',
                            }}
                        >
                            <Stack alignItems="center" spacing={2} sx={{ p: 4 }}>
                                <Box
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, rgba(113, 128, 150, 0.1) 0%, rgba(160, 174, 192, 0.1) 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <AccessTimeIcon sx={{ fontSize: 32, color: '#718096', opacity: 0.6 }} />
                                </Box>
                                <Typography variant="body1" fontWeight={600} sx={{ color: '#718096', textAlign: 'center' }}>
                                    No hay más actividad registrada
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#A0AEC0', textAlign: 'center', maxWidth: 400 }}>
                                    Las nuevas acciones realizadas sobre esta solicitud aparecerán aquí automáticamente.
                                </Typography>
                            </Stack>
                        </Box>
                    </motion.div>
                )}
            </Stack>
        </Box>
    );
}

