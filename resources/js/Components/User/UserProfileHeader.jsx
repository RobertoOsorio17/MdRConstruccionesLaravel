import React from 'react';
import { Avatar, Box, Typography, Chip, Stack, Paper, Button, Divider, Tooltip, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import designSystem from '@/theme/designSystem';
const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);
const MotionStack = motion.create(Stack);

export default function UserProfileHeader({ user, stats, isOwnProfile, isFollowing, followersCount, onFollowToggle, followLoading }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const avatarUrl = user.avatar || user.profile_photo_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.name;
    const [frost, setFrost] = React.useState(0);
    React.useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY || 0;
            const v = Math.max(0, Math.min(1, y / 200));
            setFrost(v);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const panelGlass = {
        ...(isDark ? designSystem.glassmorphism.dark : designSystem.glassmorphism.medium),
        backdropFilter: `saturate(${170 + frost * 60}%) blur(${24 + frost * 10}px)`,
        background: isDark
            ? `linear-gradient(135deg, rgba(17,24,39,${(0.55 + 0.1 * frost).toFixed(2)}) 0%, rgba(2,6,23,${(0.40 + 0.08 * frost).toFixed(2)}) 100%)`
            : `linear-gradient(135deg, rgba(255,255,255,${(0.22 + 0.06 * frost).toFixed(2)}) 0%, rgba(255,255,255,${(0.08 + 0.04 * frost).toFixed(2)}) 100%)`,
        border: isDark
            ? `1px solid rgba(255,255,255,${(0.10 + 0.06 * frost).toFixed(2)})`
            : `1px solid rgba(255,255,255,${(0.28 + 0.08 * frost).toFixed(2)})`,
        boxShadow: designSystem.shadows.glass,
    };


    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                px: { xs: 2, md: 3 },
            }}
        >
            <MotionPaper
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                elevation={0}
                sx={{
                    maxWidth: 980,
                    width: '100%',
                    borderRadius: 6,
                    overflow: 'hidden',
                    ...panelGlass,
                }}
            >
                {/* Header Background with Gradient or Cover */}
                <Box
                    sx={{
                        height: { xs: 120, md: 180 },
                        position: 'relative',
                        background: user.cover_url
                            ? `url(${user.cover_url})`
                            : (user.is_verified
                                ? (isDark
                                    ? 'linear-gradient(135deg, rgba(102,126,234,0.20) 0%, rgba(30,30,46,0.4) 100%)'
                                    : 'linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.12) 100%)')
                                : (isDark
                                    ? 'linear-gradient(135deg, rgba(17,24,39,0.6) 0%, rgba(2,6,23,0.7) 100%)'
                                    : 'linear-gradient(135deg, rgba(25, 118, 210, 0.12) 0%, rgba(255, 255, 255, 0.6) 100%)')),
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundAttachment: { xs: 'scroll', md: 'fixed' },
                        '&::before': user.cover_url ? {
                            content: '""',
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%)'
                        } : {},
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '1px',
                            background: isDark ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' : 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)',
                        }
                    }}
                />

                {/* Main Content */}
                <Box
                    sx={{
                        px: { xs: 3, md: 6 },
                        pb: { xs: 6, md: 6 },
                        mt: { xs: -9, md: -12 },
                    }}
                >
                    {/* Avatar Section */}
                    <Stack alignItems="center" spacing={3}>
                        {/* Avatar with Verification */}
                        <MotionBox
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 15,
                                delay: 0.3
                            }}
                            sx={{ position: 'relative' }}
                        >
                            <Box
                                sx={{
                                    position: 'relative',
                                    p: 0.75,
                                    borderRadius: '50%',
                                    background: user.is_verified
                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
                                        : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                                }}
                            >
                                <Avatar
                                    src={avatarUrl}
                                    alt={user.name}
                                    sx={{
                                        width: { xs: 120, md: 140, lg: 160 },
                                        height: { xs: 120, md: 140, lg: 160 },
                                        border: '6px solid white',
                                        fontSize: '4rem',
                                        fontWeight: 700,
                                        bgcolor: 'primary.main',
                                    }}
                                >
                                    {user.name?.charAt(0).toUpperCase()}
                                </Avatar>
                            </Box>
                        </MotionBox>

                        {/* User Info Section */}
                        <MotionStack
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            alignItems="center"
                            spacing={2}
                            sx={{ width: '100%' }}
                        >
                            {/* Name and Role */}
                            <Stack alignItems="center" spacing={1.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Typography
                                        variant="h2"
                                        sx={{
                                            fontWeight: 800,
                                            fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' },
                                            background: isDark ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(226,232,240,0.88) 100%)' : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            letterSpacing: '-0.02em',
                                            textAlign: 'center',
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        }}
                                    >
                                        {user.name}
                                    </Typography>

                                    {/* Verification Badge with Tooltip */}
                                    {user.is_verified && (
                                        <Tooltip
                                            title={
                                                <Box sx={{ p: 0.5 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'white' }}>
                                                        ✓ Usuario verificado
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'rgba(255,255,255,0.9)' }}>
                                                        <strong>Tipo:</strong> {user.verification_type || 'Verificaci\u00f3n de identidad'}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'rgba(255,255,255,0.9)' }}>
                                                        <strong>Fecha:</strong> {user.verified_at ? new Date(user.verified_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date(user.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </Typography>

                                                </Box>
                                            }
                                            arrow
                                            placement="top"
                                            slotProps={{
                                                tooltip: {
                                                    sx: {
                                                        bgcolor: designSystem.colors.primary[600],
                                                        maxWidth: 280,
                                                        px: 1.5,
                                                        py: 1,
                                                        borderRadius: 2,
                                                        boxShadow: '0 8px 24px rgba(25, 118, 210, 0.4)',
                                                        '& .MuiTooltip-arrow': {
                                                            color: designSystem.colors.primary[600],
                                                        },
                                                    }
                                                }
                                            }}
                                        >
                                            <MotionBox
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 12,
                                                    delay: 0.6
                                                }}
                                                whileHover={{ scale: 1.15 }}
                                                sx={{ display: 'flex', cursor: 'help' }}
                                            >
                                                <VerifiedIcon
                                                    sx={{
                                                        color: designSystem.colors.primary[600],
                                                        fontSize: { xs: 32, md: 40 },
                                                        filter: 'drop-shadow(0 2px 8px rgba(25, 118, 210, 0.4))',
                                                    }}
                                                />
                                            </MotionBox>
                                        </Tooltip>
                                    )}
                                </Box>

                                {/* Role Badge with Glassmorphism */}
                                {user.role && (
                                    <Chip
                                        icon={user.role === 'admin' ? <StarIcon /> : <WorkIcon />}
                                        label={user.role === 'admin' ? 'Administrador' : user.role === 'professional' ? 'Profesional' : 'Usuario'}
                                        sx={{
                                            height: 32,
                                            px: 2,
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            bgcolor: user.role === 'admin'
                                                ? 'rgba(211, 47, 47, 0.15)'
                                                : 'rgba(25, 118, 210, 0.15)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid',
                                            borderColor: user.role === 'admin' ? 'error.light' : 'primary.light',
                                            color: user.role === 'admin' ? 'error.main' : 'primary.main',
                                            '& .MuiChip-icon': {
                                                color: user.role === 'admin' ? 'error.main' : 'primary.main',
                                            },
                                        }}
                                    />
                                )}
                            </Stack>

                            {/* Bio/Profession */}
                            {(user.bio || user.profession) && (
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'text.secondary',
                                        fontWeight: 400,
                                        lineHeight: 1.7,
                                        textAlign: 'center',
                                        maxWidth: 600,
                                        fontSize: { xs: '1rem', md: '1.125rem' },
                                    }}
                                >
                                    {user.profession || user.bio}
                                </Typography>
                            )}

                            {/* Action Button */}
                            <Box sx={{ mt: 2 }}>
                                {isOwnProfile ? (
                                    <Button
                                        component={Link}
                                        href={route('profile.edit')}
                                        variant="contained"
                                        startIcon={<EditIcon />}
                                        size="large"
                                        sx={{
                                            borderRadius: 3,
                                            px: 4,
                                            py: 1.5,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                            boxShadow: '0 4px 14px rgba(25, 118, 210, 0.25)',
                                            '&:hover': {
                                                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.35)',
                                                transform: 'translateY(-2px)',
                                            },
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                    >
                                        Editar Perfil
                                    </Button>
                                ) : (
                                    <Button
                                        variant={isFollowing ? 'outlined' : 'contained'}
                                        startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                                        onClick={onFollowToggle}
                                        disabled={followLoading}
                                        size="large"
                                        sx={{
                                            borderRadius: 3,
                                            px: 4,
                                            py: 1.5,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                            minWidth: 160,
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                    >
                                        {followLoading ? 'Procesando...' : (isFollowing ? 'Siguiendo' : 'Seguir')}
                                    </Button>
                                )}
                            </Box>

                            {/* Contact Chips */}
                            <MotionStack
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                direction="row"
                                spacing={1.5}
                                flexWrap="wrap"
                                justifyContent="center"
                                sx={{ gap: 1.5, mt: 2 }}
                            >
                                {user.email && (
                                    <Chip
                                        icon={<EmailIcon sx={{ fontSize: 18 }} />}
                                        label={user.email}
                                        variant="outlined"
                                        size="medium"
                                        sx={{
                                            borderColor: 'divider',
                                            fontSize: '0.875rem',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                bgcolor: 'primary.50',
                                                transform: 'scale(1.05)',
                                            },
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                    />
                                )}

                                {user.location && (
                                    <Chip
                                        icon={<LocationOnIcon sx={{ fontSize: 18 }} />}
                                        label={user.location}
                                        variant="outlined"
                                        size="medium"
                                        sx={{
                                            borderColor: 'divider',
                                            fontSize: '0.875rem',
                                            '&:hover': {
                                                borderColor: 'success.main',
                                                bgcolor: 'success.50',
                                                transform: 'scale(1.05)',
                                            },
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                    />
                                )}

                                {user.created_at && (
                                    <Chip
                                        icon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
                                        label={`Desde ${new Date(user.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`}
                                        variant="outlined"
                                        size="medium"
                                        sx={{
                                            borderColor: 'divider',
                                            fontSize: '0.875rem',
                                            '&:hover': {
                                                borderColor: 'info.main',
                                                bgcolor: 'info.50',
                                                transform: 'scale(1.05)',
                                            },
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                    />
                                )}
                            </MotionStack>
                        </MotionStack>
                    </Stack>


                </Box>
            </MotionPaper>
            {/* Mobile Actions Bar */}
            <Box
                sx={{
                    position: 'fixed',
                    left: 0,
                    right: 0,
                    bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
                    px: 2,
                    display: { xs: 'flex', md: 'none' },
                    justifyContent: 'center',
                    zIndex: (theme) => theme.zIndex.snackbar,
                    pointerEvents: 'none'
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        pointerEvents: 'auto',
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                        borderRadius: 9999,
                        px: 1.5,
                        py: 1,
                        ...(isDark ? designSystem.glassmorphism.dark : designSystem.glassmorphism.medium),
                        backdropFilter: 'saturate(170%) blur(24px)',
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(17,24,39,0.55) 0%, rgba(2,6,23,0.4) 100%)'
                            : 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
                        border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.25)',
                        boxShadow: designSystem.shadows.glass
                    }}
                >
                    {isOwnProfile ? (
                        <Button
                            size="small"
                            component={Link}
                            href="/user/profile/edit"
                            startIcon={<EditIcon />}
                            sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                            Editar perfil
                        </Button>
                    ) : (
                        <>
                            <Button
                                size="small"
                                variant="contained"
                                onClick={onFollowToggle}
                                disabled={followLoading}
                                startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 700
                                }}
                            >
                                {isFollowing ? 'Dejar de seguir' : 'Seguir'}
                            </Button>
                            <Button
                                size="small"
                                component="a"
                                href={user.email ? `mailto:${user.email}` : '/contact'}
                                sx={{ textTransform: 'none', fontWeight: 700 }}
                            >
                                Contactar
                            </Button>
                        </>
                    )}
                </Paper>
            </Box>
        </Box>
    );
}


