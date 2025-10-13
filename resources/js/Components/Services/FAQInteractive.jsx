import React, { useState } from 'react';
import {
    Box,
    Card,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    InputAdornment,
    Stack,
    Chip,
    Button,
} from '@mui/material';
import {
    ExpandMore,
    Search,
    HelpOutline,
    QuestionAnswer,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const faqData = [
    {
        category: 'General',
        questions: [
            {
                q: '¿Cuánto tiempo tarda un proyecto de construcción típico?',
                a: 'El tiempo de ejecución varía según el alcance del proyecto. Proyectos pequeños (reformas de baños/cocinas) pueden tomar 2-4 semanas. Proyectos medianos (reformas integrales) suelen tardar 2-4 meses. Proyectos grandes (construcción nueva) pueden requerir 6-12 meses o más. Proporcionamos un cronograma detallado en la fase de planificación.',
            },
            {
                q: '¿Necesito permisos para mi proyecto?',
                a: 'Depende del tipo de obra. Reformas menores generalmente no requieren permisos. Obras mayores que afecten la estructura o fachada sí los necesitan. Nosotros nos encargamos de gestionar todos los permisos y licencias necesarias, asegurando el cumplimiento de la normativa local.',
            },
            {
                q: '¿Ofrecen financiación para proyectos?',
                a: 'Sí, trabajamos con varias entidades financieras que ofrecen opciones de financiación adaptadas a diferentes presupuestos. Podemos facilitar el proceso y ayudarte a encontrar la mejor opción para tu proyecto.',
            },
        ],
    },
    {
        category: 'Presupuestos',
        questions: [
            {
                q: '¿El presupuesto inicial es final o puede cambiar?',
                a: 'Nuestros presupuestos son detallados y transparentes. Incluyen todos los costes previstos. Solo pueden cambiar si el cliente solicita modificaciones durante la ejecución o si se encuentran problemas estructurales ocultos. Cualquier cambio se comunica y aprueba previamente.',
            },
            {
                q: '¿Qué incluye el presupuesto?',
                a: 'Nuestros presupuestos incluyen: materiales, mano de obra, gestión de permisos, seguros, limpieza final y garantías. Desglosamos cada partida para máxima transparencia. IVA y posibles tasas municipales se especifican claramente.',
            },
            {
                q: '¿Puedo pagar en plazos?',
                a: 'Sí, ofrecemos planes de pago flexibles. Típicamente: 40% al inicio, 40% durante la ejecución y 20% al finalizar. Para proyectos grandes, podemos establecer hitos de pago más detallados según el avance de la obra.',
            },
        ],
    },
    {
        category: 'Garantías',
        questions: [
            {
                q: '¿Qué garantías ofrecen?',
                a: 'Ofrecemos garantía mínima de 1 año en todos nuestros trabajos, ampliable hasta 3 años según el plan elegido. La garantía cubre defectos de materiales y mano de obra. Los materiales también incluyen la garantía del fabricante.',
            },
            {
                q: '¿Qué cubre exactamente la garantía?',
                a: 'La garantía cubre: defectos constructivos, problemas con instalaciones (fontanería, electricidad), fallos en acabados y revestimientos. No cubre daños por mal uso, desastres naturales o modificaciones posteriores realizadas por terceros.',
            },
        ],
    },
    {
        category: 'Proceso',
        questions: [
            {
                q: '¿Puedo estar presente durante la obra?',
                a: 'Por supuesto. Animamos a nuestros clientes a visitar la obra regularmente. Asignamos un responsable de proyecto que te mantiene informado del progreso. También enviamos actualizaciones fotográficas semanales.',
            },
            {
                q: '¿Qué pasa si no estoy satisfecho con el resultado?',
                a: 'Tu satisfacción es nuestra prioridad. Realizamos una inspección final conjunta antes de la entrega. Si algo no cumple con lo acordado, lo corregimos sin coste adicional. Mantenemos comunicación constante para evitar sorpresas.',
            },
            {
                q: '¿Trabajáis en fin de semana o fuera de horario laboral?',
                a: 'Normalmente trabajamos en horario laboral (8:00-18:00, lunes a viernes). Para proyectos que requieran horarios especiales o trabajo en fin de semana, podemos coordinarlo con un recargo por horas extraordinarias.',
            },
        ],
    },
];

const FAQInteractive = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    // Filter FAQs based on search term
    const filteredFAQs = faqData.map(category => ({
        ...category,
        questions: category.questions.filter(
            item =>
                item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.a.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    })).filter(category => category.questions.length > 0);

    const categories = ['all', ...faqData.map(cat => cat.category)];

    return (
        <Box sx={{ py: { xs: 6, md: 8 } }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Stack direction="row" justifyContent="center" spacing={1} sx={{ mb: 2 }}>
                        <QuestionAnswer sx={{ fontSize: 40, color: '#3b82f6' }} />
                    </Stack>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 800,
                            mb: 2,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Preguntas Frecuentes
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#64748b',
                            fontWeight: 400,
                            maxWidth: 600,
                            mx: 'auto',
                            mb: 4,
                        }}
                    >
                        Encuentra respuestas a las dudas más comunes sobre nuestros servicios
                    </Typography>

                    {/* Search Box */}
                    <Box sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
                        <TextField
                            fullWidth
                            placeholder="Buscar en preguntas frecuentes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    bgcolor: 'white',
                                },
                            }}
                        />
                    </Box>

                    {/* Category Filters */}
                    <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                        flexWrap="wrap"
                        gap={1}
                    >
                        {categories.map((category) => (
                            <Chip
                                key={category}
                                label={category === 'all' ? 'Todas' : category}
                                onClick={() => setActiveCategory(category)}
                                color={activeCategory === category ? 'primary' : 'default'}
                                sx={{
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            />
                        ))}
                    </Stack>
                </Box>
            </motion.div>

            {/* FAQs */}
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                {filteredFAQs.length === 0 ? (
                    <Card sx={{ p: 6, textAlign: 'center' }}>
                        <HelpOutline sx={{ fontSize: 60, color: '#cbd5e1', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            No se encontraron resultados para "{searchTerm}"
                        </Typography>
                        <Button
                            variant="outlined"
                            sx={{ mt: 2 }}
                            onClick={() => setSearchTerm('')}
                        >
                            Limpiar búsqueda
                        </Button>
                    </Card>
                ) : (
                    <Stack spacing={4}>
                        {filteredFAQs
                            .filter(cat => activeCategory === 'all' || cat.category === activeCategory)
                            .map((category, catIndex) => (
                                <motion.div
                                    key={category.category}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: catIndex * 0.1 }}
                                >
                                    <Box>
                                        <Typography
                                            variant="h5"
                                            fontWeight={700}
                                            sx={{
                                                mb: 2,
                                                color: '#0f172a',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                            }}
                                        >
                                            {category.category}
                                            <Chip
                                                label={category.questions.length}
                                                size="small"
                                                sx={{ bgcolor: '#f1f5f9' }}
                                            />
                                        </Typography>
                                        <Stack spacing={1}>
                                            {category.questions.map((item, index) => {
                                                const panelId = `${category.category}-${index}`;
                                                return (
                                                    <Accordion
                                                        key={panelId}
                                                        expanded={expanded === panelId}
                                                        onChange={handleChange(panelId)}
                                                        sx={{
                                                            boxShadow: 'none',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '12px !important',
                                                            '&:before': {
                                                                display: 'none',
                                                            },
                                                            mb: 1,
                                                        }}
                                                    >
                                                        <AccordionSummary
                                                            expandIcon={<ExpandMore />}
                                                            sx={{
                                                                '& .MuiAccordionSummary-content': {
                                                                    my: 2,
                                                                },
                                                            }}
                                                        >
                                                            <Typography fontWeight={600}>
                                                                {item.q}
                                                            </Typography>
                                                        </AccordionSummary>
                                                        <AccordionDetails>
                                                            <Typography
                                                                sx={{
                                                                    color: '#64748b',
                                                                    lineHeight: 1.8,
                                                                }}
                                                            >
                                                                {item.a}
                                                            </Typography>
                                                        </AccordionDetails>
                                                    </Accordion>
                                                );
                                            })}
                                        </Stack>
                                    </Box>
                                </motion.div>
                            ))}
                    </Stack>
                )}
            </Box>

            {/* Contact CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <Card
                    sx={{
                        mt: 6,
                        p: 4,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    }}
                >
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                        ¿No encontraste lo que buscabas?
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Nuestro equipo está listo para responder todas tus preguntas
                    </Typography>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        justifyContent="center"
                    >
                        <Button
                            variant="contained"
                            size="large"
                            sx={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            }}
                        >
                            Contactar por WhatsApp
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                        >
                            Solicitar Llamada
                        </Button>
                    </Stack>
                </Card>
            </motion.div>
        </Box>
    );
};

export default FAQInteractive;
