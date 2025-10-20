/**
 * Toast Component - Componente visual de notificaciones
 * 
 * Componente que renderiza las notificaciones toast con animaciones
 * y estilos basados en el design system.
 */

import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, shadows, spacing, borders, zIndex } from '@/theme/designSystem';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { TOAST_TYPES, TOAST_POSITIONS } from '@/contexts/ToastContext';

// Toast configuration by type
const TOAST_CONFIG = {
  [TOAST_TYPES.SUCCESS]: {
    icon: SuccessIcon,
    color: colors.success[500],
    background: colors.success[50],
    borderColor: colors.success[200]
  },
  [TOAST_TYPES.ERROR]: {
    icon: ErrorIcon,
    color: colors.error[500],
    background: colors.error[50],
    borderColor: colors.error[200]
  },
  [TOAST_TYPES.WARNING]: {
    icon: WarningIcon,
    color: colors.warning[500],
    background: colors.warning[50],
    borderColor: colors.warning[200]
  },
  [TOAST_TYPES.INFO]: {
    icon: InfoIcon,
    color: colors.info[500],
    background: colors.info[50],
    borderColor: colors.info[200]
  }
};

// Position styles
const getPositionStyles = (position) => {
  const baseStyles = {
    position: 'fixed',
    zIndex: zIndex.notification,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
    pointerEvents: 'none'
  };

  switch (position) {
    case TOAST_POSITIONS.TOP_LEFT:
      return { ...baseStyles, top: spacing[4], left: spacing[4] };
    case TOAST_POSITIONS.TOP_CENTER:
      return { ...baseStyles, top: spacing[4], left: '50%', transform: 'translateX(-50%)' };
    case TOAST_POSITIONS.TOP_RIGHT:
      return { ...baseStyles, top: spacing[4], right: spacing[4] };
    case TOAST_POSITIONS.BOTTOM_LEFT:
      return { ...baseStyles, bottom: spacing[4], left: spacing[4] };
    case TOAST_POSITIONS.BOTTOM_CENTER:
      return { ...baseStyles, bottom: spacing[4], left: '50%', transform: 'translateX(-50%)' };
    case TOAST_POSITIONS.BOTTOM_RIGHT:
      return { ...baseStyles, bottom: spacing[4], right: spacing[4] };
    default:
      return { ...baseStyles, top: spacing[4], right: spacing[4] };
  }
};

/**
 * Single Toast Item
 */
const ToastItem = ({ toast, onDismiss }) => {
  const { prefersReducedMotion, getTransition } = useReducedMotion();
  const config = TOAST_CONFIG[toast.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={getTransition({ duration: 0.3 })}
      style={{ pointerEvents: 'auto' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: spacing[2],
          minWidth: '320px',
          maxWidth: '480px',
          padding: spacing[3],
          background: config.background,
          border: `1px solid ${config.borderColor}`,
          borderRadius: borders.radius.lg,
          boxShadow: shadows.lg,
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Icon */}
        <Icon
          sx={{
            color: config.color,
            fontSize: '24px',
            flexShrink: 0,
            mt: 0.25
          }}
        />

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {toast.title && (
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: colors.text.primary,
                mb: toast.message ? 0.5 : 0
              }}
            >
              {toast.title}
            </Typography>
          )}
          
          {toast.message && (
            <Typography
              variant="body2"
              sx={{
                color: colors.text.secondary,
                wordBreak: 'break-word'
              }}
            >
              {toast.message}
            </Typography>
          )}

          {/* Action button */}
          {toast.action && (
            <Box sx={{ mt: 1 }}>
              <Typography
                component="button"
                variant="body2"
                onClick={toast.action.onClick}
                sx={{
                  color: config.color,
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
              >
                {toast.action.label}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Close button */}
        <IconButton
          size="small"
          onClick={() => onDismiss(toast.id)}
          sx={{
            color: colors.text.secondary,
            padding: spacing[0.5],
            '&:hover': {
              background: 'rgba(0, 0, 0, 0.05)'
            }
          }}
        >
          <CloseIcon sx={{ fontSize: '18px' }} />
        </IconButton>
      </Box>
    </motion.div>
  );
};

/**
 * Toast Container - Renders all toasts
 */
const ToastContainer = ({ toasts, onDismiss }) => {
  // Group toasts by position
  const toastsByPosition = toasts.reduce((acc, toast) => {
    const position = toast.position || TOAST_POSITIONS.TOP_RIGHT;
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(toast);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <Box key={position} sx={getPositionStyles(position)}>
          <AnimatePresence mode="popLayout">
            {positionToasts.map(toast => (
              <ToastItem
                key={toast.id}
                toast={toast}
                onDismiss={onDismiss}
              />
            ))}
          </AnimatePresence>
        </Box>
      ))}
    </>
  );
};

export default ToastContainer;

