import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        host: '0.0.0.0',
        port: 5173,
        hmr: {
            host: 'localhost',
        },
        watch: {
            usePolling: true,
        },
    },
    resolve: {
        alias: {
            '@': '/resources/js',
        },
        // ⚡ CRITICAL: Dedupe React to avoid "Cannot set properties of undefined (setting 'AsyncMode')" error
        dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            '@inertiajs/react',
            '@mui/material',
            '@emotion/react',
            '@emotion/styled',
        ],
    },
    build: {
        // ⚡ PERFORMANCE: Increase chunk size warning limit for large apps
        chunkSizeWarningLimit: 2000,
        // ⚠️ MANUAL CHUNKING DISABLED: Vite's automatic chunking works better with MUI
        // Manual chunking was causing circular dependency errors in production
        // Vite will automatically split vendors based on usage patterns
    },
});
