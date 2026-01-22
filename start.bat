@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════════════════╗
echo ║   Sondage Mata - Stratégie 2026                   ║
echo ╚════════════════════════════════════════════════════╝
echo.
echo 🚀 Démarrage du serveur...
echo.

REM Vérifier si .env existe
if not exist .env (
    echo ❌ Fichier .env non trouvé!
    echo.
    echo Exécutez d'abord: install.bat
    echo Ou copiez config.example.env vers .env et configurez-le
    pause
    exit /b 1
)

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

REM Démarrer le serveur
echo.
node server.js

pause

