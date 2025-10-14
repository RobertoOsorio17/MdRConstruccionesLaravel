import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Box, ThemeProvider, createTheme, Snackbar, Alert } from '@mui/material';
import MainLayout from '@/Layouts/MainLayout';
import designSystem from '@/theme/designSystem';
import { trackEvent } from '@/Utils/trackEvent';

// ServicesV2 Components
import ServiceHero from '@/Components/ServicesV2/Hero/ServiceHero';
import TrustHighlights from '@/Components/ServicesV2/Trust/TrustHighlights';
import BenefitGrid from '@/Components/ServicesV2/Benefits/BenefitGrid';
import CaseStudy from '@/Components/ServicesV2/Cases/CaseStudy';
import ProcessTimeline from '@/Components/ServicesV2/Process/ProcessTimeline';
import VisualGallery from '@/Components/ServicesV2/Gallery/VisualGallery';
import TestimonialsCarousel from '@/Components/ServicesV2/Testimonials/TestimonialsCarousel';
import ServiceFAQ from '@/Components/ServicesV2/FAQ/ServiceFAQ';
import GuaranteesBlock from '@/Components/ServicesV2/Guarantees/GuaranteesBlock';
import StickyCTA from '@/Components/ServicesV2/CTA/StickyCTA';
import ContactFormModal from '@/Components/ServicesV2/CTA/ContactFormModal';

/**
 * Show.v2 - Nueva Landing de Servicios
 * 
 * Página completamente rediseñada con componentes modulares ServicesV2.
 * Reemplaza el archivo Show.jsx monolítico de 835 líneas.
 * 
 * Props desde ServiceController::show():
 * - service: Datos completos del servicio (metrics, benefits, process_steps, etc.)
 * - testimonials: Reviews aprobados del servicio
 * - relatedServices: Servicios relacionados
 * - seo: Metadatos SEO
 * - auth: Usuario autenticado (opcional)
 */
