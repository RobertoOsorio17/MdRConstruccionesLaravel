// ✅ FIX: Extract theme object to separate file to reduce component bloat
// Premium design system with advanced color palette

const BLOG_THEME = {
  // Primary palette with multiple shades
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

  // Secondary palette
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
    900: '#0f172a'
  },

  // Accent colors
  accent: {
    orange: '#f97316',
    emerald: '#10b981',
    purple: '#8b5cf6',
    rose: '#f43f5e',
    amber: '#f59e0b'
  },

  // Semantic colors
  semantic: {
    success: {
      light: '#d1fae5',
      main: '#10b981',
      dark: '#047857',
      contrast: '#ffffff'
    },
    warning: {
      light: '#fef3c7',
      main: '#f59e0b',
      dark: '#d97706',
      contrast: '#ffffff'
    },
    error: {
      light: '#fee2e2',
      main: '#ef4444',
      dark: '#dc2626',
      contrast: '#ffffff'
    },
    info: {
      light: '#dbeafe',
      main: '#3b82f6',
      dark: '#1d4ed8',
      contrast: '#ffffff'
    }
  },

  // Surface colors for depth
  surface: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    elevated: '#ffffff',
    overlay: 'rgba(255, 255, 255, 0.95)'
  },

  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    dark: '#0f172a'
  },

  // Text colors with improved hierarchy
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#64748b',
    muted: '#94a3b8',
    disabled: '#cbd5e1',
    inverse: '#ffffff'
  },

  // Border colors
  border: {
    light: '#f1f5f9',
    main: '#e2e8f0',
    strong: '#cbd5e1',
    focus: '#3b82f6'
  },

  // Premium gradients
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    hero: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)',
    card: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
    accent: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warm: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    cool: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    dark: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    glass: 'linear-gradient(145deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)'
  },

  // Shadow system
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    colored: {
      primary: '0 20px 40px rgba(59, 130, 246, 0.15)',
      accent: '0 20px 40px rgba(249, 115, 22, 0.15)',
      success: '0 20px 40px rgba(16, 185, 129, 0.15)'
    }
  },

  // Typography system
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      serif: ['Playfair Display', 'Georgia', 'serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace']
    },

    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
      '7xl': '4.5rem',   // 72px
      '8xl': '6rem',     // 96px
      '9xl': '8rem'      // 128px
    },

    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    },

    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    },

    // ✅ FIX: Add typography styles for headings and body text
    styles: {
      h1: {
        fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(', '),
        fontWeight: 800,
        fontSize: '3rem',
        lineHeight: 1.25,
        letterSpacing: '-0.025em'
      },
      h2: {
        fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(', '),
        fontWeight: 700,
        fontSize: '2.25rem',
        lineHeight: 1.25,
        letterSpacing: '-0.025em'
      },
      h3: {
        fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(', '),
        fontWeight: 700,
        fontSize: '1.875rem',
        lineHeight: 1.375,
        letterSpacing: '-0.025em'
      },
      h4: {
        fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(', '),
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.5,
        letterSpacing: '0em'
      },
      h5: {
        fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(', '),
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.5,
        letterSpacing: '0em'
      },
      h6: {
        fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(', '),
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: 1.5,
        letterSpacing: '0em'
      },
      body1: {
        fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(', '),
        fontWeight: 400,
        fontSize: '1rem',
        lineHeight: 1.5,
        letterSpacing: '0em'
      },
      body2: {
        fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(', '),
        fontWeight: 400,
        fontSize: '0.875rem',
        lineHeight: 1.625,
        letterSpacing: '0em'
      }
    }
  },

  // Spacing system (8px base)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
    40: '10rem',    // 160px
    48: '12rem',    // 192px
    56: '14rem',    // 224px
    64: '16rem'     // 256px
  },

  // Border radius system
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },

  // Transition system
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // Z-index system
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600
  },

  // Breakpoints
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '900px',
    lg: '1200px',
    xl: '1536px'
  }
};

export default BLOG_THEME;

