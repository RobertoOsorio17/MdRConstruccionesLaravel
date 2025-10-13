import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Paper,
    Typography,
    Slider,
    Button,
    Stack,
    Grid,
    Card,
    CardContent,
    Chip,
    Tooltip,
    IconButton,
    Alert,
    Divider,
    ToggleButton,
    ToggleButtonGroup,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    useTheme,
    useMediaQuery,
    Fade,
    Zoom,
} from '@mui/material';
import {
    Calculate,
    Info,
    TrendingUp,
    Schedule,
    CheckCircle,
    Save,
    Share,
    Close,
    ArrowForward,
    CompareArrows,
    AttachMoney,
    Speed,
    Star,
    Build,
    Verified,
    LocalOffer,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Pricing configuration by service type
const PRICING_CONFIG = {
    'reforma-baños': {
        basePrice: 3500,
        pricePerSqm: 350,
        qualityMultipliers: { basic: 0.8, standard: 1, premium: 1.4, luxury: 2 },
        urgencyMultipliers: { normal: 1, priority: 1.15, urgent: 1.35 },
        minArea: 3,
        maxArea: 25,
        avgDuration: 15,
    },
    'reforma-cocinas': {
        basePrice: 5000,
        pricePerSqm: 450,
        qualityMultipliers: { basic: 0.8, standard: 1, premium: 1.5, luxury: 2.2 },
        urgencyMultipliers: { normal: 1, priority: 1.15, urgent: 1.35 },
        minArea: 8,
        maxArea: 30,
        avgDuration: 20,
    },
    'reformas-integrales': {
        basePrice: 12000,
        pricePerSqm: 600,
        qualityMultipliers: { basic: 0.75, standard: 1, premium: 1.6, luxury: 2.5 },
        urgencyMultipliers: { normal: 1, priority: 1.2, urgent: 1.4 },
        minArea: 40,
        maxArea: 200,
        avgDuration: 45,
    },
    'pintura': {
        basePrice: 1500,
        pricePerSqm: 25,
        qualityMultipliers: { basic: 0.7, standard: 1, premium: 1.3, luxury: 1.8 },
        urgencyMultipliers: { normal: 1, priority: 1.1, urgent: 1.25 },
        minArea: 20,
        maxArea: 300,
        avgDuration: 7,
    },
    default: {
        basePrice: 2500,
        pricePerSqm: 250,
        qualityMultipliers: { basic: 0.8, standard: 1, premium: 1.4, luxury: 2 },
        urgencyMultipliers: { normal: 1, priority: 1.15, urgent: 1.35 },
        minArea: 10,
        maxArea: 100,
        avgDuration: 14,
    },
};

// Extras configuration
const EXTRAS = [
    { id: 'design', label: 'Diseño 3D', price: 350, icon: '🎨' },
    { id: 'permits', label: 'Gestión de permisos', price: 450, icon: '📋' },
    { id: 'premium-materials', label: 'Materiales premium', price: 800, icon: '⭐' },
    { id: 'smart-home', label: 'Domótica básica', price: 650, icon: '🏠' },
    { id: 'lighting', label: 'Iluminación LED', price: 400, icon: '💡' },
    { id: 'warranty-plus', label: 'Garantía extendida 5 años', price: 300, icon: '🛡️' },
];

const BudgetCalculatorAdvanced = ({ serviceType = 'default', onRequestQuote }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    
    const config = PRICING_CONFIG[serviceType] || PRICING_CONFIG.default;
    
    const [area, setArea] = useState(Math.round((config.minArea + config.maxArea) / 2));
    const [quality, setQuality] = useState('standard');
    const [urgency, setUrgency] = useState('normal');
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [compareMode, setCompareMode] = useState(false);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Calculate budget
    const calculateBudget = (params = {}) => {
        const calcArea = params.area || area;
        const calcQuality = params.quality || quality;
        const calcUrgency = params.urgency || urgency;
        const calcExtras = params.extras || selectedExtras;

        const baseAmount = config.basePrice + (calcArea * config.pricePerSqm);
        const qualityAmount = baseAmount * config.qualityMultipliers[calcQuality];
        const urgencyAmount = qualityAmount * config.urgencyMultipliers[calcUrgency];
        const extrasAmount = calcExtras.reduce((sum, extraId) => {
            const extra = EXTRAS.find(e => e.id === extraId);
            return sum + (extra?.price || 0);
        }, 0);

        const subtotal = urgencyAmount;
        const total = subtotal + extrasAmount;
        
        const duration = Math.round(
            config.avgDuration * config.qualityMultipliers[calcQuality] / config.urgencyMultipliers[calcUrgency]
        );

        return {
            subtotal: Math.round(subtotal),
            extrasAmount: Math.round(extrasAmount),
            total: Math.round(total),
            duration,
            breakdown: {
                base: Math.round(config.basePrice),
                area: Math.round(calcArea * config.pricePerSqm),
                quality: Math.round((qualityAmount - baseAmount)),
                urgency: Math.round((urgencyAmount - qualityAmount)),
                extras: Math.round(extrasAmount),
            }
        };
    };

    const budget = calculateBudget();
    const basicBudget = calculateBudget({ quality: 'basic', extras: [] });
    const premiumBudget = calculateBudget({ quality: 'premium', extras: ['design', 'premium-materials'] });

    // Chart data
    const chartData = [
        { name: 'Base', value: budget.breakdown.base, color: '#3b82f6' },
        { name: 'Área', value: budget.breakdown.area, color: '#8b5cf6' },
        { name: 'Calidad', value: budget.breakdown.quality, color: '#10b981' },
        { name: 'Urgencia', value: budget.breakdown.urgency, color: '#f59e0b' },
        { name: 'Extras', value: budget.breakdown.extras, color: '#ec4899' },
    ].filter(item => item.value > 0);

    const handleExtraToggle = (extraId) => {
        setSelectedExtras(prev => 
            prev.includes(extraId) 
                ? prev.filter(id => id !== extraId)
                : [...prev, extraId]
        );
    };

    const handleSave = () => {
        if (email) {
            // Store in localStorage
            const savedBudgets = JSON.parse(localStorage.getItem('savedBudgets') || '[]');
            savedBudgets.push({
                date: new Date().toISOString(),
                email,
                serviceType,
                area,
                quality,
                urgency,
                extras: selectedExtras,
                budget: budget.total,
            });
            localStorage.setItem('savedBudgets', JSON.stringify(savedBudgets));
            
            setShowSuccess(true);
            setSaveDialogOpen(false);
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };

    const handleShare = () => {
        const shareText = `Presupuesto estimado: €${budget.total.toLocaleString()}
Área: ${area}m² | Calidad: ${quality} | Duración: ${budget.duration} días`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Mi presupuesto estimado',
                text: shareText,
            });
        } else {
            navigator.clipboard.writeText(shareText);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };

    const handleRequestQuote = () => {
        if (onRequestQuote) {
            onRequestQuote({
                area,
                quality,
                urgency,
                extras: selectedExtras,
                estimatedBudget: budget.total,
                duration: budget.duration,
            });
        }
    };

    return (
        <Paper 
            elevation={0}
            sx={{ 
                p: { xs: 3, md: 5 }, 
                borderRadius: 4,
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid rgba(59, 130, 246, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                }
            }}
        >
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                            }}
                        >
                            <Calculate sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                Calculadora de Presupuesto
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Obtén una estimación personalizada en segundos
                            </Typography>
                        </Box>
                    </Stack>
                    
                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Comparar planes">
                            <IconButton 
                                onClick={() => setCompareMode(!compareMode)}
                                sx={{ 
                                    bgcolor: compareMode ? '#eff6ff' : 'transparent',
                                    color: compareMode ? '#3b82f6' : 'inherit',
                                }}
                            >
                                <CompareArrows />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Guardar estimación">
                            <IconButton onClick={() => setSaveDialogOpen(true)}>
                                <Save />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Compartir">
                            <IconButton onClick={handleShare}>
                                <Share />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
            </Box>

            <Grid container spacing={4}>
                {/* Left Column - Inputs */}
                <Grid item xs={12} md={6}>
                    <Stack spacing={4}>
                        {/* Area Slider */}
                        <Box>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="h6" fontWeight={600}>
                                        Área del proyecto
                                    </Typography>
                                    <Tooltip title="Especifica el área total en metros cuadrados">
                                        <Info sx={{ fontSize: 18, color: '#64748b', cursor: 'help' }} />
                                    </Tooltip>
                                </Stack>
                                <Chip 
                                    label={`${area} m²`} 
                                    sx={{ 
                                        fontWeight: 700,
                                        fontSize: '1.1rem',
                                        bgcolor: '#eff6ff',
                                        color: '#3b82f6',
                                    }} 
                                />
                            </Stack>
                            <Slider
                                value={area}
                                onChange={(e, value) => setArea(value)}
                                min={config.minArea}
                                max={config.maxArea}
                                marks={[
                                    { value: config.minArea, label: `${config.minArea}m²` },
                                    { value: config.maxArea, label: `${config.maxArea}m²` },
                                ]}
                                valueLabelDisplay="auto"
                                sx={{
                                    '& .MuiSlider-thumb': {
                                        width: 24,
                                        height: 24,
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    },
                                    '& .MuiSlider-track': {
                                        background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                                    },
                                }}
                            />
                        </Box>

                        {/* Quality Selection */}
                        <Box>
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                <Typography variant="h6" fontWeight={600}>
                                    Nivel de calidad
                                </Typography>
                                <Tooltip title="Elige el nivel de acabados y materiales">
                                    <Info sx={{ fontSize: 18, color: '#64748b', cursor: 'help' }} />
                                </Tooltip>
                            </Stack>
                            <ToggleButtonGroup
                                value={quality}
                                exclusive
                                onChange={(e, value) => value && setQuality(value)}
                                fullWidth
                                sx={{ 
                                    '& .MuiToggleButton-root': {
                                        py: 2,
                                        flexDirection: 'column',
                                        gap: 0.5,
                                    }
                                }}
                            >
                                <ToggleButton value="basic">
                                    <Typography variant="body2" fontWeight={600}>Básico</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        -20%
                                    </Typography>
                                </ToggleButton>
                                <ToggleButton value="standard">
                                    <Chip label="POPULAR" size="small" sx={{ mb: 0.5, height: 18 }} />
                                    <Typography variant="body2" fontWeight={600}>Estándar</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Base
                                    </Typography>
                                </ToggleButton>
                                <ToggleButton value="premium">
                                    <Typography variant="body2" fontWeight={600}>Premium</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        +40%
                                    </Typography>
                                </ToggleButton>
                                <ToggleButton value="luxury">
                                    <Star sx={{ fontSize: 16, mb: 0.5 }} />
                                    <Typography variant="body2" fontWeight={600}>Lujo</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        +100%
                                    </Typography>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        {/* Urgency Selection */}
                        <Box>
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                <Typography variant="h6" fontWeight={600}>
                                    Plazo de ejecución
                                </Typography>
                                <Tooltip title="La urgencia afecta al precio final">
                                    <Info sx={{ fontSize: 18, color: '#64748b', cursor: 'help' }} />
                                </Tooltip>
                            </Stack>
                            <ToggleButtonGroup
                                value={urgency}
                                exclusive
                                onChange={(e, value) => value && setUrgency(value)}
                                fullWidth
                            >
                                <ToggleButton value="normal">
                                    <Stack alignItems="center">
                                        <Schedule sx={{ mb: 0.5 }} />
                                        <Typography variant="body2" fontWeight={600}>Normal</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Sin coste extra
                                        </Typography>
                                    </Stack>
                                </ToggleButton>
                                <ToggleButton value="priority">
                                    <Stack alignItems="center">
                                        <Speed sx={{ mb: 0.5 }} />
                                        <Typography variant="body2" fontWeight={600}>Prioritario</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            +15%
                                        </Typography>
                                    </Stack>
                                </ToggleButton>
                                <ToggleButton value="urgent">
                                    <Stack alignItems="center">
                                        <TrendingUp sx={{ mb: 0.5 }} />
                                        <Typography variant="body2" fontWeight={600}>Urgente</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            +35%
                                        </Typography>
                                    </Stack>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        {/* Extras */}
                        <Box>
                            <Typography variant="h6" fontWeight={600} mb={2}>
                                Servicios adicionales
                            </Typography>
                            <Grid container spacing={1}>
                                {EXTRAS.map(extra => (
                                    <Grid item xs={12} sm={6} key={extra.id}>
                                        <Card
                                            onClick={() => handleExtraToggle(extra.id)}
                                            sx={{
                                                cursor: 'pointer',
                                                border: selectedExtras.includes(extra.id) 
                                                    ? '2px solid #3b82f6' 
                                                    : '1px solid #e2e8f0',
                                                bgcolor: selectedExtras.includes(extra.id) 
                                                    ? '#eff6ff' 
                                                    : 'white',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    borderColor: '#3b82f6',
                                                    transform: 'translateY(-2px)',
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography sx={{ fontSize: '1.5rem' }}>
                                                        {extra.icon}
                                                    </Typography>
                                                    <Box flex={1}>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {extra.label}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            +€{extra.price}
                                                        </Typography>
                                                    </Box>
                                                    {selectedExtras.includes(extra.id) && (
                                                        <CheckCircle sx={{ color: '#3b82f6', fontSize: 20 }} />
                                                    )}
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Stack>
                </Grid>

                {/* Right Column - Results */}
                <Grid item xs={12} md={6}>
                    <Stack spacing={3}>
                        {/* Main Result Card */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                        >
                            <Card 
                                sx={{ 
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    color: 'white',
                                }}
                            >
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="overline" sx={{ opacity: 0.9 }}>
                                        Presupuesto Estimado
                                    </Typography>
                                    <Typography variant="h2" sx={{ fontWeight: 800, my: 1 }}>
                                        €{budget.total.toLocaleString()}
                                    </Typography>
                                    <Stack direction="row" spacing={3} mt={2}>
                                        <Box>
                                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                                Duración
                                            </Typography>
                                            <Typography variant="h6" fontWeight={600}>
                                                {budget.duration} días
                                            </Typography>
                                        </Box>
                                        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                                        <Box>
                                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                                Precio/m²
                                            </Typography>
                                            <Typography variant="h6" fontWeight={600}>
                                                €{Math.round(budget.total / area)}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Chart */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} mb={2}>
                                    Desglose de costos
                                </Typography>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            formatter={(value) => `€${value.toLocaleString()}`}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                                
                                <Divider sx={{ my: 2 }} />
                                
                                <List dense>
                                    <ListItem>
                                        <ListItemText 
                                            primary="Subtotal sin extras"
                                            secondary={`€${budget.subtotal.toLocaleString()}`}
                                        />
                                    </ListItem>
                                    {budget.extrasAmount > 0 && (
                                        <ListItem>
                                            <ListItemText 
                                                primary="Servicios adicionales"
                                                secondary={`+€${budget.extrasAmount.toLocaleString()}`}
                                            />
                                        </ListItem>
                                    )}
                                </List>
                            </CardContent>
                        </Card>

                        {/* Compare Mode */}
                        <AnimatePresence>
                            {compareMode && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <Card sx={{ bgcolor: '#f8fafc' }}>
                                        <CardContent>
                                            <Typography variant="h6" fontWeight={600} mb={2}>
                                                Comparación de Planes
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={4}>
                                                    <Box textAlign="center">
                                                        <Typography variant="caption" color="text.secondary">
                                                            Básico
                                                        </Typography>
                                                        <Typography variant="h6" fontWeight={700} color="primary">
                                                            €{basicBudget.total.toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Box textAlign="center">
                                                        <Chip label="TU PLAN" size="small" sx={{ mb: 0.5 }} />
                                                        <Typography variant="h6" fontWeight={700}>
                                                            €{budget.total.toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Box textAlign="center">
                                                        <Typography variant="caption" color="text.secondary">
                                                            Premium
                                                        </Typography>
                                                        <Typography variant="h6" fontWeight={700} color="secondary">
                                                            €{premiumBudget.total.toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Features List */}
                        <Card sx={{ bgcolor: '#f0fdf4', border: '1px solid #86efac' }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} mb={2} sx={{ color: '#166534' }}>
                                    ✓ Incluido en tu presupuesto
                                </Typography>
                                <List dense>
                                    {[
                                        'Visita técnica gratuita',
                                        'Presupuesto detallado',
                                        'Materiales de calidad',
                                        'Limpieza final',
                                        'Garantía de 2 años',
                                    ].map((item, index) => (
                                        <ListItem key={index}>
                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                                            </ListItemIcon>
                                            <ListItemText primary={item} />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>

                        {/* CTA Button */}
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            endIcon={<ArrowForward />}
                            onClick={handleRequestQuote}
                            sx={{
                                py: 2,
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 12px 35px rgba(16, 185, 129, 0.4)',
                                }
                            }}
                        >
                            Solicitar Presupuesto Detallado
                        </Button>

                        <Alert severity="info" icon={<Verified />}>
                            Este presupuesto es orientativo. El precio final se determinará tras la visita técnica.
                        </Alert>
                    </Stack>
                </Grid>
            </Grid>

            {/* Save Dialog */}
            <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
                <DialogTitle>
                    Guardar Estimación
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Ingresa tu email para guardar esta estimación y recibirla por correo.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSaveDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button variant="contained" onClick={handleSave} disabled={!email}>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Snackbar */}
            <Zoom in={showSuccess}>
                <Alert 
                    severity="success"
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 9999,
                        boxShadow: 6,
                    }}
                    onClose={() => setShowSuccess(false)}
                >
                    ¡Estimación guardada exitosamente!
                </Alert>
            </Zoom>
        </Paper>
    );
};

export default BudgetCalculatorAdvanced;
