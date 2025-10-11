import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemText,
    alpha,
    useTheme,
} from '@mui/material';
import { Close, Shield, Lock, Info, CheckCircle } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

export default function PrivacyPolicyModal({ open, onClose }) {
    const theme = useTheme();

    const glassStyle = {
        background: alpha('#ffffff', 0.95),
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: `1px solid ${alpha('#ffffff', 0.4)}`,
        boxShadow: `0 12px 40px 0 ${alpha('#000000', 0.15)}`,
    };

    const sections = [
        {
            icon: <Info color="primary" />,
            title: '1. Responsable del Tratamiento',
            content: `MDR Construcciones es el responsable del tratamiento de los datos personales que nos proporciones a través de este formulario de contacto. Nuestros datos de contacto son:
            
• Razón Social: MDR Construcciones S.L.
• Dirección: Calle Principal 123, 28001 Madrid, España
• Email: info@mdrconstrucciones.com
• Teléfono: +34 123 456 789`,
        },
        {
            icon: <CheckCircle color="success" />,
            title: '2. Finalidad del Tratamiento',
            content: `Los datos personales que nos proporciones serán utilizados para:

• Responder a tu solicitud de información o presupuesto
• Gestionar y tramitar tu consulta
• Enviarte información comercial sobre nuestros servicios (solo si das tu consentimiento)
• Mejorar nuestros servicios y atención al cliente
• Cumplir con obligaciones legales`,
        },
        {
            icon: <Shield color="warning" />,
            title: '3. Base Legal',
            content: `El tratamiento de tus datos se basa en:

• Tu consentimiento expreso al aceptar esta política de privacidad
• La ejecución de medidas precontractuales a petición tuya
• El interés legítimo de MDR Construcciones en gestionar consultas y mejorar servicios
• El cumplimiento de obligaciones legales aplicables`,
        },
        {
            icon: <Lock color="error" />,
            title: '4. Destinatarios de los Datos',
            content: `Tus datos personales no serán cedidos a terceros, salvo:

• Obligación legal
• Prestadores de servicios necesarios para la gestión (hosting, email, CRM)
• Autoridades competentes cuando sea requerido por ley

Todos nuestros proveedores cumplen con el RGPD y tienen firmados acuerdos de confidencialidad.`,
        },
    ];

    const rights = [
        'Acceso: Conocer qué datos tenemos sobre ti',
        'Rectificación: Corregir datos inexactos o incompletos',
        'Supresión: Solicitar la eliminación de tus datos',
        'Oposición: Oponerte al tratamiento de tus datos',
        'Limitación: Solicitar la limitación del tratamiento',
        'Portabilidad: Recibir tus datos en formato estructurado',
        'Retirar consentimiento: En cualquier momento sin efectos retroactivos',
    ];

    return (
        <AnimatePresence>
            {open && (
                <Dialog
                    open={open}
                    onClose={onClose}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            ...glassStyle,
                            maxHeight: '90vh',
                        },
                    }}
                    component={motion.div}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                >
                    <DialogTitle>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box display="flex" alignItems="center" gap={2}>
                                <Shield sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                                <Typography variant="h5" fontWeight="bold">
                                    Política de Privacidad
                                </Typography>
                            </Box>
                            <IconButton onClick={onClose} size="small">
                                <Close />
                            </IconButton>
                        </Box>
                    </DialogTitle>

                    <Divider />

                    <DialogContent sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            En MDR Construcciones respetamos tu privacidad y nos comprometemos a proteger tus datos personales.
                            Esta política explica cómo recopilamos, usamos y protegemos tu información.
                        </Typography>

                        <Box sx={{ mt: 3 }}>
                            {sections.map((section, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Box sx={{ mb: 3 }}>
                                        <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                                            {section.icon}
                                            <Typography variant="h6" fontWeight="600">
                                                {section.title}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ whiteSpace: 'pre-line', pl: 5 }}
                                        >
                                            {section.content}
                                        </Typography>
                                    </Box>
                                </motion.div>
                            ))}

                            {/* Derechos del Usuario */}
                            <Box sx={{ mt: 4 }}>
                                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                                    <CheckCircle color="primary" />
                                    <Typography variant="h6" fontWeight="600">
                                        5. Tus Derechos
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" paragraph sx={{ pl: 5 }}>
                                    Puedes ejercer los siguientes derechos en cualquier momento:
                                </Typography>
                                <List dense sx={{ pl: 5 }}>
                                    {rights.map((right, index) => (
                                        <ListItem key={index} sx={{ py: 0.5 }}>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body2" color="text.secondary">
                                                        • {right}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                                <Typography variant="body2" color="text.secondary" sx={{ pl: 5, mt: 2 }}>
                                    Para ejercer tus derechos, contacta con nosotros en: <strong>info@mdrconstrucciones.com</strong>
                                </Typography>
                            </Box>

                            {/* Plazo de Conservación */}
                            <Box sx={{ mt: 4 }}>
                                <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                                    <Lock color="warning" />
                                    <Typography variant="h6" fontWeight="600">
                                        6. Plazo de Conservación
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ pl: 5 }}>
                                    Conservaremos tus datos personales durante el tiempo necesario para gestionar tu solicitud
                                    y, posteriormente, durante los plazos legales establecidos. Si no hay relación contractual,
                                    conservaremos tus datos durante 1 año desde tu última interacción.
                                </Typography>
                            </Box>

                            {/* Medidas de Seguridad */}
                            <Box sx={{ mt: 4 }}>
                                <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                                    <Shield color="success" />
                                    <Typography variant="h6" fontWeight="600">
                                        7. Medidas de Seguridad
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ pl: 5 }}>
                                    Hemos implementado medidas técnicas y organizativas apropiadas para proteger tus datos
                                    personales contra acceso no autorizado, pérdida, destrucción o alteración. Esto incluye:
                                    cifrado SSL/TLS, firewalls, control de acceso, copias de seguridad regulares y formación
                                    del personal en protección de datos.
                                </Typography>
                            </Box>

                            {/* Reclamaciones */}
                            <Box sx={{ mt: 4, p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}>
                                <Typography variant="body2" fontWeight="500" gutterBottom>
                                    Derecho a Reclamar
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Si consideras que el tratamiento de tus datos personales vulnera la normativa, tienes
                                    derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD):
                                    www.aepd.es
                                </Typography>
                            </Box>

                            {/* Última actualización */}
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4, textAlign: 'center' }}>
                                Última actualización: Octubre 2025
                            </Typography>
                        </Box>
                    </DialogContent>

                    <Divider />

                    <DialogActions sx={{ p: 2.5 }}>
                        <Button
                            onClick={onClose}
                            variant="contained"
                            size="large"
                            fullWidth
                            sx={{
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                },
                            }}
                        >
                            Entendido
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </AnimatePresence>
    );
}

