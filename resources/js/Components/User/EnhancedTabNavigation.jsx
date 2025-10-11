import React, { useState } from 'react';
import {
    Tabs,
    Tab,
    Box,
    Badge,
    Typography,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    ArticleOutlined,
    FavoriteOutlined,
    BookmarkOutlined,
    CommentOutlined,
    BuildOutlined
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const THEME = {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#f59e0b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: 'rgba(255, 255, 255, 0.05)',
    surface: 'rgba(255, 255, 255, 0.1)',
    glass: 'rgba(255, 255, 255, 0.15)',
    text: {
        primary: '#1e293b',
        secondary: '#64748b',
        light: '#94a3b8'
    }
};

const EnhancedTabNavigation = ({ 
    activeTab, 
    onTabChange, 
    stats = {},
    isOwnProfile = false 
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const tabs = [
        {
            id: 'posts',
            label: 'Posts',
            icon: ArticleOutlined,
            count: stats.postsCount || 0,
            color: THEME.primary
        },
        {
            id: 'liked',
            label: 'Me Gusta',
            icon: FavoriteOutlined,
            count: stats.likedPostsCount || 0,
            color: THEME.error
        },
        {
            id: 'saved',
            label: 'Guardados',
            icon: BookmarkOutlined,
            count: stats.savedPostsCount || 0,
            color: THEME.accent
        },
        {
            id: 'comments',
            label: 'Comentarios',
            icon: CommentOutlined,
            count: stats.commentsCount || 0,
            color: THEME.success
        },
        {
            id: 'services',
            label: 'Servicios',
            icon: BuildOutlined,
            count: stats.favoriteServicesCount || 0,
            color: THEME.secondary
        }
    ];

    const handleTabChange = (event, newValue) => {
        onTabChange(newValue);
    };

    const TabIcon = ({ icon: Icon, color, isActive }) => (
        <motion.div
            animate={{
                scale: isActive ? 1.1 : 1,
                rotate: isActive ? [0, -5, 5, 0] : 0
            }}
            transition={{ duration: 0.3 }}
        >
            <Icon 
                sx={{ 
                    fontSize: isMobile ? 20 : 24,
                    color: isActive ? color : THEME.text.secondary,
                    transition: 'color 0.3s ease'
                }} 
            />
        </motion.div>
    );

    return (
        <Box
            sx={{
                width: '100%',
                mb: 4,
                backgroundColor: THEME.glass,
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            {/* Background Gradient */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(245, 158, 11, 0.1))',
                    zIndex: 0
                }}
            />

            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant={isMobile ? "scrollable" : "fullWidth"}
                scrollButtons={isMobile ? "auto" : false}
                allowScrollButtonsMobile
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    '& .MuiTabs-flexContainer': {
                        gap: isMobile ? 1 : 2
                    },
                    '& .MuiTabs-indicator': {
                        height: 3,
                        borderRadius: '3px 3px 0 0',
                        background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.accent})`,
                        transition: 'all 0.3s ease'
                    },
                    '& .MuiTab-root': {
                        minHeight: isMobile ? 64 : 80,
                        padding: isMobile ? '8px 12px' : '12px 24px',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: isMobile ? '0.875rem' : '1rem',
                        color: THEME.text.secondary,
                        transition: 'all 0.3s ease',
                        borderRadius: '12px 12px 0 0',
                        margin: '0 2px',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: THEME.text.primary,
                            transform: 'translateY(-2px)'
                        },
                        '&.Mui-selected': {
                            color: THEME.primary,
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            fontWeight: 700
                        }
                    }
                }}
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    
                    return (
                        <Tab
                            key={tab.id}
                            value={tab.id}
                            label={
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: isMobile ? 'column' : 'row',
                                        alignItems: 'center',
                                        gap: isMobile ? 0.5 : 1,
                                        position: 'relative'
                                    }}
                                >
                                    <Badge
                                        badgeContent={tab.count}
                                        color="primary"
                                        max={999}
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                backgroundColor: tab.color,
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                                minWidth: 20,
                                                height: 20,
                                                borderRadius: '10px',
                                                border: '2px solid rgba(255, 255, 255, 0.2)',
                                                transform: 'scale(0.9)',
                                                transition: 'all 0.3s ease',
                                                ...(isActive && {
                                                    transform: 'scale(1)',
                                                    boxShadow: `0 0 10px ${tab.color}40`
                                                })
                                            }
                                        }}
                                    >
                                        <TabIcon 
                                            icon={tab.icon} 
                                            color={tab.color} 
                                            isActive={isActive}
                                        />
                                    </Badge>
                                    
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography
                                            variant={isMobile ? "caption" : "body2"}
                                            sx={{
                                                fontWeight: 'inherit',
                                                lineHeight: 1.2,
                                                color: 'inherit'
                                            }}
                                        >
                                            {tab.label}
                                        </Typography>
                                        {!isMobile && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: isActive ? tab.color : THEME.text.light,
                                                    fontWeight: 500,
                                                    transition: 'color 0.3s ease'
                                                }}
                                            >
                                                {tab.count} {tab.count === 1 ? 'elemento' : 'elementos'}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Active Tab Glow Effect */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                style={{
                                                    position: 'absolute',
                                                    top: -2,
                                                    left: -2,
                                                    right: -2,
                                                    bottom: -2,
                                                    background: `linear-gradient(135deg, ${tab.color}20, transparent)`,
                                                    borderRadius: '14px 14px 0 0',
                                                    zIndex: -1,
                                                    pointerEvents: 'none'
                                                }}
                                            />
                                        )}
                                    </AnimatePresence>
                                </Box>
                            }
                        />
                    );
                })}
            </Tabs>

            {/* Bottom Border Gradient */}
            <Box
                sx={{
                    height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    position: 'relative',
                    zIndex: 1
                }}
            />
        </Box>
    );
};

export default EnhancedTabNavigation;
