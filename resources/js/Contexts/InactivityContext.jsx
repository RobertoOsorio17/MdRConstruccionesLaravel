import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Context para compartir el estado del sistema de inactividad
 * entre el InactivityDetector y otros componentes (como el reloj en el menú)
 */
const InactivityContext = createContext({
    remainingTime: 0, // Tiempo restante en segundos
    isWarningActive: false, // Si el modal de advertencia está visible
    totalTimeout: 0, // Timeout total configurado
    updateRemainingTime: () => {},
    setWarningActive: () => {}
});

export const useInactivity = () => {
    const context = useContext(InactivityContext);
    if (context === undefined) {
        throw new Error('useInactivity must be used within InactivityProvider');
    }
    return context;
};

export const InactivityProvider = ({ children, totalTimeout = 15 * 60 * 1000 }) => {
    const [remainingTime, setRemainingTime] = useState(Math.floor(totalTimeout / 1000));
    const [isWarningActive, setIsWarningActive] = useState(false);

    const updateRemainingTime = useCallback((seconds) => {
        setRemainingTime(seconds);
    }, []);

    const setWarningActive = useCallback((active) => {
        setIsWarningActive(active);
    }, []);

    const value = {
        remainingTime,
        isWarningActive,
        totalTimeout: Math.floor(totalTimeout / 1000),
        updateRemainingTime,
        setWarningActive
    };

    return (
        <InactivityContext.Provider value={value}>
            {children}
        </InactivityContext.Provider>
    );
};

export default InactivityContext;

