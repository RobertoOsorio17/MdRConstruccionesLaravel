import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

export default function AnimatedGradient({ colors = ['#667eea', '#764ba2', '#f093fb'], duration = 20 }) {
    return (
        <Box
            component={motion.div}
            animate={{
                background: [
                    `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
                    `linear-gradient(135deg, ${colors[1]} 0%, ${colors[2]} 50%, ${colors[0]} 100%)`,
                    `linear-gradient(135deg, ${colors[2]} 0%, ${colors[0]} 50%, ${colors[1]} 100%)`,
                    `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
                ],
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                ease: 'linear',
            }}
            sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
            }}
        />
    );
}

