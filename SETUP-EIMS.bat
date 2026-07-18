@echo off
title EIMS - First Time Setup
color 0E
cls

echo.
echo  ============================================
echo    EIMS - First Time Setup
echo    Run this ONCE before using the software
echo  ============================================
echo.
echo  Make sure MySQL is running in XAMPP first!
echo  Then press any key to continue...
echo.
pause >nul

:: Create Database
echo.
echo  [1/2] Creating database...
"C:\xampp\mysql\bin\mysql.exe" -u root -peims_password -e "CREATE DATABASE IF NOT EXISTS eims_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul

if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Could not connect to MySQL.
    echo  Please open XAMPP and Start MySQL first, then run this file again.
    echo.
    pause
    exit /b 1
)
echo         Done.

:: Run Seeder
echo.
echo  [2/2] Creating admin user and default data...
cd /d "%~dp0backend"
node src/database/seeders/index.js

echo.
echo  ============================================
echo    Setup Complete!
echo.
echo    Username : admin
echo    Password : admin123
echo.
echo    Now run START-EIMS.bat to open the app.
echo  ============================================
echo.
pause
