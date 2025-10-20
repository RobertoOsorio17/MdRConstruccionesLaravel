import React, { useState } from 'react';
import {
    Box,
    Breadcrumbs,
    Link,
    Typography,
    Chip,
    Stack,
    Menu,
    MenuItem,
    Divider,
    useTheme,
    alpha
} from '@mui/material';
import {
    Home as HomeIcon,
    NavigateNext as NavigateNextIcon,
    FilterList as FilterIcon,
    CalendarToday as CalendarIcon,
    TrendingUp as TrendingIcon,
    CheckCircle as CheckIcon
} from '@mui/icons-material';
import { Link as InertiaLink } from '@inertiajs/react';
import { motion } from 'framer-motion';

/**
 * BreadcrumbsWithFilters Component
 * 
 * Breadcrumbs con filtros rápidos integrados para admin
 * 
 * @param {Array} items - Array de items de breadcrumb: [{ label, href }]
 * @param {Array} quickFilters - Array de filtros rápidos: [{ label, value, icon, active }]
 * @param {Function} onFilterChange - Callback cuando cambia un filtro
 * @param {Boolean} showFilters - Mostrar filtros rápidos
 */
const BreadcrumbsWithFilters = ({
    items = [],
    quickFilters = [],
    onFilterChange,
    showFilters = true
}) => {
    const theme = useTheme();
    const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);

    const handleFilterMenuOpen = (event) => {
        setFilterMenuAnchor(event.currentTarget);
    };

    const handleFilterMenuClose = () => {
        setFilterMenuAnchor(null);
    };

    const handleFilterClick = (filter) => {
        if (onFilterChange) {
            onFilterChange(filter);
        }
        handleFilterMenuClose();
    };

    // Filtros predefinidos comunes
    const defaultQuickFilters = [
        {
            label: 'Últimos 7 días',
            value: 'last_7_days',
            icon: <CalendarIcon sx={{ fontSize: 16 }} />,
            active: false
        },
        {
            label: 'Últimos 30 días',
            value: 'last_30_days',
            icon: <CalendarIcon sx={{ fontSize: 16 }} />,
            active: false
        },
        {
            label: 'Este mes',
            value: 'this_month',
            icon: <CalendarIcon sx={{ fontSize: 16 }} />,
            active: false
        },
        {
            label: 'Más recientes',
            value: 'recent',
            icon: <TrendingIcon sx={{ fontSize: 16 }} />,
            active: false
        },
        {
            label: 'Activos',
            value: 'active',
            icon: <CheckIcon sx={{ fontSize: 16 }} />,
            active: false
        }
    ];

    const filtersToShow = quickFilters.length > 0 ? quickFilters : defaultQuickFilters;
    const activeFilter = filtersToShow.find(f => f.active);

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
                py: 1
            }}
        >
            {/* Breadcrumbs */}
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="breadcrumb"
                sx={{
                    '& .MuiBreadcrumbs-separator': {
                        color: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.5)' 
                            : 'rgba(0, 0, 0, 0.5)'
                    }
                }}
            >
                {/* Home link */}
                <Link
                    component={InertiaLink}
                    href="/admin/dashboard"
                    underline="hover"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.7)' 
                            : 'rgba(0, 0, 0, 0.7)',
                        '&:hover': {
                            color: theme.palette.primary.main
                        },
                        transition: 'color 0.2s'
                    }}
                >
                    <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
                    Dashboard
                </Link>

                {/* Dynamic breadcrumb items */}
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    
                    if (isLast) {
                        return (
                            <Typography
                                key={index}
                                sx={{
                                    color: theme.palette.mode === 'dark' 
                                        ? 'white' 
                                        : 'text.primary',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {item.icon && <Box sx={{ mr: 0.5, display: 'flex' }}>{item.icon}</Box>}
                                {item.label}
                            </Typography>
                        );
                    }

                    return (
                        <Link
                            key={index}
                            component={InertiaLink}
                            href={item.href}
                            underline="hover"
                            sx={{
                                color: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.7)' 
                                    : 'rgba(0, 0, 0, 0.7)',
                                '&:hover': {
                                    color: theme.palette.primary.main
                                },
                                transition: 'color 0.2s',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {item.icon && <Box sx={{ mr: 0.5, display: 'flex' }}>{item.icon}</Box>}
                            {item.label}
                        </Link>
                    );
                })}
            </Breadcrumbs>

            {/* Quick Filters */}
            {showFilters && (
                <Stack direction="row" spacing={1} alignItems="center">
                    {/* Active filter chip */}
                    {activeFilter && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Chip
                                icon={activeFilter.icon}
                                label={activeFilter.label}
                                size="small"
                                color="primary"
                                onDelete={() => handleFilterClick({ ...activeFilter, active: false })}
                                sx={{
                                    fontWeight: 600,
                                    '& .MuiChip-deleteIcon': {
                                        fontSize: 18
                                    }
                                }}
                            />
                        </motion.div>
                    )}

                    {/* Filter menu button */}
                    <Chip
                        icon={<FilterIcon sx={{ fontSize: 16 }} />}
                        label="Filtros"
                        size="small"
                        variant={activeFilter ? "outlined" : "filled"}
                        onClick={handleFilterMenuOpen}
                        sx={{
                            cursor: 'pointer',
                            fontWeight: 500,
                            bgcolor: activeFilter ? 'transparent' : alpha(theme.palette.primary.main, 0.1),
                            borderColor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.2)' 
                                : 'rgba(0, 0, 0, 0.2)',
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.2)
                            }
                        }}
                    />

                    {/* Filter menu */}
                    <Menu
                        anchorEl={filterMenuAnchor}
                        open={Boolean(filterMenuAnchor)}
                        onClose={handleFilterMenuClose}
                        PaperProps={{
                            sx: {
                                mt: 1,
                                minWidth: 200,
                                borderRadius: 2,
                                boxShadow: theme.palette.mode === 'dark'
                                    ? '0 8px 24px rgba(0, 0, 0, 0.5)'
                                    : '0 8px 24px rgba(0, 0, 0, 0.15)'
                            }
                        }}
                    >
                        <Box sx={{ px: 2, py: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                                Filtros Rápidos
                            </Typography>
                        </Box>
                        <Divider />
                        {filtersToShow.map((filter, index) => (
                            <MenuItem
                                key={index}
                                onClick={() => handleFilterClick({ ...filter, active: true })}
                                selected={filter.active}
                                sx={{
                                    py: 1.5,
                                    '&.Mui-selected': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.2)
                                        }
                                    }
                                }}
                            >
                                <Box sx={{ mr: 1.5, display: 'flex', color: 'primary.main' }}>
                                    {filter.icon}
                                </Box>
                                <Typography variant="body2">
                                    {filter.label}
                                </Typography>
                            </MenuItem>
                        ))}
                    </Menu>
                </Stack>
            )}
        </Box>
    );
};

export default BreadcrumbsWithFilters;

