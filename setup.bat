@echo off
setlocal EnableDelayedExpansion

:: Check if --full flag is passed
set FULL_SETUP=0
if "%1"=="--full" set FULL_SETUP=1
if "%1"=="--clear" set FULL_SETUP=1

echo.
echo ==========================================
echo      U-OS PROTOTYPE SMART LAUNCHER
echo ==========================================
echo.

:: Step 1: Check and start database if needed
echo [1/4] Checking Database Status...
docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo    ^> Docker not running - please start Docker Desktop
    pause
    exit /b 1
)

docker ps | find "uos_db" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ^> Database already running - SKIP
) else (
    echo    ^> Starting database container...
    docker-compose up -d
    echo    ^> Waiting for database to initialize...
    timeout /t 3 /nobreak >nul
)

:: Step 2: Check if Prisma needs initialization (only if --full flag)
if %FULL_SETUP% EQU 1 (
    echo [2/4] Full Setup - Regenerating Database...
    echo    ^> Generating Prisma Client...
    call npm run generate --workspace=@u-os/database
    
    echo    ^> Pushing schema to database...
    call npm run db:push --workspace=@u-os/database
    
    echo    ^> Seeding database...
    call npm run seed --workspace=@u-os/database
) else (
    echo [2/4] Database Schema Check...
    echo    ^> Using existing database - SKIP
    echo    ^> Tip: Run 'setup.bat --full' to reset database
)

:: Step 3: Install dependencies only if node_modules is missing
echo [3/4] Checking Dependencies...
if not exist "node_modules" (
    echo    ^> Installing dependencies...
    call npm install
) else (
    echo    ^> Dependencies already installed - SKIP
)

:: Step 4: Launch applications
echo [4/4] Launching Applications...
echo    ^> Starting Backend on port 3000...
start "U-OS Backend" cmd /k "npm run start:dev --workspace=@u-os/backend"

timeout /t 2 /nobreak >nul

echo    ^> Starting Mobile App on port 8081...
if %FULL_SETUP% EQU 1 (
    start "U-OS Mobile" cmd /k "cd apps\mobile && npx expo start --offline --clear --port 8081"
) else (
    start "U-OS Mobile" cmd /k "cd apps\mobile && npx expo start --offline --port 8081"
)

echo.
echo ==========================================
echo      SETUP COMPLETE!
echo ==========================================
echo.
echo Backend API:    http://localhost:3000
echo Mobile Web:     http://localhost:8081
echo.
echo TEST CREDENTIALS:
echo   Super Admin:  admin@university.edu / password
echo   Cashier:      cashier@university.edu / password
echo   Student:      std_0@university.edu / password
echo   Guest:        guest_test@university.edu / password
echo.
echo USAGE:
echo   - Press 'w' in mobile window to open web browser
echo   - Backend will auto-reload on code changes
echo   - Mobile will hot-reload (no cache clear needed)
echo.
echo.
echo OPTIONS:
echo   setup.bat          - Quick start (skip if already running)
echo   setup.bat --full   - Full reset (clear cache + reset database)
echo.

:prisma_check
set /p RUN_PRISMA="Run Prisma Studio (Visual DB Editor)? (y/n): "
if /i "%RUN_PRISMA%"=="y" (
    echo    ^> Starting Prisma Studio...
    start "Prisma Studio" cmd /k "cd packages\database && npx prisma studio"
)

echo.
pause

