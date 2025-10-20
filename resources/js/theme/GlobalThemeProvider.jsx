/**
 * GlobalThemeProvider - Provider global del tema MUI para toda la aplicación
 * 
 * Este componente envuelve la aplicación con el tema unificado de Material-UI.
 * Debe usarse en el nivel más alto posible (app.jsx o MainLayout).
 * 
 * Características:
 * - Aplica el tema MUI unificado
 * - Inyecta estilos globales (fuentes, reset CSS)
 * - Optimizado con memoización
 * 
 * @example
 * // En app.jsx o MainLayout:
 * import GlobalThemeProvider from '@/theme/GlobalThemeProvider';
 * 
 * <GlobalThemeProvider>
 *   <App />
 * </GlobalThemeProvider>
 */

import React from 'react';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import theme from './muiTheme';

// ============================================
// ESTILOS GLOBALES
// ============================================
const globalStyles = (
  <GlobalStyles
    styles={{
      // Importar fuente Inter de Google Fonts
      '@import': [
        "url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap')",
      ],

      // Reset y configuración base
      '*': {
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
      },

      html: {
        fontSize: '16px', // Base font size
        scrollBehavior: 'smooth',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },

      body: {
        fontFamily: theme.typography.fontFamily,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        lineHeight: 1.6,
        overflowX: 'hidden',
      },

      // Mejorar selección de texto
      '::selection': {
        backgroundColor: theme.palette.primary.main,
        color: '#ffffff',
      },
      
      '::-moz-selection': {
        backgroundColor: theme.palette.primary.main,
        color: '#ffffff',
      },

      // Scrollbar personalizado (Webkit)
      '::-webkit-scrollbar': {
        width: '12px',
        height: '12px',
      },

      '::-webkit-scrollbar-track': {
        backgroundColor: theme.palette.grey[100],
      },

      '::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.grey[400],
        borderRadius: '6px',
        '&:hover': {
          backgroundColor: theme.palette.grey[500],
        },
      },

      // Links
      a: {
        color: theme.palette.primary.main,
        textDecoration: 'none',
        transition: 'color 0.2s ease',
        '&:hover': {
          color: theme.palette.primary.dark,
          textDecoration: 'underline',
        },
      },

      // Imágenes
      img: {
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
      },

      // Accesibilidad: Focus visible
      'a:focus-visible, button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '2px',
      },

      // Reducir movimiento para usuarios con preferencias de accesibilidad
      '@media (prefers-reduced-motion: reduce)': {
        '*': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
          scrollBehavior: 'auto !important',
        },
      },
    }}
  />
);

// ============================================
// COMPONENT
// ============================================

/**
 * GlobalThemeProvider Component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Elementos hijos a envolver
 */
export default function GlobalThemeProvider({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      {children}
    </ThemeProvider>
  );
}
