import React from 'react';
import { Tabs, Tab, Box, Badge, Typography, useTheme, useMediaQuery } from '@mui/material';
import {
    ArticleOutlined,
    FavoriteOutlined,
    BookmarkOutlined,
    CommentOutlined,

} from '@mui/icons-material';
import { motion } from 'framer-motion';
import designSystem from '@/theme/designSystem';

const EnhancedTabNavigation = ({
    activeTab,
    onTabChange,
    stats = {},
    isOwnProfile = false
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const DS = designSystem;

    const tabs = [
        {
            id: 'posts',
            label: 'Posts',
            icon: ArticleOutlined,
            count: stats.postsCount || 0,
            color: DS.colors.primary[600]
        },
        {
            id: 'liked',
            label: 'Me Gusta',
            icon: FavoriteOutlined,
            count: stats.likedPostsCount || 0,
            color: DS.colors.error[500]
        },
        {
            id: 'saved',
            label: 'Guardados',
            icon: BookmarkOutlined,
            count: stats.savedPostsCount || 0,
            color: DS.colors.accent.amber[500]
        },
        {
            id: 'comments',
            label: 'Comentarios',
            icon: CommentOutlined,
            count: stats.commentsCount || 0,
            color: DS.colors.success[600]
        }
    ];

    const handleTabChange = (event, newValue) => {
        onTabChange(newValue);
    };

    const activeIndex = Math.max(0, tabs.findIndex(t => t.id === activeTab));

    const isDark = theme.palette.mode === 'dark';

    return (
        <Box
            sx={{
                width: '100%',
                mb: 4,
                position: 'sticky',
                top: { xs: 0, md: 8 },
                zIndex: DS.zIndex.sticky,
            }}
        >
            {/* Segmented Control Container */}
            <Box
                sx={{
                    position: 'relative',
                    backgroundColor: isDark ? 'rgba(17, 24, 39, 0.7)' : DS.colors.surface.overlay,
                    backdropFilter: 'saturate(140%) blur(10px)',
                    borderRadius: { xs: 0, md: 4 },
                    p: { xs: 0.75, md: 1 },
                    boxShadow: isDark
                        ? '0 8px 24px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.06)'

                        : '0 8px 24px rgba(2, 6, 23, 0.08), inset 0 2px 4px rgba(0,0,0,0.08)',
                    border: isDark ? '1px solid rgba(255,255,255,0.14)' : `1px solid ${DS.colors.border.main}`,
                }}
            >
                {/* Animated highlight pill (desktop) */}
                {!isMobile && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 6,
                            left: `${(activeIndex * 100) / tabs.length}%`,
                            width: `${100 / tabs.length}%`,
                            height: 'calc(100% - 12px)',
                            borderRadius: 3,
                            background: DS.gradients.primaryLight,
                            boxShadow: `0 6px 18px ${DS.colors.primary[600]}33`,
                            transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                            zIndex: 0,
                        }}
                    />)
                }
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant={isMobile ? "fullWidth" : "fullWidth"}
                    scrollButtons={false}
                    sx={{
                        minHeight: isMobile ? 56 : 64,
                        '& .MuiTabs-flexContainer': {
                            gap: isMobile ? 0 : 1
                        },
                        '& .MuiTabs-indicator': {
                            display: 'none',
                        },
                        '& .MuiTab-root': {
                            minHeight: isMobile ? 56 : 64,
                            padding: isMobile ? '10px 0' : '12px 24px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: isMobile ? '0.813rem' : '0.938rem',
                            color: isDark ? 'rgba(255,255,255,0.85)' : theme.palette.text.secondary,
                            borderRadius: 3,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            zIndex: 1,
                            '&:hover': {
                                backgroundColor: `${DS.colors.primary[600]}14`,
                                color: DS.colors.primary[600],
                                transform: 'translateY(-1px)',
                            },
                            '&.Mui-selected': {
                                color: 'white',
                                background: DS.gradients.primary,
                                fontWeight: 700,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 12px ${DS.colors.primary[600]}66, 0 2px 4px ${DS.colors.primary[600]}33`,
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${DS.colors.primary[700]} 0%, ${DS.colors.primary[600]} 100%)`,
                                    transform: 'translateY(-2px)',
                                }
                            }
                        }
                    }}
                >
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;

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
                                        {/* Icon with Badge */}
                                        <Badge
                                            badgeContent={tab.count}
                                            max={999}
                                            sx={{
                                                '& .MuiBadge-badge': {
                                                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.9)' : tab.color,
                                                    color: isActive ? DS.colors.primary[600] : 'white',
                                                    fontWeight: 700,
                                                    fontSize: '0.688rem',
                                                    minWidth: 18,
                                                    height: 18,
                                                    borderRadius: '9px',
                                                    border: isActive ? '2px solid rgba(255, 255, 255, 0.3)' : 'none',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                                                }
                                            }}
                                        >
                                            <motion.div
                                                animate={{
                                                    scale: isActive ? 1 : 0.95,
                                                }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Icon
                                                    sx={{
                                                        fontSize: isMobile ? 20 : 22,
                                                        color: 'inherit',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                />
                                            </motion.div>
                                        </Badge>

                                        {/* Label */}
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
                                                        color: isActive ? 'rgba(255, 255, 255, 0.8)' : theme.palette.text.secondary,
                                                        fontWeight: 500,
                                                        fontSize: '0.75rem',
                                                        transition: 'color 0.3s ease'
                                                    }}
                                                >
                                                    {tab.count}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                }
                            />
                        );
                    })}
                </Tabs>
            </Box>
        </Box>
    );
};

export default EnhancedTabNavigation;
