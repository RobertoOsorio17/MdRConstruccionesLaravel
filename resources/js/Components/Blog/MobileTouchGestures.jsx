import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Fab,
    Zoom,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    KeyboardArrowUp as ArrowUpIcon,
    SwipeUp as SwipeUpIcon
} from '@mui/icons-material';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useMobileInteractions, useMobileAnimations, useMobileUI } from '@/Hooks/useMobileInteractions';

// Pull-to-refresh component
const PullToRefresh = ({ onRefresh, children, threshold = 80 }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const { triggerHapticFeedback } = useMobileInteractions();
    const { variants } = useMobileAnimations();
    
    const containerRef = useRef(null);
    const startY = useRef(0);
    const currentY = useRef(0);
    
    const handleTouchStart = useCallback((e) => {
        if (!isMobile || window.scrollY > 0) return;
        startY.current = e.touches[0].clientY;
    }, [isMobile]);
    
    const handleTouchMove = useCallback((e) => {
        if (!isMobile || window.scrollY > 0 || isRefreshing) return;
        
        currentY.current = e.touches[0].clientY;
        const distance = Math.max(0, currentY.current - startY.current);
        
        if (distance > 0) {
            e.preventDefault();
            setPullDistance(Math.min(distance, threshold * 1.5));
            
            // Haptic feedback at threshold
            if (distance >= threshold && pullDistance < threshold) {
                triggerHapticFeedback('medium');
            }
        }
    }, [isMobile, isRefreshing, threshold, triggerHapticFeedback, pullDistance]);
    
    const handleTouchEnd = useCallback(async () => {
        if (!isMobile || isRefreshing) return;
        
        if (pullDistance >= threshold) {
            setIsRefreshing(true);
            triggerHapticFeedback('success');
            
            try {
                await onRefresh();
            } catch (error) {
                console.error('Refresh failed:', error);
            } finally {
                setIsRefreshing(false);
            }
        }
        
        setPullDistance(0);
    }, [isMobile, isRefreshing, pullDistance, threshold, onRefresh, triggerHapticFeedback]);
    
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !isMobile) return;
        
        container.addEventListener('touchstart', handleTouchStart, { passive: false });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd, isMobile]);
    
    const refreshProgress = Math.min(pullDistance / threshold, 1);
    const shouldShowRefresh = pullDistance > 20;
    
    return (
        <Box ref={containerRef} sx={{ position: 'relative', minHeight: '100vh' }}>
            {/* Pull-to-refresh indicator */}
            {isMobile && shouldShowRefresh && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                        opacity: 1, 
                        scale: 1,
                        y: Math.min(pullDistance - 40, 40)
                    }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        pointerEvents: 'none'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            p: 2,
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: 3,
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        {isRefreshing ? (
                            <CircularProgress size={24} thickness={4} />
                        ) : (
                            <motion.div
                                animate={{ 
                                    rotate: refreshProgress >= 1 ? 180 : refreshProgress * 180 
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <RefreshIcon 
                                    sx={{ 
                                        fontSize: 24,
                                        color: refreshProgress >= 1 ? 'primary.main' : 'text.secondary'
                                    }} 
                                />
                            </motion.div>
                        )}
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: 'text.secondary',
                                fontWeight: 500,
                                textAlign: 'center'
                            }}
                        >
                            {isRefreshing 
                                ? 'Actualizando...' 
                                : refreshProgress >= 1 
                                    ? 'Suelta para actualizar' 
                                    : 'Desliza para actualizar'
                            }
                        </Typography>
                    </Box>
                </motion.div>
            )}
            
            {/* Content */}
            <motion.div
                animate={{ 
                    y: isMobile ? Math.min(pullDistance * 0.5, 40) : 0 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {children}
            </motion.div>
        </Box>
    );
};

