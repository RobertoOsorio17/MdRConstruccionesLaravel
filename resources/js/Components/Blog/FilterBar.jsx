import React, { memo } from 'react';
import { Box, Stack, Chip, ToggleButton, ToggleButtonGroup, FormControl, InputLabel, Select, MenuItem, useMediaQuery } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';

const FilterBar = ({
  categories = [],
  selectedCategory,
  onCategoryChange,
  sortBy = 'recent',
  onSortChange,
  viewMode = 'grid',
  onViewModeChange,
  getCategoryIcon,
  hideCategoriesRow = false,
}) => {
  const isMobile = useMediaQuery('(max-width:900px)');
  const visibleCategories = categories.slice(0, 10);

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
        {/* Categories row (optional) */}
        {!hideCategoriesRow && (
          <Box sx={{ width: 1, overflowX: 'auto', pb: 1 }}>
            <Stack direction="row" spacing={1} sx={{ minWidth: 'fit-content' }}>
              <Chip
                label="Todas"
                onClick={() => onCategoryChange?.(null)}
                variant={!selectedCategory ? 'filled' : 'outlined'}
                color={!selectedCategory ? 'primary' : 'default'}
                sx={{ borderRadius: 2, flexShrink: 0 }}
              />
              {visibleCategories.map((c) => (
                <Chip
                  key={c.id}
                  icon={getCategoryIcon ? getCategoryIcon(c.slug) : undefined}
                  label={c.name}
                  onClick={() => onCategoryChange?.(c.slug)}
                  variant={selectedCategory === c.slug ? 'filled' : 'outlined'}
                  color={selectedCategory === c.slug ? 'secondary' : 'default'}
                  sx={{ borderRadius: 2, flexShrink: 0 }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Sort + view controls */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ flexShrink: 0 }}>
          <FormControl size="small" sx={{ minWidth: isMobile ? 120 : 160 }}>
            <InputLabel id="sort-label">Ordenar</InputLabel>
            <Select
              labelId="sort-label"
              id="sort"
              label="Ordenar"
              value={sortBy}
              onChange={(e) => onSortChange?.(e.target.value)}
            >
              <MenuItem value="recent">Recientes</MenuItem>
              <MenuItem value="popular">Populares</MenuItem>
              <MenuItem value="trending">En tendencia</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_, v) => v && onViewModeChange?.(v)}
            aria-label="Cambiar vista"
          >
            <ToggleButton value="grid" aria-label="Vista de cuadrícula">
              <GridViewIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="list" aria-label="Vista de lista">
              <ViewListIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>
    </Box>
  );
};

export default memo(FilterBar);
