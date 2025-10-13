import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { router } from '@inertiajs/react';

// Notification types
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    INFO: 'info',
    SECURITY: 'security',
    USER: 'user',
    CONTENT: 'content',
    SYSTEM: 'system'
};

// Action types
const ACTION_TYPES = {
    ADD_NOTIFICATION: 'ADD_NOTIFICATION',
    REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
    MARK_AS_READ: 'MARK_AS_READ',
    MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
    CLEAR_ALL: 'CLEAR_ALL',
    SET_NOTIFICATIONS: 'SET_NOTIFICATIONS'
};

// Initial state
const initialState = {
    notifications: [],
    unreadCount: 0
};

// Reducer
const notificationReducer = (state, action) => {
    switch (action.type) {
        case ACTION_TYPES.ADD_NOTIFICATION: {
            const newNotification = {
                id: Date.now() + Math.random(),
                timestamp: new Date().toISOString(),
                read: false,
                showAsToast: true,
                ...action.payload
            };
            
            const notifications = [newNotification, ...state.notifications];
            return {
                ...state,
                notifications,
                unreadCount: notifications.filter(n => !n.read).length
            };
        }
        
        case ACTION_TYPES.REMOVE_NOTIFICATION: {
            const notifications = state.notifications.filter(n => n.id !== action.payload);
            return {
                ...state,
                notifications,
                unreadCount: notifications.filter(n => !n.read).length
            };
        }
        
        case ACTION_TYPES.MARK_AS_READ: {
            const notifications = state.notifications.map(n =>
                n.id === action.payload ? { ...n, read: true } : n
            );
            return {
                ...state,
                notifications,
                unreadCount: notifications.filter(n => !n.read).length
            };
        }
        
        case ACTION_TYPES.MARK_ALL_AS_READ: {
            const notifications = state.notifications.map(n => ({ ...n, read: true }));
            return {
                ...state,
                notifications,
                unreadCount: 0
            };
        }
        
        case ACTION_TYPES.CLEAR_ALL: {
            return {
                ...state,
                notifications: [],
                unreadCount: 0
            };
        }
        
        case ACTION_TYPES.SET_NOTIFICATIONS: {
            const notifications = action.payload;
            return {
                ...state,
                notifications,
                unreadCount: notifications.filter(n => !n.read).length
            };
        }
        
        default:
            return state;
    }
};

// Context
const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
    const [state, dispatch] = useReducer(notificationReducer, initialState);

    // Add notification
    const addNotification = useCallback((notification) => {
        dispatch({
            type: ACTION_TYPES.ADD_NOTIFICATION,
            payload: notification
        });
    }, []);

    // Remove notification
    const removeNotification = useCallback((id) => {
        dispatch({
            type: ACTION_TYPES.REMOVE_NOTIFICATION,
            payload: id
        });
    }, []);

    // Mark as read
    const markAsRead = useCallback((id) => {
        dispatch({
            type: ACTION_TYPES.MARK_AS_READ,
            payload: id
        });
        
        // Optionally sync with backend
        router.post('/admin/notifications/mark-read', { id }, {
            preserveState: true,
            preserveScroll: true,
            only: []
        });
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        dispatch({
            type: ACTION_TYPES.MARK_ALL_AS_READ
        });
        
        // Optionally sync with backend
        router.post('/admin/notifications/mark-all-read', {}, {
            preserveState: true,
            preserveScroll: true,
            only: []
        });
    }, []);

    // Clear all notifications
    const clearAll = useCallback(() => {
        dispatch({
            type: ACTION_TYPES.CLEAR_ALL
        });
    }, []);

    // Set notifications (for loading from backend)
    const setNotifications = useCallback((notifications) => {
        dispatch({
            type: ACTION_TYPES.SET_NOTIFICATIONS,
            payload: notifications
        });
    }, []);

    // Convenience methods for different notification types
    const showSuccess = useCallback((title, message, options = {}) => {
        addNotification({
            type: NOTIFICATION_TYPES.SUCCESS,
            title,
            message,
            ...options
        });
    }, [addNotification]);

    const showError = useCallback((title, message, options = {}) => {
        addNotification({
            type: NOTIFICATION_TYPES.ERROR,
            title,
            message,
            ...options
        });
    }, [addNotification]);

    const showWarning = useCallback((title, message, options = {}) => {
        addNotification({
            type: NOTIFICATION_TYPES.WARNING,
            title,
            message,
            ...options
        });
    }, [addNotification]);

    const showInfo = useCallback((title, message, options = {}) => {
        addNotification({
            type: NOTIFICATION_TYPES.INFO,
            title,
            message,
            ...options
        });
    }, [addNotification]);

    const showSecurityAlert = useCallback((title, message, options = {}) => {
        addNotification({
            type: NOTIFICATION_TYPES.SECURITY,
            title,
            message,
            ...options
        });
    }, [addNotification]);

    const showUserActivity = useCallback((title, message, options = {}) => {
        addNotification({
            type: NOTIFICATION_TYPES.USER,
            title,
            message,
            ...options
        });
    }, [addNotification]);

    const showContentUpdate = useCallback((title, message, options = {}) => {
        addNotification({
            type: NOTIFICATION_TYPES.CONTENT,
            title,
            message,
            ...options
        });
    }, [addNotification]);

    const showSystemAlert = useCallback((title, message, options = {}) => {
        addNotification({
            type: NOTIFICATION_TYPES.SYSTEM,
            title,
            message,
            ...options
        });
    }, [addNotification]);

    // Load notifications from backend on mount
    useEffect(() => {
        // You can implement this to load existing notifications from the backend
        // router.get('/admin/notifications', {}, {
        //     onSuccess: (page) => {
        //         if (page.props.notifications) {
        //             setNotifications(page.props.notifications);
        //         }
        //     }
        // });
    }, []);

    // Listen for Inertia events to show notifications
    useEffect(() => {
        const handleSuccess = (event) => {
            const { detail } = event;
            if (detail?.props?.flash?.success) {
                showSuccess('Éxito', detail.props.flash.success);
            }
            if (detail?.props?.flash?.error) {
                showError('Error', detail.props.flash.error);
            }
            if (detail?.props?.flash?.warning) {
                showWarning('Advertencia', detail.props.flash.warning);
            }
            if (detail?.props?.flash?.info) {
                showInfo('Información', detail.props.flash.info);
            }
        };

        document.addEventListener('inertia:success', handleSuccess);
        return () => document.removeEventListener('inertia:success', handleSuccess);
    }, [showSuccess, showError, showWarning, showInfo]);

    const value = {
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        setNotifications,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showSecurityAlert,
        showUserActivity,
        showContentUpdate,
        showSystemAlert
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

// Hook to use notifications
export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export default NotificationContext;
