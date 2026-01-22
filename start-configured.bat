@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════════════════╗
echo ║   Sondage Mata - Stratégie 2026                   ║
echo ╚════════════════════════════════════════════════════╝
echo.
echo 🚀 Démarrage du serveur avec configuration...
echo.

REM Vérifier si node_modules existe
if not exist node_modules (
    echo ⚠ Dépendances npm non installées
    echo.
    echo Installation des dépendances...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erreur lors de l'installation
        pause
        exit /b 1
    )
)

REM Configuration de la base de données
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=maas_db
set DB_USER=postgres
set DB_PASSWORD=bonea2024

REM Configuration du serveur
set PORT=3000
set NODE_ENV=production

REM Démarrer le serveur
echo.
echo 📊 Configuration:
echo    - Base de données: %DB_NAME%
echo    - Hôte: %DB_HOST%:%DB_PORT%
echo    - Port serveur: %PORT%
echo.
node server.js

pause


