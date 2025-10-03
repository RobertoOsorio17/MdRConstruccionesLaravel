import React from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Alert,
    Paper,
    Stack
} from '@mui/material';
import {
    Error as ErrorIcon,
    Refresh as RefreshIcon,
    Home as HomeIcon
} from '@mui/icons-material';
import { Link } from '@inertiajs/react';
import errorLogger from '@/Utils/ErrorLogger';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null, 
            errorInfo: null 
        };
    }

    static getDerivedStateFromError(error) {
        // Actualiza el state para mostrar la UI de error
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Registra el error
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Send error to logging service
        errorLogger.logError(error, errorInfo, {
            boundary: 'ErrorBoundary',
            component: errorInfo?.componentStack?.split('\n')[1]?.trim() || 'Unknown',
        });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            const isDevelopment = process.env.NODE_ENV === 'development';

            return (
                <Container maxWidth="md" sx={{ py: 8 }}>
                    <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
                        <Stack spacing={4} alignItems="center">
                            <ErrorIcon 
                                sx={{ 
                                    fontSize: 80, 
                                    color: 'error.main',
                                    opacity: 0.7 
                                }} 
                            />
                            
                            <Box>
                                <Typography variant="h4" gutterBottom fontWeight="bold">
                                    ¡Oops! Algo salió mal
                                </Typography>
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                                    Ha ocurrido un error inesperado en la aplicación
                                </Typography>
                            </Box>

                            {isDevelopment && this.state.error && (
                                <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Error Details:
                                    </Typography>
                                    <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem' }}>
                                        {this.state.error.toString()}
                                    </Typography>
                                    {this.state.errorInfo && (
                                        <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem', mt: 1 }}>
                                            {this.state.errorInfo.componentStack}
                                        </Typography>
                                    )}
                                </Alert>
                            )}

                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="contained"
                                    startIcon={<RefreshIcon />}
                                    onClick={this.handleReload}
                                    size="large"
                                >
                                    Recargar Página
                                </Button>
                                
                                <Button
                                    variant="outlined"
                                    startIcon={<HomeIcon />}
                                    component={Link}
                                    href="/"
                                    size="large"
                                >
                                    Ir al Inicio
                                </Button>
                            </Stack>

                            <Typography variant="body2" color="text.secondary">
                                Si el problema persiste, por favor contacta al soporte técnico.
                            </Typography>
                        </Stack>
                    </Paper>
                </Container>
            );
        }

        return this.props.children;
    }
}

// Hook para usar con componentes funcionales
export const useErrorHandler = () => {
    const handleError = (error, errorInfo = null, context = {}) => {
        console.error('Error handled:', error, errorInfo);

        // Send error to logging service
        errorLogger.logError(error, errorInfo, {
            ...context,
            handler: 'useErrorHandler',
        });
    };

    return { handleError };
};

// Componente wrapper para facilitar el uso
export const WithErrorBoundary = ({ children, fallback = null }) => {
    return (
        <ErrorBoundary fallback={fallback}>
            {children}
        </ErrorBoundary>
    );
};

export default ErrorBoundary;
