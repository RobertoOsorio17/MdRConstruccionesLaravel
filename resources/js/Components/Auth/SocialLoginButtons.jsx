import React from 'react';
import { Box, Button, Divider, Typography } from '@mui/material';
import { Google as GoogleIcon, Facebook as FacebookIcon, GitHub as GitHubIcon } from '@mui/icons-material';

const SocialLoginButtons = () => {
    const handleSocialLogin = (provider) => {
        window.location.href = route('auth.social.redirect', provider);
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                    O continuar con
                </Typography>
            </Divider>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Google Login */}
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    onClick={() => handleSocialLogin('google')}
                    sx={{
                        borderColor: '#DB4437',
                        color: '#DB4437',
                        '&:hover': {
                            borderColor: '#DB4437',
                            bgcolor: 'rgba(219, 68, 55, 0.04)',
                        },
                    }}
                >
                    Continuar con Google
                </Button>

                {/* Facebook Login */}
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FacebookIcon />}
                    onClick={() => handleSocialLogin('facebook')}
                    sx={{
                        borderColor: '#1877F2',
                        color: '#1877F2',
                        '&:hover': {
                            borderColor: '#1877F2',
                            bgcolor: 'rgba(24, 119, 242, 0.04)',
                        },
                    }}
                >
                    Continuar con Facebook
                </Button>

                {/* GitHub Login */}
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GitHubIcon />}
                    onClick={() => handleSocialLogin('github')}
                    sx={{
                        borderColor: '#333',
                        color: '#333',
                        '&:hover': {
                            borderColor: '#333',
                            bgcolor: 'rgba(51, 51, 51, 0.04)',
                        },
                    }}
                >
                    Continuar con GitHub
                </Button>
            </Box>
        </Box>
    );
};

export default SocialLoginButtons;

