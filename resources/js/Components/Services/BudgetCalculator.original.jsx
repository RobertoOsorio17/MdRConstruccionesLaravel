import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Chip,
    Button,
    Grid,
    Paper,
    Divider,
    Alert,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Collapse,
} from '@mui/material';
import {
    Calculate,
    CheckCircle,
    TrendingUp,
    Schedule,
    Euro,
    Info,
    Download,
    Send,
    ExpandMore,
    ExpandLess,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const BudgetCalculator = ({ serviceType = "general", onRequestQuote }) => {
    const [area, setArea] = useState(50);
    const [quality, setQuality] = useState('standard');
    const [timeline, setTimeline] = useState('normal');
    const [extras, setExtras] = useState([]);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [estimatedBudget, setEstimatedBudget] = useState(0);

    // Pricing configuration
    const pricePerM2 = {
        basic: 80,
        standard: 120,
        premium: 180,
        luxury: 250,
    };

    const timelineMultiplier = {
        urgent: 1.5,
        normal: 1,
        flexible: 0.9,
    };

    const extraOptions = [
        { id: 'design', label: 'Diseño personalizado', price: 1500 },
        { id: 'materials', label: 'Materiales premium', price: 2000 },
        { id: 'warranty', label: 'Garantía extendida (3 años)', price: 800 },
        { id: 'maintenance', label: 'Mantenimiento anual', price: 600 },
        { id: 'eco', label: 'Materiales ecológicos', price: 1200 },
    ];

    // Calculate budget
    useEffect(() => {
        let base = area * (pricePerM2[quality] || 120);
        base *= timelineMultiplier[timeline] || 1;

        const extrasTotal = extras.reduce((sum, extraId) => {
            const extra = extraOptions.find(e => e.id === extraId);
            return sum + (extra?.price || 0);
        }, 0);

        setEstimatedBudget(base + extrasTotal);
    }, [area, quality, timeline, extras]);

    const handleExtraToggle = (extraId) => {
        setExtras(prev =>
            prev.includes(extraId)
                ? prev.filter(id => id !== extraId)
                : [...prev, extraId]
        );
    };

    const breakdown = [
        {
            label: 'Área del proyecto',
            value: `${area} m²`,
            price: area * (pricePerM2[quality] || 120),
        },
        {
            label: 'Calidad de materiales',
            value: quality === 'basic' ? 'Básica' : quality === 'standard' ? 'Estándar' : quality === 'premium' ? 'Premium' : 'Lujo',
            price: 0,
        },
        {
            label: 'Ajuste por plazo',
            value: timeline === 'urgent' ? 'Urgente (+50%)' : timeline === 'normal' ? 'Normal' : 'Flexible (-10%)',
            price: area * (pricePerM2[quality] || 120) * (timelineMultiplier[timeline] - 1),
        },
        ...extras.map(extraId => {
            const extra = extraOptions.find(e => e.id === extraId);
            return {
                label: extra?.label || '',
                value: 'Extra',
                price: extra?.price || 0,
            };
        }),
    ];

    return (
        <Card
            sx={{
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    p: 3,
                    color: 'white',
                }}
            >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                    <Calculate sx={{ fontSize: 40 }} />
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                            Calculadora de Presupuesto
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Obtén una estimación instantánea personalizada
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            <CardContent sx={{ p: 4 }}>
                <Grid container spacing={4}>
                    {/* Calculator Controls */}
                    <Grid item xs={12} md={7}>
                        <Stack spacing={4}>
                            {/* Area Slider */}
                            <Box>
                                <Typography gutterBottom fontWeight={600}>
                                    Área del proyecto (m²)
                                </Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Slider
                                        value={area}
                                        onChange={(e, val) => setArea(val)}
                                        min={10}
                                        max={500}
                                        step={5}
                                        marks={[
                                            { value: 10, label: '10' },
                                            { value: 250, label: '250' },
                                            { value: 500, label: '500' },
                                        ]}
                                        sx={{ flex: 1 }}
                                    />
                                    <Chip
                                        label={`${area} m²`}
                                        color="primary"
                                        sx={{ minWidth: 80, fontWeight: 700 }}
                                    />
                                </Stack>
                            </Box>

                            {/* Quality Select */}
                            <FormControl fullWidth>
                                <InputLabel>Calidad de materiales</InputLabel>
                                <Select
                                    value={quality}
                                    label="Calidad de materiales"
                                    onChange={(e) => setQuality(e.target.value)}
                                >
                                    <MenuItem value="basic">
                                        <Stack direction="row" justifyContent="space-between" sx={{ width: '100%' }}>
                                            <span>Básica</span>
                                            <span style={{ color: '#64748b' }}>€{pricePerM2.basic}/m²</span>
                                        </Stack>
                                    </MenuItem>
                                    <MenuItem value="standard">
                                        <Stack direction="row" justifyContent="space-between" sx={{ width: '100%' }}>
                                            <span>Estándar</span>
                                            <span style={{ color: '#64748b' }}>€{pricePerM2.standard}/m²</span>
                                        </Stack>
                                    </MenuItem>
                                    <MenuItem value="premium">
                                        <Stack direction="row" justifyContent="space-between" sx={{ width: '100%' }}>
                                            <span>Premium</span>
                                            <span style={{ color: '#64748b' }}>€{pricePerM2.premium}/m²</span>
                                        </Stack>
                                    </MenuItem>
                                    <MenuItem value="luxury">
                                        <Stack direction="row" justifyContent="space-between" sx={{ width: '100%' }}>
                                            <span>Lujo</span>
                                            <span style={{ color: '#64748b' }}>€{pricePerM2.luxury}/m²</span>
                                        </Stack>
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            {/* Timeline Select */}
                            <FormControl fullWidth>
                                <InputLabel>Plazo de ejecución</InputLabel>
                                <Select
                                    value={timeline}
                                    label="Plazo de ejecución"
                                    onChange={(e) => setTimeline(e.target.value)}
                                >
                                    <MenuItem value="urgent">Urgente (&lt; 1 mes) +50%</MenuItem>
                                    <MenuItem value="normal">Normal (1-3 meses)</MenuItem>
                                    <MenuItem value="flexible">Flexible (&gt; 3 meses) -10%</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Extras */}
                            <Box>
                                <Typography gutterBottom fontWeight={600} sx={{ mb: 2 }}>
                                    Servicios adicionales
                                </Typography>
                                <Stack spacing={1}>
                                    {extraOptions.map(extra => (
                                        <Paper
                                            key={extra.id}
                                            onClick={() => handleExtraToggle(extra.id)}
                                            sx={{
                                                p: 2,
                                                cursor: 'pointer',
                                                border: extras.includes(extra.id)
                                                    ? '2px solid #3b82f6'
                                                    : '2px solid transparent',
                                                bgcolor: extras.includes(extra.id)
                                                    ? 'rgba(59, 130, 246, 0.05)'
                                                    : 'transparent',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    bgcolor: 'rgba(59, 130, 246, 0.05)',
                                                    transform: 'translateX(4px)',
                                                },
                                            }}
                                        >
                                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <CheckCircle
                                                        sx={{
                                                            color: extras.includes(extra.id) ? '#3b82f6' : '#cbd5e1',
                                                        }}
                                                    />
                                                    <Typography fontWeight={500}>
                                                        {extra.label}
                                                    </Typography>
                                                </Stack>
                                                <Chip
                                                    label={`+€${extra.price}`}
                                                    size="small"
                                                    color={extras.includes(extra.id) ? 'primary' : 'default'}
                                                />
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        </Stack>
                    </Grid>

                    {/* Result Panel */}
                    <Grid item xs={12} md={5}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Paper
                                sx={{
                                    p: 3,
                                    background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
                                    borderRadius: 3,
                                    position: 'sticky',
                                    top: 20,
                                }}
                            >
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    Presupuesto Estimado
                                </Typography>

                                <motion.div
                                    key={estimatedBudget}
                                    initial={{ scale: 1.2, color: '#10b981' }}
                                    animate={{ scale: 1, color: '#0f172a' }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Typography
                                        variant="h2"
                                        sx={{
                                            fontWeight: 800,
                                            color: '#3b82f6',
                                            my: 2,
                                        }}
                                    >
                                        €{estimatedBudget.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                                    </Typography>
                                </motion.div>

                                <Alert severity="info" icon={<Info />} sx={{ mb: 2 }}>
                                    Esta es una estimación. El presupuesto final puede variar según las especificaciones del proyecto.
                                </Alert>

                                <Divider sx={{ my: 2 }} />

                                {/* Breakdown Toggle */}
                                <Button
                                    fullWidth
                                    variant="text"
                                    onClick={() => setShowBreakdown(!showBreakdown)}
                                    endIcon={showBreakdown ? <ExpandLess /> : <ExpandMore />}
                                    sx={{ mb: 2 }}
                                >
                                    {showBreakdown ? 'Ocultar' : 'Ver'} desglose
                                </Button>

                                <Collapse in={showBreakdown}>
                                    <List dense>
                                        {breakdown.map((item, index) => (
                                            <ListItem key={index} sx={{ px: 0 }}>
                                                <ListItemText
                                                    primary={item.label}
                                                    secondary={item.value}
                                                />
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    color={item.price >= 0 ? 'text.primary' : 'error.main'}
                                                >
                                                    {item.price >= 0 ? '+' : ''}€{item.price.toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                                                </Typography>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>

                                <Stack spacing={2} sx={{ mt: 3 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        startIcon={<Send />}
                                        onClick={() => onRequestQuote?.({ area, quality, timeline, extras, estimatedBudget })}
                                        sx={{
                                            py: 1.5,
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        }}
                                    >
                                        Solicitar Presupuesto Oficial
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<Download />}
                                        sx={{ py: 1.5 }}
                                    >
                                        Descargar Estimación PDF
                                    </Button>
                                </Stack>

                                <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2 }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <TrendingUp sx={{ color: '#10b981' }} />
                                        <Typography variant="caption" fontWeight={600}>
                                            Incluye IVA y todos los permisos necesarios
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Paper>
                        </motion.div>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default BudgetCalculator;
