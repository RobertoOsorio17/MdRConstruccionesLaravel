/**
 * Show.test.jsx - Página de prueba para componentes ServicesV2
 * 
 * Esta página temporal ensambla todos los componentes implementados
 * en FASE 1 y FASE 2 para verificación con Chrome DevTools MCP.
 */

import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import designSystem from '@/theme/designSystem';

// Componentes FASE 1
import InlineQuoteWizard from '@/Components/ServicesV2/CTA/InlineQuoteWizard';
import StickyCTA from '@/Components/ServicesV2/CTA/StickyCTA';

// Componentes FASE 2
import ServiceHero from '@/Components/ServicesV2/Hero/ServiceHero';
import TrustHighlights from '@/Components/ServicesV2/Trust/TrustHighlights';
import BenefitGrid from '@/Components/ServicesV2/Benefits/BenefitGrid';
import CaseStudy from '@/Components/ServicesV2/Cases/CaseStudy';

// Crear tema MUI basado en designSystem
const theme = createTheme({
    palette: {
        primary: {
            main: designSystem.colors.primary[600],
            light: designSystem.colors.primary[400],
            dark: designSystem.colors.primary[800]
        },
        secondary: {
            main: designSystem.colors.secondary[600]
        },
        error: {
            main: designSystem.colors.error[600]
        },
        success: {
            main: designSystem.colors.success[600]
        }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
    },
    shape: {
        borderRadius: parseInt(designSystem.borders.radius.md)
    }
});

