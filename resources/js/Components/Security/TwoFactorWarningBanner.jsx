import React from 'react';
import { Alert, AlertTitle, Box, Button, Collapse, IconButton } from '@mui/material';
import { Close as CloseIcon, Security as SecurityIcon } from '@mui/icons-material';
import TwoFactorModal from '@/Components/Profile/TwoFactorModal';

/**
 * Banner de advertencia para usuarios que deben activar 2FA
 * Solo se muestra si:
 * 1. El setting enable_2fa está activado
 * 2. El usuario NO tiene 2FA configurado
 * 3. Hay un mensaje de advertencia en la sesión
 */
export default function TwoFactorWarningBanner({ flash = {}, security = {} }) {
    const [open, setOpen] = React.useState(true);
    const [modalOpen, setModalOpen] = React.useState(false);

    // Solo mostrar si:
    // 1. 2FA está habilitado globalmente
    // 2. El usuario NO tiene 2FA
    // 3. Hay un mensaje de advertencia
    const shouldShow = security?.enable_2fa && !security?.user_has_2fa && flash?.['2fa_warning'];

    if (!shouldShow) {
        return null;
    }

    const warningMessage = flash['2fa_warning'] || 'La autenticación de dos factores es obligatoria. Por favor actívala en tu perfil.';

    const handleClose = () => {
        setOpen(false);
    };

    const handleSetup2FA = () => {
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
    };

    return (
        <>
            <Collapse in={open}>
                <Box
                    sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1200,
                        width: '100%',
                    }}
                >
                    <Alert
                        severity="warning"
                        icon={<SecurityIcon />}
                        action={
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Button
                                    color="inherit"
                                    size="small"
                                    variant="outlined"
                                    onClick={handleSetup2FA}
                                    sx={{
                                        fontWeight: 600,
                                        borderColor: 'warning.main',
                                        '&:hover': {
                                            borderColor: 'warning.dark',
                                            backgroundColor: 'rgba(255, 152, 0, 0.08)',
                                        },
                                    }}
                                >
                                    Activar Ahora
                                </Button>
                                <IconButton
                                    aria-label="cerrar"
                                    color="inherit"
                                    size="small"
                                    onClick={handleClose}
                                >
                                    <CloseIcon fontSize="inherit" />
                                </IconButton>
                            </Box>
                        }
                        sx={{
                            borderRadius: 0,
                            '& .MuiAlert-message': {
                                width: '100%',
                            },
                        }}
                    >
                        <AlertTitle sx={{ fontWeight: 700 }}>
                            Autenticación de Dos Factores Requerida
                        </AlertTitle>
                        {warningMessage}
                    </Alert>
                </Box>
            </Collapse>

            {/* Modal de configuración 2FA */}
            <TwoFactorModal
                open={modalOpen}
                onClose={handleModalClose}
                twoFactorEnabled={false}
            />
        </>
    );
}

