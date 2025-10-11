import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Stack } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Animación de carrusel infinito
const scroll = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`;

// Contenedor del carrusel con animación - Removemos isPaused de props del DOM
const CarouselContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isPaused',
})(({ theme, isPaused }) => ({
  display: 'flex',
  overflow: 'hidden',
  width: '100%',
  '& .carousel-track': {
    display: 'flex',
    animation: `${scroll} 30s linear infinite`,
    animationPlayState: isPaused ? 'paused' : 'running',
    '&:hover': {
      animationPlayState: 'paused',
    },
  },
}));

// Logo estilizado con efecto escala de grises - Removemos brandColor de props del DOM
const BrandLogo = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'brandColor',
})(({ theme, brandColor }) => ({
  minWidth: '220px',
  height: '100px',
  margin: '0 30px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  filter: 'grayscale(100%) opacity(0.5)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  border: '2px solid transparent',
  borderRadius: '12px',
  padding: '16px',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  '&:hover': {
    filter: 'grayscale(0%) opacity(1)',
    transform: 'scale(1.08) translateY(-4px)',
    borderColor: brandColor || theme.palette.primary.main,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    boxShadow: `0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px ${brandColor || theme.palette.primary.main}20`,
  },
  '& .brand-name': {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: brandColor || theme.palette.text.primary,
    textAlign: 'center',
    letterSpacing: '0.5px',
  },
  '& .brand-category': {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    textAlign: 'center',
    marginTop: '4px',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover .brand-category': {
    opacity: 1,
  },
}));

const BrandsSection = ({ prefersReducedMotion = false }) => {
  const [isPaused, setIsPaused] = useState(false);

  // Marcas premium del sector construcción con colores corporativos
  const brands = [
    {
      name: 'PORCELANOSA',
      color: '#1a237e',
      category: 'Cerámicas Premium',
      logo: 'https://logos-world.net/wp-content/uploads/2020/12/Porcelanosa-Logo.png'
    },
    {
      name: 'SIEMENS',
      color: '#009999',
      category: 'Electrodomésticos',
      logo: 'https://logos-world.net/wp-content/uploads/2020/12/Siemens-Logo.png'
    },
    {
      name: 'BOSCH',
      color: '#ed1c24',
      category: 'Tecnología Hogar',
      logo: 'https://logos-world.net/wp-content/uploads/2020/11/Bosch-Logo.png'
    },
    {
      name: 'GROHE',
      color: '#004b87',
      category: 'Grifería de Lujo',
      logo: 'https://logos-world.net/wp-content/uploads/2020/12/Grohe-Logo.png'
    },
    {
      name: 'ROCA',
      color: '#e31837',
      category: 'Sanitarios',
      logo: 'https://logos-world.net/wp-content/uploads/2020/12/Roca-Logo.png'
    },
    {
      name: 'VELUX',
      color: '#ffcd00',
      category: 'Ventanas Tejado',
      logo: 'https://logos-world.net/wp-content/uploads/2020/12/Velux-Logo.png'
    },
    {
      name: 'TEKA',
      color: '#c41e3a',
      category: 'Cocinas Premium',
      logo: 'https://logos-world.net/wp-content/uploads/2020/11/Teka-Logo.png'
    },
    {
      name: 'SALONI',
      color: '#8b4513',
      category: 'Azulejos Premium',
      logo: '/images/brands/saloni-logo.svg'
    },
    {
      name: 'HANSGROHE',
      color: '#004b87',
      category: 'Grifería Premium',
      logo: 'https://logos-world.net/wp-content/uploads/2020/12/Hansgrohe-Logo.png'
    },
    {
      name: 'KERABEN',
      color: '#2e7d32',
      category: 'Pavimentos',
      logo: '/images/brands/keraben-logo.svg'
    }
  ];

  // Duplicamos las marcas para efecto infinito
  const duplicatedBrands = [...brands, ...brands];

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsPaused(true);
    }
  }, [prefersReducedMotion]);

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12, xl: 16 },
        bgcolor: 'grey.50',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Container maxWidth="xl">
        {/* Título de la sección */}
        <Stack spacing={4} alignItems="center" sx={{ mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem', xl: '3rem' },
              fontWeight: 700,
              color: 'text.primary',
              mb: 2,
            }}
          >
            Trabajamos con las 
            <Box component="span" sx={{ color: 'warning.main', ml: 1 }}>
              Mejores Marcas
            </Box>
          </Typography>
          
          <Typography
            variant="h6"
            textAlign="center"
            sx={{
              color: 'text.secondary',
              maxWidth: '600px',
              lineHeight: 1.6,
            }}
          >
            Utilizamos materiales y equipamientos de máxima calidad de los 
            proveedores más reconocidos del sector para garantizar la excelencia 
            en cada proyecto.
          </Typography>
        </Stack>

        {/* Carrusel de marcas */}
        <CarouselContainer 
          isPaused={isPaused}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(prefersReducedMotion)}
        >
          <Box className="carousel-track">
            {duplicatedBrands.map((brand, index) => (
              <BrandLogo key={`${brand.name}-${index}`} brandColor={brand.color}>
                <img
                  src={brand.logo}
                  alt={`${brand.name} - ${brand.category}`}
                  loading="lazy"
                  style={{
                    maxWidth: '140px',
                    maxHeight: '50px',
                    objectFit: 'contain',
                    marginBottom: '8px'
                  }}
                  onError={(e) => {
                    // Fallback a texto si no se puede cargar la imagen
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement.querySelector('.brand-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                
                {/* Fallback siempre presente pero oculto */}
                <Box 
                  className="brand-fallback"
                  sx={{
                    display: 'none',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%'
                  }}
                >
                  <Typography className="brand-name">
                    {brand.name}
                  </Typography>
                  <Typography className="brand-category">
                    {brand.category}
                  </Typography>
                </Box>
                
                {/* Categoría que aparece en hover */}
                <Typography className="brand-category">
                  {brand.category}
                </Typography>
              </BrandLogo>
            ))}
          </Box>
        </CarouselContainer>

        {/* Mensaje de calidad */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontStyle: 'italic',
              '& .highlight': {
                color: 'primary.main',
                fontWeight: 600,
              },
            }}
          >
            La confianza que depositan estas marcas líderes en nosotros es el 
            <span className="highlight"> respaldo de calidad</span> que trasladamos 
            directamente a tu proyecto.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default BrandsSection;