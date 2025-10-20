/**
 * Theme Provider - Provider global de tema con soporte para dark mode
 * 
 * Proporciona:
 * - Context API para acceder al tema en cualquier componente
 * - Dark mode toggle con persistencia en localStorage
 * - Integración con Material-UI
 * - Sistema de diseño unificado
 * 
 * Uso:
 * import { useAppTheme, AppThemeProvider } from '@/theme/ThemeProvider';
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import designSystem from './designSystem';
import typography from './typography';

// ============================================
// CONTEXT
// ============================================

const AppThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
  theme: null
});

// ============================================
// HOOK PERSONALIZADO
// ============================================

export const useAppTheme = () => {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme debe ser usado dentro de AppThemeProvider');
  }
  return context;
};

// ============================================
// GLOBAL STYLES
// ============================================

const globalStyles = (mode) => ({
  // Font optimization
  '@font-face': {
    fontFamily: 'Figtree',
    fontDisplay: 'swap', // Mostrar fallback inmediatamente
  },

  // HTML & Body
  'html': {
    scrollBehavior: 'smooth',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    colorScheme: mode,
  },

  'body': {
    margin: 0,
    padding: 0,
    fontFamily: typography.fontFamilies.sans,
    fontSize: typography.fontSizes.base,
    lineHeight: typography.lineHeights.body,
    color: mode === 'light' ? designSystem.colors.text.primary : designSystem.colors.text.inverse,
    backgroundColor: mode === 'light' ? designSystem.colors.surface.primary : designSystem.colors.surface.dark.primary,
    transition: designSystem.transitions.presets.allNormal,
    colorScheme: mode,
  },

  // Selection
  '::selection': {
    backgroundColor: designSystem.colors.primary[200],
    color: designSystem.colors.text.primary,
  },

  '::-moz-selection': {
    backgroundColor: designSystem.colors.primary[200],
    color: designSystem.colors.text.primary,
  },

  // Focus visible (accesibilidad)
  '*:focus-visible': {
    outline: `2px solid ${designSystem.colors.border.focus}`,
    outlineOffset: '2px',
    borderRadius: designSystem.borders.radius.sm,
  },

  // Scrollbar styling (webkit)
  '::-webkit-scrollbar': {
    width: '12px',
    height: '12px',
  },

  '::-webkit-scrollbar-track': {
    backgroundColor: mode === 'light' ? designSystem.colors.secondary[100] : designSystem.colors.secondary[800],
  },

  '::-webkit-scrollbar-thumb': {
    backgroundColor: mode === 'light' ? designSystem.colors.secondary[300] : designSystem.colors.secondary[600],
    borderRadius: designSystem.borders.radius.full,
    border: `2px solid ${mode === 'light' ? designSystem.colors.secondary[100] : designSystem.colors.secondary[800]}`,
    
    '&:hover': {
      backgroundColor: mode === 'light' ? designSystem.colors.secondary[400] : designSystem.colors.secondary[500],
    },
  },

  // Skip link para accesibilidad
  '.skip-link': {
    position: 'absolute',
    top: '-40px',
    left: 0,
    padding: designSystem.spacing[4],
    backgroundColor: designSystem.colors.primary[600],
    color: designSystem.colors.text.inverse,
    textDecoration: 'none',
    zIndex: designSystem.zIndex.appBar + 1,
    transition: designSystem.transitions.presets.transform,
    
    '&:focus': {
      top: 0,
    },
  },

  // Links
  'a': {
    color: designSystem.colors.text.link,
    textDecoration: 'none',
    transition: designSystem.transitions.presets.color,
    
    '&:hover': {
      color: designSystem.colors.text.linkHover,
      textDecoration: 'underline',
    },
    
    '&:focus-visible': {
      outline: `2px solid ${designSystem.colors.border.focus}`,
      outlineOffset: '2px',
    },
  },

  // Headings
  'h1, h2, h3, h4, h5, h6': {
    margin: 0,
    fontWeight: typography.fontWeights.bold,
    lineHeight: typography.lineHeights.heading,
  },

  'h1': typography.textStyles.h1,
  'h2': typography.textStyles.h2,
  'h3': typography.textStyles.h3,
  'h4': typography.textStyles.h4,
  'h5': typography.textStyles.h5,
  'h6': typography.textStyles.h6,

  // Paragraphs
  'p': {
    margin: 0,
    marginBottom: designSystem.spacing[4],
    ...typography.textStyles.body,
  },

  // Lists
  'ul, ol': {
    paddingLeft: designSystem.spacing[6],
    marginBottom: designSystem.spacing[4],
  },

  'li': {
    marginBottom: designSystem.spacing[2],
  },

  // Images
  'img': {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
  },

  // Buttons reset
  'button': {
    fontFamily: 'inherit',
    cursor: 'pointer',
  },

  // Utility classes
  '.container-4k': {
    maxWidth: designSystem.container.maxWidth['4k'],
    margin: '0 auto',
  },

  '.text-truncate': typography.textUtilities.truncate,
  '.text-break': typography.textUtilities.breakWord,
});

// ============================================
// CREAR TEMA MUI
// ============================================

const createAppTheme = (mode) => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: designSystem.colors.primary[600],
        light: designSystem.colors.primary[400],
        dark: designSystem.colors.primary[800],
        contrastText: '#ffffff',
      },
      secondary: {
        main: designSystem.colors.secondary[600],
        light: designSystem.colors.secondary[400],
        dark: designSystem.colors.secondary[800],
        contrastText: '#ffffff',
      },
      error: {
        main: designSystem.colors.error[600],
        light: designSystem.colors.error[500],
        dark: designSystem.colors.error[700],
      },
      warning: {
        main: designSystem.colors.warning[600],
        light: designSystem.colors.warning[500],
        dark: designSystem.colors.warning[700],
      },
      info: {
        main: designSystem.colors.info[600],
        light: designSystem.colors.info[500],
        dark: designSystem.colors.info[700],
      },
      success: {
        main: designSystem.colors.success[600],
        light: designSystem.colors.success[500],
        dark: designSystem.colors.success[700],
      },
      background: {
        default: isDark ? designSystem.colors.surface.dark.primary : designSystem.colors.surface.primary,
        paper: isDark ? designSystem.colors.surface.dark.secondary : designSystem.colors.surface.primary,
      },
      text: {
        primary: isDark ? designSystem.colors.text.inverse : designSystem.colors.text.primary,
        secondary: isDark ? designSystem.colors.secondary[300] : designSystem.colors.text.secondary,
        disabled: designSystem.colors.text.disabled,
      },
      divider: isDark ? designSystem.colors.secondary[700] : designSystem.colors.border.main,
    },

    typography: {
      fontFamily: typography.fontFamilies.sans,
      fontSize: 16,
      fontWeightLight: typography.fontWeights.light,
      fontWeightRegular: typography.fontWeights.normal,
      fontWeightMedium: typography.fontWeights.medium,
      fontWeightBold: typography.fontWeights.bold,

      h1: typography.textStyles.h1,
      h2: typography.textStyles.h2,
      h3: typography.textStyles.h3,
      h4: typography.textStyles.h4,
      h5: typography.textStyles.h5,
      h6: typography.textStyles.h6,
      body1: typography.textStyles.body,
      body2: typography.textStyles.bodySmall,
      caption: typography.textStyles.caption,
      overline: typography.textStyles.overline,
      button: typography.textStyles.button,
    },

    shape: {
      borderRadius: parseInt(designSystem.borders.radius.md),
    },

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

    breakpoints: {
      values: designSystem.breakpoints.values,
    },

    spacing: (factor) => {
      const spacingValue = factor * 4; // Base 4px
      return `${spacingValue}px`;
    },

    transitions: {
      duration: {
        shortest: parseInt(designSystem.transitions.duration.fast),
        shorter: parseInt(designSystem.transitions.duration.fast),
        short: parseInt(designSystem.transitions.duration.normal),
        standard: parseInt(designSystem.transitions.duration.normal),
        complex: parseInt(designSystem.transitions.duration.slow),
        enteringScreen: parseInt(designSystem.transitions.duration.normal),
        leavingScreen: parseInt(designSystem.transitions.duration.fast),
      },
      easing: {
        easeInOut: designSystem.transitions.easing.smooth,
        easeOut: designSystem.transitions.easing.smoothOut,
        easeIn: designSystem.transitions.easing.smoothIn,
        sharp: designSystem.transitions.easing.ease,
      },
    },

    zIndex: {
      mobileStepper: designSystem.zIndex.base + 10,
      speedDial: designSystem.zIndex.fab,
      appBar: designSystem.zIndex.appBar,
      drawer: designSystem.zIndex.offcanvas,
      modal: designSystem.zIndex.modal,
      snackbar: designSystem.zIndex.notification,
      tooltip: designSystem.zIndex.tooltip,
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDark 
              ? `${designSystem.colors.secondary[600]} ${designSystem.colors.secondary[800]}`
              : `${designSystem.colors.secondary[300]} ${designSystem.colors.secondary[100]}`,
          },
        },
      },

      MuiButton: {
        defaultProps: {
          disableElevation: false,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: typography.fontWeights.semibold,
            borderRadius: designSystem.borders.radius.md,
            padding: `${designSystem.spacing[2]} ${designSystem.spacing[4]}`,
            minHeight: '44px', // Touch target
            transition: designSystem.transitions.presets.allNormal,
          },
          sizeLarge: {
            padding: `${designSystem.spacing[3]} ${designSystem.spacing[6]}`,
            minHeight: '48px',
          },
          sizeSmall: {
            padding: `${designSystem.spacing[1]} ${designSystem.spacing[3]}`,
            minHeight: '36px',
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            minWidth: '44px', // Touch target
            minHeight: '44px',
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: designSystem.borders.radius.lg,
            border: `1px solid ${isDark ? designSystem.colors.secondary[700] : designSystem.colors.border.main}`,
          },
        },
      },

      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: designSystem.borders.radius.md,
            },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: designSystem.borders.radius.full,
            fontWeight: typography.fontWeights.medium,
          },
        },
      },

      MuiTooltip: {
        defaultProps: {
          arrow: true,
          enterDelay: 500, // Delay para evitar hover accidental
          leaveDelay: 0,
        },
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? designSystem.colors.secondary[700] : designSystem.colors.secondary[800],
            fontSize: typography.fontSizes.sm,
            padding: `${designSystem.spacing[2]} ${designSystem.spacing[3]}`,
            borderRadius: designSystem.borders.radius.md,
          },
          arrow: {
            color: isDark ? designSystem.colors.secondary[700] : designSystem.colors.secondary[800],
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: designSystem.borders.radius.xl,
          },
          backdrop: {
            backdropFilter: 'blur(8px)',
            backgroundColor: designSystem.colors.surface.overlayDark,
          },
        },
      },
    },

    // Extensiones personalizadas
    custom: {
      designSystem,
      typography,
    },
  });
};

// ============================================
// PROVIDER COMPONENT
// ============================================

export const AppThemeProvider = ({ children }) => {
  // Obtener modo guardado de localStorage o usar 'light' por defecto
  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('theme-mode');
      if (savedMode) {
        return savedMode;
      }
      
      // Detectar preferencia del sistema
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  // Persistir cambios en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-mode', mode);
      
      // Agregar clase al body para estilos CSS adicionales
      document.body.classList.remove('light-mode', 'dark-mode');
      document.body.classList.add(`${mode}-mode`);
    }
  }, [mode]);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        // Solo cambiar si no hay preferencia guardada
        if (!localStorage.getItem('theme-mode')) {
          setMode(e.matches ? 'dark' : 'light');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const contextValue = useMemo(
    () => ({
      mode,
      toggleTheme,
      theme,
      isDark: mode === 'dark',
      designSystem,
      typography,
    }),
    [mode, theme]
  );

  return (
    <AppThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles styles={globalStyles(mode)} />
        {children}
      </MuiThemeProvider>
    </AppThemeContext.Provider>
  );
};

export default AppThemeProvider;
