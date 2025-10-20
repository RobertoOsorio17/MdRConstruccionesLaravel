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
    orange: {
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c'
    },
    emerald: {
      400: '#34d399',
      500: '#10b981',
      600: '#059669'
    },
    purple: {
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed'
    },
    rose: {
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48'
    },
    amber: {
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706'
    }
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
  modalBackdrop: 1990,
  offcanvas: 2000,
  modal: 2010,
  popover: 2020,
  tooltip: 2030,
  
  // Always on top
  notification: 2040,
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
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    boxShadow: shadows.glass
  },

  strong: {
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
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
// GRADIENTS
// ============================================

export const gradients = {
  // Gradientes de marca
  primary: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[800]} 100%)`,
  primaryLight: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[600]} 100%)`,
  
  // Gradientes de acento
  accent: `linear-gradient(135deg, ${colors.accent.orange[500]} 0%, ${colors.accent.rose[500]} 100%)`,
  warm: `linear-gradient(135deg, #fa709a 0%, #fee140 100%)`,
  cool: `linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)`,
  
  // Gradientes hero
  hero: `linear-gradient(135deg, rgba(37, 99, 235, 0.95) 0%, rgba(124, 58, 237, 0.95) 100%)`,
  heroDark: `linear-gradient(135deg, ${colors.secondary[900]} 0%, ${colors.secondary[800]} 100%)`,
  
  // Gradientes de superficie
  surface: `linear-gradient(145deg, ${colors.surface.primary} 0%, ${colors.surface.secondary} 100%)`,
  glass: `linear-gradient(145deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)`,
  
  // Gradientes de overlay
  overlayDark: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%)',
  overlayLight: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%)',
  
  // Gradientes especiales
  success: `linear-gradient(135deg, ${colors.success[600]} 0%, ${colors.accent.emerald[600]} 100%)`,
  rainbow: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
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
// TYPOGRAPHY (tokens para tipografía consistente)
// ============================================

export const typography = {
  // Familias de fuentes
  fontFamily: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    secondary: '"Playfair Display", Georgia, serif',
    mono: '"JetBrains Mono", Menlo, Monaco, Consolas, monospace',
  },

  // Escala de tamaños (Major Third - 1.250)
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.563rem', // 25px
    '3xl': '1.953rem', // 31px
    '4xl': '2.441rem', // 39px
    '5xl': '3.052rem', // 49px
    '6xl': '3.815rem', // 61px
  },

  // Pesos
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
  },
};

// ============================================
// BUTTON SYSTEM (tokens para sistema de botones)
// ============================================

export const buttonTokens = {
  // Tamaños
  size: {
    xs: {
      height: '28px',
      padding: `${spacing[1]} ${spacing[2]}`,
      fontSize: typography.fontSize.xs,
      iconSize: '14px'
    },
    sm: {
      height: '32px',
      padding: `${spacing[1.5]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm,
      iconSize: '16px'
    },
    md: {
      height: '40px',
      padding: `${spacing[2]} ${spacing[4]}`,
      fontSize: typography.fontSize.base,
      iconSize: '20px'
    },
    lg: {
      height: '48px',
      padding: `${spacing[3]} ${spacing[6]}`,
      fontSize: typography.fontSize.lg,
      iconSize: '24px'
    },
    xl: {
      height: '56px',
      padding: `${spacing[4]} ${spacing[8]}`,
      fontSize: typography.fontSize.xl,
      iconSize: '28px'
    }
  },

  // Variantes
  variant: {
    primary: {
      background: gradients.primary,
      color: colors.text.inverse,
      border: 'none',
      shadow: shadows.colored.primary,
      hoverShadow: shadows.colored.primaryHover,
      hoverTransform: 'translateY(-2px)'
    },
    secondary: {
      background: 'transparent',
      color: colors.primary[600],
      border: `2px solid ${colors.primary[600]}`,
      shadow: 'none',
      hoverBackground: colors.primary[50],
      hoverTransform: 'none'
    },
    tertiary: {
      background: 'transparent',
      color: colors.text.secondary,
      border: 'none',
      shadow: 'none',
      hoverBackground: colors.surface.tertiary,
      hoverColor: colors.text.primary,
      hoverTransform: 'none'
    },
    ghost: {
      background: 'transparent',
      color: colors.text.primary,
      border: 'none',
      shadow: 'none',
      hoverBackground: colors.surface.secondary,
      hoverTransform: 'none'
    },
    danger: {
      background: colors.error[500],
      color: colors.text.inverse,
      border: 'none',
      shadow: shadows.colored.error,
      hoverBackground: colors.error[600],
      hoverTransform: 'translateY(-2px)'
    },
    success: {
      background: colors.success[500],
      color: colors.text.inverse,
      border: 'none',
      shadow: shadows.colored.success,
      hoverBackground: colors.success[600],
      hoverTransform: 'translateY(-2px)'
    }
  },

  // Estados
  state: {
    disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none'
    },
    loading: {
      opacity: 0.7,
      cursor: 'wait'
    }
  }
};

// ============================================
// ANIMATION PRESETS
// ============================================

export const animations = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },

  // Slide animations
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },

  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },

  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },

  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },

  // Scale animations
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },

  scaleUp: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  },

  // Rotate animations
  rotate: {
    initial: { opacity: 0, rotate: -10 },
    animate: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: 10 }
  },

  // Stagger container
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
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
  gradients,
  typography,
  container,
  buttonTokens,
  animations
};

export default designSystem;
