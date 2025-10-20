import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { AppThemeProvider } from '@/theme/ThemeProvider';
import ErrorBoundary from '@/Components/ErrorBoundary';
import { registerServiceWorker, setupPWAInstallPrompt } from '@/Utils/registerServiceWorker';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        // Ensure CSRF token meta tag exists
        if (!document.querySelector('meta[name="csrf-token"]')) {
            const csrfToken = props.initialPage.props.csrf_token;
            if (csrfToken) {
                const meta = document.createElement('meta');
                meta.name = 'csrf-token';
                meta.content = csrfToken;
                document.head.appendChild(meta);
            }
        }

        const root = createRoot(el);

        root.render(
            <ErrorBoundary>
                <AppThemeProvider>
                    {/* Skip link para accesibilidad */}
                    <a href="#main-content" className="skip-link">
                        Saltar al contenido principal
                    </a>
                    <App {...props} />
                </AppThemeProvider>
            </ErrorBoundary>
        );
    },
    progress: {
        color: '#2563eb',
        showSpinner: true,
    },
});

// Register Service Worker for PWA functionality
// ⚠️ DISABLED: Uncomment when PWA icons are generated
// registerServiceWorker();

// Setup PWA install prompt
// ⚠️ DISABLED: Uncomment when PWA icons are generated
// setupPWAInstallPrompt();