export default function ShowV2({ service, testimonials = [], relatedServices = [], seo = {}, auth = {} }) {
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Crear tema MUI con design system
    const theme = createTheme({
        palette: {
            primary: {
                main: designSystem.colors.primary[600] || '#1976d2',
                light: designSystem.colors.primary[400] || '#42a5f5',
                dark: designSystem.colors.primary[800] || '#1565c0'
            },
            secondary: {
                main: designSystem.colors.secondary[600] || '#9c27b0',
                light: designSystem.colors.secondary[400] || '#ba68c8',
                dark: designSystem.colors.secondary[800] || '#7b1fa2'
            },
            success: {
                main: designSystem.colors.accent?.emerald?.[600] || '#10b981'
            },
            warning: {
                main: designSystem.colors.accent?.amber?.[600] || '#f59e0b'
            },
            error: {
                main: designSystem.colors.error?.[600] || '#ef4444'
            }
        },
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
        },
        shape: {
            borderRadius: parseInt(designSystem.borders?.radius?.md || '8')
        }
    });

    // Handlers
    const handleOpenContactModal = (source = 'unknown') => {
        setContactModalOpen(true);
        trackEvent('contact_modal_open', {
            service: service.slug,
            service_id: service.id,
            source: source
        });
    };

    const handleCloseContactModal = () => {
        setContactModalOpen(false);
    };

    const handleShare = () => {
        const shareMethod = navigator.share ? 'native' : 'clipboard';

        trackEvent('service_share', {
            service: service.slug,
            service_id: service.id,
            method: shareMethod
        });

        if (navigator.share) {
            navigator.share({
                title: service.title,
                text: service.excerpt,
                url: window.location.href
            });
        } else {
            // Fallback: copiar URL al clipboard
            navigator.clipboard.writeText(window.location.href);
            setSnackbar({
                open: true,
                message: 'URL copiada al portapapeles',
                severity: 'success'
            });
        }
    };

    const handleFavorite = () => {
        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState);

        trackEvent('service_favorite', {
            service: service.slug,
            service_id: service.id,
            action: newFavoriteState ? 'add' : 'remove'
        });

        setSnackbar({
            open: true,
            message: newFavoriteState ? 'Agregado a favoritos' : 'Eliminado de favoritos',
            severity: 'success'
        });

        // TODO: Implementar toggle de favorito con backend
        // router.post(`/api/services/${service.id}/favorite`)
    };

    // Configuración de CTAs
    const ctaConfig = {
        primary: {
            text: service.cta_primary_text || 'Solicitar Asesoría Gratuita',
            action: handleOpenContactModal
        },
        secondary: {
            text: service.cta_secondary_text || 'Descargar Catálogo',
            action: () => {
                // TODO: Implementar descarga de catálogo
                console.log('Descargar catálogo');
            }
        }
    };

    // Badges para el hero
    const heroBadges = [
        { icon: '⭐', value: `${service.average_rating || 5}/5`, text: 'Rating' },
        { icon: '💬', value: `${service.reviews_count || 0}`, text: 'Reviews' },
        { icon: '✅', value: '10', text: 'Años Garantía' }
    ];

    // Caso de estudio (si existe en el servicio o usar ejemplo)
    const caseStudyData = service.case_study || {
        category: 'Proyecto Destacado',
        title: `Proyecto Exitoso de ${service.title}`,
        client: 'Cliente Satisfecho',
        problem: `Nuestro cliente necesitaba ${service.title.toLowerCase()} con los más altos estándares de calidad y dentro de un presupuesto ajustado.`,
        solution: `Implementamos una metodología ágil con equipos especializados, optimizando recursos sin comprometer la calidad del resultado final.`,
        results: `Entregamos el proyecto a tiempo, superando las expectativas del cliente y logrando un ahorro del 15% respecto al presupuesto inicial.`,
        gallery: service.gallery?.slice(0, 3) || [],
        kpis: [
            { icon: '⏱️', value: 8, label: 'Meses', suffix: ' meses' },
            { icon: '💰', value: 15, label: 'Ahorro', suffix: '%' },
            { icon: '⭐', value: 100, label: 'Satisfacción', suffix: '%' }
        ],
        testimonial: testimonials[0] || null
    };

    // Schema.org markup para SEO
    const schemaMarkup = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": service.title,
        "description": service.excerpt,
        "provider": {
            "@type": "Organization",
            "name": "MDR Construcciones",
            "url": "https://mdrconstrucciones.com"
        },
        "areaServed": "España",
        "offers": {
            "@type": "Offer",
            "availability": "https://schema.org/InStock"
        },
        ...(service.average_rating && {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": service.average_rating,
                "reviewCount": service.reviews_count || 0
            }
        })
    };

    return (
        <ThemeProvider theme={theme}>
            <MainLayout>
                <Head>
                    <title>{seo.title || `${service.title} - MDR Construcciones`}</title>
                    <meta name="description" content={seo.description || service.excerpt} />

                    {/* Schema.org JSON-LD */}
                    <script type="application/ld+json">
                        {JSON.stringify(schemaMarkup)}
                    </script>

                    {/* Open Graph */}
                    <meta property="og:title" content={service.title} />
                    <meta property="og:description" content={service.excerpt} />
                    <meta property="og:image" content={service.featured_image} />
                    <meta property="og:type" content="website" />

                    {/* Twitter Card */}
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content={service.title} />
                    <meta name="twitter:description" content={service.excerpt} />
                    <meta name="twitter:image" content={service.featured_image} />
                </Head>

                <Box
                    id="main-content"
                    sx={{
                        minHeight: '100vh',
                        background: `linear-gradient(180deg,
                            ${designSystem.colors.surface.primary} 0%,
                            ${designSystem.colors.primary[50]} 50%,
                            ${designSystem.colors.surface.primary} 100%)`,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '100%',
                            background: `radial-gradient(circle at 20% 50%, ${designSystem.colors.primary[100]}40 0%, transparent 50%),
                                        radial-gradient(circle at 80% 80%, ${designSystem.colors.secondary[100]}30 0%, transparent 50%)`,
                            pointerEvents: 'none',
                            zIndex: 0,
                            opacity: 0.5
                        }
                    }}
                >
                    {/* Hero Section */}
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <ServiceHero
                            service={service}
                            badges={heroBadges}
                            ctaConfig={ctaConfig}
                            onOpenWizard={handleOpenContactModal}
                            onShare={handleShare}
                            onFavorite={handleFavorite}
                            isFavorite={isFavorite}
                        />
                    </Box>

                    {/* Trust Highlights Section */}
                    {(service.metrics?.length > 0 || service.certifications?.length > 0) && (
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <TrustHighlights
                                metrics={service.metrics || []}
                                clientLogos={[]} // TODO: Agregar logos de clientes
                                certifications={service.certifications || []}
                                service={service.slug}
                            />
                        </Box>
                    )}

                    {/* Benefits Section */}
                    {service.benefits?.length > 0 && (
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <BenefitGrid
                                benefits={service.benefits}
                                columns={3}
                                service={service.slug}
                            />
                        </Box>
                    )}

                    {/* Case Study Section */}
                    {caseStudyData && (
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <CaseStudy
                                caseData={caseStudyData}
                                service={service.slug}
                            />
                        </Box>
                    )}

                    {/* Process Timeline Section */}
                    {service.process_steps?.length > 0 && (
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <ProcessTimeline
                                steps={service.process_steps}
                                orientation="auto"
                                service={service.slug}
                            />
                        </Box>
                    )}

                    {/* Visual Gallery Section */}
                    {service.gallery?.length > 0 && (
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <VisualGallery
                                images={service.gallery}
                                categories={[...new Set(service.gallery.map(img => img.category).filter(Boolean))]}
                                service={service.slug}
                            />
                        </Box>
                    )}

                    {/* Testimonials Section */}
                    {testimonials?.length > 0 && (
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <TestimonialsCarousel
                                testimonials={testimonials}
                                autoplay={true}
                                autoplayDelay={5000}
                                service={service.slug}
                            />
                        </Box>
                    )}

                    {/* FAQ Section */}
                    {service.faq?.length > 0 && (
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <ServiceFAQ
                                faqs={service.faq}
                                searchable={true}
                                service={service.slug}
                            />
                        </Box>
                    )}

                    {/* Guarantees Section */}
                    {service.guarantees?.length > 0 && (
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <GuaranteesBlock
                                guarantees={service.guarantees}
                                ctaConfig={{
                                    title: '¿Listo para empezar tu proyecto?',
                                    subtitle: 'Contáctanos hoy y descubre cómo podemos ayudarte con total garantía.',
                                    text: 'Solicitar Información'
                                }}
                                onCTAClick={handleOpenContactModal}
                                service={service.slug}
                            />
                        </Box>
                    )}

                    {/* Sticky CTA */}
                    <StickyCTA
                        ctaConfig={ctaConfig}
                        position="auto"
                        service={service.slug}
                        onOpenWizard={handleOpenContactModal}
                        showScrollTop={true}
                    />

                    {/* Contact Form Modal */}
                    <ContactFormModal
                        open={contactModalOpen}
                        onClose={handleCloseContactModal}
                        service={service}
                        prefilledMessage={`Estoy interesado en el servicio: ${service.title}. Me gustaría recibir más información.`}
                    />

                    {/* Snackbar for notifications */}
                    <Snackbar
                        open={snackbar.open}
                        autoHideDuration={3000}
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    >
                        <Alert
                            onClose={() => setSnackbar({ ...snackbar, open: false })}
                            severity={snackbar.severity}
                            variant="filled"
                            sx={{ width: '100%' }}
                        >
                            {snackbar.message}
                        </Alert>
                    </Snackbar>
                </Box>
            </MainLayout>
        </ThemeProvider>
    );
}

