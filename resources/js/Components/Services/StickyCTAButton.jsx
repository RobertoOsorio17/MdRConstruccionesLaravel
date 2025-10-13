import React, { useState, useEffect } from 'react';
import {
    Box,
    Fab,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Tooltip,
    Zoom,
    useScrollTrigger
} from '@mui/material';
import {
    Phone as PhoneIcon,
    WhatsApp as WhatsAppIcon,
    Email as EmailIcon,
    RequestQuote as QuoteIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const StickyCTAButton = ({ onQuoteClick, phoneNumber = '1234567890', email = 'info@mdr.com' }) => {
    const [open, setOpen] = useState(false);
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 300
    });

    const actions = [
        {
            icon: <WhatsAppIcon />,
            name: 'WhatsApp',
            color: '#25D366',
            action: () => window.open(`https://wa.me/${phoneNumber}`, '_blank')
        },
        {
            icon: <PhoneIcon />,
            name: 'Llamar',
            color: '#3b82f6',
            action: () => window.location.href = `tel:${phoneNumber}`
        },
        {
            icon: <EmailIcon />,
            name: 'Email',
            color: '#6366f1',
            action: () => window.location.href = `mailto:${email}`
        },
        {
            icon: <QuoteIcon />,
            name: 'Presupuesto',
            color: '#f59e0b',
            action: onQuoteClick || (() => {
                const form = document.getElementById('quote-form');
                if (form) {
                    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            })
        }
    ];

    return (
        <AnimatePresence>
            {trigger && (
                <motion.div
                    initial={{ opacity: 0, scale: 0, y: 100 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0, y: 100 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                    }}
                    style={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 1300
                    }}
                >
                    <SpeedDial
                        ariaLabel="Acciones rápidas"
                        icon={<SpeedDialIcon openIcon={<CloseIcon />} />}
                        onClose={() => setOpen(false)}
                        onOpen={() => setOpen(true)}
                        open={open}
                        direction="up"
                        FabProps={{
                            sx: {
                                background: 'linear-gradient(135deg, #f59e0b 0%, #f59e0b 100%)',
                                color: 'white',
                                width: 64,
                                height: 64,
                                boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #d97706 0%, #d97706 100%)',
                                    transform: 'scale(1.1)',
                                    boxShadow: '0 12px 40px rgba(245, 158, 11, 0.5)'
                                },
                                animation: 'pulse 2s infinite',
                                '@keyframes pulse': {
                                    '0%, 100%': {
                                        boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)'
                                    },
                                    '50%': {
                                        boxShadow: '0 8px 32px rgba(245, 158, 11, 0.7), 0 0 0 8px rgba(245, 158, 11, 0.2)'
                                    }
                                }
                            }
                        }}
                    >
                        {actions.map((action, index) => (
                            <SpeedDialAction
                                key={action.name}
                                icon={action.icon}
                                tooltipTitle={action.name}
                                tooltipOpen
                                onClick={() => {
                                    action.action();
                                    setOpen(false);
                                }}
                                FabProps={{
                                    sx: {
                                        bgcolor: action.color,
                                        color: 'white',
                                        width: 48,
                                        height: 48,
                                        '&:hover': {
                                            bgcolor: action.color,
                                            filter: 'brightness(1.1)',
                                            transform: 'scale(1.1)'
                                        },
                                        boxShadow: `0 4px 16px ${action.color}40`,
                                        transition: 'all 0.3s ease'
                                    }
                                }}
                                sx={{
                                    '& .MuiSpeedDialAction-staticTooltipLabel': {
                                        whiteSpace: 'nowrap',
                                        background: 'rgba(0, 0, 0, 0.87)',
                                        color: 'white',
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: 2,
                                        fontSize: '0.875rem',
                                        fontWeight: 500
                                    }
                                }}
                            />
                        ))}
                    </SpeedDial>

                    {/* Tooltip hint cuando está cerrado */}
                    {!open && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            style={{
                                position: 'absolute',
                                right: '100%',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                marginRight: 16,
                                background: 'rgba(0, 0, 0, 0.87)',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: 8,
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                                pointerEvents: 'none'
                            }}
                        >
                            ¿Necesitas ayuda?
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default StickyCTAButton;
