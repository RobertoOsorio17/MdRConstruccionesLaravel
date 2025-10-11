import React from 'react';
import {
    Box,
    Typography,
    Alert
} from '@mui/material';

const ConnectedAccountsTab = ({ connectedAccounts, hasPassword }) => {
    return (
        <Box>
            <Typography variant="h5" gutterBottom fontWeight="600">
                Cuentas Conectadas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Gestiona las cuentas de redes sociales vinculadas a tu perfil
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                Esta funcionalidad se encuentra en una página dedicada. 
                <Typography
                    component="a"
                    href="/connected-accounts"
                    sx={{ 
                        ml: 1, 
                        color: 'primary.main', 
                        textDecoration: 'underline',
                        cursor: 'pointer'
                    }}
                >
                    Ir a Cuentas Conectadas
                </Typography>
            </Alert>

            {/* Summary */}
            <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Resumen
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    • Cuentas conectadas: {connectedAccounts?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    • Contraseña configurada: {hasPassword ? 'Sí' : 'No'}
                </Typography>
            </Box>
        </Box>
    );
};

export default ConnectedAccountsTab;

