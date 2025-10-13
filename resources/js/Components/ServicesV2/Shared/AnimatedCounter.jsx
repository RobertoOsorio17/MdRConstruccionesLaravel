/**
 * AnimatedCounter Component
 * 
 * Contador animado que incrementa desde 0 hasta el valor final cuando
 * el elemento entra en el viewport. Usado para métricas y estadísticas.
 * 
 * Props:
 * - value: number - Valor final del contador
 * - duration: number - Duración de la animación en ms (default: 2000)
 * - suffix: string - Sufijo (ej: '+', '%', 'K', 'M')
 * - prefix: string - Prefijo (ej: '€', '$')
 * - decimals: number - Número de decimales (default: 0)
 * - separator: string - Separador de miles (default: ',')
 * - onComplete: function - Callback al completar animación
 */

import React, { useState, useEffect, useRef } from 'react';
import { Typography } from '@mui/material';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useIntersectionReveal } from '@/Hooks/useIntersectionReveal';

const AnimatedCounter = ({
    value = 0,
    duration = 2000,
    suffix = '',
    prefix = '',
    decimals = 0,
    separator = ',',
    onComplete = null,
    variant = 'h3',
    color = 'primary',
    fontWeight = 700,
    ...typographyProps
}) => {
    const [hasAnimated, setHasAnimated] = useState(false);
    const { ref, isVisible } = useIntersectionReveal({
        threshold: 0.5,
        triggerOnce: true
    });

    // Spring animation para el contador
    const spring = useSpring(0, {
        duration: duration,
        bounce: 0
    });

    // Transformar el valor del spring a número formateado
    const display = useTransform(spring, (latest) => {
        const num = latest.toFixed(decimals);
        const parts = num.split('.');
        
        // Agregar separador de miles
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
        
        return prefix + parts.join('.') + suffix;
    });

    useEffect(() => {
        if (isVisible && !hasAnimated) {
            spring.set(value);
            setHasAnimated(true);

            // Callback al completar
            if (onComplete) {
                setTimeout(() => {
                    onComplete();
                }, duration);
            }
        }
    }, [isVisible, hasAnimated, value, spring, duration, onComplete]);

    return (
        <Typography
            ref={ref}
            variant={variant}
            component={motion.span}
            color={color}
            fontWeight={fontWeight}
            {...typographyProps}
        >
            <motion.span>{display}</motion.span>
        </Typography>
    );
};

export default AnimatedCounter;

