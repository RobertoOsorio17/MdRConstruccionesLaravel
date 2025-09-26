import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Chip,
  Paper,
  InputBase,
  InputAdornment,
  Tooltip,
  Fade,
  Zoom,
  Grow,
  Typography
} from '@mui/material';
import { 
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Premium design system
const THEME = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    muted: '#94a3b8',
  },
  border: {
    light: '#f1f5f9',
    main: '#e2e8f0',
  },
  surface: {
    primary: '#ffffff',
  }
};

// Enhanced Search Bar with Micro-animations
export const AnimatedSearchBar = ({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "Buscar artículos...",
  showClearButton = true 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef(null);

  const handleClear = () => {
    onChange({ target: { value: '' } });
    inputRef.current?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <Paper
        component="form"
        onSubmit={onSubmit}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 3,
          border: `2px solid ${isFocused ? THEME.primary[400] : 'transparent'}`,
          backgroundColor: THEME.surface.primary,
          boxShadow: isFocused 
            ? `0 0 0 4px rgba(59, 130, 246, 0.1), 0 8px 25px rgba(0, 0, 0, 0.1)`
            : isHovered 
              ? '0 4px 20px rgba(0, 0, 0, 0.08)'
              : '0 2px 10px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFocused ? 'translateY(-2px) scale(1.02)' : isHovered ? 'translateY(-1px)' : 'none',
        }}
      >
        <motion.div
          animate={{ 
            scale: isFocused ? 1.1 : 1,
            color: isFocused ? THEME.primary[600] : THEME.text.muted
          }}
          transition={{ duration: 0.2 }}
        >
          <SearchIcon sx={{ ml: 1, mr: 1 }} />
        </motion.div>
        
        <InputBase
          ref={inputRef}
          sx={{
            ml: 1,
            flex: 1,
            fontSize: '1rem',
            '& input::placeholder': {
              color: THEME.text.muted,
              transition: 'color 0.3s ease'
            }
          }}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        <AnimatePresence>
          {value && showClearButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Tooltip title="Limpiar búsqueda" TransitionComponent={Zoom}>
                <IconButton
                  onClick={handleClear}
                  size="small"
                  sx={{
                    mr: 0.5,
                    color: THEME.text.muted,
                    '&:hover': {
                      color: THEME.primary[600],
                      backgroundColor: THEME.primary[50],
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <IconButton
            type="submit"
            sx={{
              p: 1.5,
              mr: 0.5,
              color: 'white',
              backgroundColor: THEME.primary[600],
              borderRadius: 2,
              '&:hover': {
                backgroundColor: THEME.primary[700],
                boxShadow: `0 4px 15px rgba(59, 130, 246, 0.4)`
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <SearchIcon />
          </IconButton>
        </motion.div>
      </Paper>
    </motion.div>
  );
};

// Enhanced Category Chip with Animations
export const AnimatedCategoryChip = ({ 
  label, 
  selected = false, 
  onClick, 
  icon,
  index = 0 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1] 
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Chip
        icon={icon}
        label={label}
        onClick={onClick}
        variant={selected ? 'filled' : 'outlined'}
        color={selected ? 'primary' : 'default'}
        sx={{
          borderRadius: 3,
          px: 1,
          py: 0.5,
          fontWeight: selected ? 600 : 500,
          fontSize: '0.875rem',
          border: selected ? 'none' : `1px solid ${THEME.border.main}`,
          backgroundColor: selected 
            ? THEME.primary[600] 
            : isHovered 
              ? THEME.primary[50] 
              : 'transparent',
          color: selected 
            ? 'white' 
            : isHovered 
              ? THEME.primary[700] 
              : THEME.text.secondary,
          boxShadow: selected 
            ? `0 4px 15px rgba(59, 130, 246, 0.3)`
            : isHovered 
              ? `0 2px 10px rgba(59, 130, 246, 0.1)`
              : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '& .MuiChip-icon': {
            color: selected ? 'white' : THEME.primary[600],
            transition: 'color 0.3s ease'
          }
        }}
      />
    </motion.div>
  );
};

// Enhanced Button with Loading States and Animations
export const AnimatedButton = ({ 
  children, 
  variant = 'contained', 
  color = 'primary',
  loading = false,
  icon,
  onClick,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <Button
        variant={variant}
        color={color}
        onClick={onClick}
        disabled={loading}
        startIcon={loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <TuneIcon />
          </motion.div>
        ) : icon}
        sx={{
          borderRadius: 3,
          px: 3,
          py: 1.5,
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '1rem',
          boxShadow: variant === 'contained' 
            ? `0 4px 15px rgba(59, 130, 246, 0.3)`
            : 'none',
          '&:hover': {
            boxShadow: variant === 'contained' 
              ? `0 6px 20px rgba(59, 130, 246, 0.4)`
              : `0 2px 10px rgba(59, 130, 246, 0.2)`,
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isPressed ? 'scale(0.98)' : 'none',
          ...props.sx
        }}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};

// Enhanced Newsletter Signup with Animations
export const AnimatedNewsletterCard = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(email);
      setIsSuccess(true);
      setEmail('');
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error('Newsletter signup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Paper
        sx={{
          p: 4,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${THEME.primary[50]} 0%, ${THEME.primary[100]} 100%)`,
          border: `1px solid ${THEME.primary[200]}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover::before': {
            opacity: 1,
          }
        }}
      >
        <motion.div
          animate={isSuccess ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: THEME.primary[700],
              textAlign: 'center'
            }}
          >
            📧 Newsletter
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: THEME.text.secondary,
              mb: 3,
              textAlign: 'center',
              lineHeight: 1.6
            }}
          >
            Recibe las últimas noticias sobre construcción y reformas
          </Typography>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 2,
                    color: THEME.primary[600],
                    fontWeight: 600
                  }}
                >
                  ✅ ¡Suscripción exitosa!
                </Box>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
              >
                <TextField
                  fullWidth
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: THEME.primary[400],
                        }
                      }
                    }
                  }}
                />

                <AnimatedButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  loading={isSubmitting}
                  disabled={!email || isSubmitting}
                  sx={{
                    backgroundColor: THEME.primary[600],
                    '&:hover': {
                      backgroundColor: THEME.primary[700],
                    }
                  }}
                >
                  {isSubmitting ? 'Suscribiendo...' : 'Suscribirse'}
                </AnimatedButton>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </Paper>
    </motion.div>
  );
};

export default {
  AnimatedSearchBar,
  AnimatedCategoryChip,
  AnimatedButton,
  AnimatedNewsletterCard
};
