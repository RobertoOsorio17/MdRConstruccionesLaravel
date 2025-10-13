import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for implementing lazy loading with Intersection Observer
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Intersection threshold (0-1)
 * @param {string} options.rootMargin - Root margin for intersection observer
 * @param {boolean} options.triggerOnce - Whether to trigger only once
 * @returns {Object} - { ref, isIntersecting, hasIntersected }
 */
export const useIntersectionObserver = (options = {}) => {
    const {
        threshold = 0.1,
        rootMargin = '50px',
        triggerOnce = true
    } = options;

    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const isElementIntersecting = entry.isIntersecting;
                setIsIntersecting(isElementIntersecting);

                if (isElementIntersecting && !hasIntersected) {
                    setHasIntersected(true);
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                }
            },
            {
                threshold,
                rootMargin
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [threshold, rootMargin, triggerOnce, hasIntersected]);

    return { ref, isIntersecting, hasIntersected };
};

/**
 * Hook for lazy loading components
 * @param {Function} loadComponent - Function that returns a promise resolving to the component
 * @param {Object} options - Intersection observer options
 * @returns {Object} - { ref, Component, isLoading, error }
 */
export const useLazyComponent = (loadComponent, options = {}) => {
    const [Component, setComponent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { ref, hasIntersected } = useIntersectionObserver(options);

    useEffect(() => {
        if (hasIntersected && !Component && !isLoading) {
            setIsLoading(true);
            setError(null);

            loadComponent()
                .then((module) => {
                    setComponent(() => module.default || module);
                })
                .catch((err) => {
                    setError(err);
                    console.error('Error loading component:', err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [hasIntersected, Component, isLoading, loadComponent]);

    return { ref, Component, isLoading, error };
};

/**
 * Hook for lazy loading data
 * @param {Function} loadData - Function that returns a promise resolving to data
 * @param {Object} options - Configuration options
 * @returns {Object} - { ref, data, isLoading, error, reload }
 */
export const useLazyData = (loadData, options = {}) => {
    const { dependencies = [], ...intersectionOptions } = options;
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { ref, hasIntersected } = useIntersectionObserver(intersectionOptions);

    const loadDataCallback = useCallback(async () => {
        if (!hasIntersected) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await loadData();
            setData(result);
        } catch (err) {
            setError(err);
            console.error('Error loading data:', err);
        } finally {
            setIsLoading(false);
        }
    }, [hasIntersected, loadData]);

    useEffect(() => {
        loadDataCallback();
    }, [loadDataCallback, ...dependencies]);

    const reload = useCallback(() => {
        if (hasIntersected) {
            loadDataCallback();
        }
    }, [hasIntersected, loadDataCallback]);

    return { ref, data, isLoading, error, reload };
};

/**
 * Hook for implementing infinite scroll
 * @param {Function} loadMore - Function to load more items
 * @param {Object} options - Configuration options
 * @returns {Object} - { ref, isLoading, error, hasMore, loadMore }
 */
export const useInfiniteScroll = (loadMoreFunction, options = {}) => {
    const {
        threshold = 0.1,
        rootMargin = '100px',
        hasMore: initialHasMore = true
    } = options;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const { ref, isIntersecting } = useIntersectionObserver({
        threshold,
        rootMargin,
        triggerOnce: false
    });

    useEffect(() => {
        if (isIntersecting && hasMore && !isLoading) {
            setIsLoading(true);
            setError(null);

            loadMoreFunction()
                .then((result) => {
                    if (result && typeof result.hasMore === 'boolean') {
                        setHasMore(result.hasMore);
                    }
                })
                .catch((err) => {
                    setError(err);
                    console.error('Error loading more items:', err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isIntersecting, hasMore, isLoading, loadMoreFunction]);

    const loadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            setIsLoading(true);
            setError(null);

            loadMoreFunction()
                .then((result) => {
                    if (result && typeof result.hasMore === 'boolean') {
                        setHasMore(result.hasMore);
                    }
                })
                .catch((err) => {
                    setError(err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isLoading, hasMore, loadMoreFunction]);

    return { ref, isLoading, error, hasMore, loadMore };
};

/**
 * Hook for lazy loading images
 * @param {string} src - Image source URL
 * @param {Object} options - Configuration options
 * @returns {Object} - { ref, imageSrc, isLoaded, isLoading, error }
 */
export const useLazyImage = (src, options = {}) => {
    const { placeholder = null } = options;
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { ref, hasIntersected } = useIntersectionObserver(options);

    useEffect(() => {
        if (hasIntersected && src && !isLoaded && !isLoading) {
            setIsLoading(true);
            setError(null);

            const img = new Image();
            
            img.onload = () => {
                setImageSrc(src);
                setIsLoaded(true);
                setIsLoading(false);
            };

            img.onerror = () => {
                setError(new Error('Failed to load image'));
                setIsLoading(false);
            };

            img.src = src;
        }
    }, [hasIntersected, src, isLoaded, isLoading]);

    return { ref, imageSrc, isLoaded, isLoading, error };
};

/**
 * Performance monitoring hook
 * @param {string} name - Performance mark name
 * @returns {Object} - { startMeasure, endMeasure, duration }
 */
export const usePerformanceMonitor = (name) => {
    const [duration, setDuration] = useState(null);

    const startMeasure = useCallback(() => {
        if (typeof performance !== 'undefined') {
            performance.mark(`${name}-start`);
        }
    }, [name]);

    const endMeasure = useCallback(() => {
        if (typeof performance !== 'undefined') {
            performance.mark(`${name}-end`);
            performance.measure(name, `${name}-start`, `${name}-end`);
            
            const measure = performance.getEntriesByName(name)[0];
            if (measure) {
                setDuration(measure.duration);
            }
        }
    }, [name]);

    return { startMeasure, endMeasure, duration };
};

export default {
    useIntersectionObserver,
    useLazyComponent,
    useLazyData,
    useInfiniteScroll,
    useLazyImage,
    usePerformanceMonitor
};
