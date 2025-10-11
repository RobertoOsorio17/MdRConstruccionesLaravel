import React from 'react';
import { Head } from '@inertiajs/react';
import { Box, Container, Typography, Avatar, Button } from '@mui/material';
import MainLayout from '@/Layouts/MainLayout';

const ProfileTest = ({ profileUser, stats, favoriteServices, auth }) => {
    return (
        <MainLayout>
            <Head title={`${profileUser.name} - Perfil`} />
            
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box textAlign="center">
                    <Avatar 
                        src={profileUser.avatar_url} 
                        sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                    />
                    <Typography variant="h4" gutterBottom>
                        {profileUser.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        {profileUser.bio || 'Sin biografía'}
                    </Typography>
                    
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6">
                            Servicios Favoritos: {stats.favoriteServicesCount}
                        </Typography>
                        <Typography variant="body2">
                            Miembro desde: {stats.joinedDate}
                        </Typography>
                    </Box>
                    
                    {favoriteServices && favoriteServices.length > 0 && (
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                Servicios Favoritos
                            </Typography>
                            {favoriteServices.map(service => (
                                <Box key={service.id} sx={{ p: 2, border: '1px solid #ddd', mb: 2 }}>
                                    <Typography variant="h6">{service.title}</Typography>
                                    <Typography variant="body2">{service.excerpt}</Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Container>
        </MainLayout>
    );
};

export default ProfileTest;
