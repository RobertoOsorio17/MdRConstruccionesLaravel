import axios from 'axios';

/**
 * Servicio centralizado para todas las operaciones ML
 */
class MLService {
    constructor() {
        this.baseURL = '/api/ml';
        this.sessionId = this.getOrCreateSessionId();
    }

    /**
     * Obtener o crear session ID
     */
    getOrCreateSessionId() {
        let sessionId = localStorage.getItem('ml_session_id');
        if (!sessionId) {
            sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('ml_session_id', sessionId);
        }
        return sessionId;
    }

    /**
     * Obtener recomendaciones ML
     */
    async getRecommendations(options = {}) {
        const {
            currentPostId = null,
            limit = 10,
            algorithm = 'hybrid',
            diversityBoost = 0.3,
            includeExplanation = false,
            excludePosts = []
        } = options;

        try {
            const response = await axios.post(`${this.baseURL}/recommendations`, {
                session_id: this.sessionId,
                current_post_id: currentPostId,
                limit,
                algorithm,
                diversity_boost: diversityBoost,
                include_explanation: includeExplanation,
                exclude_posts: excludePosts,
                device_type: this.getDeviceType(),
                viewport_width: window.innerWidth,
                viewport_height: window.innerHeight
            });

            return response.data;
        } catch (error) {
            console.error('Error getting ML recommendations:', error);
            throw error;
        }
    }

    /**
     * Registrar interacción
     */
    async logInteraction(interactionData) {
        try {
            const enrichedData = {
                session_id: this.sessionId,
                device_type: this.getDeviceType(),
                viewport_width: window.innerWidth,
                viewport_height: window.innerHeight,
                user_agent: navigator.userAgent,
                referrer: document.referrer || null,
                ...interactionData,
                metadata: {
                    ...(interactionData.metadata || {}),
                    browser_language: navigator.language,
                    screen_resolution: `${window.screen.width}x${window.screen.height}`,
                    connection_type: navigator.connection?.effectiveType || 'unknown',
                    timestamp: Date.now()
                }
            };

            const response = await axios.post(`${this.baseURL}/interactions`, enrichedData);
            return response.data;
        } catch (error) {
            console.error('Error logging ML interaction:', error);
            // No lanzar error, es background
            return null;
        }
    }

    /**
     * Obtener insights del usuario
     */
    async getUserInsights() {
        try {
            const response = await axios.get(`${this.baseURL}/insights`, {
                params: {
                    session_id: this.sessionId
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error getting ML insights:', error);
            throw error;
        }
    }

    /**
     * Actualizar perfil de usuario
     */
    async updateUserProfile(profileData) {
        try {
            const response = await axios.post(`${this.baseURL}/profile/update`, {
                session_id: this.sessionId,
                ...profileData
            });

            return response.data;
        } catch (error) {
            console.error('Error updating ML profile:', error);
            throw error;
        }
    }

    /**
     * Obtener historial de interacciones
     */
    async getInteractionHistory(limit = 50) {
        try {
            const response = await axios.get(`${this.baseURL}/history`, {
                params: {
                    session_id: this.sessionId,
                    limit
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error getting interaction history:', error);
            throw error;
        }
    }

    /**
     * Enviar feedback sobre recomendación
     */
    async submitFeedback(postId, feedbackType, metadata = {}) {
        try {
            const response = await axios.post(`${this.baseURL}/feedback`, {
                session_id: this.sessionId,
                post_id: postId,
                feedback_type: feedbackType,
                metadata
            });

            return response.data;
        } catch (error) {
            console.error('Error submitting feedback:', error);
            throw error;
        }
    }

    /**
     * ADMIN: Entrenar modelos
     */
    async trainModels(options = {}) {
        const {
            mode = 'full',
            batchSize = 100,
            async = true,
            clearCache = true,
            notify = false
        } = options;

        try {
            const response = await axios.post(`${this.baseURL}/train`, {
                mode,
                batch_size: batchSize,
                async,
                clear_cache: clearCache,
                notify
            });

            return response.data;
        } catch (error) {
            console.error('Error training ML models:', error);
            throw error;
        }
    }

    /**
     * ADMIN: Obtener métricas del sistema
     */
    async getSystemMetrics(timeRange = '7d') {
        try {
            const response = await axios.get(`${this.baseURL}/metrics`, {
                params: { time_range: timeRange }
            });

            return response.data;
        } catch (error) {
            console.error('Error getting system metrics:', error);
            throw error;
        }
    }

    /**
     * ADMIN: Análisis de clustering
     */
    async getClusteringAnalysis() {
        try {
            const response = await axios.get(`${this.baseURL}/clustering/analysis`);
            return response.data;
        } catch (error) {
            console.error('Error getting clustering analysis:', error);
            throw error;
        }
    }

    /**
     * ADMIN: Re-entrenar clustering
     */
    async retrainClustering(k = null) {
        try {
            const response = await axios.post(`${this.baseURL}/clustering/retrain`, {
                k
            });

            return response.data;
        } catch (error) {
            console.error('Error retraining clustering:', error);
            throw error;
        }
    }

    /**
     * ADMIN: Crear test A/B
     */
    async createABTest(testData) {
        try {
            const response = await axios.post(`${this.baseURL}/ab-test/create`, testData);
            return response.data;
        } catch (error) {
            console.error('Error creating A/B test:', error);
            throw error;
        }
    }

    /**
     * ADMIN: Obtener resultados de test A/B
     */
    async getABTestResults(testName) {
        try {
            const response = await axios.get(`${this.baseURL}/ab-test/results`, {
                params: { test_name: testName }
            });

            return response.data;
        } catch (error) {
            console.error('Error getting A/B test results:', error);
            throw error;
        }
    }

    /**
     * ADMIN: Health check del sistema ML
     */
    async getHealthStatus() {
        try {
            const response = await axios.get(`${this.baseURL}/health`);
            return response.data;
        } catch (error) {
            console.error('Error getting health status:', error);
            throw error;
        }
    }

    /**
     * Utilidades
     */
    getDeviceType() {
        return /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
    }

    clearCache() {
        localStorage.removeItem('ml_session_id');
        this.sessionId = this.getOrCreateSessionId();
    }
}

// Exportar instancia singleton
export default new MLService();

