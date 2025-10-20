import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  IconButton,
  Stack,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { router } from '@inertiajs/react';

/**
 * StickySidebar Component
 * 
 * Sidebar sticky con tabla de contenidos y acciones rápidas
 * 
 * @param {Object} props
 * @param {Array} props.sections - Array de secciones para la tabla de contenidos
 *   Formato: [{ id: 'section-1', label: 'Sección 1', icon: <Icon /> }]
 * @param {Object} props.actions - Configuración de acciones rápidas
 *   Formato: { share: true, favorite: true, contact: true }
 * @param {boolean} props.isFavorite - Estado de favorito
 * @param {Function} props.onFavoriteToggle - Callback para toggle de favorito
 * @param {Function} props.onShare - Callback para compartir
 * @param {Function} props.onContact - Callback para contacto
 * @param {string} props.position - Posición del sidebar ('left' | 'right')
 * @param {number} props.topOffset - Offset desde el top (default: 100)
 */
const StickySidebar = ({
  sections = [],
  actions = { share: true, favorite: true, contact: true },
  isFavorite = false,
  onFavoriteToggle,
  onShare,
  onContact,
  position = 'right',
  topOffset = 100
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  // Detectar sección activa basada en scroll
  useEffect(() => {
    const handleScroll = () => {
      // Mostrar botón de scroll to top
      setShowScrollTop(window.scrollY > 300);

      // Detectar sección activa
      const scrollPosition = window.scrollY + 150;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  // Scroll suave a sección
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80; // Offset para el header sticky
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle share
  const handleShare = () => {
    if (onShare) {
      onShare();
    } else if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href
      });
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (onFavoriteToggle) {
      onFavoriteToggle();
    }
  };

  // Handle contact
  const handleContact = () => {
    if (onContact) {
      onContact();
    } else {
      router.visit('/contacto');
    }
  };

  // No mostrar en mobile si está colapsado
  if (isMobile && isCollapsed) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000
        }}
      >
        <IconButton
          onClick={() => setIsCollapsed(false)}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: 'white',
            boxShadow: 3,
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            }
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: position === 'right' ? 50 : -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: position === 'right' ? 50 : -50 }}
        transition={{ duration: 0.3 }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: topOffset,
            [position]: 0,
            maxHeight: `calc(100vh - ${topOffset + 40}px)`,
            overflowY: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': {
              width: 6
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(0, 0, 0, 0.2)',
              borderRadius: 3
            }
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: theme.palette.mode === 'dark' 
                ? 'rgba(30, 41, 59, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.08)'}`,
              minWidth: isMobile ? 280 : 260
            }}
          >
            {/* Header con botón de colapsar en mobile */}
            {isMobile && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Navegación
                </Typography>
                <IconButton size="small" onClick={() => setIsCollapsed(true)}>
                  <ArrowUpIcon />
                </IconButton>
              </Box>
            )}

            {/* Tabla de Contenidos */}
            {sections.length > 0 && (
              <>
                <Typography 
                  variant="overline" 
                  sx={{ 
                    display: 'block',
                    mb: 1,
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                >
                  En esta página
                </Typography>
                
                <List dense sx={{ mb: 2 }}>
                  {sections.map((section) => (
                    <ListItem key={section.id} disablePadding>
                      <ListItemButton
                        selected={activeSection === section.id}
                        onClick={() => scrollToSection(section.id)}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          transition: 'all 0.2s ease',
                          '&.Mui-selected': {
                            bgcolor: theme.palette.mode === 'dark'
                              ? 'rgba(59, 130, 246, 0.2)'
                              : 'rgba(59, 130, 246, 0.1)',
                            borderLeft: `3px solid ${theme.palette.primary.main}`,
                            '&:hover': {
                              bgcolor: theme.palette.mode === 'dark'
                                ? 'rgba(59, 130, 246, 0.3)'
                                : 'rgba(59, 130, 246, 0.15)'
                            }
                          },
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.05)'
                              : 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                      >
                        {section.icon && (
                          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                            {section.icon}
                          </Box>
                        )}
                        <ListItemText 
                          primary={section.label}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: activeSection === section.id ? 600 : 400,
                            fontSize: '0.875rem'
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
              </>
            )}

            {/* Acciones Rápidas */}
            <Typography 
              variant="overline" 
              sx={{ 
                display: 'block',
                mb: 1,
                color: 'text.secondary',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            >
              Acciones
            </Typography>

            <Stack spacing={1}>
              {/* Favorito */}
              {actions.favorite && (
                <Tooltip title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"} placement="left">
                  <IconButton
                    onClick={handleFavoriteToggle}
                    sx={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.04)',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.08)'
                      }
                    }}
                  >
                    {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                    <Typography variant="body2" sx={{ ml: 1.5 }}>
                      {isFavorite ? 'Guardado' : 'Guardar'}
                    </Typography>
                  </IconButton>
                </Tooltip>
              )}

              {/* Compartir */}
              {actions.share && (
                <Tooltip title="Compartir" placement="left">
                  <IconButton
                    onClick={handleShare}
                    sx={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.04)',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.08)'
                      }
                    }}
                  >
                    <ShareIcon />
                    <Typography variant="body2" sx={{ ml: 1.5 }}>
                      Compartir
                    </Typography>
                  </IconButton>
                </Tooltip>
              )}

              {/* Contacto */}
              {actions.contact && (
                <Tooltip title="Contactar" placement="left">
                  <IconButton
                    onClick={handleContact}
                    sx={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.04)',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.08)'
                      }
                    }}
                  >
                    <EmailIcon />
                    <Typography variant="body2" sx={{ ml: 1.5 }}>
                      Contactar
                    </Typography>
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

            {/* Scroll to Top Button */}
            {showScrollTop && (
              <Box sx={{ mt: 2 }}>
                <IconButton
                  onClick={scrollToTop}
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark
                    }
                  }}
                >
                  <ArrowUpIcon />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    Volver arriba
                  </Typography>
                </IconButton>
              </Box>
            )}
          </Paper>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

export default StickySidebar;

