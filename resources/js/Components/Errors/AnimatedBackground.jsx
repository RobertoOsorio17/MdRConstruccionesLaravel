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
    // ✅ FIX: Pre-calculate positions and sizes outside render to avoid Math.random() causing re-renders
    const floatingElements = React.useMemo(() => [
        { top: '15%', left: '10%', width: 80, height: 80 },
        { top: '45%', left: '75%', width: 120, height: 120 },
        { top: '70%', left: '20%', width: 100, height: 100 },
        { top: '25%', left: '85%', width: 90, height: 90 },
        { top: '80%', left: '60%', width: 110, height: 110 },
        { top: '55%', left: '40%', width: 70, height: 70 },
    ], []);

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
            {floatingElements.map((element, i) => (
                <motion.div
                    key={i}
                    variants={floatingVariants}
                    animate="animate"
                    style={{
                        position: 'absolute',
                        top: element.top,
                        left: element.left,
                        width: `${element.width}px`,
                        height: `${element.height}px`,
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