const ShowTest = ({ service = {}, auth = {} }) => {
    const [wizardOpen, setWizardOpen] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    // Datos de prueba para el servicio
    const testService = {
        slug: 'construccion-viviendas',
        title: 'Construcción de Viviendas Premium',
        subtitle: 'Tu hogar soñado, construido con excelencia',
        excerpt: 'Transformamos tus ideas en espacios únicos con calidad superior, diseño innovador y compromiso total con tus expectativas.',
        featured_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=1080&fit=crop',
        video: null,
        category: 'Construcción Residencial',
        ...service
    };

    // Datos de prueba para badges del hero
    const heroBadges = [
        { icon: '🏆', label: 'Proyectos', value: '500+' },
        { icon: '⭐', label: 'Satisfacción', value: '98%' },
        { icon: '📅', label: 'Experiencia', value: '15+' },
        { icon: '✅', label: 'Garantía', value: '100%' }
    ];

    // Configuración de CTAs
    const ctaConfig = {
        primary: {
            label: 'Solicitar Asesoría Gratuita',
            onClick: () => setWizardOpen(true)
        },
        secondary: {
            label: 'Descargar Catálogo PDF',
            onClick: () => console.log('Descargando catálogo...')
        },
        whatsapp: {
            number: '34123456789',
            message: 'Hola, estoy interesado en el servicio de Construcción de Viviendas'
        },
        phone: {
            number: '+34123456789'
        }
    };

    // Datos de prueba para métricas de confianza
    const trustMetrics = [
        {
            label: 'Proyectos Completados',
            value: 500,
            suffix: '+',
            icon: '🏆',
            color: designSystem.colors.accent.amber
        },
        {
            label: 'Clientes Satisfechos',
            value: 98,
            suffix: '%',
            icon: '⭐',
            color: designSystem.colors.accent.emerald
        },
        {
            label: 'Años de Experiencia',
            value: 15,
            suffix: '+',
            icon: '📈',
            color: designSystem.colors.primary[600]
        },
        {
            label: 'Metros Cuadrados',
            value: 125000,
            suffix: ' m²',
            icon: '🏗️',
            color: designSystem.colors.accent.purple
        }
    ];

    // Datos de prueba para logos de clientes
    const clientLogos = [
        { name: 'Cliente 1', logo: 'https://via.placeholder.com/150x60?text=Cliente+1' },
        { name: 'Cliente 2', logo: 'https://via.placeholder.com/150x60?text=Cliente+2' },
        { name: 'Cliente 3', logo: 'https://via.placeholder.com/150x60?text=Cliente+3' },
        { name: 'Cliente 4', logo: 'https://via.placeholder.com/150x60?text=Cliente+4' },
        { name: 'Cliente 5', logo: 'https://via.placeholder.com/150x60?text=Cliente+5' },
        { name: 'Cliente 6', logo: 'https://via.placeholder.com/150x60?text=Cliente+6' }
    ];

    // Datos de prueba para certificaciones
    const certifications = [
        {
            name: 'ISO 9001:2015',
            description: 'Gestión de Calidad Certificada'
        },
        {
            name: 'ISO 14001',
            description: 'Gestión Ambiental'
        },
        {
            name: 'OHSAS 18001',
            description: 'Seguridad y Salud Laboral'
        }
    ];

    // Datos de prueba para caso de éxito
    const caseStudyData = {
        title: 'Villa Mediterránea en Marbella',
        client: 'Familia García',
        category: 'Vivienda Unifamiliar',
        problem: 'La familia García buscaba construir su hogar soñado en la Costa del Sol, pero enfrentaban desafíos con el terreno irregular, normativas locales estrictas y un presupuesto ajustado. Necesitaban un socio que entendiera su visión y la hiciera realidad sin comprometer la calidad.',
        solution: 'Diseñamos una solución arquitectónica que aprovecha la topografía del terreno, creando terrazas escalonadas con vistas panorámicas al mar. Gestionamos todos los permisos y licencias, optimizamos el presupuesto mediante selección inteligente de materiales, y asignamos un gestor de proyecto dedicado para comunicación directa.',
        results: 'Entregamos la villa 2 semanas antes del plazo, con un ahorro del 15% respecto al presupuesto inicial. La familia quedó encantada con el resultado: 350m² de espacios luminosos, piscina infinity, jardín mediterráneo y certificación energética A. El proyecto ganó el premio local de arquitectura sostenible 2023.',
        gallery: [
            {
                before: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
                after: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
                caption: 'Vista frontal - Antes y después'
            },
            {
                after: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
                caption: 'Salón principal con vistas al mar'
            },
            {
                after: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
                caption: 'Piscina infinity y terraza'
            }
        ],
        kpis: [
            { label: 'Tiempo de Entrega', value: 8, suffix: ' meses', icon: '⏱️' },
            { label: 'Ahorro Logrado', value: 15, suffix: '%', icon: '💰' },
            { label: 'Satisfacción', value: 100, suffix: '%', icon: '⭐' }
        ],
        testimonial: {
            author: 'Carlos García',
            role: 'Propietario',
            quote: 'Superaron todas nuestras expectativas. No solo construyeron nuestra casa, crearon nuestro hogar. La atención al detalle, la comunicación constante y la calidad del trabajo son excepcionales. Recomendamos MDR Construcciones sin dudarlo.',
            rating: 5
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: testService.title,
                text: testService.excerpt,
                url: window.location.href
            });
        } else {
            console.log('Share API no disponible');
        }
    };

    const handleFavorite = () => {
        setIsFavorite(!isFavorite);
        console.log('Favorito:', !isFavorite);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Head title={`${testService.title} - Test Page`} />

            <Box sx={{ bgcolor: designSystem.colors.surface.primary }}>
                {/* Hero Section */}
                <ServiceHero
                    service={testService}
                    badges={heroBadges}
                    ctaConfig={ctaConfig}
                    onOpenWizard={() => setWizardOpen(true)}
                    onShare={handleShare}
                    onFavorite={handleFavorite}
                    isFavorite={isFavorite}
                />

                {/* Trust Highlights Section */}
                <TrustHighlights
                    metrics={trustMetrics}
                    clientLogos={clientLogos}
                    certifications={certifications}
                    service={testService}
                />

                {/* Benefits Section */}
                <BenefitGrid
                    columns={3}
                    service={testService}
                />

                {/* Case Study Section */}
                <CaseStudy
                    caseData={caseStudyData}
                    service={testService}
                />

                {/* Sticky CTA */}
                <StickyCTA
                    ctaConfig={ctaConfig}
                    service={testService}
                    onOpenWizard={() => setWizardOpen(true)}
                    showScrollTop={true}
                />

                {/* Inline Quote Wizard */}
                <InlineQuoteWizard
                    open={wizardOpen}
                    onClose={() => setWizardOpen(false)}
                    service={testService}
                />
            </Box>
        </ThemeProvider>
    );
};

export default ShowTest;

