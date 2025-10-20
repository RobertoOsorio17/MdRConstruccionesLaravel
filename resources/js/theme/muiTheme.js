/**
 * MUI Theme - Tema unificado de Material-UI para MDR Construcciones
 * 
 * Este archivo crea el tema oficial de MUI consumiendo tokens del designSystem.
 * Úsalo envolviendo tu app con <ThemeProvider theme={theme}>
 * 
 * Características:
 * - Paleta de colores consistente
 * - Tipografía profesional con Inter
 * - Componentes personalizados (botones, cards, inputs)
 * - Breakpoints responsive
 * - Sombras y elevación unificadas
 * 
 * @example
 * import { ThemeProvider } from '@mui/material';
 * import theme from '@/theme/muiTheme';
 * 
 * <ThemeProvider theme={theme}>
 *   <App />
 * </ThemeProvider>
 */

import { createTheme } from '@mui/material/styles';
import designSystem from './designSystem';

// ============================================
// CONFIGURACIÓN BASE DEL TEMA
// ============================================

const theme = createTheme({
  // ============================================
  // PALETA DE COLORES
  // ============================================
  palette: {
    // Color primario (azul corporativo)
    primary: {
      main: designSystem.colors.primary[600],
      light: designSystem.colors.primary[400],
      dark: designSystem.colors.primary[800],
      contrastText: '#ffffff',
    },

    // Color secundario (gris neutro)
    secondary: {
      main: designSystem.colors.secondary[600],
      light: designSystem.colors.secondary[400],
      dark: designSystem.colors.secondary[800],
      contrastText: '#ffffff',
    },

    // Colores de estado
    success: {
      main: designSystem.colors.success[600],
      light: designSystem.colors.success[500],
      dark: designSystem.colors.success[700],
      contrastText: '#ffffff',
    },
    error: {
      main: designSystem.colors.error[600],
      light: designSystem.colors.error[500],
      dark: designSystem.colors.error[700],
      contrastText: '#ffffff',
    },
    warning: {
      main: designSystem.colors.warning[600],
      light: designSystem.colors.warning[500],
      dark: designSystem.colors.warning[700],
      contrastText: '#ffffff',
    },
    info: {
      main: designSystem.colors.info[600],
      light: designSystem.colors.info[500],
      dark: designSystem.colors.info[700],
      contrastText: '#ffffff',
    },

    // Colores de texto
    text: {
      primary: designSystem.colors.text.primary,
      secondary: designSystem.colors.text.secondary,
      disabled: designSystem.colors.text.disabled,
    },

    // Colores de fondo
    background: {
      default: designSystem.colors.surface.primary,
      paper: designSystem.colors.surface.elevated,
    },

    // Dividers y borders
    divider: designSystem.colors.border.main,
  },

  // ============================================
  // TIPOGRAFÍA
  // ============================================
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    
    // Headings
    h1: {
      fontWeight: 800,
      fontSize: '3rem',      // 48px
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      '@media (max-width:960px)': {
        fontSize: '2.5rem',  // 40px en tablet
      },
      '@media (max-width:600px)': {
        fontSize: '2rem',    // 32px en móvil
      },
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',    // 40px
      lineHeight: 1.25,
      letterSpacing: '-0.02em',
      '@media (max-width:960px)': {
        fontSize: '2rem',    // 32px en tablet
      },
      '@media (max-width:600px)': {
        fontSize: '1.75rem', // 28px en móvil
      },
    },
    h3: {
      fontWeight: 700,
      fontSize: '2rem',      // 32px
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      '@media (max-width:960px)': {
        fontSize: '1.75rem', // 28px en tablet
      },
      '@media (max-width:600px)': {
        fontSize: '1.5rem',  // 24px en móvil
      },
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',    // 24px
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '1.25rem', // 20px en móvil
      },
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',   // 20px
      lineHeight: 1.5,
      '@media (max-width:600px)': {
        fontSize: '1.125rem', // 18px en móvil
      },
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',  // 18px
      lineHeight: 1.5,
    },

    // Body text
    body1: {
      fontSize: '1rem',      // 16px
      lineHeight: 1.6,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',  // 14px
      lineHeight: 1.6,
      letterSpacing: '0.01071em',
    },

    // Otros
    button: {
      fontWeight: 600,
      fontSize: '0.9375rem', // 15px
      lineHeight: 1.75,
      letterSpacing: '0.02em',
      textTransform: 'none', // No uppercase automático
    },
    caption: {
      fontSize: '0.75rem',   // 12px
      lineHeight: 1.66,
      letterSpacing: '0.03333em',
    },
    overline: {
      fontSize: '0.75rem',   // 12px
      fontWeight: 600,
      lineHeight: 2.66,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
    },
  },

  // ============================================
  // BREAKPOINTS
  // ============================================
  breakpoints: {
    values: designSystem.breakpoints.values,
  },

  // ============================================
  // ESPACIADO
  // ============================================
  spacing: 8, // Base de 8px (MUI usa multiplicadores)

  // ============================================
  // FORMA (Border radius)
  // ============================================
  shape: {
    borderRadius: 8, // Default border radius en px
  },

  // ============================================
  // SOMBRAS
  // ============================================
  shadows: [
    'none',
    designSystem.shadows.xs,
    designSystem.shadows.sm,
    designSystem.shadows.sm,
    designSystem.shadows.md,
    designSystem.shadows.md,
    designSystem.shadows.md,
    designSystem.shadows.lg,
    designSystem.shadows.lg,
    designSystem.shadows.lg,
    designSystem.shadows.xl,
    designSystem.shadows.xl,
    designSystem.shadows.xl,
    designSystem.shadows['2xl'],
    designSystem.shadows['2xl'],
    designSystem.shadows['2xl'],
    designSystem.shadows['2xl'],
    designSystem.shadows['2xl'],
    designSystem.shadows['2xl'],
    designSystem.shadows['2xl'],
    designSystem.shadows['2xl'],
    designSystem.shadows['2xl'],
    designSystem.shadows['2xl'],
    designSystem.shadows['2xl'],
    designSystem.shadows['2xl'],
  ],

  // ============================================
  // TRANSICIONES
  // ============================================
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: designSystem.transitions.easing.smooth,
      easeOut: designSystem.transitions.easing.smoothOut,
      easeIn: designSystem.transitions.easing.smoothIn,
      sharp: designSystem.transitions.easing.spring,
    },
  },

  // ============================================
  // Z-INDEX
  // ============================================
  zIndex: {
    mobileStepper: designSystem.zIndex.base + 10,
    fab: designSystem.zIndex.fab,
    speedDial: designSystem.zIndex.fab,
    appBar: designSystem.zIndex.appBar,
    drawer: designSystem.zIndex.offcanvas,
    modal: designSystem.zIndex.modal,
    snackbar: designSystem.zIndex.notification,
    tooltip: designSystem.zIndex.tooltip,
  },

  // ============================================
  // COMPONENTES PERSONALIZADOS
  // ============================================
  components: {
    // ========================================
    // BUTTON
    // ========================================
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: designSystem.borders.radius.md,
          padding: '10px 24px',
          fontSize: '0.9375rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          transition: designSystem.transitions.presets.allNormal,
          
          '&:hover': {
            boxShadow: designSystem.shadows.sm,
            transform: 'translateY(-2px)',
          },
          
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        
        sizeLarge: {
          padding: '12px 32px',
          fontSize: '1rem',
        },
        
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.875rem',
        },

        contained: {
          '&:hover': {
            boxShadow: designSystem.shadows.md,
          },
        },

        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },

    // ========================================
    // CARD
    // ========================================
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: designSystem.borders.radius.lg,
          boxShadow: designSystem.shadows.sm,
          transition: designSystem.transitions.presets.allNormal,
          
          '&:hover': {
            boxShadow: designSystem.shadows.md,
            transform: 'translateY(-4px)',
          },
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },

    // ========================================
    // PAPER
    // ========================================
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: designSystem.borders.radius.md,
        },
        elevation1: {
          boxShadow: designSystem.shadows.sm,
        },
        elevation2: {
          boxShadow: designSystem.shadows.md,
        },
        elevation3: {
          boxShadow: designSystem.shadows.lg,
        },
      },
    },

    // ========================================
    // CHIP
    // ========================================
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: designSystem.borders.radius.lg,
          fontWeight: 500,
          transition: designSystem.transitions.presets.allFast,
          
          '&:hover': {
            boxShadow: designSystem.shadows.sm,
          },
        },
      },
    },

    // ========================================
    // TEXTFIELD / INPUT
    // ========================================
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: designSystem.borders.radius.md,
          
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: designSystem.colors.border.strong,
          },
          
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: '2px',
            borderColor: designSystem.colors.primary[600],
          },
        },
        
        input: {
          padding: '14px 16px',
        },
      },
    },

    // ========================================
    // DIALOG / MODAL
    // ========================================
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: designSystem.borders.radius.xl,
          boxShadow: designSystem.shadows.xl,
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.5rem',
          fontWeight: 700,
          padding: '24px',
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '24px',
        },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },

    // ========================================
    // APPBAR
    // ========================================
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: designSystem.shadows.sm,
        },
      },
    },

    // ========================================
    // TOOLTIP
    // ========================================
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: designSystem.colors.secondary[800],
          fontSize: '0.875rem',
          padding: '8px 12px',
          borderRadius: designSystem.borders.radius.md,
        },
        arrow: {
          color: designSystem.colors.secondary[800],
        },
      },
    },

    // ========================================
    // SNACKBAR
    // ========================================
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiAlert-root': {
            borderRadius: designSystem.borders.radius.lg,
            boxShadow: designSystem.shadows.lg,
          },
        },
      },
    },

    // ========================================
    // LINK
    // ========================================
    MuiLink: {
      styleOverrides: {
        root: {
          color: designSystem.colors.text.link,
          textDecoration: 'none',
          transition: designSystem.transitions.presets.color,
          
          '&:hover': {
            color: designSystem.colors.text.linkHover,
            textDecoration: 'underline',
          },
        },
      },
    },

    // ========================================
    // BREADCRUMBS
    // ========================================
    MuiBreadcrumbs: {
      styleOverrides: {
        separator: {
          marginLeft: '8px',
          marginRight: '8px',
        },
      },
    },
  },
});

export default theme;
