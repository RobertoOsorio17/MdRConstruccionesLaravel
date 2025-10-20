import React from 'react';
import {
  Box, Container, Typography, Card, CardContent, Avatar,
  Stack, Chip, IconButton, Grid
} from '@mui/material';

import { 
  Groups as GroupsIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  WorkspacePremium as WorkspacePremiumIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const TeamMemberCard = ({ member, index, prefersReducedMotion }) => {
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ 
        duration: 0.7, 
        delay: index * 0.2,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={prefersReducedMotion ? {} : { y: -8 }}
    >
      <Card
        sx={{
          height: '100%',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            '& .member-avatar': {
              transform: 'scale(1.1)',
            },
            '& .social-icons': {
              opacity: 1,
              transform: 'translateY(0)',
            }
          }
        }}
      >
        {/* Imagen de fondo con gradiente */}
        <Box
          sx={{
            height: 280,
            background: `linear-gradient(135deg, ${member.bgColor}40 0%, ${member.bgColor}20 100%)`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {/* Patrón de fondo */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0.1,
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 2px, transparent 2px)',
              backgroundSize: '30px 30px'
            }}
          />
          
          {/* Avatar principal */}
          <Avatar
            src={member.avatar}
            alt={member.name}
            className="member-avatar"
            sx={{
              width: 120,
              height: 120,
              border: '4px solid white',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              bgcolor: member.bgColor,
              fontSize: '3rem',
              color: 'white',
              fontWeight: 700
            }}
          >
            {member.initials}
          </Avatar>

          {/* Iconos sociales */}
          <Stack
            className="social-icons"
            direction="row"
            spacing={1}
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%) translateY(20px)',
              opacity: 0,
              transition: 'all 0.3s ease',
            }}
          >
            {member.social?.linkedin && (
              <IconButton
                href={member.social.linkedin}
                target="_blank"
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: '#0077B5',
                  '&:hover': {
                    bgcolor: '#0077B5',
                    color: 'white',
                    transform: 'scale(1.1)',
                  }
                }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
            )}
            {member.social?.email && (
              <IconButton
                href={`mailto:${member.social.email}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: '#ea4335',
                  '&:hover': {
                    bgcolor: '#ea4335',
                    color: 'white',
                    transform: 'scale(1.1)',
                  }
                }}
              >
                <EmailIcon fontSize="small" />
              </IconButton>
            )}
            {member.social?.phone && (
              <IconButton
                href={`tel:${member.social.phone}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: '#25D366',
                  '&:hover': {
                    bgcolor: '#25D366',
                    color: 'white',
                    transform: 'scale(1.1)',
                  }
                }}
              >
                <PhoneIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        </Box>

        {/* Información del miembro */}
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            {/* Nombre y cargo */}
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                {member.name}
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="primary.main" 
                fontWeight={600}
                sx={{ mb: 1 }}
              >
                {member.position}
              </Typography>
              
              {/* Años de experiencia */}
              <Chip
                icon={<StarIcon />}
                label={`${member.experience} años de experiencia`}
                color="warning"
                size="small"
                sx={{
                  fontWeight: 600,
                  '& .MuiChip-icon': {
                    color: 'inherit'
                  }
                }}
              />
            </Box>

            {/* Descripción */}
            <Typography 
              variant="body2" 
              color="text.secondary"
              textAlign="center"
              sx={{ 
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {member.description}
            </Typography>

            {/* Especialidades */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Especialidades:
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {member.specialties.map((specialty, idx) => (
                  <Chip
                    key={idx}
                    label={specialty}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.7rem',
                      height: 24,
                      borderColor: member.bgColor,
                      color: member.bgColor,
                      '&:hover': {
                        bgcolor: `${member.bgColor}10`,
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Certificaciones */}
            {member.certifications && member.certifications.length > 0 && (
              <Box>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                  <WorkspacePremiumIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    Certificaciones
                  </Typography>
                </Stack>
                <Stack spacing={0.5}>
                  {member.certifications.map((cert, idx) => (
                    <Typography key={idx} variant="caption" color="text.secondary">
                      • {cert}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const MeetTheTeamSection = ({ prefersReducedMotion = false }) => {
  // Datos del equipo clave
  const teamMembers = [
    {
      id: 1,
      name: "Miguel Rodríguez",
      position: "Fundador & Director General",
      experience: 25,
      description: "Arquitecto técnico con más de dos décadas liderando proyectos de construcción y reforma. Su visión combina tradición artesanal con innovación tecnológica.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=webp&w=150&q=80",
      initials: "MR",
      bgColor: "#1976d2",
      specialties: ["Dirección de Obra", "Arquitectura Técnica", "Gestión de Proyectos"],
      certifications: ["Colegio Oficial de Arquitectos Técnicos", "Certificación PMP", "ISO 9001 Lead Auditor"],
      social: {
        linkedin: "https://linkedin.com/in/miguel-rodriguez-construcciones",
        email: "miguel@mdrconstrucciones.com",
        phone: "+34 600 123 456"
      }
    },
    {
      id: 2,
      name: "Elena Martínez",
      position: "Jefa de Proyecto",
      experience: 15,
      description: "Ingeniera de edificación especializada en coordinación y planificación. Garantiza que cada proyecto se ejecute con precisión y en los plazos establecidos.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?fm=webp&w=150&q=80",
      initials: "EM",
      bgColor: "#7b1fa2",
      specialties: ["Planificación", "Control de Calidad", "Coordinación de Equipos"],
      certifications: ["Máster en Dirección de Proyectos", "Lean Construction", "BIM Manager"],
      social: {
        linkedin: "https://linkedin.com/in/elena-martinez-proyectos",
        email: "elena@mdrconstrucciones.com"
      }
    },
    {
      id: 3,
      name: "Carlos Jiménez",
      position: "Maestro de Obra",
      experience: 20,
      description: "Artesano experimentado que supervisa la ejecución técnica. Su ojo experto asegura que cada detalle cumpla con los estándares más exigentes de calidad.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fm=webp&w=150&q=80",
      initials: "CJ",
      bgColor: "#f57c00",
      specialties: ["Supervisión Técnica", "Albañilería Premium", "Control de Acabados"],
      certifications: ["Formación Profesional Superior", "Certificación OHSAS 18001", "Especialista en Materiales"],
      social: {
        email: "carlos@mdrconstrucciones.com",
        phone: "+34 600 789 012"
      }
    }
  ];

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12, xl: 16 },
        bgcolor: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Patrón de fondo sutil */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.03,
          backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 0 15px, 15px -15px, -15px 0px'
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Título de la sección */}
        <Box textAlign="center" sx={{ mb: { xs: 6, md: 8 } }}>
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
              <GroupsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: '2.2rem', md: '3rem', xl: '3.8rem' },
                  fontWeight: 700,
                  color: 'primary.main',
                  lineHeight: 1.2,
                }}
              >
                Conoce al Equipo
              </Typography>
            </Stack>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                color: 'text.secondary',
                fontWeight: 400,
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              Detrás de cada proyecto excepcional, un equipo de profesionales apasionados.
              <br />
              <Typography component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                Conoce a las personas que harán realidad tu visión.
              </Typography>
            </Typography>
          </motion.div>
        </Box>

        {/* Grid del equipo */}
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {teamMembers.map((member, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={member.id}>
              <TeamMemberCard 
                member={member} 
                index={index}
                prefersReducedMotion={prefersReducedMotion}
              />
            </Grid>
          ))}
        </Grid>

        {/* Mensaje de cierre */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Box textAlign="center" sx={{ mt: { xs: 6, md: 8 } }}>
            <Card
              sx={{
                p: 4,
                borderRadius: 4,
                bgcolor: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)',
                border: '1px solid rgba(25, 118, 210, 0.1)',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ mb: 2, color: 'primary.main' }}
              >
                Más que un equipo, una familia profesional
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.7,
                  '& .highlight': {
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                }}
              >
                Cada miembro de nuestro equipo aporta su experiencia única para crear 
                <span className="highlight"> soluciones extraordinarias</span>. 
                Juntos, transformamos espacios y superamos expectativas, proyecto tras proyecto.
              </Typography>
            </Card>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default MeetTheTeamSection;
