/**
 * Typography System - Sistema tipográfico responsive
 * 
 * Define la jerarquía tipográfica completa con:
 * - Scales responsive usando clamp()
 * - Line heights optimizados
 * - Font weights
 * - Letter spacing
 * 
 * Uso: import { typography } from '@/theme/typography';
 */

// ============================================
// FONT FAMILIES
// ============================================

export const fontFamilies = {
  sans: [
    'Figtree',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"'
  ].join(','),

  mono: [
    '"JetBrains Mono"',
    '"Fira Code"',
    'Consolas',
    '"Courier New"',
    'monospace'
  ].join(','),

  display: [
    'Figtree',
    '-apple-system',
    'BlinkMacSystemFont',
    'sans-serif'
  ].join(',')
};

// ============================================
// FONT WEIGHTS
// ============================================

export const fontWeights = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900
};

// ============================================
// FONT SIZES - RESPONSIVE CON CLAMP()
// ============================================

/**
 * clamp(min, preferred, max)
 * - min: tamaño mínimo en móvil
 * - preferred: tamaño escalable basado en viewport
 * - max: tamaño máximo en desktop
 */

export const fontSizes = {
  // Display - Para títulos hero grandes
  displayLarge: 'clamp(3rem, 8vw, 5rem)',        // 48px → 80px
  displayMedium: 'clamp(2.5rem, 6vw, 4rem)',     // 40px → 64px
  displaySmall: 'clamp(2rem, 5vw, 3.5rem)',      // 32px → 56px

  // Headings - Jerarquía principal
  h1: 'clamp(2rem, 5vw, 3.5rem)',                // 32px → 56px
  h2: 'clamp(1.75rem, 4vw, 3rem)',               // 28px → 48px
  h3: 'clamp(1.5rem, 3.5vw, 2.5rem)',            // 24px → 40px
  h4: 'clamp(1.25rem, 3vw, 2rem)',               // 20px → 32px
  h5: 'clamp(1.125rem, 2.5vw, 1.5rem)',          // 18px → 24px
  h6: 'clamp(1rem, 2vw, 1.25rem)',               // 16px → 20px

  // Body text
  xl: '1.25rem',      // 20px
  lg: '1.125rem',     // 18px
  base: '1rem',       // 16px
  sm: '0.875rem',     // 14px
  xs: '0.75rem',      // 12px
  xxs: '0.6875rem',   // 11px

  // Special
  caption: '0.75rem',
  overline: '0.75rem',
  button: '0.875rem'
};

// ============================================
// LINE HEIGHTS
// ============================================

export const lineHeights = {
  // Display & Headings - Más ajustado
  tight: 1.2,
  snug: 1.375,

  // Body text - Cómodo para lectura
  normal: 1.5,
  relaxed: 1.625,
  loose: 1.75,

  // Special cases
  none: 1,
  heading: 1.2,
  body: 1.5,
  longForm: 1.7
};

// ============================================
// LETTER SPACING
// ============================================

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em'
};

// ============================================
// TEXT STYLES - COMBINACIONES PREDEFINIDAS
// ============================================

export const textStyles = {
  // Display styles
  displayLarge: {
    fontSize: fontSizes.displayLarge,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight
  },

  displayMedium: {
    fontSize: fontSizes.displayMedium,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight
  },

  displaySmall: {
    fontSize: fontSizes.displaySmall,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacing.normal
  },

  // Heading styles
  h1: {
    fontSize: fontSizes.h1,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight
  },

  h2: {
    fontSize: fontSizes.h2,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight
  },

  h3: {
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacing.normal
  },

  h4: {
    fontSize: fontSizes.h4,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacing.normal
  },

  h5: {
    fontSize: fontSizes.h5,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal
  },

  h6: {
    fontSize: fontSizes.h6,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.wide
  },

  // Body styles
  bodyLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacing.normal
  },

  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal
  },

  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal
  },

  // Special styles
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.wide
  },

  overline: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase'
  },

  button: {
    fontSize: fontSizes.button,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.wide
  },

  // Long-form content (articles, blog posts)
  longForm: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.longForm,
    letterSpacing: letterSpacing.normal,
    maxWidth: '65ch' // Optimal reading width
  },

  // Links
  link: {
    fontSize: 'inherit',
    fontWeight: fontWeights.medium,
    textDecoration: 'none',
    color: 'inherit',
    transition: 'color 0.2s ease'
  }
};

// ============================================
// UTILITY CLASSES
// ============================================

export const textUtilities = {
  // Truncate
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  // Multi-line truncate
  truncateLines: (lines = 2) => ({
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }),

  // No wrap
  noWrap: {
    whiteSpace: 'nowrap'
  },

  // Break word
  breakWord: {
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    wordBreak: 'break-word',
    hyphens: 'auto'
  },

  // Text align
  alignLeft: {
    textAlign: 'left'
  },

  alignCenter: {
    textAlign: 'center'
  },

  alignRight: {
    textAlign: 'right'
  },

  alignJustify: {
    textAlign: 'justify'
  },

  // Vertical align
  verticalTop: {
    verticalAlign: 'top'
  },

  verticalMiddle: {
    verticalAlign: 'middle'
  },

  verticalBottom: {
    verticalAlign: 'bottom'
  }
};

// ============================================
// FONT LOADING OPTIMIZATION
// ============================================

export const fontOptimization = {
  // Font display strategies
  display: {
    auto: 'auto',
    block: 'block',
    swap: 'swap',        // Recommended: show fallback immediately
    fallback: 'fallback',
    optional: 'optional'
  },

  // Preload important fonts
  preloadFonts: [
    {
      href: '/fonts/figtree-variable.woff2',
      type: 'font/woff2',
      crossOrigin: 'anonymous'
    }
  ]
};

// ============================================
// RESPONSIVE HELPERS
// ============================================

export const responsiveText = {
  // Mobile-first approach
  mobile: {
    h1: fontSizes.h1,
    h2: fontSizes.h2,
    h3: fontSizes.h3,
    body: fontSizes.base,
    small: fontSizes.sm
  },

  // Tablet adjustments
  tablet: {
    h1: fontSizes.h1,
    h2: fontSizes.h2,
    h3: fontSizes.h3,
    body: fontSizes.base,
    small: fontSizes.sm
  },

  // Desktop adjustments
  desktop: {
    h1: fontSizes.h1,
    h2: fontSizes.h2,
    h3: fontSizes.h3,
    body: fontSizes.lg,
    small: fontSizes.base
  }
};

// ============================================
// EXPORT DEFAULT
// ============================================

const typography = {
  fontFamilies,
  fontWeights,
  fontSizes,
  lineHeights,
  letterSpacing,
  textStyles,
  textUtilities,
  fontOptimization,
  responsiveText
};

export default typography;
