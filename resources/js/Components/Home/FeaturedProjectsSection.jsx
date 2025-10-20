import React, { useState } from 'react';
import {
  Box, Container, Typography, Card, CardMedia, Chip, Button,
  Stack, IconButton, Dialog, DialogContent, useTheme, useMediaQuery, Grid
} from '@mui/material';

import {
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@inertiajs/react';

const ProjectCard = ({ project, index, onImageClick, prefersReducedMotion }) => {
  const theme = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  
  // Generar galería de imágenes simulada (en producción vendrían del proyecto)
  const projectGallery = project.gallery || [
    project.image,
    project.image?.replace('.jpg', '_2.jpg') || project.image,
    project.image?.replace('.jpg', '_3.jpg') || project.image,
    project.image?.replace('.jpg', '_4.jpg') || project.image,
  ].filter(Boolean);
  
  const handleThumbnailHover = (imageIndex) => {
    if (!prefersReducedMotion) {
      setCurrentImageIndex(imageIndex);
    }
  };
  
  const handleCardMouseEnter = () => {
    if (!prefersReducedMotion && projectGallery.length > 1) {
      setShowGallery(true);
    }
  };
  
  const handleCardMouseLeave = () => {
    setShowGallery(false);
    setCurrentImageIndex(0);
  };
  
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ 
        duration: 0.7, 
        delay: index * 0.15,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={prefersReducedMotion ? {} : { y: -12 }}
    >
      <Card
        onMouseEnter={handleCardMouseEnter}
        onMouseLeave={handleCardMouseLeave}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            '& .project-image': {
              transform: 'scale(1.08)',
            },
            '& .project-overlay': {
              opacity: 1,
            },
            '& .project-details': {
              transform: 'translateY(0)',
              opacity: 1,
            },
            '& .zoom-icon': {
              transform: 'scale(1) rotate(0deg)',
              opacity: 1,
            },
            '& .gallery-thumbnails': {
              opacity: 1,
              transform: 'translateY(0)',
            }
          }
        }}
      >
        {/* Imagen del proyecto con AspectRatio uniforme */}
        <Box sx={{ position: 'relative', height: 350 }}>
          <CardMedia
            component="img"
            image={projectGallery[currentImageIndex]}
            alt={`${project.title} - Imagen ${currentImageIndex + 1}`}
            loading="lazy"
            className="project-image"
            onClick={() => onImageClick(project)}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />

          {/* Chip de categoría */}
          <Chip
            label={project.category}
            color="warning"
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              bgcolor: 'rgba(245, 165, 36, 0.95)',
              color: 'white',
              backdropFilter: 'blur(10px)',
            }}
          />

          {/* Icono de zoom */}
          <IconButton
            className="zoom-icon"
            onClick={() => onImageClick(project)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              color: 'primary.main',
              width: 48,
              height: 48,
              opacity: 0,
              transform: 'scale(0.8) rotate(90deg)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white',
                transform: 'scale(1.1) rotate(0deg)',
              }
            }}
          >
            <ZoomInIcon />
          </IconButton>

          {/* Quick View Gallery Thumbnails */}
          {!prefersReducedMotion && projectGallery.length > 1 && (
            <Box
              className="gallery-thumbnails"
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%) translateY(20px)',
                display: 'flex',
                gap: 1,
                opacity: 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 2,
              }}
            >
              {projectGallery.map((image, imageIndex) => (
                <Box
                  key={imageIndex}
                  onMouseEnter={() => handleThumbnailHover(imageIndex)}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: currentImageIndex === imageIndex ? 'warning.main' : 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      bgcolor: 'warning.main',
                      transform: 'scale(1.2)',
                    }
                  }}
                />
              ))}
            </Box>
          )}

          {/* Indicador de galería */}
          {!prefersReducedMotion && projectGallery.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                fontSize: '0.75rem',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                opacity: showGallery ? 1 : 0,
                transition: 'opacity 0.3s ease',
                zIndex: 2,
              }}
            >
              {currentImageIndex + 1} / {projectGallery.length}
            </Box>
          )}

          {/* Overlay con detalles */}
          <Box
            className="project-overlay"
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
              opacity: 0,
              transition: 'opacity 0.4s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              p: 3,
            }}
          >
            <Stack
              className="project-details"
              spacing={2}
              sx={{
                color: 'white',
                transform: 'translateY(20px)',
                opacity: 0,
                transition: 'all 0.4s ease 0.1s',
              }}
            >
              {/* Título del proyecto */}
              <Typography 
                variant="h5" 
                fontWeight={700}
                sx={{ 
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                  lineHeight: 1.2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {project.title}
              </Typography>

              {/* Metadatos del proyecto */}
              <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
                {project.location && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <LocationIcon sx={{ fontSize: '1rem', opacity: 0.9 }} />
                    <Typography variant="caption" sx={{ fontSize: '0.85rem' }}>
                      {project.location}
                    </Typography>
                  </Stack>
                )}

                {project.completion_date && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <CalendarIcon sx={{ fontSize: '1rem', opacity: 0.9 }} />
                    <Typography variant="caption" sx={{ fontSize: '0.85rem' }}>
                      {new Date(project.completion_date).getFullYear()}
                    </Typography>
                  </Stack>
                )}

                {project.client && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <PersonIcon sx={{ fontSize: '1rem', opacity: 0.9 }} />
                    <Typography variant="caption" sx={{ fontSize: '0.85rem' }}>
                      {project.client}
                    </Typography>
                  </Stack>
                )}
              </Stack>

              {/* Tags/Categories */}
              {project.tags && project.tags.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {project.tags.slice(0, 3).map((tag, idx) => (
                    <Chip
                      key={idx}
                      label={tag}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        fontSize: '0.7rem',
                        height: 24,
                        '& .MuiChip-label': {
                          px: 1.5
                        }
                      }}
                    />
                  ))}
                </Stack>
              )}

              {/* Descripción breve */}
              {project.summary && (
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.9,
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {project.summary}
                </Typography>
              )}

              {/* Botón ver proyecto */}
              <Button
                component={Link}
                href={`/proyectos/${project.slug}`}
                variant="outlined"
                size="small"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  width: 'fit-content',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Ver Proyecto
              </Button>
            </Stack>
          </Box>
        </Box>
      </Card>
    </motion.div>
  );
};

