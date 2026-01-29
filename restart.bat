@echo off
echo.
echo ==========================================
echo      U-OS QUICK RESTART
echo ==========================================
echo.
echo Stopping all services...

:: Kill all node processes
taskkill /F /IM node.exe >nul 2>&1

:: Stop Docker container (optional - uncomment if you want to restart DB too)
:: docker-compose down

timeout /t 2 /nobreak >nul

echo.
echo Starting services...
echo.

:: Start backend
echo [1/2] Starting Backend...
start "U-OS Backend" cmd /k "npm run start:dev --workspace=@u-os/backend"

timeout /t 3 /nobreak >nul

:: Start mobile app
echo [2/2] Starting Mobile App...
start "U-OS Mobile" cmd /k "cd apps\mobile && npx expo start -c --offline --port 8081"

echo.
echo ==========================================
echo      RESTART COMPLETE!
echo ==========================================
echo.
echo Backend API:    http://localhost:3000
echo Mobile Web:     http://localhost:8081
echo.
echo Press 'w' in mobile window to open browser
echo.
pause
