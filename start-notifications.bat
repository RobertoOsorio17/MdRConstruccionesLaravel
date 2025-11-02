@echo off
echo ========================================
echo   Sistema de Notificaciones
echo   MDR Construcciones
echo ========================================
echo.
echo Iniciando Scheduler para notificaciones programadas...
echo.
echo NOTA: Las notificaciones INMEDIATAS funcionan
echo automaticamente sin necesidad de servicios adicionales.
echo.
echo Solo necesitas el Scheduler para notificaciones PROGRAMADAS.
echo.
start "Scheduler - Notificaciones Programadas" cmd /k "php artisan schedule:work"
timeout /t 2 /nobreak >nul
echo.
echo ========================================
echo   Scheduler Iniciado Correctamente
echo ========================================
echo.
echo Se ha abierto 1 ventana:
echo   - Scheduler: Procesa notificaciones programadas y recurrentes
echo.
echo Las notificaciones INMEDIATAS funcionan sin este servicio.
echo Solo mantén esta ventana abierta si usas notificaciones programadas.
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul

