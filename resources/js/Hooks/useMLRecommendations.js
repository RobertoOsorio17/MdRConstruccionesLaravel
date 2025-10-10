import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

/**
 * Hook para integrar Machine Learning en las recomendaciones
 */
export const useMLRecommendations = () => {
    const [mlRecommendations, setMLRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [insights, setInsights] = useState(null);
    const [error, setError] = useState(null);
    
    // Cache para evitar peticiones duplicadas
    const cacheRef = useRef(new Map());
    const sessionId = useRef(null);

    // Obtener o generar session ID
    useEffect(() => {
        if (!sessionId.current) {
            sessionId.current = generateSessionId();
        }
    }, []);

    /**
     * Genera un session ID único para el usuario invitado
     */
    const generateSessionId = () => {
        let stored = localStorage.getItem('ml_session_id');
        if (!stored) {
            stored = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('ml_session_id', stored);
        }
        return stored;
    };

    /**
     * Obtiene recomendaciones ML inteligentes con opciones avanzadas
     */
    const getMLRecommendations = useCallback(async (currentPostId = null, options = {}) => {
        const {
            limit = 10,
            algorithm = 'hybrid',
            diversityBoost = 0.3,
            includeExplanation = false,
            excludePosts = []
        } = options;

        const cacheKey = `ml_recs_${currentPostId}_${limit}_${algorithm}`;

        // Verificar cache
        if (cacheRef.current.has(cacheKey)) {
            const cached = cacheRef.current.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5 minutos de cache
                setMLRecommendations(cached.data);
                return cached.data;
            }
        }

        setLoading(true);
        setError(null);

        try {
            console.log('🤖 Obteniendo recomendaciones ML...', { currentPostId, limit, algorithm });

            const response = await axios.post('/api/ml/recommendations', {
                session_id: sessionId.current,
                current_post_id: currentPostId,
                limit: limit,
                algorithm: algorithm,
                diversity_boost: diversityBoost,
                include_explanation: includeExplanation,
                exclude_posts: excludePosts,
                device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                viewport_width: window.innerWidth,
                viewport_height: window.innerHeight
            });

            if (response.data.success) {
                const recommendations = response.data.recommendations || [];
                const explanations = response.data.explanations || [];

                console.log(`✅ ${recommendations.length} recomendaciones ML obtenidas`);
                console.log('📊 Algoritmo:', response.data.metadata?.algorithm);

                // Enriquecer recomendaciones con explicaciones
                const enrichedRecs = recommendations.map((rec, index) => ({
                    ...rec,
                    explanation: explanations[index] || null
                }));

                setMLRecommendations(enrichedRecs);

                // Cache la respuesta
                cacheRef.current.set(cacheKey, {
                    data: enrichedRecs,
                    timestamp: Date.now()
                });

                return enrichedRecs;
            } else {
                throw new Error(response.data.error || 'Error obteniendo recomendaciones ML');
            }
        } catch (error) {
            console.error('❌ Error ML recommendations:', error);
            setError('No se pudieron cargar las recomendaciones inteligentes');

            // Retornar array vacío en caso de error
            setMLRecommendations([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Registra una interacción de usuario para el sistema ML con métricas avanzadas
     */
    const logMLInteraction = useCallback(async (interactionData) => {
        try {
            console.log('📝 Registrando interacción ML:', interactionData);

            // Enriquecer datos con métricas del navegador
            const enrichedData = {
                session_id: sessionId.current,
                device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                viewport_width: window.innerWidth,
                viewport_height: window.innerHeight,
                user_agent: navigator.userAgent,
                referrer: document.referrer || null,
                ...interactionData,
                metadata: {
                    ...(interactionData.metadata || {}),
                    browser_language: navigator.language,
                    screen_resolution: `${window.screen.width}x${window.screen.height}`,
                    connection_type: navigator.connection?.effectiveType || 'unknown'
                }
            };

            const response = await axios.post('/api/ml/interactions', enrichedData);

            if (response.data.success) {
                console.log('✅ Interacción ML registrada', {
                    interaction_id: response.data.data?.interaction_id,
                    implicit_rating: response.data.data?.implicit_rating,
                    engagement_score: response.data.data?.engagement_score
                });

                // Invalidar cache si es una interacción importante
                if (['like', 'bookmark', 'share', 'recommendation_click'].includes(interactionData.interaction_type)) {
                    cacheRef.current.clear();
                }

                return response.data.data;
            }
        } catch (error) {
            console.warn('⚠️ Error registrando interacción ML:', error);
            // No mostrar error al usuario, es background
        }

        return null;
    }, []);

    /**
     * Obtiene insights personalizados del usuario
     */
    const getMLInsights = useCallback(async () => {
        try {
            console.log('🔍 Obteniendo insights ML...');
            
            const response = await axios.get('/api/ml/insights', {
                params: {
                    session_id: sessionId.current
                }
            });

            if (response.data.success) {
                console.log('📈 Insights ML obtenidos:', response.data.insights);
                setInsights(response.data.insights);
                return response.data.insights;
            }
        } catch (error) {
            console.warn('⚠️ Error obteniendo insights ML:', error);
        }
        
        return null;
    }, []);

    /**
     * Registra vista de post con tracking ML
     */
    const trackPostView = useCallback(async (postId, postData = {}) => {
        await logMLInteraction({
            post_id: postId,
            interaction_type: 'view',
            metadata: {
                source: 'ml_hook',
                post_title: postData.title,
                post_categories: postData.categories?.map(c => c.id) || [],
                post_tags: postData.tags?.map(t => t.id) || []
            }
        });
    }, [logMLInteraction]);

    /**
     * Registra click en recomendación ML
     */
    const trackRecommendationClick = useCallback(async (postId, recommendationData) => {
        await logMLInteraction({
            post_id: postId,
            interaction_type: 'recommendation_click',
            recommendation_source: recommendationData.source,
            recommendation_score: recommendationData.score,
            recommendation_position: recommendationData.position,
            metadata: {
                algorithm: recommendationData.source,
                confidence: recommendationData.confidence,
                reason: recommendationData.reason
            }
        });
    }, [logMLInteraction]);

    /**
     * Registra tiempo de lectura en post
     */
    const trackReadingTime = useCallback(async (postId, timeSpentSeconds, completedReading = false, scrollPercentage = 0) => {
        await logMLInteraction({
            post_id: postId,
            interaction_type: 'view',
            time_spent_seconds: timeSpentSeconds,
            scroll_percentage: scrollPercentage,
            completed_reading: completedReading,
            metadata: {
                reading_session: true,
                engagement_type: completedReading ? 'full_read' : 'partial_read'
            }
        });
    }, [logMLInteraction]);

    /**
     * Registra interacción social (like, share, etc.)
     */
    const trackSocialInteraction = useCallback(async (postId, interactionType, metadata = {}) => {
        await logMLInteraction({
            post_id: postId,
            interaction_type: interactionType,
            metadata: {
                social_action: true,
                ...metadata
            }
        });
    }, [logMLInteraction]);

    /**
     * Obtiene explicación de por qué se recomienda un post
     */
    const getRecommendationExplanation = useCallback((recommendation) => {
        if (!recommendation.ml_data) return null;

        const { source, reason, confidence, metadata } = recommendation.ml_data;
        
        return {
            primary_reason: reason,
            confidence_level: confidence,
            algorithm_used: source,
            details: {
                content_based: metadata?.content_similarity ? 
                    `Similitud de contenido: ${Math.round(metadata.content_similarity * 100)}%` : null,
                collaborative: metadata?.similar_users_liked ?
                    `${metadata.similar_users_liked} usuarios similares disfrutaron este contenido` : null,
                personalized: metadata?.profile_match ?
                    `Coincidencia con tu perfil: ${Math.round(metadata.profile_match * 100)}%` : null,
                trending: metadata?.recent_engagement ?
                    `Alto engagement reciente: ${Math.round(metadata.recent_engagement * 100)}%` : null
            }
        };
    }, []);

    /**
     * Filtra recomendaciones por tipo de algoritmo
     */
    const filterRecommendationsBySource = useCallback((source) => {
        return mlRecommendations.filter(rec => 
            rec.ml_data?.source === source || 
            rec.ml_data?.sources?.includes(source)
        );
    }, [mlRecommendations]);

    /**
     * Obtiene estadísticas de los algoritmos ML
     */
    const getMLStats = useCallback(() => {
        if (mlRecommendations.length === 0) return null;

        const sources = {};
        let totalConfidence = 0;

        mlRecommendations.forEach(rec => {
            const source = rec.ml_data?.source || 'unknown';
            sources[source] = (sources[source] || 0) + 1;
            totalConfidence += rec.ml_data?.confidence || 0;
        });

        return {
            total_recommendations: mlRecommendations.length,
            avg_confidence: Math.round(totalConfidence / mlRecommendations.length),
            sources_distribution: sources,
            top_algorithm: Object.keys(sources).reduce((a, b) => sources[a] > sources[b] ? a : b)
        };
    }, [mlRecommendations]);

    return {
        // Estado
        mlRecommendations,
        insights,
        loading,
        error,
        
        // Funciones principales
        getMLRecommendations,
        getMLInsights,
        
        // Tracking functions
        trackPostView,
        trackRecommendationClick,
        trackReadingTime,
        trackSocialInteraction,
        logMLInteraction,
        
        // Utilidades
        getRecommendationExplanation,
        filterRecommendationsBySource,
        getMLStats,
        
        // Session info
        sessionId: sessionId.current
    };
};