import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    Alert,
    IconButton,
    InputAdornment,
    Divider,
    useTheme,
    alpha,
    Avatar,
    Tabs,
    Tab,
    CircularProgress
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    Login as LoginIcon,
    PersonAdd as RegisterIcon,
    Close as CloseIcon,
    Google as GoogleIcon,
    Facebook as FacebookIcon,
    Construction as ConstructionIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const LoginModal = ({ open, onClose, initialTab = 0 }) => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    // Formulario de Login
    const loginForm = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Formulario de Registro
    const registerForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        // Limpiar errores al cambiar de tab
        loginForm.clearErrors();
        registerForm.clearErrors();
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        loginForm.post(route('login'), {
            onSuccess: () => {
                onClose();
                // Recargar la página para actualizar el estado de autenticación
                window.location.reload();
            },
            onError: () => {
                // Los errores se manejan automáticamente por Inertia
            }
        });
    };

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        registerForm.post(route('register'), {
            onSuccess: () => {
                onClose();
                // Recargar la página para actualizar el estado de autenticación
                window.location.reload();
            },
            onError: () => {
                // Los errores se manejan automáticamente por Inertia
            }
        });
    };

    const TabPanel = ({ children, value, index, ...other }) => (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`auth-tabpanel-${index}`}
            aria-labelledby={`auth-tab-${index}`}
            {...other}
        >
            {value === index && children}
        </div>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    background: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(20px)',
                    minHeight: 600
                }
            }}
        >
            {/* Header */}
            <DialogTitle sx={{ p: 0, position: 'relative' }}>
                <Box sx={{ 
                    textAlign: 'center', 
                    pt: 4, 
                    pb: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: 'white',
                    position: 'relative'
                }}>
                    <IconButton
                        onClick={onClose}
                        sx={{ 
                            position: 'absolute', 
                            right: 16, 
                            top: 16,
                            color: 'white',
                            '&:hover': { 
                                backgroundColor: alpha(theme.palette.common.white, 0.1) 
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                mx: 'auto',
                                mb: 2,
                                bgcolor: alpha(theme.palette.common.white, 0.2),
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <ConstructionIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                    </motion.div>

                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                        {activeTab === 0 ? 'Bienvenido de vuelta' : 'Únete a nosotros'}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        {activeTab === 0 
                            ? 'Inicia sesión para acceder a todas las funciones'
                            : 'Crea tu cuenta y forma parte de nuestra comunidad'
                        }
                    </Typography>

                    {/* Tabs */}
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        centered
                        sx={{
                            mt: 3,
                            '& .MuiTab-root': {
                                color: alpha(theme.palette.common.white, 0.7),
                                fontWeight: 600,
                                minWidth: 120,
                                '&.Mui-selected': {
                                    color: 'white',
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: 'white',
                                height: 3,
                                borderRadius: 2
                            }
                        }}
                    >
                        <Tab label="Iniciar Sesión" icon={<LoginIcon />} iconPosition="start" />
                        <Tab label="Registro" icon={<RegisterIcon />} iconPosition="start" />
                    </Tabs>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                {/* Login Tab */}
                <TabPanel value={activeTab} index={0}>
                    <Box sx={{ p: 4 }}>
                        {/* Social Login */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<GoogleIcon />}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: 3,
                                        borderColor: alpha(theme.palette.text.primary, 0.2),
                                        '&:hover': {
                                            borderColor: '#ea4335',
                                            backgroundColor: alpha('#ea4335', 0.1),
                                            color: '#ea4335'
                                        }
                                    }}
                                >
                                    Google
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<FacebookIcon />}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: 3,
                                        borderColor: alpha(theme.palette.text.primary, 0.2),
                                        '&:hover': {
                                            borderColor: '#1877f2',
                                            backgroundColor: alpha('#1877f2', 0.1),
                                            color: '#1877f2'
                                        }
                                    }}
                                >
                                    Facebook
                                </Button>
                            </Box>
                            
                            <Divider sx={{ my: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    O continúa con email
                                </Typography>
                            </Divider>
                        </Box>

                        {/* Login Form */}
                        <form onSubmit={handleLoginSubmit}>
                            <TextField
                                fullWidth
                                type="email"
                                label="Correo electrónico"
                                value={loginForm.data.email}
                                onChange={(e) => loginForm.setData('email', e.target.value)}
                                error={!!loginForm.errors.email}
                                helperText={loginForm.errors.email}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': { borderRadius: 3 }
                                }}
                            />

                            <TextField
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                label="Contraseña"
                                value={loginForm.data.password}
                                onChange={(e) => loginForm.setData('password', e.target.value)}
                                error={!!loginForm.errors.password}
                                helperText={loginForm.errors.password}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': { borderRadius: 3 }
                                }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={loginForm.data.remember}
                                            onChange={(e) => loginForm.setData('remember', e.target.checked)}
                                        />
                                    }
                                    label="Recordarme"
                                />
                                
                                <Button
                                    variant="text"
                                    size="small"
                                    sx={{ color: theme.palette.primary.main }}
                                >
                                    ¿Olvidaste tu contraseña?
                                </Button>
                            </Box>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loginForm.processing}
                                startIcon={loginForm.processing ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 3,
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: theme.shadows[8]
                                    }
                                }}
                            >
                                {loginForm.processing ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                            </Button>
                        </form>
                    </Box>
                </TabPanel>

                {/* Register Tab */}
                <TabPanel value={activeTab} index={1}>
                    <Box sx={{ p: 4 }}>
                        {/* Social Register */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<GoogleIcon />}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: 3,
                                        borderColor: alpha(theme.palette.text.primary, 0.2),
                                        '&:hover': {
                                            borderColor: '#ea4335',
                                            backgroundColor: alpha('#ea4335', 0.1),
                                            color: '#ea4335'
                                        }
                                    }}
                                >
                                    Google
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<FacebookIcon />}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: 3,
                                        borderColor: alpha(theme.palette.text.primary, 0.2),
                                        '&:hover': {
                                            borderColor: '#1877f2',
                                            backgroundColor: alpha('#1877f2', 0.1),
                                            color: '#1877f2'
                                        }
                                    }}
                                >
                                    Facebook
                                </Button>
                            </Box>
                            
                            <Divider sx={{ my: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    O regístrate con email
                                </Typography>
                            </Divider>
                        </Box>

                        {/* Register Form */}
                        <form onSubmit={handleRegisterSubmit}>
                            <TextField
                                fullWidth
                                label="Nombre completo"
                                value={registerForm.data.name}
                                onChange={(e) => registerForm.setData('name', e.target.value)}
                                error={!!registerForm.errors.name}
                                helperText={registerForm.errors.name}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': { borderRadius: 3 }
                                }}
                            />

                            <TextField
                                fullWidth
                                type="email"
                                label="Correo electrónico"
                                value={registerForm.data.email}
                                onChange={(e) => registerForm.setData('email', e.target.value)}
                                error={!!registerForm.errors.email}
                                helperText={registerForm.errors.email}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': { borderRadius: 3 }
                                }}
                            />

                            <TextField
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                label="Contraseña"
                                value={registerForm.data.password}
                                onChange={(e) => registerForm.setData('password', e.target.value)}
                                error={!!registerForm.errors.password}
                                helperText={registerForm.errors.password}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': { borderRadius: 3 }
                                }}
                            />

                            <TextField
                                fullWidth
                                type={showPasswordConfirm ? 'text' : 'password'}
                                label="Confirmar contraseña"
                                value={registerForm.data.password_confirmation}
                                onChange={(e) => registerForm.setData('password_confirmation', e.target.value)}
                                error={!!registerForm.errors.password_confirmation}
                                helperText={registerForm.errors.password_confirmation}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                                edge="end"
                                            >
                                                {showPasswordConfirm ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': { borderRadius: 3 }
                                }}
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={registerForm.data.terms}
                                        onChange={(e) => registerForm.setData('terms', e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Typography variant="body2">
                                        Acepto los términos y condiciones y la política de privacidad
                                    </Typography>
                                }
                                sx={{ mb: 3, alignItems: 'flex-start' }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={registerForm.processing || !registerForm.data.terms}
                                startIcon={registerForm.processing ? <CircularProgress size={20} color="inherit" /> : <RegisterIcon />}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 3,
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: theme.shadows[8]
                                    }
                                }}
                            >
                                {registerForm.processing ? 'Creando cuenta...' : 'Crear Cuenta'}
                            </Button>
                        </form>
                    </Box>
                </TabPanel>
            </DialogContent>
        </Dialog>
    );
};

export default LoginModal;