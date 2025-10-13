/**
 * useDeviceBreakpoints Hook
 * 
 * Hook personalizado para manejar lógica responsive basada en los breakpoints
 * del design system.
 * 
 * Uso:
 * const { isMobile, isTablet, isDesktop, isDesktopXL, breakpoint } = useDeviceBreakpoints();
 */

import { useState, useEffect } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import designSystem from '@/theme/designSystem';

/**
 * Hook para detectar breakpoints del dispositivo
 * @returns {object} Estado de breakpoints y utilidades
 */
export const useDeviceBreakpoints = () => {
    const theme = useTheme();

    // Breakpoints basados en MUI theme
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600-960px
    const isDesktop = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 960-1280px
    const isDesktopXL = useMediaQuery(theme.breakpoints.up('lg')); // >= 1280px

    // Breakpoint actual como string
    const getBreakpoint = () => {
        if (isMobile) return 'mobile';
        if (isTablet) return 'tablet';
        if (isDesktop) return 'desktop';
        if (isDesktopXL) return 'desktopXL';
        return 'unknown';
    };

    const [breakpoint, setBreakpoint] = useState(getBreakpoint());

    useEffect(() => {
        setBreakpoint(getBreakpoint());
    }, [isMobile, isTablet, isDesktop, isDesktopXL]);

    // Utilidades adicionales
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = isMobile || isTablet;
    const isLargeScreen = isDesktop || isDesktopXL;

    return {
        isMobile,
        isTablet,
        isDesktop,
        isDesktopXL,
        breakpoint,
        isTouchDevice,
        isSmallScreen,
        isLargeScreen
    };
};

/**
 * Hook para obtener el ancho de la ventana
 * @returns {object} { width, height }
 */
export const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Llamar inmediatamente

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
};

/**
 * Hook para detectar orientación del dispositivo
 * @returns {string} 'portrait' | 'landscape'
 */
export const useOrientation = () => {
    const [orientation, setOrientation] = useState(
        typeof window !== 'undefined' && window.innerWidth > window.innerHeight
            ? 'landscape'
            : 'portrait'
    );

    useEffect(() => {
        const handleOrientationChange = () => {
            setOrientation(
                window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
            );
        };

        window.addEventListener('resize', handleOrientationChange);
        
        return () => {
            window.removeEventListener('resize', handleOrientationChange);
        };
    }, []);

    return orientation;
};

/**
 * Hook para obtener valores responsive basados en breakpoint
 * @param {object} values - Valores por breakpoint { mobile, tablet, desktop, desktopXL }
 * @returns {any} Valor correspondiente al breakpoint actual
 */
export const useResponsiveValue = (values) => {
    const { isMobile, isTablet, isDesktop, isDesktopXL } = useDeviceBreakpoints();

    if (isDesktopXL && values.desktopXL !== undefined) {
        return values.desktopXL;
    }
    if (isDesktop && values.desktop !== undefined) {
        return values.desktop;
    }
    if (isTablet && values.tablet !== undefined) {
        return values.tablet;
    }
    if (isMobile && values.mobile !== undefined) {
        return values.mobile;
    }

    // Fallback: retornar el primer valor disponible
    return values.desktopXL || values.desktop || values.tablet || values.mobile;
};

/**
 * Hook para detectar si el usuario prefiere reducir animaciones
 * @returns {boolean}
 */
export const usePrefersReducedMotion = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    return prefersReducedMotion;
};

/**
 * Hook para detectar modo oscuro del sistema
 * @returns {boolean}
 */
export const usePrefersDarkMode = () => {
    const [prefersDarkMode, setPrefersDarkMode] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setPrefersDarkMode(mediaQuery.matches);

        const handleChange = (e) => {
            setPrefersDarkMode(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    return prefersDarkMode;
};

/**
 * Hook para obtener el spacing responsive del design system
 * @param {object} spacing - Spacing por breakpoint { mobile: 4, tablet: 6, desktop: 8 }
 * @returns {string} Valor de spacing en px
 */
export const useResponsiveSpacing = (spacing) => {
    const { isMobile, isTablet, isDesktop, isDesktopXL } = useDeviceBreakpoints();

    let spacingKey;
    if (isDesktopXL && spacing.desktopXL !== undefined) {
        spacingKey = spacing.desktopXL;
    } else if (isDesktop && spacing.desktop !== undefined) {
        spacingKey = spacing.desktop;
    } else if (isTablet && spacing.tablet !== undefined) {
        spacingKey = spacing.tablet;
    } else if (isMobile && spacing.mobile !== undefined) {
        spacingKey = spacing.mobile;
    } else {
        spacingKey = spacing.desktop || spacing.tablet || spacing.mobile || 4;
    }

    return designSystem.spacing[spacingKey] || designSystem.spacing[4];
};

/**
 * Hook para detectar dirección del scroll
 *
 * @returns {object} { scrollDirection: 'up' | 'down' | null, scrollY: number }
 */
export const useScrollDirection = () => {
    const [scrollDirection, setScrollDirection] = useState(null);
    const [scrollY, setScrollY] = useState(0);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setScrollDirection('down');
            } else if (currentScrollY < lastScrollY) {
                setScrollDirection('up');
            }

            setScrollY(currentScrollY);
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return { scrollDirection, scrollY };
};

export default useDeviceBreakpoints;
