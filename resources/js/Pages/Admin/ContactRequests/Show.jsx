import React, { useState } from 'react';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';
import { Head, router, Link } from '@inertiajs/react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    Grid,
    Chip,
    Divider,
    TextField,
    alpha,
    useTheme,
    IconButton,
    Tooltip,
    Alert,
    Paper,
} from '@mui/material';
import {
    ArrowBack,
    Email,
    Phone,
    Business,
    CalendarToday,
    Person,
    Message as MessageIcon,
    CheckCircle,
    Reply,
    Archive,
    Delete,
    Edit,
    AccessTime,
    LocationOn,
    WhatsApp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AttachmentsList from '@/Components/Admin/AttachmentsList';

export default function ContactRequestShow({ request, attachments = [] }) {
    const theme = useTheme();
    const [notes, setNotes] = useState(request.admin_notes || '');
    const [editingNotes, setEditingNotes] = useState(false);

    // Glassmorphism style
    const glassStyle = {
        background: alpha('#ffffff', 0.85),
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: `1px solid ${alpha('#ffffff', 0.3)}`,
        boxShadow: `0 8px 32px 0 ${alpha('#000000', 0.1)}`,
    };

    const handleStatusChange = (status) => {
        router.post(route(`admin.contact-requests.mark-${status}`, request.id), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleArchive = () => {
        if (confirm('¿Estás seguro de archivar esta solicitud?')) {
            router.post(route('admin.contact-requests.archive', request.id), {}, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleDelete = () => {
        if (confirm('¿Estás seguro de eliminar esta solicitud? Esta acción no se puede deshacer.')) {
            router.delete(route('admin.contact-requests.destroy', request.id), {
                onSuccess: () => router.visit(route('admin.contact-requests.index')),
            });
        }
    };

    const handleSaveNotes = () => {
        router.post(route('admin.contact-requests.add-notes', request.id), {
            notes,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setEditingNotes(false),
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            new: 'error',
            read: 'warning',
            responded: 'success',
            archived: 'default',
        };
        return colors[status] || 'default';
    };

    const getStatusLabel = (status) => {
        const labels = {
            new: 'Nueva',
            read: 'Leída',
            responded: 'Respondida',
            archived: 'Archivada',
        };
        return labels[status] || status;
    };

    return (
        <AdminLayoutNew>
            <Head title={`Solicitud de ${request.name} - Admin`} />

            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton
                            component={Link}
                            href={route('admin.contact-requests.index')}
                            sx={{ ...glassStyle }}
                        >
                            <ArrowBack />
                        </IconButton>
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                Solicitud de Contacto
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                ID: #{request.id} • Recibida el {format(new Date(request.created_at), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                            </Typography>
                        </Box>
                    </Stack>

                    <Chip
                        label={getStatusLabel(request.status)}
                        color={getStatusColor(request.status)}
                        size="large"
                        sx={{ fontWeight: 600, px: 2 }}
                    />
                </Stack>

                <Grid container spacing={3}>
                    {/* Main Content */}
                    <Grid item xs={12} lg={8}>
                        {/* Contact Information */}
                        <Card sx={{ ...glassStyle, mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Información de Contacto
                                </Typography>
                                <Divider sx={{ mb: 3 }} />

                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={2}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Person color="primary" />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Nombre
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight="500">
                                                        {request.name}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Email color="primary" />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Email
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight="500">
                                                        <a href={`mailto:${request.email}`} style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                                                            {request.email}
                                                        </a>
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {request.phone && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Phone color="primary" />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Teléfono
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight="500">
                                                            <a href={`tel:${request.phone}`} style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                                                                {request.phone}
                                                            </a>
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={2}>
                                            {request.preferred_contact && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <WhatsApp color="success" />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Contacto Preferido
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight="500">
                                                            {request.preferred_contact}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}

                                            {request.contact_time && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <AccessTime color="primary" />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Horario Preferido
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight="500">
                                                            {request.contact_time}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}

                                            {request.service && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Business color="primary" />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Servicio de Interés
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight="500">
                                                            {request.service}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Message */}
                        <Card sx={{ ...glassStyle, mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Mensaje
                                </Typography>
                                <Divider sx={{ mb: 3 }} />
                                <Paper
                                    sx={{
                                        p: 3,
                                        background: alpha(theme.palette.grey[100], 0.5),
                                        border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                                    }}
                                >
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {request.message}
                                    </Typography>
                                </Paper>
                            </CardContent>
                        </Card>

                        {/* Attachments */}
                        {attachments && attachments.length > 0 && (
                            <Card sx={{ ...glassStyle, mb: 3 }}>
                                <CardContent>
                                    <AttachmentsList
                                        contactRequestId={request.id}
                                        attachments={attachments}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Admin Notes */}
                        <Card sx={{ ...glassStyle }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                    <Typography variant="h6" fontWeight="bold">
                                        Notas Administrativas
                                    </Typography>
                                    {!editingNotes && (
                                        <IconButton onClick={() => setEditingNotes(true)} size="small">
                                            <Edit />
                                        </IconButton>
                                    )}
                                </Stack>
                                <Divider sx={{ mb: 3 }} />

                                {editingNotes ? (
                                    <Stack spacing={2}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={4}
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Añade notas sobre esta solicitud..."
                                            variant="outlined"
                                        />
                                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                                            <Button
                                                variant="outlined"
                                                onClick={() => {
                                                    setNotes(request.admin_notes || '');
                                                    setEditingNotes(false);
                                                }}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                variant="contained"
                                                onClick={handleSaveNotes}
                                            >
                                                Guardar Notas
                                            </Button>
                                        </Stack>
                                    </Stack>
                                ) : (
                                    <Paper
                                        sx={{
                                            p: 3,
                                            background: alpha(theme.palette.grey[100], 0.5),
                                            border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {request.admin_notes || 'No hay notas administrativas para esta solicitud.'}
                                        </Typography>
                                    </Paper>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} lg={4}>
                        {/* Actions */}
                        <Card sx={{ ...glassStyle, mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Acciones
                                </Typography>
                                <Divider sx={{ mb: 3 }} />

                                <Stack spacing={2}>
                                    {request.status === 'new' && (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="warning"
                                            startIcon={<CheckCircle />}
                                            onClick={() => handleStatusChange('read')}
                                        >
                                            Marcar como Leída
                                        </Button>
                                    )}

                                    {request.status !== 'responded' && (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="success"
                                            startIcon={<Reply />}
                                            onClick={() => handleStatusChange('responded')}
                                        >
                                            Marcar como Respondida
                                        </Button>
                                    )}

                                    {request.status !== 'archived' && (
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<Archive />}
                                            onClick={handleArchive}
                                        >
                                            Archivar
                                        </Button>
                                    )}

                                    <Divider />

                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={handleDelete}
                                    >
                                        Eliminar
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* Metadata */}
                        <Card sx={{ ...glassStyle, mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Información del Sistema
                                </Typography>
                                <Divider sx={{ mb: 3 }} />

                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Fecha de Recepción
                                        </Typography>
                                        <Typography variant="body2" fontWeight="500">
                                            {format(new Date(request.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {format(new Date(request.created_at), 'HH:mm:ss', { locale: es })}
                                        </Typography>
                                    </Box>

                                    {request.read_at && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Leída el
                                            </Typography>
                                            <Typography variant="body2" fontWeight="500">
                                                {format(new Date(request.read_at), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                                            </Typography>
                                        </Box>
                                    )}

                                    {request.responded_at && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Respondida el
                                            </Typography>
                                            <Typography variant="body2" fontWeight="500">
                                                {format(new Date(request.responded_at), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                                            </Typography>
                                            {request.responded_by && (
                                                <Typography variant="caption" color="text.secondary">
                                                    por {request.responded_by.name}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}

                                    <Divider />

                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Dirección IP
                                        </Typography>
                                        <Typography variant="body2" fontWeight="500" sx={{ fontFamily: 'monospace' }}>
                                            {request.ip_address || 'No disponible'}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            User Agent
                                        </Typography>
                                        <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.75rem', wordBreak: 'break-word' }}>
                                            {request.user_agent || 'No disponible'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* Quick Contact */}
                        <Card sx={{ ...glassStyle }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Contacto Rápido
                                </Typography>
                                <Divider sx={{ mb: 3 }} />

                                <Stack spacing={2}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<Email />}
                                        component="a"
                                        href={`mailto:${request.email}`}
                                    >
                                        Enviar Email
                                    </Button>

                                    {request.phone && (
                                        <>
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                startIcon={<Phone />}
                                                component="a"
                                                href={`tel:${request.phone}`}
                                            >
                                                Llamar
                                            </Button>

                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                color="success"
                                                startIcon={<WhatsApp />}
                                                component="a"
                                                href={`https://wa.me/${request.phone.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                            >
                                                WhatsApp
                                            </Button>
                                        </>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </AdminLayoutNew>
    );
}

