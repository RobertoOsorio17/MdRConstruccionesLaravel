import { useState, useEffect } from 'react';

/**
 * Custom hook for managing widget sizes with localStorage persistence
 * 
 * @param {string} storageKey - Unique key for localStorage
 * @param {Object} defaultSizes - Default sizes for widgets { widgetId: { xs, sm, md, lg, xl } }
 * @returns {Object} - { widgetSizes, setWidgetSize, resetWidgetSize, resetAllSizes }
 */
const useWidgetResize = (storageKey = 'dashboard-widget-sizes', defaultSizes = {}) => {
    // Load widget sizes from localStorage or use defaults
    const [widgetSizes, setWidgetSizes] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with defaults to ensure all widgets have sizes
                return { ...defaultSizes, ...parsed };
            }
        } catch (error) {
            console.error('Error loading widget sizes from localStorage:', error);
        }
        return defaultSizes;
    });

    // Save to localStorage whenever sizes change
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(widgetSizes));
        } catch (error) {
            console.error('Error saving widget sizes to localStorage:', error);
        }
    }, [widgetSizes, storageKey]);

    /**
     * Set size for a specific widget
     * @param {string} widgetId - Widget identifier
     * @param {Object} sizes - Breakpoint sizes { xs, sm, md, lg, xl }
     */
    const setWidgetSize = (widgetId, sizes) => {
        setWidgetSizes(prev => ({
            ...prev,
            [widgetId]: {
                ...prev[widgetId],
                ...sizes
            }
        }));
    };

    /**
     * Reset a specific widget to default size
     * @param {string} widgetId - Widget identifier
     */
    const resetWidgetSize = (widgetId) => {
        if (defaultSizes[widgetId]) {
            setWidgetSizes(prev => ({
                ...prev,
                [widgetId]: defaultSizes[widgetId]
            }));
        }
    };

    /**
     * Reset all widgets to default sizes
     */
    const resetAllSizes = () => {
        setWidgetSizes(defaultSizes);
        localStorage.removeItem(storageKey);
    };

    /**
     * Get size for a specific widget
     * @param {string} widgetId - Widget identifier
     * @returns {Object} - Breakpoint sizes
     */
    const getWidgetSize = (widgetId) => {
        return widgetSizes[widgetId] || defaultSizes[widgetId] || { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 };
    };

    /**
     * Cycle through predefined sizes for a widget
     * @param {string} widgetId - Widget identifier
     * @param {Array} sizeOptions - Array of size objects to cycle through
     */
    const cycleWidgetSize = (widgetId, sizeOptions = [
        { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }, // Full width
        { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },     // Half width
        { xs: 12, sm: 6, md: 4, lg: 4, xl: 4 },     // Third width
        { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 },     // Quarter width
    ]) => {
        const currentSize = getWidgetSize(widgetId);
        
        // Find current size index
        const currentIndex = sizeOptions.findIndex(option => 
            option.xs === currentSize.xs && 
            option.md === currentSize.md && 
            option.lg === currentSize.lg
        );
        
        // Get next size (cycle back to 0 if at end)
        const nextIndex = (currentIndex + 1) % sizeOptions.length;
        setWidgetSize(widgetId, sizeOptions[nextIndex]);
    };

    return {
        widgetSizes,
        setWidgetSize,
        resetWidgetSize,
        resetAllSizes,
        getWidgetSize,
        cycleWidgetSize
    };
};

export default useWidgetResize;

