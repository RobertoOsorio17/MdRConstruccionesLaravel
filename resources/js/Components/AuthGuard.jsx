import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

// Crear contexto de autenticación
const AuthContext = createContext({
    user: null,
    isAuthenticated: false,
    isGuest: true,
    hasPermission: () => false,
    canComment: false,
    canModerate: false,
    userAvatar: null,
    userInitials: null
});

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};

// Proveedor de contexto de autenticación
export const AuthProvider = ({ children }) => {
    const { auth } = usePage().props;
    const [authState, setAuthState] = useState({
        user: null,
        isAuthenticated: false,
        isGuest: true,
        canComment: false,
        canModerate: false,
        userAvatar: null,
        userInitials: null
    });

    useEffect(() => {
        if (auth?.user) {
            const user = auth.user;
            
            // Generar iniciales del usuario
            const getInitials = (name) => {
                return name
                    ?.split(' ')
                    .map(word => word.charAt(0))
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'U';
            };

            // Determinar permisos
            const userRoles = user.roles || [];
            const userPermissions = user.permissions || [];
            
            const canModerate = userRoles.some(role => 
                ['admin', 'editor', 'moderator'].includes(role.name)
            ) || userPermissions.some(permission => 
                permission.name === 'moderate_comments'
            );

            setAuthState({
                user: user,
                isAuthenticated: true,
                isGuest: false,
                canComment: true, // Usuario logado puede comentar
                canModerate: canModerate,
                userAvatar: user.avatar_url || user.avatar || user.profile_photo_url || null,
                userInitials: getInitials(user.name),
                profileComplete: user.is_profile_complete || false,
                profileCompleteness: user.profile_completeness || 0
            });
        } else {
            setAuthState({
                user: null,
                isAuthenticated: false,
                isGuest: true,
                canComment: true, // Los invitados también pueden comentar
                canModerate: false,
                userAvatar: null,
                userInitials: null
            });
        }
    }, [auth]);

    // Función para verificar permisos específicos
    const hasPermission = (permission) => {
        if (!authState.user) return false;
        
        const userPermissions = authState.user.permissions || [];
        const userRoles = authState.user.roles || [];
        
        // Verificar permiso directo
        if (userPermissions.some(p => p.name === permission)) {
            return true;
        }
        
        // Verificar permiso por rol
        return userRoles.some(role => 
            role.permissions?.some(p => p.name === permission)
        );
    };

    const contextValue = {
        ...authState,
        hasPermission
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Componente de guardia para mostrar contenido basado en autenticación
export const AuthGuard = ({ 
    children, 
    fallback = null, 
    requireAuth = false, 
    requireGuest = false, 
    requirePermission = null,
    requireRole = null 
}) => {
    const auth = useAuth();

    // Si requiere estar autenticado pero no lo está
    if (requireAuth && !auth.isAuthenticated) {
        return fallback;
    }

    // Si requiere ser invitado pero está autenticado
    if (requireGuest && auth.isAuthenticated) {
        return fallback;
    }

    // Si requiere un permiso específico
    if (requirePermission && !auth.hasPermission(requirePermission)) {
        return fallback;
    }

    // Si requiere un rol específico
    if (requireRole && !auth.user?.roles?.some(role => role.name === requireRole)) {
        return fallback;
    }

    return children;
};

// Componente para mostrar contenido diferente según el estado de auth
export const AuthSwitch = ({ 
    authenticated, 
    guest, 
    loading = null 
}) => {
    const auth = useAuth();

    if (auth.isAuthenticated) {
        return authenticated;
    }

    return guest;
};

// Hook para actions de autenticación
export const useAuthActions = () => {
    const auth = useAuth();

    const promptLogin = (message = '¿Te gustaría iniciar sesión para acceder a más funciones?') => {
        if (!auth.isAuthenticated) {
            // Aquí se podría mostrar un modal o redirigir
            return {
                shouldPrompt: true,
                message,
                loginUrl: route('login'),
                registerUrl: route('register')
            };
        }
        return { shouldPrompt: false };
    };

    const requireAuth = (action, fallbackMessage) => {
        if (!auth.isAuthenticated) {
            return promptLogin(fallbackMessage);
        }
        return { shouldPrompt: false, canProceed: true };
    };

    return {
        promptLogin,
        requireAuth,
        ...auth
    };
};

export default AuthGuard;