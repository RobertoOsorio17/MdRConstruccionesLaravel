import React, { useEffect } from 'react';
import { Box, Fab, useScrollTrigger, Zoom } from '@mui/material';
import { KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material';
import { motion, useScroll, useSpring } from 'framer-motion';

// Barra de progreso de scroll
const ScrollProgressBar = ({ prefersReducedMotion }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #0B6BCB 0%, #F5A524 100%)',
        transformOrigin: '0%',
        scaleX,
        // Debe quedar por debajo del Drawer móvil, pero por encima del contenido
        zIndex: 1198,
        pointerEvents: 'none',
      }}
    />
  );
};

// Botón scroll to top
const ScrollToTopButton = ({ prefersReducedMotion }) => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 300,
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1000,
        }}
      >
        <Fab
          color="primary"
          size="medium"
          sx={{
            background: 'linear-gradient(45deg, #0B6BCB 30%, #F5A524 90%)',
            color: 'white',
            boxShadow: '0 8px 20px rgba(11, 107, 203, 0.3)',
            '&:hover': {
              transform: prefersReducedMotion ? 'none' : 'translateY(-3px) scale(1.05)',
              boxShadow: '0 12px 30px rgba(11, 107, 203, 0.4)',
            },
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Box>
    </Zoom>
  );
};

// Componente principal
const MicroInteractions = ({ prefersReducedMotion = false, children }) => {
  // Estilos CSS globales para micro-interacciones
  useEffect(() => {
    if (prefersReducedMotion) return;

    const style = document.createElement('style');
    style.textContent = `
      button, a, [role="button"], .MuiButton-root, .MuiCard-root {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      
      button:hover, a:hover {
        transform: translateY(-1px);
      }
      
      button:focus-visible, a:focus-visible {
        outline: 2px solid #F5A524;
        outline-offset: 2px;
        box-shadow: 0 0 0 4px rgba(245, 165, 36, 0.2);
      }
      
      html { scroll-behavior: smooth; }
      
      ::selection {
        background-color: rgba(245, 165, 36, 0.3);
        color: #0B6BCB;
      }
      
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #f1f1f1; }
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(45deg, #0B6BCB, #F5A524);
        border-radius: 4px;
      }
    `;
    
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [prefersReducedMotion]);

  return (
    <>
      <ScrollProgressBar prefersReducedMotion={prefersReducedMotion} />
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </motion.div>
      <ScrollToTopButton prefersReducedMotion={prefersReducedMotion} />
    </>
  );
};

export default MicroInteractions;
