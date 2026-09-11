@echo off
REM ============================================================
REM  Barangay 183 WFP System — Bulk Queue Worker
REM  NOTE: Individual & transactional emails (Welcome, Application
REM  Receipt, Disapproval, Direct Messages) are sent IN REAL TIME!
REM  This worker processes high-volume background jobs (e.g.
REM  mass announcements, bulk GAD event invitations).
REM  Press Ctrl+C to stop.
REM ============================================================

echo.
echo  ===================================================
echo   Barangay 183 WFP System — Bulk Background Worker
echo   Transactional emails are sent instantly in real-time.
echo   This worker handles mass broadcasts and bulk jobs.
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
