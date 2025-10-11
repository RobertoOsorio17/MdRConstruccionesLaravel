/**
 * DarkModeToggle - Componente para alternar entre modo claro y oscuro
 * 
 * Props:
 * - size: 'small' | 'medium' | 'large' - Tamaño del botón
 * - showLabel: boolean - Mostrar texto junto al icono
 * 
 * Uso:
 * <DarkModeToggle />
 */

import React from 'react';
import { IconButton, Tooltip, Box, Typography, useTheme } from '@mui/material';
import {
  Brightness7 as LightIcon,
  Brightness4 as DarkIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAppTheme } from '@/theme/ThemeProvider';

const DarkModeToggle = ({ size = 'medium', showLabel = false }) => {
  const { mode, toggleTheme, designSystem } = useAppTheme();
  const muiTheme = useTheme();
  const isDark = mode === 'dark';

  const sizes = {
    small: {
      iconSize: 20,
      buttonSize: 36,
      fontSize: '0.75rem'
    },
    medium: {
      iconSize: 24,
      buttonSize: 44,
      fontSize: '0.875rem'
    },
    large: {
      iconSize: 28,
      buttonSize: 52,
      fontSize: '1rem'
    }
  };

  const currentSize = sizes[size];

  const handleToggle = () => {
    toggleTheme();
  };

  const buttonContent = (
    <IconButton
      onClick={handleToggle}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      sx={{
        width: currentSize.buttonSize,
        height: currentSize.buttonSize,
        color: isDark ? muiTheme.palette.warning.main : muiTheme.palette.primary.main,
        backgroundColor: isDark 
          ? 'rgba(245, 158, 11, 0.1)' 
          : 'rgba(37, 99, 235, 0.1)',
        transition: designSystem.transitions.presets.allNormal,
        '&:hover': {
          backgroundColor: isDark 
            ? 'rgba(245, 158, 11, 0.2)' 
            : 'rgba(37, 99, 235, 0.2)',
          transform: 'scale(1.1) rotate(20deg)',
        },
        '&:active': {
          transform: 'scale(0.95) rotate(-10deg)',
        }
      }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15
        }}
        key={isDark ? 'dark' : 'light'}
      >
        {isDark ? (
          <LightIcon sx={{ fontSize: currentSize.iconSize }} />
        ) : (
          <DarkIcon sx={{ fontSize: currentSize.iconSize }} />
        )}
      </motion.div>
    </IconButton>
  );

  if (showLabel) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: designSystem.borders.radius.full,
          backgroundColor: isDark 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.05)',
          transition: designSystem.transitions.presets.allNormal,
          '&:hover': {
            backgroundColor: isDark 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        {buttonContent}
        <Typography
          variant="body2"
          sx={{
            fontSize: currentSize.fontSize,
            fontWeight: 500,
            color: muiTheme.palette.text.primary
          }}
        >
          {isDark ? 'Modo Oscuro' : 'Modo Claro'}
        </Typography>
      </Box>
    );
  }

  return (
    <Tooltip
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      arrow
      enterDelay={300}
    >
      {buttonContent}
    </Tooltip>
  );
};

export default DarkModeToggle;
