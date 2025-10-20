/**
 * Button Component - Sistema de botones unificado
 * 
 * Componente de botón reutilizable con variantes, tamaños y estados consistentes.
 * Basado en los design tokens del sistema de diseño.
 * 
 * Características:
 * - 6 variantes: primary, secondary, tertiary, ghost, danger, success
 * - 5 tamaños: xs, sm, md, lg, xl
 * - Estados: normal, hover, active, disabled, loading
 * - Soporte para iconos (startIcon, endIcon)
 * - Soporte para fullWidth
 * - Integración con Inertia.js (href prop)
 * - Respeta prefers-reduced-motion
 * 
 * Uso:
 * ```jsx
 * import Button from '@/Components/UI/Button';
 * 
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 * 
 * <Button variant="secondary" startIcon={<Icon />} href="/page">
 *   Navigate
 * </Button>
 * 
 * <Button variant="tertiary" loading>
 *   Loading...
 * </Button>
 * ```
 */

import React from 'react';
import { Link } from '@inertiajs/react';
import { CircularProgress } from '@mui/material';
import { buttonTokens, transitions } from '@/theme/designSystem';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const Button = ({
  // Content
  children,
  startIcon,
  endIcon,
  
  // Variants & Size
  variant = 'primary',
  size = 'md',
  
  // States
  disabled = false,
  loading = false,
  
  // Layout
  fullWidth = false,
  
  // Navigation (Inertia.js)
  href,
  
  // Events
  onClick,
  onMouseEnter,
  onMouseLeave,
  
  // HTML attributes
  type = 'button',
  className = '',
  style = {},
  
  // Accessibility
  'aria-label': ariaLabel,
  'aria-disabled': ariaDisabled,
  
  ...rest
}) => {
  const { prefersReducedMotion, getDuration } = useReducedMotion();
  
  // Get tokens for current size and variant
  const sizeTokens = buttonTokens.size[size];
  const variantTokens = buttonTokens.variant[variant];
  
  // Determine if button is disabled
  const isDisabled = disabled || loading;
  
  // Base styles
  const baseStyles = {
    // Layout
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: fullWidth ? '100%' : 'auto',
    
    // Size
    height: sizeTokens.height,
    padding: sizeTokens.padding,
    
    // Typography
    fontSize: sizeTokens.fontSize,
    fontWeight: 600,
    fontFamily: 'inherit',
    textAlign: 'center',
    textDecoration: 'none',
    textTransform: 'none',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    
    // Appearance
    background: variantTokens.background,
    color: variantTokens.color,
    border: variantTokens.border,
    borderRadius: '8px',
    boxShadow: variantTokens.shadow,
    
    // Cursor
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    
    // Transitions
    transition: prefersReducedMotion 
      ? 'none'
      : `all ${getDuration(0.2)}s cubic-bezier(0.4, 0, 0.2, 1)`,
    
    // Remove default button styles
    outline: 'none',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    
    // Disabled state
    ...(isDisabled && {
      opacity: buttonTokens.state.disabled.opacity,
      pointerEvents: buttonTokens.state.disabled.pointerEvents
    }),
    
    // Loading state
    ...(loading && {
      opacity: buttonTokens.state.loading.opacity,
      cursor: buttonTokens.state.loading.cursor
    })
  };
  
  // Hover styles (only if not disabled)
  const hoverStyles = !isDisabled ? {
    ':hover': {
      background: variantTokens.hoverBackground || variantTokens.background,
      color: variantTokens.hoverColor || variantTokens.color,
      boxShadow: variantTokens.hoverShadow || variantTokens.shadow,
      transform: prefersReducedMotion ? 'none' : variantTokens.hoverTransform
    },
    ':active': {
      transform: prefersReducedMotion ? 'none' : 'scale(0.98)'
    },
    ':focus-visible': {
      outline: '2px solid',
      outlineColor: variantTokens.color,
      outlineOffset: '2px'
    }
  } : {};
  
  // Icon size based on button size
  const iconSize = sizeTokens.iconSize;
  
  // Render icon with proper size
  const renderIcon = (icon) => {
    if (!icon) return null;
    
    return React.cloneElement(icon, {
      style: {
        width: iconSize,
        height: iconSize,
        fontSize: iconSize,
        ...icon.props.style
      }
    });
  };
  
  // Combined styles
  const combinedStyles = {
    ...baseStyles,
    ...hoverStyles,
    ...style
  };
  
  // Button content
  const buttonContent = (
    <>
      {loading && (
        <CircularProgress
          size={iconSize}
          sx={{
            color: 'currentColor'
          }}
        />
      )}
      {!loading && startIcon && renderIcon(startIcon)}
      {children}
      {!loading && endIcon && renderIcon(endIcon)}
    </>
  );
  
  // If href is provided, render as Link (Inertia.js)
  if (href && !isDisabled) {
    return (
      <Link
        href={href}
        className={className}
        style={combinedStyles}
        aria-label={ariaLabel}
        aria-disabled={ariaDisabled || isDisabled}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        {...rest}
      >
        {buttonContent}
      </Link>
    );
  }
  
  // Otherwise, render as button
  return (
    <button
      type={type}
      className={className}
      style={combinedStyles}
      disabled={isDisabled}
      onClick={!isDisabled ? onClick : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={ariaLabel}
      aria-disabled={ariaDisabled || isDisabled}
      {...rest}
    >
      {buttonContent}
    </button>
  );
};

// Export variants as constants for easy reference
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  TERTIARY: 'tertiary',
  GHOST: 'ghost',
  DANGER: 'danger',
  SUCCESS: 'success'
};

export const BUTTON_SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl'
};

export default Button;

