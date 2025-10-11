import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box,
    Skeleton,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobilePerformance } from '@/Hooks/useMobileInteractions';

// Intersection Observer hook for lazy loading
const useIntersectionObserver = (options = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);
    const elementRef = useRef(null);
    
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;
        
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
                if (entry.isIntersecting && !hasIntersected) {
                    setHasIntersected(true);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
                ...options
            }
        );
        
        observer.observe(element);
        
        return () => {
            observer.unobserve(element);
        };
    }, [hasIntersected, options]);
    
    return { elementRef, isIntersecting, hasIntersected };
};

// Progressive image loading component
const ProgressiveImage = ({ 
    src, 
    alt, 
    placeholder, 
    className,
    style,
    onLoad,
    onError,
    ...props 
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { performanceSettings } = useMobilePerformance();
    const [imageState, setImageState] = useState('loading');
    const [imageSrc, setImageSrc] = useState(placeholder);
    const { elementRef, hasIntersected } = useIntersectionObserver({
        rootMargin: performanceSettings.lazyLoadingMargin
    });
    
    useEffect(() => {
        if (!hasIntersected || !src) return;
        
        const img = new Image();
        
        img.onload = () => {
            setImageSrc(src);
            setImageState('loaded');
            onLoad?.();
        };
        
        img.onerror = () => {
            setImageState('error');
            onError?.();
        };
        
        // Load appropriate quality based on device and performance settings
        const quality = performanceSettings.imageQuality;
        const optimizedSrc = src.includes('?') 
            ? `${src}&q=${quality === 'low' ? 60 : quality === 'medium' ? 80 : 95}`
            : `${src}?q=${quality === 'low' ? 60 : quality === 'medium' ? 80 : 95}`;
        
        img.src = optimizedSrc;
    }, [hasIntersected, src, performanceSettings.imageQuality, onLoad, onError]);
    
    return (
        <Box
            ref={elementRef}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                ...style
            }}
            className={className}
            {...props}
        >
            <AnimatePresence mode="wait">
                {imageState === 'loading' && (
                    <motion.div
                        key="skeleton"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                        }}
                    >
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height="100%"
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: 'inherit',
                            }}
                        />
                    </motion.div>
                )}
                
                {imageState === 'loaded' && (
                    <motion.img
                        key="image"
                        src={imageSrc}
                        alt={alt}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                        }}
                        loading="lazy"
                        decoding="async"
                    />
                )}
                
                {imageState === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            color: 'rgba(0, 0, 0, 0.5)',
                            fontSize: '0.875rem',
                        }}
                    >
                        Image not available
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};

// Lazy loading container for content
const LazyContainer = ({ 
    children, 
    fallback, 
    threshold = 0.1, 
    rootMargin = '100px',
    once = true 
}) => {
    const { elementRef, hasIntersected } = useIntersectionObserver({
        threshold,
        rootMargin
    });
    
    const shouldRender = once ? hasIntersected : hasIntersected;
    
    return (
        <Box ref={elementRef}>
            {shouldRender ? children : fallback}
        </Box>
    );
};

// Virtual scrolling component for large lists
const VirtualizedList = ({ 
    items, 
    renderItem, 
    itemHeight, 
    containerHeight = 400,
    overscan = 3 
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef(null);
    
    const handleScroll = useCallback((e) => {
        setScrollTop(e.target.scrollTop);
    }, []);
    
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
        visibleStart + Math.ceil(containerHeight / itemHeight) + overscan,
        items.length
    );
    
    const visibleItems = items.slice(
        Math.max(0, visibleStart - overscan),
        visibleEnd
    );
    
    const offsetY = Math.max(0, visibleStart - overscan) * itemHeight;
    
    if (!isMobile || items.length < 20) {
        // Don't virtualize on desktop or for small lists
        return (
            <Box>
                {items.map((item, index) => renderItem(item, index))}
            </Box>
        );
    }
    
    return (
        <Box
            ref={containerRef}
            onScroll={handleScroll}
            sx={{
                height: containerHeight,
                overflow: 'auto',
                position: 'relative',
            }}
        >
            <Box
                sx={{
                    height: items.length * itemHeight,
                    position: 'relative',
                }}
            >
                <Box
                    sx={{
                        transform: `translateY(${offsetY}px)`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                    }}
                >
                    {visibleItems.map((item, index) => 
                        renderItem(item, Math.max(0, visibleStart - overscan) + index)
                    )}
                </Box>
            </Box>
        </Box>
    );
};

// Performance monitoring component
const PerformanceMonitor = ({ children, onMetrics }) => {
    const { performanceSettings } = useMobilePerformance();
    const [metrics, setMetrics] = useState({});
    
    useEffect(() => {
        if (!performanceSettings.enableAnimations) return;
        
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const newMetrics = {};
            
            entries.forEach((entry) => {
                if (entry.entryType === 'paint') {
                    newMetrics[entry.name] = entry.startTime;
                } else if (entry.entryType === 'largest-contentful-paint') {
                    newMetrics.lcp = entry.startTime;
                } else if (entry.entryType === 'first-input') {
                    newMetrics.fid = entry.processingStart - entry.startTime;
                }
            });
            
            if (Object.keys(newMetrics).length > 0) {
                setMetrics(prev => ({ ...prev, ...newMetrics }));
                onMetrics?.(newMetrics);
            }
        });
        
        try {
            observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input'] });
        } catch (e) {
            // Performance Observer not supported
        }
        
        return () => {
            observer.disconnect();
        };
    }, [performanceSettings.enableAnimations, onMetrics]);
    
    return children;
};

// Adaptive loading based on connection speed
const AdaptiveLoader = ({ children, lowQualityFallback }) => {
    const [connectionSpeed, setConnectionSpeed] = useState('fast');
    
    useEffect(() => {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const updateConnectionSpeed = () => {
                const effectiveType = connection.effectiveType;
                if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                    setConnectionSpeed('slow');
                } else if (effectiveType === '3g') {
                    setConnectionSpeed('medium');
                } else {
                    setConnectionSpeed('fast');
                }
            };
            
            updateConnectionSpeed();
            connection.addEventListener('change', updateConnectionSpeed);
            
            return () => {
                connection.removeEventListener('change', updateConnectionSpeed);
            };
        }
    }, []);
    
    if (connectionSpeed === 'slow' && lowQualityFallback) {
        return lowQualityFallback;
    }
    
    return children;
};

export default ProgressiveImage;
export { 
    useIntersectionObserver,
    ProgressiveImage,
    LazyContainer,
    VirtualizedList,
    PerformanceMonitor,
    AdaptiveLoader
};
