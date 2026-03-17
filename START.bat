@echo off
echo ==========================================
echo    ZAPUSK FRONTEND
echo ==========================================
echo.

echo Proverka Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo OSHIBKA: Node.js ne ustanovlen!
    echo Skachai: https://nodejs.org/
    pause
    exit
)
echo.

echo Ustanovka zavisimostey...
if not exist "node_modules" (
    npm install
)
echo.

echo Zapusk frontend...
echo Otkroi v brauzere: http://localhost:3000
echo.
npm run dev

pause
