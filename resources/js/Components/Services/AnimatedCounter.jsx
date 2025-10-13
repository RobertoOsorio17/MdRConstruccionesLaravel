import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

const AnimatedCounter = ({ value, duration = 2, suffix = '', prefix = '' }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (!isInView) return;

        // Parse numeric value from string (e.g., "150+" -> 150)
        const numericValue = typeof value === 'string'
            ? parseFloat(value.replace(/[^0-9.]/g, ''))
            : value;

        let startTime = null;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(easeOutQuart * numericValue);

            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setDisplayValue(numericValue);
            }
        };

        requestAnimationFrame(animate);
    }, [isInView, value, duration]);

    return (
        <span ref={ref}>
            {prefix}{displayValue}{suffix}
        </span>
    );
};

const StatCard = ({ stat, index, theme }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
                delay: index * 0.1,
                duration: 0.5,
                type: "spring",
                stiffness: 100
            }}
        >
            <Box
                sx={{
                    p: 3,
                    textAlign: 'center',
                    background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)'
                        : `linear-gradient(135deg, ${theme.primary?.[50] || '#eff6ff'} 0%, rgba(255, 255, 255, 0.8) 100%)`,
                    border: (theme) => theme.palette.mode === 'dark'
                        ? '1px solid rgba(59, 130, 246, 0.2)'
                        : `1px solid ${theme.primary?.[200] || '#bfdbfe'}`,
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: (theme) => theme.palette.mode === 'dark'
                            ? '0 12px 40px rgba(59, 130, 246, 0.3)'
                            : `0 8px 25px ${theme.primary?.[500] || '#3b82f6'}20`
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: (theme) => theme.palette.mode === 'dark'
                            ? 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)'
                            : `linear-gradient(90deg, ${theme.primary?.[500] || '#3b82f6'} 0%, ${theme.primary?.[600] || '#2563eb'} 100%)`,
                    }
                }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                >
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: (theme) => theme.palette.mode === 'dark'
                                ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
                                : `linear-gradient(135deg, ${theme.primary?.[500] || '#3b82f6'} 0%, ${theme.primary?.[600] || '#2563eb'} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                            color: 'white',
                            boxShadow: (theme) => theme.palette.mode === 'dark'
                                ? '0 8px 20px rgba(59, 130, 246, 0.4)'
                                : `0 8px 20px ${theme.primary?.[500] || '#3b82f6'}40`
                        }}
                    >
                        {React.cloneElement(stat.icon, { fontSize: 'medium' })}
                    </Box>
                </motion.div>

                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 800,
                        color: (theme) => theme.palette.mode === 'dark'
                            ? '#60a5fa'
                            : theme.primary?.[600] || '#2563eb',
                        fontSize: { xs: '1.75rem', md: '2rem' },
                        mb: 1,
                        fontFeatureSettings: '"tnum"',
                        fontVariantNumeric: 'tabular-nums'
                    }}
                >
                    <AnimatedCounter
                        value={stat.value}
                        suffix={stat.value.toString().includes('+') ? '+' : stat.value.toString().includes('%') ? '%' : ''}
                    />
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        color: (theme) => theme.palette.mode === 'dark'
                            ? '#94a3b8'
                            : theme.secondary?.[600] || '#475569',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        lineHeight: 1.4
                    }}
                >
                    {stat.label}
                </Typography>
            </Box>
        </motion.div>
    );
};

export { AnimatedCounter, StatCard };
export default AnimatedCounter;
