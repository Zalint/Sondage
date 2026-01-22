@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════════════════╗
echo ║   Installation Sondage Mata - Stratégie 2026     ║
echo ╚════════════════════════════════════════════════════╝
echo.

REM Vérifier si Node.js est installé
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js n'est pas installé!
    echo.
    echo Téléchargez Node.js depuis: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js détecté: 
node --version
echo.

REM Vérifier si PostgreSQL est installé
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠ PostgreSQL psql n'est pas dans le PATH
    echo Assurez-vous que PostgreSQL est installé
    echo.
) else (
    echo ✓ PostgreSQL détecté:
    psql --version
    echo.
)

REM Installer les dépendances npm
echo 📦 Installation des dépendances npm...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erreur lors de l'installation des dépendances
    pause
    exit /b 1
)

echo.
echo ✓ Dépendances installées avec succès!
echo.

REM Créer le fichier .env si il n'existe pas
if not exist .env (
    echo 📝 Création du fichier .env...
    copy config.example.env .env >nul
    echo ✓ Fichier .env créé à partir de config.example.env
    echo.
    echo ⚠ IMPORTANT: Modifiez le fichier .env avec vos paramètres PostgreSQL
    echo    avant de démarrer le serveur!
    echo.
    notepad .env
) else (
    echo ✓ Fichier .env existe déjà
    echo.
)

echo.
echo ╔════════════════════════════════════════════════════╗
echo ║            Installation terminée!                  ║
echo ╚════════════════════════════════════════════════════╝
echo.
echo Prochaines étapes:
echo.
echo 1. Configurez PostgreSQL:
echo    - Créez la base de données: CREATE DATABASE maas_db;
echo    - Exécutez le schéma: psql -U postgres -d maas_db -f database\init.sql
echo.
echo 2. Modifiez le fichier .env avec vos paramètres
echo.
echo 3. Démarrez le serveur: npm start
echo.
echo 4. Ouvrez http://localhost:3000 dans votre navigateur
echo.
pause

