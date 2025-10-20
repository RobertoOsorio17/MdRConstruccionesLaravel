/**
 * Breadcrumbs Component - Navegación de migas de pan
 * 
 * Componente de breadcrumbs para mejorar la orientación del usuario
 * y proporcionar navegación contextual.
 * 
 * Características:
 * - Generación automática desde URL
 * - Soporte para rutas personalizadas
 * - Iconos opcionales
 * - Responsive
 * - Integración con Inertia.js
 * - Accesible (ARIA labels)
 * 
 * Uso:
 * ```jsx
 * import Breadcrumbs from '@/Components/UI/Breadcrumbs';
 * 
 * // Automático desde URL
 * <Breadcrumbs />
 * 
 * // Personalizado
 * <Breadcrumbs items={[
 *   { label: 'Inicio', href: '/' },
 *   { label: 'Servicios', href: '/servicios' },
 *   { label: 'Cocinas' }
 * ]} />
 * ```
 */

import React from 'react';
import { Box, Typography, Breadcrumbs as MuiBreadcrumbs } from '@mui/material';
import { Link, usePage } from '@inertiajs/react';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { colors, spacing, borders } from '@/theme/designSystem';

/**
 * Genera breadcrumbs automáticamente desde la URL
 */
const generateBreadcrumbsFromUrl = (url) => {
  const segments = url.split('/').filter(Boolean);
  
  const breadcrumbs = [
    { label: 'Inicio', href: '/', icon: <HomeIcon sx={{ fontSize: '1.1rem' }} /> }
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Formatear el label (capitalizar y reemplazar guiones)
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // El último segmento no tiene href (es la página actual)
    const isLast = index === segments.length - 1;
    
    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath
    });
  });

  return breadcrumbs;
};

/**
 * Breadcrumbs Component
 */
const Breadcrumbs = ({
  items,
  separator = <ChevronRightIcon sx={{ fontSize: '1rem', color: 'text.disabled' }} />,
  maxItems = 4,
  showHome = true,
  sx = {},
  ...props
}) => {
  const { url } = usePage();
  
  // Usar items personalizados o generar desde URL
  const breadcrumbItems = items || generateBreadcrumbsFromUrl(url);
  
  // Filtrar el item de inicio si showHome es false
  const finalItems = showHome ? breadcrumbItems : breadcrumbItems.slice(1);

  return (
    <Box
      role="navigation"
      aria-label="breadcrumb"
      sx={{
        py: spacing[2],
        px: { xs: spacing[2], sm: 0 },
        ...sx
      }}
      {...props}
    >
      <MuiBreadcrumbs
        separator={separator}
        maxItems={maxItems}
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            mx: 0.5
          }
        }}
      >
        {finalItems.map((item, index) => {
          const isLast = index === finalItems.length - 1;
          const isFirst = index === 0;

          // Último item (página actual) - no es clickeable
          if (isLast) {
            return (
              <Box
                key={item.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75
                }}
              >
                {item.icon}
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            );
          }

          // Items intermedios - clickeables
          return (
            <Link
              key={item.label}
              href={item.href}
              style={{ textDecoration: 'none' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  padding: spacing[1],
                  borderRadius: borders.radius.sm,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: (theme) => theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.04)',
                    '& .breadcrumb-text': {
                      color: 'primary.main'
                    }
                  }
                }}
              >
                {item.icon}
                <Typography
                  variant="body2"
                  className="breadcrumb-text"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: isFirst ? 600 : 500,
                    fontSize: '0.875rem',
                    transition: 'color 0.2s ease'
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

/**
 * Breadcrumbs Compact - Versión compacta para espacios reducidos
 */
export const BreadcrumbsCompact = ({ items, ...props }) => {
  return (
    <Breadcrumbs
      items={items}
      maxItems={2}
      separator={<NavigateNextIcon sx={{ fontSize: '0.875rem' }} />}
      sx={{
        py: spacing[1],
        '& .MuiBreadcrumbs-li': {
          fontSize: '0.8125rem'
        }
      }}
      {...props}
    />
  );
};

/**
 * Breadcrumbs con fondo - Para usar en headers de página
 */
export const BreadcrumbsWithBackground = ({ items, ...props }) => {
  return (
    <Box
      sx={{
        background: (theme) => theme.palette.mode === 'dark'
          ? 'rgba(30, 41, 59, 0.5)'
          : 'rgba(248, 250, 252, 0.8)',
        borderBottom: (theme) => theme.palette.mode === 'dark'
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
        <Breadcrumbs items={items} {...props} />
      </Box>
    </Box>
  );
};

export default Breadcrumbs;

