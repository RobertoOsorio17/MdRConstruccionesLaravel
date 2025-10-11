import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Card,
    CardContent,
    Avatar,
    Typography,
    Button,
    Box,
    Chip,
    useTheme,
    alpha
} from '@mui/material';
import {
    PersonAdd as FollowIcon,
    LocationOn as LocationIcon,
    Work as WorkIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const UserProfileCard = ({ 
    user, 
    showFollowButton = true, 
    onFollow, 
    isFollowing = false,
    compact = false 
}) => {
    const theme = useTheme();

    const handleFollow = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onFollow) {
            onFollow(user.id);
        }
    };

    return (
        <Card
            component={motion.div}
            whileHover={{ y: -4 }}
            sx={{
                height: '100%',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                    boxShadow: theme.shadows[8],
                    '& .user-avatar': {
                        transform: 'scale(1.1)'
                    }
                }
            }}
        >
            <CardContent sx={{ p: compact ? 2 : 3, textAlign: 'center' }}>
                <Box
                    component={Link}
                    href={`/user/${user.id}`}
                    sx={{ textDecoration: 'none', color: 'inherit' }}
                >
                    <Avatar
                        className="user-avatar"
                        src={user.avatar_url}
                        sx={{
                            width: compact ? 60 : 80,
                            height: compact ? 60 : 80,
                            mx: 'auto',
                            mb: 2,
                            border: `3px solid ${theme.palette.primary.main}`,
                            transition: 'transform 0.3s ease'
                        }}
                    />
                    
                    <Typography 
                        variant={compact ? "subtitle1" : "h6"} 
                        fontWeight="bold" 
                        gutterBottom
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {user.name}
                    </Typography>
                    
                    {user.profession && (
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            gutterBottom
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.5,
                                mb: 1
                            }}
                        >
                            <WorkIcon sx={{ fontSize: 16 }} />
                            {user.profession}
                        </Typography>
                    )}
                    
                    {user.location && (
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            gutterBottom
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.5,
                                mb: 2
                            }}
                        >
                            <LocationIcon sx={{ fontSize: 16 }} />
                            {user.location}
                        </Typography>
                    )}
                    
                    {user.bio && !compact && (
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{
                                mb: 2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: 1.4
                            }}
                        >
                            {user.bio}
                        </Typography>
                    )}
                </Box>
                
                {/* Estadísticas */}
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                    <Box textAlign="center">
                        <Typography variant="h6" fontWeight="bold" color="primary">
                            {user.posts_count || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Posts
                        </Typography>
                    </Box>
                    <Box textAlign="center">
                        <Typography variant="h6" fontWeight="bold" color="primary">
                            {user.followers_count || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Seguidores
                        </Typography>
                    </Box>
                </Box>
                
                {/* Botón de seguir */}
                {showFollowButton && (
                    <Button
                        variant={isFollowing ? "outlined" : "contained"}
                        startIcon={<FollowIcon />}
                        onClick={handleFollow}
                        size="small"
                        sx={{
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                    </Button>
                )}
                
                {/* Etiquetas de perfil */}
                {user.is_verified && (
                    <Box sx={{ mt: 1 }}>
                        <Chip
                            label="Verificado"
                            size="small"
                            color="primary"
                            sx={{ fontSize: '0.7rem' }}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default UserProfileCard;