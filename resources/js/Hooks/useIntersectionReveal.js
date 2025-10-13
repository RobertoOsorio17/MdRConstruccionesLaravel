/**
 * useIntersectionReveal Hook
 * 
 * Hook personalizado para animaciones scroll-triggered usando Intersection Observer API.
 * Detecta cuando un elemento entra en el viewport y dispara animaciones.
 * 
 * Uso:
 * const { ref, isVisible } = useIntersectionReveal({ threshold: 0.3, triggerOnce: true });
 * 
 * <motion.div
 *   ref={ref}
 *   initial={{ opacity: 0, y: 50 }}
 *   animate={isVisible ? { opacity: 1, y: 0 } : {}}
 * >
 */

import { useEffect, useRef, useState } from 'react';

/**
 * Hook para revelar elementos al hacer scroll
 * @param {object} options - Opciones del Intersection Observer
 * @param {number} options.threshold - Porcentaje visible para disparar (0-1)
 * @param {string} options.rootMargin - Margen del root (ej: '0px 0px -100px 0px')
 * @param {boolean} options.triggerOnce - Si true, solo se dispara una vez
 * @param {function} options.onIntersect - Callback cuando el elemento es visible
 * @returns {object} { ref, isVisible, entry }
 */
export const useIntersectionReveal = (options = {}) => {
    const {
        threshold = 0.1,
        rootMargin = '0px',
        triggerOnce = true,
        onIntersect = null
    } = options;

    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [entry, setEntry] = useState(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Si ya fue visible y triggerOnce está activo, no hacer nada
        if (isVisible && triggerOnce) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setEntry(entry);
                
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    
                    // Ejecutar callback si existe
                    if (onIntersect) {
                        onIntersect(entry);
                    }

                    // Si triggerOnce, desconectar el observer
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    // Si no es triggerOnce, actualizar estado cuando sale del viewport
                    setIsVisible(false);
                }
            },
            {
                threshold,
                rootMargin
            }
        );

        observer.observe(element);

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [threshold, rootMargin, triggerOnce, isVisible, onIntersect]);

    return { ref, isVisible, entry };
};

/**
 * Hook para múltiples elementos con reveal
 * @param {number} count - Número de elementos
 * @param {object} options - Opciones del Intersection Observer
 * @returns {array} Array de { ref, isVisible } para cada elemento
 */
export const useMultipleIntersectionReveal = (count, options = {}) => {
    const [items, setItems] = useState(
        Array.from({ length: count }, () => ({
            ref: useRef(null),
            isVisible: false
        }))
    );

    useEffect(() => {
        const observers = items.map((item, index) => {
            const element = item.ref.current;
            if (!element) return null;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setItems(prev => {
                            const newItems = [...prev];
                            newItems[index] = { ...newItems[index], isVisible: true };
                            return newItems;
                        });

                        if (options.triggerOnce !== false) {
                            observer.unobserve(element);
                        }
                    }
                },
                {
                    threshold: options.threshold || 0.1,
                    rootMargin: options.rootMargin || '0px'
                }
            );

            observer.observe(element);
            return observer;
        });

        return () => {
            observers.forEach((observer, index) => {
                if (observer && items[index].ref.current) {
                    observer.unobserve(items[index].ref.current);
                }
            });
        };
    }, [count, options.threshold, options.rootMargin, options.triggerOnce]);

    return items;
};

/**
 * Hook para scroll progress de una sección
 * @param {object} options - Opciones
 * @returns {object} { ref, progress }
 */
export const useScrollProgress = (options = {}) => {
    const {
        offset = ['start end', 'end start']
    } = options;

    const ref = useRef(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleScroll = () => {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Calcular progreso basado en la posición del elemento
            const elementTop = rect.top;
            const elementHeight = rect.height;
            
            // Progreso de 0 a 1
            const scrollProgress = Math.max(
                0,
                Math.min(
                    1,
                    (windowHeight - elementTop) / (windowHeight + elementHeight)
                )
            );
            
            setProgress(scrollProgress);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Calcular inicial

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return { ref, progress };
};

/**
 * Hook para detectar dirección del scroll
 * @returns {object} { scrollDirection, scrollY }
 */
export const useScrollDirection = () => {
    const [scrollDirection, setScrollDirection] = useState('up');
    const [scrollY, setScrollY] = useState(0);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY.current) {
                setScrollDirection('down');
            } else if (currentScrollY < lastScrollY.current) {
                setScrollDirection('up');
            }
            
            lastScrollY.current = currentScrollY;
            setScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return { scrollDirection, scrollY };
};

export default useIntersectionReveal;

