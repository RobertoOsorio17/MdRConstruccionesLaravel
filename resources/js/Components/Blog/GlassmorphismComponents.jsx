import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import {
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Premium glassmorphism design system
const GLASS_THEME = {
  // Glassmorphism backgrounds
  glass: {
    primary: 'rgba(255, 255, 255, 0.25)',
    secondary: 'rgba(255, 255, 255, 0.15)',
    tertiary: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.2)',
    colored: 'rgba(59, 130, 246, 0.15)',
  },
  
  // Backdrop blur values
  blur: {
    sm: 'blur(8px)',
    md: 'blur(12px)',
    lg: 'blur(12px)',
    xl: 'blur(12px)',
  },
  
  // Border styles for glass effect
  border: {
    glass: '1px solid rgba(255, 255, 255, 0.2)',
    glassStrong: '1px solid rgba(255, 255, 255, 0.3)',
    colored: '1px solid rgba(59, 130, 246, 0.3)',
  },
  
  // Shadow effects
  shadows: {
    glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
    glassHover: '0 12px 40px rgba(0, 0, 0, 0.15)',
    colored: '0 8px 32px rgba(59, 130, 246, 0.2)',
  }
};

// Glassmorphism Card Component
export const GlassCard = ({ 
  children, 
  variant = 'primary', 
  blur = 'md',
  hover = true,
  ...props 
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <Paper
        elevation={0}
        sx={{
          background: GLASS_THEME.glass[variant],
          backdropFilter: GLASS_THEME.blur[blur],
          border: GLASS_THEME.border.glass,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            pointerEvents: 'none',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover': hover ? {
            boxShadow: GLASS_THEME.shadows.glassHover,
            transform: 'translateY(-2px)',
            '&::before': {
              opacity: 1,
            }
          } : {},
          ...props.sx
        }}
        {...props}
      >
        {children}
      </Paper>
    </motion.div>
  );
};

// Glassmorphism Popular Post Card
export const GlassPopularPostCard = ({ post, index = 0 }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1] 
      }}
    >
      <GlassCard variant="secondary" blur="md">
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={2}>
            {/* Post Image */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
              }}
            >
              {post.cover_image ? (
                <img
                  src={post.cover_image}
                  alt={post.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(59, 130, 246, 0.6)',
                    fontSize: '2rem'
                  }}
                >
                  📄
                </Box>
              )}
            </Box>

            {/* Post Content */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.3,
                  color: 'rgba(15, 23, 42, 0.9)'
                }}
              >
                {post.title}
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <ViewIcon sx={{ fontSize: 14, color: 'rgba(100, 116, 139, 0.7)' }} />
                <Typography variant="caption" sx={{ color: 'rgba(100, 116, 139, 0.7)' }}>
                  {post.views || '1.2k'} vistas
                </Typography>
                <ScheduleIcon sx={{ fontSize: 14, color: 'rgba(100, 116, 139, 0.7)' }} />
                <Typography variant="caption" sx={{ color: 'rgba(100, 116, 139, 0.7)' }}>
                  {post.reading_time || '5'} min
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar
                    src={post.author?.avatar}
                    sx={{ width: 20, height: 20 }}
                  >
                    {(post.author?.name || 'A')[0]}
                  </Avatar>
                  <Typography
                    component={post.author?.id ? Link : 'span'}
                    href={post.author?.id ? `/user/${post.author.id}` : undefined}
                    variant="caption"
                    sx={{
                      color: 'rgba(100, 116, 139, 0.8)',
                      textDecoration: 'none',
                      cursor: post.author?.id ? 'pointer' : 'default',
                      '&:hover': post.author?.id ? {
                        color: 'rgba(59, 130, 246, 0.8)',
                        textDecoration: 'underline'
                      } : {}
                    }}
                  >
                    {post.author?.name || 'Admin'}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Compartir">
                    <IconButton
                      size="small"
                      sx={{
                        color: 'rgba(100, 116, 139, 0.7)',
                        '&:hover': {
                          color: 'rgba(59, 130, 246, 0.8)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)'
                        }
                      }}
                    >
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={isBookmarked ? "Quitar de guardados" : "Guardar"}>
                    <IconButton
                      size="small"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      sx={{
                        color: isBookmarked ? 'rgba(59, 130, 246, 0.8)' : 'rgba(100, 116, 139, 0.7)',
                        '&:hover': {
                          color: 'rgba(59, 130, 246, 0.8)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)'
                        }
                      }}
                    >
                      {isBookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </GlassCard>
    </motion.div>
  );
};

// Glassmorphism Stats Card
export const GlassStatsCard = ({ icon, title, value, trend, color = 'primary' }) => {
  return (
    <GlassCard variant="colored" blur="lg">
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              background: `rgba(59, 130, 246, 0.15)`,
              color: 'rgba(59, 130, 246, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'rgba(15, 23, 42, 0.9)', mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(100, 116, 139, 0.8)' }}>
              {title}
            </Typography>
            {trend && (
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                <TrendingIcon sx={{ fontSize: 14, color: 'rgba(16, 185, 129, 0.8)' }} />
                <Typography variant="caption" sx={{ color: 'rgba(16, 185, 129, 0.8)' }}>
                  +{trend}% este mes
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </CardContent>
    </GlassCard>
  );
};

export default {
  GlassCard,
  GlassPopularPostCard,
  GlassStatsCard
};
