@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════════════════╗
echo ║   Configuration Base de Données PostgreSQL        ║
echo ╚════════════════════════════════════════════════════╝
echo.

REM Vérifier si psql est disponible
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PostgreSQL psql n'est pas dans le PATH
    echo.
    echo Ajoutez PostgreSQL\bin au PATH ou utilisez le chemin complet
    echo Exemple: "C:\Program Files\PostgreSQL\15\bin\psql.exe"
    pause
    exit /b 1
)

echo Cet script va:
echo 1. Créer la base de données maas_db
echo 2. Exécuter le schéma de base de données
echo.
echo ⚠ Vous aurez besoin du mot de passe PostgreSQL
echo.
pause

REM Créer la base de données
echo.
echo Création de la base de données...
psql -U postgres -c "CREATE DATABASE maas_db;"

REM Exécuter le schéma
echo.
echo Exécution du schéma...
psql -U postgres -d maas_db -f init.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Base de données configurée avec succès!
) else (
    echo.
    echo ⚠ Des erreurs peuvent être survenues
    echo Si la base existe déjà, c'est normal
)

echo.
echo Vérification...
psql -U postgres -d maas_db -c "\dt"

echo.
pause

