import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Stack,
    Chip,
    Alert,
    useTheme,
    alpha,
    Divider
} from '@mui/material';
import {
    Schedule as ScheduleIcon,
    Event as EventIcon,
    Repeat as RepeatIcon,
    Notifications as NotificationIcon,
    Public as PublicIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('es');

const ContentScheduler = ({ 
    publishedAt, 
    onPublishedAtChange, 
    status, 
    onStatusChange,
    featured,
    onFeaturedChange 
}) => {
    const theme = useTheme();
    const [scheduleType, setScheduleType] = useState(
        publishedAt && dayjs(publishedAt).isAfter(dayjs()) ? 'scheduled' : 'immediate'
    );
    const [notifications, setNotifications] = useState(true);

    const handleScheduleTypeChange = (type) => {
        setScheduleType(type);
        
        if (type === 'immediate') {
            onPublishedAtChange(dayjs());
            onStatusChange('published');
        } else if (type === 'scheduled') {
            onPublishedAtChange(dayjs().add(1, 'hour'));
            onStatusChange('scheduled');
        } else if (type === 'draft') {
            onPublishedAtChange(null);
            onStatusChange('draft');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return theme.palette.success.main;
            case 'scheduled': return theme.palette.warning.main;
            case 'draft': return theme.palette.info.main;
            default: return theme.palette.grey[500];
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'published': return <PublicIcon />;
            case 'scheduled': return <ScheduleIcon />;
            case 'draft': return <VisibilityIcon />;
            default: return <VisibilityIcon />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'published': return 'Publicado';
            case 'scheduled': return 'Programado';
            case 'draft': return 'Borrador';
            default: return 'Borrador';
        }
    };

    return (
        <Card
            sx={{
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: 3,
            }}
        >
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <EventIcon sx={{ color: theme.palette.primary.main }} />
                    <Typography variant="h6" fontWeight="bold">
                        Programación y Visibilidad
                    </Typography>
                    <Chip
                        icon={getStatusIcon(status)}
                        label={getStatusText(status)}
                        size="small"
                        sx={{
                            backgroundColor: alpha(getStatusColor(status), 0.1),
                            color: getStatusColor(status),
                            border: `1px solid ${alpha(getStatusColor(status), 0.3)}`,
                            fontWeight: 'bold'
                        }}
                    />
                </Box>

                <Stack spacing={3}>
                    {/* Schedule Type Selection */}
                    <FormControl fullWidth>
                        <InputLabel>Tipo de Publicación</InputLabel>
                        <Select
                            value={scheduleType}
                            label="Tipo de Publicación"
                            onChange={(e) => handleScheduleTypeChange(e.target.value)}
                            sx={{
                                backgroundColor: alpha(theme.palette.background.paper, 0.5),
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            <MenuItem value="immediate">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PublicIcon fontSize="small" />
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            Publicar Inmediatamente
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            El contenido será visible al público ahora mismo
                                        </Typography>
                                    </Box>
                                </Box>
                            </MenuItem>
                            <MenuItem value="scheduled">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ScheduleIcon fontSize="small" />
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            Programar Publicación
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Elegir fecha y hora específica para publicar
                                        </Typography>
                                    </Box>
                                </Box>
                            </MenuItem>
                            <MenuItem value="draft">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <VisibilityIcon fontSize="small" />
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            Guardar como Borrador
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            No será visible hasta que se publique manualmente
                                        </Typography>
                                    </Box>
                                </Box>
                            </MenuItem>
                        </Select>
                    </FormControl>

                    {/* Date Time Picker for Scheduled Posts */}
                    {scheduleType === 'scheduled' && (
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                            <DateTimePicker
                                label="Fecha y Hora de Publicación"
                                value={publishedAt}
                                onChange={onPublishedAtChange}
                                minDateTime={dayjs()}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                                        backdropFilter: 'blur(10px)',
                                    }
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        helperText: 'El contenido se publicará automáticamente en la fecha seleccionada'
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    )}

                    {/* Immediate Publication Info */}
                    {scheduleType === 'immediate' && (
                        <Alert 
                            severity="success" 
                            icon={<PublicIcon />}
                            sx={{
                                backgroundColor: alpha(theme.palette.success.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                            }}
                        >
                            <Typography variant="body2">
                                <strong>Publicación Inmediata:</strong> El contenido será visible para todos los usuarios tan pronto como se guarde.
                            </Typography>
                        </Alert>
                    )}

                    {/* Draft Info */}
                    {scheduleType === 'draft' && (
                        <Alert 
                            severity="info" 
                            icon={<VisibilityIcon />}
                            sx={{
                                backgroundColor: alpha(theme.palette.info.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                            }}
                        >
                            <Typography variant="body2">
                                <strong>Borrador:</strong> El contenido se guardará pero no será visible para el público hasta que se publique manualmente.
                            </Typography>
                        </Alert>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Additional Options */}
                    <Stack spacing={2}>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                            Opciones Adicionales
                        </Typography>
                        
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={featured}
                                    onChange={(e) => onFeaturedChange(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                        Contenido Destacado
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Aparecerá en la sección de contenido destacado
                                    </Typography>
                                </Box>
                            }
                        />

                        {scheduleType === 'scheduled' && (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notifications}
                                        onChange={(e) => setNotifications(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            Notificaciones
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Enviar notificación cuando se publique automáticamente
                                        </Typography>
                                    </Box>
                                }
                            />
                        )}
                    </Stack>

                    {/* Schedule Summary */}
                    {scheduleType === 'scheduled' && publishedAt && (
                        <Alert 
                            severity="warning" 
                            icon={<ScheduleIcon />}
                            sx={{
                                backgroundColor: alpha(theme.palette.warning.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                            }}
                        >
                            <Typography variant="body2">
                                <strong>Programado para:</strong> {dayjs(publishedAt).format('dddd, D [de] MMMM [de] YYYY [a las] HH:mm')}
                                <br />
                                <Typography variant="caption" color="text.secondary">
                                    ({dayjs(publishedAt).fromNow()})
                                </Typography>
                            </Typography>
                        </Alert>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default ContentScheduler;
