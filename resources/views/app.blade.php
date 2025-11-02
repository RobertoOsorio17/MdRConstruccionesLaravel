<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- PWA Meta Tags -->
        <meta name="theme-color" content="#1976d2">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="MDR Construcciones">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="application-name" content="MDR Construcciones">

        <!-- PWA Manifest -->
        <link rel="manifest" href="/manifest.json">

        <!-- Apple Touch Icons -->
        <link rel="apple-touch-icon" sizes="180x180" href="/images/icons/icon-192x192.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/images/icons/icon-192x192.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/images/icons/icon-192x192.png">

        <!-- ⚡ PERFORMANCE: Preconnect to external resources -->
        <!-- Fonts: crossorigin required for font files -->
        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
        <link rel="dns-prefetch" href="https://fonts.bunny.net">

        <!-- Unsplash CDN for images -->
        <link rel="preconnect" href="https://images.unsplash.com">
        <link rel="dns-prefetch" href="https://images.unsplash.com">

        <!-- UI Avatars for user avatars (saves 110ms LCP) -->
        <link rel="preconnect" href="https://ui-avatars.com">
        <link rel="dns-prefetch" href="https://ui-avatars.com">

        <!-- ⚡ PERFORMANCE: Preload LCP image for homepage -->
        @if(request()->is('/'))
        <link
            rel="preload"
            as="image"
            href="https://images.unsplash.com/photo-1572120360610-d971b9d7767c?fm=webp&w=1920&q=50"
            imagesrcset="
                https://images.unsplash.com/photo-1572120360610-d971b9d7767c?fm=webp&w=640&q=50 640w,
                https://images.unsplash.com/photo-1572120360610-d971b9d7767c?fm=webp&w=1024&q=50 1024w,
                https://images.unsplash.com/photo-1572120360610-d971b9d7767c?fm=webp&w=1920&q=50 1920w
            "
            imagesizes="100vw"
            fetchPriority="high"
        >
        @endif

        <!-- ⚡ PERFORMANCE: Fonts with display=swap to prevent render blocking -->
        <!-- Using media="print" onload trick to defer non-critical CSS -->
        <link
            href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap"
            rel="stylesheet"
            media="print"
            onload="this.media='all'"
        >
        <noscript>
            <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet">
        </noscript>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
