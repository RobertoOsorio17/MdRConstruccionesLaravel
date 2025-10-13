/**
 * Metric Formatting Utilities
 * 
 * Utilidades para formatear números, métricas y valores de forma consistente
 * en toda la aplicación.
 * 
 * Uso:
 * import { formatNumber, formatCurrency, formatPercentage } from '@/Utils/formatMetric';
 */

/**
 * Formatea un número con separadores de miles
 * @param {number} value - Valor a formatear
 * @param {object} options - Opciones de formateo
 * @returns {string} Número formateado
 */
export const formatNumber = (value, options = {}) => {
    const {
        locale = 'es-ES',
        minimumFractionDigits = 0,
        maximumFractionDigits = 0,
        useGrouping = true
    } = options;

    if (value === null || value === undefined || isNaN(value)) {
        return '0';
    }

    return new Intl.NumberFormat(locale, {
        minimumFractionDigits,
        maximumFractionDigits,
        useGrouping
    }).format(value);
};

/**
 * Formatea un valor monetario
 * @param {number} value - Valor a formatear
 * @param {object} options - Opciones de formateo
 * @returns {string} Valor formateado con símbolo de moneda
 */
export const formatCurrency = (value, options = {}) => {
    const {
        locale = 'es-ES',
        currency = 'EUR',
        minimumFractionDigits = 0,
        maximumFractionDigits = 0
    } = options;

    if (value === null || value === undefined || isNaN(value)) {
        return '€0';
    }

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits,
        maximumFractionDigits
    }).format(value);
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor a formatear (0-100 o 0-1 según useDecimal)
 * @param {object} options - Opciones de formateo
 * @returns {string} Porcentaje formateado
 */
export const formatPercentage = (value, options = {}) => {
    const {
        locale = 'es-ES',
        minimumFractionDigits = 0,
        maximumFractionDigits = 1,
        useDecimal = false // Si true, espera 0-1, si false espera 0-100
    } = options;

    if (value === null || value === undefined || isNaN(value)) {
        return '0%';
    }

    const numericValue = useDecimal ? value : value / 100;

    return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits,
        maximumFractionDigits
    }).format(numericValue);
};

/**
 * Formatea un número grande con sufijos (K, M, B)
 * @param {number} value - Valor a formatear
 * @param {object} options - Opciones de formateo
 * @returns {string} Número formateado con sufijo
 */
export const formatCompactNumber = (value, options = {}) => {
    const {
        locale = 'es-ES',
        notation = 'compact',
        compactDisplay = 'short',
        minimumFractionDigits = 0,
        maximumFractionDigits = 1
    } = options;

    if (value === null || value === undefined || isNaN(value)) {
        return '0';
    }

    // Fallback para navegadores que no soportan notation: 'compact'
    if (!Intl.NumberFormat.prototype.formatToParts) {
        if (value >= 1000000000) {
            return (value / 1000000000).toFixed(1) + 'B';
        }
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        }
        if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
        }
        return value.toString();
    }

    return new Intl.NumberFormat(locale, {
        notation,
        compactDisplay,
        minimumFractionDigits,
        maximumFractionDigits
    }).format(value);
};

/**
 * Formatea una métrica con sufijo personalizado
 * @param {number} value - Valor a formatear
 * @param {string} suffix - Sufijo (ej: 'm²', 'años', 'proyectos')
 * @param {object} options - Opciones de formateo
 * @returns {string} Métrica formateada
 */
export const formatMetric = (value, suffix = '', options = {}) => {
    const {
        compact = false,
        showPlus = false,
        ...formatOptions
    } = options;

    if (value === null || value === undefined || isNaN(value)) {
        return `0${suffix ? ' ' + suffix : ''}`;
    }

    const formattedValue = compact 
        ? formatCompactNumber(value, formatOptions)
        : formatNumber(value, formatOptions);

    const prefix = showPlus && value > 0 ? '+' : '';
    const space = suffix ? ' ' : '';

    return `${prefix}${formattedValue}${space}${suffix}`;
};

/**
 * Formatea una duración en formato legible
 * @param {number} minutes - Duración en minutos
 * @param {object} options - Opciones de formateo
 * @returns {string} Duración formateada
 */
export const formatDuration = (minutes, options = {}) => {
    const {
        locale = 'es-ES',
        short = false
    } = options;

    if (minutes === null || minutes === undefined || isNaN(minutes)) {
        return '0 min';
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (short) {
        if (hours > 0 && mins > 0) {
            return `${hours}h ${mins}m`;
        }
        if (hours > 0) {
            return `${hours}h`;
        }
        return `${mins}m`;
    }

    const parts = [];
    if (hours > 0) {
        parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`);
    }
    if (mins > 0) {
        parts.push(`${mins} ${mins === 1 ? 'minuto' : 'minutos'}`);
    }

    return parts.join(' y ') || '0 minutos';
};

/**
 * Formatea una fecha relativa (hace X días, hace X meses)
 * @param {Date|string} date - Fecha a formatear
 * @param {object} options - Opciones de formateo
 * @returns {string} Fecha relativa formateada
 */
export const formatRelativeTime = (date, options = {}) => {
    const {
        locale = 'es-ES',
        numeric = 'auto'
    } = options;

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!(dateObj instanceof Date) || isNaN(dateObj)) {
        return '';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric });

    if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, 'second');
    }
    if (diffInSeconds < 3600) {
        return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    }
    if (diffInSeconds < 86400) {
        return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    }
    if (diffInSeconds < 2592000) {
        return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    }
    if (diffInSeconds < 31536000) {
        return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    }
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
};

/**
 * Formatea un rating (estrellas)
 * @param {number} rating - Rating (0-5)
 * @param {number} maxRating - Rating máximo (default: 5)
 * @returns {string} Rating formateado
 */
export const formatRating = (rating, maxRating = 5) => {
    if (rating === null || rating === undefined || isNaN(rating)) {
        return '0.0';
    }

    return `${rating.toFixed(1)}/${maxRating}`;
};

/**
 * Formatea un rango de valores
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @param {object} options - Opciones de formateo
 * @returns {string} Rango formateado
 */
export const formatRange = (min, max, options = {}) => {
    const {
        type = 'number', // 'number', 'currency', 'percentage'
        separator = ' - ',
        ...formatOptions
    } = options;

    let formatter;
    switch (type) {
        case 'currency':
            formatter = formatCurrency;
            break;
        case 'percentage':
            formatter = formatPercentage;
            break;
        default:
            formatter = formatNumber;
    }

    const formattedMin = formatter(min, formatOptions);
    const formattedMax = formatter(max, formatOptions);

    return `${formattedMin}${separator}${formattedMax}`;
};

export default {
    formatNumber,
    formatCurrency,
    formatPercentage,
    formatCompactNumber,
    formatMetric,
    formatDuration,
    formatRelativeTime,
    formatRating,
    formatRange
};

