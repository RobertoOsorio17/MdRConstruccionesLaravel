import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Avatar,
    Chip,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Alert,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Email as EmailIcon,
    Person as PersonIcon,
    AdminPanelSettings as AdminIcon,
    CalendarToday as CalendarIcon,
    Visibility as VisibilityIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Security as SecurityIcon,
    History as HistoryIcon,
    Comment as CommentIcon,
    Verified as VerifiedIcon,
    VerifiedUser as VerifiedUserIcon,
    PersonOff as PersonOffIcon,
} from '@mui/icons-material';
import AdminLayoutNew from '@/Layouts/AdminLayoutNew';
import UserCommentsTab from '@/Components/Admin/UserCommentsTab';

const UserShow = ({ user, recentActivity = [], commentStats = {} }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [unverifyDialogOpen, setUnverifyDialogOpen] = useState(false);
    const [verificationNotes, setVerificationNotes] = useState('');
    // Glassmorphism styles
    const glassmorphismCard = {
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    const handleBack = () => {
        router.get(route('admin.users.index'));
    };

    const handleEdit = () => {
        router.get(route('admin.users.edit', user.id));
    };

    const handleDelete = () => {
        if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            router.delete(route('admin.users.destroy', user.id));
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return '#e53e3e';
            case 'editor': return '#3182ce';
            case 'user': return '#38a169';
            default: return '#718096';
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return <AdminIcon />;
            case 'editor': return <EditIcon />;
            case 'user': return <PersonIcon />;
            default: return <PersonIcon />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Nunca';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleVerifyUser = () => {
        setVerifyDialogOpen(true);
    };

    const confirmVerifyUser = () => {
        setVerificationLoading(true);
        setVerifyDialogOpen(false);

        router.post(route('admin.users.verify', user.id), {
            verification_notes: verificationNotes
        }, {
            onFinish: () => {
                setVerificationLoading(false);
                setVerificationNotes('');
            }
        });
    };

    const handleUnverifyUser = () => {
        setUnverifyDialogOpen(true);
    };

    const confirmUnverifyUser = () => {
        setVerificationLoading(true);
        setUnverifyDialogOpen(false);

        router.post(route('admin.users.unverify', user.id), {
            verification_notes: verificationNotes
        }, {
            onFinish: () => {
                setVerificationLoading(false);
                setVerificationNotes('');
            }
        });
    };

    return (
        <AdminLayoutNew>
            <Head title={`Usuario: ${user.name}`} />
            
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ padding: '24px' }}
            >
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                onClick={handleBack}
                                sx={{
                                    mr: 2,
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    '&:hover': {
                                        background: 'rgba(255, 255, 255, 0.2)',
                                    }
                                }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 600, color: '#2D3748', mb: 1 }}>
                                    Detalles del Usuario
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#718096' }}>
                                    Información completa del usuario {user.name}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={handleEdit}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                }}
                            >
                                Editar
                            </Button>

                            {user.is_verified ? (
                                <Button
                                    variant="outlined"
                                    color="warning"
                                    startIcon={<PersonOffIcon />}
                                    onClick={handleUnverifyUser}
                                    disabled={verificationLoading}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: '8px',
                                    }}
                                >
                                    Desverificar
                                </Button>
                            ) : (
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<VerifiedUserIcon />}
                                    onClick={handleVerifyUser}
                                    disabled={verificationLoading}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: '8px',
                                    }}
                                >
                                    Verificar
                                </Button>
                            )}

                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleDelete}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                }}
                            >
                                Eliminar
                            </Button>
                        </Box>
                    </Box>
                </motion.div>

                <Grid container spacing={3}>
                    {/* User Profile Card */}
                    <Grid item xs={12} md={4}>
                        <motion.div variants={itemVariants}>
                            <Card sx={glassmorphismCard}>
                                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                    <Avatar
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            mx: 'auto',
                                            mb: 3,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            fontSize: '3rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {user.name.charAt(0).toUpperCase()}
                                    </Avatar>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#2D3748' }}>
                                            {user.name}
                                        </Typography>
                                        {user.is_verified && (
                                            <VerifiedIcon sx={{ color: '#1976d2', fontSize: '1.5rem' }} />
                                        )}
                                    </Box>
                                    
                                    <Typography variant="body1" sx={{ color: '#718096', mb: 3 }}>
                                        {user.email}
                                    </Typography>

                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
                                        <Chip
                                            icon={getRoleIcon(user.role)}
                                            label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            sx={{
                                                backgroundColor: getRoleColor(user.role),
                                                color: 'white',
                                                fontWeight: 600,
                                            }}
                                        />
                                        <Chip
                                            icon={!user.is_banned ? <CheckCircleIcon /> : <CancelIcon />}
                                            label={!user.is_banned ? 'Activo' : 'Suspendido'}
                                            color={!user.is_banned ? 'success' : 'error'}
                                            variant="outlined"
                                        />
                                        <Chip
                                            icon={user.is_verified ? <VerifiedUserIcon /> : <PersonOffIcon />}
                                            label={user.is_verified ? 'Verificado' : 'No Verificado'}
                                            color={user.is_verified ? 'primary' : 'default'}
                                            variant="outlined"
                                        />
                                    </Box>

                                    <Divider sx={{ my: 3 }} />

                                    <List dense>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CalendarIcon sx={{ color: '#667eea' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Registro"
                                                secondary={formatDate(user.created_at)}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <VisibilityIcon sx={{ color: '#667eea' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Último Login"
                                                secondary={formatDate(user.last_login_at)}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <SecurityIcon sx={{ color: '#667eea' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Email Verificado"
                                                secondary={user.email_verified_at ? 'Sí' : 'No'}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <VerifiedUserIcon sx={{ color: user.is_verified ? '#1976d2' : '#9e9e9e' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Usuario Verificado"
                                                secondary={
                                                    user.is_verified
                                                        ? `Sí - ${formatDate(user.verified_at)}`
                                                        : 'No'
                                                }
                                            />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    {/* User Details */}
                    <Grid item xs={12} md={8}>
                        <motion.div variants={itemVariants}>
                            <Card sx={glassmorphismCard}>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748', mb: 3, display: 'flex', alignItems: 'center' }}>
                                        <PersonIcon sx={{ mr: 1, color: '#667eea' }} />
                                        Información del Usuario
                                    </Typography>

                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="subtitle2" sx={{ color: '#718096', mb: 1 }}>
                                                    ID del Usuario
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    #{user.id}
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="subtitle2" sx={{ color: '#718096', mb: 1 }}>
                                                    Nombre Completo
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {user.name}
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="subtitle2" sx={{ color: '#718096', mb: 1 }}>
                                                    Correo Electrónico
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {user.email}
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="subtitle2" sx={{ color: '#718096', mb: 1 }}>
                                                    Rol del Sistema
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="subtitle2" sx={{ color: '#718096', mb: 1 }}>
                                                    Estado
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {!user.is_banned ? 'Activo' : 'Suspendido'}
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="subtitle2" sx={{ color: '#718096', mb: 1 }}>
                                                    Fecha de Registro
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {formatDate(user.created_at)}
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="subtitle2" sx={{ color: '#718096', mb: 1 }}>
                                                    Estado de Verificación
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {user.is_verified ? 'Verificado' : 'No Verificado'}
                                                    </Typography>
                                                    {user.is_verified && (
                                                        <VerifiedIcon sx={{ color: '#1976d2', fontSize: '1.2rem' }} />
                                                    )}
                                                </Box>
                                            </Box>
                                        </Grid>

                                        {user.is_verified && (
                                            <>
                                                <Grid item xs={12} sm={6}>
                                                    <Box sx={{ mb: 3 }}>
                                                        <Typography variant="subtitle2" sx={{ color: '#718096', mb: 1 }}>
                                                            Verificado el
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {formatDate(user.verified_at)}
                                                        </Typography>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <Box sx={{ mb: 3 }}>
                                                        <Typography variant="subtitle2" sx={{ color: '#718096', mb: 1 }}>
                                                            Verificado por
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {user.verified_by?.name || 'Sistema'}
                                                        </Typography>
                                                    </Box>
                                                </Grid>

                                                {user.verification_notes && (
                                                    <Grid item xs={12}>
                                                        <Box sx={{ mb: 3 }}>
                                                            <Typography variant="subtitle2" sx={{ color: '#718096', mb: 1 }}>
                                                                Notas de Verificación
                                                            </Typography>
                                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                                {user.verification_notes}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                )}
                                            </>
                                        )}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Recent Activity */}
                        {recentActivity.length > 0 && (
                            <motion.div variants={itemVariants} style={{ marginTop: '24px' }}>
                                <Card sx={glassmorphismCard}>
                                    <CardContent sx={{ p: 4 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748', mb: 3, display: 'flex', alignItems: 'center' }}>
                                            <HistoryIcon sx={{ mr: 1, color: '#667eea' }} />
                                            Actividad Reciente
                                        </Typography>

                                        <List>
                                            {recentActivity.slice(0, 5).map((activity, index) => (
                                                <ListItem key={index} divider={index < recentActivity.length - 1}>
                                                    <ListItemText
                                                        primary={activity.description}
                                                        secondary={formatDate(activity.created_at)}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Tabs Section */}
                        <motion.div variants={itemVariants} style={{ marginTop: '24px' }}>
                            <Card sx={glassmorphismCard}>
                                <CardContent sx={{ p: 0 }}>
                                    <Tabs
                                        value={activeTab}
                                        onChange={(e, newValue) => setActiveTab(newValue)}
                                        sx={{
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                                            '& .MuiTab-root': {
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                fontSize: '1rem',
                                                minHeight: 64,
                                            }
                                        }}
                                    >
                                        <Tab
                                            icon={<HistoryIcon />}
                                            label="Actividad Reciente"
                                            iconPosition="start"
                                        />
                                        <Tab
                                            icon={<CommentIcon />}
                                            label={`Comentarios (${commentStats.total || 0})`}
                                            iconPosition="start"
                                        />
                                    </Tabs>

                                    <Box sx={{ p: 3 }}>
                                        {activeTab === 0 && (
                                            <Box>
                                                {recentActivity.length > 0 ? (
                                                    <List>
                                                        {recentActivity.slice(0, 5).map((activity, index) => (
                                                            <ListItem key={index} divider={index < recentActivity.length - 1}>
                                                                <ListItemText
                                                                    primary={activity.description}
                                                                    secondary={formatDate(activity.created_at)}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                ) : (
                                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                                        <HistoryIcon sx={{ fontSize: 64, color: '#CBD5E0', mb: 2 }} />
                                                        <Typography variant="h6" sx={{ color: '#718096', mb: 1 }}>
                                                            Sin actividad reciente
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
                                                            No hay actividad registrada para este usuario.
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        )}

                                        {activeTab === 1 && (
                                            <UserCommentsTab
                                                user={user}
                                                commentStats={commentStats}
                                            />
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                </Grid>
            </motion.div>

            {/* Verify User Dialog */}
            <Dialog
                open={verifyDialogOpen}
                onClose={() => setVerifyDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Verificar Usuario</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, color: '#718096' }}>
                        ¿Estás seguro de que deseas verificar a {user.name}?
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Notas de verificación (opcional)"
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        placeholder="Agrega notas sobre esta verificación..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setVerifyDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={confirmVerifyUser}
                        variant="contained"
                        color="primary"
                        disabled={verificationLoading}
                    >
                        Verificar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Unverify User Dialog */}
            <Dialog
                open={unverifyDialogOpen}
                onClose={() => setUnverifyDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Desverificar Usuario</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, color: '#718096' }}>
                        ¿Estás seguro de que deseas desverificar a {user.name}?
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Notas de desverificación (opcional)"
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        placeholder="Agrega notas sobre esta desverificación..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUnverifyDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={confirmUnverifyUser}
                        variant="contained"
                        color="warning"
                        disabled={verificationLoading}
                    >
                        Desverificar
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayoutNew>
    );
};

export default UserShow;
