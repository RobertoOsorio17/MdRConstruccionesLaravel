import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const THEME = {
    primary: {
        200: '#bfdbfe',
    },
    error: {
        100: '#fee2e2',
    }
};

const AnimatedBackground = () => {
    const floatingVariants = {
        animate: {
            y: [-10, 10, -10],
            rotate: [-2, 2, -2],
            transition: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <Box
            sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
                background: `linear-gradient(135deg, 
                    #eff6ff 0%, 
                    rgba(255, 255, 255, 0.9) 50%,
                    #fef2f2 100%
                )`
            }}
        >
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    variants={floatingVariants}
                    animate="animate"
                    style={{
                        position: 'absolute',
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        width: `${50 + Math.random() * 100}px`,
                        height: `${50 + Math.random() * 100}px`,
                        background: `radial-gradient(circle, ${THEME.primary[200]}40 0%, transparent 70%)`,
                        borderRadius: '50%',
                        filter: 'blur(1px)',
                    }}
                />
            ))}
        </Box>
    );
};

export default AnimatedBackground;
