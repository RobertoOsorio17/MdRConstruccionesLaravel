/**
 * useReducedMotion Hook
 * 
 * Hook personalizado para detectar la preferencia del usuario por movimiento reducido
 * (prefers-reduced-motion) y proporcionar configuraciones de animación adaptativas.
 * 
 * Características:
 * - Detecta prefers-reduced-motion del sistema
 * - Proporciona variantes de animación reducidas
 * - Se actualiza dinámicamente si el usuario cambia la preferencia
 * - Compatible con framer-motion y CSS animations
 * 
 * Uso:
 * ```jsx
 * import { useReducedMotion } from '@/hooks/useReducedMotion';
 * 
 * function MyComponent() {
 *   const { prefersReducedMotion, getTransition, getVariants } = useReducedMotion();
 *   
 *   return (
 *     <motion.div
 *       variants={getVariants('fadeIn')}
 *       transition={getTransition()}
 *     >
 *       Content
 *     </motion.div>
 *   );
 * }
 * ```
 */

import { useState, useEffect } from 'react';

/**
 * Hook principal para detectar prefers-reduced-motion
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Detectar preferencia inicial
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listener para cambios dinámicos
    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    // Agregar listener (compatible con navegadores antiguos)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  /**
   * Obtiene configuración de transición adaptativa
   * @param {Object} options - Opciones de transición personalizadas
   * @returns {Object} Configuración de transición para framer-motion
   */
  const getTransition = (options = {}) => {
    if (prefersReducedMotion) {
      return {
        duration: 0.01, // Casi instantáneo
        ease: 'linear',
        ...options
      };
    }

    return {
      duration: options.duration || 0.3,
      ease: options.ease || [0.4, 0, 0.2, 1], // cubic-bezier ease-out
      ...options
    };
  };

  /**
   * Obtiene variantes de animación adaptativas
   * @param {string} type - Tipo de animación ('fadeIn', 'slideUp', 'scale', etc.)
   * @param {Object} customVariants - Variantes personalizadas
   * @returns {Object} Variantes para framer-motion
   */
  const getVariants = (type = 'fadeIn', customVariants = {}) => {
    if (prefersReducedMotion) {
      // Sin animaciones, solo cambios de opacidad mínimos
      return {
        hidden: { opacity: 0.8 },
        visible: { opacity: 1 },
        ...customVariants
      };
    }

    // Variantes predefinidas
    const variants = {
      fadeIn: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
      },
      slideUp: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      },
      slideDown: {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0 }
      },
      slideLeft: {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 }
      },
      slideRight: {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      },
      scale: {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 }
      },
      scaleUp: {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 }
      },
      rotate: {
        hidden: { opacity: 0, rotate: -10 },
        visible: { opacity: 1, rotate: 0 }
      }
    };

    return variants[type] || variants.fadeIn;
  };

  /**
   * Obtiene props de hover adaptativas
   * @param {Object} hoverProps - Props de hover personalizadas
   * @returns {Object} Props para whileHover de framer-motion
   */
  const getHoverProps = (hoverProps = {}) => {
    if (prefersReducedMotion) {
      // Solo cambios sutiles sin transformaciones
      return {
        opacity: 0.9,
        ...hoverProps
      };
    }

    return {
      scale: 1.05,
      y: -4,
      ...hoverProps
    };
  };

  /**
   * Obtiene duración de animación adaptativa
   * @param {number} duration - Duración en segundos
   * @returns {number} Duración ajustada
   */
  const getDuration = (duration = 0.3) => {
    return prefersReducedMotion ? 0.01 : duration;
  };

  /**
   * Obtiene configuración de spring adaptativa
   * @param {Object} springConfig - Configuración de spring
   * @returns {Object} Configuración ajustada
   */
  const getSpring = (springConfig = {}) => {
    if (prefersReducedMotion) {
      return {
        type: 'tween',
        duration: 0.01,
        ...springConfig
      };
    }

    return {
      type: 'spring',
      stiffness: springConfig.stiffness || 300,
      damping: springConfig.damping || 25,
      ...springConfig
    };
  };

  /**
   * Obtiene configuración de stagger adaptativa
   * @param {number} staggerDelay - Delay entre elementos
   * @returns {Object} Configuración de stagger
   */
  const getStagger = (staggerDelay = 0.1) => {
    if (prefersReducedMotion) {
      return {
        staggerChildren: 0,
        delayChildren: 0
      };
    }

    return {
      staggerChildren: staggerDelay,
      delayChildren: 0.1
    };
  };

  return {
    prefersReducedMotion,
    getTransition,
    getVariants,
    getHoverProps,
    getDuration,
    getSpring,
    getStagger
  };
};

/**
 * Hook simplificado que solo retorna el boolean
 */
export const usePreferReducedMotion = () => {
  const { prefersReducedMotion } = useReducedMotion();
  return prefersReducedMotion;
};

export default useReducedMotion;

