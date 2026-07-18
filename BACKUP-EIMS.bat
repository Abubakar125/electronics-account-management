@echo off
title EIMS - Backup
color 0B
cls

:: ================================================
::  CHANGE THIS PATH TO YOUR GOOGLE DRIVE FOLDER
::  Step 1: Install Google Drive for Desktop
::  Step 2: Find your Google Drive folder path
::          (usually: C:\Users\YourName\Google Drive)
::  Step 3: Replace the path below with your path
::  Example: set BACKUP_DIR=C:\Users\Owner\Google Drive\EIMS-Backups
:: ================================================
set BACKUP_DIR=D:\EIMS-Backups

echo.
echo  ============================================
echo    EIMS - Database Backup
echo  ============================================
echo.

:: Create backup folder if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: Generate filename with date and time
set DATETIME=%date:~10,4%-%date:~4,2%-%date:~7,2%_%time:~0,2%-%time:~3,2%
set DATETIME=%DATETIME: =0%
set FILENAME=eims_backup_%DATETIME%.sql

:: Create backup
echo  Creating backup...
"C:\xampp\mysql\bin\mysqldump.exe" -u eims_user -peims_password eims_db > "%BACKUP_DIR%\%FILENAME%"

if %errorlevel% eq 0 (
    echo.
    echo  Backup saved: %FILENAME%
    echo  Location    : %BACKUP_DIR%
    echo.
) else (
    echo.
    echo  ERROR: Backup failed. Make sure MySQL is running in XAMPP.
    echo.
    pause
    exit /b 1
)

:: Delete backups older than 30 days
echo  Removing backups older than 30 days...
forfiles /p "%BACKUP_DIR%" /m "eims_backup_*.sql" /d -30 /c "cmd /c del @path" 2>nul
echo  Cleanup done.
echo.
pause
