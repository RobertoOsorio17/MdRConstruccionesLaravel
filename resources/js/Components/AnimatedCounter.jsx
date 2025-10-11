import React from 'react';
import CountUp from 'react-countup';
import { Typography, Box } from '@mui/material';
import { useInView } from 'react-intersection-observer';

const AnimatedCounter = ({ end, label, suffix = '', prefix = '', duration = 2 }) => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.5,
    });

    return (
        <Box ref={ref} sx={{ textAlign: 'center' }}>
            <Typography
                variant="h3"
                component="div"
                sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    mb: 1,
                }}
            >
                {prefix}
                {inView && (
                    <CountUp
                        start={0}
                        end={end}
                        duration={duration}
                        separator="."
                    />
                )}
                {suffix}
            </Typography>
            <Typography variant="h6" color="text.secondary">
                {label}
            </Typography>
        </Box>
    );
};

export default AnimatedCounter;