import React, { useState, useRef } from 'react';
import { Box, Typography, Card, IconButton, Stack, Chip } from '@mui/material';
import { CompareArrows, ZoomIn } from '@mui/icons-material';
import { motion } from 'framer-motion';

const BeforeAfterSlider = ({ beforeImage, afterImage, title = "Transformación" }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const handleMove = (clientX) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = (x / rect.width) * 100;

        setSliderPosition(Math.min(Math.max(percentage, 0), 100));
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            handleMove(e.clientX);
        }
    };

    const handleTouchMove = (e) => {
        if (isDragging) {
            handleMove(e.touches[0].clientX);
        }
    };

    const handleStart = () => setIsDragging(true);
    const handleEnd = () => setIsDragging(false);

    return (
        <Card
            sx={{
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    p: 3,
                    color: 'white',
                    textAlign: 'center',
                }}
            >
                <CompareArrows sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>
                    {title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                    Desliza para ver el antes y después
                </Typography>
            </Box>

            {/* Slider Container */}
            <Box
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleEnd}
                sx={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '60%',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    touchAction: 'none',
                }}
            >
                {/* Before Image */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                    }}
                >
                    <img
                        src={beforeImage || '/images/before-default.jpg'}
                        alt="Antes"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                    <Chip
                        label="ANTES"
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            bgcolor: 'rgba(239, 68, 68, 0.9)',
                            color: 'white',
                            fontWeight: 700,
                        }}
                    />
                </Box>

                {/* After Image with Clip */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                        transition: isDragging ? 'none' : 'clip-path 0.1s ease',
                    }}
                >
                    <img
                        src={afterImage || '/images/after-default.jpg'}
                        alt="Después"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                    <Chip
                        label="DESPUÉS"
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            bgcolor: 'rgba(16, 185, 129, 0.9)',
                            color: 'white',
                            fontWeight: 700,
                        }}
                    />
                </Box>

                {/* Slider Handle */}
                <motion.div
                    animate={{
                        left: `${sliderPosition}%`,
                    }}
                    transition={{
                        type: isDragging ? 'tween' : 'spring',
                        duration: isDragging ? 0 : 0.1,
                    }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                    }}
                >
                    {/* Line */}
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            bgcolor: 'white',
                            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                        }}
                    />

                    {/* Handle Circle */}
                    <Box
                        onMouseDown={handleStart}
                        onTouchStart={handleStart}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            bgcolor: 'white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isDragging ? 'grabbing' : 'grab',
                            '&:hover': {
                                transform: 'translate(-50%, -50%) scale(1.1)',
                            },
                            transition: 'transform 0.2s ease',
                        }}
                    >
                        <CompareArrows
                            sx={{
                                fontSize: 32,
                                color: '#3b82f6',
                                transform: 'rotate(90deg)',
                            }}
                        />
                    </Box>
                </motion.div>
            </Box>

            {/* Instructions */}
            <Box
                sx={{
                    p: 2,
                    bgcolor: '#f8fafc',
                    textAlign: 'center',
                }}
            >
                <Typography variant="caption" color="text.secondary">
                    👆 Arrastra el control deslizante o toca para comparar
                </Typography>
            </Box>
        </Card>
    );
};

export default BeforeAfterSlider;
