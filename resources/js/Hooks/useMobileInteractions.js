import { useState, useCallback, useRef, useEffect } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

/**
 * Custom hook for handling mobile interactions and gestures
 * Provides touch-optimized interactions for blog components
 */
export const useMobileInteractions = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const [touchState, setTouchState] = useState({
        isPressed: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        deltaX: 0,
        deltaY: 0,
    });

    // Haptic feedback simulation
    const triggerHapticFeedback = useCallback((type = 'light') => {
        if (!navigator.vibrate) return;
        
        const patterns = {
            light: 10,
            medium: 20,
            heavy: 50,
            success: [10, 50, 10],
            error: [50, 100, 50],
        };
        
        navigator.vibrate(patterns[type] || patterns.light);
    }, []);

    // Touch gesture detection
    const detectSwipeGesture = useCallback((deltaX, deltaY, threshold = 50) => {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        // Horizontal swipe
        if (absX > absY && absX > threshold) {
            return deltaX > 0 ? 'swipe-right' : 'swipe-left';
        }
        
        // Vertical swipe
        if (absY > absX && absY > threshold) {
            return deltaY > 0 ? 'swipe-down' : 'swipe-up';
        }
        
        return null;
    }, []);

    // Touch handlers
    const handleTouchStart = useCallback((event) => {
        const touch = event.touches[0];
        setTouchState(prev => ({
            ...prev,
            isPressed: true,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY,
            deltaX: 0,
            deltaY: 0,
        }));
    }, []);

    const handleTouchMove = useCallback((event) => {
        if (!touchState.isPressed) return;
        
        const touch = event.touches[0];
        const deltaX = touch.clientX - touchState.startX;
        const deltaY = touch.clientY - touchState.startY;
        
        setTouchState(prev => ({
            ...prev,
            currentX: touch.clientX,
            currentY: touch.clientY,
            deltaX,
            deltaY,
        }));
    }, [touchState.isPressed, touchState.startX, touchState.startY]);

    const handleTouchEnd = useCallback((onGesture) => {
        if (!touchState.isPressed) return;
        
        const gesture = detectSwipeGesture(touchState.deltaX, touchState.deltaY);
        
        if (gesture && onGesture) {
            onGesture(gesture, {
                deltaX: touchState.deltaX,
                deltaY: touchState.deltaY,
                startX: touchState.startX,
                startY: touchState.startY,
            });
        }
        
        setTouchState(prev => ({
            ...prev,
            isPressed: false,
            deltaX: 0,
            deltaY: 0,
        }));
    }, [touchState, detectSwipeGesture]);

    return {
        isMobile,
        isTablet,
        touchState,
        triggerHapticFeedback,
        detectSwipeGesture,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
    };
};

/**
 * Hook for managing mobile-optimized animations
 */
export const useMobileAnimations = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    
    // Animation variants optimized for mobile
    const mobileVariants = {
        card: {
            initial: { opacity: 0, y: 20, scale: 0.95 },
            animate: { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: {
                    duration: prefersReducedMotion ? 0.1 : 0.4,
                    ease: [0.4, 0, 0.2, 1]
                }
            },
            exit: { 
                opacity: 0, 
                y: -20, 
                scale: 0.95,
                transition: {
                    duration: prefersReducedMotion ? 0.1 : 0.3
                }
            },
            hover: isMobile ? {} : { 
                y: -4, 
                scale: 1.02,
                transition: { duration: 0.2 }
            },
            tap: { 
                scale: 0.98,
                transition: { duration: 0.1 }
            }
        },
        
        button: {
            initial: { scale: 1 },
            tap: { 
                scale: 0.95,
                transition: { duration: 0.1 }
            },
            hover: isMobile ? {} : { 
                scale: 1.05,
                transition: { duration: 0.2 }
            }
        },
        
        modal: {
            initial: { opacity: 0, scale: 0.9, y: 50 },
            animate: { 
                opacity: 1, 
                scale: 1, 
                y: 0,
                transition: {
                    duration: prefersReducedMotion ? 0.1 : 0.3,
                    ease: [0.4, 0, 0.2, 1]
                }
            },
            exit: { 
                opacity: 0, 
                scale: 0.9, 
                y: 50,
                transition: {
                    duration: prefersReducedMotion ? 0.1 : 0.2
                }
            }
        },
        
        slideUp: {
            initial: { y: '100%', opacity: 0 },
            animate: { 
                y: 0, 
                opacity: 1,
                transition: {
                    duration: prefersReducedMotion ? 0.1 : 0.4,
                    ease: [0.4, 0, 0.2, 1]
                }
            },
            exit: { 
                y: '100%', 
                opacity: 0,
                transition: {
                    duration: prefersReducedMotion ? 0.1 : 0.3
                }
            }
        }
    };

    return {
        isMobile,
        prefersReducedMotion,
        variants: mobileVariants,
        // Optimized spring configs for mobile
        springConfig: {
            type: "spring",
            stiffness: prefersReducedMotion ? 500 : 300,
            damping: prefersReducedMotion ? 50 : 30,
            mass: 1
        }
    };
};

