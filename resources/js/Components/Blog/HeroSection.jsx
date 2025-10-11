import React from 'react';
import { Box, Container, Typography, Button, Stack, Paper, TextField, InputAdornment, Breadcrumbs, Avatar, Grid } from '@mui/material';
import { Search as SearchIcon, Home as HomeIcon, Rocket as RocketIcon, TrendingUp as TrendingUpIcon, Build as BuildIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';

const HeroSection = ({ searchTerm, onSearchChange, featuredStats }) => {
    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    animation: 'backgroundMove 20s ease-in-out infinite',
                },
                '& .MuiContainer-root': {
                    position: 'relative',
                    zIndex: 2,
                }
            }}
        >
            <Container maxWidth="lg">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Breadcrumbs elegantes */}
                    <Breadcrumbs 
                        aria-label="breadcrumb" 
                        sx={{ 
                            color: 'rgba(255,255,255,0.8)', 
                            mb: 6,
                            '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.6)' }
                        }}
                    >
                        <Link 
                            href="/" 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                textDecoration: 'none',
                                color: 'inherit'
                            }}
                        >
                            <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
                            Inicio
                        </Link>
                        <Typography sx={{ color: 'white', fontWeight: 500 }}>
                            Blog
                        </Typography>
                    </Breadcrumbs>

                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <Stack spacing={4}>
                                {/* Título principal */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                >
                                    <Typography 
                                        variant="h1" 
                                        sx={{ 
                                            fontSize: { xs: '2.5rem', md: '4rem', lg: '4.5rem' },
                                            fontWeight: 800,
                                            lineHeight: 1.1,
                                            background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            mb: 2
                                        }}
                                    >
                                        Construyendo
                                        <br />
                                        tu futuro
                                    </Typography>
                                </motion.div>
                                
                                {/* Subtítulo */}
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                >
                                    <Typography 
                                        variant="h5" 
                                        sx={{
                                            fontSize: { xs: '1.25rem', md: '1.5rem' },
                                            fontWeight: 400,
                                            opacity: 0.9,
                                            lineHeight: 1.4,
                                            mb: 3
                                        }}
                                    >
                                        Descubre guías expertas, tendencias innovadoras y consejos prácticos 
                                        para transformar tu hogar con las mejores técnicas de construcción.
                                    </Typography>
                                </motion.div>

                                {/* Barra de búsqueda mejorada */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.6 }}
                                >
                                    <Paper 
                                        elevation={4}
                                        sx={{ 
                                            p: 1.5, 
                                            borderRadius: 8, 
                                            backgroundColor: 'rgba(255,255,255,0.95)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            '&:hover': {
                                                backgroundColor: 'white',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                                            },
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <TextField
                                                fullWidth
                                                placeholder="¿Qué quieres construir hoy?"
                                                value={searchTerm}
                                                onChange={onSearchChange}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SearchIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        border: 'none',
                                                        fontSize: '1.1rem',
                                                        '& fieldset': { border: 'none' },
                                                        '&:hover fieldset': { border: 'none' },
                                                        '&.Mui-focused fieldset': { border: 'none' }
                                                    }
                                                }}
                                            />
                                            <Button
                                                variant="contained"
                                                size="large"
                                                sx={{
                                                    borderRadius: 6,
                                                    px: 3,
                                                    py: 1.5,
                                                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                                                    '&:hover': {
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                                                    },
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                Buscar
                                            </Button>
                                        </Stack>
                                    </Paper>
                                </motion.div>

                                {/* Stats rápidas */}
                                {featuredStats && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: 0.8 }}
                                    >
                                        <Stack direction="row" spacing={4} sx={{ mt: 4 }}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h4" fontWeight="bold" color="white">
                                                    {featuredStats.totalPosts}+
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    Artículos
                                                </Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h4" fontWeight="bold" color="white">
                                                    {featuredStats.totalViews}k+
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    Lectores
                                                </Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h4" fontWeight="bold" color="white">
                                                    {featuredStats.totalCategories}
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                    Categorías
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </motion.div>
                                )}
                            </Stack>
                        </Grid>

                        {/* Lado derecho con elementos visuales */}
                        <Grid item xs={12} md={5}>
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                <Box sx={{ position: 'relative', display: { xs: 'none', md: 'block' } }}>
                                    {/* Elementos decorativos flotantes */}
                                    <motion.div
                                        animate={{ y: [0, -20, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        style={{ position: 'absolute', top: '10%', right: '10%' }}
                                    >
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(45deg, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.1) 90%)',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255,255,255,0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <BuildIcon sx={{ fontSize: 32, color: 'white' }} />
                                        </Box>
                                    </motion.div>

                                    <motion.div
                                        animate={{ y: [0, 20, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                        style={{ position: 'absolute', top: '50%', right: '30%' }}
                                    >
                                        <Box
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(45deg, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.05) 90%)',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <RocketIcon sx={{ fontSize: 24, color: 'white' }} />
                                        </Box>
                                    </motion.div>

                                    <motion.div
                                        animate={{ y: [0, -15, 0] }}
                                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                        style={{ position: 'absolute', bottom: '20%', right: '0%' }}
                                    >
                                        <Box
                                            sx={{
                                                width: 70,
                                                height: 70,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(45deg, rgba(255,255,255,0.25) 30%, rgba(255,255,255,0.15) 90%)',
                                                backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255,255,255,0.4)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <TrendingUpIcon sx={{ fontSize: 28, color: 'white' }} />
                                        </Box>
                                    </motion.div>
                                </Box>
                            </motion.div>
                        </Grid>
                    </Grid>
                </motion.div>
            </Container>

            {/* Keyframes para animación de fondo */}
            <style>{`
                @keyframes backgroundMove {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(-10px, -10px); }
                    50% { transform: translate(10px, -20px); }
                    75% { transform: translate(-5px, -15px); }
                }
            `}</style>
        </Box>
    );
};

export default HeroSection;