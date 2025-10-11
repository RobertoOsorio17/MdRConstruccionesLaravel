import React from 'react';
import {
    Snackbar,
    Alert,
    IconButton,
    useTheme
} from '@mui/material';
import {
    Close as CloseIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Info as InfoIcon
} from '@mui/icons-material';

const NotificationSnackbar = ({ 
    open, 
    onClose, 
    message, 
    severity = 'info', 
    duration = 4000,
    action
}) => {
    const theme = useTheme();

    const getIcon = () => {
        switch (severity) {
            case 'success':
                return <SuccessIcon />;
            case 'error':
                return <ErrorIcon />;
            case 'warning':
                return <WarningIcon />;
            default:
                return <InfoIcon />;
        }
    };

    return (
        <Snackbar
            open={open}
            autoHideDuration={duration}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            sx={{ 
                '& .MuiSnackbarContent-root': {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    padding: 0
                }
            }}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                variant="filled"
                icon={getIcon()}
                sx={{
                    minWidth: 300,
                    borderRadius: 3,
                    boxShadow: theme.shadows[8],
                    '& .MuiAlert-icon': {
                        fontSize: '1.5rem'
                    },
                    '& .MuiAlert-message': {
                        fontSize: '0.95rem',
                        fontWeight: 500
                    }
                }}
                action={
                    action || (
                        <IconButton
                            size="small"
                            aria-label="cerrar"
                            color="inherit"
                            onClick={onClose}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    )
                }
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default NotificationSnackbar;