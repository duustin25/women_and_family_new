@echo off
REM ============================================================
REM  WFP System — Queue Worker Starter
REM  Run this script to process background email jobs.
REM  Keep this window open while using the system.
REM  Press Ctrl+C to stop.
REM ============================================================

echo.
echo  ===================================================
echo   Barangay 183 WFP System — Queue Worker
echo   Processing bulk emails, announcements, GAD events
echo  ===================================================
echo.

cd /d "%~dp0"

:restart
echo [%date% %time%] Starting queue worker...
php artisan queue:work ^
    --queue=default ^
    --sleep=3 ^
    --tries=1 ^
    --timeout=300 ^
    --max-jobs=500 ^
    --memory=256 ^
    --verbose

echo [%date% %time%] Worker stopped. Restarting in 5 seconds...
timeout /t 5 /nobreak > nul
goto restart
