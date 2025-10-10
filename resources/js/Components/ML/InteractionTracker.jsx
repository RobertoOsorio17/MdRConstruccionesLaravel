import { useEffect, useRef, useCallback } from 'react';
import { useMLRecommendations } from '@/Hooks/useMLRecommendations';

/**
 * Componente invisible que rastrea automáticamente las interacciones del usuario
 * Debe ser incluido en el layout principal de la aplicación
 */
const InteractionTracker = ({ post = null, enabled = true }) => {
    const { logMLInteraction } = useMLRecommendations();
    
    const startTime = useRef(null);
    const scrollDepth = useRef(0);
    const maxScrollDepth = useRef(0);
    const scrollTimestamps = useRef([]);
    const interactionsSent = useRef(new Set());
    const lastScrollUpdate = useRef(0);

    /**
     * Calcular profundidad de scroll
     */
    const calculateScrollDepth = useCallback(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        const maxScrollable = documentHeight - windowHeight;
        const currentScrollDepth = maxScrollable > 0 ? Math.round((scrollTop / maxScrollable) * 100) : 0;
        
        return currentScrollDepth;
    }, []);

    /**
     * Calcular engagement score
     */
    const calculateEngagementScore = useCallback((timeSpent, maxScroll, scrollVelocity = 1) => {
        const timeScore = Math.min(timeSpent / 180000, 1); // Max 3 minutos = 100%
        const scrollScore = maxScroll / 100;
        const velocityScore = Math.min(scrollVelocity, 1);
        
        return (timeScore * 0.35) + (scrollScore * 0.40) + (velocityScore * 0.25);
    }, []);

    /**
     * Analizar patrones de lectura
     */
    const analyzeReadingPatterns = useCallback((scrollData, timeSpent) => {
        if (scrollData.length < 5) return null;
        
        const totalScrolls = scrollData.length;
        const readingVelocity = totalScrolls / (timeSpent / 1000);
        const avgDepthIncrement = scrollData.reduce((acc, curr, idx) => {
            if (idx === 0) return acc;
            return acc + (curr.depth - scrollData[idx - 1].depth);
        }, 0) / (totalScrolls - 1);
        
        return {
            reading_velocity: readingVelocity,
            avg_depth_increment: avgDepthIncrement,
            scroll_consistency: avgDepthIncrement > 0 ? 1 : 0.5,
            total_scrolls: totalScrolls,
            session_type: timeSpent > 300000 ? 'deep_reading' : timeSpent > 120000 ? 'moderate_reading' : 'scanning'
        };
    }, []);

    /**
     * Registrar interacción de vista
     */
    const logViewInteraction = useCallback(async () => {
        if (!post || !enabled) return;
        
        const interactionKey = `view_${post.id}`;
        if (interactionsSent.current.has(interactionKey)) return;
        
        await logMLInteraction({
            post_id: post.id,
            interaction_type: 'view',
            metadata: {
                post_title: post.title,
                post_categories: post.categories?.map(c => c.id) || [],
                post_tags: post.tags?.map(t => t.id) || [],
                source: 'auto_tracker'
            }
        });
        
        interactionsSent.current.add(interactionKey);
    }, [post, enabled, logMLInteraction]);

    /**
     * Registrar tiempo de lectura
     */
    const logReadingTime = useCallback(async () => {
        if (!post || !enabled || !startTime.current) return;
        
        const timeSpent = Date.now() - startTime.current;
        
        // Solo registrar si pasó al menos 10 segundos
        if (timeSpent < 10000) return;
        
        const patterns = analyzeReadingPatterns(scrollTimestamps.current, timeSpent);
        const engagementScore = calculateEngagementScore(
            timeSpent,
            maxScrollDepth.current,
            patterns?.reading_velocity || 1
        );
        
        const completedReading = timeSpent > 120000 && maxScrollDepth.current > 80;
        
        await logMLInteraction({
            post_id: post.id,
            interaction_type: 'view',
            time_spent_seconds: Math.round(timeSpent / 1000),
            scroll_percentage: maxScrollDepth.current,
            completed_reading: completedReading,
            engagement_score: Math.round(engagementScore * 100),
            metadata: {
                reading_patterns: patterns,
                max_scroll_depth: maxScrollDepth.current,
                source: 'auto_tracker'
            }
        });
    }, [post, enabled, logMLInteraction, analyzeReadingPatterns, calculateEngagementScore]);

    /**
     * Handler de scroll
     */
    const handleScroll = useCallback(() => {
        if (!enabled || !post) return;
        
        const now = Date.now();
        
        // Throttle: actualizar cada 150ms
        if (now - lastScrollUpdate.current < 150) return;
        
        const currentDepth = calculateScrollDepth();
        scrollDepth.current = currentDepth;
        maxScrollDepth.current = Math.max(maxScrollDepth.current, currentDepth);
        
        scrollTimestamps.current.push({
            depth: currentDepth,
            timestamp: now
        });
        
        // Limitar array para evitar memory leaks
        if (scrollTimestamps.current.length > 100) {
            scrollTimestamps.current = scrollTimestamps.current.slice(-50);
        }
        
        lastScrollUpdate.current = now;
    }, [enabled, post, calculateScrollDepth]);

    /**
     * Handler de visibilidad de página
     */
    const handleVisibilityChange = useCallback(() => {
        if (document.hidden) {
            // Usuario cambió de pestaña, registrar tiempo
            logReadingTime();
        }
    }, [logReadingTime]);

    /**
     * Inicializar tracking cuando se monta el componente o cambia el post
     */
    useEffect(() => {
        if (!post || !enabled) return;
        
        // Resetear estado
        startTime.current = Date.now();
        scrollDepth.current = 0;
        maxScrollDepth.current = 0;
        scrollTimestamps.current = [];
        interactionsSent.current.clear();
        
        // Registrar vista inicial
        logViewInteraction();
        
        // Agregar event listeners
        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Cleanup
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            
            // Registrar tiempo final
            logReadingTime();
        };
    }, [post, enabled, logViewInteraction, handleScroll, handleVisibilityChange, logReadingTime]);

    /**
     * Registrar tiempo cada 30 segundos (heartbeat)
     */
    useEffect(() => {
        if (!post || !enabled) return;
        
        const interval = setInterval(() => {
            logReadingTime();
        }, 30000); // 30 segundos
        
        return () => clearInterval(interval);
    }, [post, enabled, logReadingTime]);

    /**
     * Tracking de clicks en enlaces
     */
    useEffect(() => {
        if (!enabled) return;
        
        const handleLinkClick = async (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href) return;
            
            // Detectar si es un enlace a otro post
            const postMatch = href.match(/\/blog\/([^\/]+)/);
            if (postMatch && post) {
                await logMLInteraction({
                    post_id: post.id,
                    interaction_type: 'click',
                    metadata: {
                        link_href: href,
                        link_text: link.textContent?.substring(0, 100),
                        source: 'auto_tracker'
                    }
                });
            }
        };
        
        document.addEventListener('click', handleLinkClick);
        
        return () => {
            document.removeEventListener('click', handleLinkClick);
        };
    }, [enabled, post, logMLInteraction]);

    // Este componente no renderiza nada
    return null;
};

export default InteractionTracker;

