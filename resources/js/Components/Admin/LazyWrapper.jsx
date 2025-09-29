import React, { Suspense } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useLazyComponent, useLazyData, usePerformanceMonitor } from '../../Hooks/useLazyLoading';
import { PageSkeleton, DashboardStatsSkeleton, TableSkeleton, ChartSkeleton } from './SkeletonLoaders';

/**
 * Lazy wrapper component for loading components on demand
 */
export const LazyComponentWrapper = ({ 
    loadComponent, 
    fallback = null, 
    errorFallback = null,
    performanceId = null,
    ...props 
}) => {
    const { ref, Component, isLoading, error } = useLazyComponent(loadComponent);
    const { startMeasure, endMeasure } = usePerformanceMonitor(performanceId || 'lazy-component');

    React.useEffect(() => {
        if (isLoading && performanceId) {
            startMeasure();
        }
        if (Component && performanceId) {
            endMeasure();
        }
    }, [isLoading, Component, performanceId, startMeasure, endMeasure]);

    return (
        <div ref={ref}>
            <AnimatePresence mode="wait">
                {error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {errorFallback || (
                            <Alert severity="error" sx={{ m: 2 }}>
                                Error al cargar el componente: {error.message}
                            </Alert>
                        )}
                    </motion.div>
                ) : isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {fallback || (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        )}
                    </motion.div>
                ) : Component ? (
                    <motion.div
                        key="component"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Component {...props} />
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
};

/**
 * Lazy wrapper for data loading
 */
export const LazyDataWrapper = ({ 
    loadData, 
    children, 
    fallback = null, 
    errorFallback = null,
    performanceId = null,
    dependencies = [],
    ...options 
}) => {
    const { ref, data, isLoading, error, reload } = useLazyData(loadData, { dependencies, ...options });
    const { startMeasure, endMeasure } = usePerformanceMonitor(performanceId || 'lazy-data');

    React.useEffect(() => {
        if (isLoading && performanceId) {
            startMeasure();
        }
        if (data && performanceId) {
            endMeasure();
        }
    }, [isLoading, data, performanceId, startMeasure, endMeasure]);

    return (
        <div ref={ref}>
            <AnimatePresence mode="wait">
                {error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {errorFallback || (
                            <Alert 
                                severity="error" 
                                sx={{ m: 2 }}
                                action={
                                    <button onClick={reload}>
                                        Reintentar
                                    </button>
                                }
                            >
                                Error al cargar los datos: {error.message}
                            </Alert>
                        )}
                    </motion.div>
                ) : isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {fallback || (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        )}
                    </motion.div>
                ) : data ? (
                    <motion.div
                        key="data"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children(data, { reload, isLoading })}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
};

/**
 * Lazy section wrapper with different skeleton types
 */
export const LazySectionWrapper = ({ 
    children, 
    skeletonType = 'default',
    skeletonProps = {},
    threshold = 0.1,
    rootMargin = '50px'
}) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const ref = React.useRef();

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold, rootMargin }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold, rootMargin]);

    const renderSkeleton = () => {
        switch (skeletonType) {
            case 'dashboard':
                return <DashboardStatsSkeleton {...skeletonProps} />;
            case 'table':
                return <TableSkeleton {...skeletonProps} />;
            case 'chart':
                return <ChartSkeleton {...skeletonProps} />;
            case 'page':
                return <PageSkeleton {...skeletonProps} />;
            default:
                return (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                );
        }
    };

    return (
        <div ref={ref}>
            <AnimatePresence mode="wait">
                {isVisible ? (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Suspense fallback={renderSkeleton()}>
                            {children}
                        </Suspense>
                    </motion.div>
                ) : (
                    <motion.div
                        key="skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {renderSkeleton()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * Performance optimized image component
 */
export const LazyImage = ({ 
    src, 
    alt, 
    placeholder = null,
    className = '',
    style = {},
    onLoad = null,
    onError = null,
    ...props 
}) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [isInView, setIsInView] = React.useState(false);
    const [error, setError] = React.useState(false);
    const imgRef = React.useRef();

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1, rootMargin: '50px' }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleLoad = () => {
        setIsLoaded(true);
        if (onLoad) onLoad();
    };

    const handleError = () => {
        setError(true);
        if (onError) onError();
    };

    return (
        <div ref={imgRef} className={className} style={style}>
            <AnimatePresence mode="wait">
                {error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f5f5f5',
                            color: '#666',
                            minHeight: '200px'
                        }}
                    >
                        Error al cargar imagen
                    </motion.div>
                ) : !isInView ? (
                    <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            backgroundColor: '#f0f0f0',
                            minHeight: '200px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {placeholder || <CircularProgress size={24} />}
                    </motion.div>
                ) : (
                    <motion.img
                        key="image"
                        src={src}
                        alt={alt}
                        onLoad={handleLoad}
                        onError={handleError}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isLoaded ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                        {...props}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default {
    LazyComponentWrapper,
    LazyDataWrapper,
    LazySectionWrapper,
    LazyImage
};
