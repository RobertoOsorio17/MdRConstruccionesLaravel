import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

/**
 * AnimatedSection Component
 *
 * Componente para animar secciones con scroll reveal y stagger children
 *
 * @param {React.ReactNode} children - Contenido a animar
 * @param {string} direction - Dirección de animación: 'up', 'down', 'left', 'right', 'scale'
 * @param {number} delay - Delay inicial antes de animar (segundos)
 * @param {number} duration - Duración de la animación (segundos)
 * @param {string} className - Clases CSS adicionales
 * @param {boolean} staggerChildren - Activar stagger para hijos directos
 * @param {number} staggerDelay - Delay entre cada hijo (segundos)
 * @param {number} staggerDelayMultiplier - Multiplicador para delay incremental basado en índice
 * @param {number} maxStaggerDelay - Delay máximo para stagger (evita delays muy largos)
 * @param {number} threshold - Threshold para intersection observer (0-1)
 * @param {boolean} triggerOnce - Si la animación solo debe ocurrir una vez
 */
const AnimatedSection = ({
    children,
    direction = 'up',
    delay = 0,
    duration = 0.6,
    className = '',
    staggerChildren = false,
    staggerDelay = 0.1,
    staggerDelayMultiplier = 0.05,
    maxStaggerDelay = 0.5,
    threshold = 0.1,
    triggerOnce = true
}) => {
    const [ref, inView] = useInView({
        triggerOnce,
        threshold,
    });

    // Variantes para el contenedor
    const containerVariants = {
        hidden: {
            opacity: 0,
        },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.3,
                delay,
                when: "beforeChildren",
                staggerChildren: staggerChildren ? staggerDelay : 0,
            },
        },
    };

    // Variantes para elementos individuales (sin stagger)
    const itemVariants = {
        hidden: {
            opacity: 0,
            y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
            x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
            scale: direction === 'scale' ? 0.8 : 1,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            transition: {
                duration,
                ease: "easeOut",
            },
        },
    };

    // Variantes para hijos con stagger
    const childVariants = {
        hidden: {
            opacity: 0,
            y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
            x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0,
            scale: direction === 'scale' ? 0.9 : 1,
        },
        visible: (index = 0) => ({
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            transition: {
                duration: duration * 0.8,
                delay: Math.min(index * staggerDelayMultiplier, maxStaggerDelay),
                ease: "easeOut",
            },
        }),
    };

    // Si staggerChildren está activado, envolver hijos con motion.div
    const renderChildren = () => {
        if (!staggerChildren) {
            return children;
        }

        return React.Children.map(children, (child, index) => {
            if (!React.isValidElement(child)) {
                return child;
            }

            return (
                <motion.div
                    key={index}
                    variants={childVariants}
                    custom={index}
                >
                    {child}
                </motion.div>
            );
        });
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={staggerChildren ? containerVariants : itemVariants}
            className={className}
        >
            {renderChildren()}
        </motion.div>
    );
};

export default AnimatedSection;