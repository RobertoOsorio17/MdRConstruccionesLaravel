import { useState, useEffect, useCallback, useRef } from 'react';
import { useMLRecommendations } from './useMLRecommendations';

// Custom debounce function
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Hook para rastrear la actividad de los usuarios invitados en los posts
 * Utiliza localStorage para persistir los datos
 * MEJORAS ML: Scroll depth tracking, patrones temporales, precomputación inteligente
 */
export const usePostTracking = () => {
    const [visitedPosts, setVisitedPosts] = useState({});
    const [currentPostStartTime, setCurrentPostStartTime] = useState(null);
    const [currentPostData, setCurrentPostData] = useState(null);
    
    // Referencias para acceder al estado actual desde funciones estables
    const currentPostStartTimeRef = useRef(null);
    const currentPostDataRef = useRef(null);
    const visitedPostsRef = useRef({});
    
    // MEJORAS ML: Tracking avanzado
    const [scrollDepth, setScrollDepth] = useState(0);
    const [maxScrollDepth, setMaxScrollDepth] = useState(0);
    const [readingPatterns, setReadingPatterns] = useState([]);
    const [sessionStartTime] = useState(Date.now());
    const scrollTimestamps = useRef([]);
    const lastScrollUpdate = useRef(0);
    
    // Integración con ML
    const { trackPostView, trackReadingTime, getMLRecommendations } = useMLRecommendations();

    // Clave para localStorage
    const STORAGE_KEY = 'mdr_post_tracking';
    const COMPRESSED_STORAGE_KEY = 'mdr_compressed_tracking';
    const MAX_POSTS_TRACKED = 50; // Límite para evitar que crezca indefinidamente

    /**
     * MEJORA ML: Debounced scroll tracking para optimizar rendimiento
     */
    const updateScrollDepth = useCallback(debounce((depth, timestamp) => {
        setScrollDepth(depth);
        setMaxScrollDepth(prev => Math.max(prev, depth));
        
        // Registrar timestamp de scroll para análisis de patrones
        scrollTimestamps.current.push({ depth, timestamp });
        
        // Limitar array para evitar memory leaks
        if (scrollTimestamps.current.length > 100) {
            scrollTimestamps.current = scrollTimestamps.current.slice(-50);
        }
        
        lastScrollUpdate.current = timestamp;
    }, 150), []);

    /**
     * MEJORA ML: Calcular engagement score basado en scroll depth (40% del peso)
     */
    const calculateEngagementScore = useCallback((timeSpent, maxScrollReached, readingVelocity = 1) => {
        const timeScore = Math.min(timeSpent / 180000, 1); // Max 3 minutos = 100%
        const scrollScore = maxScrollReached / 100; // Profundidad como porcentaje
        const velocityScore = Math.min(readingVelocity, 1); // Velocidad de lectura normalizada
        
        // Pesos según especificación: 40% scroll depth
        return (timeScore * 0.35) + (scrollScore * 0.40) + (velocityScore * 0.25);
    }, []);

    /**
     * MEJORA ML: Detectar patrones temporales de lectura
     */
    const analyzeReadingPatterns = useCallback((scrollData, timeSpent) => {
        if (scrollData.length < 5) return null;
        
        const totalScrolls = scrollData.length;
        const readingVelocity = totalScrolls / (timeSpent / 1000); // Scrolls por segundo
        const avgDepthIncrement = scrollData.reduce((acc, curr, idx) => {
            if (idx === 0) return acc;
            return acc + (curr.depth - scrollData[idx - 1].depth);
        }, 0) / (totalScrolls - 1);
        
        const currentHour = new Date().getHours();
        
        return {
            reading_velocity: readingVelocity,
            avg_depth_increment: avgDepthIncrement,
            scroll_consistency: avgDepthIncrement > 0 ? 1 : 0.5, // Lectura lineal vs jumping
            reading_hour: currentHour,
            total_scrolls: totalScrolls,
            session_type: timeSpent > 300000 ? 'deep_reading' : timeSpent > 120000 ? 'moderate_reading' : 'scanning'
        };
    }, []);

    /**
     * MEJORA ML: Compresión delta para localStorage
     */
    const compressTrackingData = useCallback((data) => {
        try {
            // Usar compresión delta simple
            const compressed = Object.entries(data).reduce((acc, [id, post]) => {
                acc[id] = {
                    i: post.id,
                    t: post.title?.substring(0, 50), // Título truncado
                    v: post.visits,
                    l: post.lastVisit,
                    tt: post.totalTimeSpent,
                    at: post.averageTimeSpent,
                    md: post.maxScrollDepth || 0,
                    es: post.engagementScore || 0,
                    rp: post.readingPatterns || null
                };
                return acc;
            }, {});
            
            localStorage.setItem(COMPRESSED_STORAGE_KEY, JSON.stringify(compressed));
            return true;
        } catch (error) {
            console.warn('Error compressing data:', error);
            return false;
        }
    }, []);

    /**
     * MEJORA ML: Descompresión de datos desde localStorage
     */
    const decompressTrackingData = useCallback(() => {
        try {
            const compressed = localStorage.getItem(COMPRESSED_STORAGE_KEY);
            if (!compressed) return null;
            
            const data = JSON.parse(compressed);
            return Object.entries(data).reduce((acc, [id, post]) => {
                acc[id] = {
                    id: post.i,
                    title: post.t,
                    visits: post.v,
                    lastVisit: post.l,
                    totalTimeSpent: post.tt,
                    averageTimeSpent: post.at,
                    maxScrollDepth: post.md,
                    engagementScore: post.es,
                    readingPatterns: post.rp
                };
                return acc;
            }, {});
        } catch (error) {
            console.warn('Error decompressing data:', error);
            return null;
        }
    }, []);

    // Sincronizar refs con estado
    useEffect(() => {
        currentPostStartTimeRef.current = currentPostStartTime;
        currentPostDataRef.current = currentPostData;
        visitedPostsRef.current = visitedPosts;
    }, [currentPostStartTime, currentPostData, visitedPosts]);

    // Cargar datos del localStorage al inicializar
    useEffect(() => {
        try {
            // Intentar cargar datos comprimidos primero
            const decompressed = decompressTrackingData();
            if (decompressed) {
                setVisitedPosts(decompressed);
                return;
            }
            
            // Fallback a datos no comprimidos
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setVisitedPosts(parsed);
                // Migrar a formato comprimido
                compressTrackingData(parsed);
            }
        } catch (error) {
            console.warn('Error loading post tracking data:', error);
        }
    }, [decompressTrackingData, compressTrackingData]);

    // Guardar datos en localStorage cuando cambian (con compresión)
    const saveToStorage = useCallback((data) => {
        try {
            // Guardar en formato comprimido
            const compressed = compressTrackingData(data);
            if (!compressed) {
                // Fallback a formato no comprimido si falla la compresión
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            }
        } catch (error) {
            console.warn('Error saving post tracking data:', error);
        }
    }, [compressTrackingData]);

    // Iniciar el seguimiento de un post
    const startTracking = useCallback((postId, postData = {}) => {
        console.log('🚀 startTracking llamado para post:', postId, postData.title || 'Sin título');
        
        // Resetear métricas de scroll
        setScrollDepth(0);
        setMaxScrollDepth(0);
        setReadingPatterns([]);
        scrollTimestamps.current = [];
        
        // Registrar vista en ML system
        trackPostView(postId, postData).catch(console.warn);
        
        // Si ya hay un post siendo trackeado, finalizarlo primero
        if (currentPostStartTimeRef.current && currentPostDataRef.current) {
            console.log('⚠️ Ya hay un post siendo trackeado, finalizando primero:', currentPostDataRef.current.id);
            
            // Calcular tiempo del post anterior
            const timeSpent = Date.now() - currentPostStartTimeRef.current;
            console.log(`⏰ Tiempo en post anterior ${currentPostDataRef.current.id}: ${Math.round(timeSpent/1000)}s`);
            
            // Analizar patrones de lectura
            const patterns = analyzeReadingPatterns(scrollTimestamps.current, timeSpent);
            const engagementScore = calculateEngagementScore(timeSpent, maxScrollDepth, patterns?.reading_velocity || 1);
            
            // Guardar si cumple el tiempo mínimo
            if (timeSpent > 10000) {
                console.log('✅ Tiempo suficiente (>10s), guardando en localStorage...');
                
                const postId_prev = currentPostDataRef.current.id;
                const postData_prev = currentPostDataRef.current;
                
                setVisitedPosts(prev => {
                    const currentPost = prev[postId_prev];
                    const newVisits = (currentPost?.visits || 0) + 1;
                    const newTotalTime = (currentPost?.totalTimeSpent || 0) + timeSpent;
                    const newAverageTime = newTotalTime / newVisits;

                    const updated = {
                        ...prev,
                        [postId_prev]: {
                            id: postId_prev,
                            title: postData_prev.title || currentPost?.title,
                            slug: postData_prev.slug || currentPost?.slug,
                            categories: postData_prev.categories || currentPost?.categories || [],
                            tags: postData_prev.tags || currentPost?.tags || [],
                            excerpt: postData_prev.excerpt || currentPost?.excerpt,
                            cover_image: postData_prev.cover_image || currentPost?.cover_image,
                            visits: newVisits,
                            lastVisit: Date.now(),
                            totalTimeSpent: newTotalTime,
                            averageTimeSpent: newAverageTime,
                            firstVisit: currentPost?.firstVisit || Date.now(),
                            // MEJORAS ML: Nuevos campos
                            maxScrollDepth: Math.max(currentPost?.maxScrollDepth || 0, maxScrollDepth),
                            engagementScore: engagementScore,
                            readingPatterns: patterns
                        }
                    };

                    // Limitar el número de posts rastreados
                    const postIds = Object.keys(updated);
                    if (postIds.length > MAX_POSTS_TRACKED) {
                        const sortedByLastVisit = postIds
                            .sort((a, b) => updated[b].lastVisit - updated[a].lastVisit)
                            .slice(0, MAX_POSTS_TRACKED);
                        
                        const trimmed = {};
                        sortedByLastVisit.forEach(id => {
                            trimmed[id] = updated[id];
                        });
                        
                        saveToStorage(trimmed);
                        return trimmed;
                    }

                    saveToStorage(updated);
                    console.log('💾 Post anterior guardado en localStorage:', postId_prev);
                    
                    // Registrar tiempo de lectura en ML con engagement score
                    const completedReading = timeSpent > 120000; // 2+ minutos = lectura completa
                    trackReadingTime(postId_prev, Math.round(timeSpent/1000), completedReading, Math.round(engagementScore * 100)).catch(console.warn);
                    
                    return updated;
                });
            } else {
                console.log('❌ Tiempo insuficiente (<10s), NO se guarda en localStorage');
            }
        }
        
        console.log('🔵 Iniciando nuevo tracking...');
        setCurrentPostStartTime(Date.now());
        setCurrentPostData({ id: postId, ...postData });
        
        console.log('⏱️ Post en memoria temporal, NO guardado en localStorage aún');
    }, [saveToStorage, analyzeReadingPatterns, calculateEngagementScore, maxScrollDepth]);

    // Finalizar el seguimiento de un post
    const endTracking = useCallback((postId, postData = {}) => {
        console.log('🔴 endTracking llamado para post:', postId);
        
        // Verificar si hay tracking activo usando ref
        if (!currentPostStartTimeRef.current) {
            console.log('⚠️ No hay tracking activo, saliendo');
            return;
        }

        const timeSpent = Date.now() - currentPostStartTimeRef.current;
        
        console.log(`⏰ Tiempo en post ${postId}: ${Math.round(timeSpent/1000)}s`);
        
        // Analizar patrones de lectura y calcular engagement
        const patterns = analyzeReadingPatterns(scrollTimestamps.current, timeSpent);
        const engagementScore = calculateEngagementScore(timeSpent, maxScrollDepth, patterns?.reading_velocity || 1);
        
        console.log(`📈 Engagement score: ${Math.round(engagementScore * 100)}%, Max scroll: ${maxScrollDepth}%`);
        
        if (timeSpent > 10000) {
            console.log('✅ Tiempo suficiente (>10s), guardando en localStorage...');
            setVisitedPosts(prev => {
                const currentPost = prev[postId];
                const newVisits = (currentPost?.visits || 0) + 1;
                const newTotalTime = (currentPost?.totalTimeSpent || 0) + timeSpent;
                const newAverageTime = newTotalTime / newVisits;

                const updated = {
                    ...prev,
                    [postId]: {
                        id: postId,
                        title: postData.title || currentPost?.title,
                        slug: postData.slug || currentPost?.slug,
                        categories: postData.categories || currentPost?.categories || [],
                        tags: postData.tags || currentPost?.tags || [],
                        excerpt: postData.excerpt || currentPost?.excerpt,
                        cover_image: postData.cover_image || currentPost?.cover_image,
                        visits: newVisits,
                        lastVisit: Date.now(),
                        totalTimeSpent: newTotalTime,
                        averageTimeSpent: newAverageTime,
                        firstVisit: currentPost?.firstVisit || Date.now(),
                        // MEJORAS ML: Nuevos campos
                        maxScrollDepth: Math.max(currentPost?.maxScrollDepth || 0, maxScrollDepth),
                        engagementScore: engagementScore,
                        readingPatterns: patterns
                    }
                };

                // Limitar el número de posts rastreados
                const postIds = Object.keys(updated);
                if (postIds.length > MAX_POSTS_TRACKED) {
                    const sortedByLastVisit = postIds
                        .sort((a, b) => updated[b].lastVisit - updated[a].lastVisit)
                        .slice(0, MAX_POSTS_TRACKED);
                    
                    const trimmed = {};
                    sortedByLastVisit.forEach(id => {
                        trimmed[id] = updated[id];
                    });
                    
                    saveToStorage(trimmed);
                    return trimmed;
                }

                saveToStorage(updated);
                console.log('💾 Post guardado en localStorage:', postId);
                
                // Registrar tiempo de lectura en ML con engagement score
                const completedReading = timeSpent > 120000; // 2+ minutos = lectura completa
                trackReadingTime(postId, Math.round(timeSpent/1000), completedReading, Math.round(engagementScore * 100)).catch(console.warn);
                
                return updated;
            });
        } else {
            console.log('❌ Tiempo insuficiente (<10s), NO se guarda en localStorage');
        }

        // Limpiar estado de tracking
        setCurrentPostStartTime(null);
        setCurrentPostData(null);
        setScrollDepth(0);
        setMaxScrollDepth(0);
        scrollTimestamps.current = [];
    }, [saveToStorage, analyzeReadingPatterns, calculateEngagementScore, maxScrollDepth]);

    // Obtener posts más relevantes basados en el historial + ML
    const getRecommendations = useCallback(async (currentPostId, allPosts = [], limit = 5) => {
        // Intentar obtener recomendaciones ML primero
        try {
            const mlRecs = await getMLRecommendations(currentPostId, limit);
            if (mlRecs && mlRecs.length > 0) {
                console.log('🤖 Usando recomendaciones ML:', mlRecs.length);
                return mlRecs;
            }
        } catch (error) {
            console.warn('⚠️ ML recommendations fallback to local:', error);
        }
        
        // Fallback al algoritmo local si ML no está disponible
        console.log('📊 Usando algoritmo local como fallback');
        return getLocalRecommendations(currentPostId, allPosts, limit);
    }, [getMLRecommendations]);
    
    // Algoritmo local original como fallback
    const getLocalRecommendations = useCallback((currentPostId, allPosts = [], limit = 5) => {
        const visited = Object.values(visitedPosts).filter(post => post.id != currentPostId);
        const visitedIds = visited.map(post => parseInt(post.id)); // Asegurar que sean números
        
        // También excluir el post que se está leyendo actualmente
        const currentPostIdInt = parseInt(currentPostId);
        if (currentPostData && parseInt(currentPostData.id) === currentPostIdInt) {
            // El post actual se está trackeando, excluirlo también
        }
        
        if (visited.length === 0) {
            // Si no hay historial, devolver posts populares o recientes
            return allPosts
                .filter(post => parseInt(post.id) != parseInt(currentPostId))
                .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
                .slice(0, limit);
        }

        // Filtrar posts ya leídos de las sugerencias principales
        const unreadPosts = allPosts.filter(post => 
            parseInt(post.id) != parseInt(currentPostId) && !visitedIds.includes(parseInt(post.id))
        );
        
        // Si no hay suficientes posts no leídos, incluir algunos leídos pero con menor prioridad
        let candidatePosts = unreadPosts;
        let includeReadPosts = false;
        
        if (unreadPosts.length < limit) {
            // Agregar posts leídos pero que fueron muy interesantes (tiempo > 2 minutos o múltiples visitas)
            const interestingReadPosts = allPosts.filter(post => {
                if (parseInt(post.id) === parseInt(currentPostId) || !visitedIds.includes(parseInt(post.id))) return false;
                
                const visitedPost = visited.find(v => parseInt(v.id) === parseInt(post.id));
                return visitedPost && (
                    visitedPost.averageTimeSpent > 120000 || // Más de 2 minutos
                    visitedPost.visits > 1 // Múltiples visitas
                );
            });
            
            candidatePosts = [...unreadPosts, ...interestingReadPosts];
            includeReadPosts = true;
        }

        // Calcular puntuaciones de relevancia para posts candidatos
        const scoredPosts = candidatePosts
            .map(post => {
                let score = 0;
                const isRead = visitedIds.includes(parseInt(post.id));
                
                // Penalización por haber sido leído (reducir score significativamente)
                const readPenalty = isRead ? 0.3 : 1.0; // Posts leídos tienen 30% del score
                
                // Puntuación base por popularidad
                score += (post.views_count || 0) * 0.01 * readPenalty;
                score += (post.likes_count || 0) * 0.5 * readPenalty;
                
                // Calcular similitud con posts visitados
                visited.forEach(visitedPost => {
                    const timeWeight = Math.min(visitedPost.averageTimeSpent / 60000, 5); // Max 5 minutos
                    const visitWeight = Math.min(visitedPost.visits, 3); // Max 3 visitas
                    
                    // Categorías similares
                    const commonCategories = (post.categories || []).filter(cat => 
                        (visitedPost.categories || []).some(vCat => parseInt(vCat.id) === parseInt(cat.id))
                    ).length;
                    score += commonCategories * 3 * timeWeight * visitWeight * readPenalty;
                    
                    // Tags similares
                    const commonTags = (post.tags || []).filter(tag => 
                        (visitedPost.tags || []).some(vTag => parseInt(vTag.id) === parseInt(tag.id))
                    ).length;
                    score += commonTags * 2 * timeWeight * visitWeight * readPenalty;
                });

                return {
                    ...post,
                    recommendationScore: score,
                    isRead: isRead,
                    readPenalty: readPenalty
                };
            })
            .sort((a, b) => {
                // Priorizar posts no leídos, luego por score
                if (a.isRead !== b.isRead) {
                    return a.isRead ? 1 : -1; // No leídos primero
                }
                return b.recommendationScore - a.recommendationScore;
            })
            .slice(0, limit);

        return scoredPosts;
    }, [visitedPosts, currentPostData]);

    // Obtener estadísticas del usuario
    const getUserStats = useCallback(() => {
        const posts = Object.values(visitedPosts);
        const totalVisits = posts.reduce((sum, post) => sum + post.visits, 0);
        const totalTime = posts.reduce((sum, post) => sum + post.totalTimeSpent, 0);
        const avgTimePerPost = totalTime / Math.max(posts.length, 1);
        
        // Categorías más visitadas
        const categoryFreq = {};
        posts.forEach(post => {
            (post.categories || []).forEach(cat => {
                categoryFreq[cat.name] = (categoryFreq[cat.name] || 0) + post.visits;
            });
        });
        
        // Tags más visitados
        const tagFreq = {};
        posts.forEach(post => {
            (post.tags || []).forEach(tag => {
                tagFreq[tag.name] = (tagFreq[tag.name] || 0) + post.visits;
            });
        });
        
        return {
            totalPosts: posts.length,
            totalVisits,
            totalTimeSpent: totalTime,
            averageTimePerPost: avgTimePerPost,
            topCategories: Object.entries(categoryFreq)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([name, count]) => ({ name, count })),
            topTags: Object.entries(tagFreq)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([name, count]) => ({ name, count })),
            mostVisitedPosts: posts
                .sort((a, b) => b.visits - a.visits)
                .slice(0, 5),
            postsWithMostTime: posts
                .sort((a, b) => b.averageTimeSpent - a.averageTimeSpent)
                .slice(0, 5)
        };
    }, [visitedPosts]);

    // Limpiar datos antiguos (posts visitados hace más de 6 meses)
    const cleanOldData = useCallback(() => {
        const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000);
        
        setVisitedPosts(prev => {
            const cleaned = {};
            Object.entries(prev).forEach(([id, post]) => {
                if (post.lastVisit > sixMonthsAgo) {
                    cleaned[id] = post;
                }
            });
            
            if (Object.keys(cleaned).length !== Object.keys(prev).length) {
                saveToStorage(cleaned);
            }
            
            return cleaned;
        });
    }, [saveToStorage]);

    // Limpiar datos antiguos al cargar
    useEffect(() => {
        cleanOldData();
    }, [cleanOldData]);

    /**
     * MEJORA ML: Hook para tracking de scroll en tiempo real
     */
    useEffect(() => {
        const handleScroll = () => {
            if (!currentPostStartTimeRef.current) return;
            
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            const maxScrollable = documentHeight - windowHeight;
            const currentScrollDepth = maxScrollable > 0 ? Math.round((scrollTop / maxScrollable) * 100) : 0;
            
            updateScrollDepth(currentScrollDepth, Date.now());
        };

        const debouncedScroll = debounce(handleScroll, 100);
        window.addEventListener('scroll', debouncedScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', debouncedScroll);
        };
    }, [updateScrollDepth]);

    // Obtener estado de tracking actual
    const getCurrentTrackingState = useCallback(() => {
        return {
            isTracking: currentPostStartTime !== null,
            currentPost: currentPostData,
            trackingDuration: currentPostStartTime ? Date.now() - currentPostStartTime : 0,
            scrollDepth,
            maxScrollDepth,
            engagementScore: calculateEngagementScore(
                currentPostStartTime ? Date.now() - currentPostStartTime : 0,
                maxScrollDepth
            )
        };
    }, [currentPostStartTime, currentPostData, scrollDepth, maxScrollDepth, calculateEngagementScore]);

    /**
     * MEJORA ML: Obtener métricas avanzadas de engagement
     */
    const getEngagementMetrics = useCallback(() => {
        const posts = Object.values(visitedPosts);
        
        const avgEngagement = posts.reduce((sum, post) => sum + (post.engagementScore || 0), 0) / Math.max(posts.length, 1);
        const highEngagementPosts = posts.filter(post => (post.engagementScore || 0) > 0.7);
        const readingPatternTypes = posts.map(post => post.readingPatterns?.session_type).filter(Boolean);
        
        const patternDistribution = readingPatternTypes.reduce((acc, type) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
        
        return {
            averageEngagement: avgEngagement,
            highEngagementCount: highEngagementPosts.length,
            totalTrackedPosts: posts.length,
            readingPatternDistribution: patternDistribution,
            averageScrollDepth: posts.reduce((sum, post) => sum + (post.maxScrollDepth || 0), 0) / Math.max(posts.length, 1)
        };
    }, [visitedPosts]);

    /**
     * MEJORA ML: Precomputación inteligente de recomendaciones
     */
    const precomputeRecommendations = useCallback(async (allPosts = []) => {
        if (allPosts.length === 0) return null;
        
        try {
            // Usar datos de engagement para mejorar recomendaciones
            const recommendations = await getMLRecommendations(null, 10);
            
            if (recommendations && recommendations.length > 0) {
                // Cachear recomendaciones precomputadas
                localStorage.setItem('mdr_precomputed_recs', JSON.stringify({
                    recommendations,
                    timestamp: Date.now(),
                    ttl: 30 * 60 * 1000 // 30 minutos
                }));
                
                return recommendations;
            }
        } catch (error) {
            console.warn('Error in precompute recommendations:', error);
        }
        
        return null;
    }, [getMLRecommendations]);

    /**
     * MEJORA ML: Obtener recomendaciones con cache inteligente
     */
    const getCachedRecommendations = useCallback(() => {
        try {
            const cached = localStorage.getItem('mdr_precomputed_recs');
            if (!cached) return null;
            
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp > data.ttl) {
                localStorage.removeItem('mdr_precomputed_recs');
                return null;
            }
            
            return data.recommendations;
        } catch (error) {
            return null;
        }
    }, []);

    return {
        visitedPosts,
        startTracking,
        endTracking,
        getRecommendations,
        getLocalRecommendations,
        getUserStats,
        cleanOldData,
        getCurrentTrackingState,
        // MEJORAS ML: Nuevas funciones
        scrollDepth,
        maxScrollDepth,
        getEngagementMetrics,
        precomputeRecommendations,
        getCachedRecommendations,
        updateScrollDepth,
        calculateEngagementScore
    };
};