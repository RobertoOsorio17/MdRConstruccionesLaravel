@echo off
echo ========================================
echo  BLOG NAVIGATION FIX SCRIPT
echo  MDR Construcciones
echo ========================================
echo.

echo [1/6] Stopping any running dev servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Clearing Vite cache...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo    ✓ Vite cache cleared
) else (
    echo    ℹ No Vite cache found
)

echo [3/6] Clearing Laravel caches...
call php artisan cache:clear
call php artisan config:clear
call php artisan route:clear
call php artisan view:clear
echo    ✓ Laravel caches cleared

echo [4/6] Creating missing icon directories...
if not exist "public\images\icons" (
    mkdir "public\images\icons"
    echo    ✓ Icon directory created
) else (
    echo    ℹ Icon directory already exists
)

echo [5/6] Rebuilding frontend assets...
call npm run build
echo    ✓ Assets built

echo [6/6] Starting development server...
echo.
echo ========================================
echo  FIX COMPLETE!
echo ========================================
echo.
echo The dev server will start now.
echo Open http://localhost:8000 in your browser
echo and test the Blog navigation link.
echo.
echo Press Ctrl+C to stop the server when done.
echo ========================================
echo.

call npm run dev

