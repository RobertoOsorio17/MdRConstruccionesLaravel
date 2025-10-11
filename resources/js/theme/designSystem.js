/**
 * Design System - Sistema de diseño unificado para MDR Construcciones
 * 
 * Este archivo define todos los tokens de diseño que se utilizan en toda la aplicación:
 * - Paleta de colores
 * - Espaciado
 * - Sombras
 * - Bordes
 * - Z-index
 * - Transiciones
 * - Breakpoints
 * 
 * Uso: import { designSystem } from '@/theme/designSystem';
 */

// ============================================
// PALETA DE COLORES
// ============================================

export const colors = {
  // Primary - Azul corporativo
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },

  // Secondary - Gris neutro
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },

  // Accent - Colores de acento
  accent: {
    orange: '#f97316',
    orangeLight: '#fb923c',
    orangeDark: '#ea580c',
    emerald: '#10b981',
    emeraldLight: '#34d399',
    emeraldDark: '#059669',
    purple: '#8b5cf6',
    purpleLight: '#a78bfa',
    purpleDark: '#7c3aed',
    rose: '#f43f5e',
    roseLight: '#fb7185',
    roseDark: '#e11d48',
    amber: '#f59e0b',
    amberLight: '#fbbf24',
    amberDark: '#d97706'
  },

  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d'
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c'
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309'
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8'
  },

  // Surface colors - para fondos y superficies
  surface: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    elevated: '#ffffff',
    overlay: 'rgba(255, 255, 255, 0.95)',
    overlayDark: 'rgba(0, 0, 0, 0.5)',
    dark: {
      primary: '#1e293b',
      secondary: '#0f172a',
      tertiary: '#020617'
    }
  },

  // Text colors
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#64748b',
    muted: '#94a3b8',
    disabled: '#cbd5e1',
    inverse: '#ffffff',
    link: '#2563eb',
    linkHover: '#1d4ed8'
  },

  // Border colors
  border: {
    light: '#f1f5f9',
    main: '#e2e8f0',
    strong: '#cbd5e1',
    focus: '#3b82f6',
    error: '#ef4444'
  },

  // Glass effect colors
  glass: {
    white: 'rgba(255, 255, 255, 0.25)',
    whiteStrong: 'rgba(255, 255, 255, 0.4)',
    dark: 'rgba(0, 0, 0, 0.25)',
    darkStrong: 'rgba(0, 0, 0, 0.4)'
  }
};

// ============================================
// SISTEMA DE ESPACIADO (basado en 4px)
// ============================================

export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px'
};

// ============================================
// SISTEMA DE SOMBRAS
// ============================================

export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
  
  // Colored shadows
  colored: {
    primary: '0 20px 40px rgba(59, 130, 246, 0.15)',
    primaryHover: '0 25px 50px rgba(59, 130, 246, 0.25)',
    accent: '0 20px 40px rgba(249, 115, 22, 0.15)',
    accentHover: '0 25px 50px rgba(249, 115, 22, 0.25)',
    success: '0 10px 25px rgba(34, 197, 94, 0.15)',
    error: '0 10px 25px rgba(239, 68, 68, 0.15)'
  },

  // Glass shadows
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.1)'
};

// ============================================
// SISTEMA DE BORDES
// ============================================

export const borders = {
  radius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    full: '9999px'
  },
  
  width: {
    thin: '1px',
    medium: '2px',
    thick: '3px',
    heavy: '4px'
  }
};

// ============================================
// SISTEMA DE Z-INDEX
// ============================================

export const zIndex = {
  // Base layers
  base: 0,
  below: -1,
  
  // UI elements
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  offcanvas: 1050,
  modal: 1055,
  popover: 1070,
  tooltip: 1080,
  
  // Always on top
  notification: 1090,
  appBar: 1100,
  fab: 1200,
  
  // Debug/Dev
  debug: 9999
};

// ============================================
// SISTEMA DE TRANSICIONES
// ============================================

export const transitions = {
  // Duraciones
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms'
  },

  // Easing functions
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    // Custom cubic bezier
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smoothIn: 'cubic-bezier(0.4, 0, 1, 1)',
    smoothOut: 'cubic-bezier(0, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },

  // Presets comunes
  presets: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
    allFast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    allNormal: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    allSlow: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    color: 'color 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// ============================================
// BREAKPOINTS
// ============================================

export const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920
  },

  // Media queries helper
  up: (key) => `@media (min-width:${breakpoints.values[key]}px)`,
  down: (key) => `@media (max-width:${breakpoints.values[key] - 0.05}px)`,
  between: (start, end) => `@media (min-width:${breakpoints.values[start]}px) and (max-width:${breakpoints.values[end] - 0.05}px)`,
  only: (key) => {
    const keys = Object.keys(breakpoints.values);
    const index = keys.indexOf(key);
    if (index === keys.length - 1) {
      return breakpoints.up(key);
    }
    return breakpoints.between(key, keys[index + 1]);
  }
};

// ============================================
// GLASSMORPHISM PRESETS
// ============================================

export const glassmorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: shadows.glass
  },

  medium: {
    background: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    boxShadow: shadows.glass
  },

  strong: {
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: shadows.glass
  },

  dark: {
    background: 'rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: shadows.glass
  }
};

// ============================================
// CONTAINER WIDTHS
// ============================================

export const container = {
  maxWidth: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '4k': '1920px' // Para pantallas ultra-wide
  },

  // Padding responsive
  padding: {
    mobile: spacing[4],    // 16px
    tablet: spacing[6],    // 24px
    desktop: spacing[8]    // 32px
  }
};

// ============================================
// EXPORT DEFAULT
// ============================================

const designSystem = {
  colors,
  spacing,
  shadows,
  borders,
  zIndex,
  transitions,
  breakpoints,
  glassmorphism,
  container
};

export default designSystem;
