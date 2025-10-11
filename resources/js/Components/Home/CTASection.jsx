import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowForward as ArrowIcon } from '@mui/icons-material';

const CTASection = ({
  title,
  subtitle,
  primaryButton,
  secondaryButton,
  background = 'primary.gradient',
  variant = 'default'
}) => {
  const isAlternate = variant === 'alternate';

  return (
    <Box
      component={motion.section}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      sx={{
        py: { xs: 6, md: 8, xl: 10 },
        background: isAlternate ? 
          'linear-gradient(135deg, #0A1929 0%, #1E3A5F 100%)' : 
          background,
        position: 'relative',
        overflow: 'hidden',
        '&::before': isAlternate ? {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255, 193, 7, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(11, 107, 203, 0.15) 0%, transparent 50%)`,
        } : {},
      }}
    >
      <Container 
        maxWidth={false}
        sx={{ 
          maxWidth: { xs: '100%', sm: 600, md: 960, lg: 1280, xl: 1600, xxl: 1800 },
          px: { xs: 2, sm: 3, md: 4, xl: 6 }
        }}
      >
        <Box 
          sx={{
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Typography
              variant="h2"
              sx={{
                color: 'white',
                fontWeight: 900,
                textAlign: 'center',
                mb: 3,
                fontSize: { xs: '2.2rem', md: '3rem', xl: '3.8rem' },
                lineHeight: { xs: 1.1, md: 1.2 },
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {title}
            </Typography>
          </motion.div>

          {subtitle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 400,
                  textAlign: 'center',
                  mb: 5,
                  maxWidth: '800px',
                  mx: 'auto',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                {subtitle}
              </Typography>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
              alignItems="center"
            >
              {primaryButton && (
                <Button
                  variant="contained"
                  color="warning"
                  size="large"
                  endIcon={<ArrowIcon />}
                  href={primaryButton.href}
                  sx={{
                    minWidth: { xs: '200px', sm: '220px' },
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    textTransform: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-2px) scale(1.02)',
                      boxShadow: '0 8px 25px rgba(245, 165, 36, 0.4)',
                    }
                  }}
                >
                  {primaryButton.text}
                </Button>
              )}

              {secondaryButton && (
                <Button
                  variant="outlined"
                  size="large"
                  href={secondaryButton.href}
                  sx={{
                    minWidth: { xs: '200px', sm: '220px' },
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 3,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    textTransform: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  {secondaryButton.text}
                </Button>
              )}
            </Stack>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default CTASection;