// Scroll to top button with mobile optimization
const MobileScrollToTop = ({ threshold = 300 }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isVisible, setIsVisible] = useState(false);
    const { triggerHapticFeedback } = useMobileInteractions();
    const { spacing } = useMobileUI();
    
    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > threshold);
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold]);
    
    const scrollToTop = useCallback(() => {
        triggerHapticFeedback('light');
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [triggerHapticFeedback]);
    
    return (
        <Zoom in={isVisible}>
            <Fab
                onClick={scrollToTop}
                size={isMobile ? "medium" : "large"}
                sx={{
                    position: 'fixed',
                    bottom: isMobile ? 80 : 24, // Avoid WhatsApp button
                    right: 16,
                    zIndex: 1000,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'primary.main',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                    },
                    // Safe area padding for mobile
                    marginBottom: spacing.safe.bottom || 0,
                    marginRight: spacing.safe.right || 0,
                }}
            >
                <ArrowUpIcon />
            </Fab>
        </Zoom>
    );
};

// Swipe navigation component
const SwipeNavigation = ({ onSwipeLeft, onSwipeRight, children, disabled = false }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { triggerHapticFeedback } = useMobileInteractions();
    
    const x = useMotionValue(0);
    const opacity = useTransform(x, [-100, 0, 100], [0.8, 1, 0.8]);
    
    const handleDragEnd = useCallback((event, info) => {
        if (disabled || !isMobile) return;
        
        const threshold = 100;
        const velocity = info.velocity.x;
        
        if (Math.abs(info.offset.x) > threshold || Math.abs(velocity) > 500) {
            triggerHapticFeedback('medium');
            
            if (info.offset.x > 0) {
                onSwipeRight?.();
            } else {
                onSwipeLeft?.();
            }
        }
        
        // Reset position
        x.set(0);
    }, [disabled, isMobile, onSwipeLeft, onSwipeRight, triggerHapticFeedback, x]);
    
    if (!isMobile) {
        return children;
    }
    
    return (
        <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ x, opacity }}
            whileDrag={{ scale: 0.98 }}
        >
            {children}
        </motion.div>
    );
};

// Touch feedback overlay
const TouchFeedback = ({ children, onTouch, disabled = false }) => {
    const [ripples, setRipples] = useState([]);
    const { triggerHapticFeedback } = useMobileInteractions();
    
    const handleTouch = useCallback((event) => {
        if (disabled) return;
        
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.touches[0].clientX - rect.left;
        const y = event.touches[0].clientY - rect.top;
        
        const newRipple = {
            id: Date.now(),
            x,
            y,
        };
        
        setRipples(prev => [...prev, newRipple]);
        triggerHapticFeedback('light');
        onTouch?.(event);
        
        // Remove ripple after animation
        setTimeout(() => {
            setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
        }, 600);
    }, [disabled, onTouch, triggerHapticFeedback]);
    
    return (
        <Box
            onTouchStart={handleTouch}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
            }}
        >
            {children}
            
            {/* Ripple effects */}
            {ripples.map((ripple) => (
                <motion.div
                    key={ripple.id}
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{
                        position: 'absolute',
                        left: ripple.x - 10,
                        top: ripple.y - 10,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(59, 130, 246, 0.3)',
                        pointerEvents: 'none',
                        zIndex: 1,
                    }}
                />
            ))}
        </Box>
    );
};

// Main mobile gestures wrapper
const MobileTouchGestures = ({ 
    children, 
    enablePullToRefresh = true,
    enableScrollToTop = true,
    enableSwipeNavigation = false,
    enableTouchFeedback = false,
    onRefresh,
    onSwipeLeft,
    onSwipeRight,
    onTouch
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    if (!isMobile) {
        return children;
    }
    
    let content = children;
    
    // Wrap with touch feedback
    if (enableTouchFeedback) {
        content = (
            <TouchFeedback onTouch={onTouch}>
                {content}
            </TouchFeedback>
        );
    }
    
    // Wrap with swipe navigation
    if (enableSwipeNavigation) {
        content = (
            <SwipeNavigation 
                onSwipeLeft={onSwipeLeft} 
                onSwipeRight={onSwipeRight}
            >
                {content}
            </SwipeNavigation>
        );
    }
    
    // Wrap with pull-to-refresh
    if (enablePullToRefresh && onRefresh) {
        content = (
            <PullToRefresh onRefresh={onRefresh}>
                {content}
            </PullToRefresh>
        );
    }
    
    return (
        <>
            {content}
            {enableScrollToTop && <MobileScrollToTop />}
        </>
    );
};

export default MobileTouchGestures;
export { PullToRefresh, MobileScrollToTop, SwipeNavigation, TouchFeedback };
