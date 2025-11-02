import DOMPurify from 'dompurify';

/**
 * Configuración centralizada de DOMPurify para sanitización de HTML
 * 
 * Esta configuración se usa en toda la aplicación para prevenir ataques XSS
 * al renderizar contenido HTML generado por usuarios o desde el backend.
 * 
 * @see https://github.com/cure53/DOMPurify
 */
export const DOMPURIFY_CONFIG = {
    ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'del', 'ins',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'a', 'img',
        'blockquote', 'code', 'pre',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span',
        'mark' // Para resaltado de búsqueda
    ],
    ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'target', 'rel', 'id',
        'width', 'height', 'style' // Para imágenes y tablas
    ],
    ALLOWED_CLASSES: {
        'mark': ['search-highlight'], // Permitir clase para resaltado de búsqueda
        'code': ['language-*'], // Para syntax highlighting
    },
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
};

/**
 * Configuración más restrictiva para snippets/excerpts cortos
 * Útil para resultados de búsqueda, previews, etc.
 */
export const DOMPURIFY_CONFIG_STRICT = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'mark'],
    ALLOWED_ATTR: ['class'],
    ALLOWED_CLASSES: {
        'mark': ['search-highlight'],
    },
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
};

/**
 * Sanitiza HTML usando la configuración por defecto
 * 
 * @param {string} html - HTML a sanitizar
 * @param {object} config - Configuración opcional de DOMPurify (por defecto usa DOMPURIFY_CONFIG)
 * @returns {string} HTML sanitizado
 */
export const sanitizeHtml = (html, config = DOMPURIFY_CONFIG) => {
    if (!html || typeof html !== 'string') {
        return '';
    }
    return DOMPurify.sanitize(html, config);
};

/**
 * Sanitiza HTML usando configuración estricta
 * Útil para snippets cortos, resultados de búsqueda, etc.
 * 
 * @param {string} html - HTML a sanitizar
 * @returns {string} HTML sanitizado
 */
export const sanitizeHtmlStrict = (html) => {
    return sanitizeHtml(html, DOMPURIFY_CONFIG_STRICT);
};

/**
 * Hook de React para sanitizar HTML con memoización
 * 
 * @param {string} html - HTML a sanitizar
 * @param {object} config - Configuración opcional de DOMPurify
 * @returns {string} HTML sanitizado
 */
export const useSanitizedHtml = (html, config = DOMPURIFY_CONFIG) => {
    const { useMemo } = require('react');
    return useMemo(() => sanitizeHtml(html, config), [html, config]);
};

export default {
    DOMPURIFY_CONFIG,
    DOMPURIFY_CONFIG_STRICT,
    sanitizeHtml,
    sanitizeHtmlStrict,
    useSanitizedHtml,
};

