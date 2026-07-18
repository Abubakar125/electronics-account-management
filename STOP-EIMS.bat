@echo off
title EIMS - Stopping
color 0C
cls

echo.
echo  Stopping EIMS...
echo.

:: Kill backend (port 3000)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " 2^>nul') do (
    taskkill /f /pid %%a >nul 2>&1
)

:: Kill frontend (port 4200)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4200 " 2^>nul') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo  EIMS stopped successfully.
echo.
pause
