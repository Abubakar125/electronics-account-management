@echo off
title EIMS - Farhan Electronics
color 0A
cls

echo.
echo  ============================================
echo    EIMS - Farhan Electronics
echo    Starting system, please wait...
echo  ============================================
echo.

:: Step 1 - Start XAMPP MySQL
echo  [1/3] Starting MySQL...
if exist "C:\xampp\mysql_start.bat" (
    start /b "" "C:\xampp\mysql_start.bat" >nul 2>&1
    timeout /t 3 /nobreak >nul
) else (
    net start mysql >nul 2>&1
    timeout /t 2 /nobreak >nul
)
echo         MySQL ready.
echo.

:: Step 2 - Start Backend
echo  [2/3] Starting Backend...
start /min "EIMS-Backend" cmd /k "cd /d "%~dp0backend" && node server.js"
timeout /t 5 /nobreak >nul
echo         Backend ready.
echo.

:: Step 3 - Start Frontend
echo  [3/3] Starting Frontend (takes ~25 seconds)...
start /min "EIMS-Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"
echo.

echo  ============================================
echo    Browser will open automatically...
echo    Do NOT close this window.
echo  ============================================

timeout /t 28 /nobreak >nul

start http://localhost:4200

echo.
echo  App is running: http://localhost:4200
echo  Login  - Username: admin  Password: admin123
echo.
echo  To stop the app, run STOP-EIMS.bat
echo.
pause
