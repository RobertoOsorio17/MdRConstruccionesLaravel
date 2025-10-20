#!/bin/bash

echo "========================================"
echo " BLOG NAVIGATION FIX SCRIPT"
echo " MDR Construcciones"
echo "========================================"
echo ""

echo "[1/6] Stopping any running dev servers..."
pkill -f "vite" 2>/dev/null || true
sleep 2

echo "[2/6] Clearing Vite cache..."
if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite
    echo "   ✓ Vite cache cleared"
else
    echo "   ℹ No Vite cache found"
fi

echo "[3/6] Clearing Laravel caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
echo "   ✓ Laravel caches cleared"

echo "[4/6] Creating missing icon directories..."
if [ ! -d "public/images/icons" ]; then
    mkdir -p public/images/icons
    echo "   ✓ Icon directory created"
else
    echo "   ℹ Icon directory already exists"
fi

echo "[5/6] Rebuilding frontend assets..."
npm run build
echo "   ✓ Assets built"

echo "[6/6] Starting development server..."
echo ""
echo "========================================"
echo " FIX COMPLETE!"
echo "========================================"
echo ""
echo "The dev server will start now."
echo "Open http://localhost:8000 in your browser"
echo "and test the Blog navigation link."
echo ""
echo "Press Ctrl+C to stop the server when done."
echo "========================================"
echo ""

npm run dev

