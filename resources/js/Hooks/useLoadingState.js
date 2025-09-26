import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar estados de loading de forma consistente
 */
export const useLoadingState = (initialState = {}) => {
    const [loadingStates, setLoadingStates] = useState(initialState);

    const setLoading = useCallback((key, isLoading) => {
        setLoadingStates(prev => ({
            ...prev,
            [key]: isLoading
        }));
    }, []);

    const isLoading = useCallback((key) => {
        return loadingStates[key] || false;
    }, [loadingStates]);

    const isAnyLoading = useCallback(() => {
        return Object.values(loadingStates).some(state => state);
    }, [loadingStates]);

    const resetLoading = useCallback(() => {
        setLoadingStates({});
    }, []);

    return {
        setLoading,
        isLoading,
        isAnyLoading,
        resetLoading,
        loadingStates
    };
};

/**
 * Hook para manejar búsquedas con debounce y loading
 */
export const useSearchWithLoading = (searchFn, delay = 500) => {
    const { setLoading, isLoading } = useLoadingState();
    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearch = useCallback(
        debounce(async (term) => {
            if (!term.trim()) {
                setLoading('search', false);
                return;
            }

            setLoading('search', true);
            try {
                await searchFn(term);
            } finally {
                setLoading('search', false);
            }
        }, delay),
        [searchFn, delay, setLoading]
    );

    const handleSearchChange = useCallback((newTerm) => {
        setSearchTerm(newTerm);
        if (newTerm.trim()) {
            setLoading('search', true);
        }
        debouncedSearch(newTerm);
    }, [debouncedSearch, setLoading]);

    return {
        searchTerm,
        handleSearchChange,
        isSearching: isLoading('search')
    };
};

// Utility debounce function
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};