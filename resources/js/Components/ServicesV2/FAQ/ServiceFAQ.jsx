import React, { useState, useMemo } from 'react';
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails, TextField, InputAdornment, Stack, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { ExpandMore, Search, HelpOutline } from '@mui/icons-material';
import designSystem from '@/theme/designSystem';
import { useIntersectionReveal } from '@/Hooks/useIntersectionReveal';
import { trackSectionView, trackFAQExpand } from '@/Utils/trackEvent';

/**
 * ServiceFAQ Component
 * 
 * Accordion de preguntas frecuentes con búsqueda/filtrado y tracking.
 * Conectado con el campo `faq` del modelo Service (JSON).
 * 
 * @param {Array} faqs - Array de FAQs desde el backend
 *   Estructura: [{ 
 *     question: string, 
 *     answer: string,
 *     category: string (opcional)
 *   }]
 * @param {boolean} searchable - Mostrar barra de búsqueda (default: true)
 * @param {string} service - Slug del servicio para tracking
 */
const ServiceFAQ = ({ 
    faqs = [], 
    searchable = true,
    service = ''
}) => {
    const [expanded, setExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const { ref, isVisible } = useIntersectionReveal({
        threshold: 0.2,
        onIntersect: () => trackSectionView('faq', service)
    });

    // Extraer categorías únicas
    const categories = useMemo(() => {
        const cats = new Set();
        faqs.forEach(faq => {
            if (faq.category) cats.add(faq.category);
        });
        return Array.from(cats);
    }, [faqs]);

    // Filtrar FAQs por búsqueda y categoría
    const filteredFaqs = useMemo(() => {
        let filtered = faqs;

        // Filtrar por categoría
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(faq => faq.category === selectedCategory);
        }

        // Filtrar por búsqueda
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(faq => 
                faq.question.toLowerCase().includes(query) ||
                faq.answer.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [faqs, searchQuery, selectedCategory]);

    // Handlers
    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
        if (isExpanded) {
            const faq = filteredFaqs.find((_, index) => `panel${index}` === panel);
            if (faq) {
                trackFAQExpand(faq.question, service);
            }
        }
    };

    if (!faqs || faqs.length === 0) {
        return null;
    }

    return (
        <Box
            ref={ref}
            sx={{
                py: { xs: designSystem.spacing[10], md: designSystem.spacing[16] },
                background: designSystem.colors.surface.secondary
            }}
        >
            <Container maxWidth="md">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <Box sx={{ textAlign: 'center', mb: designSystem.spacing[6] }}>
                        <HelpOutline
                            sx={{
                                fontSize: '4rem',
                                color: designSystem.colors.primary[500],
                                mb: designSystem.spacing[2]
                            }}
                        />
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 800,
                                mb: designSystem.spacing[2],
                                color: designSystem.colors.text.primary
                            }}
                        >
                            Preguntas Frecuentes
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: designSystem.colors.text.secondary,
                                maxWidth: 600,
                                mx: 'auto'
                            }}
                        >
                            Encuentra respuestas rápidas a las dudas más comunes sobre nuestros servicios
                        </Typography>
                    </Box>
                </motion.div>

                {/* Search Bar */}
                {searchable && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <TextField
                            fullWidth
                            placeholder="Buscar en preguntas frecuentes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                mb: designSystem.spacing[4],
                                '& .MuiOutlinedInput-root': {
                                    background: designSystem.colors.surface.primary,
                                    borderRadius: designSystem.borders.radius.lg
                                }
                            }}
                        />
                    </motion.div>
                )}

                {/* Category Filters */}
                {categories.length > 0 && (
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                            mb: designSystem.spacing[4],
                            flexWrap: 'wrap',
                            gap: 2
                        }}
                    >
                        <Chip
                            label="Todas"
                            onClick={() => setSelectedCategory('all')}
                            color={selectedCategory === 'all' ? 'primary' : 'default'}
                            sx={{
                                fontWeight: selectedCategory === 'all' ? 700 : 400
                            }}
                        />
                        {categories.map((category) => (
                            <Chip
                                key={category}
                                label={category}
                                onClick={() => setSelectedCategory(category)}
                                color={selectedCategory === category ? 'primary' : 'default'}
                                sx={{
                                    fontWeight: selectedCategory === category ? 700 : 400
                                }}
                            />
                        ))}
                    </Stack>
                )}

                {/* FAQ Accordions */}
                {filteredFaqs.length > 0 ? (
                    <Stack spacing={2}>
                        {filteredFaqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.1 + (index * 0.05) }}
                            >
                                <Accordion
                                    expanded={expanded === `panel${index}`}
                                    onChange={handleAccordionChange(`panel${index}`)}
                                    sx={{
                                        background: designSystem.colors.surface.primary,
                                        borderRadius: `${designSystem.borders.radius.lg} !important`,
                                        border: `1px solid ${designSystem.colors.border.light}`,
                                        boxShadow: designSystem.shadows.sm,
                                        '&:before': {
                                            display: 'none'
                                        },
                                        '&.Mui-expanded': {
                                            margin: '0 !important',
                                            boxShadow: designSystem.shadows.md,
                                            borderColor: designSystem.colors.primary[300]
                                        }
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMore />}
                                        sx={{
                                            '& .MuiAccordionSummary-content': {
                                                my: designSystem.spacing[2]
                                            },
                                            '&:hover': {
                                                background: designSystem.colors.surface.secondary
                                            }
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: designSystem.colors.text.primary,
                                                pr: 2
                                            }}
                                        >
                                            {faq.question}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails
                                        sx={{
                                            pt: 0,
                                            pb: designSystem.spacing[3],
                                            borderTop: `1px solid ${designSystem.colors.border.light}`
                                        }}
                                    >
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: designSystem.colors.text.secondary,
                                                lineHeight: 1.7
                                            }}
                                        >
                                            {faq.answer}
                                        </Typography>
                                        {faq.category && (
                                            <Chip
                                                label={faq.category}
                                                size="small"
                                                sx={{
                                                    mt: designSystem.spacing[2],
                                                    background: designSystem.colors.primary[100],
                                                    color: designSystem.colors.primary[700]
                                                }}
                                            />
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            </motion.div>
                        ))}
                    </Stack>
                ) : (
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: designSystem.spacing[8],
                            background: designSystem.colors.surface.primary,
                            borderRadius: designSystem.borders.radius.lg,
                            border: `1px dashed ${designSystem.colors.border.light}`
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                color: designSystem.colors.text.secondary,
                                mb: 1
                            }}
                        >
                            No se encontraron preguntas
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: designSystem.colors.text.muted
                            }}
                        >
                            Intenta con otros términos de búsqueda o categoría
                        </Typography>
                    </Box>
                )}

                {/* Schema.org Markup for SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": faqs.map(faq => ({
                                "@type": "Question",
                                "name": faq.question,
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": faq.answer
                                }
                            }))
                        })
                    }}
                />
            </Container>
        </Box>
    );
};

export default ServiceFAQ;

