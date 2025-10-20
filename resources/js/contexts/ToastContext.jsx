/**
 * Toast Context - Sistema de notificaciones global
 * 
 * Proporciona un contexto y hook para mostrar notificaciones toast
 * en cualquier parte de la aplicación.
 * 
 * Características:
 * - 4 tipos: success, error, warning, info
 * - Auto-dismiss configurable
 * - Posiciones configurables
 * - Animaciones suaves
 * - Stack de múltiples toasts
 * - Acciones personalizadas
 * 
 * Uso:
 * ```jsx
 * import { useToast } from '@/contexts/ToastContext';
 * 
 * function MyComponent() {
 *   const { showToast } = useToast();
 *   
 *   const handleClick = () => {
 *     showToast({
 *       type: 'success',
 *       message: '¡Operación exitosa!',
 *       duration: 3000
 *     });
 *   };
 *   
 *   return <button onClick={handleClick}>Show Toast</button>;
 * }
 * ```
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Create context
const ToastContext = createContext(undefined);

// Toast positions
export const TOAST_POSITIONS = {
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
  BOTTOM_RIGHT: 'bottom-right'
};

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Default configuration
const DEFAULT_CONFIG = {
  duration: 4000,
  position: TOAST_POSITIONS.TOP_RIGHT,
  maxToasts: 5
};

/**
 * Toast Provider Component
 */
export const ToastProvider = ({ children, config = {} }) => {
  const [toasts, setToasts] = useState([]);
  
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  /**
   * Show a toast notification
   */
  const showToast = useCallback(({
    type = TOAST_TYPES.INFO,
    message,
    title,
    duration = mergedConfig.duration,
    position = mergedConfig.position,
    action,
    onClose
  }) => {
    const id = uuidv4();
    
    const toast = {
      id,
      type,
      message,
      title,
      duration,
      position,
      action,
      onClose,
      createdAt: Date.now()
    };
    
    setToasts(prev => {
      // Limit number of toasts
      const newToasts = [...prev, toast];
      if (newToasts.length > mergedConfig.maxToasts) {
        return newToasts.slice(-mergedConfig.maxToasts);
      }
      return newToasts;
    });
    
    // Auto dismiss if duration is set
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
    
    return id;
  }, [mergedConfig]);
  
  /**
   * Dismiss a specific toast
   */
  const dismissToast = useCallback((id) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      if (toast?.onClose) {
        toast.onClose();
      }
      return prev.filter(t => t.id !== id);
    });
  }, []);
  
  /**
   * Dismiss all toasts
   */
  const dismissAll = useCallback(() => {
    toasts.forEach(toast => {
      if (toast.onClose) {
        toast.onClose();
      }
    });
    setToasts([]);
  }, [toasts]);
  
  /**
   * Convenience methods for different toast types
   */
  const success = useCallback((message, options = {}) => {
    return showToast({
      type: TOAST_TYPES.SUCCESS,
      message,
      ...options
    });
  }, [showToast]);
  
  const error = useCallback((message, options = {}) => {
    return showToast({
      type: TOAST_TYPES.ERROR,
      message,
      duration: 5000, // Errors stay longer
      ...options
    });
  }, [showToast]);
  
  const warning = useCallback((message, options = {}) => {
    return showToast({
      type: TOAST_TYPES.WARNING,
      message,
      ...options
    });
  }, [showToast]);
  
  const info = useCallback((message, options = {}) => {
    return showToast({
      type: TOAST_TYPES.INFO,
      message,
      ...options
    });
  }, [showToast]);
  
  const value = {
    toasts,
    showToast,
    dismissToast,
    dismissAll,
    success,
    error,
    warning,
    info
  };
  
  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

/**
 * Hook to use toast notifications
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

export default ToastContext;

