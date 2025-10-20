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

  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const [burstKey, setBurstKey] = React.useState(0);
  const [particles, setParticles] = React.useState([]);

  const handleToggle = (e) => {
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = Math.round(rect.left + rect.width / 2);
      const cy = Math.round(rect.top + rect.height / 2);
      const toDark = !isDark;

      // Particle burst from the button
      if (!prefersReducedMotion) {
        setParticles(
          Array.from({ length: 12 }, () => ({
            x: (Math.random() - 0.5) * 80,
            y: (Math.random() - 0.5) * 80,
            delay: Math.random() * 0.12,
          }))
        );
        setBurstKey(Date.now());
      }

      // Radial reveal overlay (clip-path circle from click center)
      if (!prefersReducedMotion) {
        const overlay = document.createElement('div');
        overlay.setAttribute('data-theme-overlay', 'true');
        Object.assign(overlay.style, {
          position: 'fixed',
          inset: '0',
          pointerEvents: 'none',
          zIndex: 3000,
          opacity: '1',
          clipPath: `circle(0px at ${cx}px ${cy}px)`,
          transition: 'clip-path 600ms cubic-bezier(0.2, 0.6, 0.2, 1), opacity 420ms ease-out',
          background: toDark
            ? 'radial-gradient(1200px 1200px at center, rgba(17,24,39,0.95) 0%, rgba(2,6,23,0.85) 60%, rgba(2,6,23,0.75) 100%)'
            : 'radial-gradient(1200px 1200px at center, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.9) 60%, rgba(255,255,255,0.85) 100%)',
          backdropFilter: 'blur(8px)',
        });
        document.body.appendChild(overlay);

        const maxX = Math.max(cx, window.innerWidth - cx);
        const maxY = Math.max(cy, window.innerHeight - cy);
        const finalRadius = Math.hypot(maxX, maxY) * 1.2;
        requestAnimationFrame(() => {
          overlay.style.clipPath = `circle(${finalRadius}px at ${cx}px ${cy}px)`;
        });

        // Swap theme mid-animation for seamless reveal
        window.setTimeout(() => {
          toggleTheme();
          // graceful fade-out
          window.setTimeout(() => {
            overlay.style.opacity = '0';
            window.setTimeout(() => overlay.remove(), 360);
          }, 260);
        }, 180);

        // Add a rotating conic sweep for extra flair
        const sweep = document.createElement('div');
        Object.assign(sweep.style, {
          position: 'fixed',
          inset: '-10%',
          pointerEvents: 'none',
          zIndex: 3001,
          opacity: '0.35',
          background: toDark
            ? 'conic-gradient(from 0deg at 50% 50%, rgba(59,130,246,0.15), rgba(245,165,36,0.1), transparent 90deg)'
            : 'conic-gradient(from 0deg at 50% 50%, rgba(17,24,39,0.15), rgba(99,102,241,0.1), transparent 90deg)'
        });
        document.body.appendChild(sweep);
        const sweepAnim = sweep.animate(
          [ { transform: 'rotate(0deg)', opacity: 0.35 }, { transform: 'rotate(360deg)', opacity: 0 } ],
          { duration: 800, easing: 'ease-out' }
        );
        sweepAnim.onfinish = () => sweep.remove();

        // Star sparkle field (very lightweight)
        const starLayer = document.createElement('div');
        Object.assign(starLayer.style, {
          position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: 3002,
        });
        const starCount = 14;
        for (let i = 0; i < starCount; i++) {
          const star = document.createElement('span');
          const size = 2 + Math.random() * 3;
          Object.assign(star.style, {
            position: 'absolute',
            left: Math.round(Math.random() * 100) + '%',
            top: Math.round(Math.random() * 100) + '%',
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: toDark ? '#F5A524' : '#3b82f6',
            boxShadow: `0 0 12px ${toDark ? 'rgba(245,165,36,0.7)' : 'rgba(59,130,246,0.7)'}`,
            opacity: '0',
          });
          starLayer.appendChild(star);
          star.animate(
            [ { transform: 'translate3d(0,0,0) scale(0.4)', opacity: 0 },
              { transform: `translate3d(${(Math.random()-0.5)*60}px, ${(Math.random()-0.5)*60}px, 0) scale(1)`, opacity: 0.9, offset: 0.5 },
              { transform: `translate3d(${(Math.random()-0.5)*100}px, ${(Math.random()-0.5)*100}px, 0) scale(0.1)`, opacity: 0 } ],
            { duration: 900, delay: Math.random()*120, easing: 'ease-out' }
          );
        }
        document.body.appendChild(starLayer);
        setTimeout(() => starLayer.remove(), 980);
      } else {
        // Reduced motion fallback
        toggleTheme();
      }
    } catch (err) {
      toggleTheme();
    }
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
        position: 'relative',
        overflow: 'hidden',
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
      {/* Pulse ring */}
      {!prefersReducedMotion && (
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <motion.span
            key={`ring-${burstKey}`}
            initial={{ opacity: 0.6, scale: 0 }}
            animate={{ opacity: 0, scale: 1.6 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: currentSize.buttonSize,
              height: currentSize.buttonSize,
              marginLeft: -currentSize.buttonSize / 2,
              marginTop: -currentSize.buttonSize / 2,
              borderRadius: '999px',
              border: `2px solid ${isDark ? '#F5A524' : '#3b82f6'}`,
              boxShadow: `0 0 24px ${isDark ? 'rgba(245,165,36,0.35)' : 'rgba(59,130,246,0.35)'}`,
            }}
          />
          {/* Particle burst */}
      {particles.map((p, idx) => (
        <motion.span
          key={`p-${burstKey}-${idx}`}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: p.x, y: p.y, scale: 0.1 }}
          transition={{ duration: 0.8, delay: p.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 4,
            height: 4,
            borderRadius: 2,
            background: isDark ? '#F5A524' : '#3b82f6',
            boxShadow: `0 0 10px ${isDark ? 'rgba(245,165,36,0.6)' : 'rgba(59,130,246,0.6)'}`,
          }}
        />
      ))}
      {/* Extra ripple rings */}
      {!prefersReducedMotion && (
        <>
          <motion.span
            key={`ring2-${burstKey}`}
            initial={{ opacity: 0.4, scale: 0.6 }}
            animate={{ opacity: 0, scale: 2.0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.05 }}
            style={{
              position: 'absolute', top: '50%', left: '50%', width: currentSize.buttonSize,
              height: currentSize.buttonSize, marginLeft: -currentSize.buttonSize/2,
              marginTop: -currentSize.buttonSize/2, borderRadius: '999px',
              border: `1px solid ${isDark ? '#F5A524' : '#3b82f6'}`,
            }}
          />
          <motion.span
            key={`ring3-${burstKey}`}
            initial={{ opacity: 0.25, scale: 0.9 }}
            animate={{ opacity: 0, scale: 2.6 }}
            transition={{ duration: 1.0, ease: 'easeOut', delay: 0.1 }}
            style={{
              position: 'absolute', top: '50%', left: '50%', width: currentSize.buttonSize,
              height: currentSize.buttonSize, marginLeft: -currentSize.buttonSize/2,
              marginTop: -currentSize.buttonSize/2, borderRadius: '999px',
              border: `1px dashed ${isDark ? 'rgba(245,165,36,0.7)' : 'rgba(59,130,246,0.7)'}`,
            }}
          />
        </>
      )}
    </Box>
  )}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0, filter: isDark ? 'drop-shadow(0 0 8px rgba(245,165,36,0.5))' : 'drop-shadow(0 0 8px rgba(59,130,246,0.5))' }}
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
