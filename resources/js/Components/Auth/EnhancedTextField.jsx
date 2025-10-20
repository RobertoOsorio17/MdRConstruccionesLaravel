import React, { useState } from 'react';
import { TextField, InputAdornment, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

export default function EnhancedTextField({
    label,
    value,
    onChange,
    error,
    helperText,
    startIcon,
    endIcon,
    isValid = false,
    showValidation = false,
    ...props
}) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{ position: 'relative', mb: 3 }}
        >
            <TextField
                fullWidth
                label={label}
                value={value}
                onChange={onChange}
                error={error}
                helperText={helperText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                InputProps={{
                    startAdornment: startIcon && (
                        <InputAdornment position="start">
                            <Box
                                component={motion.div}
                                animate={{
                                    scale: isFocused ? 1.2 : 1,
                                    rotate: isFocused ? 10 : 0,
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                {startIcon}
                            </Box>
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <>
                            {showValidation && isValid && (
                                <InputAdornment position="end">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 260,
                                            damping: 20,
                                        }}
                                    >
                                        <CheckCircleIcon color="success" />
                                    </motion.div>
                                </InputAdornment>
                            )}
                            {endIcon && <InputAdornment position="end">{endIcon}</InputAdornment>}
                        </>
                    ),
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        },
                        '&.Mui-focused': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        transition: 'all 0.3s ease',
                        '&.Mui-focused': {
                            fontWeight: 600,
                        },
                    },
                }}
                {...props}
            />

            {/* Animated underline effect */}
            <AnimatePresence>
                {isFocused && (
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 2,
                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                            transformOrigin: 'left',
                        }}
                    />
                )}
            </AnimatePresence>
        </Box>
    );
}

