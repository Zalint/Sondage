@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════════════════╗
echo ║   Installation du module Excel                     ║
echo ╚════════════════════════════════════════════════════╝
echo.
echo 📦 Installation de la bibliothèque xlsx pour l'export Excel...
echo.

npm install xlsx@^0.18.5

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Installation réussie!
    echo.
    echo Vous pouvez maintenant exporter vos résultats en Excel.
    echo Démarrez le serveur avec: start-configured.bat
) else (
    echo.
    echo ❌ Erreur lors de l'installation
    echo Vérifiez votre connexion Internet et réessayez.
)

echo.
pause

