import React, { useState } from 'react';
import {
    Box,
    Card,
    Grid,
    Typography,
    Button,
    Stack,
    Chip,
    Switch,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tooltip,
} from '@mui/material';
import {
    CheckCircle,
    Close,
    Star,
    Info,
    TrendingUp,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const plans = [
    {
        id: 'basic',
        name: 'Básico',
        price: { monthly: 1500, yearly: 15000 },
        tagline: 'Perfecto para proyectos sencillos',
        color: '#64748b',
        features: {
            'Consultoría inicial': true,
            'Diseño básico': true,
            'Diseño personalizado': false,
            'Materiales estándar': true,
            'Materiales premium': false,
            'Materiales de lujo': false,
            'Garantía': '1 año',
            'Soporte técnico': 'Email',
            'Seguimiento post-venta': false,
            'Mantenimiento': false,
            'Proyecto llave en mano': false,
            'Certificaciones': 'Básicas',
        },
        popular: false,
    },
    {
        id: 'professional',
        name: 'Profesional',
        price: { monthly: 3500, yearly: 35000 },
        tagline: 'La mejor relación calidad-precio',
        color: '#3b82f6',
        features: {
            'Consultoría inicial': true,
            'Diseño básico': true,
            'Diseño personalizado': true,
            'Materiales estándar': true,
            'Materiales premium': true,
            'Materiales de lujo': false,
            'Garantía': '2 años',
            'Soporte técnico': 'Prioritario',
            'Seguimiento post-venta': true,
            'Mantenimiento': '6 meses incluido',
            'Proyecto llave en mano': false,
            'Certificaciones': 'Completas',
        },
        popular: true,
    },
    {
        id: 'premium',
        name: 'Premium',
        price: { monthly: 7500, yearly: 75000 },
        tagline: 'Experiencia de lujo completa',
        color: '#8b5cf6',
        features: {
            'Consultoría inicial': 'VIP',
            'Diseño básico': true,
            'Diseño personalizado': 'Exclusivo',
            'Materiales estándar': true,
            'Materiales premium': true,
            'Materiales de lujo': true,
            'Garantía': '3 años',
            'Soporte técnico': '24/7',
            'Seguimiento post-venta': 'Dedicado',
            'Mantenimiento': '12 meses incluido',
            'Proyecto llave en mano': true,
            'Certificaciones': 'Premium + Extras',
        },
        popular: false,
    },
];

const PlanComparator = ({ onSelectPlan }) => {
    const [isYearly, setIsYearly] = useState(false);
    const [showComparison, setShowComparison] = useState(false);

    const renderFeatureValue = (value) => {
        if (value === true) {
            return <CheckCircle sx={{ color: '#10b981', fontSize: 24 }} />;
        }
        if (value === false) {
            return <Close sx={{ color: '#cbd5e1', fontSize: 24 }} />;
        }
        return (
            <Chip
                label={value}
                size="small"
                sx={{
                    bgcolor: '#f1f5f9',
                    fontWeight: 600,
                }}
            />
        );
    };

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
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#3b82f6',
                            fontWeight: 700,
                            letterSpacing: 2,
                        }}
                    >
                        PLANES Y PRECIOS
                    </Typography>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 800,
                            mt: 1,
                            mb: 2,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Elige el Plan Perfecto
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
                        Todos los planes incluyen materiales de calidad y mano de obra especializada
                    </Typography>

                    {/* Billing Toggle */}
                    <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                        <Typography fontWeight={600} color={!isYearly ? 'primary' : 'text.secondary'}>
                            Proyecto único
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isYearly}
                                    onChange={(e) => setIsYearly(e.target.checked)}
                                />
                            }
                            label=""
                        />
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography fontWeight={600} color={isYearly ? 'primary' : 'text.secondary'}>
                                Contrato anual
                            </Typography>
                            <Chip
                                label="Ahorra 15%"
                                size="small"
                                color="success"
                                sx={{ fontWeight: 700 }}
                            />
                        </Stack>
                    </Stack>
                </Box>
            </motion.div>

            {/* Plans Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {plans.map((plan, index) => (
                    <Grid item xs={12} md={4} key={plan.id}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -8 }}
                        >
                            <Card
                                sx={{
                                    height: '100%',
                                    position: 'relative',
                                    border: plan.popular ? `3px solid ${plan.color}` : '1px solid #e2e8f0',
                                    transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: plan.popular
                                        ? `0 20px 60px ${plan.color}30`
                                        : '0 8px 32px rgba(0,0,0,0.08)',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        boxShadow: `0 20px 60px ${plan.color}30`,
                                    },
                                }}
                            >
                                {plan.popular && (
                                    <Chip
                                        icon={<Star />}
                                        label="MÁS POPULAR"
                                        sx={{
                                            position: 'absolute',
                                            top: -12,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            bgcolor: plan.color,
                                            color: 'white',
                                            fontWeight: 700,
                                            zIndex: 1,
                                        }}
                                    />
                                )}

                                <Box sx={{ p: 4 }}>
                                    {/* Plan Header */}
                                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                                        <Typography
                                            variant="h5"
                                            fontWeight={700}
                                            gutterBottom
                                            sx={{ color: plan.color }}
                                        >
                                            {plan.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {plan.tagline}
                                        </Typography>
                                        <Box sx={{ my: 3 }}>
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={isYearly ? 'yearly' : 'monthly'}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Typography variant="h3" fontWeight={800} color={plan.color}>
                                                        €{isYearly ? plan.price.yearly.toLocaleString() : plan.price.monthly.toLocaleString()}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {isYearly ? '/ año' : '/ proyecto'}
                                                    </Typography>
                                                </motion.div>
                                            </AnimatePresence>
                                        </Box>
                                    </Box>

                                    {/* Key Features */}
                                    <Stack spacing={2} sx={{ mb: 4 }}>
                                        {Object.entries(plan.features)
                                            .slice(0, 5)
                                            .map(([feature, value]) => (
                                                <Stack
                                                    key={feature}
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                >
                                                    {value !== false && value !== true ? (
                                                        <Info sx={{ fontSize: 20, color: plan.color }} />
                                                    ) : (
                                                        renderFeatureValue(value)
                                                    )}
                                                    <Typography variant="body2">
                                                        {feature}
                                                        {typeof value === 'string' && `: ${value}`}
                                                    </Typography>
                                                </Stack>
                                            ))}
                                    </Stack>

                                    {/* CTA Button */}
                                    <Button
                                        fullWidth
                                        variant={plan.popular ? 'contained' : 'outlined'}
                                        size="large"
                                        onClick={() => onSelectPlan?.(plan)}
                                        sx={{
                                            py: 1.5,
                                            fontWeight: 700,
                                            ...(plan.popular && {
                                                background: `linear-gradient(135deg, ${plan.color} 0%, ${plan.color}DD 100%)`,
                                            }),
                                            ...(!plan.popular && {
                                                borderColor: plan.color,
                                                color: plan.color,
                                            }),
                                        }}
                                    >
                                        {plan.popular ? 'Comenzar Ahora' : 'Seleccionar Plan'}
                                    </Button>
                                </Box>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            {/* Comparison Table Toggle */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Button
                    variant="outlined"
                    onClick={() => setShowComparison(!showComparison)}
                    size="large"
                    sx={{
                        borderColor: '#3b82f6',
                        color: '#3b82f6',
                        '&:hover': {
                            bgcolor: 'rgba(59, 130, 246, 0.05)',
                        },
                    }}
                >
                    {showComparison ? 'Ocultar' : 'Ver'} Comparación Detallada
                </Button>
            </Box>

            {/* Detailed Comparison Table */}
            <AnimatePresence>
                {showComparison && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <TableContainer
                            component={Paper}
                            sx={{
                                borderRadius: 3,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                            }}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>Característica</TableCell>
                                        {plans.map((plan) => (
                                            <TableCell
                                                key={plan.id}
                                                align="center"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: plan.color,
                                                }}
                                            >
                                                {plan.name}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.keys(plans[0].features).map((feature) => (
                                        <TableRow key={feature} hover>
                                            <TableCell sx={{ fontWeight: 500 }}>{feature}</TableCell>
                                            {plans.map((plan) => (
                                                <TableCell key={plan.id} align="center">
                                                    {renderFeatureValue(plan.features[feature])}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};

export default PlanComparator;