const ImageModal = ({ open, project, onClose }) => {
  if (!project) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'transparent',
          boxShadow: 'none',
          overflow: 'hidden'
        }
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            zIndex: 1,
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.9)',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
        
        <Box sx={{ position: 'relative' }}>
          <img
            src={project.image}
            alt={project.title}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: 8
            }}
          />
          
          {/* Info overlay en modal */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
              color: 'white',
              p: 3,
              borderRadius: '0 0 8px 8px'
            }}
          >
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
              {project.title}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Chip label={project.category} color="warning" size="small" />
              {project.location && (
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  📍 {project.location}
                </Typography>
              )}
            </Stack>
            {project.summary && (
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {project.summary}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const FeaturedProjectsSection = ({ projects, prefersReducedMotion = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filtrar proyectos destacados
  const featuredProjects = projects?.filter(project => project.featured)?.slice(0, 6) || [];

  const handleImageClick = (project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProject(null);
  };

  if (featuredProjects.length === 0) return null;

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12, xl: 16 },
        bgcolor: (theme) => theme.palette.mode === 'dark'
          ? 'rgba(10, 15, 30, 0.95)'
          : 'white',
      }}
    >
      <Container
        maxWidth={false}
        sx={{ 
          maxWidth: { xs: '100%', sm: 600, md: 960, lg: 1280, xl: 1600, xxl: 1800 },
          px: { xs: 2, sm: 3, md: 4, xl: 6 }
        }}
      >
        {/* Título de sección */}
        <Box textAlign="center" sx={{ mb: { xs: 6, md: 8 } }}>
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontSize: { xs: '2.2rem', md: '3rem', xl: '3.8rem' },
                fontWeight: 700,
                color: 'primary.main',
                mb: 2,
                lineHeight: 1.2,
              }}
            >
              Proyectos que Hablan por Sí Mismos
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                color: 'text.secondary',
                fontWeight: 400,
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              La evidencia visual: cada proyecto es una historia de transformación, calidad y compromiso
            </Typography>
          </motion.div>
        </Box>

        {/* Grid de proyectos */}
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {featuredProjects.map((project, index) => (
            <Grid 
              size={{ xs: 12, sm: 6, lg: 4 }}
              key={project.id || index}
            >
              <ProjectCard 
                project={project} 
                index={index}
                onImageClick={handleImageClick}
                prefersReducedMotion={prefersReducedMotion}
              />
            </Grid>
          ))}
        </Grid>

        {/* Botón para explorar todos los proyectos */}
        <Box textAlign="center" sx={{ mt: { xs: 6, md: 8 } }}>
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              component={Link}
              href="/proyectos"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 2,
                px: 4,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: '1.1rem',
                textTransform: 'none',
                bgcolor: 'warning.main',
                color: 'white',
                boxShadow: '0 8px 20px rgba(245, 165, 36, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: 'warning.dark',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 30px rgba(245, 165, 36, 0.4)',
                },
                '&:active': {
                  transform: 'scale(0.98) translateY(0)',
                  transition: 'transform 0.1s ease',
                }
              }}
            >
              Explorar Todos los Proyectos
            </Button>
          </motion.div>
        </Box>
      </Container>

      {/* Modal para vista ampliada */}
      <ImageModal 
        open={modalOpen}
        project={selectedProject}
        onClose={handleCloseModal}
      />
    </Box>
  );
};

export default FeaturedProjectsSection;
