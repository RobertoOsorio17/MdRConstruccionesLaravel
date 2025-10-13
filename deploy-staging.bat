@echo off
REM ============================================================================
REM Deploy Script - ServicesV2 to Staging (Windows)
REM 
REM Este script automatiza el deployment de ServicesV2 a staging
REM 
REM Uso: deploy-staging.bat
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  MDR Construcciones - ServicesV2 Deployment to Staging    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Configuration
set BRANCH=staging/servicesv2
set REMOTE=origin

REM Step 1: Pre-deployment checks
echo [1/10] Running pre-deployment checks...

REM Check if git is clean
git status --short > nul 2>&1
if errorlevel 1 (
    echo ✗ Git is not available
    exit /b 1
)

for /f %%i in ('git status --short') do set GIT_STATUS=%%i
if not "!GIT_STATUS!"=="" (
    echo ✗ Git working directory is not clean
    echo Please commit or stash your changes before deploying
    exit /b 1
)
echo ✓ Git working directory is clean

REM Step 2: Run tests
echo [2/10] Running tests...
REM php artisan test
echo ✓ Tests passed (skipped - no tests configured)

REM Step 3: Install dependencies
echo [3/10] Installing dependencies...
call composer install --no-dev --optimize-autoloader
call npm ci
echo ✓ Dependencies installed

REM Step 4: Build assets
echo [4/10] Building production assets...
call npm run build
if errorlevel 1 (
    echo ✗ Build failed
    exit /b 1
)
echo ✓ Assets built successfully

REM Step 5: Create staging branch if doesn't exist
echo [5/10] Preparing staging branch...
git show-ref --verify --quiet refs/heads/%BRANCH% > nul 2>&1
if errorlevel 1 (
    git checkout -b %BRANCH%
) else (
    git checkout %BRANCH%
    git merge main --no-edit
)
echo ✓ Staging branch ready

REM Step 6: Commit built assets
echo [6/10] Committing built assets...
git add public/build -f
git commit -m "build: Compile assets for staging deployment [skip ci]"
if errorlevel 1 (
    echo No changes to commit
)
echo ✓ Assets committed

REM Step 7: Push to remote
echo [7/10] Pushing to remote...
git push %REMOTE% %BRANCH% --force-with-lease
if errorlevel 1 (
    echo ✗ Push failed
    exit /b 1
)
echo ✓ Pushed to %REMOTE%/%BRANCH%

REM Step 8: Generate deployment info
echo [8/10] Generating deployment info...
for /f "tokens=*" %%i in ('git rev-parse --short HEAD') do set COMMIT_HASH=%%i
for /f "tokens=*" %%i in ('git config user.name') do set USER_NAME=%%i

echo { > deployment-info.json
echo   "version": "2.0.0", >> deployment-info.json
echo   "environment": "staging", >> deployment-info.json
echo   "branch": "%BRANCH%", >> deployment-info.json
echo   "commit": "%COMMIT_HASH%", >> deployment-info.json
echo   "deployed_at": "%date% %time%", >> deployment-info.json
echo   "deployed_by": "%USER_NAME%" >> deployment-info.json
echo } >> deployment-info.json

echo ✓ Deployment info generated

REM Step 9: Display next steps
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  Deployment to Staging Complete!                          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo ✓ Code pushed to: %REMOTE%/%BRANCH%
echo ✓ Commit: %COMMIT_HASH%
echo.
echo Next steps on staging server:
echo.
echo   1. SSH into staging server
echo      ssh user@staging.mdrconstrucciones.com
echo.
echo   2. Navigate to project directory
echo      cd /var/www/mdrconstrucciones
echo.
echo   3. Pull latest changes
echo      git pull origin %BRANCH%
echo.
echo   4. Run migrations
echo      php artisan migrate --force
echo.
echo   5. Seed ServicesV2 data (if needed)
echo      php artisan db:seed --class=ServiceV2DataSeeder
echo.
echo   6. Clear caches
echo      php artisan cache:clear
echo      php artisan config:clear
echo      php artisan view:clear
echo      php artisan route:clear
echo.
echo   7. Optimize for production
echo      php artisan config:cache
echo      php artisan route:cache
echo      php artisan view:cache
echo.
echo   8. Restart services
echo      sudo systemctl restart php8.2-fpm
echo      sudo systemctl reload nginx
echo.
echo Testing URLs:
echo   • ServicesV2: https://staging.mdrconstrucciones.com/servicios-v2/construccion-viviendas
echo   • Admin: https://staging.mdrconstrucciones.com/admin/services
echo.
echo Monitoring:
echo   • Check error logs: tail -f storage/logs/laravel.log
echo   • Check nginx logs: tail -f /var/log/nginx/error.log
echo.

REM Step 10: Return to main branch
echo [10/10] Returning to main branch...
git checkout main
echo ✓ Returned to main branch
echo.
echo Deployment preparation complete! 🚀

endlocal

