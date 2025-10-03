/**
 * Error Logging Service
 * Centralized error logging for the application
 * Can be extended to integrate with services like Sentry, LogRocket, etc.
 */

class ErrorLogger {
    constructor() {
        this.isProduction = import.meta.env.PROD;
        this.isDevelopment = import.meta.env.DEV;
        this.apiEndpoint = '/api/log-error';
    }

    /**
     * Log error to console and remote service
     */
    logError(error, errorInfo = null, context = {}) {
        // Always log to console in development
        if (this.isDevelopment) {
            console.group('🔴 Error Logged');
            console.error('Error:', error);
            if (errorInfo) {
                console.error('Error Info:', errorInfo);
            }
            if (Object.keys(context).length > 0) {
                console.error('Context:', context);
            }
            console.groupEnd();
        }

        // Send to backend logging service
        this.sendToBackend(error, errorInfo, context);

        // In production, you can integrate with external services
        if (this.isProduction) {
            this.sendToExternalService(error, errorInfo, context);
        }
    }

    /**
     * Send error to backend for logging
     */
    async sendToBackend(error, errorInfo, context) {
        try {
            const errorData = {
                message: error?.message || String(error),
                stack: error?.stack || null,
                componentStack: errorInfo?.componentStack || null,
                context: {
                    ...context,
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                },
            };

            // Use fetch to avoid circular dependencies
            await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify(errorData),
            }).catch(() => {
                // Silently fail if backend logging fails
                // Don't want to create infinite error loops
            });
        } catch (e) {
            // Silently fail
        }
    }

    /**
     * Send to external error tracking service
     * Placeholder for Sentry, LogRocket, Bugsnag, etc.
     */
    sendToExternalService(error, errorInfo, context) {
        // Example: Sentry integration
        // if (window.Sentry) {
        //     window.Sentry.captureException(error, {
        //         contexts: {
        //             react: {
        //                 componentStack: errorInfo?.componentStack,
        //             },
        //             custom: context,
        //         },
        //     });
        // }

        // Example: LogRocket integration
        // if (window.LogRocket) {
        //     window.LogRocket.captureException(error, {
        //         tags: context,
        //         extra: errorInfo,
        //     });
        // }
    }

    /**
     * Log warning (non-critical errors)
     */
    logWarning(message, context = {}) {
        if (this.isDevelopment) {
            console.warn('⚠️ Warning:', message, context);
        }

        // Optionally send warnings to backend
        this.sendToBackend(
            new Error(message),
            null,
            { ...context, level: 'warning' }
        );
    }

    /**
     * Log info message
     */
    logInfo(message, context = {}) {
        if (this.isDevelopment) {
            console.info('ℹ️ Info:', message, context);
        }
    }

    /**
     * Log network error
     */
    logNetworkError(error, request = {}) {
        this.logError(error, null, {
            type: 'network',
            request: {
                url: request.url,
                method: request.method,
                status: request.status,
            },
        });
    }

    /**
     * Log validation error
     */
    logValidationError(errors, context = {}) {
        this.logWarning('Validation Error', {
            ...context,
            type: 'validation',
            errors,
        });
    }
}

// Create singleton instance
const errorLogger = new ErrorLogger();

export default errorLogger;

// Export convenience methods
export const logError = (error, errorInfo, context) => 
    errorLogger.logError(error, errorInfo, context);

export const logWarning = (message, context) => 
    errorLogger.logWarning(message, context);

export const logInfo = (message, context) => 
    errorLogger.logInfo(message, context);

export const logNetworkError = (error, request) => 
    errorLogger.logNetworkError(error, request);

export const logValidationError = (errors, context) => 
    errorLogger.logValidationError(errors, context);

