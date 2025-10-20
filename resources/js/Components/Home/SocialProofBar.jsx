import React from 'react';
import { Box, Container, Typography, Stack, Chip, useTheme } from '@mui/material';
import { Star as StarIcon, Verified as VerifiedIcon, EmojiEvents as TrophyIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const SocialProofBar = ({ socialProof, prefersReducedMotion = false }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        py: 3,
        background: isDark
          ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(245, 165, 36, 0.1) 100%)'
          : 'linear-gradient(90deg, rgba(11, 107, 203, 0.05) 0%, rgba(245, 165, 36, 0.05) 100%)',
        borderBottom: isDark
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.05)',
      }}
    >
      <Container
        maxWidth={false}
        sx={{ 
          maxWidth: { xs: '100%', sm: 600, md: 960, lg: 1280, xl: 1600, xxl: 1800 },
          px: { xs: 2, sm: 3, md: 4, xl: 6 }
        }}
      >
        <Stack 
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 2, md: 6 }}
          divider={<Box sx={{ width: 1, height: 20, bgcolor: 'grey.300', mx: 2, display: { xs: 'none', md: 'block' } }} />}
          justifyContent="center"
          alignItems="center"
        >
          {/* Años de experiencia - DESTACADO como principal */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 40,
                height: 3,
                bgcolor: 'warning.main',
                borderRadius: 2,
                opacity: 0.8
              }
            }}>
              <TrophyIcon sx={{ color: 'warning.main', fontSize: '2rem' }} />
              <Box>
                <Typography variant="h5" fontWeight={800} color="warning.main" sx={{ fontSize: '1.5rem' }}>
                  {socialProof.yearsOfExperience}+ Años
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  de Experiencia
                </Typography>
              </Box>
            </Box>
          </motion.div>

          {/* Proyectos completados */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedIcon sx={{ color: 'success.main', fontSize: '1.5rem' }} />
              <Box>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  +{socialProof.projectsCompleted}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Proyectos Completados
                </Typography>
              </Box>
            </Box>
          </motion.div>

          {/* Rating */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon sx={{ color: 'warning.main', fontSize: '1.5rem' }} />
              <Box>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {socialProof.averageRating}/5
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Puntuación Media
                </Typography>
              </Box>
            </Box>
          </motion.div>

          {/* Satisfacción */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {socialProof.clientSatisfaction}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Clientes Satisfechos
                </Typography>
              </Box>
            </Box>
          </motion.div>

          {/* Certificaciones */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              {socialProof.certifications.slice(0, 2).map((cert, index) => (
                <Chip
                  key={index}
                  label={cert}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ 
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    borderColor: 'primary.main',
                    color: 'primary.main'
                  }}
                />
              ))}
            </Stack>
          </motion.div>
        </Stack>
      </Container>
    </Box>
  );
};

export default SocialProofBar;