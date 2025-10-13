/**
 * Analytics Event Tracking Utility
 * 
 * Centraliza el tracking de eventos para Google Analytics, Matomo, o cualquier
 * plataforma de analytics configurada.
 * 
 * Uso:
 * import { trackEvent } from '@/Utils/trackEvent';
 * trackEvent('cta_click', { type: 'primary', label: 'Agendar asesoría', service: 'remodelacion' });
 */

/**
 * Track a custom event
 * @param {string} eventName - Nombre del evento (ej: 'cta_click', 'scroll_depth', 'wizard_start')
 * @param {object} eventData - Datos adicionales del evento
 * @param {string} eventData.category - Categoría del evento (opcional, default: 'Services')
 * @param {string} eventData.label - Label descriptivo
 * @param {number} eventData.value - Valor numérico (opcional)
 * @param {object} eventData.customParams - Parámetros personalizados adicionales
 */
export const trackEvent = (eventName, eventData = {}) => {
    const {
        category = 'Services',
        label = '',
        value = null,
        ...customParams
    } = eventData;

    // Google Analytics 4 (gtag.js)
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, {
            event_category: category,
            event_label: label,
            value: value,
            ...customParams
        });
    }

    // Google Analytics Universal (ga.js) - Fallback
    if (typeof window !== 'undefined' && window.ga) {
        window.ga('send', 'event', category, eventName, label, value);
    }

    // Matomo (Piwik)
    if (typeof window !== 'undefined' && window._paq) {
        window._paq.push(['trackEvent', category, eventName, label, value]);
    }

    // Console log en desarrollo
    if (import.meta.env.DEV) {
        console.log('📊 Event Tracked:', {
            event: eventName,
            category,
            label,
            value,
            ...customParams
        });
    }
};

/**
 * Track scroll depth
 * @param {number} depth - Profundidad del scroll (25, 50, 75, 100)
 * @param {string} service - Slug del servicio
 */
export const trackScrollDepth = (depth, service) => {
    trackEvent('scroll_depth', {
        category: 'Engagement',
        label: `${depth}%`,
        value: depth,
        service,
        page: window.location.pathname
    });
};

/**
 * Track CTA click
 * @param {string} type - Tipo de CTA (primary, secondary, micro, whatsapp, phone)
 * @param {string} label - Label del botón
 * @param {string} service - Slug del servicio
 */
export const trackCTAClick = (type, label, service) => {
    trackEvent('cta_click', {
        category: 'Conversion',
        label,
        cta_type: type,
        service,
        page: window.location.pathname
    });
};

/**
 * Track wizard interaction
 * @param {string} action - Acción (start, step, complete, abandon)
 * @param {object} data - Datos adicionales
 */
export const trackWizard = (action, data = {}) => {
    const eventName = `wizard_${action}`;
    trackEvent(eventName, {
        category: 'Conversion',
        label: data.service || '',
        ...data
    });
};

/**
 * Track section view (intersection observer)
 * @param {string} section - Nombre de la sección (hero, benefits, cases, testimonials, faq)
 * @param {string} service - Slug del servicio
 */
export const trackSectionView = (section, service) => {
    trackEvent('section_view', {
        category: 'Engagement',
        label: section,
        service,
        page: window.location.pathname
    });
};

/**
 * Track download
 * @param {string} fileType - Tipo de archivo (pdf, dossier, brochure)
 * @param {string} fileName - Nombre del archivo
 * @param {string} service - Slug del servicio
 */
export const trackDownload = (fileType, fileName, service) => {
    trackEvent('download', {
        category: 'Engagement',
        label: fileName,
        file_type: fileType,
        service,
        page: window.location.pathname
    });
};

/**
 * Track FAQ interaction
 * @param {string} question - Pregunta expandida
 * @param {string} service - Slug del servicio
 */
export const trackFAQExpand = (question, service) => {
    trackEvent('faq_expand', {
        category: 'Engagement',
        label: question,
        service,
        page: window.location.pathname
    });
};

/**
 * Track testimonial view
 * @param {number|string} testimonialId - ID del testimonio
 * @param {number} index - Índice en el carrusel
 * @param {string} service - Slug del servicio
 */
export const trackTestimonialView = (testimonialId, index, service) => {
    trackEvent('testimonial_view', {
        category: 'Engagement',
        label: `Testimonial ${testimonialId}`,
        testimonial_id: testimonialId,
        index,
        service,
        page: window.location.pathname
    });
};

/**
 * Track gallery interaction
 * @param {string} action - Acción (open, close, next, prev)
 * @param {number} imageIndex - Índice de la imagen
 * @param {string} service - Slug del servicio
 */
export const trackGallery = (action, imageIndex, service) => {
    trackEvent('gallery_interaction', {
        category: 'Engagement',
        label: action,
        image_index: imageIndex,
        service,
        page: window.location.pathname
    });
};

/**
 * Track form error
 * @param {string} fieldName - Nombre del campo con error
 * @param {string} errorType - Tipo de error
 * @param {string} formName - Nombre del formulario
 */
export const trackFormError = (fieldName, errorType, formName = 'quote_wizard') => {
    trackEvent('form_error', {
        category: 'Form',
        label: `${formName} - ${fieldName}`,
        field: fieldName,
        error_type: errorType,
        form_name: formName
    });
};

/**
 * Track page timing
 * @param {string} metric - Métrica (time_to_interactive, first_contentful_paint, etc.)
 * @param {number} value - Valor en milisegundos
 */
export const trackTiming = (metric, value) => {
    trackEvent('timing', {
        category: 'Performance',
        label: metric,
        value: Math.round(value),
        metric
    });
};

export default trackEvent;

