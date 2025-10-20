/**
 * Configuración de Contacto - MDR Construcciones
 *
 * Centraliza números de teléfono, WhatsApp, emails y horarios
 * para evitar valores hardcodeados en componentes.
 *
 * Para cambiar los datos de contacto, modifica este archivo.
 */

export const contactConfig = {
    // Teléfono principal
    phone: {
        display: '+34 123 456 789',
        raw: '+34123456789',
        link: 'tel:+34123456789'
    },

    // WhatsApp
    whatsapp: {
        number: '34123456789', // Sin el '+' para WhatsApp API
        display: '+34 123 456 789',
        defaultMessage: 'Hola, estoy interesado en sus servicios de construcción'
    },

    // Email
    email: {
        general: 'info@mdrconstrucciones.com',
        support: 'soporte@mdrconstrucciones.com',
        sales: 'ventas@mdrconstrucciones.com'
    },

    // Horarios
    schedule: {
        weekdays: 'Lunes a Viernes: 9:00 - 18:00',
        saturday: 'Sábado: 10:00 - 14:00',
        sunday: 'Domingo: Cerrado'
    },

    // Redes sociales
    social: {
        facebook: 'https://facebook.com/mdrconstrucciones',
        instagram: 'https://instagram.com/mdrconstrucciones',
        linkedin: 'https://linkedin.com/company/mdrconstrucciones',
        twitter: 'https://twitter.com/mdrconstrucciones'
    },

    // Dirección física
    address: {
        street: 'Calle Principal 123',
        city: 'Madrid',
        postalCode: '28001',
        country: 'España',
        full: 'Calle Principal 123, 28001 Madrid, España',
        googleMaps: 'https://maps.google.com/?q=MDR+Construcciones+Madrid'
    }
};

/**
 * Helper para generar URL de WhatsApp con mensaje personalizado
 * @param {string} customMessage - Mensaje personalizado (opcional)
 * @returns {string} URL completa de WhatsApp
 */
export const getWhatsAppUrl = (customMessage = null) => {
    const message = customMessage || contactConfig.whatsapp.defaultMessage;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${contactConfig.whatsapp.number}?text=${encodedMessage}`;
};

/**
 * Helper para generar mensaje de WhatsApp para un servicio específico
 * @param {string} serviceName - Nombre del servicio
 * @returns {string} URL completa de WhatsApp
 */
export const getServiceWhatsAppUrl = (serviceName) => {
    const message = `Hola, estoy interesado en el servicio: ${serviceName}. ¿Podrían darme más información?`;
    return getWhatsAppUrl(message);
};

export default contactConfig;
