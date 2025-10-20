import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';

/**
 * usePersistentFilters Hook
 * 
 * Hook personalizado para manejar filtros persistentes con:
 * - Sincronización con URL query parameters
 * - Persistencia en localStorage
 * - Restauración automática en page load
 * - Limpieza de filtros
 * 
 * @param {Object} options - Configuración del hook
 * @param {string} options.storageKey - Clave para localStorage (default: 'filters')
 * @param {Object} options.initialFilters - Filtros iniciales
 * @param {Object} options.urlFilters - Filtros desde URL (props de Inertia)
 * @param {string} options.routeName - Nombre de la ruta para navegación
 * @param {boolean} options.useLocalStorage - Usar localStorage (default: true)
 * @param {boolean} options.useUrlParams - Usar URL params (default: true)
 * @param {number} options.debounceMs - Debounce para actualizaciones (default: 300)
 * 
 * @returns {Object} - Estado y funciones del hook
 */
export const usePersistentFilters = ({
  storageKey = 'filters',
  initialFilters = {},
  urlFilters = {},
  routeName = null,
  useLocalStorage = true,
  useUrlParams = true,
  debounceMs = 300
} = {}) => {
  // Estado de filtros
  const [filters, setFilters] = useState(() => {
    // Prioridad: URL params > localStorage > initialFilters
    if (useUrlParams && Object.keys(urlFilters).length > 0) {
      return { ...initialFilters, ...urlFilters };
    }
    
    if (useLocalStorage) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...initialFilters, ...parsed };
        }
      } catch (error) {
        console.error('Error loading filters from localStorage:', error);
      }
    }
    
    return initialFilters;
  });

  // Debounce timer
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Guardar en localStorage
  const saveToLocalStorage = useCallback((filtersToSave) => {
    if (!useLocalStorage) return;
    
    try {
      // Filtrar valores vacíos antes de guardar
      const cleanFilters = Object.entries(filtersToSave).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      localStorage.setItem(storageKey, JSON.stringify(cleanFilters));
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  }, [storageKey, useLocalStorage]);

  // Actualizar URL params
  const updateUrlParams = useCallback((filtersToUpdate) => {
    if (!useUrlParams || !routeName) return;
    
    // Filtrar valores vacíos antes de actualizar URL
    const cleanFilters = Object.entries(filtersToUpdate).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    router.get(
      route(routeName),
      cleanFilters,
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
        only: ['services', 'projects', 'posts'] // Solo recargar datos necesarios
      }
    );
  }, [routeName, useUrlParams]);

  // Actualizar filtros con debounce
  const updateFilters = useCallback((newFilters, immediate = false) => {
    setFilters(newFilters);
    
    // Guardar en localStorage inmediatamente
    saveToLocalStorage(newFilters);
    
    // Actualizar URL con debounce
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    if (immediate) {
      updateUrlParams(newFilters);
    } else {
      const timer = setTimeout(() => {
        updateUrlParams(newFilters);
      }, debounceMs);
      setDebounceTimer(timer);
    }
  }, [debounceTimer, debounceMs, saveToLocalStorage, updateUrlParams]);

  // Actualizar un filtro específico
  const setFilter = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    updateFilters(newFilters);
  }, [filters, updateFilters]);

  // Actualizar múltiples filtros
  const setMultipleFilters = useCallback((updates) => {
    const newFilters = { ...filters, ...updates };
    updateFilters(newFilters);
  }, [filters, updateFilters]);

  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    saveToLocalStorage(clearedFilters);
    
    if (useUrlParams && routeName) {
      router.get(
        route(routeName),
        {},
        {
          preserveState: true,
          preserveScroll: true,
          replace: true
        }
      );
    }
  }, [routeName, saveToLocalStorage, useUrlParams]);

  // Limpiar un filtro específico
  const clearFilter = useCallback((key) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    updateFilters(newFilters, true);
  }, [filters, updateFilters]);

  // Verificar si hay filtros activos
  const hasActiveFilters = useCallback(() => {
    return Object.keys(filters).some(key => {
      const value = filters[key];
      return value !== '' && value !== null && value !== undefined;
    });
  }, [filters]);

  // Obtener conteo de filtros activos
  const getActiveFiltersCount = useCallback(() => {
    return Object.keys(filters).filter(key => {
      const value = filters[key];
      return value !== '' && value !== null && value !== undefined;
    }).length;
  }, [filters]);

  // Restaurar filtros desde localStorage
  const restoreFromLocalStorage = useCallback(() => {
    if (!useLocalStorage) return;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFilters(parsed);
        if (useUrlParams && routeName) {
          updateUrlParams(parsed);
        }
      }
    } catch (error) {
      console.error('Error restoring filters from localStorage:', error);
    }
  }, [storageKey, useLocalStorage, useUrlParams, routeName, updateUrlParams]);

  // Limpiar localStorage
  const clearLocalStorage = useCallback(() => {
    if (!useLocalStorage) return;
    
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, [storageKey, useLocalStorage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Sincronizar con URL params cuando cambien (desde navegación del navegador)
  useEffect(() => {
    if (useUrlParams && Object.keys(urlFilters).length > 0) {
      setFilters(prevFilters => {
        // Solo actualizar si hay cambios
        const hasChanges = Object.keys(urlFilters).some(
          key => urlFilters[key] !== prevFilters[key]
        );
        
        if (hasChanges) {
          const newFilters = { ...prevFilters, ...urlFilters };
          saveToLocalStorage(newFilters);
          return newFilters;
        }
        
        return prevFilters;
      });
    }
  }, [urlFilters, useUrlParams, saveToLocalStorage]);

  return {
    // Estado
    filters,
    
    // Funciones de actualización
    setFilter,
    setMultipleFilters,
    updateFilters,
    
    // Funciones de limpieza
    clearFilters,
    clearFilter,
    clearLocalStorage,
    
    // Funciones de utilidad
    hasActiveFilters,
    getActiveFiltersCount,
    restoreFromLocalStorage,
    
    // Helpers
    isFilterActive: (key) => {
      const value = filters[key];
      return value !== '' && value !== null && value !== undefined;
    },
    getFilterValue: (key, defaultValue = '') => filters[key] || defaultValue
  };
};

export default usePersistentFilters;