/**
 * Hook for managing mobile-specific performance optimizations
 */
export const useMobilePerformance = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isLowPowerMode, setIsLowPowerMode] = useState(false);
    
    // Detect low power mode or slow device
    useEffect(() => {
        // Check for battery API
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                setIsLowPowerMode(battery.level < 0.2);
                
                battery.addEventListener('levelchange', () => {
                    setIsLowPowerMode(battery.level < 0.2);
                });
            });
        }
        
        // Check for slow connection
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const isSlowConnection = connection.effectiveType === 'slow-2g' || 
                                   connection.effectiveType === '2g' ||
                                   connection.saveData;
            
            if (isSlowConnection) {
                setIsLowPowerMode(true);
            }
        }
    }, []);

    // Performance-optimized settings
    const performanceSettings = {
        // Reduce animations on low power
        enableAnimations: !isLowPowerMode,
        
        // Lazy loading settings
        lazyLoadingMargin: isMobile ? '100px' : '200px',
        
        // Image optimization
        imageQuality: isLowPowerMode ? 'low' : isMobile ? 'medium' : 'high',
        
        // Debounce delays
        searchDebounce: isLowPowerMode ? 500 : 300,
        scrollDebounce: isLowPowerMode ? 100 : 50,
        
        // Pagination
        itemsPerPage: isLowPowerMode ? 6 : isMobile ? 9 : 12,
    };

    return {
        isMobile,
        isLowPowerMode,
        performanceSettings,
    };
};

/**
 * Hook for managing mobile-specific UI states
 */
export const useMobileUI = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const [orientation, setOrientation] = useState('portrait');
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    
    // Detect orientation changes
    useEffect(() => {
        const handleOrientationChange = () => {
            setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
        };
        
        handleOrientationChange();
        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleOrientationChange);
        
        return () => {
            window.removeEventListener('orientationchange', handleOrientationChange);
            window.removeEventListener('resize', handleOrientationChange);
        };
    }, []);
    
    // Detect virtual keyboard
    useEffect(() => {
        if (!isMobile) return;
        
        const initialViewportHeight = window.visualViewport?.height || window.innerHeight;
        
        const handleViewportChange = () => {
            const currentHeight = window.visualViewport?.height || window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;
            
            // Keyboard is likely visible if viewport height decreased significantly
            setKeyboardVisible(heightDifference > 150);
        };
        
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportChange);
            return () => {
                window.visualViewport.removeEventListener('resize', handleViewportChange);
            };
        }
    }, [isMobile]);

    return {
        isMobile,
        isTablet,
        orientation,
        keyboardVisible,
        // Mobile-specific spacing
        spacing: {
            safe: {
                top: 'env(safe-area-inset-top)',
                bottom: 'env(safe-area-inset-bottom)',
                left: 'env(safe-area-inset-left)',
                right: 'env(safe-area-inset-right)',
            },
            container: isMobile ? 16 : 24,
            section: isMobile ? 24 : 32,
        }
    };
};
