import { createTheme } from '@mui/material/styles';

// Paleta de colores personalizada para MDR Construcciones
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      xxl: 1800, // Nuevo breakpoint para pantallas ultra anchas
    },
  },
  palette: {
    primary: {
      main: '#0B6BCB',
      dark: '#0A4A75',
      light: '#4A9FE7',
      contrastText: '#FFFFFF',
      gradient: 'linear-gradient(145deg, #0B6BCB 0%, #4A9FE7 100%)',
    },
    secondary: {
      main: '#0A4A75',
      dark: '#07334F',
      light: '#3E73A1',
      contrastText: '#FFFFFF',
      gradient: 'linear-gradient(145deg, #0A4A75 0%, #3E73A1 100%)',
    },
    accent: {
      main: '#F5A524',
      dark: '#D4891E',
      light: '#F7B850',
      contrastText: '#000000',
      gradient: 'linear-gradient(145deg, #F5A524 0%, #F7B850 100%)',
    },
    warning: {
      main: '#F5A524',
      dark: '#D4891E',
      light: '#F7B850',
      contrastText: '#000000',
      gradient: 'linear-gradient(145deg, #F5A524 0%, #F7B850 100%)',
    },

    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: { xs: '3rem', md: '4.5rem', xl: '5.5rem' },
      fontWeight: 900,
      lineHeight: { xs: 1.1, md: 1.2 },
      color: '#1A1A1A',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: { xs: '2.2rem', md: '3rem', xl: '3.8rem' },
      fontWeight: 900,
      lineHeight: { xs: 1.1, md: 1.2 },
      color: '#1A1A1A',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#1A1A1A',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#1A1A1A',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#1A1A1A',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#1A1A1A',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#1A1A1A',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#6B7280',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 4, // Unificado para cards
  },
  transitions: {
    duration: {
      standard: 300,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 3, // Unificado para buttons
          paddingTop: 12,
          paddingBottom: 12,
          paddingLeft: 24,
          paddingRight: 24,
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #0B6BCB 30%, #4A9FE7 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #0A4A75 30%, #0B6BCB 90%)',
          },
        },
        containedWarning: {
          background: 'linear-gradient(45deg, #F5A524 30%, #F7B850 90%)',
          color: '#000000',
          '&:hover': {
            background: 'linear-gradient(45deg, #D4891E 30%, #F5A524 90%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4, // Unificado
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            transform: 'scale(1.02) rotateY(2deg) translateY(-2px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1A1A1A',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

export default theme;